# backend/app/schemas/company.py

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
class CompanyBase(BaseModel):
    company_name: str
    company_kana: Optional[str] = None
    industry: Optional[str] = None
    other_details: Optional[Dict[str, Any]] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    company_kana: Optional[str] = None
    industry: Optional[str] = None
    other_details: Optional[Dict[str, Any]] = None

class Company(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
