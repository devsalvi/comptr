import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Toaster } from 'react-hot-toast';

import Dashboard from './pages/Dashboard';
import TicketDetail from './pages/TicketDetail';
import Layout from './components/Layout';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Router>
          <Layout user={user} signOut={signOut}>
            <Routes>
              <Route path="/" element={<Navigate to="/tickets" replace />} />
              <Route path="/tickets" element={<Dashboard />} />
              <Route path="/tickets/:ticketId" element={<TicketDetail />} />
            </Routes>
          </Layout>
          <Toaster position="top-right" />
        </Router>
      )}
    </Authenticator>
  );
}

export default App;
