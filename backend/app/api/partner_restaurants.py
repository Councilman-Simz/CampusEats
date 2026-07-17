from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.permissions import require_roles
from app.core.database import get_db
from app.models.restaurant import Restaurant

router = APIRouter(
    prefix="/partner/restaurants",
    tags=["partner restaurants"],
)


@router.get("/me")
def get_my_restaurants(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "restaurant_owner",
            "restaurant_staff",
            "admin",
        )
    ),
):
    query = db.query(Restaurant)

    if current_user.role != "admin":
        query = query.filter(
            Restaurant.owner_id == current_user.id
        )

    restaurants = query.order_by(
        Restaurant.name.asc()
    ).all()

    return [
        {
            "id": restaurant.id,
            "name": restaurant.name,
            "location": restaurant.location,
            "hours": restaurant.hours,
            "status": restaurant.status,
            "is_active": restaurant.is_active,
            "owner_id": restaurant.owner_id,
        }
        for restaurant in restaurants
    ]