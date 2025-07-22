# backend/app/models/activity.py

from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from .enums import ActivityType # <-- IMPORT FROM enums.py

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=False)
    
    # Use the imported enum, but tell SQLAlchemy to treat it as an external type
    type = Column(ENUM(ActivityType, name='activity_type', create_type=False), nullable=False)
    
    date = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now(), nullable=False)
    deal = relationship("Deal")

    def __repr__(self):
        return f"<Activity(id={self.id}, type='{self.type.value}', date='{self.date}')>"