import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import MyBookings    from '../components/MyBookings';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBookingsPage, setShowBookingsPage] = useState(false); // State to toggle MyBookingsPage visibility
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    setShowBookingsPage(false); // Ensure MyBookingsPage is hidden after logout
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="font-bold text-xl" style={{ color: 'var(--purple-primary)' }}>
            MakeMyTrip
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center text-gray-700 hover:text-purple-700"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium hidden md:inline">
                  {currentUser ? currentUser.name : 'Login or Create Account'}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {currentUser ? (
                    <>
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 font-semibold mr-3">
                            {currentUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{currentUser.name}</div>
                            <div className="text-xs text-gray-500">{currentUser.email}</div>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowBookingsPage(!showBookingsPage); // Toggle MyBookingsPage visibility
                            setShowDropdown(false); // Close dropdown
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                        >
                          My Bookings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 border-b border-gray-200">
                        <div className="text-sm text-gray-500 mb-2">Login or Create Account</div>
                        <div className="flex space-x-2">
                          <button
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-sm transition-colors"
                            onClick={() => {
                              setIsSignup(false);
                              setShowLoginModal(true);
                              setShowDropdown(false);
                            }}
                          >
                            Login
                          </button>
                          <button
                            className="flex-1 border border-purple-600 text-purple-600 hover:bg-purple-50 py-2 rounded text-sm transition-colors"
                            onClick={() => {
                              setIsSignup(true);
                              setShowLoginModal(true);
                              setShowDropdown(false);
                            }}
                          >
                            Sign up
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* My Bookings Page */}
      {showBookingsPage && <MyBookings />}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        isSignup={isSignup}
        setIsSignup={setIsSignup}
      />
    </header>
  );
};

export default Header;