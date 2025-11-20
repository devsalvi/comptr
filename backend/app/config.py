"""
Application configuration using Pydantic settings
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Omnichannel Support API"
    DEBUG: bool = False

    # AWS
    AWS_REGION: str = "us-east-1"
    DYNAMODB_TICKETS_TABLE: str = "support-tickets"
    DYNAMODB_CUSTOMERS_TABLE: str = "support-customers"
    DYNAMODB_CONVERSATIONS_TABLE: str = "support-conversations"

    # Cognito
    COGNITO_USER_POOL_ID: str = ""
    COGNITO_APP_CLIENT_ID: str = ""
    COGNITO_REGION: str = "us-east-1"

    # Kafka (MSK)
    KAFKA_BOOTSTRAP_SERVERS: str = ""
    KAFKA_TOPIC_TICKETS: str = "support-tickets"
    KAFKA_TOPIC_MESSAGES: str = "support-messages"
    KAFKA_CONSUMER_GROUP: str = "support-api"

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://*.amplifyapp.com"
    ]

    # Social Media API Keys (stored in AWS Secrets Manager)
    FACEBOOK_PAGE_ACCESS_TOKEN_SECRET: str = ""
    WHATSAPP_API_TOKEN_SECRET: str = ""
    TWITTER_API_KEY_SECRET: str = ""

    # Email
    SENDGRID_API_KEY_SECRET: str = ""
    FROM_EMAIL: str = "support@example.com"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
