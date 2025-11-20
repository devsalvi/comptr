"""
Outbound messaging service
Routes agent replies back to the original channel
"""

import boto3
import logging
from typing import Dict, Any
import httpx
from app.config import settings
from app.models import Channel

logger = logging.getLogger(__name__)


class MessagingService:
    def __init__(self):
        self.secrets_client = boto3.client('secretsmanager', region_name=settings.AWS_REGION)
        self._secrets_cache = {}

    async def _get_secret(self, secret_name: str) -> str:
        """Retrieve secret from AWS Secrets Manager with caching"""
        if secret_name in self._secrets_cache:
            return self._secrets_cache[secret_name]

        try:
            response = self.secrets_client.get_secret_value(SecretId=secret_name)
            secret_value = response['SecretString']
            self._secrets_cache[secret_name] = secret_value
            return secret_value
        except Exception as e:
            logger.error(f"Failed to retrieve secret {secret_name}: {e}")
            return ""

    async def send_message(
        self,
        channel: Channel,
        recipient_id: str,
        message: str,
        origin_platform_id: str = None
    ) -> bool:
        """
        Route message to appropriate channel
        Returns True if successful
        """
        try:
            if channel == Channel.EMAIL:
                return await self._send_email(recipient_id, message)
            elif channel == Channel.FACEBOOK:
                return await self._send_facebook_message(recipient_id, message)
            elif channel == Channel.WHATSAPP:
                return await self._send_whatsapp_message(recipient_id, message)
            elif channel == Channel.TWITTER:
                return await self._send_twitter_dm(recipient_id, message, origin_platform_id)
            elif channel == Channel.WEB_CHAT:
                return await self._send_web_notification(recipient_id, message)
            else:
                logger.error(f"Unsupported channel: {channel}")
                return False

        except Exception as e:
            logger.error(f"Failed to send message via {channel}: {e}")
            return False

    async def _send_email(self, email: str, message: str) -> bool:
        """Send email via SendGrid"""
        sendgrid_key = await self._get_secret(settings.SENDGRID_API_KEY_SECRET)

        if not sendgrid_key:
            logger.warning("SendGrid API key not configured")
            return False

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {sendgrid_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "personalizations": [{
                        "to": [{"email": email}]
                    }],
                    "from": {"email": settings.FROM_EMAIL},
                    "subject": "Response from Support Team",
                    "content": [{
                        "type": "text/plain",
                        "value": message
                    }]
                }
            )

            if response.status_code == 202:
                logger.info(f"Email sent successfully to {email}")
                return True
            else:
                logger.error(f"SendGrid error: {response.status_code} - {response.text}")
                return False

    async def _send_facebook_message(self, recipient_id: str, message: str) -> bool:
        """Send message via Facebook Messenger API"""
        fb_token = await self._get_secret(settings.FACEBOOK_PAGE_ACCESS_TOKEN_SECRET)

        if not fb_token:
            logger.warning("Facebook token not configured")
            return False

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://graph.facebook.com/v18.0/me/messages",
                params={"access_token": fb_token},
                json={
                    "recipient": {"id": recipient_id},
                    "message": {"text": message}
                }
            )

            if response.status_code == 200:
                logger.info(f"Facebook message sent to {recipient_id}")
                return True
            else:
                logger.error(f"Facebook API error: {response.status_code} - {response.text}")
                return False

    async def _send_whatsapp_message(self, phone_number: str, message: str) -> bool:
        """Send message via WhatsApp Business API"""
        wa_token = await self._get_secret(settings.WHATSAPP_API_TOKEN_SECRET)

        if not wa_token:
            logger.warning("WhatsApp token not configured")
            return False

        # Using WhatsApp Cloud API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages",
                headers={
                    "Authorization": f"Bearer {wa_token}",
                    "Content-Type": "application/json"
                },
                json={
                    "messaging_product": "whatsapp",
                    "to": phone_number,
                    "type": "text",
                    "text": {"body": message}
                }
            )

            if response.status_code == 200:
                logger.info(f"WhatsApp message sent to {phone_number}")
                return True
            else:
                logger.error(f"WhatsApp API error: {response.status_code} - {response.text}")
                return False

    async def _send_twitter_dm(self, recipient_id: str, message: str, conversation_id: str = None) -> bool:
        """Send direct message via Twitter API v2"""
        twitter_token = await self._get_secret(settings.TWITTER_API_KEY_SECRET)

        if not twitter_token:
            logger.warning("Twitter token not configured")
            return False

        # Twitter API v2 DM endpoint
        async with httpx.AsyncClient() as client:
            payload = {
                "event": {
                    "type": "message_create",
                    "message_create": {
                        "target": {"recipient_id": recipient_id},
                        "message_data": {"text": message}
                    }
                }
            }

            response = await client.post(
                "https://api.twitter.com/2/dm_conversations/with/{}/messages".format(recipient_id),
                headers={
                    "Authorization": f"Bearer {twitter_token}",
                    "Content-Type": "application/json"
                },
                json=payload
            )

            if response.status_code in [200, 201]:
                logger.info(f"Twitter DM sent to {recipient_id}")
                return True
            else:
                logger.error(f"Twitter API error: {response.status_code} - {response.text}")
                return False

    async def _send_web_notification(self, session_id: str, message: str) -> bool:
        """
        Send notification for web chat
        This could publish to Kafka or use WebSockets
        """
        # For now, just log - implement based on your web chat architecture
        logger.info(f"Web notification for session {session_id}: {message}")
        return True


# Singleton instance
messaging_service = MessagingService()
