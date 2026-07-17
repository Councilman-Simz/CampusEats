from sqlalchemy.orm import Session

from app.models.menu_item import MenuItem


class MenuItemRepository:

    @staticmethod
    def get_all(db: Session):
        return db.query(MenuItem).all()

    @staticmethod
    def create(db: Session, item: MenuItem):
        db.add(item)
        db.commit()
        db.refresh(item)
        return item