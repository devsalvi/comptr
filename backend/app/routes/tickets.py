"""
Ticket management endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime
import uuid

from app.models import (
    Ticket,
    TicketCreateRequest,
    TicketUpdateRequest,
    MessageCreateRequest,
    TicketListResponse,
    SenderType,
    Message
)
from app.services import db_service, kafka_producer
from app.utils.auth import get_current_user

router = APIRouter()


@router.post("/create", response_model=Ticket, status_code=201)
async def create_ticket(request: TicketCreateRequest):
    """
    Create a new support ticket
    Used by chatbots, webhooks, and manual creation
    """
    # Get or create customer
    customer_data = await db_service.get_or_create_customer(
        channel_identity=request.customer.channel_identity,
        channel=request.source.channel,
        name=request.customer.name,
        primary_email=request.customer.primary_email
    )

    # Prepare initial message
    initial_message = {
        "message_id": f"msg_{uuid.uuid4().hex[:12]}",
        "timestamp": datetime.utcnow().isoformat(),
        "sender_type": SenderType.CUSTOMER,
        "content": request.initial_message,
        "content_type": "text",
        "visibility": "public"
    }

    # Create ticket
    ticket_data = {
        "status": "new",
        "priority": request.priority,
        "tags": request.tags,
        "source": request.source.dict(),
        "customer": {
            "internal_id": customer_data["internal_id"],
            "name": customer_data.get("name"),
            "primary_email": customer_data.get("primary_email"),
            "channel_identity": customer_data["channel_identity"]
        },
        "subject": request.subject,
        "timeline": [initial_message]
    }

    ticket = await db_service.create_ticket(ticket_data)

    # Publish Kafka event
    await kafka_producer.publish_ticket_created(ticket.dict())

    return ticket


@router.get("/{ticket_id}", response_model=Ticket)
async def get_ticket(ticket_id: str):
    """Retrieve a specific ticket by ID"""
    ticket = await db_service.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.put("/{ticket_id}", response_model=Ticket)
async def update_ticket(
    ticket_id: str,
    request: TicketUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update ticket metadata (status, priority, assignment, tags)"""
    updates = {k: v for k, v in request.dict().items() if v is not None}

    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")

    ticket = await db_service.update_ticket(ticket_id, updates)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Publish update event
    await kafka_producer.publish_ticket_updated(ticket_id, ticket.dict())

    return ticket


@router.post("/{ticket_id}/message", response_model=Ticket)
async def add_message(
    ticket_id: str,
    request: MessageCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Add a new message to a ticket timeline"""
    message_data = {
        "sender_type": request.sender_type,
        "content": request.content,
        "content_type": "text",
        "visibility": request.visibility,
        "agent_id": request.agent_id or current_user.get("sub"),
        "attachments": [att.dict() for att in request.attachments]
    }

    ticket = await db_service.add_message_to_ticket(ticket_id, message_data)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Publish message event
    message_with_id = ticket.timeline[-1]
    await kafka_producer.publish_message_added(ticket_id, message_with_id.dict())

    return ticket


@router.get("/{ticket_id}/status")
async def get_ticket_status(ticket_id: str):
    """
    Get ticket status - lightweight endpoint for chatbot polling
    Returns only status and last message timestamp
    """
    ticket = await db_service.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    last_agent_message = None
    for message in reversed(ticket.timeline):
        if message.sender_type == SenderType.AGENT:
            last_agent_message = message
            break

    return {
        "ticket_id": ticket.ticket_id,
        "status": ticket.status,
        "last_updated": ticket.updated_at,
        "has_agent_reply": last_agent_message is not None,
        "last_agent_message": last_agent_message.dict() if last_agent_message else None
    }


@router.put("/{ticket_id}/assign")
async def assign_ticket(
    ticket_id: str,
    agent_id: str = Query(..., description="Agent ID to assign ticket to"),
    current_user: dict = Depends(get_current_user)
):
    """Assign a ticket to an agent"""
    ticket = await db_service.update_ticket(ticket_id, {"assigned_agent_id": agent_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Add system message
    system_message = {
        "sender_type": SenderType.SYSTEM,
        "content": f"Ticket assigned to agent {agent_id}",
        "content_type": "event_log",
        "visibility": "internal"
    }
    await db_service.add_message_to_ticket(ticket_id, system_message)

    return {"success": True, "ticket": ticket}


@router.get("/", response_model=TicketListResponse)
async def list_tickets(
    status: Optional[str] = Query(None, description="Filter by status"),
    assigned_agent_id: Optional[str] = Query(None, description="Filter by assigned agent"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """List tickets with optional filters and pagination"""
    result = await db_service.list_tickets(
        status=status,
        assigned_agent_id=assigned_agent_id,
        limit=page_size
    )

    return {
        "tickets": result["tickets"],
        "total_count": result["count"],
        "page": page,
        "page_size": page_size
    }
