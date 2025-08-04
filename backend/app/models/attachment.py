# backend/app/models/attachment.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    
    # Polymorphic relationship fields
    related_to = Column(String(50), index=True)
    related_id = Column(Integer, index=True)

    # File metadata
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False, unique=True)
    file_type = Column(String(100))
    file_size = Column(Integer) # Size in bytes

    # Foreign key to the user who uploaded the file
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to the User model
    uploader = relationship("User")