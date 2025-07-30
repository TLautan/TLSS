# backend/app/schemas/agency.py

from pydantic import BaseModel, EmailStr # type: ignore
from typing import Optional, Dict, Any
from datetime import datetime

# Base schema with all common fields
class AgencyBase(BaseModel):
    agency_name: str
    agency_kana: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    notes: Optional[Dict[str, Any]] = None

# Schema for creating a new agency
class AgencyCreate(AgencyBase):
    pass

# Schema for updating an agency (all fields are optional)
class AgencyUpdate(AgencyBase):
    pass

# Schema for returning agency data from the API
class Agency(AgencyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
