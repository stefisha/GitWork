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
      </nav>
    </div>
  );
};

export default Sidebar;
