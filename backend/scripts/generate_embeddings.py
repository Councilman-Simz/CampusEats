from app.ai.embeddings import create_embedding
from app.core.database import SessionLocal
from app.models.menu_item import MenuItem


def build_item_text(item: MenuItem) -> str:
    parts = [
        item.name or "",
        item.description or "",
        item.tags or "",
        item.ingredients or "",
    ]

    return " ".join(part.strip() for part in parts if part).strip()


def generate_menu_embeddings() -> None:
    db = SessionLocal()

    try:
        items = db.query(MenuItem).order_by(MenuItem.id).all()

        if not items:
            print("No menu items found.")
            return

        updated = 0

        for item in items:
            text = build_item_text(item)

            if not text:
                print(f"Skipping item {item.id}: no searchable text")
                continue

            item.embedding = create_embedding(text)
            updated += 1

            print(f"Generated embedding for: {item.name}")

        db.commit()

        print(f"Successfully updated {updated} menu items.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    generate_menu_embeddings()
