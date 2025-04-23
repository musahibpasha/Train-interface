import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import adaniImage from '../assests/adani one offers.jpg';
import offersImage from '../assests/offers.jpg';
import offers2Image from '../assests/offers2.jpeg';
import bg from '../assests/bg.png';
import { Tag } from 'lucide-react';
import { Button } from './ui/Button'; // Assuming you have Button component
import CityDropdown from './CityDropdown';
import DatePicker from './DatePicker';

const cities = [
  'Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bangalore',
  'Hyderabad', 'Ahmedabad', 'Pune', 'Jaipur', 'Patna',
  'Howrah', 'New Delhi'
];

const availableOffers = [
  {
    id: 'offer-1',
    title: 'Sample Offer 1',
    description: '20% discount on ticket fare.',
    discountPercentage: 20,
    code: 'SAMPLE20',
    validUntil: '2025-04-30',
    type: 'special',
    image: adaniImage,
  },
  {
    id: 'offer-2',
    title: 'Sample Offer 2',
    description: '15% discount on ticket fare.',
    discountPercentage: 15,
    code: 'SAMPLE15',
    validUntil: '2025-05-31',
    type: 'seasonal',
    image: offersImage,
  },
  {
    id: 'offer-3',
    title: 'Sample Offer 3',
    description: '10% discount on ticket fare.',
    discountPercentage: 10,
    code: 'SAMPLE10',
    validUntil: '2025-06-30',
    type: 'exclusive',
    image: offers2Image,
  }
];

const BookingForm = ({ onClose, activeTab }) => {
  const { currentUser } = useAuth();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [travelDate, setTravelDate] = useState(new Date());
  const [formData, setFormData] = useState({
    train_id: '',
    seat_count: 1,
    passenger_name: currentUser?.name || '',
    passenger_email: currentUser?.email || '',
    passenger_phone: '',
    passenger_address: '',
    class_type: 'ALL',
  });

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/trains');
        const data = await res.json();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleApplyPromoCode = () => {
    const matchingOffer = availableOffers.find(
      offer => offer.code.toLowerCase() === promoCode.trim().toLowerCase()
    );
    if (matchingOffer) {
      setAppliedOffer(matchingOffer);
    } else {
      setError('Invalid promo code.');
    }
  };

  const handleApplyOffer = (offer) => {
    setAppliedOffer(offer);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const resUser = await fetch('http://localhost:5000/api/users/me');
      const { user } = await resUser.json();
      if (!user) {
        throw new Error('Please login to make a booking');
      }

      const selectedTrainDetails = trains.find(t => t.id === formData.train_id);
      if (!selectedTrainDetails) {
        throw new Error('Selected train not found');
      }

      const pnrNumber = `PNR${Date.now().toString().slice(-10)}`;

      const seatCount = parseInt(formData.seat_count);
      const baseTotal = selectedTrainDetails.price * seatCount;
      const discount = appliedOffer ? (appliedOffer.discountPercentage / 100) * baseTotal : 0;
      const totalPrice = baseTotal - discount;

      const booking = {
        user_id: user.id,
        train_id: formData.train_id,
        from_city: fromCity,
        to_city: toCity,
        date: travelDate.toISOString().split('T')[0],
        train: selectedTrainDetails.name,
        train_number: selectedTrainDetails.train_number,
        seat_count: seatCount,
        status: 'confirmed',
        pnr: pnrNumber,
        fare: selectedTrainDetails.price,
        total_price: totalPrice,
        class_type: formData.class_type,
        passenger_name: formData.passenger_name,
        passenger_email: formData.passenger_email,
        passenger_phone: formData.passenger_phone,
        passenger_address: formData.passenger_address,
        seats: `${formData.seat_count} (${selectedTrainDetails.class_type})`
      };

      const resp = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });

      if (!resp.ok) {
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

  if (activeTab === 'Live Train Status' || activeTab === 'PNR') {
    return null;
  }

  return (
    <div
      className="max-w-4xl mx-auto p-6 rounded-lg shadow-md"
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
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
          <div
            className="mb-6 p-4 rounded"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="mb-4">
              
              <CityDropdown
                label="From"
                cities={cities}
                value={fromCity}
                onChange={setFromCity}
                placeholder="Enter origin city"
                excludeCity={toCity}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div className="mb-4">
              
              <CityDropdown
                label="To"
                cities={cities}
                value={toCity}
                onChange={setToCity}
                placeholder="Enter destination city"
                excludeCity={fromCity}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div className="mb-4">
              
              <DatePicker
                selectedDate={travelDate}
                onDateSelect={setTravelDate}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div className="mb-4">
             
              <select
                id="class_type"
                name="class_type"
                value={formData.class_type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="ALL">ALL</option>
                <option value="AC">AC</option>
                <option value="NON-AC">NON-AC</option>
              </select>
            </div>
            <div className="mb-4">
              
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
          </div>

          <div className="mb-4">
            
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
                onClick={handleApplyPromoCode}
                type="button"
              >
                Apply Code
              </Button>
            </div>
             {promoCode && appliedOffer && (
              <p className="text-xs text-green-700">
                Applied Promo: {appliedOffer.code} ({appliedOffer.discountPercentage}% Off)
              </p>
            )}
           </div>

          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-2">Or Apply an Offer</h3>
            <div className="grid grid-cols-3 gap-4">
              {availableOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="border rounded-lg overflow-hidden flex flex-col"
                >
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2 flex flex-col flex-grow">
                    <h4 className="text-sm font-semibold">{offer.title}</h4>
                    <p className="text-xs">{offer.description}</p>
                    <p className="text-xs mt-1"><strong>{offer.discountPercentage}% Off</strong></p>
                    <button
                      type="button"
                      onClick={() => handleApplyOffer(offer)}
                      className="mt-auto text-xs text-purple-600 hover:underline"
                    >
                      Apply Offer
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {appliedOffer && (
              <div className="mt-2 p-2 border border-green-300 rounded">
                <p className="text-green-700 text-sm">
                  Applied Offer: <strong>{appliedOffer.code}</strong> ({appliedOffer.discountPercentage}% Off)
                </p>
              </div>
            )}
          </div>
          {formData.train_id && (
            <div className="mb-6 bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-700 mb-2">Booking Summary</h3>
              {trains.find(t => t.id === formData.train_id) && (() => {
                const selected = trains.find(t => t.id === formData.train_id);
                const seatCount = parseInt(formData.seat_count);
                const baseTotal = selected.price * seatCount;
                const discount = appliedOffer ? (appliedOffer.discountPercentage / 100) * baseTotal : 0;
                const totalPrice = baseTotal - discount;

                return (
                  <>
                    <p><span className="font-medium">Train:</span> {selected.name}</p>
                    <p><span className="font-medium">Route:</span> {selected.from_station} to {selected.to_station}</p>
                    <p><span className="font-medium">Departure:</span> {new Date(selected.departure_time).toLocaleString()}</p>
                    <p><span className="font-medium">Seats:</span> {formData.seat_count}</p>
                    <p><span className="font-medium">Price per seat:</span> ₹{selected.price}</p>
                    {appliedOffer && (
                      <p className="text-green-700">
                        Discount: -₹{discount.toFixed(2)} ({appliedOffer.discountPercentage}% Off)
                      </p>
                    )}
                    <p className="font-bold mt-2">Grand Total: ₹{totalPrice.toFixed(2)}</p>
                  </>
                );
              })()}
            </div>
          )}
          <div className="flex justify-end space-x-2">
            {onClose && (
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Book Now'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookingForm;