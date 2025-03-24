import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const UserLoginButton = () => {
  const { currentUser, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleOpenModal = (tab = 'login') => {
    setActiveTab(tab);
    setIsModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  const renderLoggedOut = () => (
    <div className="relative">
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleOpenModal('login')}
          className="text-gray-700 hover:text-purple-700 text-sm font-medium"
        >
          Login
        </button>
        <span className="text-gray-400">or</span>
        <button
          onClick={() => handleOpenModal('signup')}
          className="text-white bg-purple-600 hover:bg-purple-700 px-4 py-1.5 rounded-full text-sm font-medium"
        >
          Create Account
        </button>
      </div>

      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeTab={activeTab}
      />
    </div>
  );

  const renderLoggedIn = () => (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium text-gray-800">
          {currentUser.name || 'User'}
        </span>
        <button
          onClick={handleLogout}
          className="text-xs text-purple-600 hover:text-purple-800"
        >
          Logout
        </button>
      </div>
      <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
        {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
      </div>
    </div>
  );

  return currentUser ? renderLoggedIn() : renderLoggedOut();
};

export default UserLoginButton;
