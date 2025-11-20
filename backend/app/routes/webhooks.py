"""
Webhook receivers for social media platforms
Normalizes incoming data from various sources into ticket format
"""

from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional
import hmac
import hashlib
import logging

from app.models import TicketCreateRequest, Source, Customer, Channel, TicketPriority
from app.services import db_service, kafka_producer

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/facebook")
async def facebook_webhook(request: Request):
    """
    Facebook Messenger webhook
    Receives messages from Facebook Page
    """
    try:
        data = await request.json()

        # Facebook sends test events during setup
        if data.get("object") == "page":
            for entry in data.get("entry", []):
                for messaging_event in entry.get("messaging", []):
                    sender_id = messaging_event["sender"]["id"]

                    if "message" in messaging_event:
                        message_text = messaging_event["message"].get("text", "")

                        # Check if user has an open ticket
                        existing_ticket = await _find_open_ticket_by_channel_id(
                            sender_id, Channel.FACEBOOK
                        )

                        if existing_ticket:
                            # Add message to existing ticket
                            await db_service.add_message_to_ticket(
                                existing_ticket.ticket_id,
                                {
                                    "sender_type": "customer",
                                    "content": message_text,
                                    "channel_specific_data": {
                                        "facebook_message_id": messaging_event["message"]["mid"]
                                    }
                                }
                            )
                        else:
                            # Create new ticket
                            ticket_request = TicketCreateRequest(
                                source=Source(
                                    channel=Channel.FACEBOOK,
                                    origin_platform_id=sender_id,
                                    is_bot_handoff=False
                                ),
                                customer=Customer(
                                    internal_id="",  # Will be created
                                    channel_identity=sender_id
                                ),
                                subject=f"Facebook message from {sender_id}",
                                initial_message=message_text,
                                priority=TicketPriority.MEDIUM
                            )

                            # Create ticket via the service
                            await _create_ticket_from_webhook(ticket_request)

        return {"status": "ok"}

    except Exception as e:
        logger.error(f"Facebook webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/facebook")
async def facebook_webhook_verification(
    request: Request,
    hub_mode: str = None,
    hub_verify_token: str = None,
    hub_challenge: str = None
):
    """Facebook webhook verification"""
    # TODO: Verify token from environment
    VERIFY_TOKEN = "your_verify_token"

    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        return int(hub_challenge)

    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/whatsapp")
async def whatsapp_webhook(request: Request):
    """
    WhatsApp Business API webhook
    Handles incoming WhatsApp messages
    """
    try:
        data = await request.json()

        for entry in data.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})

                if "messages" in value:
                    for message in value["messages"]:
                        from_number = message["from"]
                        message_text = message.get("text", {}).get("body", "")

                        # Check for existing open ticket
                        existing_ticket = await _find_open_ticket_by_channel_id(
                            from_number, Channel.WHATSAPP
                        )

                        if existing_ticket:
                            await db_service.add_message_to_ticket(
                                existing_ticket.ticket_id,
                                {
                                    "sender_type": "customer",
                                    "content": message_text,
                                    "channel_specific_data": {
                                        "whatsapp_message_id": message["id"]
                                    }
                                }
                            )
                        else:
                            ticket_request = TicketCreateRequest(
                                source=Source(
                                    channel=Channel.WHATSAPP,
                                    origin_platform_id=from_number,
                                    is_bot_handoff=False
                                ),
                                customer=Customer(
                                    internal_id="",
                                    channel_identity=from_number
                                ),
                                subject=f"WhatsApp message from {from_number}",
                                initial_message=message_text,
                                priority=TicketPriority.MEDIUM
                            )

                            await _create_ticket_from_webhook(ticket_request)

        return {"status": "ok"}

    except Exception as e:
        logger.error(f"WhatsApp webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/twitter")
async def twitter_webhook(request: Request, x_twitter_webhooks_signature: Optional[str] = Header(None)):
    """
    Twitter/X DM webhook
    Handles incoming direct messages
    """
    try:
        data = await request.json()

        # Twitter sends DM events
        if "direct_message_events" in data:
            for dm_event in data["direct_message_events"]:
                sender_id = dm_event["message_create"]["sender_id"]
                message_text = dm_event["message_create"]["message_data"]["text"]

                # Check for existing ticket
                existing_ticket = await _find_open_ticket_by_channel_id(
                    sender_id, Channel.TWITTER
                )

                if existing_ticket:
                    await db_service.add_message_to_ticket(
                        existing_ticket.ticket_id,
                        {
                            "sender_type": "customer",
                            "content": message_text,
                            "channel_specific_data": {
                                "twitter_dm_id": dm_event["id"]
                            }
                        }
                    )
                else:
                    ticket_request = TicketCreateRequest(
                        source=Source(
                            channel=Channel.TWITTER,
                            origin_platform_id=sender_id,
                            is_bot_handoff=False
                        ),
                        customer=Customer(
                            internal_id="",
                            channel_identity=sender_id
                        ),
                        subject=f"Twitter DM from {sender_id}",
                        initial_message=message_text,
                        priority=TicketPriority.MEDIUM
                    )

                    await _create_ticket_from_webhook(ticket_request)

        return {"status": "ok"}

    except Exception as e:
        logger.error(f"Twitter webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chatbot")
async def chatbot_handoff(request: Request):
    """
    Chatbot escalation endpoint
    Called when chatbot cannot resolve issue
    """
    try:
        data = await request.json()

        ticket_request = TicketCreateRequest(
            source=Source(
                channel=Channel.WEB_CHAT,
                origin_platform_id=data.get("session_id", ""),
                is_bot_handoff=True
            ),
            customer=Customer(
                internal_id="",
                name=data.get("customer_name"),
                primary_email=data.get("customer_email"),
                channel_identity=data.get("customer_email", data.get("session_id"))
            ),
            subject=data.get("subject", "Chatbot escalation"),
            initial_message=data.get("initial_message", ""),
            priority=data.get("priority", TicketPriority.MEDIUM),
            tags=["chatbot_handoff"] + data.get("tags", [])
        )

        ticket = await _create_ticket_from_webhook(ticket_request)

        return {
            "success": True,
            "ticket_id": ticket.ticket_id,
            "message": f"Ticket #{ticket.ticket_id} created. An agent will respond shortly."
        }

    except Exception as e:
        logger.error(f"Chatbot handoff error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Helper functions
async def _find_open_ticket_by_channel_id(channel_id: str, channel: Channel):
    """Find an open ticket for a given channel identity"""
    # Query tickets by customer with open status
    # This is a simplified version - in production, use a GSI on channel_identity
    result = await db_service.list_tickets(status="open", limit=100)

    for ticket in result["tickets"]:
        if (ticket.customer.channel_identity == channel_id and
            ticket.source.channel == channel and
            ticket.status in ["new", "open", "pending_customer"]):
            return ticket

    return None


async def _create_ticket_from_webhook(ticket_request: TicketCreateRequest):
    """Helper to create ticket from webhook data"""
    # Get or create customer
    customer_data = await db_service.get_or_create_customer(
        channel_identity=ticket_request.customer.channel_identity,
        channel=ticket_request.source.channel,
        name=ticket_request.customer.name,
        primary_email=ticket_request.customer.primary_email
    )

    # Prepare ticket data
    ticket_data = {
        "status": "new",
        "priority": ticket_request.priority,
        "tags": ticket_request.tags,
        "source": ticket_request.source.dict(),
        "customer": {
            "internal_id": customer_data["internal_id"],
            "name": customer_data.get("name"),
            "primary_email": customer_data.get("primary_email"),
            "channel_identity": customer_data["channel_identity"]
        },
        "subject": ticket_request.subject,
        "timeline": [{
            "sender_type": "customer",
            "content": ticket_request.initial_message,
            "content_type": "text",
            "visibility": "public"
        }]
    }

    ticket = await db_service.create_ticket(ticket_data)
    await kafka_producer.publish_ticket_created(ticket.dict())

    return ticket
