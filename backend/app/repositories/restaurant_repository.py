from sqlalchemy.orm import Session

from app.models.restaurant import Restaurant


class RestaurantRepository:

    @staticmethod
    def get_all(db: Session):
        return db.query(Restaurant).all()

    @staticmethod
    def get_by_id(db: Session, restaurant_id: int):
        return (
            db.query(Restaurant)
            .filter(Restaurant.id == restaurant_id)
            .first()
        )

    @staticmethod
    def create(db: Session, restaurant: Restaurant):
        db.add(restaurant)
        db.commit()
        db.refresh(restaurant)
        return restaurant