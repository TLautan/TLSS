# app/models/user.py

from sqlalchemy import Column, Integer, String, DateTime, func, UniqueConstraint
from app.database import Base # Ensure this import path is correct

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False) # name VARCHAR(255) NOT NULL
    name_kana = Column(String(255))            # name_kana VARCHAR(255)
    email = Column(String(255), unique=True, nullable=False, index=True) # email VARCHAR(255) UNIQUE NOT NULL,
    #password_hash = Column(String(255), nullable=False) # password_hash VARCHAR(255) NOT NULL

    created_at = Column(DateTime(timezone=True), server_default=func.now()) # TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now()) # TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}')>"