# backend/app/seed_all.py

import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError # Import IntegrityError for exception handling
from faker import Faker

from app.database import SessionLocal
from app import models, crud
from app.schemas import user as user_schema
from app.schemas import company as company_schema
from app.schemas import agency as agency_schema
from app.schemas import deal as deal_schema
from app.schemas import activity as activity_schema
from app.models.enums import DealStatus, DealType, ForecastAccuracy, ActivityType

# Initialize Faker for Japanese data
fake = Faker('ja_JP')

# --- CONFIGURATION ---
NEW_USERS = 10
NEW_COMPANIES = 50
NEW_AGENCIES = 5
NEW_DEALS = 2500
ACTIVITIES_PER_DEAL_RANGE = (1, 10)
DAYS_IN_PAST = 365 * 3

# --- DATA POOLS ---
INDUSTRIES = ["テクノロジー", "製造", "金融", "ヘルスケア", "小売", "コンサルティング", "不動産", "運輸", "教育", "サービス"]
PRODUCTS = ["Pro Plan", "Enterprise Suite", "Basic Service", "Standard Package", "Custom Solution"]
LEAD_SOURCES = ["Web", "Referral", "Event", "Cold Call", "Partner", "Advertisement"]
WIN_REASONS = ["価格", "機能性", "サポート体制", "ブランド信頼性", "導入実績"]
LOSS_REASONS = ["競合に敗北", "予算オーバー", "時期尚早", "機能不足", "担当者変更"]
CANCEL_REASONS = ["プロジェクト中止", "経営方針の変更", "予算削減"]
NOTES_POOL = [
    "Initial contact made, sent follow-up email.", "Discovery call completed.", "Product demo scheduled.",
    "Sent proposal and pricing information.", "Client is reviewing the proposal.", "Negotiating terms.",
    "Verbal agreement received. Waiting for the signed contract.",
]

def seed_database():
    """
    MODIFIED: This script now ALWAYS adds new data and gracefully handles
    unique constraint violations to allow for repeated runs.
    """
    db: Session = SessionLocal()

    try:
        print("🚀 Starting aggressive database seeding...")

        print("🔍 Fetching existing records...")
        users = db.query(models.User).all()
        companies = db.query(models.Company).all()
        agencies = db.query(models.Agency).all()
        print(f"   - Found {len(users)} users, {len(companies)} companies, {len(agencies)} agencies.")

        # --- Add NEW Users ---
        print(f"👤 Adding up to {NEW_USERS} new users...")
        for _ in range(NEW_USERS):
            try:
                user_data = user_schema.UserCreate(name=fake.name(), email=fake.unique.email(), password="password123")
                crud.user.create_user(db, user=user_data)
            except IntegrityError:
                db.rollback() # Rollback the failed transaction
                print(f"   - WARNING: Skipped creating a user due to duplicate email.")
        users = db.query(models.User).all()
        print(f"   - Total users now: {len(users)}")

        # --- Add NEW Companies ---
        print(f"🏢 Adding up to {NEW_COMPANIES} new companies...")
        for _ in range(NEW_COMPANIES):
            try:
                company_name = fake.unique.company()
                company_kana = fake.kana_name() # Generate a kana name
                company_data = company_schema.CompanyCreate(
                    company_name=company_name,
                    company_kana=company_kana,
                    industry=random.choice(INDUSTRIES)
                )
                crud.company.create_company(db, company=company_data)
            except IntegrityError:
                db.rollback()
                print(f"   - WARNING: Skipped creating a company due to duplicate name.")
        companies = db.query(models.Company).all()
        print(f"   - Total companies now: {len(companies)}")

        # --- Add NEW Agencies ---
        print(f"🤝 Adding up to {NEW_AGENCIES} new agencies...")
        for _ in range(NEW_AGENCIES):
            try:
                agency_data = agency_schema.AgencyCreate(
                    agency_name=f"{fake.unique.company()}代理店",
                    contact_person=fake.name(),
                    contact_email=fake.unique.email()
                )
                crud.agency.create_agency(db, agency=agency_data)
            except IntegrityError:
                db.rollback()
                print(f"   - WARNING: Skipped creating an agency due to duplicate name or email.")
        agencies = db.query(models.Agency).all()
        print(f"   - Total agencies now: {len(agencies)}")
        
        # --- Add a large batch of NEW Deals and Activities ---
        print(f"📊 Seeding {NEW_DEALS} NEW Deals and associated Activities...")
        if not users or not companies:
            print("   - Cannot create deals without users and companies. Skipping.")
            return

        total_activities = 0
        today = datetime.now()

        for _ in range(NEW_DEALS):
            # ... (deal and activity creation logic remains the same)
            created_date = today - timedelta(days=random.randint(0, DAYS_IN_PAST))
            status_choice = random.choices(list(DealStatus), weights=[40, 35, 20, 5], k=1)[0]
            type_choice = random.choices(list(DealType), weights=[70, 30], k=1)[0]
            closed_date, win_reason, loss_reason, cancellation_reason, agency_id = None, None, None, None, None
            if status_choice != DealStatus.in_progress:
                closed_date = created_date + timedelta(days=random.randint(15, 90))
                if status_choice == DealStatus.won: win_reason = random.choice(WIN_REASONS)
                elif status_choice == DealStatus.lost: loss_reason = random.choice(LOSS_REASONS)
                elif status_choice == DealStatus.cancelled: cancellation_reason = random.choice(CANCEL_REASONS)
            if type_choice == DealType.agency and agencies:
                agency_id = random.choice(agencies).id
            new_deal = deal_schema.DealCreate(
                title=f"{created_date.strftime('%Y-%m')} {fake.bs()} Project",
                value=random.randrange(100000, 10000000, 50000),
                user_id=random.choice(users).id,
                company_id=random.choice(companies).id,
                status=status_choice, type=type_choice,
                forecast_accuracy=random.choice(list(ForecastAccuracy)),
                lead_source=random.choice(LEAD_SOURCES),
                product_name=random.choice(PRODUCTS),
                closed_at=closed_date, win_reason=win_reason, loss_reason=loss_reason,
                cancellation_reason=cancellation_reason, agency_id=agency_id
            )
            created_deal = crud.deal.create_deal(db=db, deal=new_deal, current_user_id=new_deal.user_id)
            for _ in range(random.randint(*ACTIVITIES_PER_DEAL_RANGE)):
                activity_date = created_date + timedelta(days=random.randint(1, 30))
                new_activity = activity_schema.ActivityCreate(
                    deal_id=created_deal.id, type=random.choice(list(ActivityType)),
                    date=activity_date, notes=random.choice(NOTES_POOL)
                )
                crud.activity.create_activity(db, activity=new_activity)
                total_activities += 1
        
        total_deals = db.query(models.Deal).count()
        print(f"   - Created {NEW_DEALS} new deals and {total_activities} new activities. Total deals in DB: {total_deals}")

        print("\n✅ Seeding complete!")

    except Exception as e:
        print(f"\n❌ An error occurred during seeding: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()