from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.menu_item import MenuItem

router = APIRouter(
    prefix="/recommendations",
    tags=["recommendations"],
)


@router.get("/")
def get_recommendations(
    user_id: int = Query(default=1, ge=1),
    preference: str | None = Query(default=None),
    limit: int = Query(default=5, ge=1, le=25),
    db: Session = Depends(get_db),
):
    items = (
        db.query(MenuItem)
        .filter(MenuItem.is_available.is_(True))
        .filter(MenuItem.stock_quantity > 0)
        .order_by(MenuItem.id.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": item.id,
            "restaurant_id": item.restaurant_id,
            "name": item.name,
            "description": item.description,
            "price": (
                float(item.price)
                if item.price is not None
                else None
            ),
            "tags": item.tags,
            "ingredients": item.ingredients,
        }
        for item in items
    ]