# backend/app/routers/agency.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas import agency as agency_schema
from app.crud import crud_agency
from app.database import get_db

router = APIRouter(
    prefix="/agencies",
    tags=["Agencies"]
)

@router.post("/", response_model=agency_schema.Agency, status_code=201)
def create_new_agency(agency: agency_schema.AgencyCreate, db: Session = Depends(get_db)):
    db_agency = crud_agency.get_agency_by_name(db, agency_name=agency.agency_name)
    if db_agency:
        raise HTTPException(status_code=400, detail="Agency with this name already registered")
    return crud_agency.create_agency(db=db, agency=agency)

@router.get("/", response_model=List[agency_schema.Agency])
def read_all_agencies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    agencies = crud_agency.get_agencies(db, skip=skip, limit=limit)
    return agencies
