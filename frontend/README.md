# Agent Workbench - Frontend

React-based agent dashboard for the omnichannel support system.

## Features

- **Unified Inbox**: View tickets from all channels in one place
- **Real-time Updates**: Auto-refresh every 10 seconds for new messages
- **Channel Indicators**: Visual badges showing the source (Email, WhatsApp, Facebook, etc.)
- **Conversation Timeline**: Complete message history with agent/customer/bot indicators
- **Quick Replies**: Send public replies or internal notes
- **Status Management**: Update ticket status and priority
- **Authentication**: Secure login via AWS Cognito

## Tech Stack

- **React 18** with TypeScript
- **AWS Amplify** for authentication and API integration
- **TailwindCSS** for styling
- **React Query** for data fetching and caching
- **React Router** for navigation
- **Axios** for HTTP requests

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   ├── client.ts        # Axios instance with auth
│   │   └── tickets.ts       # Ticket API methods
│   ├── components/
│   │   ├── Layout.tsx       # Main layout with header
│   │   ├── ChannelBadge.tsx # Channel indicator
│   │   ├── StatusBadge.tsx  # Status indicator
│   │   ├── PriorityBadge.tsx # Priority indicator
│   │   └── MessageBubble.tsx # Message display
│   ├── pages/
│   │   ├── Dashboard.tsx    # Ticket list view
│   │   └── TicketDetail.tsx # Individual ticket view
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Install Tailwind CSS forms plugin:
```bash
npm install @tailwindcss/forms
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your AWS configuration:
```env
REACT_APP_COGNITO_USER_POOL_ID=your-pool-id
REACT_APP_COGNITO_CLIENT_ID=your-client-id
REACT_APP_AWS_REGION=us-east-1
REACT_APP_API_URL=http://localhost:8000
```

### Development

Run the development server:
```bash
npm start
```

The app will open at http://localhost:3000

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Deployment to AWS Amplify

### Option 1: Amplify Console (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket

2. Go to AWS Amplify Console

3. Click "New App" → "Host web app"

4. Connect your repository

5. Configure build settings:
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

6. Add environment variables in Amplify Console:
   - `REACT_APP_COGNITO_USER_POOL_ID`
   - `REACT_APP_COGNITO_CLIENT_ID`
   - `REACT_APP_AWS_REGION`
   - `REACT_APP_API_URL`

7. Deploy!

### Option 2: Manual Deployment

1. Build the app:
```bash
npm run build
```

2. Deploy using Amplify CLI:
```bash
amplify publish
```

## Key Components

### Dashboard (`src/pages/Dashboard.tsx`)
- Lists all support tickets
- Filter by status
- Auto-refresh every 10 seconds
- Click to view ticket details

### TicketDetail (`src/pages/TicketDetail.tsx`)
- Full conversation timeline
- Send public replies or internal notes
- Update ticket status
- Real-time message polling

### Authentication
- Handled by AWS Amplify Authenticator
- JWT tokens automatically attached to API requests
- Sign in/sign out functionality

## API Integration

The app communicates with the backend API using Axios:

- **Base URL**: Configured via `REACT_APP_API_URL`
- **Authentication**: JWT token from Cognito in `Authorization` header
- **Endpoints**:
  - `GET /api/tickets/` - List tickets
  - `GET /api/tickets/:id` - Get ticket details
  - `PUT /api/tickets/:id` - Update ticket
  - `POST /api/tickets/:id/message` - Add message

## Styling

Uses TailwindCSS with custom configuration:

- Responsive design
- Custom color schemes for different channels
- Status and priority indicators
- Mobile-friendly layout

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_COGNITO_USER_POOL_ID` | Cognito User Pool ID | Yes |
| `REACT_APP_COGNITO_CLIENT_ID` | Cognito App Client ID | Yes |
| `REACT_APP_AWS_REGION` | AWS Region | Yes |
| `REACT_APP_API_URL` | Backend API URL | Yes |

## Testing Locally with Backend

1. Start the backend API (see backend README)

2. Set `REACT_APP_API_URL=http://localhost:8000` in `.env`

3. Start the frontend:
```bash
npm start
```

4. Create a test user in Cognito User Pool

5. Sign in and test the application

## Troubleshooting

### CORS Errors
- Ensure backend has CORS configured for `http://localhost:3000`
- Check `ALLOWED_ORIGINS` in backend configuration

### Authentication Issues
- Verify Cognito User Pool ID and Client ID
- Check that user is confirmed in Cognito
- Ensure user has necessary permissions

### API Connection Failures
- Verify `REACT_APP_API_URL` is correct
- Check network tab in browser DevTools
- Ensure backend is running and accessible

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] File attachment uploads
- [ ] Bulk ticket operations
- [ ] Advanced search and filters
- [ ] Agent performance metrics
- [ ] Canned responses/templates
- [ ] Dark mode support
