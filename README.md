# Train Booking Interface

A train ticket booking interface similar to MakeMyTrip/IRCTC with city dropdowns, date picker, and user authentication.

## Features

- City search and selection
- Date picker with calendar
- Train class selection
- User authentication with Supabase
- Booking management (view, create, cancel)
- Responsive design

## Setting Up Supabase Database

This application requires a Supabase backend for authentication and data storage. Follow these steps to set up your database:

### Option 1: Using the SQL Editor (Recommended)

1. Log into your Supabase dashboard at https://supabase.com/dashboard
2. Select your project (in this case, "makymytrip")
3. Navigate to the "SQL Editor" section in the left sidebar
4. Click "New Query"
5. Copy and paste the entire contents of the `setup.sql` file from this repository
6. Click "Run" to execute the script

The script will:
- Create a profiles table linked to Supabase auth users
- Create a bookings table for train tickets
- Set up Row Level Security (RLS) policies
- Create triggers for automatic timestamp updates
- Add sample bookings for your authenticated user

### Option 2: Using the Application Setup Button

If you prefer using the application's built-in setup:

1. Start the application using `bun run dev`
2. Log in with your Supabase account
3. If you see a connection warning at the top of the page, click the "Setup Database" button
4. The application will attempt to set up the database tables programmatically

### Troubleshooting Database Issues

If you encounter database connection issues:

1. **Check Supabase Project URL**: Make sure your project URL is correct in `vite.config.ts`
2. **Anon Key**: Verify that your Supabase anon key is valid
3. **SQL Editor**: Try running the setup script directly in the SQL Editor
4. **RLS Policies**: Check that the Row Level Security policies are set correctly
5. **Network Issues**: Make sure your network can connect to Supabase

## Development

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/train-booking-interface.git

# Navigate to the project directory
cd train-booking-interface

# Install dependencies
bun install
```

### Running the Application

```bash
# Start the development server
bun run dev
```

### Building for Production

```bash
# Build the application
bun run build

# Preview the production build
bun run preview
```

## Project Structure

```
train-booking-interface/
├── public/              # Static assets
├── src/                 # Source code
│   ├── components/      # React components
│   ├── context/         # Context providers (Auth)
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main application
│   └── main.jsx         # Entry point
├── setup.sql            # SQL setup script for Supabase
└── vite.config.ts       # Vite configuration
```

## Technologies Used

- React
- Tailwind CSS
- Supabase (Authentication & Database)
- Vite
- Bun
