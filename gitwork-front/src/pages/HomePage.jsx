import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import octopusLogo from '../assets/logo_w.png';
import { api } from '../services/api';

const HomePage = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (searchData) => {
    setIsSearching(true);
    try {
      const results = await api.searchBounties(searchData.query || '');
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div 
      className="h-screen flex flex-col items-center justify-center p-8 relative"
      style={{
        background: '#0d1117'
      }}
    >
      {/* Main Content */}
      <div className="text-center space-y-8 max-w-4xl w-full -mt-48">
        {/* Logo and Branding */}
        <div className="space-y-0">
          <img 
            src={octopusLogo} 
            alt="GitWork Logo" 
            className="w-20 h-20 mx-auto"
          />
          <h1 className="text-8xl font-bold text-white">
            GitWork
          </h1>
          <p className="text-5xl font-medium text-white">
            make money on github
          </p>
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="text-white text-lg">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>Searching...</span>
            </div>
          </div>
        )}

        {searchResults && searchResults.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-2xl font-bold text-white">
              Found {searchResults.length} {searchResults.length === 1 ? 'Bounty' : 'Bounties'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((bounty) => (
                <div 
                  key={bounty.id} 
                  className="rounded-lg p-6 shadow-lg"
                  style={{ background: '#161b22', border: '1px solid #30363d' }}
                >
                  <h4 className="text-xl font-bold text-white mb-2">
                    {bounty.repo}
                  </h4>
                  <p className="text-gray-400 mb-4">#{bounty.name.split('#')[1]}: {bounty.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold" style={{ color: '#8B5CF6' }}>
                      {bounty.amount} {bounty.currency}
                    </span>
                    <span 
                      className="text-sm px-3 py-1 rounded-full"
                      style={{ 
                        background: bounty.status === 'claimed' ? '#1a472a' : '#1f2937',
                        color: bounty.status === 'claimed' ? '#4ade80' : '#9ca3af'
                      }}
                    >
                      {bounty.status === 'claimed' ? '✓ Claimed' : '💰 Active'}
                    </span>
                  </div>
                  <div className="mt-4">
                    <a 
                      href={bounty.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium transition-colors duration-200"
                      style={{ color: '#8B5CF6' }}
                    >
                      View on GitHub →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchResults && searchResults.length === 0 && (
          <div className="text-white text-lg">
            <p>No projects found. Try a different search term.</p>
          </div>
        )}
      </div>

      {/* Alpha Launch Footer */}
      <div className="absolute bottom-12 left-0 right-0">
        <p className="text-base text-gray-400 text-center">
          🚀 This is alpha launch - we are onboarding projects. If you want your repo and issues listed, contact us at{' '}
          <a 
            href="mailto:support@gitwork.io" 
            className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
          >
            support@gitwork.io
          </a>
        </p>
      </div>

    </div>
  );
};

export default HomePage;
