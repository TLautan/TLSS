# backend/app/models/audit_log.py

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    
    # Who performed the action
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # What was done
    action = Column(String(255), nullable=False, index=True)
    
    # Details about the action
    details = Column(Text, nullable=True)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")