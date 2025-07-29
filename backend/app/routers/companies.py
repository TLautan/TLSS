from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from typing import List
from app.schemas import company as company_schema
from app.crud import crud_company
from app.database import get_db
from app.database import SessionLocal

# Dependency to get a database session

router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)

@router.post("/", response_model=company_schema.Company, status_code=201)
def create_new_company(company: company_schema.CompanyCreate, db: Session = Depends(get_db)):
    """
    Create a new company.
    - Checks if a company with the same name already exists.
    """
    db_company = crud_company.get_company_by_name(db, company_name=company.company_name)
    if db_company:
        raise HTTPException(status_code=400, detail="Company with this name already registered")
    return crud_company.create_company(db=db, company=company)

@router.get("/", response_model=List[company_schema.Company])
def read_all_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a list of all companies with pagination.
    """
    companies = crud_company.get_companies(db, skip=skip, limit=limit)
    return companies

@router.get("/{company_id}", response_model=company_schema.Company)
def read_single_company(company_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single company by its ID.
    """
    db_company = crud_company.get_company(db, company_id=company_id)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return db_company

@router.put("/{company_id}", response_model=company_schema.Company)
def update_existing_company(company_id: int, company_update: company_schema.CompanyUpdate, db: Session = Depends(get_db)):
    """
    Update a company's details.
    """
    db_company = crud_company.get_company(db, company_id=company_id)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return crud_company.update_company(db=db, db_company=db_company, company_update=company_update)

@router.delete("/{company_id}", response_model=company_schema.Company)
def delete_existing_company(company_id: int, db: Session = Depends(get_db)):
    """
    Delete a company.
    """
    db_company = crud_company.delete_company(db, company_id=company_id)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return db_company
