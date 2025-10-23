import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import octopusLogo from '../assets/logo_w.png';
import infoIcon from '../assets/info.png';
import profileIcon from '../assets/profile.png';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-20 bg-black h-screen flex flex-col items-center py-6">
      {/* Logo - Click to go home */}
      <Link to="/" className="mb-8">
        <img 
          src={octopusLogo} 
          alt="GitWork Logo" 
          className="w-12 h-12 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
        />
      </Link>

      {/* Navigation Items */}
      <nav className="flex flex-col space-y-6">
        {/* Info/About Button */}
        <Link
          to="/about"
          className="p-2 rounded-lg transition-opacity duration-200 hover:opacity-80"
        >
          <img 
            src={infoIcon} 
            alt="About" 
            className="w-9 h-9"
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
            className="w-9 h-9"
          />
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
