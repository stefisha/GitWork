import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { api } from '../services/api';

const MainLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const status = await api.getUserStatus();
      setIsAuthenticated(status.authenticated);
      if (status.authenticated) {
        setUser({ username: status.username, avatar: status.avatar });
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    api.loginWithGithub();
  };

  const handleSignOut = async () => {
    try {
      await api.logout();
      setIsAuthenticated(false);
      setUser(null);
      // Optionally redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row h-screen" style={{ background: '#0d1117', border: 'none', outline: 'none' }}>
      {/* Sidebar - Top on mobile, left on desktop */}
      <div className="sm:hidden">
        <Sidebar />
      </div>
      <div className="hidden sm:block">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto flex flex-col" style={{ border: 'none', outline: 'none' }}>
        {/* Header with Sign In/Out - Hide Sign In on mobile, always show Sign Out when logged in */}
        <header className="sticky top-0 z-50 flex justify-end items-center p-2 sm:p-3 md:p-4" style={{ background: 'transparent' }}>
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                  {user?.avatar && (
                    <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-700"
                    />
                  )}
                  <span className="text-white text-xs sm:text-sm font-medium">@{user?.username}</span>
                  <button
                    onClick={handleSignOut}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg text-white text-xs sm:text-sm font-medium transition-colors duration-200 hover:bg-gray-800"
                    style={{ background: '#161b22', border: '1px solid #30363d' }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-white text-xs sm:text-sm font-medium transition-colors duration-200 hover:bg-purple-700"
                  style={{ background: '#8B5CF6' }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Log in with GitHub
                </button>
              )}
            </>
          )}
        </header>
        
        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
