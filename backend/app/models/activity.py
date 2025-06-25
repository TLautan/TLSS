# backend/app/models/activity.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from app.database import Base
from datetime import datetime

class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id"))
    type = Column(String) # e.g., 'call', 'email', 'meeting'
    notes = Column(Text, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)