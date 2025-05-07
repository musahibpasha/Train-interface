import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const BookingTrendsChart = () => {
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/enhanced-booking-trends');
        if (!response.ok) throw new Error('Failed to fetch data');
        const trendsData = await response.json();
        
        // Format data for charts
        const formattedData = trendsData.map(item => ({
          name: new Date(item.month).toLocaleDateString('default', { month: 'short', year: 'numeric' }),
          bookings: item.total_bookings,
          hotels: item.unique_hotels,
          revenue: parseFloat(item.total_revenue)
        }));
        
        setData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart width={800} height={400} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="bookings" fill="#0088FE" name="Total Bookings" />
            <Bar dataKey="hotels" fill="#00C49F" name="Unique Hotels" />
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart width={800} height={400} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="bookings" stroke="#0088FE" name="Total Bookings" />
            <Line type="monotone" dataKey="revenue" stroke="#00C49F" name="Revenue" />
          </LineChart>
        );
      
      case 'pie':
        return (
          <PieChart width={800} height={400}>
            <Pie
              data={data}
              cx={400}
              cy={200}
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={150}
              fill="#8884d8"
              dataKey="bookings"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Booking Trends</h2>
        <div className="space-x-2">
          <button
            onClick={() => setChartType('bar')}
            className={`px-4 py-2 rounded ${chartType === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-4 py-2 rounded ${chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-4 py-2 rounded ${chartType === 'pie' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Pie
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        {renderChart()}
      </div>
    </div>
  );
};

export default BookingTrendsChart;