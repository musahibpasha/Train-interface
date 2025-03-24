import supabase from './supabaseClient';

// Function to set up the database schema programmatically
export const setupDatabase = async () => {
  console.log("Starting database setup...");
  const results = {
    success: false,
    operations: [],
    errors: []
  };

  try {
    // 1. Create extension (with direct SQL)
    console.log("Creating UUID extension...");
    const { error: extensionError } = await supabase.rpc('exec', {
      query: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
    });

    if (extensionError) {
      results.errors.push(`UUID extension error: ${extensionError.message}`);
    } else {
      results.operations.push("UUID extension enabled");
    }

    // 2. Create profiles table (with direct SQL)
    console.log("Creating profiles table...");
    const { error: profilesError } = await supabase.rpc('exec', {
      query: `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        avatar_url TEXT,
        phone TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Enable Row-Level Security
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

      -- Create policies
      DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
      CREATE POLICY "Users can view their own profile"
        ON public.profiles FOR SELECT
        USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
      CREATE POLICY "Users can update their own profile"
        ON public.profiles FOR UPDATE
        USING (auth.uid() = id);

      DROP POLICY IF EXISTS "New users can insert their profile" ON public.profiles;
      CREATE POLICY "New users can insert their profile"
        ON public.profiles FOR INSERT
        WITH CHECK (auth.uid() = id);
      `
    });

    if (profilesError) {
      if (profilesError.message.includes('function "exec" does not exist')) {
        results.errors.push('Database admin privileges required. Please run the setup.sql script in the Supabase SQL Editor.');
      } else {
        results.errors.push(`Profiles table error: ${profilesError.message}`);
      }
    } else {
      results.operations.push("Profiles table created with RLS policies");

      // Check if the profiles table exists by querying it
      const { error: checkProfilesError } = await supabase.from('profiles').select('count').limit(1);

      if (checkProfilesError) {
        results.errors.push(`Failed to query profiles table: ${checkProfilesError.message}`);
      } else {
        results.operations.push("Profiles table verified and accessible");
      }
    }

    // If we couldn't create tables programmatically, suggest the SQL script approach
    if (results.errors.length > 0 && results.errors.some(e => e.includes('function "exec" does not exist'))) {
      results.operations.push("Please use the SQL Editor in Supabase dashboard to run the setup.sql script");
      results.success = false;
      return results;
    }

    // 3. Create bookings table (with direct SQL)
    console.log("Creating bookings table...");
    const { error: bookingsError } = await supabase.rpc('exec', {
      query: `
      CREATE TABLE IF NOT EXISTS public.bookings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        from_city TEXT NOT NULL,
        to_city TEXT NOT NULL,
        date DATE NOT NULL,
        train TEXT NOT NULL,
        train_number TEXT NOT NULL,
        seats TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Confirmed',
        pnr TEXT NOT NULL,
        fare DECIMAL(10,2) NOT NULL,
        class_type TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Enable Row-Level Security
      ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

      -- Create policies
      DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
      CREATE POLICY "Users can view their own bookings"
        ON public.bookings FOR SELECT
        USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
      CREATE POLICY "Users can update their own bookings"
        ON public.bookings FOR UPDATE
        USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
      CREATE POLICY "Users can create their own bookings"
        ON public.bookings FOR INSERT
        WITH CHECK (auth.uid() = user_id);
      `
    });

    if (bookingsError && !bookingsError.message.includes('function "exec" does not exist')) {
      results.errors.push(`Bookings table error: ${bookingsError.message}`);
    } else if (!bookingsError) {
      results.operations.push("Bookings table created with RLS policies");

      // Check if the bookings table exists by querying it
      const { error: checkBookingsError } = await supabase.from('bookings').select('count').limit(1);

      if (checkBookingsError) {
        results.errors.push(`Failed to query bookings table: ${checkBookingsError.message}`);
      } else {
        results.operations.push("Bookings table verified and accessible");
      }
    }

    // 4. Create triggers and functions (with direct SQL)
    console.log("Creating triggers and functions...");
    const { error: triggersError } = await supabase.rpc('exec', {
      query: `
      -- Create function to update timestamps
      CREATE OR REPLACE FUNCTION public.update_modified_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Create trigger for bookings
      DROP TRIGGER IF EXISTS set_bookings_updated_at ON public.bookings;
      CREATE TRIGGER set_bookings_updated_at
        BEFORE UPDATE ON public.bookings
        FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();

      -- Create trigger for profiles
      DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
      CREATE TRIGGER set_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();

      -- Create function to handle new user creation
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (id, name, email)
        VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email);
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Create trigger for user signup
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
      `
    });

    if (triggersError && !triggersError.message.includes('function "exec" does not exist')) {
      results.errors.push(`Triggers/functions error: ${triggersError.message}`);
    } else if (!triggersError) {
      results.operations.push("Triggers and functions created");
    }

    // 5. Check current user session and add profile if needed
    console.log("Checking user session...");
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      results.errors.push(`Session error: ${sessionError.message}`);
    } else if (sessionData?.session?.user) {
      results.operations.push(`Found authenticated user: ${sessionData.session.user.email}`);

      // Add profile record for current user (if not exists)
      const { data: insertProfileData, error: insertProfileError } = await supabase.rpc('exec', {
        query: `
        INSERT INTO public.profiles (id, name, email)
        SELECT
          '${sessionData.session.user.id}',
          '${sessionData.session.user.email.split('@')[0]}',
          '${sessionData.session.user.email}'
        WHERE
          NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = '${sessionData.session.user.id}');
        `
      });

      if (insertProfileError && !insertProfileError.message.includes('function "exec" does not exist')) {
        results.errors.push(`Profile creation error: ${insertProfileError.message}`);
      } else if (!insertProfileError) {
        results.operations.push("User profile created or updated");
      }

      // Try inserting profile using the standard API method as a fallback
      if (insertProfileError && insertProfileError.message.includes('function "exec" does not exist')) {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: sessionData.session.user.id,
            email: sessionData.session.user.email,
            name: sessionData.session.user.email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (upsertError) {
          if (upsertError.code === '42P01') { // Relation does not exist
            results.errors.push("Tables not created. Please run the setup.sql script in Supabase SQL Editor");
          } else {
            results.errors.push(`Profile insertion error: ${upsertError.message}`);
          }
        } else {
          results.operations.push("User profile created using API");
        }
      }

      // Create sample bookings for the user
      const sampleBookings = [
        {
          user_id: sessionData.session.user.id,
          from_city: 'Delhi',
          to_city: 'Mumbai',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          train: 'Rajdhani Express',
          train_number: '12952',
          seats: '2 (A3, 12, 13)',
          status: 'Confirmed',
          pnr: 'PNR' + Math.floor(Math.random() * 9000000000 + 1000000000),
          fare: 2750.00,
          class_type: '3A'
        },
        {
          user_id: sessionData.session.user.id,
          from_city: 'Kolkata',
          to_city: 'Chennai',
          date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          train: 'Howrah Mail',
          train_number: '12839',
          seats: '1 (S7, 54)',
          status: 'Waiting List (WL3)',
          pnr: 'PNR' + Math.floor(Math.random() * 9000000000 + 1000000000),
          fare: 1450.00,
          class_type: 'SL'
        }
      ];

      const { error: bookingsInsertError } = await supabase
        .from('bookings')
        .upsert(sampleBookings);

      if (bookingsInsertError) {
        if (bookingsInsertError.code === '42P01') { // Relation does not exist
          results.errors.push("Bookings table not created. Please run the setup.sql script in Supabase SQL Editor");
        } else {
          results.errors.push(`Sample bookings error: ${bookingsInsertError.message}`);
        }
      } else {
        results.operations.push("Sample bookings created");
      }
    } else {
      results.operations.push("No active user session found");
    }

    // Set overall success status
    results.success = results.errors.length === 0 ||
      (results.errors.length === 1 && results.errors[0].includes('function "exec" does not exist') &&
       results.operations.includes("User profile created using API"));

    console.log("Database setup completed", results);
    return results;

  } catch (error) {
    console.error("Fatal error in database setup:", error);
    results.errors.push(`Fatal error: ${error.message}`);
    results.success = false;
    results.operations.push("Please run the setup.sql script in the Supabase SQL Editor instead");
    return results;
  }
};

export default setupDatabase;
