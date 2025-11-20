import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configure Amplify (values from environment variables)
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || '',
      userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || '',
      region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
    }
  },
  API: {
    REST: {
      SupportAPI: {
        endpoint: process.env.REACT_APP_API_URL || 'http://localhost:8000',
        region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
      }
    }
  }
});

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
