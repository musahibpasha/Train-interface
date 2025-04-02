import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import supabase from '../utils/supabaseClient';



const PNR_API_KEY = import.meta.env.VITE_PNR_API_KEY;

const BookingForm = ({ onClose, selectedTrain = null }) => {
  const { currentUser } = useAuth();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [formData, setFormData] = useState({
    train_id: selectedTrain?.id || '',
    seat_count: 1,
    passenger_name: currentUser?.name || '',
    passenger_email: currentUser?.email || '',
    passenger_phone: '',
    passenger_address: '',
  });

  // Fetch available trains
  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('trains')
          .select('*')
          .order('departure_time', { ascending: true });

        if (error) {
          throw error;
        }

        setTrains(data || []);
      } catch (err) {
        console.error('Error fetching trains:', err);
        setError('Failed to load available trains.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
  }, []);

  // Initialize with selected train if provided
  useEffect(() => {
    if (selectedTrain) {
      setFormData(prev => ({
        ...prev,
        train_id: selectedTrain.id
      }));
    }
  }, [selectedTrain]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Please login to make a booking');
      }
  
      const selectedTrainDetails = trains.find(t => t.id === formData.train_id);
      if (!selectedTrainDetails) {
        throw new Error('Selected train not found');
      }
  
      // Generate PNR (using your existing logic)
      const pnrNumber = `PNR${Date.now().toString().slice(-10)}`;
  
      // Create booking with explicit user_id
      const booking = {
        user_id: user.id, // Make sure this matches the authenticated user's ID
        train_id: formData.train_id,
        from_city: selectedTrainDetails.from_station,
        to_city: selectedTrainDetails.to_station,
        date: new Date(selectedTrainDetails.departure_time).toISOString().split('T')[0],
        train: selectedTrainDetails.name,
        train_number: selectedTrainDetails.train_number,
        seat_count: parseInt(formData.seat_count),
        status: 'confirmed',
        pnr: pnrNumber,
        fare: selectedTrainDetails.price,
        total_price: selectedTrainDetails.price * parseInt(formData.seat_count),
        class_type: selectedTrainDetails.class_type,
        passenger_name: formData.passenger_name,
        passenger_email: formData.passenger_email,
        passenger_phone: formData.passenger_phone,
        passenger_address: formData.passenger_address,
        seats: `${formData.seat_count} (${selectedTrainDetails.class_type})`
      };
  
      const { data, error: insertError } = await supabase
        .from('bookings')
        .insert([booking])
        .select()
        .single();
  
      if (insertError) {
        console.error('Booking error:', insertError);
        throw new Error('Failed to create booking. Please try again.');
      }
  
      setSuccess(true);
      if (onClose) {
        setTimeout(onClose, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Book Train Ticket</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold">Booking Successful!</h3>
          <p>Your train ticket has been booked successfully. You can view it in the My Bookings section.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="train_id" className="block text-sm font-medium text-gray-700 mb-1">
              Select Train
            </label>
            <select
              id="train_id"
              name="train_id"
              value={formData.train_id}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select a train</option>
              {trains.map(train => (
                <option key={train.id} value={train.id}>
                  {train.name} - {train.from_station} to {train.to_station} - {new Date(train.departure_time).toLocaleString()} - ₹{train.price} ({train.available_seats} seats available)
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="seat_count" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Seats
            </label>
            <input
              type="number"
              id="seat_count"
              name="seat_count"
              min="1"
              max="6"
              value={formData.seat_count}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="passenger_name" className="block text-sm font-medium text-gray-700 mb-1">
              Passenger Name
            </label>
            <input
              type="text"
              id="passenger_name"
              name="passenger_name"
              value={formData.passenger_name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="passenger_email" className="block text-sm font-medium text-gray-700 mb-1">
              Passenger Email
            </label>
            <input
              type="email"
              id="passenger_email"
              name="passenger_email"
              value={formData.passenger_email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="passenger_phone" className="block text-sm font-medium text-gray-700 mb-1">
              Passenger Phone
            </label>
            <input
              type="tel"
              id="passenger_phone"
              name="passenger_phone"
              value={formData.passenger_phone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="passenger_address" className="block text-sm font-medium text-gray-700 mb-1">
              Passenger Address
            </label>
            <textarea
              id="passenger_address"
              name="passenger_address"
              value={formData.passenger_address}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
  {/* Promo Code */}
  <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Tag className="h-4 w-4" />
            <span className="text-sm font-medium">Promo Code</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="w-full p-2 border rounded text-sm font-mono"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap text-xs"
            >
              Apply Code
            </Button>
          </div>

          {promoCode && (
            <p className="text-xs text-primary">
              Promotional code "{promoCode}" will be applied to your booking.
            </p>
          )}
        </div>
          {/* Booking Summary */}
          {formData.train_id && (
            <div className="mb-6 bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-700 mb-2">Booking Summary</h3>
              {trains.find(t => t.id === formData.train_id) && (
                <>
                  <p><span className="font-medium">Train:</span> {trains.find(t => t.id === formData.train_id).name}</p>
                  <p><span className="font-medium">Route:</span> {trains.find(t => t.id === formData.train_id).from_station} to {trains.find(t => t.id === formData.train_id).to_station}</p>
                  <p><span className="font-medium">Departure:</span> {new Date(trains.find(t => t.id === formData.train_id).departure_time).toLocaleString()}</p>
                  <p><span className="font-medium">Arrival:</span> {new Date(trains.find(t => t.id === formData.train_id).arrival_time).toLocaleString()}</p>
                  <p><span className="font-medium">Seats:</span> {formData.seat_count}</p>
                  <p><span className="font-medium">Price per seat:</span> ₹{trains.find(t => t.id === formData.train_id).price}</p>
                  <p className="font-bold mt-2">Total Price: ₹{(trains.find(t => t.id === formData.train_id).price * formData.seat_count).toFixed(2)}</p>
                </>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Book Now'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookingForm;
