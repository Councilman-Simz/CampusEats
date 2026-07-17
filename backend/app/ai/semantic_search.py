from sqlalchemy.orm import Session

from app.ai.embeddings import create_embedding
from app.models.menu_item import MenuItem


def semantic_search(
    db: Session,
    query: str,
    limit: int = 5,
) -> list[MenuItem]:
    clean_query = query.strip()

    if not clean_query:
        return []

    query_embedding = create_embedding(clean_query)

    results = (
        db.query(MenuItem)
        .filter(MenuItem.embedding.is_not(None))
        .order_by(
            MenuItem.embedding.cosine_distance(query_embedding)
        )
        .limit(limit)
        .all()
    )

    return results