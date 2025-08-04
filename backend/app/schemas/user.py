# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .deal import Deal

# --- Base Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    name: str
    name_kana: Optional[str] = None

class UserInDBBase(UserBase):
    id: int

    class Config:
        from_attributes = True

# --- Schemas for API Operations ---
class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    name_kana: Optional[str] = None
    password: Optional[str] = None

# --- Main Schema with Relationships ---
class User(UserInDBBase):
    created_at: datetime
    updated_at: datetime
    deals: List['Deal'] = []
    dashboard_preferences: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True
