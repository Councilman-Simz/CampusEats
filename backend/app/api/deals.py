from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.claim import Claim
from app.models.menu_item import MenuItem

router = APIRouter(
    prefix="/deals",
    tags=["Flash Deals"],
)


@router.get("/")
def get_flash_deals(db: Session = Depends(get_db)):
    items = (
        db.query(MenuItem)
        .filter(MenuItem.expires_at.is_not(None))
        .order_by(MenuItem.expires_at.asc())
        .all()
    )

    return [
        {
            "id": item.id,
            "restaurant_id": item.restaurant_id,
            "name": item.name,
            "description": item.description,
            "price": item.price,
            "tags": item.tags,
            "ingredients": item.ingredients,
            "expires_at": item.expires_at,
        }
        for item in items
    ]


@router.post("/{item_id}/claim")
def claim_deal(
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

    claim = Claim(
        user_id=1,
        item_id=item.id,
    )

    db.add(claim)
    db.commit()
    db.refresh(claim)

    return {
        "message": "Flash deal claimed successfully",
        "claim_id": claim.id,
        "item_id": item.id,
    }