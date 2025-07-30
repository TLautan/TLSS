# backend/app/routers/agency.py

from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.orm import Session
from typing import List
from app.schemas import agency as agency_schema
from app.crud import crud_agency
from app.database import get_db
from app import security

router = APIRouter(
    prefix="/agencies",
    tags=["Agencies"]
)

@router.post("/", response_model=agency_schema.Agency, status_code=201)
def create_new_agency(
    agency: agency_schema.AgencyCreate,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user),
    ):
    """
    Create a new agency.
    """
    db_agency = crud_agency.get_agency_by_name(db, agency_name=agency.agency_name)
    if db_agency:
        raise HTTPException(status_code=400, detail="Agency with this name already registered")
    return crud_agency.create_agency(db=db, agency=agency)

@router.get("/", response_model=List[agency_schema.Agency])
def read_all_agencies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user),
    ):
    """
    Retrieve a list of all agencies.
    """
    agencies = crud_agency.get_agencies(db, skip=skip, limit=limit)
    return agencies

@router.get("/{agency_id}", response_model=agency_schema.Agency)
def read_single_agency(
    agency_id: int,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user),
    ):
    """
    Retrieve an single agency by their ID.
    """
    db_agency = crud_agency.get_agency(db, agency_id=agency_id)
    if db_agency is None:
        raise HTTPException(status_code=404, detail="agency not found")
    return db_agency

@router.put("/{agency_id}", response_model=agency_schema.Agency)
def update_existing_agency(
    agency_id: int,
    agency_update: agency_schema.AgencyUpdate,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user),
    ):
    """
    Update an agency's details.
    """
    db_agency = crud_agency.get_agency(db, agency_id=agency_id)
    if db_agency is None:
        raise HTTPException(status_code=404, detail="agency not found")
    return crud_agency.update_agency(db=db, db_agency=db_agency, agency_update=agency_update)

@router.delete("/{agency_id}", response_model=agency_schema.Agency)
def delete_existing_agency(
    agency_id: int,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user),
    ):
    """
    Delete an agency.
    """
    db_agency = crud_agency.delete_agency(db, agency_id=agency_id)
    if db_agency is None:
        raise HTTPException(status_code=404, detail="agency not found")
    return db_agency