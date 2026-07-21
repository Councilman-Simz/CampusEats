from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import require_admin
from app.core.database import get_db
from app.models.menu_item import MenuItem
from app.models.order import Order
from app.models.restaurant import Restaurant
from app.models.user import User

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get("/overview")
def admin_overview(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    users = db.query(User).all()
    restaurants = db.query(Restaurant).all()
    orders = db.query(Order).all()
    menu_items = db.query(MenuItem).all()

    active_restaurants = sum(
        1
        for restaurant in restaurants
        if getattr(restaurant, "is_active", False)
    )

    total_revenue = round(
        sum(
            float(order.total or 0)
            for order in orders
            if str(order.status or "").lower()
            != "cancelled"
        ),
        2,
    )

    role_counts = {
        "student": 0,
        "restaurant_owner": 0,
        "restaurant_staff": 0,
        "admin": 0,
    }

    for user in users:
        role = str(user.role or "").strip().lower()

        if role in role_counts:
            role_counts[role] += 1

    order_status_counts = {
        "pending": 0,
        "accepted": 0,
        "preparing": 0,
        "ready": 0,
        "completed": 0,
        "cancelled": 0,
    }

    for order in orders:
        status = str(
            order.status or ""
        ).strip().lower()

        if status in order_status_counts:
            order_status_counts[status] += 1

    return {
        "user_count": len(users),
        "restaurant_count": len(restaurants),
        "active_restaurant_count": active_restaurants,
        "menu_item_count": len(menu_items),
        "order_count": len(orders),
        "total_revenue": total_revenue,
        "role_counts": role_counts,
        "order_status_counts": order_status_counts,
    }


@router.get("/restaurants")
def admin_list_restaurants(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    restaurants = (
        db.query(Restaurant)
        .order_by(Restaurant.id.desc())
        .all()
    )

    return [
        {
            "id": restaurant.id,
            "name": restaurant.name,
            "location": restaurant.location,
            "cuisine": restaurant.cuisine,
            "status": restaurant.status,
            "is_active": restaurant.is_active,
            "owner_id": restaurant.owner_id,
        }
        for restaurant in restaurants
    ]


@router.patch("/restaurants/{restaurant_id}/status")
def admin_update_restaurant_status(
    restaurant_id: int,
    payload: dict,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.id == restaurant_id)
        .first()
    )

    if restaurant is None:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found.",
        )

    allowed_statuses = {
        "pending",
        "approved",
        "rejected",
        "suspended",
    }

    next_status = str(
        payload.get("status", "")
    ).strip().lower()

    if next_status not in allowed_statuses:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid restaurant status. "
                "Allowed values: pending, approved, "
                "rejected, suspended."
            ),
        )

    restaurant.status = next_status
    restaurant.is_active = (
        next_status == "approved"
    )

    db.commit()
    db.refresh(restaurant)

    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "status": restaurant.status,
        "is_active": restaurant.is_active,
        "owner_id": restaurant.owner_id,
    }


@router.patch("/restaurants/{restaurant_id}/active")
def admin_toggle_restaurant_active(
    restaurant_id: int,
    payload: dict,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.id == restaurant_id)
        .first()
    )

    if restaurant is None:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found.",
        )

    restaurant.is_active = bool(
        payload.get("is_active", False)
    )

    db.commit()
    db.refresh(restaurant)

    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "status": restaurant.status,
        "is_active": restaurant.is_active,
        "owner_id": restaurant.owner_id,
    }


@router.get("/users")
def admin_list_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    users = (
        db.query(User)
        .order_by(User.id.desc())
        .all()
    )

    return [
        {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "campus": user.campus,
            "dietary_preferences":
                user.dietary_preferences,
        }
        for user in users
    ]


@router.patch("/users/{user_id}/role")
def admin_update_user_role(
    user_id: int,
    payload: dict,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    allowed_roles = {
        "student",
        "restaurant_owner",
        "restaurant_staff",
        "admin",
    }

    next_role = str(
        payload.get("role", "")
    ).strip().lower()

    if next_role not in allowed_roles:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid role. Allowed values: "
                "student, restaurant_owner, "
                "restaurant_staff, admin."
            ),
        )

    if user.id == current_user.id and next_role != "admin":
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "You cannot remove your own "
                "admin role."
            ),
        )

    user.role = next_role

    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "campus": user.campus,
        "dietary_preferences":
            user.dietary_preferences,
    }
