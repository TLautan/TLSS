# backend/app/models/deal.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from app.database import Base # Import Base from the database.py file we created
import enum
from datetime import datetime

class DealStatus(str, enum.Enum):
    in_progress = "in_progress"
    won = "won"
    lost = "lost"

class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    value = Column(Float)
    status = Column(Enum(DealStatus), default="in_progress")
    created_at = Column(DateTime, default=datetime.utcnow)