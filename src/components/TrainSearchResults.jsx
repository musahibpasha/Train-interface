import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import supabase from '../utils/supabaseClient';
import BookingForm from './BookingForm';

const TrainSearchResults = ({ fromCity, toCity, date, seatClass, onBookTrain }) => {
  const { currentUser } = useAuth();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setLoading(true);
        setError('');

        let query = supabase
          .from('trains')
          .select('*');

        // Add filters if provided
        if (fromCity) {
          query = query.ilike('from_station', `%${fromCity}%`);
        }

        if (toCity) {
          query = query.ilike('to_station', `%${toCity}%`);
        }

        if (seatClass && seatClass !== 'ALL') {
          query = query.eq('class_type', seatClass);
        }

        // Date filtering would require more complex logic with departure_time

        // Order by departure time
        query = query.order('departure_time', { ascending: true });

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        // Filter out trains with no available seats
        const availableTrains = data.filter(train => train.available_seats > 0);

        setTrains(availableTrains || []);
      } catch (err) {
        console.error('Error fetching trains:', err);
        setError('Failed to load available trains. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
  }, [fromCity, toCity, date, seatClass]);

  const handleBookNow = (train) => {
    if (!currentUser) {
      alert('Please log in to book a train.');
      return;
    }

    // If parent provided a booking handler, use it
    if (onBookTrain) {
      setSelectedTrain(train);
      onBookTrain(train);
    } else {
      // Otherwise use internal state
      setSelectedTrain(train);
      setShowBookingForm(true);
    }
  };

  const closeBookingForm = () => {
    setShowBookingForm(false);
    setSelectedTrain(null);
  };

  // Helper function to format duration
  const formatDuration = (departure, arrival) => {
    const startTime = new Date(departure);
    const endTime = new Date(arrival);
    const durationMs = endTime - startTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md">
      {showBookingForm ? (
        <div className="p-6">
          <button
            onClick={closeBookingForm}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to train list
          </button>
          <BookingForm onClose={closeBookingForm} selectedTrain={selectedTrain} />
        </div>
      ) : (
        <>
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Available Trains
              {fromCity && toCity && (
                <span className="text-base font-normal text-gray-600 ml-2">
                  from {fromCity} to {toCity}
                </span>
              )}
            </h2>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            ) : trains.length === 0 ? (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="mt-4 text-gray-500">No trains found matching your criteria</p>
                <p className="text-gray-400 text-sm mt-2">
                  Try changing your search parameters or select a different date
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {trains.map(train => (
                  <div key={train.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between items-start">
                      <div className="mb-4 md:mb-0">
                        <h3 className="font-semibold text-lg text-gray-800">{train.name}</h3>
                        <p className="text-sm text-gray-600">Train #{train.train_number} • {train.class_type}</p>
                      </div>
                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <p className="font-semibold">{new Date(train.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-sm text-gray-600">{new Date(train.departure_time).toLocaleDateString([], { day: 'numeric', month: 'short' })}</p>
                          <p className="text-xs text-gray-500">{train.from_station}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <p className="text-xs text-gray-500">{formatDuration(train.departure_time, train.arrival_time)}</p>
                          <div className="w-20 h-0.5 bg-gray-300 my-1 relative">
                            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-gray-400"></div>
                            <div className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-gray-400"></div>
                          </div>
                          <p className="text-xs text-gray-500">{train.available_seats} seats</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">{new Date(train.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-sm text-gray-600">{new Date(train.arrival_time).toLocaleDateString([], { day: 'numeric', month: 'short' })}</p>
                          <p className="text-xs text-gray-500">{train.to_station}</p>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex flex-col items-end">
                        <p className="font-semibold text-lg text-purple-700">₹{train.price.toFixed(2)}</p>
                        <button
                          className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                          onClick={() => handleBookNow(train)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TrainSearchResults;
