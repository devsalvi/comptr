"""
Health check endpoints
"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "omnichannel-support-api"
    }


@router.get("/ready")
async def readiness_check():
    """Readiness check for load balancers"""
    # TODO: Add checks for DynamoDB, Kafka connectivity
    return {
        "ready": True,
        "timestamp": datetime.utcnow().isoformat()
    }
