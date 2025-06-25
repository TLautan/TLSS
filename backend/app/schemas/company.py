# backend/app/schemas/company.py

from pydantic import BaseModel

# Schema for data we expect when creating a company
class CompanyCreate(BaseModel):
    company_name: str
    industry: str

# Schema for data we will return when reading a company
class Company(CompanyCreate):
    id: int

    class Config:
        orm_mode = True