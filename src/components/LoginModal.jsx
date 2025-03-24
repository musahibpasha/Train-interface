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
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [checkingConnection, setCheckingConnection] = useState(false);

  const {
    login,
    signup,
    resendVerificationEmail,
    verificationSent,
    verificationEmail,
    setVerificationSent
  } = useAuth();

  const modalRef = useRef(null);

  useEffect(() => {
    if (verificationSent && verificationEmail) {
      setSuccessMessage(`Verification email sent to ${verificationEmail}. Please check your inbox.`);
    }
  }, [verificationSent, verificationEmail]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setErrorMessage('');
    setSuccessMessage('');
    setConnectionStatus(null);
  };

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
    setConnectionStatus(null);

    try {
      const { success, error, needsVerification } = await login(email, password);

      if (success) {
        onClose();
      } else {
        if (needsVerification) {
          setSuccessMessage('Please check your email for verification link before logging in.');
        } else {
          setErrorMessage(error || 'Failed to login. Please check your credentials.');
          if (error && (error.includes('network') || error.includes('connection') || error.includes('fetch'))) {
            await handleCheckConnection();
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Network error. Please try again later.');
      await handleCheckConnection();
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
    setConnectionStatus(null);

    try {
      const { success, error, data, needsVerification } = await signup(email, password, name);

      if (success) {
        if (needsVerification) {
          setSuccessMessage('Account created! Please check your email to verify your account.');
        } else {
          setSuccessMessage('Account created successfully! You can now login.');
          setTimeout(() => {
            setTab('login');
          }, 2000);
        }
      } else {
        if (error && error.includes('already registered')) {
          setErrorMessage('This email is already registered. Please login instead.');
        } else if (error && error.includes('rate limit')) {
          setErrorMessage('Too many emails sent. Please try again later.');
        } else {
          setErrorMessage(error || 'Failed to create account. Please try again.');
          if (error && (error.includes('network') || error.includes('connection') || error.includes('fetch'))) {
            await handleCheckConnection();
          }
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrorMessage('Network error. Please try again later.');
      await handleCheckConnection();
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const emailToVerify = verificationEmail || email;
    if (!emailToVerify) {
      setErrorMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { success, error } = await resendVerificationEmail(emailToVerify);

      if (success) {
        setSuccessMessage(`Verification email sent to ${emailToVerify}. Please check your inbox.`);
      } else {
        if (error && error.includes('rate limit')) {
          setErrorMessage('Too many verification emails sent. Please try again later or check your spam folder.');
        } else {
          setErrorMessage(error || 'Failed to resend verification email.');
        }
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setErrorMessage('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckConnection = async () => {
    setCheckingConnection(true);

    try {
      const results = await checkSupabaseConnection();
      setConnectionStatus(results);
    } catch (error) {
      console.error('Connection check error:', error);
      setConnectionStatus({
        success: false,
        message: `Failed to run connection check: ${error.message}`,
        errors: [error.message]
      });
    } finally {
      setCheckingConnection(false);
    }
  };

  if (!isOpen) return null;

  const renderVerificationMessage = () => {
    const emailToShow = verificationEmail || email;

    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <p className="font-semibold">Email verification required</p>
        <p>
          We've sent a verification link to <span className="font-medium">{emailToShow}</span>.
          Please check your inbox and click the link to verify your account.
        </p>
        <div className="mt-2">
          <button
            type="button"
            onClick={handleResendVerification}
            className="text-green-700 underline hover:text-green-900"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Resend verification email'}
          </button>
        </div>
        <p className="text-sm mt-2">
          Haven't received the email? Check your spam folder or try logging in again.
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
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
          {verificationSent && renderVerificationMessage()}

          {errorMessage && !verificationSent && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}

          {successMessage && !verificationSent && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          {connectionStatus && (
            <div className={`${connectionStatus.success ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-orange-100 border-orange-400 text-orange-700'} border px-4 py-3 rounded mb-4`}>
              <p className="font-medium">{connectionStatus.message}</p>
              {connectionStatus.errors && connectionStatus.errors.length > 0 && (
                <ul className="list-disc list-inside mt-2 text-sm">
                  {connectionStatus.errors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              )}
              {Object.keys(connectionStatus.details || {}).length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Connection Details:</p>
                  <ul className="text-xs mt-1">
                    {Object.entries(connectionStatus.details).map(([key, value]) => (
                      <li key={key}>{key}: {value}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!verificationSent && (
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
                    <a href="#" className="text-xs text-purple-600 hover:text-purple-800">
                      Forgot Password?
                    </a>
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
                {loading ?
                  'Processing...' :
                  (tab === 'signup' ? 'Sign Up' : 'Login')
                }
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => handleTabChange(tab === 'signup' ? 'login' : 'signup')}
                  className="text-purple-600 hover:text-purple-800 text-sm"
                >
                  {tab === 'signup' ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                </button>
              </div>

              {(errorMessage && (errorMessage.includes('connection') || errorMessage.includes('network'))) && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleCheckConnection}
                    disabled={checkingConnection}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {checkingConnection ? 'Checking connection...' : 'Check connection status'}
                  </button>
                </div>
              )}
            </form>
          )}

          {verificationSent && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setVerificationSent(false);
                  setTab('login');
                }}
                className="text-purple-600 hover:text-purple-800 text-sm"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
