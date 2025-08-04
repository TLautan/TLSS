# backend/app/schemas/note.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Import a slimmed-down user schema to display the note's owner
from .user import UserInDBBase as UserSchema

class NoteBase(BaseModel):
    content: str

class NoteCreate(NoteBase):
    related_to: str # 'deal' or 'company'
    related_id: int

class Note(NoteBase):
    id: int
    user_id: int
    created_at: datetime
    owner: Optional[UserSchema] = None # Include owner's info

    class Config:
        from_attributes = True