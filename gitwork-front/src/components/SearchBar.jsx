import React, { useState } from 'react';

const SearchBar = ({ onSearch, className = "" }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        query: searchQuery
      });
    }
  };

  return (
    <div className={`max-w-2xl w-full ${className}`}>
      <form onSubmit={handleSubmit}>
        {/* Main Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find bounties, projects, and opportunities..."
            className="w-full px-4 py-3 sm:px-6 sm:py-4 pr-16 sm:pr-20 text-white placeholder-gray-400 bg-transparent border-2 border-gray-600 rounded-2xl focus:outline-none focus:border-purple-500 text-sm sm:text-xl transition-colors duration-200"
          />
          {searchQuery.trim() && (
            <button
              type="submit"
              className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200 text-xs sm:text-sm"
            >
              Go
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
