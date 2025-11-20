"""
Kafka producer for publishing ticket events
Using aiokafka for async Python 3.12+ compatibility
"""

import json
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

# Import aiokafka only if available, for development without Kafka
try:
    from aiokafka import AIOKafkaProducer
    KAFKA_AVAILABLE = True
except ImportError:
    KAFKA_AVAILABLE = False
    logger.warning("aiokafka not available, Kafka events will be mocked")


class TicketEventProducer:
    def __init__(self):
        self.producer: Optional[Any] = None
        self._started = False

    async def _ensure_started(self):
        """Lazy initialization of Kafka producer"""
        if self._started:
            return

        if not KAFKA_AVAILABLE:
            logger.warning("Kafka not available, skipping initialization")
            self._started = True
            return

        if not settings.KAFKA_BOOTSTRAP_SERVERS:
            logger.warning("Kafka bootstrap servers not configured")
            self._started = True
            return

        try:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS.split(","),
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                security_protocol="SSL",  # AWS MSK requires SSL
            )
            await self.producer.start()
            logger.info("Kafka producer initialized successfully")
            self._started = True
        except Exception as e:
            logger.error(f"Failed to initialize Kafka producer: {e}")
            self.producer = None
            self._started = True

    async def publish_ticket_created(self, ticket_data: Dict[str, Any]):
        """Publish ticket creation event"""
        await self._ensure_started()

        if not self.producer:
            logger.debug("Kafka producer not available, skipping event publish")
            return

        event = {
            "event_type": "ticket.created",
            "ticket_id": ticket_data["ticket_id"],
            "customer_id": ticket_data["customer"]["internal_id"],
            "status": ticket_data["status"],
            "priority": ticket_data["priority"],
            "source": ticket_data["source"]["channel"],
            "timestamp": ticket_data["created_at"]
        }

        try:
            await self.producer.send_and_wait(settings.KAFKA_TOPIC_TICKETS, value=event)
            logger.info(f"Published ticket.created event for {ticket_data['ticket_id']}")
        except Exception as e:
            logger.error(f"Failed to publish ticket.created event: {e}")

    async def publish_message_added(self, ticket_id: str, message_data: Dict[str, Any]):
        """Publish new message event"""
        await self._ensure_started()

        if not self.producer:
            logger.debug("Kafka producer not available, skipping event publish")
            return

        event = {
            "event_type": "message.added",
            "ticket_id": ticket_id,
            "message_id": message_data["message_id"],
            "sender_type": message_data["sender_type"],
            "timestamp": message_data["timestamp"]
        }

        try:
            await self.producer.send_and_wait(settings.KAFKA_TOPIC_MESSAGES, value=event)
            logger.info(f"Published message.added event for ticket {ticket_id}")
        except Exception as e:
            logger.error(f"Failed to publish message.added event: {e}")

    async def publish_ticket_updated(self, ticket_id: str, updates: Dict[str, Any]):
        """Publish ticket update event"""
        await self._ensure_started()

        if not self.producer:
            return

        event = {
            "event_type": "ticket.updated",
            "ticket_id": ticket_id,
            "updates": updates,
            "timestamp": updates.get("updated_at")
        }

        try:
            await self.producer.send_and_wait(settings.KAFKA_TOPIC_TICKETS, value=event)
            logger.info(f"Published ticket.updated event for {ticket_id}")
        except Exception as e:
            logger.error(f"Failed to publish ticket.updated event: {e}")

    async def close(self):
        """Close producer connection"""
        if self.producer:
            await self.producer.stop()


# Singleton instance
kafka_producer = TicketEventProducer()
