# Train Booking Interface

A comprehensive train ticket booking platform with city selection, dynamic pricing, and hotel recommendations. Built with React, Supabase, and Node.js.

---

## Features

### Core Functionality
- **City Search & Selection**  
  - Dynamic dropdowns with auto-suggest for 50+ Indian cities.  
  - Real-time station lookup using the `stations` table (see `seed_hotels.sql`).  

- **Date Picker & Calendar**  
  - Interactive calendar with disabled past dates.  
  - Supports round-trip bookings.  

- **Train Class Selection**  
  - Options: 1AC, 2AC, 3AC, Sleeper (SL), General.  
  - Dynamic fare calculation based on class and availability.  

- **Promo Codes & Discounts**  
  - Apply offers like `IRCTC20` for 20% off.  
  - Validations and real-time fare updates.  

- **Live Train Status**  
  - Fetches PNR status and delay alerts from IRCTC-like APIs.  
  - Displays route maps with intermediate stations.  

### User Management
- **Auth (Supabase)**  
  - Email/password and Google OAuth login.  
  - Session persistence and JWT validation.  

- **Booking Management**  
  - View/Cancel bookings with refund estimates.  
  - Download e-tickets as PDF.  

### Backend Integrations
- **Hotel Recommendations**  
  - Suggests nearby hotels based on destination (powered by `backend/seed_hotels.sql`).  
  - Filters by price, ratings, and amenities.  

---

## Component Breakdown

### Key React Components (`src/components/`)
| Component                | Description                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| `CityDropdown.jsx`       | Searchable dropdown for departure/arrival cities with station codes.        |
| `DatePicker.jsx`         | Interactive calendar with disabled dates and minimum connection times.       |
| `ClassPicker.jsx`        | Toggle between train classes with fare breakdowns.                          |
| `BookingForm.jsx`        | Multi-step form for passenger details, payment, and promo codes.            |
| `LiveTrainStatus.jsx`    | Displays real-time train status, delays, and platform numbers.              |
| `OffersSection.jsx`      | Shows dynamic offers (e.g., "Weekend Special: 15% off").                    |
| `SearchButton.jsx`       | Triggers train search with validation for mandatory fields.                 |
| `SimpleBookingForm.jsx`  | Minimalist form for quick bookings (used on homepage).                      |

### Utility Components (`src/utils/`)
- `api.js`: Handles Supabase auth and train/hotel API calls.  
- `fareCalculator.js`: Computes discounts, taxes, and totals.  
- `dateFormatter.js`: Converts timestamps to readable formats.  

---

## Project Structure

### Full Directory Tree

```
train-booking-interface/
├── public/                  # Static assets
│   ├── test-static.html     # Static HTML test file
│   ├── favicon.ico          # App icon
│   ├── robots.txt           # SEO configuration
│   └── assets/              # Additional static files
│       ├── fonts/           # Custom fonts
│       └── logos/           # Brand logos
│
├── supabase/                # Supabase configuration
│   ├── schema.sql           # Main database schema
│   ├── seed.sql             # Sample booking data
│   ├── migrations/          # Database migration scripts
│   └── functions/           # Edge functions (if any)
│
├── src/                     # Frontend source
│   ├── assets/              # Media assets
│   │   ├── images/          # App images
│   │   │   ├── bg.png       # Background image
│   │   │   ├── offers/      # Promotion images
│   │   │   └── icons/       # UI icons
│   │   └── styles/          # Global styles
│   │
│   ├── components/          # React components
│   │   ├── booking/         # Booking-related
│   │   │   ├── BookingForm.jsx
│   │   │   ├── ClassPicker.jsx
│   │   │   └── PaymentSection.jsx
│   │   ├── common/          # Reusable UI
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Modal.jsx
│   │   ├── search/          # Search functionality
│   │   │   ├── CityDropdown.jsx
│   │   │   ├── DatePicker.jsx
│   │   │   └── SearchButton.jsx
│   │   └── status/          # Train status
│   │       ├── LiveTrainStatus.jsx
│   │       └── PnrStatus.jsx
│   │
│   ├── context/             # State management
│   │   ├── AuthContext.jsx  # Authentication
│   │   └── BookingContext.jsx
│   │
│   ├── pages/               # Page components
│   │   ├── HomePage.jsx
│   │   ├── BookingPage.jsx
│   │   └── ProfilePage.jsx
│   │
│   ├── utils/               # Utilities
│   │   ├── api/             # API handlers
│   │   │   ├── trains.js
│   │   │   └── hotels.js
│   │   ├── helpers/         # Helper functions
│   │   │   ├── dateUtils.js
│   │   │   └── fareCalculator.js
│   │   └── constants.js     # App constants
│   │
│   ├── App.jsx              # Root component
│   └── main.jsx             # Entry point
│
├── backend/                 # Node.js server
│   ├── config/              # Configuration
│   │   ├── database.js      # DB connection
│   │   └── auth.js          # Auth middleware
│   ├── controllers/         # Business logic
│   │   ├── bookingController.js
│   │   └── hotelController.js
│   ├── models/              # Database models
│   │   ├── Booking.js
│   │   └── Hotel.js
│   ├── routes/              # API routes
│   │   ├── bookingRoutes.js
│   │   └── hotelRoutes.js
│   ├── seeders/             # Data seeders
│   │   ├── trainSeeder.js
│   │   └── hotelSeeder.js
│   ├── server.js            # Main server file
│   ├── package.json         # Dependencies
│   └── pnpm-lock.yaml       # Lock file
│
├── .github/                 # GitHub config
│   ├── workflows/           # CI/CD pipelines
│   └── ISSUE_TEMPLATE.md    # Issue templates
│
├── .vscode/                 # Editor config
│   ├── settings.json
│   └── extensions.json
│
├── tests/                   # Test suites
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
│
├── .env.example             # Environment variables
├── .gitignore               # Git ignore rules
├── package.json             # Frontend dependencies
├── vite.config.js           # Build config
├── README.md                # Project documentation
└── LICENSE                  # Project license
```

## Technologies Used

- **Frontend**: React, Tailwind CSS, Vite, Bun
- **Backend**: Supabase (Auth + Database), Node.js
- **Database**: PostgreSQL (via Supabase)
- **Tools**: Git, GitHub

## Additional Notes

- **Database Schema**: Refer to `supabase/schema.sql` for RLS policies and triggers.
- **Sample Data**: Use `seed.sql` and `seed_hotels.sql` for testing.
- **Backend**: The Node.js server (`backend/server.js`) supports hotel recommendations. Run it separately with `node server.js`.

---

## Setup and Installation

### 1. Supabase Database Setup
Follow these steps to set up the Supabase backend:

#### Option 1: SQL Editor (Recommended)
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** and run the scripts:
   - `setup.sql`: Core tables (profiles, bookings).
   - `setup-trains.sql`: Trains table and sample data.
   - `seed_hotels.sql`: Hotel recommendations (optional).

#### Option 2: Application Setup
1. Run `bun run dev` and click **Setup Database** in the app.

### 2. Local Installation
```bash
git clone https://github.com/musahibpasha/Train-interface
cd Train-interface
bun install
```

### 3. Run the Application
- **Development**: `bun run dev`
- **Production**: `bun run build && bun run preview`

### Backend API Endpoints (Node.js)
- `GET /api/trains`: Fetch trains between cities.  
- `POST /api/bookings`: Create new bookings.  
- `GET /api/hotels`: Get hotels near a station (uses `seed_hotels.sql`).  

---

## How to Contribute
1. Fork the repo and clone locally.  
2. Run `bun install` and set up Supabase.  
3. Submit PRs with clear descriptions.  

---

**Note**: For a visual guide, refer to the [Figma mockups](link-to-designs) (if available).  

For issues or contributions, open a GitHub issue or submit a pull request.
