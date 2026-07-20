from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from app.core.database import Base


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(
        Integer,
        primary_key=True,
    )

    restaurant_id = Column(
        Integer,
        ForeignKey("restaurants.id"),
        nullable=True,
    )

    name = Column(
        String,
        nullable=False,
    )

    description = Column(
        String,
        nullable=True,
    )

    price = Column(
        Float,
        nullable=True,
    )

    tags = Column(
        String,
        nullable=True,
    )

    ingredients = Column(
        String,
        nullable=True,
    )

    expires_at = Column(
        DateTime,
        nullable=True,
    )

    image_url = Column(
        String,
        nullable=True,
    )

    stock_quantity = Column(
        Integer,
        nullable=False,
        default=0,
    )

    low_stock_threshold = Column(
        Integer,
        nullable=False,
        default=5,
    )

    is_available = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    embedding = Column(
        Vector(384),
        nullable=True,
    )

    clip_embedding = Column(
        Vector(512),
        nullable=True,
    )

    restaurant = relationship(
        "Restaurant",
        back_populates="menu_items",
    )

    claims = relationship(
        "Claim",
        back_populates="menu_item",
    )
