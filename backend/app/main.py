"""
FastAPI main application entry point
Designed for AWS Lambda deployment via Mangum adapter
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from app.config import settings
from app.routes import tickets, webhooks, customers, health

# Initialize FastAPI app
app = FastAPI(
    title="Omnichannel Support API",
    description="Centralized customer case management system",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=False,  # Must be False when AllowOrigins is "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(tickets.router, prefix="/api/tickets", tags=["Tickets"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])

@app.get("/")
async def root():
    return {
        "service": "Omnichannel Support API",
        "status": "running",
        "version": "1.0.0"
    }

# Lambda handler via Mangum
handler = Mangum(app, lifespan="off")
