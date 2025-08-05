# backend/app/schemas/audit_log.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .user import UserInDBBase as UserSchema

class AuditLogBase(BaseModel):
    action: str
    details: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    user_id: Optional[int] = None

class AuditLog(AuditLogBase):
    id: int
    user_id: Optional[int] = None
    timestamp: datetime
    user: Optional[UserSchema] = None

    class Config:
        from_attributes = True