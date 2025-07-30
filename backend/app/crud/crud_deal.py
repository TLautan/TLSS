# backend/app/crud/crud_deal.py

from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app import models
from app.schemas import deal as deal_schema

# --- READ Operations ---

def get_deal(db: Session, deal_id: int) -> Optional[models.deal.Deal]:
    """
    Retrieve a single deal by its ID.
    """
    return db.query(models.deal.Deal).filter(models.deal.Deal.id == deal_id).first()

def get_deals(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    company_id: Optional[int] = None
) -> List[models.deal.Deal]:
    """
    Retrieve a list of deals with pagination and filtering.
    """
    query = db.query(models.deal.Deal).options(
        joinedload(models.deal.Deal.user), 
        joinedload(models.deal.Deal.company)
    )

    # Apply filters if they are provided
    if search:
        query = query.filter(models.deal.Deal.title.ilike(f"%{search}%"))
    
    if status:
        query = query.filter(models.deal.Deal.status == status)

    if user_id:
        query = query.filter(models.deal.Deal.user_id == user_id)
        
    if company_id:
        query = query.filter(models.deal.Deal.company_id == company_id)

    return query.offset(skip).limit(limit).all()


def get_deals_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[models.deal.Deal]:
    """
    Retrieve all deals assigned to a specific user, eagerly loading company data.
    """
    return (
        db.query(models.deal.Deal)
        .options(joinedload(models.deal.Deal.company))
        .filter(models.deal.Deal.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

# --- CREATE Operation ---

def create_deal(db: Session, deal: deal_schema.DealCreate) -> models.deal.Deal:
    """
    Create a new deal record in the database.
    """
    db_deal = models.deal.Deal(**deal.model_dump())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal


# --- UPDATE Operation ---

def update_deal(db: Session, db_deal: models.deal.Deal, deal_update: deal_schema.DealUpdate) -> models.deal.Deal:
    """
    Update an existing deal record.
    """
    update_data = deal_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_deal, key, value)
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal


# --- DELETE Operation ---

def delete_deal(db: Session, deal_id: int) -> Optional[models.deal.Deal]:
    """
    Delete a deal record from the database.
    """
    db_deal = get_deal(db, deal_id=deal_id)
    if db_deal:
        db.delete(db_deal)
        db.commit()
    return db_deal
