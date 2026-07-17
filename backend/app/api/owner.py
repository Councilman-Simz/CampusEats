from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.auth.dependencies import require_restaurant_owner
from app.core.database import get_db
from app.core.notification_manager import notification_manager
from app.models.menu_item import MenuItem
from app.models.order import Order
from app.models.favorite import Favorite
from app.models.claim import Claim
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.deal import (
    OwnerDealCreate,
    OwnerDealUpdate,
)
from app.schemas.menu_item import (
    MenuItemCreate,
    MenuItemResponse,
    MenuItemUpdate,
)
from app.schemas.order import (
    OrderResponse,
    OrderStatusUpdate,
)
from app.schemas.restaurant import (
    RestaurantResponse,
    RestaurantUpdate,
)

router = APIRouter(
    prefix="/owner",
    tags=["Restaurant Owner"],
)


def get_owned_restaurants(
    db: Session,
    current_user: User,
) -> list[Restaurant]:
    return (
        db.query(Restaurant)
        .filter(Restaurant.owner_id == current_user.id)
        .order_by(Restaurant.id.asc())
        .all()
    )


def get_owned_restaurant_ids(
    db: Session,
    current_user: User,
) -> list[int]:
    return [
        restaurant.id
        for restaurant in get_owned_restaurants(
            db=db,
            current_user=current_user,
        )
    ]


def require_owned_restaurant(
    restaurant_id: int,
    db: Session,
    current_user: User,
) -> Restaurant:
    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.id == restaurant_id)
        .first()
    )

    if restaurant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found.",
        )

    if (
        current_user.role != "admin"
        and restaurant.owner_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You can only manage restaurants "
                "assigned to your account."
            ),
        )

    return restaurant


def require_owned_menu_item(
    item_id: int,
    db: Session,
    current_user: User,
) -> MenuItem:
    item = (
        db.query(MenuItem)
        .filter(MenuItem.id == item_id)
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found.",
        )

    require_owned_restaurant(
        restaurant_id=item.restaurant_id,
        db=db,
        current_user=current_user,
    )

    return item


@router.get("/profile")
def owner_profile(
    current_user: User = Depends(
        require_restaurant_owner
    ),
    db: Session = Depends(get_db),
):
    restaurants = get_owned_restaurants(
        db=db,
        current_user=current_user,
    )

    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "role": current_user.role,
        },
        "restaurants": [
            {
                "id": restaurant.id,
                "name": restaurant.name,
                "location": restaurant.location,
                "hours": restaurant.hours,
                "description": restaurant.description,
                "cuisine": restaurant.cuisine,
                "phone": restaurant.phone,
                "logo_url": restaurant.logo_url,
                "banner_url": restaurant.banner_url,
                "owner_id": restaurant.owner_id,
                "status": restaurant.status,
                "is_active": restaurant.is_active,
            }
            for restaurant in restaurants
        ],
    }


@router.patch(
    "/restaurant/{restaurant_id}",
    response_model=RestaurantResponse,
)
def update_owner_restaurant(
    restaurant_id: int,
    restaurant_data: RestaurantUpdate,
    current_user: User = Depends(
        require_restaurant_owner
    ),
    db: Session = Depends(get_db),
):
    restaurant = require_owned_restaurant(
        restaurant_id=restaurant_id,
        db=db,
        current_user=current_user,
    )

    update_data = restaurant_data.model_dump(
        exclude_unset=True
    )

    protected_fields = {
        "id",
        "owner_id",
        "status",
        "is_active",
    }

    for field, value in update_data.items():
        if field not in protected_fields:
            setattr(restaurant, field, value)

    db.commit()
    db.refresh(restaurant)

    return restaurant


@router.get(
    "/menu",
    response_model=list[MenuItemResponse],
)
def get_owner_menu(
    current_user: User = Depends(
        require_restaurant_owner
    ),
    db: Session = Depends(get_db),
):
    restaurant_ids = get_owned_restaurant_ids(
        db=db,
        current_user=current_user,
    )

    if not restaurant_ids:
        return []

    return (
        db.query(MenuItem)
        .filter(
            MenuItem.restaurant_id.in_(
                restaurant_ids
            )
        )
        .order_by(MenuItem.id.desc())
        .all()
    )


@router.post(
    "/menu",
    response_model=MenuItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_owner_menu_item(
    item_data: MenuItemCreate,
    current_user: User = Depends(
        require_restaurant_owner
    ),
    db: Session = Depends(get_db),
):
    require_owned_restaurant(
        restaurant_id=item_data.restaurant_id,
        db=db,
        current_user=current_user,
    )

    new_item = MenuItem(
        restaurant_id=item_data.restaurant_id,
        name=item_data.name,
        description=item_data.description,
        price=item_data.price,
        tags=item_data.tags,
        ingredients=item_data.ingredients,
        expires_at=item_data.expires_at,
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


@router.patch(
    "/menu/{item_id}",
    response_model=MenuItemResponse,
)
def update_owner_menu_item(
    item_id: int,
    item_data: MenuItemUpdate,
    current_user: User = Depends(
        require_restaurant_owner
    ),
    db: Session = Depends(get_db),
):
    item = require_owned_menu_item(
        item_id=item_id,
        db=db,
        current_user=current_user,
    )

    update_data = item_data.model_dump(
        exclude_unset=True
    )

    if "restaurant_id" in update_data:
        require_owned_restaurant(
            restaurant_id=update_data["restaurant_id"],
            db=db,
            current_user=current_user,
        )

    protected_fields = {
        "id",
        "embedding",
        "clip_embedding",
    }

    for field, value in update_data.items():
        if field not in protected_fields:
            setattr(item, field, value)

    db.commit()
    db.refresh(item)

    return item


@router.delete("/menu/{item_id}")
def delete_owner_menu_item(
    item_id: int,
    current_user: User = Depends(
        require_restaurant_owner
    ),
    db: Session = Depends(get_db),
):
    item = require_owned_menu_item(
        item_id=item_id,
        db=db,
        current_user=current_user,
    )

    if getattr(item, "claims", None):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This menu item has existing claims "
                "and cannot be deleted."
            ),
        )

    db.delete(item)
    db.commit()

    return {
        "message": "Menu item deleted successfully.",
        "item_id": item_id,
    }


@router.get(
    "/deals",
    response_model=list[MenuItemResponse],
)
def get_owner_deals(
    current_user: User = Depends(
        require_restaurant_owner
    ),
    db: Session = Depends(get_db),
):
    restaurant_ids = get_owned_restaurant_ids(
        db=db,
        current_user=current_user,
    )

    if not restaurant_ids:
        return []

    return (
        db.query(MenuItem)
        .filter(
            MenuItem.restaurant_id.in_(
                restaurant_ids
            ),
            MenuItem.expires_at.is_not(None),
        )
        .order_by(MenuItem.expires_at.asc())
        .all()
    )


@router.post(
    "/deals/{item_id}",
    response_model=MenuItemResponse,
)
def create_owner_deal(
    item_id: int,
    deal_data: OwnerDealCreate,
    current_user: User = Depends(
        require_restaurant_owner
    ),
    db: Session = Depends(get_db),
):
    item = require_owned_menu_item(
        item_id=item_id,
        db=db,
        current_user=current_user,
    )

    if (
        deal_data.price is not None
        and deal_data.price < 0
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deal price cannot be negative.",
        )

    if deal_data.price is not None:
        item.price = deal_data.price

    item.expires_at = deal_data.expires_at

    db.commit()
    db.refresh(item)

    return item


@router.patch(
    "/deals/{item_id}",
    response_model=MenuItemResponse,
)
def update_owner_deal(
    item_id: int,
    deal_data: OwnerDealUpdate,
    current_user: User = Depends(
        require_restaurant_owner
    ),
    db: Session = Depends(get_db),
):
    item = require_owned_menu_item(
        item_id=item_id,
        db=db,
        current_user=current_user,
    )

    if item.expires_at is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This menu item is not an active deal.",
        )

    update_data = deal_data.model_dump(
        exclude_unset=True
    )

    if (
        "price" in update_data
        and update_data["price"] is not None
        and update_data["price"] < 0
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deal price cannot be negative.",
        )

    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)

    return item


@router.delete("/deals/{item_id}")
def delete_owner_deal(
    item_id: int,
    current_user: User = Depends(
        require_restaurant_owner
    ),
    db: Session = Depends(get_db),
):
    item = require_owned_menu_item(
        item_id=item_id,
        db=db,
        current_user=current_user,
    )

    item.expires_at = None

    db.commit()
    db.refresh(item)

    return {
        "message": "Flash deal removed successfully.",
        "item_id": item.id,
    }


@router.get("/analytics")
def owner_analytics(
    current_user: User = Depends(
        require_restaurant_owner
    ),
    db: Session = Depends(get_db),
):
    restaurants = get_owned_restaurants(
        db=db,
        current_user=current_user,
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

    menu_items = (
        db.query(MenuItem)
        .filter(
            MenuItem.restaurant_id.in_(
                restaurant_ids
            )
        )
        .all()
    )

    item_ids = [
        item.id
        for item in menu_items
    ]

    prices = [
        float(item.price)
        for item in menu_items
        if item.price is not None
    ]

    active_deals = sum(
        1
        for item in menu_items
        if item.expires_at is not None
    )

    favorite_count = (
        db.query(Favorite)
        .filter(
            Favorite.item_id.in_(
                item_ids
            )
        )
        .count()
        if item_ids
        else 0
    )

    claim_count = (
        db.query(Claim)
        .filter(
            Claim.item_id.in_(
                item_ids
            )
        )
        .count()
        if item_ids
        else 0
    )

    return {
        "restaurant_count": len(restaurants),
        "menu_count": len(menu_items),
        "active_deals": active_deals,
        "average_price": (
            round(sum(prices) / len(prices), 2)
            if prices
            else 0
        ),
        "lowest_price": (
            round(min(prices), 2)
            if prices
            else 0
        ),
        "highest_price": (
            round(max(prices), 2)
            if prices
            else 0
        ),
        "favorite_count": favorite_count,
        "claim_count": claim_count,
    }


@router.get(
    "/orders",
    response_model=list[OrderResponse],
)
def get_owner_orders(
    current_user: User = Depends(
        require_restaurant_owner
    ),
    db: Session = Depends(get_db),
):
    restaurant_ids = get_owned_restaurant_ids(
        db=db,
        current_user=current_user,
    )

    if not restaurant_ids:
        return []

    return (
        db.query(Order)
        .filter(
            Order.restaurant_id.in_(
                restaurant_ids
            )
        )
        .order_by(Order.created_at.desc())
        .all()
    )


@router.patch(
    "/orders/{order_id}/status",
    response_model=OrderResponse,
)
async def update_owner_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    current_user: User = Depends(
        require_restaurant_owner
    ),
    db: Session = Depends(get_db),
):
    allowed_statuses = {
        "pending",
        "accepted",
        "preparing",
        "ready",
        "completed",
        "cancelled",
    }

    normalized_status = (
        status_data.status
        .strip()
        .lower()
    )

    if normalized_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid order status. Allowed values: "
                "pending, accepted, preparing, ready, "
                "completed, cancelled."
            ),
        )

    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )

    require_owned_restaurant(
        restaurant_id=order.restaurant_id,
        db=db,
        current_user=current_user,
    )

    order.status = normalized_status

    db.commit()
    db.refresh(order)

    status_messages = {
        "pending": "Your order is pending.",
        "accepted": "Your order has been accepted.",
        "preparing": "Your meal is being prepared.",
        "ready": "Your order is ready for pickup.",
        "completed": "Your order has been completed.",
        "cancelled": "Your order has been cancelled.",
    }

    await notification_manager.notify(
        order.user_id,
        {
            "type": "order_status",
            "title": "Order status updated",
            "message": status_messages[normalized_status],
            "order_id": order.id,
            "status": normalized_status,
            "restaurant_id": order.restaurant_id,
        },
    )

    return order
