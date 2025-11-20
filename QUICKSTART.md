# Quick Start Guide

Get the Omnichannel Support System running locally in 15 minutes.

## Prerequisites

- Python 3.11+
- Node.js 16+
- AWS CLI configured
- Git

## Local Development Setup

### 1. Clone and Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Backend Environment

Create `backend/.env`:

```env
# Development settings
DEBUG=True
AWS_REGION=us-east-1

# DynamoDB Local (or use real tables)
DYNAMODB_TICKETS_TABLE=support-tickets-dev
DYNAMODB_CUSTOMERS_TABLE=support-customers-dev

# Cognito (leave empty for mock auth in dev)
COGNITO_USER_POOL_ID=
COGNITO_APP_CLIENT_ID=

# Kafka (leave empty for mock in dev)
KAFKA_BOOTSTRAP_SERVERS=

# CORS
ALLOWED_ORIGINS=["http://localhost:3000"]
```

### 3. Run Backend API

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Backend now running at: http://localhost:8000

View API docs: http://localhost:8000/api/docs

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Install Tailwind forms plugin
npm install @tailwindcss/forms
```

### 5. Configure Frontend Environment

Create `frontend/.env`:

```env
REACT_APP_COGNITO_USER_POOL_ID=
REACT_APP_COGNITO_CLIENT_ID=
REACT_APP_AWS_REGION=us-east-1
REACT_APP_API_URL=http://localhost:8000
```

### 6. Run Frontend

```bash
cd frontend
npm start
```

Frontend now running at: http://localhost:3000

## Test the System

### Option 1: Create Ticket via API

```bash
curl -X POST http://localhost:8000/api/tickets/create \
  -H "Content-Type: application/json" \
  -d '{
    "source": {
      "channel": "web_chat",
      "origin_platform_id": "session-123",
      "is_bot_handoff": true
    },
    "customer": {
      "internal_id": "",
      "name": "John Doe",
      "primary_email": "john@example.com",
      "channel_identity": "john@example.com"
    },
    "subject": "Cannot access my account",
    "initial_message": "I have been trying to login but keep getting an error message.",
    "priority": "high"
  }'
```

Response:
```json
{
  "ticket_id": "tkt_abc123xyz",
  "status": "new",
  "created_at": "2025-01-19T10:00:00Z",
  ...
}
```

### Option 2: Use Swagger UI

1. Open http://localhost:8000/api/docs
2. Click "POST /api/tickets/create"
3. Click "Try it out"
4. Fill in the request body
5. Click "Execute"

### Option 3: Chatbot Handoff Simulation

```bash
curl -X POST http://localhost:8000/api/webhooks/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "chat-session-456",
    "customer_email": "sarah@example.com",
    "customer_name": "Sarah Connor",
    "subject": "Billing issue",
    "initial_message": "I was charged twice for my subscription",
    "priority": "high"
  }'
```

### View Tickets in Dashboard

1. Go to http://localhost:3000
2. Since Cognito is not configured, authentication will use mock mode
3. You should see the created tickets in the dashboard
4. Click on a ticket to view details
5. Add a reply (it won't actually send since integrations aren't configured)

## Using Real AWS Services (Optional)

### Setup DynamoDB Tables

```bash
# Create tickets table
aws dynamodb create-table \
  --table-name support-tickets-dev \
  --attribute-definitions \
    AttributeName=ticket_id,AttributeType=S \
    AttributeName=customer_id,AttributeType=S \
    AttributeName=status_timestamp,AttributeType=S \
  --key-schema AttributeName=ticket_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "[{
      \"IndexName\": \"CustomerIndex\",
      \"KeySchema\": [
        {\"AttributeName\": \"customer_id\", \"KeyType\": \"HASH\"},
        {\"AttributeName\": \"status_timestamp\", \"KeyType\": \"RANGE\"}
      ],
      \"Projection\": {\"ProjectionType\": \"ALL\"}
    }]"

# Create customers table
aws dynamodb create-table \
  --table-name support-customers-dev \
  --attribute-definitions \
    AttributeName=internal_id,AttributeType=S \
    AttributeName=channel_identity,AttributeType=S \
  --key-schema AttributeName=internal_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "[{
      \"IndexName\": \"ChannelIdentityIndex\",
      \"KeySchema\": [{\"AttributeName\": \"channel_identity\", \"KeyType\": \"HASH\"}],
      \"Projection\": {\"ProjectionType\": \"ALL\"}
    }]"
```

### Setup Cognito User Pool

```bash
# Create user pool
aws cognito-idp create-user-pool \
  --pool-name support-agents-dev \
  --auto-verified-attributes email \
  --username-attributes email

# Note the UserPoolId from output

# Create app client
aws cognito-idp create-user-pool-client \
  --user-pool-id <USER_POOL_ID> \
  --client-name support-web-client

# Note the ClientId from output

# Create agents group
aws cognito-idp create-group \
  --user-pool-id <USER_POOL_ID> \
  --group-name Agents

# Create test user
aws cognito-idp admin-create-user \
  --user-pool-id <USER_POOL_ID> \
  --username test@example.com \
  --user-attributes Name=email,Value=test@example.com \
  --temporary-password TempPass123!

# Add to agents group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <USER_POOL_ID> \
  --username test@example.com \
  --group-name Agents
```

Update `.env` files with the UserPoolId and ClientId.

## Common Issues

### Backend won't start

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Fix**: Make sure virtual environment is activated and dependencies installed:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend won't start

**Error**: `Cannot find module 'react'`

**Fix**: Install dependencies:
```bash
cd frontend
npm install
```

### CORS errors in browser

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Fix**: Ensure backend `ALLOWED_ORIGINS` includes `http://localhost:3000`

### Authentication not working

**Issue**: Can't log in to frontend

**Fix**: If Cognito is not configured, the backend uses mock authentication. Check browser console for errors.

## Next Steps

1. **Add Real Integrations**: Configure Facebook, WhatsApp webhooks
2. **Deploy to AWS**: Follow `DEPLOYMENT.md`
3. **Customize UI**: Modify React components in `frontend/src/`
4. **Add Features**: Implement custom logic in `backend/app/`

## Project Structure Reference

```
comprt/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── config.py         # Configuration
│   │   ├── models/           # Pydantic models
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   └── utils/            # Helpers
│   ├── requirements.txt
│   └── serverless.yml        # AWS deployment
│
├── frontend/
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
│
├── docs/
│   └── ARCHITECTURE.md       # System architecture
├── DEPLOYMENT.md             # AWS deployment guide
└── README.md                 # Project overview
```

## Documentation

- **README.md**: Project overview
- **DEPLOYMENT.md**: Full AWS deployment guide
- **docs/ARCHITECTURE.md**: System architecture details
- **backend/README.md**: Backend API documentation
- **frontend/README.md**: Frontend setup and deployment

## Getting Help

1. Check the documentation files listed above
2. Review CloudWatch logs for backend errors
3. Check browser console for frontend errors
4. Verify environment variables are set correctly
5. Ensure AWS credentials are configured
