from app.core.database import SessionLocal
from app.models.menu_item import MenuItem
from app.ai.embeddings import create_embedding


def build_text(item: MenuItem):
    return " ".join([
        item.name or "",
        item.description or "",
        item.tags or "",
        item.ingredients or ""
    ])


def seed_embeddings():
    db = SessionLocal()

    try:
        items = db.query(MenuItem).all()

        if not items:
            print("No menu items found.")
            return

        updated = 0

        for item in items:
            text = build_text(item)
            item.embedding = create_embedding(text)
            updated += 1

            print(f"Updated embedding for: {item.name}")

        db.commit()
        print(f"Done. Updated {updated} menu item embeddings.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_embeddings()