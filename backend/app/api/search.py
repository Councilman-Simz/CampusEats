from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.search_log import SearchLog
from app.services.search_service import search_menu_items

router = APIRouter(
    prefix="/search",
    tags=["search"],
)


@router.get("/")
def search(
    query: str = Query(..., min_length=1),
    limit: int = Query(default=5, ge=1, le=25),
    db: Session = Depends(get_db),
):
    results = search_menu_items(
        db=db,
        query=query,
        limit=limit,
    )

    search_log = SearchLog(
        query=query.strip(),
        result_count=len(results),
        search_type="text",
    )

    db.add(search_log)
    db.commit()

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
            "expires_at": (
                item.expires_at.isoformat()
                if hasattr(item.expires_at, "isoformat")
                else item.expires_at
            ),
        }
        for item in results
    ]
