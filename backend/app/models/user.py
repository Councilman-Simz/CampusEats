from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash = Column(
        String,
        nullable=False,
    )

    dietary_preferences = Column(
        String,
        nullable=True,
    )

    campus = Column(
        String,
        nullable=True,
    )

    role = Column(
        String,
        nullable=False,
        default="student",
    )

    claims = relationship(
        "Claim",
        back_populates="user",
    )

    orders = relationship(
        "Order",
        back_populates="user",
    )
