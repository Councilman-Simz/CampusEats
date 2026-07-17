from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.core.database import get_db
from app.core.notification_manager import notification_manager
from app.models.menu_item import MenuItem
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.order import (
    OrderCreate,
    OrderResponse,
)

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


@router.post(
    "/",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not order_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An order must contain at least one item.",
        )

    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.id == order_data.restaurant_id)
        .first()
    )

    if restaurant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found.",
        )

    requested_ids = [
        item.menu_item_id
        for item in order_data.items
    ]

    menu_items = (
        db.query(MenuItem)
        .filter(MenuItem.id.in_(requested_ids))
        .all()
    )

    menu_by_id = {
        item.id: item
        for item in menu_items
    }

    total = 0.0
    prepared_items = []

    for requested_item in order_data.items:
        menu_item = menu_by_id.get(
            requested_item.menu_item_id
        )

        if menu_item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Menu item "
                    f"{requested_item.menu_item_id} "
                    "was not found."
                ),
            )

        if (
            menu_item.restaurant_id
            != order_data.restaurant_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "All order items must belong "
                    "to the selected restaurant."
                ),
            )

        item_price = float(menu_item.price or 0)
        line_total = (
            item_price * requested_item.quantity
        )

        total += line_total

        prepared_items.append(
            {
                "menu_item_id": menu_item.id,
                "quantity": requested_item.quantity,
                "price": item_price,
            }
        )

    new_order = Order(
        user_id=current_user.id,
        restaurant_id=restaurant.id,
        total=round(total, 2),
        status="pending",
    )

    db.add(new_order)
    db.flush()

    for item_data in prepared_items:
        db.add(
            OrderItem(
                order_id=new_order.id,
                menu_item_id=item_data[
                    "menu_item_id"
                ],
                quantity=item_data["quantity"],
                price=item_data["price"],
            )
        )

    db.commit()
    db.refresh(new_order)

    if restaurant.owner_id is not None:
        await notification_manager.notify(
            restaurant.owner_id,
            {
                "type": "new_order",
                "title": "New order received",
                "message": (
                    f"Order #{new_order.id} has been placed "
                    f"for ${new_order.total:.2f}."
                ),
                "order_id": new_order.id,
                "status": new_order.status,
                "restaurant_id": restaurant.id,
            },
        )

    return new_order


@router.get(
    "/my",
    response_model=list[OrderResponse],
)
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
)
def get_my_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.user_id == current_user.id,
        )
        .first()
    )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )

    return order
