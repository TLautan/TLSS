from sqlalchemy.orm import Session
from app import models, schemas

def get_company(db: Session, company_id: int):
    """
    Read a single company from the database by its ID.
    """
    return db.query(models.company.Company).filter(models.company.Company.id == company_id).first()

def get_company_by_name(db: Session, company_name: str):
    """
    Read a single company from the database by its unique name.
    """
    return db.query(models.company.Company).filter(models.company.Company.company_name == company_name).first()

def get_companies(db: Session, skip: int = 0, limit: int = 100):
    """
    Read a list of companies from the database with pagination.
    """
    return db.query(models.company.Company).offset(skip).limit(limit).all()

def create_company(db: Session, company: schemas.company.CompanyCreate) -> models.company.Company:
    """
    Create a new company record in the database.
    """
    db_company = models.company.Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def update_company(db: Session, db_company: models.company.Company, company_update: schemas.company.CompanyUpdate) -> models.company.Company:
    """
    Update an existing company record.
    """
    update_data = company_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_company, key, value)
    
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def delete_company(db: Session, company_id: int):
    """
    Delete a company record from the database.
    """
    db_company = db.query(models.company.Company).filter(models.company.Company.id == company_id).first()
    if db_company:
        db.delete(db_company)
        db.commit()
    return db_company

