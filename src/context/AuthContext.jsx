import { createContext, useState, useContext, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Get session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setLoading(false);
          return;
        }

        if (session) {
          try {
            // Check if user profile exists
            const { data: userProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            // If profile doesn't exist, create it
            if (profileError && profileError.code === 'PGRST116') {
              // Create profile for user
              const { error: createProfileError } = await supabase
                .from('profiles')
                .insert([{
                  id: session.user.id,
                  name: session.user.user_metadata?.name || session.user.email.split('@')[0],
                  email: session.user.email
                }]);

              if (createProfileError) {
                console.error('Error creating profile:', createProfileError);
              }
            } else if (profileError) {
              console.error('Error fetching user profile:', profileError);
            }

            setCurrentUser({
              id: session.user.id,
              email: session.user.email,
              name: userProfile?.name || session.user.user_metadata?.name || session.user.email.split('@')[0],
              isAuthenticated: true
            });
          } catch (error) {
            console.error('Error in profile operations:', error);
            // Still set the user with session data
            setCurrentUser({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email.split('@')[0],
              isAuthenticated: true
            });
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Set up listener for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event);

          if (session) {
            try {
              // Get or create user profile
              let userProfile;
              const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (error) {
                if (error.code === 'PGRST116') {
                  // Profile doesn't exist, create it
                  const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert([{
                      id: session.user.id,
                      name: session.user.user_metadata?.name || session.user.email.split('@')[0],
                      email: session.user.email,
                      created_at: new Date().toISOString()
                    }])
                    .select();

                  if (createError) {
                    console.error('Error creating profile on auth change:', createError);
                  } else {
                    userProfile = newProfile[0];
                  }
                } else {
                  console.error('Error fetching user profile after auth change:', error);
                }
              } else {
                userProfile = data;
              }

              setCurrentUser({
                id: session.user.id,
                email: session.user.email,
                name: userProfile?.name || session.user.user_metadata?.name || session.user.email.split('@')[0],
                isAuthenticated: true
              });
            } catch (error) {
              console.error('Error processing auth change:', error);
              // Still set the user with session data
              setCurrentUser({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email.split('@')[0],
                isAuthenticated: true
              });
            }
          } else {
            setCurrentUser(null);
          }
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth state change listener:', error);
    }
  }, []);

  // Sign up with email and password
  const signup = async (email, password, name) => {
    try {
      // First, sign up with Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { success: false, error: error.message };
      }

      // Remember the email for verification
      setVerificationEmail(email);
      setVerificationSent(true);

      return {
        success: true,
        data,
        error: null,
        needsVerification: !data.user?.confirmed_at
      };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error.message || 'An error occurred during signup' };
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login response:', { data, error });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, error: error.message || 'Network error. Please try again.' };
    }
  };

  // Logout
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
      }

      setCurrentUser(null);
      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      return { success: false, error: error.message || 'An error occurred during logout' };
    }
  };

  // Get user bookings from Supabase
  const getUserBookings = async () => {
    if (!currentUser) return [];

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching bookings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  };

  // Create a new booking
  const createBooking = async (bookingData) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            ...bookingData,
            user_id: currentUser.id,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error creating booking:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error creating booking:', error);
      return { success: false, error: error.message || 'Failed to create booking' };
    }
  };

  // Cancel a booking
  const cancelBooking = async (bookingId) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'Cancelled' })
        .eq('id', bookingId)
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error cancelling booking:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return { success: false, error: error.message || 'Failed to cancel booking' };
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (email) => {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('Error resending verification:', error);
        return { success: false, error: error.message };
      }

      setVerificationEmail(email);
      setVerificationSent(true);
      return { success: true, data };
    } catch (error) {
      console.error('Error resending verification:', error);
      return { success: false, error: error.message || 'Failed to resend verification email' };
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    getUserBookings,
    createBooking,
    cancelBooking,
    resendVerificationEmail,
    verificationSent,
    verificationEmail,
    setVerificationSent,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
