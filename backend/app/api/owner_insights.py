from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.auth.dependencies import require_restaurant_owner
from app.core.database import get_db
from app.models.menu_item import MenuItem
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.restaurant import Restaurant
from app.models.user import User

router = APIRouter(
    prefix="/owner/insights",
    tags=["Owner Insights"],
)


@router.get("/")
def get_owner_insights(
    current_user: User = Depends(
        require_restaurant_owner
    ),
    db: Session = Depends(get_db),
):
    restaurants = (
        db.query(Restaurant)
        .filter(Restaurant.owner_id == current_user.id)
        .all()
    )

    if not restaurants:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No restaurant is assigned to this owner.",
        )

    restaurant_ids = [
        restaurant.id
        for restaurant in restaurants
    ]

    completed_statuses = {
        "accepted",
        "preparing",
        "ready",
        "completed",
    }

    completed_orders = (
        db.query(Order)
        .filter(
            Order.restaurant_id.in_(restaurant_ids),
            Order.status.in_(completed_statuses),
        )
        .all()
    )

    total_revenue = round(
        sum(float(order.total or 0) for order in completed_orders),
        2,
    )

    total_orders = len(completed_orders)

    average_order_value = round(
        total_revenue / total_orders,
        2,
    ) if total_orders else 0

    top_items = (
        db.query(
            MenuItem.id,
            MenuItem.name,
            func.sum(OrderItem.quantity).label(
                "quantity_sold"
            ),
            func.sum(
                OrderItem.quantity * OrderItem.price
            ).label("revenue"),
        )
        .join(
            OrderItem,
            OrderItem.menu_item_id == MenuItem.id,
        )
        .join(
            Order,
            Order.id == OrderItem.order_id,
        )
        .filter(
            MenuItem.restaurant_id.in_(
                restaurant_ids
            ),
            Order.status.in_(completed_statuses),
        )
        .group_by(MenuItem.id, MenuItem.name)
        .order_by(desc("quantity_sold"))
        .limit(5)
        .all()
    )

    seven_days_ago = datetime.utcnow() - timedelta(
        days=7
    )

    recent_revenue = (
        db.query(
            func.date(Order.created_at).label(
                "order_date"
            ),
            func.sum(Order.total).label("revenue"),
            func.count(Order.id).label("orders"),
        )
        .filter(
            Order.restaurant_id.in_(
                restaurant_ids
            ),
            Order.status.in_(completed_statuses),
            Order.created_at >= seven_days_ago,
        )
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
        .all()
    )

    all_menu_items = (
        db.query(MenuItem)
        .filter(
            MenuItem.restaurant_id.in_(
                restaurant_ids
            )
        )
        .all()
    )

    sold_item_ids = {
        row.id
        for row in top_items
    }

    unsold_items = [
        {
            "id": item.id,
            "name": item.name,
            "price": float(item.price or 0),
        }
        for item in all_menu_items
        if item.id not in sold_item_ids
    ][:5]

    recommendations = []

    if total_orders == 0:
        recommendations.append(
            {
                "type": "growth",
                "title": "Create your first promotion",
                "message": (
                    "No completed order activity is available yet. "
                    "Consider creating a limited-time flash deal."
                ),
            }
        )

    if top_items:
        best_item = top_items[0]

        recommendations.append(
            {
                "type": "popular_item",
                "title": "Promote your best seller",
                "message": (
                    f"{best_item.name} is currently your "
                    f"top-selling menu item with "
                    f"{int(best_item.quantity_sold or 0)} sold."
                ),
            }
        )

    if unsold_items:
        recommendations.append(
            {
                "type": "slow_item",
                "title": "Review slow-moving items",
                "message": (
                    f"{unsold_items[0]['name']} has no recorded "
                    "sales yet. Consider improving its description, "
                    "image, price, or promotion."
                ),
            }
        )

    if average_order_value and average_order_value < 12:
        recommendations.append(
            {
                "type": "basket_size",
                "title": "Increase average order value",
                "message": (
                    "Your average order value is below $12. "
                    "Consider adding combo meals or sides."
                ),
            }
        )

    return {
        "summary": {
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "average_order_value": average_order_value,
            "restaurant_count": len(restaurants),
        },
        "top_items": [
            {
                "id": row.id,
                "name": row.name,
                "quantity_sold": int(
                    row.quantity_sold or 0
                ),
                "revenue": round(
                    float(row.revenue or 0),
                    2,
                ),
            }
            for row in top_items
        ],
        "revenue_by_day": [
            {
                "date": str(row.order_date),
                "revenue": round(
                    float(row.revenue or 0),
                    2,
                ),
                "orders": int(row.orders or 0),
            }
            for row in recent_revenue
        ],
        "unsold_items": unsold_items,
        "recommendations": recommendations,
    }
