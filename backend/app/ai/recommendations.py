from sqlalchemy.orm import Session

from app.ai.semantic_search import semantic_search
from app.models.favorite import Favorite
from app.models.menu_item import MenuItem


def build_preference_from_favorites(
    db: Session,
    user_id: int,
) -> str:
    favorites = (
        db.query(Favorite)
        .filter(Favorite.user_id == user_id)
        .order_by(Favorite.id.desc())
        .limit(5)
        .all()
    )

    preference_parts = []

    for favorite in favorites:
        item = favorite.menu_item

        if item is None:
            continue

        preference_parts.extend(
            [
                item.name or "",
                item.tags or "",
                item.ingredients or "",
            ]
        )

    return " ".join(
        part.strip()
        for part in preference_parts
        if part and part.strip()
    )


def recommend_menu_items(
    db: Session,
    user_id: int = 1,
    preference: str | None = None,
    limit: int = 5,
) -> list[MenuItem]:
    clean_preference = (preference or "").strip()

    if not clean_preference:
        clean_preference = build_preference_from_favorites(
            db=db,
            user_id=user_id,
        )

    if clean_preference:
       try:
           results = semantic_search(
            db=db,
            query=clean_preference,
            limit=limit + 5,
         )
      except Exception as exc:
          print(
            "Semantic recommendation search failed; "
            f"using newest available items instead: {exc}"
          )

        return (
            db.query(MenuItem)
            .filter(MenuItem.is_available.is_(True))
            .filter(MenuItem.stock_quantity > 0)
            .order_by(MenuItem.id.desc())
            .limit(limit)
            .all()
        )

        favorite_item_ids = {
            favorite.item_id
            for favorite in (
                db.query(Favorite)
                .filter(Favorite.user_id == user_id)
                .all()
            )
        }

        filtered_results = [
            item
            for item in results
            if item.id not in favorite_item_ids
        ]

        return filtered_results[:limit]

    return (
        db.query(MenuItem)
        .filter(MenuItem.is_available.is_(True))
        .filter(MenuItem.stock_quantity > 0)
        .order_by(MenuItem.id.desc())
        .limit(limit)
        .all()
    )