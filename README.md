# Omnichannel Customer Case Management System

A comprehensive support ticketing system that centralizes customer interactions from multiple channels (chatbots, social media, email, web) into a unified Agent Workbench.

## Architecture

### Tech Stack
- **Backend**: Python FastAPI on AWS Lambda
- **Database**: AWS DynamoDB
- **Frontend**: React hosted on AWS Amplify
- **Authentication**: AWS Cognito
- **Event Streaming**: Apache Kafka (AWS MSK)
- **API Gateway**: AWS API Gateway

### System Layers
1. **Interaction Layer**: Chatbots, Facebook, Twitter/X, WhatsApp, Email
2. **Middleware Layer**: Webhooks and APIs that normalize incoming data
3. **Core Layer**: DynamoDB, business logic, and Agent Dashboard

## Project Structure

```
comprt/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── main.py      # FastAPI entry point
│   │   ├── models/      # Pydantic models
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── utils/       # Helper functions
│   │   └── config.py    # Configuration
│   ├── requirements.txt
│   └── serverless.yml   # Serverless Framework config
├── frontend/            # React application
│   ├── src/
│   └── package.json
├── infrastructure/      # AWS CDK/CloudFormation
└── docs/               # Documentation
```

## Core Features

- **Unified Inbox**: Single view for tickets from all channels
- **Smart Routing**: Automatic ticket assignment and prioritization
- **Bot Handoff**: Seamless escalation from chatbot to human agent
- **Omnichannel Reply**: Respond to customers on their preferred channel
- **Timeline View**: Complete conversation history across all touchpoints

## Getting Started

See individual README files in `/backend` and `/frontend` directories for setup instructions.

## Deployment

Deployments are managed through:
- Backend: Serverless Framework to AWS Lambda
- Frontend: AWS Amplify
- Infrastructure: AWS CDK

## Environment Setup

Required AWS services:
- DynamoDB (3 tables: Tickets, Customers, Conversations)
- Lambda Functions
- API Gateway
- Cognito User Pool
- MSK (Managed Kafka)
- S3 (attachments)
