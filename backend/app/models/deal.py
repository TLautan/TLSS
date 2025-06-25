# backend/app/models/deal.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SQLAlchemyEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from datetime import datetime

class DealStatus(str, enum.Enum):
    in_progress = "in_progress"
    won = "won"
    lost = "lost"
    cancelled = "cancelled"

class DealType(str, enum.Enum):
    direct = "direct"
    agency = "agency"

class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    value = Column(Float, nullable=True)
    status = Column(SQLAlchemyEnum(DealStatus), default=DealStatus.in_progress, nullable=False)
    type = Column(SQLAlchemyEnum(DealType), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    lead_generated_at = Column(DateTime, default=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)
    win_reason = Column(String, nullable=True)
    loss_reason = Column(String, nullable=True)
    cancellation_reason = Column(String, nullable=True)