# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analytics # Import your new router

# Create the main FastAPI app instance
app = FastAPI(title="Sales Management System API")

# Add CORS Middleware (as before)
origins = [
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router from analytics.py
# All endpoints defined in that file will now be part of your application.
app.include_router(analytics.router, prefix="/api")

# A simple root endpoint to confirm the app is running
@app.get("/")
def read_root():
    return {"message": "Welcome to the API!"}