"""
Customer management endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List

from app.models import Ticket
from app.services import db_service
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/{customer_id}/tickets", response_model=List[Ticket])
async def get_customer_tickets(
    customer_id: str,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get all tickets for a specific customer"""
    tickets = await db_service.get_customer_tickets(customer_id, limit=limit)
    return tickets


@router.get("/{customer_id}")
async def get_customer(
    customer_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get customer profile information"""
    # This would query the customers table
    # Simplified for now
    return {
        "customer_id": customer_id,
        "status": "active"
    }
