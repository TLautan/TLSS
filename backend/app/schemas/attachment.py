# backend/app/schemas/attachment.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .user import UserInDBBase as UserSchema

class AttachmentBase(BaseModel):
    file_name: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None

class Attachment(AttachmentBase):
    id: int
    user_id: int
    created_at: datetime
    uploader: Optional[UserSchema] = None

    class Config:
        from_attributes = True