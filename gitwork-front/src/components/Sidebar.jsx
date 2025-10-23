import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import octopusLogo from '../assets/logo_w.png';
import infoIcon from '../assets/info.png';
import profileIcon from '../assets/profile.png';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-full sm:w-20 bg-black h-16 sm:h-screen flex flex-row sm:flex-col items-center justify-center sm:justify-start py-2 sm:py-6 px-4 sm:px-0">
      {/* Logo - Click to go home */}
      <Link to="/" className="sm:mb-8">
        <img 
          src={octopusLogo} 
          alt="GitWork Logo" 
          className="w-8 h-8 sm:w-12 sm:h-12 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
        />
      </Link>

      {/* Navigation Items */}
      <nav className="flex flex-row sm:flex-col space-x-4 sm:space-x-0 sm:space-y-6 ml-4 sm:ml-0">
        {/* Info/About Button */}
        <Link
          to="/about"
          className="p-2 rounded-lg transition-opacity duration-200 hover:opacity-80"
        >
          <img 
            src={infoIcon} 
            alt="About" 
            className="w-6 h-6 sm:w-9 sm:h-9"
          />
        </Link>

        {/* Profile Button */}
        <Link
          to="/profile"
          className="p-2 rounded-lg transition-opacity duration-200 hover:opacity-80"
        >
          <img 
            src={profileIcon} 
            alt="Profile" 
            className="w-6 h-6 sm:w-9 sm:h-9"
          />
        </Link>

        {/* Contact Button */}
        <Link
          to="/contact"
          className="p-2 rounded-lg transition-opacity duration-200 hover:opacity-80"
        >
          <svg 
            className="w-6 h-6 sm:w-9 sm:h-9 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
