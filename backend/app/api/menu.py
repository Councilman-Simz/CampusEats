from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.menu_item import MenuItem
from app.schemas.menu_item import MenuItemResponse

router = APIRouter(
    prefix="/menu",
    tags=["Menu"],
)


@router.get(
    "/",
    response_model=list[MenuItemResponse],
)
def get_menu_items(
    db: Session = Depends(get_db),
):
    return (
        db.query(MenuItem)
        .order_by(MenuItem.id.asc())
        .all()
    )


@router.get(
    "/{item_id}",
    response_model=MenuItemResponse,
)
def get_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
):
    item = (
        db.query(MenuItem)
        .filter(MenuItem.id == item_id)
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found",
        )

    return item
