from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime
)

from sqlalchemy.orm import relationship

from datetime import datetime

from app.core.database import Base


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    item_id = Column(
        Integer,
        ForeignKey("menu_items.id")
    )

    claimed_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="claims"
    )

    menu_item = relationship(
        "MenuItem",
        back_populates="claims"
    )