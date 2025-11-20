"""
DynamoDB service layer for ticket management
"""

import boto3
from boto3.dynamodb.conditions import Key, Attr
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from app.config import settings
from app.models import Ticket, Customer, Message, TicketStatus


class DynamoDBService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
        self.tickets_table = self.dynamodb.Table(settings.DYNAMODB_TICKETS_TABLE)
        self.customers_table = self.dynamodb.Table(settings.DYNAMODB_CUSTOMERS_TABLE)

    # Ticket Operations
    async def create_ticket(self, ticket_data: Dict[str, Any]) -> Ticket:
        """Create a new support ticket"""
        ticket_id = f"tkt_{uuid.uuid4().hex[:12]}"
        timestamp = datetime.utcnow().isoformat()

        ticket = {
            "ticket_id": ticket_id,
            "created_at": timestamp,
            "updated_at": timestamp,
            "status": ticket_data.get("status", "new"),
            "priority": ticket_data.get("priority", "medium"),
            "assigned_agent_id": ticket_data.get("assigned_agent_id"),
            "tags": ticket_data.get("tags", []),
            "source": ticket_data["source"],
            "customer": ticket_data["customer"],
            "subject": ticket_data["subject"],
            "timeline": ticket_data.get("timeline", []),
            # GSI keys for querying
            "customer_id": ticket_data["customer"]["internal_id"],
            "status_timestamp": f"{ticket_data.get('status', 'new')}#{timestamp}"
        }

        self.tickets_table.put_item(Item=ticket)
        return Ticket(**ticket)

    async def get_ticket(self, ticket_id: str) -> Optional[Ticket]:
        """Retrieve a ticket by ID"""
        response = self.tickets_table.get_item(Key={"ticket_id": ticket_id})
        if "Item" in response:
            return Ticket(**response["Item"])
        return None

    async def update_ticket(self, ticket_id: str, updates: Dict[str, Any]) -> Optional[Ticket]:
        """Update ticket metadata"""
        timestamp = datetime.utcnow().isoformat()

        update_expression_parts = ["updated_at = :updated_at"]
        expression_attribute_values = {":updated_at": timestamp}

        if "status" in updates:
            update_expression_parts.append("status = :status")
            update_expression_parts.append("status_timestamp = :status_timestamp")
            expression_attribute_values[":status"] = updates["status"]
            expression_attribute_values[":status_timestamp"] = f"{updates['status']}#{timestamp}"

        if "priority" in updates:
            update_expression_parts.append("priority = :priority")
            expression_attribute_values[":priority"] = updates["priority"]

        if "assigned_agent_id" in updates:
            update_expression_parts.append("assigned_agent_id = :agent_id")
            expression_attribute_values[":agent_id"] = updates["assigned_agent_id"]

        if "tags" in updates:
            update_expression_parts.append("tags = :tags")
            expression_attribute_values[":tags"] = updates["tags"]

        update_expression = "SET " + ", ".join(update_expression_parts)

        response = self.tickets_table.update_item(
            Key={"ticket_id": ticket_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )

        if "Attributes" in response:
            return Ticket(**response["Attributes"])
        return None

    async def add_message_to_ticket(self, ticket_id: str, message: Dict[str, Any]) -> Optional[Ticket]:
        """Append a message to the ticket timeline"""
        message_id = f"msg_{uuid.uuid4().hex[:12]}"
        timestamp = datetime.utcnow().isoformat()

        message_item = {
            "message_id": message_id,
            "timestamp": timestamp,
            **message
        }

        response = self.tickets_table.update_item(
            Key={"ticket_id": ticket_id},
            UpdateExpression="SET timeline = list_append(if_not_exists(timeline, :empty_list), :message), updated_at = :updated_at",
            ExpressionAttributeValues={
                ":message": [message_item],
                ":empty_list": [],
                ":updated_at": timestamp
            },
            ReturnValues="ALL_NEW"
        )

        if "Attributes" in response:
            return Ticket(**response["Attributes"])
        return None

    async def list_tickets(
        self,
        status: Optional[str] = None,
        assigned_agent_id: Optional[str] = None,
        limit: int = 50,
        last_evaluated_key: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """List tickets with optional filters"""
        scan_kwargs = {"Limit": limit}

        if last_evaluated_key:
            scan_kwargs["ExclusiveStartKey"] = last_evaluated_key

        filter_expressions = []
        if status:
            filter_expressions.append(Attr("status").eq(status))
        if assigned_agent_id:
            filter_expressions.append(Attr("assigned_agent_id").eq(assigned_agent_id))

        if filter_expressions:
            combined_filter = filter_expressions[0]
            for expr in filter_expressions[1:]:
                combined_filter = combined_filter & expr
            scan_kwargs["FilterExpression"] = combined_filter

        response = self.tickets_table.scan(**scan_kwargs)

        return {
            "tickets": [Ticket(**item) for item in response.get("Items", [])],
            "last_evaluated_key": response.get("LastEvaluatedKey"),
            "count": response.get("Count", 0)
        }

    # Customer Operations
    async def get_or_create_customer(
        self,
        channel_identity: str,
        channel: str,
        name: Optional[str] = None,
        primary_email: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get existing customer or create new one"""
        # Try to find existing customer by channel_identity
        response = self.customers_table.query(
            IndexName="ChannelIdentityIndex",
            KeyConditionExpression=Key("channel_identity").eq(channel_identity)
        )

        if response["Items"]:
            return response["Items"][0]

        # Create new customer
        customer_id = f"cust_{uuid.uuid4().hex[:8]}"
        customer = {
            "internal_id": customer_id,
            "channel_identity": channel_identity,
            "name": name,
            "primary_email": primary_email,
            "channels": [channel],
            "created_at": datetime.utcnow().isoformat()
        }

        self.customers_table.put_item(Item=customer)
        return customer

    async def get_customer_tickets(self, customer_id: str, limit: int = 20) -> List[Ticket]:
        """Get all tickets for a specific customer"""
        response = self.tickets_table.query(
            IndexName="CustomerIndex",
            KeyConditionExpression=Key("customer_id").eq(customer_id),
            Limit=limit,
            ScanIndexForward=False  # Most recent first
        )

        return [Ticket(**item) for item in response.get("Items", [])]


# Singleton instance
db_service = DynamoDBService()
