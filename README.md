# Train Booking Interface

A train ticket booking interface similar to MakeMyTrip/IRCTC with city dropdowns, date picker, dynamic offers, and user authentication.

## Features

- City search and selection
- Date picker with integrated calendar
- Train class selection
- Apply promo codes and special offers during booking (with discount calculations)
- Live train status view with background imagery
- User authentication with Supabase
- Booking management (view, create, cancel)
- Responsive design with Tailwind CSS

## Setup and Installation

### Supabase Database Setup

This application requires a Supabase backend for authentication and data storage. Follow these steps to set up your database:

#### Option 1: Using the SQL Editor (Recommended)

1. Log into your Supabase dashboard at [Supabase](https://supabase.com/dashboard).
2. Select your project (e.g., "makymytrip").
3. Navigate to the **SQL Editor** section in the left sidebar.
4. Click **New Query**.
5. Copy and paste the entire contents of the `setup.sql` file from this repository (located in your root directory or the supabase folder).
6. Click **Run** to execute the script.

The script will:
- Create a **profiles** table linked to Supabase auth users.
- Create a **bookings** table for train tickets.
- Set up Row Level Security (RLS) policies.
- Create triggers for automatic timestamp updates.
- Add sample bookings for your authenticated user.

#### Option 2: Using the Application Setup Button

1. Start the application using `bun run dev`.
2. Log in with your Supabase account.
3. If you see a connection warning at the top of the page, click the **Setup Database** button.
4. The application will attempt to set up the database tables programmatically.

### Local Installation

Clone the repository and install dependencies using Bun:

```bash
# Clone the repository
git clone https://github.com/musahibpasha/Train-interface

# Navigate to the project directory
cd train-booking-interface

# Install dependencies
bun install
```

### Running the Application

Start the development server with Bun:

```bash
bun run dev
```

### Building for Production

To build and preview the production version:

```bash
# Build the application
bun run build

# Preview the production build
bun run preview
```

## Project Structure

```
train-booking-interface/
├── public/              # Static assets (e.g., test-static.html)
├── supabase/            # Supabase schema and seed files
│   ├── schema.sql       # SQL schema (includes tables, RLS policies, triggers)
│   └── seed.sql         # Sample seed data for testing
├── src/                 # Source code
│   ├── assests/         # Images and other media
│   │   ├── adani one offers.jpg
│   │   ├── bg.png
│   │   ├── ChatGPT Image Apr 2, 2025, 10_29_21 PM.png
│   │   ├── offers.jpg
│   │   └── offers2.jpeg
│   ├── components/      # React components
│   │   ├── AvailableTrains.jsx
│   │   ├── BookingForm.jsx
│   │   ├── BookingTypeTabs.jsx
│   │   ├── CityDropdown.jsx
│   │   ├── ClassPicker.jsx
│   │   ├── date-time-picker-form.jsx
│   │   ├── DatePicker.jsx
│   │   ├── Header.jsx
│   │   ├── LiveTrainStatus.jsx
│   │   ├── LoginModal.jsx
│   │   ├── MyBookings.jsx
│   │   ├── NavIcons.jsx
│   │   ├── OffersSecion.jsx
│   │   ├── SearchButton.jsx
│   │   └── SimpleBookingForm.jsx
│   ├── context/         # Context providers (Auth, etc.)
│   ├── pages/           # Page level components
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main App component
│   └── main.jsx         # Entry point
├── setup.sql            # SQL setup script for Supabase (optional copy)
└── vite.config.ts       # Vite configuration
```

## Technologies Used

- **React:** UI library for building dynamic interfaces.
- **Tailwind CSS:** Utility-first CSS framework for building custom designs.
- **Supabase:** Backend-as-a-Service used for authentication and database management.
- **Vite:** Next-generation frontend tooling.
- **Bun:** Fast JavaScript runtime and package manager.

## Additional Notes

- The **BookingForm** component includes dynamic sections where users can apply promo codes and offers to reduce the total fare.
- Live status view and other form sections use background imagery from the `assests` folder. Make sure the folder name is correctly spelled (if it should be "assets", update the path accordingly).
- Refer to the `supabase/schema.sql` and `supabase/seed.sql` files for setting up your database schema and sample data.

---

For any issues or further customization, please refer to the documentation within the repository or raise an issue on GitHub.
