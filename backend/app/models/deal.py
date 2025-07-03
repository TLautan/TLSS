# backend/app/models/deal.py

from sqlalchemy import Column, Integer, String, Numeric, DateTime, Enum as SQLAlchemyEnum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum
from datetime import datetime, timezone

class DealStatus(str, enum.Enum):
    in_progress = "進行中"
    won = "受注"
    lost = "失注"
    cancelled = "キャンセル"

class DealType(str, enum.Enum):
    direct = "direct"
    agency = "agency"

class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)
    value = Column(Numeric(15, 2), nullable=False)

    # name='deal_status' must match the SQL type name
    status = Column(SQLAlchemyEnum(DealStatus, name='deal_status', create_type=False), default=DealStatus.in_progress, nullable=False)
    type = Column(SQLAlchemyEnum(DealType, name='deal_type', create_type=False), nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    lead_generated_at = Column(DateTime(timezone=True), server_default=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)

    win_reason = Column(Text, nullable=True)
    loss_reason = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    user = relationship("User")
    company = relationship("Company")

    def __repr__(self):
        return f"<Deal(id={self.id}, title='{self.title}', status='{self.status.value}')>"