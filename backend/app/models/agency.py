# backend/app/models/agency.py

from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func # Import func for current timestamp defaults
from app.database import Base # Ensure this import path is correct

class Agency(Base):
    __tablename__ = "agencies"

    id = Column(Integer, primary_key=True, index=True) # SERIAL PRIMARY KEY

    agency_name = Column(String(255), unique=True, nullable=False, index=True) # VARCHAR(255) UNIQUE NOT NULL
    agency_kana = Column(String(255))                                         # VARCHAR(255) (nullable by default)
    contact_person = Column(String(255))                                      # VARCHAR(255) (nullable by default)
    contact_email = Column(String(255))                                       # VARCHAR(255) (nullable by default)
    contact_phone = Column(String(50))                                        # VARCHAR(50) (nullable by default)
    notes = Column(Text)                                                      # TEXT (nullable by default)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False) # TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now(), nullable=False) # TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL

    def __repr__(self):
        return f"<Agency(id={self.id}, name='{self.agency_name}')>"