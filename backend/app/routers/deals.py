# backend/app/routers/deals.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.crud import crud_deal, crud_user, crud_company # Assuming you have these
from app.database import SessionLocal

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(
    prefix="/deals",
    tags=["Deals"]
)

# This endpoint now accepts the full DealCreate schema
@router.post("/", response_model=schemas.deal.Deal, status_code=201)
def create_new_deal(deal: schemas.deal.DealCreate, db: Session = Depends(get_db)):
    """
    Create a new deal.
    """
    # Optional: Add checks here to ensure the user_id and company_id exist
    # For example:
    # user = crud_user.get_user(db, user_id=deal.user_id)
    # if not user:
    #     raise HTTPException(status_code=404, detail="User not found")

    # Create a new SQLAlchemy model instance using all the data
    db_deal = models.deal.Deal(
        title=deal.title,
        value=deal.value,
        type=deal.type,
        user_id=deal.user_id,
        company_id=deal.company_id
        # Status will use the default 'in_progress'
    )
    
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    
    return db_deal

# You can add GET/PUT/DELETE endpoints for deals here later
