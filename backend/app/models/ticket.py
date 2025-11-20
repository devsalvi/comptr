"""
Pydantic models for ticket management
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from enum import Enum


class TicketStatus(str, Enum):
    NEW = "new"
    OPEN = "open"
    PENDING_CUSTOMER = "pending_customer"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Channel(str, Enum):
    WEB_CHAT = "web_chat"
    EMAIL = "email"
    FACEBOOK = "facebook"
    TWITTER = "twitter"
    WHATSAPP = "whatsapp"
    INSTAGRAM = "instagram"


class SenderType(str, Enum):
    CUSTOMER = "customer"
    AGENT = "agent"
    BOT = "bot"
    SYSTEM = "system"


class Source(BaseModel):
    channel: Channel
    origin_platform_id: str = Field(
        ...,
        description="The thread ID from external platform for reply routing"
    )
    is_bot_handoff: bool = False


class Customer(BaseModel):
    internal_id: str
    name: Optional[str] = None
    primary_email: Optional[str] = None
    channel_identity: str = Field(
        ...,
        description="Handle, phone number, or email specific to source channel"
    )


class Attachment(BaseModel):
    url: str
    file_type: str
    file_name: Optional[str] = None
    size_bytes: Optional[int] = None


class Message(BaseModel):
    message_id: str
    timestamp: datetime
    sender_type: SenderType
    content: str
    content_type: str = "text"
    visibility: Literal["public", "internal"] = "public"
    agent_id: Optional[str] = None
    attachments: List[Attachment] = []
    channel_specific_data: dict = {}


class Ticket(BaseModel):
    ticket_id: str
    created_at: datetime
    updated_at: datetime
    status: TicketStatus = TicketStatus.NEW
    priority: TicketPriority = TicketPriority.MEDIUM
    assigned_agent_id: Optional[str] = None
    tags: List[str] = []
    source: Source
    customer: Customer
    subject: str
    timeline: List[Message] = []


class TicketCreateRequest(BaseModel):
    """Request body for creating a new ticket"""
    source: Source
    customer: Customer
    subject: str
    initial_message: str
    priority: Optional[TicketPriority] = TicketPriority.MEDIUM
    tags: List[str] = []


class TicketUpdateRequest(BaseModel):
    """Request body for updating ticket metadata"""
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    assigned_agent_id: Optional[str] = None
    tags: Optional[List[str]] = None


class MessageCreateRequest(BaseModel):
    """Request body for adding a message to a ticket"""
    content: str
    sender_type: SenderType = SenderType.AGENT
    agent_id: Optional[str] = None
    visibility: Literal["public", "internal"] = "public"
    attachments: List[Attachment] = []


class TicketListResponse(BaseModel):
    """Response for listing tickets"""
    tickets: List[Ticket]
    total_count: int
    page: int
    page_size: int
