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
    { id: 'pnr',  label: 'Check PNR Status' },
    { id: 'live', label: 'Live Train Status' }
  ];

  const fetchLocation = async (fromCity, toCity) => {
    if (!isLoaded) {
      console.error("Google Maps API not loaded yet");
      return;
    }

    const loaderInstance = new Loader({
      apiKey: "AIzaSyB7ZjmQo0re78EECTh9gyxdFVbph8XxEZs",
      version: "weekly"
    });
    await loaderInstance.load();

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
      return (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
          PNR Status Feature Coming Soon!
        </div>
      );
    }

    if (activeTab === 'live') {
      return (
        <LiveTrainStatus
          showLiveStatus={true}
          location={location}
          coordinates={coordinates}
          fetchLocation={fetchLocation}
          trainPath={trainPath}
        />
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-6">
        {tabs.map(tab => (
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