# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analytics, companies, users, agencies, activities, deals, importer, auth, notes, attachments, audit_logs

app = FastAPI(title="営業管理システム")

origins = [
    "http://localhost",
    "http://192.168.1.22",
    "http://localhost:3000",
    "http://192.168.1.22:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")

app.include_router(analytics.router, prefix="/api")
app.include_router(companies.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(agencies.router, prefix="/api")
app.include_router(activities.router, prefix="/api")
app.include_router(deals.router, prefix="/api")
app.include_router(importer.router, prefix="/api")
app.include_router(notes.router, prefix="/api")
app.include_router(attachments.router, prefix="/api")
app.include_router(audit_logs.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "いらっしゃい!"}