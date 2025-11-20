# System Architecture

Detailed architecture documentation for the Omnichannel Customer Support System.

## High-Level Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     INTERACTION LAYER                             │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│ Chatbot  │ Facebook │ WhatsApp │ Twitter  │  Email   │Web Chat  │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┘
     │          │          │          │          │          │
     └──────────┴──────────┴──────────┴──────────┴──────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                     MIDDLEWARE LAYER                              │
│  ┌────────────────────────────────────────────────────────┐      │
│  │         API Gateway + Lambda (Webhook Receivers)        │      │
│  └────────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                       CORE LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   DynamoDB   │  │     MSK      │  │   Cognito    │           │
│  │   (Tickets)  │  │   (Kafka)    │  │    (Auth)    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                             │
│  ┌────────────────────────────────────────────────────────┐      │
│  │        React App (Agent Workbench) on Amplify          │      │
│  └────────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Interaction Layer (Sources)

External platforms where customers initiate support requests.

#### Supported Channels:
- **Chatbot**: Web-based chat interface, escalates to agents
- **Facebook Messenger**: Receives messages via webhook
- **WhatsApp Business**: Cloud API integration
- **Twitter/X**: Direct Messages
- **Email**: Via SendGrid inbound webhook
- **Instagram**: Direct Messages (similar to Facebook)

### 2. Middleware Layer (Integration)

#### API Gateway
- RESTful API endpoints
- HTTPS only
- CORS enabled for frontend
- Request validation
- Rate limiting

#### Lambda Functions
Serverless compute for:
- **Webhook Receivers**: Normalize incoming data from platforms
- **CRUD Operations**: Ticket management
- **Business Logic**: Routing, assignment, notifications

#### Key Endpoints:

**Webhooks:**
- `POST /api/webhooks/facebook`
- `POST /api/webhooks/whatsapp`
- `POST /api/webhooks/twitter`
- `POST /api/webhooks/chatbot`

**Tickets:**
- `POST /api/tickets/create`
- `GET /api/tickets/{id}`
- `PUT /api/tickets/{id}`
- `POST /api/tickets/{id}/message`
- `GET /api/tickets/{id}/status` (for chatbot polling)

### 3. Core Layer (System)

#### DynamoDB

**Tickets Table:**
```
Primary Key: ticket_id (String)
GSI: CustomerIndex
  - PK: customer_id
  - SK: status_timestamp

Attributes:
- created_at, updated_at
- status, priority
- assigned_agent_id
- tags[]
- source {channel, origin_platform_id, is_bot_handoff}
- customer {internal_id, name, email, channel_identity}
- subject
- timeline[] (embedded messages)
```

**Customers Table:**
```
Primary Key: internal_id (String)
GSI: ChannelIdentityIndex
  - PK: channel_identity

Attributes:
- name
- primary_email
- channels[] (all platforms customer has used)
- created_at
```

#### MSK (Kafka)

Event streaming for real-time updates and decoupling.

**Topics:**
- `support-tickets`: Ticket lifecycle events (created, updated, resolved)
- `support-messages`: New message events

**Event Schema:**
```json
{
  "event_type": "ticket.created",
  "ticket_id": "tkt_abc123",
  "customer_id": "cust_xyz",
  "status": "new",
  "priority": "high",
  "source": "whatsapp",
  "timestamp": "2025-01-01T12:00:00Z"
}
```

**Consumers:**
- Agent Workbench (polls for updates)
- Analytics service (future)
- Notification service (future)

#### Cognito

User authentication and authorization.

**User Pool:**
- Email-based login
- Password policy enforced
- Groups: "Agents", "Supervisors" (future)

**JWT Claims:**
```json
{
  "sub": "agent-uuid",
  "email": "agent@company.com",
  "cognito:groups": ["Agents"]
}
```

#### Secrets Manager

Secure storage for:
- Facebook Page Access Token
- WhatsApp API Token
- Twitter API credentials
- SendGrid API Key

### 4. Presentation Layer

#### React Agent Workbench

**Features:**
- Unified inbox (all channels)
- Ticket detail view
- Message timeline
- Reply interface (public/internal)
- Status management
- Real-time polling

**Authentication Flow:**
1. User visits Amplify-hosted frontend
2. Cognito Authenticator component shows login
3. User signs in → receives JWT
4. JWT stored in session
5. All API calls include JWT in Authorization header
6. Backend validates JWT with Cognito

## Data Flow

### Incoming Message Flow

```
1. Customer sends message on WhatsApp
   ↓
2. WhatsApp API → POST /api/webhooks/whatsapp
   ↓
3. Lambda webhook receiver validates & normalizes
   ↓
4. Check: Does customer have open ticket?
   - Yes → Add message to existing ticket
   - No → Create new ticket
   ↓
5. Write to DynamoDB
   ↓
6. Publish event to Kafka (support-messages topic)
   ↓
7. Agent Workbench polls API → sees new message
```

### Outbound Reply Flow

```
1. Agent types reply in Workbench
   ↓
2. POST /api/tickets/{id}/message
   ↓
3. Lambda adds message to DynamoDB timeline
   ↓
4. Lambda calls Messaging Service
   ↓
5. Messaging Service routes based on source.channel:
   - WhatsApp → WhatsApp Cloud API
   - Facebook → Graph API
   - Email → SendGrid
   - Twitter → Twitter API v2
   ↓
6. Message delivered to customer
   ↓
7. Publish event to Kafka
```

### Chatbot Handoff Flow

```
1. Chatbot detects frustration or complex issue
   ↓
2. Chatbot collects: email, subject, description
   ↓
3. POST /api/webhooks/chatbot
   {
     "source": "web_chat",
     "customer_email": "user@example.com",
     "subject": "Cannot login",
     "initial_message": "...",
     "session_id": "xyz"
   }
   ↓
4. Lambda creates ticket with is_bot_handoff: true
   ↓
5. Returns ticket_id to chatbot
   ↓
6. Chatbot: "Ticket #12345 created. Agent will email you."
   ↓
7. Agent sees ticket in Workbench, replies
   ↓
8. Chatbot can poll GET /api/tickets/{id}/status
```

## Scalability Considerations

### Horizontal Scaling
- Lambda: Auto-scales to thousands of concurrent executions
- API Gateway: Handles 10,000 requests/second per account
- DynamoDB: On-demand scales automatically
- Amplify: CDN edge locations worldwide

### Performance Optimizations
- DynamoDB GSI for fast customer lookups
- Kafka for async processing
- Frontend: React Query caching
- API: 10-second polling (configurable)

### Limits & Quotas
- Lambda concurrent executions: 1000 (default, can increase)
- DynamoDB: 40,000 read/write capacity units per table
- MSK: 2 brokers minimum (dev), 3+ (prod)
- API Gateway: 10,000 RPS (can request increase)

## Security Architecture

### Authentication
- Agents: AWS Cognito (JWT tokens)
- Webhooks: Platform-specific signature verification

### Authorization
- API endpoints check Cognito groups
- Agents group can access all tickets
- Future: Row-level security for assigned tickets

### Data Encryption
- In transit: TLS 1.2+ everywhere
- At rest:
  - DynamoDB: AWS-managed encryption
  - MSK: Encryption enabled
  - Secrets Manager: KMS encryption

### Network Security
- API Gateway: Public internet
- Lambda: VPC for MSK access
- MSK: Private subnets only
- No direct database access from internet

## Monitoring & Observability

### CloudWatch Metrics
- Lambda invocations, errors, duration
- API Gateway latency, 4xx/5xx errors
- DynamoDB consumed capacity, throttles
- Kafka consumer lag

### CloudWatch Logs
- Lambda execution logs (JSON structured)
- API Gateway access logs
- Application logs (Python logging)

### X-Ray Tracing (Future)
- End-to-end request tracing
- Performance bottleneck identification

## Disaster Recovery

### Backup Strategy
- DynamoDB: Point-in-time recovery (35 days)
- Code: Git repository (GitHub/GitLab)
- Infrastructure: CloudFormation/Serverless templates

### RTO/RPO
- RTO (Recovery Time Objective): < 1 hour
- RPO (Recovery Point Objective): < 5 minutes (DynamoDB PITR)

### Multi-Region (Future)
- DynamoDB Global Tables
- Multi-region API Gateway
- Route 53 failover routing

## Cost Structure

### Per-Request Costs
- API Gateway: $3.50 per million requests
- Lambda: $0.20 per million requests + compute time
- DynamoDB: On-demand pricing per request

### Monthly Fixed Costs
- MSK: ~$150/month (t3.small x2 brokers)
- Cognito: Free tier (50,000 MAUs)
- Amplify: ~$15/month (build + hosting)

### Scaling Costs
Costs scale linearly with:
- Number of support tickets created
- Number of messages exchanged
- Number of agents (Cognito users)

## Integration Points

### Future Integrations
- **CRM Systems**: Salesforce, HubSpot
- **Analytics**: Export to Redshift, BigQuery
- **AI/ML**: Sentiment analysis, auto-categorization
- **Notifications**: SMS via SNS, push notifications
- **Voice**: Amazon Connect integration

## Development Workflow

```
Developer → Git Push → CI/CD Pipeline
                            ↓
            ┌───────────────┴───────────────┐
            ▼                               ▼
    Backend Deploy (Serverless)    Frontend Deploy (Amplify)
            ↓                               ↓
    Run Integration Tests          Visual Regression Tests
            ↓                               ↓
    Deploy to Staging             Deploy to Staging
            ↓                               ↓
    Manual QA & Approval          Manual QA & Approval
            ↓                               ↓
    Deploy to Production          Deploy to Production
```
