from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import routes
import os

app = FastAPI(
    title="Soil Fusion API",
    description="API for crop recommendation based on soil parameters",
    version="1.0.0"
)

# Get environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Configure CORS
allowed_origins = [
    "http://localhost:3000",  # Local development
    "http://localhost:5000",  # Local production build
    FRONTEND_URL,  # Production frontend URL
]

# In development, allow all origins
if ENVIRONMENT == "development":
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(routes.router, prefix="/api/v1") 