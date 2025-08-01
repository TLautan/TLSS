# backend/app/models/deal.py

from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from .enums import DealStatus, DealType, ForecastAccuracy

class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    value = Column(Numeric(15, 2), nullable=False)

    status = Column(ENUM(DealStatus, name='deal_status', create_type=False), default=DealStatus.in_progress, nullable=False)
    type = Column(ENUM(DealType, name='deal_type', create_type=False), nullable=False)
    forecast_accuracy = Column(ENUM(ForecastAccuracy, name='forecast_accuracy', create_type=False), nullable=True)

    lead_source = Column(String(255), nullable=True)
    product_name = Column(String(255), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    lead_generated_at = Column(DateTime(timezone=True), server_default=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)
    win_reason = Column(Text, nullable=True)
    loss_reason = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    user = relationship("User", back_populates="deals")
    company = relationship("Company", back_populates="deals")

    def __repr__(self):
        return f"<Deal(id={self.id}, title='{self.title}', status='{self.status.value}')>"