# backend/app/schemas/agency.py

from pydantic import BaseModel, EmailStr # type: ignore
from typing import Optional, Dict, Any
from datetime import datetime

class AgencyBase(BaseModel):
    agency_name: str
    agency_kana: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None

class AgencyCreate(AgencyBase):
    pass

class AgencyUpdate(AgencyBase):
    pass

class Agency(AgencyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
