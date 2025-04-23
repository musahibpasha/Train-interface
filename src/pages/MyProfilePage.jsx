import React from 'react';
import { useAuth } from '../context/AuthContext';

const MyProfilePage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      {currentUser ? (
        <div className="space-y-2">
          <p><strong>Name:</strong> {currentUser.name}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
          {/* Add more profile details here if needed */}
        </div>
      ) : (
        <p>Please log in to view your profile.</p>
      )}
    </div>
  );
};

export default MyProfilePage;