import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`sticky top-0 z-50 shadow-md transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center">
            <Link to="/" className={`text-2xl font-bold ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              ▲ Zenith
            </Link>
            {user && (
              <div className="ml-10 flex space-x-4">
                <Link to="/dashboard" className={`transition ${
                  darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                }`}>
                  Dashboard
                </Link>
                <Link to="/policies" className={`transition ${
                  darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                }`}>
                  Policies
                </Link>
                <Link to="/claims" className={`transition ${
                  darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                }`}>
                  Claims
                </Link>
                <Link to="/track" className={`transition ${
                  darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                }`}>
                  Live Track
                </Link>
                <Link to="/calculator" className={`transition ${
                  darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                }`}>
                  💰 Premium Calc
                </Link>
                <Link to="/payment-history" className={`transition ${
                  darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                }`}>
                  📜 Payment History
                </Link>
              </div>
            )}
          </div>
          
          {/* Right side - User, Theme, Profile */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition ${
                darkMode 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            
            {user ? (
              <>
                {/* Profile Link */}
                <Link 
                  to="/profile" 
                  className={`flex items-center space-x-2 transition ${
                    darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <span className="text-lg">👤</span>
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                
                {/* User Name */}
                <span className={`hidden md:inline ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Hi, {user.name?.split(' ')[0]}
                </span>
                
                {/* Logout Button */}
                <button 
                  onClick={handleLogout} 
                  className={`transition ${
                    darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`transition ${
                  darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
                }`}>
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
                
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;