from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.favorite import Favorite
from app.models.menu_item import MenuItem
from app.models.search_log import SearchLog

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)


@router.get("/summary")
def analytics_summary(
    db: Session = Depends(get_db),
):
    total_searches = db.query(SearchLog).count()
    total_favorites = db.query(Favorite).count()
    total_menu_items = db.query(MenuItem).count()

    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    recent_searches = (
        db.query(SearchLog)
        .filter(SearchLog.created_at >= seven_days_ago)
        .count()
    )

    top_queries = (
        db.query(
            SearchLog.query,
            func.count(SearchLog.id).label("count"),
        )
        .group_by(SearchLog.query)
        .order_by(desc("count"))
        .limit(5)
        .all()
    )

    top_favorites = (
        db.query(
            MenuItem.id,
            MenuItem.name,
            func.count(Favorite.id).label("favorite_count"),
        )
        .join(Favorite, Favorite.item_id == MenuItem.id)
        .group_by(MenuItem.id, MenuItem.name)
        .order_by(desc("favorite_count"))
        .limit(5)
        .all()
    )

    return {
        "total_searches": total_searches,
        "recent_searches": recent_searches,
        "total_favorites": total_favorites,
        "total_menu_items": total_menu_items,
        "top_queries": [
            {
                "query": row.query,
                "count": row.count,
            }
            for row in top_queries
        ],
        "top_favorites": [
            {
                "id": row.id,
                "name": row.name,
                "favorite_count": row.favorite_count,
            }
            for row in top_favorites
        ],
    }