import { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

const LiveTrainStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState('');

  // Fetch user's bookings
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error('Please log in to view your bookings.');
        }

        const { data, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id);

        if (bookingsError) {
          throw bookingsError;
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
  }, []);

  const handleBookingChange = (e) => {
    setSelectedBooking(e.target.value);
  };

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
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Details</h3>
          {myBookings
            .filter((booking) => booking.id === selectedBooking)
            .map((booking) => (
              <div key={booking.id} className="space-y-4">
                <p>
                  <span className="font-medium">Train:</span> {booking.train}
                </p>
                <p>
                  <span className="font-medium">Route:</span> {booking.from_city} to {booking.to_city}
                </p>
                <p>
                  <span className="font-medium">PNR:</span> {booking.pnr}
                </p>
                <p>
                  <span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Seats:</span> {booking.seats}
                </p>
                <p>
                  <span className="font-medium">Total Price:</span> ₹{booking.total_price}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default LiveTrainStatus;