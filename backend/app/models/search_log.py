from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.core.database import Base


class SearchLog(Base):
    __tablename__ = "search_logs"

    id = Column(Integer, primary_key=True)
    query = Column(String, nullable=False)
    result_count = Column(Integer, nullable=False, default=0)
    search_type = Column(String, nullable=False, default="text")
    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )
    