import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient';
import SimpleBookingForm from './components/SimpleBookingForm';

// Simple Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
          setCurrentUser(null);
        } else if (data?.user) {
          setCurrentUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email.split('@')[0]
          });
        }
      } catch (error) {
        console.error('Error in auth:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0]
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

// Simple Login Form
const SimpleLoginForm = () => {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignup) {
        const { success, error } = await signup(email, password, name);
        if (success) {
          setSuccess('Account created! Please check your email for verification.');
        } else {
          setError(error);
        }
      } else {
        const { success, error } = await login(email, password);
        if (!success) {
          setError(error);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{isSignup ? 'Create Account' : 'Login'}</h2>

      {error && <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
      {success && <div style={{ padding: '10px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', marginBottom: '15px' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        {isSignup && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              required={isSignup}
            />
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginBottom: '15px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Login'}
        </button>

        <button
          type="button"
          onClick={() => setIsSignup(!isSignup)}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: 'white',
            color: '#8b5cf6',
            border: '1px solid #8b5cf6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </button>
      </form>
    </div>
  );
};

// Main App Component
const SimpleApp = () => {
  const [databaseSetup, setDatabaseSetup] = useState(false);
  const [setupMessages, setSetupMessages] = useState([]);

  const setupDatabase = async () => {
    setSetupMessages([...setupMessages, "Starting database setup..."]);

    try {
      // Try to get table info
      const { error: trainInfoError } = await supabase
        .from('trains')
        .select('count')
        .limit(1);

      if (trainInfoError) {
        setSetupMessages([...setupMessages, "Trains table not found. Creating tables..."]);
        // We need to create the tables
        const createTrains = `
        CREATE TABLE IF NOT EXISTS public.trains (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          from_station TEXT NOT NULL,
          to_station TEXT NOT NULL,
          departure_time TIMESTAMPTZ NOT NULL,
          arrival_time TIMESTAMPTZ NOT NULL,
          total_seats INTEGER NOT NULL,
          available_seats INTEGER NOT NULL,
          price DECIMAL NOT NULL,
          train_number TEXT NOT NULL,
          class_type TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );`;

        try {
          await supabase.rpc('exec', { query: createTrains });
          setSetupMessages([...setupMessages, "Trains table created successfully!"]);
        } catch (err) {
          setSetupMessages([...setupMessages, `Failed to create trains table: ${err.message}. Please run setup-trains.sql in Supabase SQL Editor.`]);
        }

        // Add sample data
        setSetupMessages([...setupMessages, "Adding sample train data..."]);
        try {
          await supabase.from('trains').insert([
            {
              name: 'Rajdhani Express',
              from_station: 'Delhi',
              to_station: 'Mumbai',
              departure_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              arrival_time: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
              total_seats: 120,
              available_seats: 75,
              price: 2750,
              train_number: '12952',
              class_type: '3A'
            },
            {
              name: 'Shatabdi Express',
              from_station: 'Bangalore',
              to_station: 'Chennai',
              departure_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
              arrival_time: new Date(Date.now() + 54 * 60 * 60 * 1000).toISOString(),
              total_seats: 160,
              available_seats: 100,
              price: 1850,
              train_number: '12007',
              class_type: '2A'
            }
          ]);
          setSetupMessages([...setupMessages, "Sample train data added successfully!"]);
        } catch (err) {
          setSetupMessages([...setupMessages, `Failed to add sample data: ${err.message}`]);
        }
      } else {
        setSetupMessages([...setupMessages, "Trains table already exists!"]);
      }

      // Check if bookings table exists
      const { error: bookingsInfoError } = await supabase
        .from('bookings')
        .select('count')
        .limit(1);

      if (bookingsInfoError) {
        setSetupMessages([...setupMessages, "Bookings table not found. Creating table..."]);
        // Create bookings table
        const createBookings = `
        CREATE TABLE IF NOT EXISTS public.bookings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          train_id UUID,
          seat_count INTEGER NOT NULL,
          total_price DECIMAL NOT NULL,
          passenger_name TEXT,
          passenger_email TEXT,
          passenger_phone TEXT,
          status TEXT NOT NULL DEFAULT 'Confirmed',
          from_city TEXT,
          to_city TEXT,
          date DATE,
          train TEXT,
          train_number TEXT,
          seats TEXT,
          pnr TEXT,
          fare DECIMAL,
          class_type TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );`;

        try {
          await supabase.rpc('exec', { query: createBookings });
          setSetupMessages([...setupMessages, "Bookings table created successfully!"]);
        } catch (err) {
          setSetupMessages([...setupMessages, `Failed to create bookings table: ${err.message}. Please run setup-trains.sql in Supabase SQL Editor.`]);
        }
      } else {
        setSetupMessages([...setupMessages, "Bookings table already exists!"]);
      }

      setDatabaseSetup(true);
      setSetupMessages([...setupMessages, "Database setup completed successfully!"]);

    } catch (err) {
      setSetupMessages([...setupMessages, `Error setting up database: ${err.message}`]);
    }
  };

  const { currentUser } = useAuth();

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Train Booking System</h1>

      {!databaseSetup && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
          <h3>Database Setup Required</h3>
          <p>The database tables need to be set up before you can use the booking system.</p>
          <button
            onClick={setupDatabase}
            style={{
              padding: '10px 15px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Set Up Database
          </button>

          {setupMessages.length > 0 && (
            <div style={{ marginTop: '15px', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
              <h4>Setup Progress:</h4>
              <ul style={{ paddingLeft: '20px' }}>
                {setupMessages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {databaseSetup && !currentUser && (
        <SimpleLoginForm />
      )}

      {databaseSetup && currentUser && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <div>
              <p>Welcome, <strong>{currentUser.name}</strong></p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>{currentUser.email}</p>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              style={{
                padding: '8px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>

          <SimpleBookingForm />
        </div>
      )}
    </div>
  );
};

// Export AuthProvider for use in the main application
export { AuthProvider, AuthContext, useAuth };

export default SimpleApp;
