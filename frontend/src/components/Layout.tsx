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
    <div className="min-h-screen bg-apple-gray-50">
      {/* Header - Apple Style */}
      <header className="glass-effect sticky top-0 z-50 shadow-apple">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-8">
              <Link to="/tickets" className="flex items-center space-x-2 group">
                <Inbox className="h-5 w-5 text-apple-blue transition-transform group-hover:scale-110" />
                <h1 className="text-lg font-semibold text-apple-gray-800 tracking-tight">
                  Support
                </h1>
              </Link>
              <nav className="hidden md:flex space-x-1">
                <Link
                  to="/tickets"
                  className="text-apple-gray-700 hover:text-apple-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-apple-gray-100 transition-colors"
                >
                  Tickets
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-apple-gray-100">
                <User className="h-4 w-4 text-apple-gray-600" />
                <span className="text-xs font-medium text-apple-gray-700">
                  {user?.signInDetails?.loginId || 'Agent'}
                </span>
              </div>
              {signOut && (
                <button
                  onClick={signOut}
                  className="flex items-center space-x-1.5 text-apple-gray-700 hover:text-apple-blue px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-apple-gray-100 transition-all"
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
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
