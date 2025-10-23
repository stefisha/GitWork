import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import { api } from '../services/api';

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchData) => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await api.searchProjects(searchData.query, {
        deepSearch: searchData.deepSearch
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gitwork-dark-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Search Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Search Projects</h1>
          <div className="max-w-2xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center space-x-2 text-white text-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>Searching...</span>
            </div>
          </div>
        )}

        {hasSearched && !isSearching && (
          <div>
            {searchResults.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Found {searchResults.length} projects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((project) => (
                    <div key={project.id} className="bg-gitwork-dark-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-white">{project.name}</h3>
                        <span className="text-2xl font-bold text-gitwork-purple-400">
                          ${project.price}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 mb-4 line-clamp-3">{project.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-gitwork-purple-600 text-white px-3 py-1 rounded-full text-sm">
                          {project.category}
                        </span>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <span>⭐ {project.stars}</span>
                          <span>⬇️ {project.downloads}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <a 
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-gitwork-purple-600 hover:bg-gitwork-purple-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                        >
                          View on GitHub
                        </a>
                        <button className="bg-gitwork-dark-700 hover:bg-gitwork-dark-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200">
                          Buy Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-white mb-2">No projects found</h3>
                <p className="text-gray-300">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Default State */}
        {!hasSearched && !isSearching && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-white mb-2">Start Your Search</h3>
            <p className="text-gray-300">
              Use the search bar above to find amazing projects and code templates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
