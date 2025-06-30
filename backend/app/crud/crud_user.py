from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app import models, schemas

# Setup password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_hashed_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# --- CRUD Functions ---

def get_user(db: Session, user_id: int):
    return db.query(models.user.User).filter(models.user.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.user.User).filter(models.user.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.user.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.user.UserCreate) -> models.user.User:
    # Hash the password before creating the user
    hashed_password = get_hashed_password(user.password)
    db_user = models.user.User(
        email=user.email,
        name=user.name,
        name_kana=user.name_kana,
        password_hash=hashed_password # Store the hash, not the plain password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: models.user.User, user_update: schemas.user.UserUpdate) -> models.user.User:
    update_data = user_update.dict(exclude_unset=True)

    # If the password is being updated, hash the new one
    if "password" in update_data:
        update_data["password_hash"] = get_hashed_password(update_data["password"])
        del update_data["password"]

    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.user.User).filter(models.user.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

