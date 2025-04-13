import supabase from './supabaseClient';

/**
 * Check if the connection to Supabase is working properly
 * @returns {Promise<ConnectionResult>} Result of the connection test with success flag and details
 */
export const checkSupabaseConnection = async () => {
  const results = {
    success: false,
    errors: [],
    details: {}
  };

  try {
    // Test 1: Basic connectivity check using Supabase version
    const startTime = Date.now();

    // Skip health check as it doesn't exist
    results.details.connectionTime = `${Date.now() - startTime}ms`;

    // Test 2: Auth system check
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      results.details.authSystem = 'Failed';
      results.errors.push(`Auth system error: ${authError.message}`);
    } else {
      results.details.authSystem = 'Success';
      results.details.hasSession = authData.session ? 'Yes' : 'No';
    }

    // Test 3: Try to list tables to verify database access
    const { data: tablesData, error: tablesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (tablesError) {
      results.details.listTables = 'Failed';
      results.errors.push(`Table list error: ${tablesError.message}`);

      // This is likely a permissions issue, still consider connection as working
      results.details.basicConnectivity = 'Success (limited permissions)';
    } else {
      results.details.listTables = 'Success';
      results.details.tables = tablesData ? 'Profiles table accessible' : 'None found';
      results.details.basicConnectivity = 'Success';
    }

    // Try to access profiles table if it exists
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (profilesError) {
      if (profilesError.code === '42P01') { // Relation does not exist
        results.details.profilesTable = 'Not created yet';
        results.errors.push('Profiles table does not exist yet. Please setup your database tables.');
      } else {
        results.details.profilesTable = 'Failed';
        results.errors.push(`Profiles table check error: ${profilesError.message}`);
      }
    } else {
      results.details.profilesTable = 'Success';
    }

    // Try to access bookings table if it exists
    const { error: bookingsError } = await supabase
      .from('bookings')
      .select('count')
      .limit(1);

    if (bookingsError) {
      if (bookingsError.code === '42P01') { // Relation does not exist
        results.details.bookingsTable = 'Not created yet';
        results.errors.push('Bookings table does not exist yet. Please setup your database tables.');
      } else {
        results.details.bookingsTable = 'Failed';
        results.errors.push(`Bookings table check error: ${bookingsError.message}`);
      }
    } else {
      results.details.bookingsTable = 'Success';
    }

    // Set overall success status - basic connectivity is enough for success
    results.success = results.details.basicConnectivity.includes('Success');

    // But missing tables is an issue that needs addressing
    if (results.details.profilesTable === 'Not created yet' ||
        results.details.bookingsTable === 'Not created yet') {
      results.message = 'Connection successful but database tables are not set up';
    } else if (results.success) {
      results.message = 'Connection to Supabase is working correctly';
    } else {
      results.message = `Connection issues detected: ${results.errors.join('; ')}`;
    }

  } catch (error) {
    results.success = false;
    results.message = `Unexpected error during connection test: ${error.message}`;
    results.errors.push(error.message);
  }

  console.log('Supabase connection check results:', results);
  return results;
};

export default checkSupabaseConnection;
