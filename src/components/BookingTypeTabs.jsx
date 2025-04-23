import React, { useState, useEffect } from 'react';
import BookingForm from './BookingForm';
import LiveTrainStatus from './LiveTrainStatus';
import { Loader } from "@googlemaps/js-api-loader";
import { useLoadScript } from "@react-google-maps/api";

const BookingTypeTabs = ({ activeTab: initialActiveTab, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab || 'book');
  const [location, setLocation] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [trainPath, setTrainPath] = useState([]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyB7ZjmQo0re78EECTh9gyxdFVbph8XxEZs',
  });

  if (loadError) {
    return <div>Error loading Google Maps API: {loadError.message}</div>;
  }

  const tabs = [
    { id: 'book', label: 'Book Train Tickets' },
    { id: 'pnr', label: 'Check PNR Status' },
    { id: 'live', label: 'Live Train Status' }
  ];

  const fetchLocation = async (fromCity, toCity) => {
    try {
      const response = await fetch(`/api/getLiveLocation?from=${fromCity}&to=${toCity}`);
      
      if (!response.ok) {
        // Reject the promise for server-side errors
        throw new Error(`Server error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Live location data:', data); // Debugging API response

      if (data.success) {
        const { lat, lng } = data;
        setCoordinates({ lat, lng });

        // Load Google Maps API dynamically
        const loader = new Loader({
          apiKey: "AIzaSyB7ZjmQo0re78EECTh9gyxdFVbph8XxEZs", // Replace with your actual API key
          version: "weekly",
        });

        await loader.load();

        // Use the Geocoder service from the Maps API
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results.length > 0) {
            setLocation(results[0].formatted_address); // Set the formatted address
          } else {
            console.error("Geocoding API Error:", status);
            setLocation("Unknown location");
          }
        });

        if (data.path) {
          setTrainPath(data.path); // Assuming `data.path` is an array of coordinates
        }
      } else {
        console.error('Error in API response:', data.message);
      }
    } catch (error) {
      console.error('Error fetching live location:', error);

      // Handle specific error cases
      if (error.message.includes('Server error')) {
        console.error('Server returned an error:', error.message);
      } else {
        console.error('Network error or unexpected issue:', error.message);
      }
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    onTabChange(tabId);
  };

  const renderContent = () => {
    if (activeTab === 'book') {
      return <BookingForm onClose={() => handleTabClick(null)} />;
    }

    if (activeTab === 'pnr') {
      return <div className="p-4 bg-yellow-100 text-yellow-800 rounded">PNR Status Feature Coming Soon!</div>;
    }

    if (activeTab === 'live') {
      return (
        <LiveTrainStatus
          showLiveStatus={activeTab === 'live'}
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