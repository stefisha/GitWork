import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const ProfilePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const status = await api.getUserStatus();
      if (status.authenticated) {
        setIsLoggedIn(true);
        await loadProfile();
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const data = await api.getUserProfile();
      setProfileData(data);
    } catch (err) {
      setError(err.message);
      console.error('Profile load error:', err);
    }
  };

  const handleLogin = () => {
    api.loginWithGithub();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center -mt-16" style={{ background: '#0d1117' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 -mt-16" style={{ background: '#0d1117' }}>
      <div className="max-w-6xl mx-auto">
         {!isLoggedIn ? (
           // Login Prompt
           <div className="min-h-screen flex flex-col">
             <div className="flex-1 flex items-center justify-center">
               <div className="text-center space-y-8 max-w-md -mt-32">
                 <div className="space-y-4">
                   <div className="w-20 h-20 mx-auto rounded-full bg-gray-700 flex items-center justify-center">
                     <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                     </svg>
                   </div>
                   <h1 className="text-3xl font-bold text-white">Log in with GitHub</h1>
                   <p className="text-gray-400">Connect your GitHub account to see your profile, track your earnings, and view your reputation score*.</p>
                 </div>
                 
                 <button
                   onClick={handleLogin}
                   className="w-full px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-3"
                 >
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                   </svg>
                   <span>Continue with GitHub</span>
                 </button>
               </div>
             </div>
             
             <div className="absolute bottom-8 left-0 right-0">
               <p className="text-sm text-gray-500 text-center">*Not available in beta</p>
             </div>
           </div>
        ) : profileData ? (
          <>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
                <p className="text-gray-400">Manage your account and track your earnings</p>
              </div>
              {profileData.user.avatar && (
                <img 
                  src={profileData.user.avatar} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full border-2"
                  style={{ borderColor: '#8B5CF6' }}
                />
              )}
            </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="rounded-xl p-6" style={{ background: '#161b22', border: '1px solid #30363d' }}>
             <p className="text-gray-400 text-sm mb-2">Total USDC Earned</p>
             <p className="text-3xl font-bold text-white">{profileData.stats.totalUSDC.toFixed(2)} USDC</p>
           </div>
           
           <div className="rounded-xl p-6" style={{ background: '#161b22', border: '1px solid #30363d' }}>
             <p className="text-gray-400 text-sm mb-2">Total SOL Earned</p>
             <p className="text-3xl font-bold text-white">{profileData.stats.totalSOL.toFixed(4)} SOL</p>
           </div>
           
           <div className="rounded-xl p-6" style={{ background: '#161b22', border: '1px solid #30363d' }}>
             <p className="text-gray-400 text-sm mb-2">Bounties Completed</p>
             <p className="text-3xl font-bold text-white">{profileData.stats.totalBounties}</p>
           </div>
         </div>

        {/* Profile Info */}
        <div className="rounded-xl p-6 mb-8" style={{ background: '#161b22', border: '1px solid #30363d' }}>
          <h2 className="text-2xl font-bold text-white mb-6">Account Information</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Name</span>
              <span className="text-white font-medium">{profileData.user.name}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">GitHub Username</span>
              <span className="text-white font-medium">@{profileData.user.githubUsername}</span>
            </div>
            {profileData.user.email && (
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">Email</span>
                <span className="text-white font-medium">{profileData.user.email}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-400">Approximate Total (USD)</span>
              <span className="text-white font-medium">${profileData.stats.totalEarningsUSD.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Recent Bounties */}
        <div className="rounded-xl p-6" style={{ background: '#161b22', border: '1px solid #30363d' }}>
          <h2 className="text-2xl font-bold text-white mb-6">Claimed Bounties</h2>
          {profileData.bountyHistory.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No bounties claimed yet. Start contributing to earn rewards!</p>
          ) : (
            <div className="space-y-4">
              {profileData.bountyHistory.map((bounty) => (
                <div 
                  key={bounty.id}
                  className="rounded-lg p-4"
                  style={{ background: '#0d1117', border: '1px solid #30363d' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {bounty.issueTitle || `Issue #${bounty.issueNumber}`}
                      </h3>
                      <p className="text-sm text-gray-400">{bounty.repo}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold text-lg">{bounty.amount} {bounty.currency}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      Claimed: {new Date(bounty.claimedAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <a 
                        href={bounty.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1 rounded-full transition-colors duration-200"
                        style={{ background: '#8B5CF6', color: 'white' }}
                      >
                        View Issue
                      </a>
                      {bounty.transactionUrl && (
                        <a 
                          href={bounty.transactionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1 rounded-full"
                          style={{ background: '#161b22', border: '1px solid #30363d', color: 'white' }}
                        >
                          View TX
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-xl mb-4">Failed to load profile</p>
            <p className="text-gray-400">{error}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProfilePage;
