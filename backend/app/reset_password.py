# backend/app/reset_password.py

import argparse
from sqlalchemy.orm import Session
from getpass import getpass

from app.database import SessionLocal
from app.models.user import User
from app.crud.crud_user import get_hashed_password, get_user_by_email

def reset_user_password(db: Session, email: str, new_password: str):
    """
    Finds a user by email and updates their password with a new hashed password.
    """
    user = get_user_by_email(db, email=email)
    
    if not user:
        print(f"Error: User with email '{email}' not found.")
        return

    # Hash the new password
    hashed_password = get_hashed_password(new_password)
    
    # Update the user object and commit to the database
    user.password_hash = hashed_password
    db.add(user)
    db.commit()
    
    print(f"Successfully updated password for user '{email}'.")


if __name__ == "__main__":
    # Set up argument parser to accept email from the command line
    parser = argparse.ArgumentParser(description="Reset a user's password.")
    parser.add_argument("email", type=str, help="The email address of the user whose password you want to reset.")
    
    args = parser.parse_args()

    # Securely prompt for the new password so it's not visible in the terminal or history
    new_password = getpass("Enter new password: ")
    confirm_password = getpass("Confirm new password: ")

    if new_password != confirm_password:
        print("Error: Passwords do not match.")
        exit(1)

    if not new_password:
        print("Error: Password cannot be empty.")
        exit(1)

    # Get a database session
    db = SessionLocal()
    try:
        # Call the function to perform the reset
        reset_user_password(db, email=args.email, new_password=new_password)
    finally:
        # Always close the session
        db.close()