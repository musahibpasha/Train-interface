import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import MyBookings from './MyBookings';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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
    setIsLoggingOut(true);
    try {
      const { success, error } = await logout();
      if (!success) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setShowDropdown(false);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <div className="font-bold text-xl" style={{ color: 'var(--purple-primary)' }}>
              MakeMyTrip
              <span className="text-xs font-normal ml-1 text-gray-500">Premium</span>
            </div>
          </div>

          {/* Right side - Contains multiple items */}
          <div className="flex items-center space-x-4">
            {/* Super Offers */}
            <div className="hidden md:flex items-center text-gray-700 hover:text-purple-700 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Super Offers</span>
            </div>

            {/* Business Plus */}
            <div className="hidden md:flex items-center text-gray-700 hover:text-purple-700 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              <span className="text-sm font-medium">Business+</span>
            </div>

            {/* My Trips / My Bookings - Shown only if logged in */}
            {currentUser && (
              <div
                className="hidden md:flex items-center text-gray-700 hover:text-purple-700 cursor-pointer"
                onClick={() => setShowBookingsModal(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">My Bookings</span>
              </div>
            )}

            {/* Login / User Profile */}
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
                    // Logged in user menu
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
                            setShowBookingsModal(true);
                            setShowDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                        >
                          My Bookings
                        </button>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">My Profile</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">Wallet</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">Settings</a>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className={`block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                      </div>
                    </>
                  ) : (
                    // Not logged in menu
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

                      <div className="py-2">
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">24x7 Customer Care</a>

                        {/* Mobile only menu items */}
                        <div className="md:hidden">
                          <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">Super Offers</a>
                          <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">Business+</a>
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

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        isSignup={isSignup}
        setIsSignup={setIsSignup}
      />

      {/* My Bookings Modal */}
      <MyBookings
        isOpen={showBookingsModal}
        onClose={() => setShowBookingsModal(false)}
      />
    </header>
  );
};

export default Header;
