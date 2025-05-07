import React, { useState, useEffect } from 'react';
import BookingForm from './BookingForm';
import LiveTrainStatus from './LiveTrainStatus';
import PNRStatus from './PNRStatus';
import { Loader } from "@googlemaps/js-api-loader";
import { useLoadScript } from "@react-google-maps/api";
import BookingTrendsChart from './BookingTrendsChart';

const BookingTypeTabs = ({ activeTab: initialActiveTab, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab || 'book');
  const [location, setLocation] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [trainPath, setTrainPath] = useState([]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (loadError) {
    return <div>Error loading Google Maps API: {loadError.message}</div>;
  }

  const tabs = [
    { id: 'book', label: <strong style={{ fontSize: '1.25rem' }}>Book Train Tickets</strong> },
    { id: 'pnr',  label: <strong style={{ fontSize: '1.25rem' }}>Check PNR Status</strong> },
    { id: 'live', label: <strong style={{ fontSize: '1.25rem' }}>Live Train Status</strong> },
    { id: 'charts', label: <strong style={{ fontSize: '1.25rem' }}>Charts</strong> }
  ];

  const fetchLocation = async (fromCity, toCity) => {
    if (!isLoaded) {
      console.error("Google Maps API not loaded yet");
      return;
    }

    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly"
    });
    await loader.load();

    const directionsService = new window.google.maps.DirectionsService();
    const geocoder         = new window.google.maps.Geocoder();

    directionsService.route(
      {
        origin:      fromCity,
        destination: toCity,
        travelMode:  window.google.maps.TravelMode.TRANSIT
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result.routes.length) {
          const path = result.routes[0].overview_path.map(p => ({
            lat: p.lat(),
            lng: p.lng()
          }));
          setTrainPath(path);

          const mid = path[Math.floor(path.length / 2)];
          setCoordinates(mid);

          geocoder.geocode({ location: mid }, (res, stat) => {
            if (stat === "OK" && res.length > 0) {
              setLocation(res[0].formatted_address);
            } else {
              setLocation("Unknown location");
            }
          });
        } else {
          console.error("Directions request failed: ", status);
        }
      }
    );
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    onTabChange(tabId);
  };

  const renderContent = () => {
    if (activeTab === 'book') {
      // Do not render the form here; it will appear via your "Book Now" button
      return null;
    }

    if (activeTab === 'pnr') {
      return <PNRStatus />;
    }

    if (activeTab === 'live') {
      return null; // Rendered in App.jsx
    }

    if (activeTab === 'charts') {
      return <BookingTrendsChart />;
    }

    return null;
  };

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default BookingTypeTabs;