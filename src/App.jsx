import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import CityDropdown from './components/CityDropdown';
import DatePicker from './components/DatePicker';
import ClassPicker from './components/ClassPicker';
import SearchButton from './components/SearchButton';
import BookingTypeTabs from './components/BookingTypeTabs';
// import NavIcons from './components/NavIcons';
import OffersSection from './components/OffersSecion';
import TrainSearchResults from './components/TrainSearchResults';
import BookingForm from './components/BookingForm';
import checkSupabaseConnection from './utils/checkConnection';
import AvailableTrains from './components/AvailableTrains'; // Import the AvailableTrains component
 // Ensure you have a CSS file for styling

// Sample cities data - use the cities mentioned in the trains
const cities = [
  'Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bangalore',
  'Hyderabad', 'Ahmedabad', 'Pune', 'Jaipur', 'Patna',
  'Howrah', 'New Delhi'
];

// Check if Supabase credentials are properly configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Fallback component when Supabase is not configured
const SupabaseConfigurationScreen = () => {
  return (
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
};

const AppContent = () => {
  const { currentUser } = useAuth();
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [travelDate, setTravelDate] = useState(new Date());
  const [seatClass, setSeatClass] = useState({ id: 'all', name: 'ALL', description: 'All Class' });
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [setupStatus, setSetupStatus] = useState(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeTab, setActiveTab] = useState('book');

  useEffect(() => {
    // Check Supabase connection on initial load
    const verifyConnection = async () => {
      try {
        const result = await checkSupabaseConnection();
        console.log('Supabase connection check:', result);
        // Only set connection status if there's an issue
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

    try {
      // Run setup SQL directly in Supabase SQL Editor
      // Instead of trying to run it programmatically, provide instructions
      setSetupStatus({
        success: false,
        operations: ["For full database setup, please run the setup-trains.sql script in Supabase SQL Editor"],
        errors: ["Manual SQL setup required for tables and sample data"]
      });
    } catch (error) {
      console.error('Setup database error:', error);
      setSetupStatus({
        success: false,
        errors: [`Setup failed: ${error.message}`],
        operations: []
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleSearch = () => {
    if (!fromCity && !toCity) {
      alert("Please select at least origin or destination city");
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
    // Reset search results when changing tabs
    setShowResults(false);
    setShowBookingForm(false);
  };

  const handleClassSelect = (classOption) => {
    setSeatClass(classOption);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cover Image Section */}
      <div
        className="h-64 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1535535112387-56ffe8db21ff?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dHJhaW58ZW58MHx8MHx8fDA%3D')`,
        }}
      >
        <div className="h-full flex items-center justify-center bg-black bg-opacity-50">
          <h1 className="text-white text-4xl font-bold">Welcome to Train Booking</h1>
        </div>
      </div>

      {/* Rest of the content */}
      <Header />

      {connectionStatus && !connectionStatus.success && (
        <div className="mx-auto max-w-7xl px-4 py-2 mt-2">
          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">Connection Warning</p>
                <p>{connectionStatus.message}</p>
                <p className="text-sm mt-1">Please set up your database tables.</p>
              </div>
              <button
                onClick={handleSetupDatabase}
                disabled={isSettingUp}
                className={`px-4 py-2 rounded-md text-white ${isSettingUp ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isSettingUp ? 'Setting Up...' : 'Setup Database'}
              </button>
            </div>
          </div>
        </div>
      )}

      {setupStatus && (
        <div className="mx-auto max-w-7xl px-4 py-2 mt-2">
          <div className={`border-l-4 p-4 rounded ${setupStatus.success ? 'bg-green-100 border-green-500 text-green-700' : 'bg-blue-100 border-blue-500 text-blue-700'}`}>
            <p className="font-bold">{setupStatus.success ? 'Setup Successful' : 'Setup Instructions'}</p>

            {setupStatus.operations.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Required Steps:</p>
                <ol className="list-decimal list-inside text-sm">
                  {setupStatus.operations.map((op, index) => (
                    <li key={index}>{op}</li>
                  ))}
                </ol>
              </div>
            )}

            {setupStatus.errors.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Notes:</p>
                <ul className="list-disc list-inside text-sm">
                  {setupStatus.errors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* <NavIcons /> */}

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <BookingTypeTabs activeTab={activeTab} onTabChange={handleTabChange} />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <CityDropdown
              label="From"
              cities={cities}
              value={fromCity}
              onChange={setFromCity}
              placeholder="Enter origin city"
              excludeCity={toCity}
            />
            <CityDropdown
              label="To"
              cities={cities}
              value={toCity}
              onChange={setToCity}
              placeholder="Enter destination city"
              excludeCity={fromCity}
            />
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
          {/* Promo Code
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
              >
                Apply Code
              </Button>
            </div>

            {promoCode && (
              <p className="text-xs text-primary">
                Promotional code "{promoCode}" will be applied to your booking.
              </p>
            )}
          </div> */}
          <div className="mt-6">
            <SearchButton onClick={handleSearch} />
          </div>
        </div>

        {showResults && (
          <TrainSearchResults
            fromCity={fromCity}
            toCity={toCity}
            date={travelDate}
            seatClass={seatClass.name}
            onBookTrain={handleShowBookingForm}
          />
        )}

        {showBookingForm && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <BookingForm onClose={() => setShowBookingForm(false)} />
          </div>
        )}

        {/* Replace MyBookings with AvailableTrains */}
        <AvailableTrains />

        <OffersSection />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      {isSupabaseConfigured ? <AppContent /> : <SupabaseConfigurationScreen />}
    </AuthProvider>
  );
};

export default App;
