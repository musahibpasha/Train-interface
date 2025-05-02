import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const DestinationStats = ({ destination }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDestinationStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/destination-stats?city=${destination}`);
        if (!response.ok) {
          throw new Error('Failed to fetch destination statistics');
        }
        const stats = await response.json();
        setData([
          { name: 'Hotels', value: stats.hotelsCount },
          { name: 'Bookings', value: stats.bookingsCount },
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (destination) {
      fetchDestinationStats();
    }
  }, [destination]);

  if (loading) {
    return (
      <div className="w-full h-[400px] p-4 bg-white rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-gray-600">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] p-4 bg-white rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Destination Statistics for {destination}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" name="Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DestinationStats; 