import React, { useState, useEffect } from 'react';

const AvailableTrains = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/trains');
        const data = await res.json();
        setTrains(data || []);
      } catch (err) {
        console.error('Error fetching trains:', err);
        setError('Failed to fetch available trains.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
  }, []);

  if (loading) {
    return <p>Loading available trains...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Available Trains</h1>
      {trains.length === 0 ? (
        <p>No trains available at the moment.</p>
      ) : (
        <ul className="space-y-4">
          {trains.map((train) => (
            <li
              key={train.id}
              className="p-4 border border-gray-200 rounded-md shadow-sm"
            >
              <h2 className="text-lg font-semibold">{train.name}</h2>
              <p className="text-sm text-gray-600">
                From: {train.from_station} - To: {train.to_station}
              </p>
              <p className="text-sm text-gray-600">
                Departure: {train.departure_time}
              </p>
              <p className="text-sm text-gray-600">
                Arrival: {train.arrival_time}
              </p>
              <p className="text-sm text-gray-600">Class: {train.class_type}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AvailableTrains;