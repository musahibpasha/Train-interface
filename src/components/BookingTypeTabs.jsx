import React, { useState, useEffect } from 'react';
import BookingForm from './BookingForm';
import LiveTrainStatus from './LiveTrainStatus';

const BookingTypeTabs = ({ activeTab, onTabChange }) => {
  const [location, setLocation] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPnrStatus, setShowPnrStatus] = useState(false);
  const [showLiveTrain, setShowLiveTrain] = useState(false);

  const tabs = [
    { id: 'book', label: 'Book Train Tickets' },
    { id: 'pnr', label: 'Check PNR Status' },
    { id: 'live', label: 'Live Train Status' }
  ];

  const fetchLocation = async (fromCity, toCity) => {
    // ... (your fetchLocation logic remains the same)
  };

  const handleTabClick = (tabId) => {
    if (tabId === 'book') {
      setShowBookingForm(!showBookingForm);
      setShowPnrStatus(false);
      setShowLiveTrain(false);
    } else if (tabId === 'pnr') {
      setShowPnrStatus(!showPnrStatus);
      setShowBookingForm(false);
      setShowLiveTrain(false);
    } else if (tabId === 'live') {
      setShowLiveTrain(!showLiveTrain);
      setShowBookingForm(false);
      setShowPnrStatus(false);
    } else {
      onTabChange(tabId);
      setShowBookingForm(false);
      setShowPnrStatus(false);
      setShowLiveTrain(false);
    }
  };

  const renderContent = () => {
    if (showBookingForm) {
      return <BookingForm onClose={() => setShowBookingForm(false)} />;
    }

    if (showPnrStatus) {
      // Replace with your PNR status rendering logic
      return <div className="p-4 bg-yellow-100 text-yellow-800 rounded">PNR Status Feature Coming Soon!</div>;
    }

    if (showLiveTrain) {
      // Replace with your live train rendering logic
      return (
        <LiveTrainStatus
          showLiveStatus={showLiveTrain}
          location={location}
          coordinates={coordinates}
          fetchLocation={fetchLocation}
        />
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-6">
        {tabs.map((tab) => (
          <div key={tab.id} className="flex items-center">
            <input
              type="radio"
              id={tab.id}
              name="bookingType"
              checked={activeTab === tab.id}
              onChange={() => handleTabClick(tab.id)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500"
            />
            <label
              htmlFor={tab.id}
              className="ml-2 text-gray-800 hover:text-purple-700 cursor-pointer"
            >
              {tab.label}
            </label>
          </div>
        ))}
      </div>

      {renderContent()}
    </div>
  );
};

export default BookingTypeTabs;