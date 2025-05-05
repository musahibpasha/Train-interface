import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import DatePicker from './components/DatePicker';
import ClassPicker from './components/ClassPicker';
import SearchButton from './components/SearchButton';
import BookingTypeTabs from './components/BookingTypeTabs';
import OffersSection from './components/OffersSecion';
import TrainSearchResults from './components/TrainSearchResults';
import BookingForm from './components/BookingForm';
import checkSupabaseConnection from './utils/checkConnection';
import AvailableTrains from './components/AvailableTrains';
import LiveTrainStatus from './components/LiveTrainStatus';
import HotelRecommendations from './components/HotelRecommendations';

// New imports for routing and pages
import MyBookingsPage from './pages/MyBookingsPage';
import MyProfilePage from './pages/MyProfilePage';
import Home from './pages/Home';

// Supabase config flags
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

console.log(supabaseUrl);
console.log(supabaseAnonKey);

// Fallback screen when Supabase isn't set up
const SupabaseConfigurationScreen = () => (
  <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-md p-8 max-w-lg w-full">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
      <p className="mb-4">
        Your Supabase credentials are not properly configured. The application requires valid Supabase URL and anonymous key to function properly.
      </p>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <h2 className="font-bold text-lg text-yellow-800">Required Steps:</h2>
        <ol className="list-decimal list-inside mt-2 space-y-2 text-yellow-800">
          <li>Open the <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file in your project</li>
          <li>Add your Supabase URL as <code className="bg-gray-100 px-2 py-1 rounded">VITE_SUPABASE_URL=your_url_here</code></li>
          <li>Add your Supabase anonymous key as <code className="bg-gray-100 px-2 py-1 rounded">VITE_SUPABASE_ANON_KEY=your_key_here</code></li>
          <li>Restart the development server</li>
        </ol>
      </div>
      <p className="text-sm text-gray-600">
        If you don't have a Supabase project yet, please create one at <a href="https://supabase.com" className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">supabase.com</a> and run the setup SQL script to initialize your database.
      </p>
    </div>
  </div>
);

const AppContent = () => {
  const { currentUser } = useAuth();
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [fromStations, setFromStations] = useState([]);
  const [toStations, setToStations] = useState([]);
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [travelDate, setTravelDate] = useState(new Date());
  const [seatClass, setSeatClass] = useState({ id: 'all', name: 'ALL', description: 'All Class' });
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [setupStatus, setSetupStatus] = useState(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeTab, setActiveTab] = useState('book');
  const [cityList, setCityList] = useState([]);

  useEffect(() => {
    fetch('/api/cities')
      .then(res => res.json())
      .then(data => setCityList(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (fromCity) {
      fetch(`/api/stations-by-city?city=${encodeURIComponent(fromCity)}`)
        .then(res => res.json())
        .then(data => setFromStations(Array.isArray(data) ? data : []))
        .catch(() => setFromStations([]));
    } else {
      setFromStations([]);
      setFromStation('');
    }
  }, [fromCity]);

  useEffect(() => {
    if (toCity) {
      fetch(`/api/stations-by-city?city=${encodeURIComponent(toCity)}`)
        .then(res => res.json())
        .then(data => setToStations(Array.isArray(data) ? data : []))
        .catch(() => setToStations([]));
    } else {
      setToStations([]);
      setToStation('');
    }
  }, [toCity]);

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const result = await checkSupabaseConnection();
        if (!result.success) {
          setConnectionStatus(result);
        }
      } catch (error) {
        console.error('Connection check error:', error);
      }
    };
    if (isSupabaseConfigured) {
      verifyConnection();
    }
  }, []);

  const handleSetupDatabase = async () => {
    setIsSettingUp(true);
    setSetupStatus(null);
    setSetupStatus({
      success: false,
      operations: ["For full database setup, please run the setup-trains.sql script in Supabase SQL Editor"],
      errors: ["Manual SQL setup required for tables and sample data"]
    });
    setIsSettingUp(false);
  };

  const handleSearch = () => {
    if (!fromStation && !toStation) {
      alert("Please select at least origin or destination station");
      return;
    }
    setShowResults(true);
  };

  const handleShowBookingForm = () => {
    if (!currentUser) {
      alert("Please log in to book a train");
      return;
    }
    setShowBookingForm(true);
    setShowResults(false);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setShowResults(false);
    setShowBookingForm(false);
  };

  const handleClassSelect = (classOption) => {
    setSeatClass(classOption);
  };

  const uniqueFromStations = Array.isArray(fromStations)
    ? Array.from(new Set(fromStations))
    : [];
  const uniqueToStations = Array.isArray(toStations)
    ? Array.from(new Set(toStations))
    : [];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cover image & header */}
      <div
        className="h-64 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1535535112387-56ffe8db21ff?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dHJhaW58ZW58MHx8MHx8fDA%3D')` }}
      >
        <div className="h-full flex items-center justify-center bg-black bg-opacity-50">
          <h1 className="text-white text-4xl font-bold">Welcome to Train Booking</h1>
        </div>
      </div>
      
      

      {/* Connection and setup warnings */}
      {connectionStatus && !connectionStatus.success && (
        <div className="mx-auto max-w-7xl px-4 py-2 mt-2">
          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded flex justify-between">
            <div>
              <p className="font-bold">Connection Warning</p>
              <p>{connectionStatus.message}</p>
              <p className="text-sm mt-1">Please set up your database tables.</p>
            </div>
            <button
              onClick={handleSetupDatabase}
              disabled={isSettingUp}
              className={`px-4 py-2 rounded-md text-white ${isSettingUp ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isSettingUp ? 'Setting Up...' : 'Setup Database'}
            </button>
          </div>
        </div>
      )}

      {setupStatus && (
        <div className="mx-auto max-w-7xl px-4 py-2 mt-2">
          <div className={`border-l-4 p-4 rounded ${setupStatus.success ? 'bg-green-100 border-green-500 text-green-700' : 'bg-blue-100 border-blue-500 text-blue-700'}`}>
            <p className="font-bold">{setupStatus.success ? 'Setup Successful' : 'Setup Instructions'}</p>
            {setupStatus.operations.length > 0 && (
              <ol className="list-decimal list-inside text-sm mt-2">
                {setupStatus.operations.map((op, i) => <li key={i}>{op}</li>)}
              </ol>
            )}
            {setupStatus.errors.length > 0 && (
              <ul className="list-disc list-inside text-sm mt-2">
                {setupStatus.errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Search form & results */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <BookingTypeTabs activeTab={activeTab} onTabChange={handleTabChange} />

          {activeTab === 'book' && (
            <>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From City</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={fromCity}
                    onChange={e => setFromCity(e.target.value)}
                  >
                    <option value="">Select city</option>
                    {cityList.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {fromCity && (
                    <>
                      <label className="block text-xs font-medium text-gray-500 mt-2">From Station</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={fromStation}
                        onChange={e => setFromStation(e.target.value)}
                      >
                        <option value="">Select station</option>
                        {uniqueFromStations.map(station => (
                          <option key={station} value={station}>{station}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To City</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={toCity}
                    onChange={e => setToCity(e.target.value)}
                  >
                    <option value="">Select city</option>
                    {cityList.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {toCity && (
                    <>
                      <label className="block text-xs font-medium text-gray-500 mt-2">To Station</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={toStation}
                        onChange={e => setToStation(e.target.value)}
                      >
                        <option value="">Select station</option>
                        {uniqueToStations.map(station => (
                          <option key={station} value={station}>{station}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
                <DatePicker
                  selectedDate={travelDate}
                  onDateSelect={setTravelDate}
                />
                <ClassPicker
                  label="Class"
                  selectedClass={seatClass}
                  onClassSelect={handleClassSelect}
                />
              </div>
              <div className="mt-6">
                <SearchButton onClick={handleSearch} />
              </div>
            </>
          )}
        </div>

        {showResults && (
          <TrainSearchResults
            fromStation={fromStation}
            toStation={toStation}
            date={travelDate}
            seatClass={seatClass.name}
            onBookTrain={handleShowBookingForm}
          />
        )}

        {showBookingForm && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <BookingForm
              onClose={() => setShowBookingForm(false)}
              activeTab={activeTab}
              fromStation={fromStation}
              toStation={toStation}
            />
          </div>
        )}

        {activeTab === 'live' && (
          <div className="mt-6">
            <LiveTrainStatus showLiveStatus />
          </div>
        )}

        {/* Hotel Recommendations section */}
        <HotelRecommendations />

        {/* Offers section */}
        <OffersSection />
      </div>
    </div>
  );
};

// Top‑level App with routing
const App = () => {
  if (!isSupabaseConfigured) {
    return <SupabaseConfigurationScreen />;
  }

  return (
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/"           element={<AppContent />} />
        <Route path="/mybookings" element={<MyBookingsPage />} />
        <Route path="/myprofiles" element={<MyProfilePage />} />
        <Route path="/stats"      element={<Home />} />
        <Route path="*"           element={<div>Page not found</div>} />
      </Routes>
    </AuthProvider>
  );
};

export default App;