# backend/app/routers/users.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.schemas import user as user_schema
from app.crud import crud_user
from app.database import get_db
from app import security, models

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("/", response_model=user_schema.User, status_code=201)
def create_new_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user. Checks for existing email.
    This endpoint is public and does not require authentication.
    """
    db_user = crud_user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud_user.create_user(db=db, user=user)

@router.get("/me", response_model=user_schema.User)
def read_users_me(current_user: models.user.User = Depends(security.get_current_user)):
    """
    Get the current logged-in user.
    """
    return current_user

@router.get("/me/preferences", response_model=Dict[str, Any])
def get_user_preferences(current_user: models.user.User = Depends(security.get_current_user)):
    """
    Get the dashboard preferences for the current user.
    Returns a default layout if none are set.
    """
    if current_user.dashboard_preferences is None:
        return {
            "layout": ["kpi_cards", "monthly_sales", "deal_outcomes", "recent_deals"],
            "visible_kpis": ["total_revenue", "win_rate", "total_deals", "average_deal_size"]
        }
    return current_user.dashboard_preferences

@router.put("/me/preferences", response_model=Dict[str, Any])
def update_user_preferences(
    preferences: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user)
):
    """
    Update the dashboard preferences for the current user.
    """
    updated_user = crud_user.update_user_dashboard_preferences(db, user=current_user, preferences=preferences)
    return updated_user.dashboard_preferences

@router.get("/", response_model=List[user_schema.User])
def read_all_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user)
):
    """
    Retrieve a list of all users.
    """
    users = crud_user.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=user_schema.User)
def read_single_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user)
):
    """
    Retrieve a single user by their ID.
    """
    db_user = crud_user.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/{user_id}", response_model=user_schema.User)
def update_existing_user(
    user_id: int, 
    user_update: user_schema.UserUpdate, 
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user)
):
    """
    Update a user's details.
    """
    db_user = crud_user.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return crud_user.update_user(db=db, db_user=db_user, user_update=user_update)

@router.delete("/{user_id}", response_model=user_schema.User)
def delete_existing_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user)
):
    """
    Delete a user.
    """
    db_user = crud_user.delete_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
