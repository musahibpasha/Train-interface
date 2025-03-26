import { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

const LiveTrainStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trainStatus, setTrainStatus] = useState(null);
  const [trainNumber, setTrainNumber] = useState('');
  const [availableTrains, setAvailableTrains] = useState([]);

  // Fetch available trains from your database
  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const { data, error } = await supabase
          .from('trains')
          .select('train_number, name')
          .order('name');
          
        if (error) throw error;
        setAvailableTrains(data || []);
      } catch (err) {
        console.error('Error fetching trains:', err);
      }
    };

    fetchTrains();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://live-train-status5.p.rapidapi.com/api/v1/train_status', {
        method: 'POST',
        headers: {
          'x-rapidapi-key': import.meta.env.VITE_RAPID_API_KEY,
          'x-rapidapi-host': 'live-train-status5.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trainNumber: trainNumber
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch train status');
      }

      if (data.status === 'NF' || data.status === 'NFT') {
        throw new Error('Train not found or not running today');
      }

      setTrainStatus(data.data);
    } catch (err) {
      console.error('Train status error:', err);
      setError(err.message || 'Failed to fetch train status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Live Train Status</h2>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="trainNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Select Train
          </label>
          <div className="flex gap-4">
            <select
              id="trainNumber"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select a train</option>
              {availableTrains.map((train) => (
                <option key={train.train_number} value={train.train_number}>
                  {train.name} ({train.train_number})
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading || !trainNumber}
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Status'}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {trainStatus && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{trainStatus.train_name}</h3>
                <p className="text-sm text-gray-600">Train No: {trainNumber}</p>
              </div>
              <div className={`px-3 py-1 rounded-full ${
                trainStatus.delay_time ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {trainStatus.delay_time ? `Delayed by ${trainStatus.delay_time}` : 'On Time'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Current Station</p>
                <p className="font-medium">{trainStatus.current_station_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{trainStatus.last_updated || 'N/A'}</p>
              </div>
            </div>

            {trainStatus.upcoming_stations && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Upcoming Stations</p>
                <div className="space-y-2">
                  {trainStatus.upcoming_stations.map((station, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{station.station_name}</span>
                      <span>{station.scheduled_arrival}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTrainStatus;