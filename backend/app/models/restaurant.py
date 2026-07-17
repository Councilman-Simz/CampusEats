from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    hours = Column(String, nullable=True)
    description = Column(String, nullable=True)
    cuisine = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    banner_url = Column(String, nullable=True)

    status = Column(
        String,
        nullable=False,
        default="pending",
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    menu_items = relationship(
        "MenuItem",
        back_populates="restaurant",
    )

    orders = relationship(
    "Order",
    back_populates="restaurant",
   )
