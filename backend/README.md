# Backend API - Omnichannel Support System

FastAPI-based backend designed for AWS Lambda deployment.

## Architecture

- **Framework**: FastAPI with Mangum adapter for Lambda
- **Database**: AWS DynamoDB
- **Authentication**: AWS Cognito
- **Event Streaming**: Apache Kafka (AWS MSK)
- **Deployment**: Serverless Framework

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── models/              # Pydantic data models
│   │   ├── ticket.py        # Ticket, Customer, Message models
│   │   └── __init__.py
│   ├── routes/              # API endpoints
│   │   ├── tickets.py       # Ticket CRUD operations
│   │   ├── webhooks.py      # Social media webhook receivers
│   │   ├── customers.py     # Customer management
│   │   ├── health.py        # Health checks
│   │   └── __init__.py
│   ├── services/            # Business logic layer
│   │   ├── dynamodb.py      # DynamoDB operations
│   │   ├── kafka_producer.py # Kafka event publishing
│   │   └── __init__.py
│   └── utils/               # Helper functions
│       ├── auth.py          # Cognito JWT verification
│       └── __init__.py
├── requirements.txt         # Python dependencies
└── serverless.yml          # AWS deployment configuration
```

## API Endpoints

### Tickets
- `POST /api/tickets/create` - Create new ticket
- `GET /api/tickets/{id}` - Get ticket details
- `PUT /api/tickets/{id}` - Update ticket metadata
- `POST /api/tickets/{id}/message` - Add message to ticket
- `GET /api/tickets/{id}/status` - Get ticket status (for chatbot polling)
- `PUT /api/tickets/{id}/assign` - Assign ticket to agent
- `GET /api/tickets/` - List tickets with filters

### Webhooks
- `POST /api/webhooks/facebook` - Facebook Messenger webhook
- `POST /api/webhooks/whatsapp` - WhatsApp Business webhook
- `POST /api/webhooks/twitter` - Twitter/X DM webhook
- `POST /api/webhooks/chatbot` - Chatbot handoff endpoint

### Customers
- `GET /api/customers/{id}/tickets` - Get customer ticket history
- `GET /api/customers/{id}` - Get customer profile

### Health
- `GET /api/health` - Health check
- `GET /api/ready` - Readiness check

## Local Development

### Prerequisites
- Python 3.11+
- AWS CLI configured
- Docker (for local DynamoDB testing)

### Setup

1. Create virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```env
AWS_REGION=us-east-1
DYNAMODB_TICKETS_TABLE=support-tickets-dev
DYNAMODB_CUSTOMERS_TABLE=support-customers-dev
COGNITO_USER_POOL_ID=your-pool-id
COGNITO_APP_CLIENT_ID=your-client-id
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
DEBUG=True
```

4. Run locally:
```bash
uvicorn app.main:app --reload --port 8000
```

5. Access API docs:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Testing

```bash
pytest tests/ -v --cov=app
```

## Deployment

### Prerequisites
- Serverless Framework installed: `npm install -g serverless`
- AWS credentials configured
- Serverless plugins: `npm install`

### Deploy to AWS

1. Install Serverless Python Requirements plugin:
```bash
npm install --save-dev serverless-python-requirements
```

2. Deploy:
```bash
# Deploy to dev
serverless deploy --stage dev

# Deploy to production
serverless deploy --stage prod
```

3. View logs:
```bash
serverless logs -f api --tail
```

4. Remove stack:
```bash
serverless remove --stage dev
```

## DynamoDB Table Schemas

### Tickets Table
- **Primary Key**: `ticket_id` (String)
- **GSI**: `CustomerIndex` - `customer_id` (Hash), `status_timestamp` (Range)
- **Attributes**: status, priority, assigned_agent_id, tags, source, customer, subject, timeline

### Customers Table
- **Primary Key**: `internal_id` (String)
- **GSI**: `ChannelIdentityIndex` - `channel_identity` (Hash)
- **Attributes**: name, primary_email, channels, created_at

## Authentication

All agent-facing endpoints require JWT token from AWS Cognito:

```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  https://api.example.com/api/tickets
```

Webhook endpoints do not require authentication but should verify webhook signatures.

## Kafka Topics

- `support-tickets` - Ticket lifecycle events (created, updated, resolved)
- `support-messages` - New message events

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AWS_REGION` | AWS region | Yes |
| `DYNAMODB_TICKETS_TABLE` | Tickets table name | Yes |
| `DYNAMODB_CUSTOMERS_TABLE` | Customers table name | Yes |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID | Yes |
| `COGNITO_APP_CLIENT_ID` | Cognito App Client ID | Yes |
| `KAFKA_BOOTSTRAP_SERVERS` | MSK broker endpoints | Yes |
| `ALLOWED_ORIGINS` | CORS allowed origins | No |

## Security

- All endpoints use HTTPS
- Agent authentication via AWS Cognito JWT
- Webhook signature verification (implement per platform)
- Secrets stored in AWS Secrets Manager
- IAM roles with least privilege

## Performance Considerations

- DynamoDB on-demand billing for variable workloads
- Lambda cold start optimization via provisioned concurrency (if needed)
- API Gateway caching for read-heavy endpoints
- Kafka batching for high-throughput scenarios
