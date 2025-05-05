import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { checkSupabaseConnection } from '../utils/checkConnection';

const LoginModal = ({ isOpen, onClose, activeTab = 'login' }) => {
  const [tab, setTab] = useState(activeTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const modalRef = useRef(null);

  const { login, signup, resendVerificationEmail } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const validateInputs = () => {
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Email is required');
      return false;
    }

    if (!password) {
      setErrorMessage('Password is required');
      return false;
    }

    if (tab === 'signup' && !name) {
      setErrorMessage('Name is required');
      return false;
    }

    if (tab === 'signup' && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateInputs()) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { success, error } = await login(email, password);

      if (success) {
        onClose();
      } else {
        setErrorMessage(error || 'Failed to login. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateInputs()) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { success, error } = await signup(email, password, name);

      if (success) {
        setSuccessMessage('Account created successfully! You can now log in.');
        setTimeout(() => {
          setTab('login');
        }, 2000);
      } else {
        setErrorMessage(error || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrorMessage('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { success, error } = await resendVerificationEmail(email);

      if (success) {
        setSuccessMessage(`Password reset email sent to ${email}. Please check your inbox.`);
      } else {
        setErrorMessage(error || 'Failed to send password reset email.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrorMessage('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fadeIn"
      >
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">
            {tab === 'signup' ? 'Create Account' : 'Login'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          <form onSubmit={tab === 'signup' ? handleSignup : handleLogin}>
            {tab === 'signup' && (
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-purple-600 hover:text-purple-800"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                id="password"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              {tab === 'signup' && (
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {loading ? 'Processing...' : tab === 'signup' ? 'Sign Up' : 'Login'}
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setTab(tab === 'signup' ? 'login' : 'signup')}
                className="text-purple-600 hover:text-purple-800 text-sm"
              >
                {tab === 'signup' ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;