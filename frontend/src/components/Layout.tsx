import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Inbox, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  signOut?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, signOut }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/tickets" className="flex items-center space-x-2">
                <Inbox className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Agent Workbench
                </h1>
              </Link>
              <nav className="hidden md:flex space-x-4">
                <Link
                  to="/tickets"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  All Tickets
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {user?.signInDetails?.loginId || 'Agent'}
                </span>
              </div>
              {signOut && (
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
