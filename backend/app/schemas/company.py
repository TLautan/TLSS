# backend/app/schemas/company.py

from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .deal import Deal

# --- Base Schemas ---
class CompanyBase(BaseModel):
    company_name: str
    company_kana: Optional[str] = None
    industry: Optional[str] = None
    other_details: Optional[Dict[str, Any]] = None

class CompanyInDBBase(CompanyBase):
    id: int

    class Config:
        from_attributes = True

# --- Schemas for API Operations ---
class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    company_kana: Optional[str] = None
    industry: Optional[str] = None
    other_details: Optional[Dict[str, Any]] = None

# --- Main Schema with Relationships ---
class Company(CompanyInDBBase):
    created_at: datetime
    updated_at: datetime
    deals: List['Deal'] = []

    class Config:
        from_attributes = True
