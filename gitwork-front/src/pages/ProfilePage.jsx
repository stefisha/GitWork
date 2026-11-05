import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import gitworkLogo from '../assets/logo_w.png';

const ProfilePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [error, setError] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDC');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showNoBalanceMessage, setShowNoBalanceMessage] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Auto-refresh wallet if coming from claim success page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh') === 'wallet' && walletData) {
      console.log('🔄 Auto-refreshing wallet data...');
      loadWallet();
      // Remove the refresh parameter from URL without reload
      window.history.replaceState({}, '', '/profile');
    }
  }, [walletData]);

  const checkAuthStatus = async () => {
    try {
      const status = await api.getUserStatus();
      if (status.authenticated) {
        setIsLoggedIn(true);
        await loadProfile();
        await loadWallet();
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

  const loadWallet = async () => {
    try {
      const response = await fetch('/api/wallet/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setWalletData(data);
      }
    } catch (err) {
      console.error('Wallet load error:', err);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAddress.trim()) {
      alert('Please enter a Solana wallet address');
      return;
    }

    setWithdrawing(true);
    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          recipientAddress: withdrawAddress,
          currency: withdrawCurrency
        })
      });

      const data = await response.json();

      if (response.ok) {
        setWithdrawSuccess(data);
        setShowWithdrawModal(false);
        setWithdrawAddress('');
        // Wait 2 seconds for blockchain to update, then reload wallet balance
        setTimeout(async () => {
          await loadWallet();
        }, 2000);
        // Auto-hide success message after 10 seconds
        setTimeout(() => setWithdrawSuccess(null), 10000);
      } else {
        alert(`❌ Withdrawal failed: ${data.error}`);
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setWithdrawing(false);
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
                   <p className="text-gray-400">Connect your GitHub account to see your GitWork Wallet, track your earnings, and manage your balance.</p>
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
           </div>
        ) : profileData ? (
          <>
            {/* Withdrawal Success Banner */}
            {withdrawSuccess && (
              <div className="mb-6 rounded-xl p-6 animate-fadeIn" style={{ background: '#10b981', border: '2px solid #059669' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">✅ Withdrawal Successful!</h3>
                    <p className="text-green-100 mb-3">
                      Your funds have been sent. Please give it a few moments for the transaction to process on the blockchain.
                    </p>
                    <a 
                      href={`https://explorer.solana.com/tx/${withdrawSuccess.transactionSignature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg font-medium transition-all text-sm"
                    >
                      View Transaction →
                    </a>
                  </div>
                  <button
                    onClick={() => setWithdrawSuccess(null)}
                    className="text-white hover:text-green-100 text-2xl font-bold ml-4"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
                <p className="text-gray-400">Manage your GitWork Wallet and track your earnings</p>
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

            {/* GitWork Wallet Section - Credit Card Style */}
            {walletData && (
              <div className="mb-8">
                {/* Credit Card */}
                <div 
                  className="rounded-2xl p-5 sm:p-6 shadow-2xl"
                  style={{ 
                    background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
                    aspectRatio: '1.7/1',
                    maxWidth: '380px',
                    margin: '0 auto 2rem auto'
                  }}
                >
                  {/* Card Top - Logo */}
                  <div className="flex justify-between items-start mb-6 sm:mb-8">
                    <div className="text-white font-bold text-lg sm:text-xl">GitWork</div>
                    <img src={gitworkLogo} alt="GitWork" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                  </div>

                  {/* Card Middle - Wallet Address (chip style) */}
                  <div className="mb-4 sm:mb-6">
                    <div className="inline-block px-2.5 py-1 rounded bg-white bg-opacity-10 backdrop-blur-sm">
                      <p className="text-purple-200 text-xs">Wallet</p>
                      <p className="text-white text-xs font-mono">
                        {walletData.wallet.address.slice(0, 6)}...{walletData.wallet.address.slice(-6)}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom - Balance */}
                  <div>
                    <p className="text-purple-200 text-xs mb-0.5">Total Balance</p>
                    <div className="flex items-baseline gap-2 sm:gap-3">
                      <p className="text-2xl sm:text-4xl font-bold text-white">
                        {walletData.balance.usdc.toFixed(2)}
                      </p>
                      <p className="text-lg sm:text-xl text-white">USDC</p>
                      <p className="text-purple-200 text-xs sm:text-sm ml-auto">
                        {walletData.balance.sol.toFixed(4)} SOL
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Below Card - Withdraw only when user has USDC or SOL (other currencies have no withdraw option) */}
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  {(walletData.balance.usdc > 0 || walletData.balance.sol > 0) ? (
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200"
                    >
                      💸 Withdraw Funds
                    </button>
                  ) : null}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(walletData.wallet.address);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-200"
                    style={{ background: copied ? '#10b981' : '#161b22', border: '1px solid #30363d' }}
                  >
                    {copied ? '✅ Copied!' : '📋 Copy Address'}
                  </button>
                </div>

                {/* No Balance Message */}
                {showNoBalanceMessage && (
                  <div className="mt-4 max-w-md mx-auto rounded-xl p-4 animate-fadeIn" style={{ background: '#f59e0b', border: '2px solid #d97706' }}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-1">No balance to withdraw</p>
                        <p className="text-orange-100 text-sm">Complete bounties to earn rewards and build your balance!</p>
                      </div>
                      <button
                        onClick={() => setShowNoBalanceMessage(false)}
                        className="text-white hover:text-orange-100 text-xl font-bold"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

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

        {/* Earnings History */}
        {walletData && walletData.earnings && walletData.earnings.length > 0 && (
          <div className="rounded-xl p-6 mb-8" style={{ background: '#161b22', border: '1px solid #30363d' }}>
            <h2 className="text-2xl font-bold text-white mb-6">📊 Earnings History</h2>
            <div className="space-y-4">
              {walletData.earnings.map((earning) => (
                <div 
                  key={earning.id}
                  className="rounded-lg p-4"
                  style={{ background: '#0d1117', border: '1px solid #30363d' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {earning.issueTitle || `Issue #${earning.issueNumber}`}
                        </h3>
                        {earning.claimType === 'wallet' ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-600 text-white">
                            🔒 In Wallet
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
                            ✅ Claimed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{earning.repoOwner}/{earning.repoName}</p>
                      <p className="text-xs text-gray-500 mb-3">
                        {new Date(earning.claimedAt).toLocaleDateString()}
                      </p>
                      
                      {/* Action Links */}
                      <div className="flex items-center gap-3">
                        <a
                          href={`https://github.com/${earning.repoOwner}/${earning.repoName}/issues/${earning.issueNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-80 transition-opacity"
                          style={{ background: '#30363d' }}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                          </svg>
                          View Issue
                        </a>
                        {/* View transaction link (all claims are real Solana mainnet transactions) */}
                        {earning.transactionSignature && (
                          <a
                            href={`https://explorer.solana.com/tx/${earning.transactionSignature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-80 transition-opacity"
                            style={{ background: '#8B5CF6' }}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            View Transaction
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-white font-bold text-xl">{earning.amount} {earning.currency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

          </>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-xl mb-4">Failed to load profile</p>
            <p className="text-gray-400">{error}</p>
          </div>
        ) : null}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl p-8 max-w-md w-full" style={{ background: '#161b22', border: '1px solid #30363d' }}>
            <h2 className="text-2xl font-bold text-white mb-6">💸 Withdraw Funds</h2>
            <p className="text-gray-400 text-sm mb-4">You can withdraw USDC and SOL from your GitWork wallet to your own address below. (Bounties in other tokens can still be claimed directly to your wallet when you claim.)</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Currency</label>
                <select
                  value={withdrawCurrency}
                  onChange={(e) => setWithdrawCurrency(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-white"
                  style={{ background: '#0d1117', border: '1px solid #30363d' }}
                >
                  <option value="USDC">USDC ({walletData?.balance?.usdc?.toFixed(2) ?? '0.00'} available)</option>
                  <option value="SOL">SOL ({walletData?.balance?.sol?.toFixed(4) ?? '0.0000'} available)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Your Solana Wallet Address</label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder="Enter your Solana wallet address..."
                  className="w-full px-4 py-3 rounded-lg text-white font-mono text-sm"
                  style={{ background: '#0d1117', border: '1px solid #30363d' }}
                />
              </div>

              <div className="p-4 rounded-lg" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
                <p className="text-sm text-gray-400">
                  ⚠️ <strong className="text-white">Important:</strong> Make sure you enter the correct Solana wallet address. Transactions cannot be reversed.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleWithdraw}
                disabled={withdrawing || !withdrawAddress.trim()}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: '#10b981' }}
              >
                {withdrawing ? '⏳ Processing...' : '✅ Confirm Withdrawal'}
              </button>
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAddress('');
                  setWithdrawing(false);
                }}
                disabled={withdrawing}
                className="px-6 py-3 rounded-lg font-semibold text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                style={{ background: '#30363d' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
