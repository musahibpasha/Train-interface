import React, { useState } from 'react';
import CityDropdown from '../components/CityDropdown';
import DestinationStats from '../components/DestinationStats';
import BookingTrendsChart from '../components/BookingTrendsChart';

const Home = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [mode, setMode] = useState('book');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Destination Statistics</h1>
      <div className="mb-8 flex items-center space-x-6">
        <label className="font-semibold">
          <input
            type="radio"
            name="mode"
            value="book"
            checked={mode === 'book'}
            onChange={() => setMode('book')}
            className="mr-2"
          />
          Book Train Ticket
        </label>
        <label className="font-semibold">
          <input
            type="radio"
            name="mode"
            value="pnr"
            checked={mode === 'pnr'}
            onChange={() => setMode('pnr')}
            className="mr-2"
          />
          Check PNR Status
        </label>
        <label className="font-semibold">
          <input
            type="radio"
            name="mode"
            value="live"
            checked={mode === 'live'}
            onChange={() => setMode('live')}
            className="mr-2"
          />
          Live Train Status
        </label>
        <label className="font-semibold">
          <input
            type="radio"
            name="mode"
            value="charts"
            checked={mode === 'charts'}
            onChange={() => setMode('charts')}
            className="mr-2"
          />
          Charts
        </label>
      </div>

      {mode === 'charts' ? (
        <BookingTrendsChart />
      ) : (
        <>
          <div className="mb-8">
            <CityDropdown
              label="Select Destination"
              placeholder="Choose a city"
              value={selectedCity}
              onChange={setSelectedCity}
            />
          </div>
          {selectedCity && (
            <div className="mt-8">
              <DestinationStats destination={selectedCity} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home; 