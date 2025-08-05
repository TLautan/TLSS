# backend/app/crud/crud_deal.py

from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app import models
from app.schemas import deal as deal_schema
from app.crud import crud_audit_log
from app.schemas.audit_log import AuditLogCreate

# --- READ Operations ---

def get_deal(db: Session, deal_id: int) -> Optional[models.deal.Deal]:
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
    return (
        db.query(models.deal.Deal)
        .options(joinedload(models.deal.Deal.company))
        .filter(models.deal.Deal.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

# --- CREATE Operation ---

def create_deal(db: Session, deal: deal_schema.DealCreate, current_user_id: int) -> models.deal.Deal:
    db_deal = models.deal.Deal(**deal.model_dump())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    crud_audit_log.create_log_entry(db, log=AuditLogCreate(
        user_id=current_user_id,
        action="create_deal",
        details=f"Created deal '{db_deal.title}' with ID {db_deal.id}."
    ))
    return db_deal

# --- UPDATE Operation ---

def update_deal(db: Session, db_deal: models.deal.Deal, deal_update: deal_schema.DealUpdate, current_user_id: int) -> models.deal.Deal:
    update_data = deal_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_deal, key, value)
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    crud_audit_log.create_log_entry(db, log=AuditLogCreate(
        user_id=current_user_id,
        action="update_deal",
        details=f"Updated deal '{db_deal.title}' (ID: {db_deal.id})."
    ))
    return db_deal


# --- DELETE Operation ---

def delete_deal(db: Session, deal_id: int, current_user_id: int) -> Optional[models.deal.Deal]:
    db_deal = get_deal(db, deal_id=deal_id)
    if db_deal:
        deal_title = db_deal.title
        db.delete(db_deal)
        db.commit()
        crud_audit_log.create_log_entry(db, log=AuditLogCreate(
            user_id=current_user_id,
            action="delete_deal",
            details=f"Deleted deal '{deal_title}' (ID: {deal_id})."
        ))
    return db_deal
