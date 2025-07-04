from sqlalchemy.orm import Session
from app import models
from app.schemas import agency as agency_schema

def get_agency(db: Session, agency_id: int):
    return db.query(models.agency.Agency).filter(models.agency.Agency.id == agency_id).first()

def get_agency_by_name(db: Session, agency_name: str):
    return db.query(models.agency.Agency).filter(models.agency.Agency.agency_name == agency_name).first()

def get_agencies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.agency.Agency).offset(skip).limit(limit).all()

def create_agency(db: Session, agency: agency_schema.AgencyCreate) -> models.agency.Agency:
    db_agency = models.agency.Agency(**agency.dict())
    db.add(db_agency)
    db.commit()
    db.refresh(db_agency)
    return db_agency
