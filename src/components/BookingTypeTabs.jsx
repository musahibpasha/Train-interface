import React, { useState, useEffect } from 'react';
import BookingForm from './BookingForm';
import LiveTrainStatus from './LiveTrainStatus';

const BookingTypeTabs = ({ activeTab, onTabChange }) => {
  const [location, setLocation] = useState(null);
  const [coordinates, setCoordinates] = useState(null);

  const tabs = [
    { id: 'book', label: 'Book Train Tickets' },
    { id: 'pnr', label: 'Check PNR Status' },
    { id: 'live', label: 'Live Train Status' }
  ];

  const fetchLocation = async (fromCity, toCity) => {
    const apiKey = 'AIzaSyB7ZjmQo0re78EECTh9gyxdFVbph8XxEZs'; // Replace with your actual API key
    const address = `${fromCity} to ${toCity}`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setLocation(data.results[0].formatted_address);
        setCoordinates(data.results[0].geometry.location);
      } else {
        setLocation('Location not found');
        setCoordinates(null);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setLocation('Error fetching location');
      setCoordinates(null);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'book':
        return <BookingForm />;
      case 'pnr':
        return <div className="p-4 bg-yellow-100 text-yellow-800 rounded">PNR Status Feature Coming Soon!</div>;
      case 'live':
        return (
          <LiveTrainStatus
            showLiveStatus={activeTab === 'live'}
            location={location}
            coordinates={coordinates}
            fetchLocation={fetchLocation}
          />
        );
      default:
        return null;
    }
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
              onChange={() => onTabChange(tab.id)}
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
