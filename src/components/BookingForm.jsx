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
import supabase from '../utils/supabaseClient';

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
    hotel_id: '',
    booking_type: 'standard',
    payment_status: 'pending',
    total_amount: 0
  });
  const [formErrors, setFormErrors] = useState({});
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [stations, setStations] = useState([]);

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

  useEffect(() => {
    fetch('/api/stations')
      .then(res => res.json())
      .then(data => setStations(data))
      .catch(() => setStations([]));
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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.hotel_id && formData.includeHotel) {
      errors.hotel_id = 'Please select a hotel';
    }
    
    if (!formData.booking_type) {
      errors.booking_type = 'Please select a booking type';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      setLoading(true);
      try {
        // Find the selected train
        const selectedTrain = trains.find(train => train.id === formData.train_id);
        if (!selectedTrain) throw new Error('Selected train not found.');
        // Generate PNR
        const pnr = 'PNR' + Math.floor(Math.random() * 9000000000 + 1000000000);
        // Calculate total price and seats string
        const seatCount = parseInt(formData.seat_count);
        const baseTotal = selectedTrain.price * seatCount;
        const discount = appliedOffer ? (appliedOffer.discountPercentage / 100) * baseTotal : 0;
        const totalPrice = baseTotal - discount;
        const seats = `${seatCount} (auto-assigned)`;
        // Build booking object
        const newBooking = {
          user_id: currentUser?.id,
          train_id: formData.train_id,
          seat_count: seatCount,
          total_price: totalPrice,
          passenger_name: formData.passenger_name,
          passenger_email: formData.passenger_email,
          passenger_phone: formData.passenger_phone,
          passenger_address: formData.passenger_address,
          status: 'confirmed',
          from_city: selectedTrain.from_station,
          to_city: selectedTrain.to_station,
          date: new Date(selectedTrain.departure_time).toISOString().split('T')[0],
          train: selectedTrain.name,
          train_number: selectedTrain.train_number,
          seats: seats,
          pnr: pnr,
          fare: selectedTrain.price,
          class_type: selectedTrain.class_type
        };
        const response = await fetch('http://localhost:3000/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBooking)
        });
        if (!response.ok) throw new Error('Booking failed');
        const data = await response.json();
        setSuccess(true);
        // Optionally reset form or redirect
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    } else {
      setFormErrors(errors);
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="mb-6 p-4 rounded"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">From Station</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={fromStation}
                onChange={e => setFromStation(e.target.value)}
                required
              >
                <option value="">Select station</option>
                {stations.map(station => (
                  <option key={station} value={station}>{station}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">To Station</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={toStation}
                onChange={e => setToStation(e.target.value)}
                required
              >
                <option value="">Select station</option>
                {stations.map(station => (
                  <option key={station} value={station}>{station}</option>
                ))}
              </select>
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
                {trains
                  .filter(train =>
                    (!fromStation || train.from_station.toLowerCase().includes(fromStation.toLowerCase())) &&
                    (!toStation || train.to_station.toLowerCase().includes(toStation.toLowerCase())) &&
                    train.available_seats > 0
                  )
                  .map(train => (
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

          {formData.includeHotel && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Hotel Booking Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Hotel
                </label>
                <select
                  name="hotel_id"
                  value={formData.hotel_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Choose a hotel...</option>
                  {hotels.map(hotel => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name} - ${hotel.price_per_night}/night
                    </option>
                  ))}
                </select>
                {formErrors.hotel_id && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.hotel_id}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Booking Type
                </label>
                <select
                  name="booking_type"
                  value={formData.booking_type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-900">Booking Summary</h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600">
                    Train Fare: ${formData.trainFare || 0}
                  </p>
                  {formData.hotel_id && (
                    <p className="text-sm text-gray-600">
                      Hotel Stay: ${formData.hotelFare || 0}
                    </p>
                  )}
                  <div className="border-t border-gray-200 pt-2">
                    <p className="text-sm font-medium text-gray-900">
                      Total Amount: ${formData.total_amount}
                    </p>
                  </div>
                </div>
              </div>
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
              {loading ? 'Processing...' : 'Complete Booking'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookingForm;