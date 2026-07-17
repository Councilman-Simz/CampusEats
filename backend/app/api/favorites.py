from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.favorite import Favorite
from app.models.menu_item import MenuItem
from app.models.user import User

router = APIRouter(
    prefix="/favorites",
    tags=["favorites"],
)


def get_demo_user(
    db: Session,
    user_id: int,
) -> User:
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return user


@router.get("/")
def get_favorites(
    user_id: int = Query(default=1, ge=1),
    db: Session = Depends(get_db),
):
    get_demo_user(db, user_id)

    favorites = (
        db.query(Favorite)
        .filter(Favorite.user_id == user_id)
        .order_by(Favorite.id.desc())
        .all()
    )

    return [
        {
            "favorite_id": favorite.id,
            "id": favorite.menu_item.id,
            "restaurant_id": favorite.menu_item.restaurant_id,
            "name": favorite.menu_item.name,
            "description": favorite.menu_item.description,
            "price": (
                float(favorite.menu_item.price)
                if favorite.menu_item.price is not None
                else None
            ),
            "tags": favorite.menu_item.tags,
            "ingredients": favorite.menu_item.ingredients,
        }
        for favorite in favorites
        if favorite.menu_item is not None
    ]


@router.post("/{item_id}", status_code=status.HTTP_201_CREATED)
def add_favorite(
    item_id: int,
    user_id: int = Query(default=1, ge=1),
    db: Session = Depends(get_db),
):
    get_demo_user(db, user_id)

    menu_item = (
        db.query(MenuItem)
        .filter(MenuItem.id == item_id)
        .first()
    )

    if menu_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found.",
        )

    existing = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == user_id,
            Favorite.item_id == item_id,
        )
        .first()
    )

    if existing is not None:
        return {
            "message": "Item is already in favorites.",
            "favorite_id": existing.id,
            "item_id": item_id,
        }

    favorite = Favorite(
        user_id=user_id,
        item_id=item_id,
    )

    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    return {
        "message": "Item added to favorites.",
        "favorite_id": favorite.id,
        "item_id": item_id,
    }


@router.delete("/{item_id}")
def remove_favorite(
    item_id: int,
    user_id: int = Query(default=1, ge=1),
    db: Session = Depends(get_db),
):
    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == user_id,
            Favorite.item_id == item_id,
        )
        .first()
    )

    if favorite is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found.",
        )

    db.delete(favorite)
    db.commit()

    return {
        "message": "Item removed from favorites.",
        "item_id": item_id,
    }
