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
    <div className="min-h-screen bg-gradient-to-br from-apple-gray-50 via-white to-apple-gray-50">
      {/* Header - Apple Style */}
      <header className="glass-effect sticky top-0 z-50 shadow-apple border-b border-apple-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-12">
              <Link to="/tickets" className="flex items-center space-x-3 group">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-apple-blue to-apple-blue-dark flex items-center justify-center shadow-apple transition-transform group-hover:scale-105">
                  <Inbox className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-apple-gray-900 tracking-tight">
                  Support Hub
                </h1>
              </Link>
              <nav className="hidden md:flex space-x-2">
                <Link
                  to="/tickets"
                  className="text-apple-gray-700 hover:text-apple-gray-900 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-apple-gray-100 transition-all"
                >
                  Dashboard
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-apple-gray-100 to-apple-gray-50 border border-apple-gray-200">
                <div className="h-7 w-7 rounded-full bg-apple-blue flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-apple-gray-800">
                  {user?.signInDetails?.loginId || 'Agent'}
                </span>
              </div>
              {signOut && (
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 text-apple-gray-700 hover:text-apple-blue px-4 py-2 rounded-xl text-sm font-semibold hover:bg-apple-gray-100 transition-all active:scale-95"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
