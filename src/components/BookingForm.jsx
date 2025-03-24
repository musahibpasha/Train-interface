import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import supabase from '../utils/supabaseClient';

const BookingForm = ({ onClose, selectedTrain = null }) => {
  const { currentUser } = useAuth();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
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

    if (!currentUser) {
      setError('Please log in to book a train.');
      return;
    }

    if (!formData.train_id) {
      setError('Please select a train.');
      return;
    }

    if (!formData.passenger_name || !formData.passenger_email) {
      setError('Passenger name and email are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Get selected train details
      const selectedTrain = trains.find(train => train.id === formData.train_id);
      if (!selectedTrain) {
        throw new Error('Selected train not found.');
      }

      // Check if enough seats are available
      if (selectedTrain.available_seats < formData.seat_count) {
        setError(`Only ${selectedTrain.available_seats} seats available.`);
        return;
      }

      // Calculate total price
      const totalPrice = parseFloat(selectedTrain.price) * parseInt(formData.seat_count);

      // Generate PNR
      const pnr = 'PNR' + Math.floor(Math.random() * 9000000000 + 1000000000);

      // Create booking record
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: currentUser.id,
            train_id: formData.train_id,
            seat_count: parseInt(formData.seat_count),
            total_price: totalPrice,
            passenger_name: formData.passenger_name,
            passenger_email: formData.passenger_email,
            passenger_phone: formData.passenger_phone,
            passenger_address: formData.passenger_address,
            status: 'Confirmed',
            from_city: selectedTrain.from_station,
            to_city: selectedTrain.to_station,
            date: new Date(selectedTrain.departure_time).toISOString().split('T')[0],
            train: selectedTrain.name,
            train_number: selectedTrain.train_number,
            seats: `${formData.seat_count} (auto-assigned)`,
            pnr: pnr,
            fare: selectedTrain.price,
            class_type: selectedTrain.class_type
          }
        ]);

      if (error) {
        throw error;
      }

      // Update available seats in the train record
      const { error: updateError } = await supabase
        .from('trains')
        .update({ available_seats: selectedTrain.available_seats - parseInt(formData.seat_count) })
        .eq('id', selectedTrain.id);

      if (updateError) {
        console.error('Error updating train seats:', updateError);
        // Don't fail the booking if seat update fails
      }

      setSuccess(true);

      // Reset form after successful booking
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 3000);

    } catch (err) {
      console.error('Error booking train:', err);
      setError(err.message || 'Failed to book train. Please try again.');
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
