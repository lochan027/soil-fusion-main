from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .api import routes
import os

app = FastAPI(
    title="Soil Fusion API",
    description="API for crop recommendation based on soil parameters",
    version="1.0.0",
    docs_url="/docs",   # Swagger UI documentation
    redoc_url="/redoc"  # ReDoc documentation
)

# Get environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Configure CORS
allowed_origins = [
    "http://localhost:3000",  # Local development
    "http://localhost:5000",  # Local production build
    "https://soilfusion.netlify.app",  # Production Netlify URL
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

@app.get("/")
async def root():
    """Root endpoint that returns API information"""
    return JSONResponse({
        "name": "Soil Fusion API",
        "version": "1.0.0",
        "status": "active",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "predict": "/api/v1/predict"
        }
    })

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy"}

# Include API routes
app.include_router(routes.router, prefix="/api/v1") 