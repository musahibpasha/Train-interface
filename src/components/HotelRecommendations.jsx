import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HotelRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/hotel-recommendations?limit=4');
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        const data = await response.json();
        setRecommendations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-40">Loading recommendations...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const HotelCard = ({ hotel, index }) => {
    const cardContent = (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-48">
          <img
            src={hotel.image_url || 'https://via.placeholder.com/400x300'}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full">
            <span className="text-yellow-500">★</span>
            <span className="ml-1">{hotel.rating}</span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{hotel.name}</h3>
          <p className="text-gray-600 text-sm mb-2">
            <i className="fas fa-map-marker-alt mr-2"></i>
            {hotel.city}
          </p>
          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{hotel.description}</p>
          
          {hotel.hotel_recommendations && (
            <div className="bg-blue-50 p-2 rounded-md mb-3">
              <p className="text-sm text-blue-700">
                {hotel.hotel_recommendations.recommendation_reason}
              </p>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-green-600">
              ₹{hotel.price_per_night}/night
            </span>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200">
              View Details
            </button>
          </div>
        </div>
      </div>
    );

    // Try to use motion if available, otherwise use regular div
    try {
      return (
        <motion.div
          key={hotel.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {cardContent}
        </motion.div>
      );
    } catch (e) {
      return <div key={hotel.id}>{cardContent}</div>;
    }
  };

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Recommended Hotels</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {recommendations.map((hotel, index) => (
            <HotelCard key={hotel.id} hotel={hotel} index={index} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HotelRecommendations; 