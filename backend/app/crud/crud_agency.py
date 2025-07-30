# backend/app/crud/crud_agency.py

from sqlalchemy.orm import Session
from app import models
from app.schemas import agency as agency_schema

def get_agency(db: Session, agency_id: int):
    """
    Read a single agency from the database by its ID.
    """
    return db.query(models.agency.Agency).filter(models.agency.Agency.id == agency_id).first()

def get_agency_by_name(db: Session, agency_name: str):
    """
    Read a single agency from the database by its unique name.
    """
    return db.query(models.agency.Agency).filter(models.agency.Agency.agency_name == agency_name).first()

def get_agencies(db: Session, skip: int = 0, limit: int = 100):
    """
    Read a list of agencies from the database with pagination.
    """
    return db.query(models.agency.Agency).offset(skip).limit(limit).all()

def create_agency(db: Session, agency: agency_schema.AgencyCreate) -> models.agency.Agency:
    """
    Create a new agency record in the database.
    """
    db_agency = models.agency.Agency(**agency.dict())
    db.add(db_agency)
    db.commit()
    db.refresh(db_agency)
    return db_agency

def update_agency(db: Session, db_agency: models.agency.Agency, agency_update: agency_schema.AgencyUpdate) -> models.agency.Agency:
    """
    Update an existing agency record.
    """
    update_data = agency_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_agency, key, value)
    
    db.add(db_agency)
    db.commit()
    db.refresh(db_agency)
    return db_agency

def delete_agency(db: Session, agency_id: int):
    """
    Delete a agency record from the database.
    """
    db_agency = db.query(models.agency.Agency).filter(models.agency.Agency.id == agency_id).first()
    if db_agency:
        db.delete(db_agency)
        db.commit()
    return db_agency