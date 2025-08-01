# app/models/company.py

from sqlalchemy import Column, Integer, String, DateTime, JSON, func
from sqlalchemy.orm import relationship
from app.database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)

    company_name = Column(String(255), unique=True, nullable=False)
    company_kana = Column(String(255))
    industry = Column(String(100))
    other_details = Column(JSON)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    deals = relationship("Deal", back_populates="company")

    def __repr__(self):
        return f"<Company(id={self.id}, name='{self.company_name}', industry='{self.industry}')>"