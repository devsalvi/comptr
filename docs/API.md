# API Documentation

Complete API reference for the Omnichannel Support System.

## Base URL

```
Development: http://localhost:8000
Production: https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod
```

## Authentication

Most endpoints require JWT authentication via AWS Cognito.

**Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Exception**: Webhook endpoints do not require authentication but should verify platform signatures.

## Endpoints

### Health & Status

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-19T10:00:00Z",
  "service": "omnichannel-support-api"
}
```

#### Readiness Check
```http
GET /api/ready
```

**Response:**
```json
{
  "ready": true,
  "timestamp": "2025-01-19T10:00:00Z"
}
```

---

### Tickets

#### Create Ticket
```http
POST /api/tickets/create
```

**Request Body:**
```json
{
  "source": {
    "channel": "whatsapp",
    "origin_platform_id": "+15550100",
    "is_bot_handoff": false
  },
  "customer": {
    "internal_id": "",
    "name": "John Doe",
    "primary_email": "john@example.com",
    "channel_identity": "+15550100"
  },
  "subject": "Cannot complete checkout",
  "initial_message": "I'm getting an error when trying to pay",
  "priority": "high",
  "tags": ["billing", "checkout"]
}
```

**Response:** `201 Created`
```json
{
  "ticket_id": "tkt_abc123xyz",
  "created_at": "2025-01-19T10:00:00Z",
  "updated_at": "2025-01-19T10:00:00Z",
  "status": "new",
  "priority": "high",
  "assigned_agent_id": null,
  "tags": ["billing", "checkout"],
  "source": {
    "channel": "whatsapp",
    "origin_platform_id": "+15550100",
    "is_bot_handoff": false
  },
  "customer": {
    "internal_id": "cust_xyz789",
    "name": "John Doe",
    "primary_email": "john@example.com",
    "channel_identity": "+15550100"
  },
  "subject": "Cannot complete checkout",
  "timeline": [
    {
      "message_id": "msg_001",
      "timestamp": "2025-01-19T10:00:00Z",
      "sender_type": "customer",
      "content": "I'm getting an error when trying to pay",
      "content_type": "text",
      "visibility": "public"
    }
  ]
}
```

#### Get Ticket
```http
GET /api/tickets/{ticket_id}
```

**Response:** `200 OK`
```json
{
  "ticket_id": "tkt_abc123xyz",
  "created_at": "2025-01-19T10:00:00Z",
  ...
}
```

**Error:** `404 Not Found`
```json
{
  "detail": "Ticket not found"
}
```

#### Update Ticket
```http
PUT /api/tickets/{ticket_id}
```

**Headers:** Requires authentication

**Request Body:**
```json
{
  "status": "resolved",
  "priority": "medium",
  "tags": ["billing", "resolved"]
}
```

**Response:** `200 OK`
```json
{
  "ticket_id": "tkt_abc123xyz",
  "status": "resolved",
  ...
}
```

#### Add Message to Ticket
```http
POST /api/tickets/{ticket_id}/message
```

**Headers:** Requires authentication

**Request Body:**
```json
{
  "content": "I've processed your refund. You should see it in 3-5 business days.",
  "sender_type": "agent",
  "visibility": "public",
  "attachments": []
}
```

**Response:** `200 OK`
```json
{
  "ticket_id": "tkt_abc123xyz",
  "timeline": [
    ...,
    {
      "message_id": "msg_002",
      "timestamp": "2025-01-19T10:05:00Z",
      "sender_type": "agent",
      "content": "I've processed your refund...",
      "visibility": "public",
      "agent_id": "agent-uuid"
    }
  ]
}
```

#### Get Ticket Status
```http
GET /api/tickets/{ticket_id}/status
```

**Purpose**: Lightweight endpoint for chatbot polling

**Response:** `200 OK`
```json
{
  "ticket_id": "tkt_abc123xyz",
  "status": "open",
  "last_updated": "2025-01-19T10:05:00Z",
  "has_agent_reply": true,
  "last_agent_message": {
    "message_id": "msg_002",
    "timestamp": "2025-01-19T10:05:00Z",
    "content": "I've processed your refund..."
  }
}
```

#### Assign Ticket
```http
PUT /api/tickets/{ticket_id}/assign?agent_id=agent-uuid
```

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "success": true,
  "ticket": {
    "ticket_id": "tkt_abc123xyz",
    "assigned_agent_id": "agent-uuid",
    ...
  }
}
```

#### List Tickets
```http
GET /api/tickets/
```

**Query Parameters:**
- `status` (optional): Filter by status (new, open, pending_customer, resolved, closed)
- `assigned_agent_id` (optional): Filter by assigned agent
- `page` (default: 1): Page number
- `page_size` (default: 20, max: 100): Items per page

**Example:**
```http
GET /api/tickets/?status=open&page=1&page_size=20
```

**Response:** `200 OK`
```json
{
  "tickets": [
    {
      "ticket_id": "tkt_abc123xyz",
      ...
    }
  ],
  "total_count": 45,
  "page": 1,
  "page_size": 20
}
```

---

### Webhooks

#### Facebook Messenger Webhook
```http
POST /api/webhooks/facebook
```

**Purpose**: Receives messages from Facebook Messenger

**Request Body:** (Facebook format)
```json
{
  "object": "page",
  "entry": [
    {
      "messaging": [
        {
          "sender": {"id": "1234567890"},
          "message": {
            "mid": "msg_id",
            "text": "I need help with my order"
          }
        }
      ]
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "status": "ok"
}
```

#### Facebook Webhook Verification
```http
GET /api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=TOKEN&hub.challenge=12345
```

**Response:** `200 OK`
```
12345
```

#### WhatsApp Webhook
```http
POST /api/webhooks/whatsapp
```

**Request Body:** (WhatsApp Cloud API format)
```json
{
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messages": [
              {
                "from": "+15550100",
                "id": "wamid.xyz",
                "text": {
                  "body": "Hello, I have a question"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "status": "ok"
}
```

#### Twitter Webhook
```http
POST /api/webhooks/twitter
```

**Request Body:** (Twitter format)
```json
{
  "direct_message_events": [
    {
      "id": "dm_id",
      "message_create": {
        "sender_id": "123456",
        "message_data": {
          "text": "Help with my account"
        }
      }
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "status": "ok"
}
```

#### Chatbot Handoff
```http
POST /api/webhooks/chatbot
```

**Purpose**: Called when chatbot escalates to human agent

**Request Body:**
```json
{
  "session_id": "chat_session_xyz",
  "customer_email": "user@example.com",
  "customer_name": "Jane Smith",
  "subject": "Account locked",
  "initial_message": "I've tried resetting my password 3 times but my account is still locked",
  "priority": "high",
  "tags": ["account_access"]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "ticket_id": "tkt_abc123xyz",
  "message": "Ticket #tkt_abc123xyz created. An agent will respond shortly."
}
```

---

### Customers

#### Get Customer Tickets
```http
GET /api/customers/{customer_id}/tickets?limit=20
```

**Headers:** Requires authentication

**Response:** `200 OK`
```json
[
  {
    "ticket_id": "tkt_001",
    "subject": "...",
    "status": "resolved",
    "created_at": "2025-01-15T10:00:00Z"
  },
  {
    "ticket_id": "tkt_002",
    "subject": "...",
    "status": "open",
    "created_at": "2025-01-19T09:00:00Z"
  }
]
```

#### Get Customer Profile
```http
GET /api/customers/{customer_id}
```

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "customer_id": "cust_xyz789",
  "status": "active"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "No updates provided"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid authentication token"
}
```

### 403 Forbidden
```json
{
  "detail": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Ticket not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limits

- **Authenticated endpoints**: 1000 requests/minute per user
- **Webhook endpoints**: 10,000 requests/minute (platform-dependent)

## Pagination

For list endpoints:
- Default page size: 20
- Maximum page size: 100
- Use `page` and `page_size` query parameters

## Webhooks Best Practices

1. **Verify signatures**: Implement platform-specific signature verification
2. **Return 200 quickly**: Process asynchronously to avoid timeouts
3. **Handle duplicates**: Use message IDs to detect duplicate deliveries
4. **Retry logic**: Platforms retry failed webhooks with exponential backoff

## Interactive Documentation

Visit these endpoints for interactive API documentation:
- **Swagger UI**: `{BASE_URL}/api/docs`
- **ReDoc**: `{BASE_URL}/api/redoc`
