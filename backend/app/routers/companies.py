# backend/app/routers/companies.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.schemas import company as company_schema # Import the company schema file
from app.database import SessionLocal, engine

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)

@router.post("/", response_model=company_schema.Company) # Use the imported schema alias
def create_company(company: company_schema.CompanyCreate, db: Session = Depends(get_db)):
    """
    Create a new company record in the database.
    """
    db_company = models.company.Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.get("/", response_model=List[schemas.company.Company])
def read_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all company records from the database.
    """
    companies = db.query(models.company.Company).offset(skip).limit(limit).all()
    return companies