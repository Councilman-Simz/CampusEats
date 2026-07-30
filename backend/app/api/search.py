from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.menu_item import MenuItem
from app.schemas.menu_item import MenuItemResponse

router = APIRouter(
    prefix="/search",
    tags=["Search"],
)


@router.get(
    "/",
    response_model=list[MenuItemResponse],
)
def search_menu_items(
    query: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=25),
    db: Session = Depends(get_db),
):
    search_term = f"%{query.strip()}%"

    results = (
        db.query(MenuItem)
        .filter(
            MenuItem.is_available.is_(True),
            or_(
                MenuItem.name.ilike(search_term),
                MenuItem.description.ilike(search_term),
                MenuItem.tags.ilike(search_term),
                MenuItem.ingredients.ilike(search_term),
            ),
        )
        .order_by(MenuItem.name.asc())
        .limit(limit)
        .all()
    )

    return results