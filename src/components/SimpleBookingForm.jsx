import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SimpleBookingForm = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [trains, setTrains] = useState([]);
  const [formData, setFormData] = useState({
    train_id: '',
    seat_count: 1,
    passenger_name: currentUser?.name || '',
    passenger_email: currentUser?.email || '',
    passenger_phone: '',
  });

  // Fetch available trains
  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const res  = await fetch('/api/trains');
        const data = await res.json();
        setTrains(data || []);
      } catch (err) {
        console.error('Error fetching trains:', err);
      }
    };
    fetchTrains();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    try {
      setLoading(true);
      setError('');

      // Get selected train details
      const selectedTrain = trains.find(train => train.id === formData.train_id);
      if (!selectedTrain) {
        throw new Error('Selected train not found.');
      }

      // Generate PNR
      const pnr = 'PNR' + Math.floor(Math.random() * 9000000000 + 1000000000);

      // Create booking record
      const newBooking = {
        user_id: currentUser.id,
        train_id: formData.train_id,
        seat_count: parseInt(formData.seat_count),
        total_price: parseFloat(selectedTrain.price) * parseInt(formData.seat_count),
        passenger_name: formData.passenger_name,
        passenger_email: formData.passenger_email,
        passenger_phone: formData.passenger_phone,
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
      };

      const resp = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });

      if (!resp.ok) {
        throw new Error('Booking failed');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error booking train:', err);
      setError(err.message || 'Failed to book train. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '500px',
        margin: '0 auto',
        backgroundImage: `url(${require('../assests/offers2.jpeg')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '8px',
        color: 'white',
      }}
    >
      <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
        Book a Train Ticket
      </h2>

      {error && (
        <div
          style={{
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      {success ? (
        <div
          style={{
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '4px',
          }}
        >
          <h3 style={{ fontWeight: 'bold' }}>Booking Successful!</h3>
          <p>Your train ticket has been booked successfully.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Select Train
            </label>
            <select
              name="train_id"
              value={formData.train_id}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              required
            >
              <option value="">Select a train</option>
              {trains.map(train => (
                <option key={train.id} value={train.id}>
                  {train.name} - {train.from_station} to {train.to_station} - ₹{train.price}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Number of Seats
            </label>
            <input
              type="number"
              name="seat_count"
              min="1"
              max="6"
              value={formData.seat_count}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Passenger Name
            </label>
            <input
              type="text"
              name="passenger_name"
              value={formData.passenger_name}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Passenger Email
            </label>
            <input
              type="email"
              name="passenger_email"
              value={formData.passenger_email}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Passenger Phone
            </label>
            <input
              type="tel"
              name="passenger_phone"
              value={formData.passenger_phone}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#6b21a8',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Booking...' : 'Book Now'}
          </button>
        </form>
      )}
    </div>
);
}
export default SimpleBookingForm;