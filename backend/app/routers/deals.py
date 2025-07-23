# backend/app/routers/deals.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.crud import crud_deal, crud_user, crud_company
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

# --- GET all deals endpoint ---
@router.get("/", response_model=List[schemas.deal.Deal])
def read_all_deals(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Retrieve a list of all deals with optional pagination.
    """
    deals = crud_deal.get_deals(db, skip=skip, limit=limit)
    return deals

@router.post("/", response_model=schemas.deal.Deal, status_code=status.HTTP_201_CREATED)
def create_new_deal(deal: schemas.deal.DealCreate, db: Session = Depends(get_db)):
    """
    Create a new deal.
    """
    # This keeps all database logic in the crud layer
    return crud_deal.create_deal(db=db, deal=deal)

# You can add GET/PUT/DELETE endpoints for deals here later
# If you want a GET by ID:
@router.get("/{deal_id}", response_model=schemas.deal.Deal)
def read_deal_by_id(deal_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single deal by its ID.
    """
    db_deal = crud_deal.get_deal(db, deal_id=deal_id)
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return db_deal

# If you want to update a deal:
@router.put("/{deal_id}", response_model=schemas.deal.Deal)
def update_existing_deal(deal_id: int, deal_update: schemas.deal.DealUpdate, db: Session = Depends(get_db)):
    """
    Update an existing deal.
    """
    db_deal = crud_deal.get_deal(db, deal_id=deal_id)
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    return crud_deal.update_deal(db, db_deal=db_deal, deal_update=deal_update)

# If you want to delete a deal:
@router.delete("/{deal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_deal(deal_id: int, db: Session = Depends(get_db)):
    """
    Delete a deal.
    """
    db_deal = crud_deal.delete_deal(db, deal_id=deal_id)
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return None