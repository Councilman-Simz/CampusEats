from sqlalchemy.orm import Session

from app.ai.semantic_search import semantic_search
from app.models.menu_item import MenuItem


def search_menu_items(
    db: Session,
    query: str,
    limit: int = 5,
) -> list[MenuItem]:
    return semantic_search(
        db=db,
        query=query,
        limit=limit,
    )