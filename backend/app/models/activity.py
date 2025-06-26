# backend/app/models/activity.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum
from datetime import datetime, timezone

# Python Enum for SQLAlchemy Enum Type
class ActivityType(str, enum.Enum):
    phone = "電話"   # Match SQL ENUM values
    email = "メール"
    meeting = "会議"

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)

    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=False) # deal_id INTEGER NOT NULL REFERENCES deals(id)
    
    type = Column(SQLAlchemyEnum(ActivityType, name='activity_type', create_type=False), nullable=False) # type activity_type NOT NULL
    
    date = Column(DateTime(timezone=True), server_default=func.now()) # date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    notes = Column(Text) # notes TEXT (nullable by default)

    # Standard timestamps for created_at and updated_at
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False) # created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now(), nullable=False) # updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL

    deal = relationship("Deal") # Links to the Deal model

    def __repr__(self):
        return f"<Activity(id={self.id}, type='{self.type.value}', date='{self.date}')>"