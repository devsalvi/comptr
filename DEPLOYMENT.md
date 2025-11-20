# Deployment Guide

Complete guide to deploying the Omnichannel Support System to AWS.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured (`aws configure`)
- Node.js 16+ and npm
- Python 3.11+
- Serverless Framework (`npm install -g serverless`)

## Architecture Overview

```
┌─────────────────┐
│  AWS Amplify    │  ← React Frontend
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Gateway    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Lambda (API)   │  ← FastAPI Backend
└────┬────────────┘
     │
     ├──► DynamoDB (Tickets, Customers)
     ├──► Cognito (Authentication)
     ├──► MSK (Kafka Event Streaming)
     └──► Secrets Manager (API Keys)
```

## Phase 1: Deploy Backend Infrastructure

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install  # Install serverless plugins
pip install -r requirements.txt
```

### Step 2: Configure Serverless

Edit `serverless.yml` if needed:
- Set AWS region
- Adjust Lambda memory/timeout
- Configure VPC settings for MSK

### Step 3: Deploy Backend

```bash
# Deploy to dev environment
serverless deploy --stage dev

# Deploy to production
serverless deploy --stage prod
```

This will create:
- Lambda function for API
- API Gateway
- DynamoDB tables (tickets, customers)
- Cognito User Pool
- MSK Kafka cluster
- IAM roles and permissions

**Important**: Save the outputs:
- API Gateway URL
- Cognito User Pool ID
- Cognito Client ID

### Step 4: Create Admin User in Cognito

```bash
# Set variables from deployment output
USER_POOL_ID=<your-pool-id>
EMAIL=admin@example.com

# Create user
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username $EMAIL \
  --user-attributes Name=email,Value=$EMAIL Name=email_verified,Value=true \
  --temporary-password TempPassword123! \
  --message-action SUPPRESS

# Add to Agents group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id $USER_POOL_ID \
  --username $EMAIL \
  --group-name Agents
```

### Step 5: Store API Secrets in Secrets Manager

```bash
# Facebook Page Access Token
aws secretsmanager create-secret \
  --name support-api/facebook-token \
  --secret-string "your-facebook-page-token"

# WhatsApp API Token
aws secretsmanager create-secret \
  --name support-api/whatsapp-token \
  --secret-string "your-whatsapp-token"

# Twitter API Token
aws secretsmanager create-secret \
  --name support-api/twitter-token \
  --secret-string "your-twitter-token"

# SendGrid API Key
aws secretsmanager create-secret \
  --name support-api/sendgrid-key \
  --secret-string "your-sendgrid-api-key"
```

## Phase 2: Deploy Frontend

### Step 1: Configure Frontend Environment

Create `frontend/.env`:

```env
REACT_APP_COGNITO_USER_POOL_ID=<from-backend-deploy>
REACT_APP_COGNITO_CLIENT_ID=<from-backend-deploy>
REACT_APP_AWS_REGION=us-east-1
REACT_APP_API_URL=<api-gateway-url-from-backend>
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 3: Test Locally (Optional)

```bash
npm start
```

Visit http://localhost:3000 and test login.

### Step 4: Deploy to Amplify

#### Option A: Amplify Console (Recommended)

1. Go to AWS Amplify Console
2. Click "New App" → "Host web app"
3. Connect your Git repository
4. Configure build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/build
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

5. Add environment variables:
   - `REACT_APP_COGNITO_USER_POOL_ID`
   - `REACT_APP_COGNITO_CLIENT_ID`
   - `REACT_APP_AWS_REGION`
   - `REACT_APP_API_URL`

6. Save and deploy

#### Option B: Manual S3 + CloudFront

```bash
# Build
npm run build

# Create S3 bucket
aws s3 mb s3://support-agent-workbench

# Upload
aws s3 sync build/ s3://support-agent-workbench --delete

# Configure bucket for static website hosting
aws s3 website s3://support-agent-workbench \
  --index-document index.html \
  --error-document index.html
```

## Phase 3: Configure Webhooks

### Facebook Messenger

1. Go to Facebook Developer Portal
2. Create/select your app
3. Add Messenger product
4. Configure webhook:
   - URL: `https://<api-gateway-url>/api/webhooks/facebook`
   - Verify Token: (set in backend config)
   - Subscribe to: `messages`, `messaging_postbacks`

### WhatsApp Business

1. Go to WhatsApp Business API portal
2. Configure webhook:
   - URL: `https://<api-gateway-url>/api/webhooks/whatsapp`

### Twitter/X

1. Go to Twitter Developer Portal
2. Create app with Direct Message permissions
3. Configure webhook:
   - URL: `https://<api-gateway-url>/api/webhooks/twitter`

## Phase 4: Verification

### Test Backend API

```bash
API_URL=<your-api-gateway-url>

# Health check
curl $API_URL/api/health

# Expected: {"status":"healthy",...}
```

### Test Authentication

1. Visit frontend URL
2. Sign in with admin credentials
3. Change password on first login
4. Verify dashboard loads

### Test Ticket Creation

```bash
# Create test ticket via chatbot endpoint
curl -X POST $API_URL/api/webhooks/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-123",
    "customer_email": "test@example.com",
    "subject": "Test ticket",
    "initial_message": "This is a test"
  }'

# Should return: {"success":true,"ticket_id":"tkt_..."}
```

### Test Ticket Retrieval

1. Sign in to Agent Workbench
2. Verify test ticket appears in inbox
3. Click ticket to view details
4. Send a reply
5. Update status

## Phase 5: Monitoring & Logging

### CloudWatch Logs

```bash
# View Lambda logs
serverless logs -f api --tail --stage prod

# Or via AWS CLI
aws logs tail /aws/lambda/omnichannel-support-api-prod-api --follow
```

### CloudWatch Metrics

Monitor:
- Lambda invocations, errors, duration
- API Gateway 4xx/5xx errors
- DynamoDB throttles
- Kafka consumer lag

### Set Up Alarms

```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name api-high-error-rate \
  --alarm-description "Alert when API error rate > 5%" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 0.05 \
  --comparison-operator GreaterThanThreshold
```

## Cost Optimization

### Development Environment

- Use DynamoDB on-demand billing
- MSK: Use t3.small brokers (2 nodes minimum)
- Lambda: No provisioned concurrency
- API Gateway: No caching

**Estimated cost**: $50-100/month

### Production Environment

- DynamoDB: Consider provisioned capacity if predictable load
- MSK: Scale broker size based on throughput
- Lambda: Add provisioned concurrency for critical functions
- API Gateway: Enable caching

**Estimated cost**: Scales with usage

## Rollback Procedure

### Backend Rollback

```bash
# List deployments
serverless deploy list --stage prod

# Rollback to previous
serverless rollback --timestamp <timestamp> --stage prod
```

### Frontend Rollback

Via Amplify Console:
1. Go to app → Deployments
2. Select previous deployment
3. Click "Redeploy this version"

## Security Checklist

- [ ] Cognito password policy enforced
- [ ] API Gateway has rate limiting
- [ ] Lambda functions use least-privilege IAM roles
- [ ] Secrets stored in Secrets Manager (not environment variables)
- [ ] DynamoDB tables have point-in-time recovery enabled
- [ ] CloudTrail logging enabled
- [ ] VPC security groups properly configured for MSK
- [ ] HTTPS enforced on all endpoints
- [ ] Webhook signature verification implemented

## Troubleshooting

### "Internal Server Error" from API

Check Lambda logs:
```bash
serverless logs -f api --tail --stage prod
```

### Frontend can't connect to backend

1. Check CORS settings in backend
2. Verify API Gateway URL in frontend config
3. Check browser console for errors

### Authentication failures

1. Verify Cognito User Pool ID and Client ID
2. Ensure user is confirmed
3. Check user is in "Agents" group

### Webhook not receiving events

1. Verify webhook URL is publicly accessible
2. Check platform's webhook dashboard for errors
3. Test with platform's webhook tester tool

## Maintenance

### Backup DynamoDB

```bash
# Enable point-in-time recovery
aws dynamodb update-continuous-backups \
  --table-name support-tickets-prod \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

### Update Dependencies

Backend:
```bash
cd backend
pip install -U -r requirements.txt
serverless deploy --stage prod
```

Frontend:
```bash
cd frontend
npm update
# Amplify will auto-deploy if connected to Git
```

## Support

For issues:
1. Check CloudWatch Logs
2. Review deployment outputs
3. Verify all environment variables are set
4. Check AWS service quotas
