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
    <div className="flex flex-col sm:flex-row h-screen" style={{ background: '#0d1117' }}>
      {/* Sidebar - Top on mobile, left on desktop */}
      <div className="sm:hidden">
        <Sidebar />
      </div>
      <div className="hidden sm:block">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Header with Sign In/Out - Hide Sign In on mobile, always show Sign Out when logged in */}
        <header className="flex justify-end items-center p-2 sm:p-3 md:p-4" style={{ background: '#0d1117' }}>
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
                  className="hidden sm:inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-white text-xs sm:text-sm font-medium transition-colors duration-200 hover:bg-purple-700"
                  style={{ background: '#8B5CF6' }}
                >
                  Sign In
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
