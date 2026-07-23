from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(
        Integer,
        primary_key=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    restaurant_id = Column(
        Integer,
        ForeignKey("restaurants.id"),
        nullable=False,
    )

    total = Column(
        Float,
        nullable=False,
    )

    status = Column(
        String,
        nullable=False,
        default="pending",
    )

    payment_status = Column(
        String,
        nullable=False,
        default="unpaid",
    )

    payment_method = Column(
        String,
        nullable=True,
    )

    stripe_session_id = Column(
        String,
        nullable=True,
        unique=True,
    )

    stripe_payment_intent_id = Column(
        String,
        nullable=True,
        unique=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )

    user = relationship(
    "User",
    back_populates="orders",
    )

    restaurant = relationship(
    "Restaurant",
    back_populates="orders",
    )