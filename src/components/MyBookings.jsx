import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const BookingCard = ({ booking }) => {
  const getStatusClass = (status) => {
    if (status === 'Confirmed') return 'bg-green-100 text-green-800';
    if (status === 'Cancelled') return 'bg-red-100 text-red-800';
    if (status.includes('Waiting')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const isUpcoming = new Date(booking.date) >= new Date();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-gray-800">{booking.train}</h3>
            <p className="text-sm text-gray-500">Train #{booking.train_number}</p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(booking.status)}`}
          >
            {booking.status}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex mb-4">
          <div className="w-1/2">
            <p className="text-sm text-gray-500">FROM</p>
            <p className="font-medium">{booking.from_city}</p>
          </div>
          <div className="w-1/2">
            <p className="text-sm text-gray-500">TO</p>
            <p className="font-medium">{booking.to_city}</p>
          </div>
        </div>

        <div className="flex mb-4">
          <div className="w-1/2">
            <p className="text-sm text-gray-500">DATE</p>
            <p className="font-medium">{new Date(booking.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}</p>
          </div>
          <div className="w-1/2">
            <p className="text-sm text-gray-500">CLASS</p>
            <p className="font-medium">{booking.class_type}</p>
          </div>
        </div>

        <div className="flex mb-4">
          <div className="w-1/2">
            <p className="text-sm text-gray-500">SEATS</p>
            <p className="font-medium">{booking.seats}</p>
          </div>
          <div className="w-1/2">
            <p className="text-sm text-gray-500">PNR</p>
            <p className="font-medium">{booking.pnr}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="font-semibold text-lg">₹{booking.fare.toFixed(2)}</p>
          {isUpcoming && booking.status !== 'Cancelled' && (
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              onClick={() => onCancelBooking(booking.id)}
            >
              Cancel Ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MyBookings = () => {
  const { currentUser, getUserBookings, cancelBooking } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getUserBookings();
        setBookings(data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load your bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser, getUserBookings]);

  const onCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const { success } = await cancelBooking(bookingId);
        if (success) {
          // Update bookings list after cancellation
          setBookings(bookings.map(booking => {
            if (booking.id === bookingId) {
              return { ...booking, status: 'Cancelled' };
            }
            return booking;
          }));
        } else {
          throw new Error('Cancellation failed');
        }
      } catch (err) {
        console.error('Error cancelling booking:', err);
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const today = new Date();

    if (activeTab === 'upcoming') {
      return bookingDate >= today && booking.status !== 'Cancelled';
    } else if (activeTab === 'completed') {
      return bookingDate < today || booking.status === 'Cancelled';
    }
    return true;
  });

  if (!currentUser) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <p className="text-center text-gray-600">Please log in to view your bookings.</p>
      </div>
    );
  }

  return (
    <div className="my-6 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">My Bookings</h2>
      </div>

      <div className="border-b">
        <div className="flex">
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'completed'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            Completed / Cancelled
          </button>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-6">
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-600">No {activeTab} bookings found.</p>
          </div>
        ) : (
          <div>
            {filteredBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancelBooking={onCancelBooking}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
