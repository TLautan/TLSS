# app/models/company.py

from sqlalchemy import Column, Integer, String, DateTime, JSON, func
from app.database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)

    company_name = Column(String(255), unique=True, nullable=False) # company_name VARCHAR(255) UNIQUE NOT NULL
    company_kana = Column(String(255))                             # company_kana VARCHAR(255)
    industry = Column(String(100))                                 # industry VARCHAR(100) (nullable by default)
    other_details = Column(JSON)                                   # other_details JSONB (JSON in SQLAlchemy maps to JSON/JSONB in Pg)

    created_at = Column(DateTime(timezone=True), server_default=func.now()) # TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now()) # TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

    def __repr__(self):
        return f"<Company(id={self.id}, name='{self.company_name}', industry='{self.industry}')>"