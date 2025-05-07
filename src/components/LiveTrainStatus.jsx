import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, Polyline, useLoadScript } from '@react-google-maps/api';
import { useAuth } from '../context/AuthContext';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

// Added marker icons for better visibility
const markerIcons = {
  start: {
    url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  },
  end: {
    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  },
  train: {
    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  },
};

const LiveTrainStatus = ({ showLiveStatus, location, coordinates, fetchLocation, trainPath }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [currentTrainPath, setCurrentTrainPath] = useState([]);
  const [locationName, setLocation] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  // Ensure the location is updated with the train's current location
  const fetchTrainLocation = async (fromCity, toCity) => {
    if (!isLoaded) {
      console.error("Google Maps API not loaded yet");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    const geocoder = new window.google.maps.Geocoder();

    directionsService.route(
      {
        origin: fromCity,
        destination: toCity,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result.routes.length) {
          const path = result.routes[0].overview_path.map((point) => ({
            lat: point.lat(),
            lng: point.lng(),
          }));
          setCurrentTrainPath(path);

          // Set the midpoint as the current train location for demonstration
          const midPoint = path[Math.floor(path.length / 2)];
          setCurrentCoordinates(midPoint);

          // Reverse geocode the midpoint to get the location name
          geocoder.geocode({ location: midPoint }, (res, st) => {
            if (st === "OK" && res[0]) {
              setLocation(res[0].formatted_address);
            } else {
              console.error("Failed to fetch location name: ", st);
            }
          });
        } else {
          console.error("Failed to fetch directions: ", status);
        }
      }
    );
  };

  useEffect(() => {
    if (!showLiveStatus) return;

    if (!currentUser) {
      setError('Please log in to view your bookings.');
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/bookings?userId=${currentUser.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await res.json();
        if (!data) {
          throw new Error('No data received');
        }
        setMyBookings(data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.message || 'Failed to fetch bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [showLiveStatus, currentUser]);

  useEffect(() => {
    if (isLoaded && selectedBooking && fetchLocation) {
      const booking = myBookings.find((b) => b.id === selectedBooking);
      if (booking) {
        fetchLocation(booking.from_city, booking.to_city);
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: booking.from_city }, (res, st) => {
          if (st === 'OK' && res[0]) setPickupCoords(res[0].geometry.location.toJSON());
        });
        geocoder.geocode({ address: booking.to_city }, (res, st) => {
          if (st === 'OK' && res[0]) setDropCoords(res[0].geometry.location.toJSON());
        });
      }
    }
  }, [isLoaded, selectedBooking, fetchLocation, myBookings]);

  // Ensure fetchTrainLocation is called when a booking is selected
  useEffect(() => {
    if (isLoaded && selectedBooking) {
      const booking = myBookings.find((b) => b.id === selectedBooking);
      if (booking) {
        fetchTrainLocation(booking.from_city, booking.to_city);
      }
    }
  }, [isLoaded, selectedBooking, myBookings]);

  const handleBookingChange = (e) => {
    setSelectedBooking(e.target.value);
  };

  if (!showLiveStatus) return null;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Bookings</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="myBookings" className="block text-sm font-medium text-gray-700 mb-1">
          Select a Booking
        </label>
        <select
          id="myBookings"
          value={selectedBooking}
          onChange={handleBookingChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">-- Select a Booking --</option>
          {myBookings.map((booking) => (
            <option key={booking.id} value={booking.id}>
              {booking.train} - {booking.from_city} to {booking.to_city} (PNR: {booking.pnr})
            </option>
          ))}
        </select>
      </div>

      {selectedBooking && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Details</h3>
            {myBookings
              .filter((booking) => booking.id === selectedBooking)
              .map((booking) => (
                <div key={booking.id} className="space-y-4">
                  <p><span className="font-medium">Train:</span> {booking.train}</p>
                  <p><span className="font-medium">Route:</span> {booking.from_city} to {booking.to_city}</p>
                  <p><span className="font-medium">PNR:</span> {booking.pnr}</p>
                  <p><span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()}</p>
                  <p><span className="font-medium">Seats:</span> {booking.seats}</p>
                  <p><span className="font-medium">Total Price:</span> ₹{booking.total_price}</p>
                </div>
              ))}
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Live Train Status</h2>
            <p className="mb-2 text-gray-700">
              <span className="font-medium">Train is currently at:</span> {locationName ? locationName : 'Fetching live location... Please wait.'}
            </p>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={coordinates || { lat: 20.5937, lng: 78.9629 }} // Default to India center
              zoom={6}
            >
              {pickupCoords && <Marker position={pickupCoords} label="Start" icon={markerIcons.start} />} // Start point marker
              {dropCoords && <Marker position={dropCoords} label="End" icon={markerIcons.end} />} // End point marker
              {coordinates && <Marker position={coordinates} label="Train" icon={markerIcons.train} />} // Current train location marker
              {currentTrainPath && currentTrainPath.length > 0 && (
                <Polyline
                  path={currentTrainPath}
                  options={{
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                  }}
                />
              )}
            </GoogleMap>
          </div>
        </>
      )}
    </div>
  );
};

export default LiveTrainStatus;
