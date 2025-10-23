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
    <div className="flex h-screen" style={{ background: '#0d1117' }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Header with Sign In/Out */}
        <header className="flex justify-end items-center p-4" style={{ background: '#0d1117' }}>
          {!isLoading && (
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {user?.avatar && (
                    <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-white text-sm">@{user?.username}</span>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors duration-200"
                    style={{ background: '#161b22', border: '1px solid #30363d' }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors duration-200"
                  style={{ background: '#161b22', border: '1px solid #30363d' }}
                >
                  Sign In
                </button>
              )}
            </div>
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
