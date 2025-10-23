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
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 pb-20 sm:pb-32 relative overflow-x-hidden"
      style={{
        background: '#0d1117'
      }}
    >
      {/* Main Content */}
      <div className="text-center space-y-4 sm:space-y-8 max-w-4xl w-full -mt-24 sm:-mt-56">
        {/* Logo and Branding */}
        <div className="space-y-0">
          <img 
            src={octopusLogo} 
            alt="GitWork Logo" 
            className="w-12 h-12 sm:w-20 sm:h-20 mx-auto"
          />
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-white">
            GitWork
          </h1>
          <p className="text-xl sm:text-3xl md:text-5xl font-medium text-white">
            make money on github
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center px-4">
          <SearchBar 
            onSearch={handleSearch}
            className="w-full max-w-2xl"
          />
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="text-white text-sm sm:text-lg px-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 sm:h-6 sm:w-6 border-b-2 border-white"></div>
              <span>Searching...</span>
            </div>
          </div>
        )}

        {searchResults && searchResults.length > 0 && (
          <div className="mt-4 sm:mt-8 space-y-4 px-4">
            <h3 className="text-lg sm:text-2xl font-bold text-white">
              Found {searchResults.length} {searchResults.length === 1 ? 'Bounty' : 'Bounties'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {searchResults.map((bounty) => (
                <div 
                  key={bounty.id} 
                  className="rounded-lg p-4 sm:p-6 shadow-lg"
                  style={{ background: '#161b22', border: '1px solid #30363d' }}
                >
                  <h4 className="text-sm sm:text-xl font-bold text-white mb-2 truncate">
                    {bounty.repo}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 line-clamp-2">
                    #{bounty.name.split('#')[1]}: {bounty.description}
                  </p>
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <span className="text-lg sm:text-2xl font-bold" style={{ color: '#8B5CF6' }}>
                      {bounty.amount} {bounty.currency}
                    </span>
                    <span 
                      className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 rounded-full flex-shrink-0"
                      style={{ 
                        background: bounty.status === 'claimed' ? '#1a472a' : '#1f2937',
                        color: bounty.status === 'claimed' ? '#4ade80' : '#9ca3af'
                      }}
                    >
                      {bounty.status === 'claimed' ? '✓ Claimed' : '💰 Active'}
                    </span>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <a 
                      href={bounty.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm font-medium transition-colors duration-200"
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
          <div className="text-white text-sm sm:text-lg px-4">
            <p>No projects found. Try a different search term.</p>
          </div>
        )}
      </div>

      {/* Alpha Launch Footer */}
      <div className="fixed bottom-4 sm:bottom-8 left-0 right-0 px-4 z-10">
        <p className="text-xs sm:text-sm md:text-base text-gray-400 text-center leading-relaxed">
          🚀 This is alpha launch - we are onboarding projects. If you want your repo and issues listed, contact us at{' '}
          <a 
            href="mailto:support@gitwork.io" 
            className="text-purple-400 hover:text-purple-300 transition-colors duration-200 break-all"
          >
            support@gitwork.io
          </a>
        </p>
      </div>

    </div>
  );
};

export default HomePage;
