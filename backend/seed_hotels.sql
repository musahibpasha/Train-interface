-- Create hotels table if it doesn't exist
CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    rating DECIMAL(2,1),
    price_per_night DECIMAL(10,2),
    amenities TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create hotel_recommendations table if it doesn't exist
CREATE TABLE IF NOT EXISTS hotel_recommendations (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(id),
    recommendation_score DECIMAL(3,2),
    recommendation_reason TEXT,
    is_featured BOOLEAN DEFAULT false,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create stations table if it doesn't exist
CREATE TABLE IF NOT EXISTS stations (
    id SERIAL PRIMARY KEY,
    station_name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL
);

-- Insert sample stations for major cities
INSERT INTO stations (station_name, city) VALUES
('Ahmedabad Junction', 'Ahmedabad'),
('Maninagar', 'Ahmedabad'),
('Sabarmati Junction', 'Ahmedabad'),
('Bangalore City', 'Bangalore'),
('Yesvantpur', 'Bangalore'),
('Krishnarajapuram', 'Bangalore'),
('Chennai Central', 'Chennai'),
('Chennai Egmore', 'Chennai'),
('Perambur', 'Chennai'),
('New Delhi', 'Delhi'),
('Delhi Junction', 'Delhi'),
('Hazrat Nizamuddin', 'Delhi');

-- Add more stations for major cities and new cities
INSERT INTO stations (station_name, city) VALUES
-- Ahmedabad
('Vastrapur', 'Ahmedabad'),
('Gandhigram', 'Ahmedabad'),
('Kali Road', 'Ahmedabad'),
-- Bangalore
('Banaswadi', 'Bangalore'),
('Whitefield', 'Bangalore'),
('Malleswaram', 'Bangalore'),
-- Chennai
('Tambaram', 'Chennai'),
('Guindy', 'Chennai'),
('Avadi', 'Chennai'),
-- Delhi
('Anand Vihar Terminal', 'Delhi'),
('Shakurbasti', 'Delhi'),
('Tilak Bridge', 'Delhi'),
-- Mumbai
('Mumbai Central', 'Mumbai'),
('Bandra Terminus', 'Mumbai'),
('Dadar', 'Mumbai'),
('Lokmanya Tilak Terminus', 'Mumbai'),
-- Hyderabad
('Secunderabad Junction', 'Hyderabad'),
('Kacheguda', 'Hyderabad'),
('Hyderabad Deccan', 'Hyderabad'),
-- Kolkata
('Howrah Junction', 'Kolkata'),
('Sealdah', 'Kolkata'),
('Santragachi', 'Kolkata'),
-- Pune
('Pune Junction', 'Pune'),
('Shivajinagar', 'Pune'),
('Hadapsar', 'Pune'),
-- Jaipur
('Jaipur Junction', 'Jaipur'),
('Gandhinagar Jaipur', 'Jaipur'),
('Durgapura', 'Jaipur'),
-- Patna
('Patna Junction', 'Patna'),
('Rajendra Nagar Terminal', 'Patna'),
('Danapur', 'Patna'),
-- Howrah
('Howrah Junction', 'Howrah'),
('Shalimar', 'Howrah'),
('Santragachi', 'Howrah'),
-- Lucknow
('Lucknow NR', 'Lucknow'),
('Lucknow NE', 'Lucknow'),
('Aishbagh', 'Lucknow'),
-- Kanpur
('Kanpur Central', 'Kanpur'),
('Govindpuri', 'Kanpur'),
('Panki Dham', 'Kanpur'),
-- Nagpur
('Nagpur Junction', 'Nagpur'),
('Ajni', 'Nagpur'),
('Itwari', 'Nagpur'),
-- Indore
('Indore Junction', 'Indore'),
('Laxmibai Nagar', 'Indore'),
('Dewas', 'Indore'),
-- Thane
('Thane', 'Thane'),
('Kalwa', 'Thane'),
('Diva', 'Thane'),
-- Bhopal
('Bhopal Junction', 'Bhopal'),
('Habibganj', 'Bhopal'),
('Sant Hirdaram Nagar', 'Bhopal'),
-- Visakhapatnam
('Visakhapatnam Junction', 'Visakhapatnam'),
('Duvvada', 'Visakhapatnam'),
('Simhachalam', 'Visakhapatnam'),
-- Vadodara
('Vadodara Junction', 'Vadodara'),
('Makarpura', 'Vadodara'),
('Bajwa', 'Vadodara'),
-- Ghaziabad
('Ghaziabad Junction', 'Ghaziabad'),
('Sahibabad', 'Ghaziabad'),
('Maripat', 'Ghaziabad'),
-- Ludhiana
('Ludhiana Junction', 'Ludhiana'),
('Dhandari Kalan', 'Ludhiana'),
('Gill', 'Ludhiana');

-- Insert sample hotels
INSERT INTO hotels (name, city, address, description, image_url, rating, price_per_night, amenities) VALUES
-- Delhi Hotels
('The Grand Delhi', 'Delhi', 'Connaught Place, New Delhi', 'Luxury hotel in the heart of Delhi with modern amenities and excellent service.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 4.5, 12000, ARRAY['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym']),
('Delhi Heritage Inn', 'Delhi', 'Old Delhi, Delhi', 'Traditional Indian architecture with modern comforts in historic Old Delhi.', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', 4.2, 8000, ARRAY['WiFi', 'Restaurant', 'Room Service']),

-- Mumbai Hotels
('Mumbai Bay View', 'Mumbai', 'Marine Drive, Mumbai', 'Stunning views of the Arabian Sea with luxury accommodations.', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', 4.7, 15000, ARRAY['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Beach Access']),
('Mumbai Business Hotel', 'Mumbai', 'Bandra Kurla Complex, Mumbai', 'Perfect for business travelers with conference facilities.', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80', 4.3, 10000, ARRAY['WiFi', 'Business Center', 'Restaurant']),

-- Bangalore Hotels
('Tech Park Hotel', 'Bangalore', 'Electronic City, Bangalore', 'Modern hotel near tech parks with high-speed internet.', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80', 4.4, 9000, ARRAY['WiFi', 'Business Center', 'Restaurant', 'Gym']),
('Garden City Resort', 'Bangalore', 'Indiranagar, Bangalore', 'Peaceful retreat in the heart of the city.', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', 4.1, 7500, ARRAY['WiFi', 'Garden', 'Restaurant']),

-- Chennai Hotels
('Marina Beach Hotel', 'Chennai', 'Marina Beach Road, Chennai', 'Beachfront hotel with traditional South Indian hospitality.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 4.6, 11000, ARRAY['WiFi', 'Pool', 'Beach Access', 'Restaurant']),
('Chennai Heritage', 'Chennai', 'Mylapore, Chennai', 'Heritage property with modern amenities.', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', 4.0, 7000, ARRAY['WiFi', 'Restaurant', 'Cultural Tours']),

-- Kolkata Hotels
('Howrah Riverside', 'Kolkata', 'Howrah Bridge Road, Kolkata', 'Riverside hotel with views of the Hooghly River.', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80', 4.3, 8500, ARRAY['WiFi', 'River View', 'Restaurant', 'Cultural Shows']),
('Kolkata Business Inn', 'Kolkata', 'Park Street, Kolkata', 'Business hotel in the heart of Kolkata.', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80', 4.2, 8000, ARRAY['WiFi', 'Business Center', 'Restaurant']);

-- Insert hotel recommendations
INSERT INTO hotel_recommendations (hotel_id, recommendation_score, recommendation_reason, is_featured, valid_from, valid_until) VALUES
(1, 0.95, 'Top-rated luxury hotel in Delhi with excellent service and amenities', true, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
(3, 0.92, 'Stunning sea views and premium facilities in Mumbai', true, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
(5, 0.90, 'Perfect for tech professionals with high-speed internet and business facilities', true, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
(7, 0.88, 'Beautiful beachfront location with authentic South Indian hospitality', true, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
(9, 0.85, 'Unique riverside experience with cultural activities', true, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days');

-- Update existing trains to use real station names
UPDATE trains SET from_station = 'Ahmedabad Junction' WHERE from_station = 'Ahmedabad';
UPDATE trains SET from_station = 'Bangalore City' WHERE from_station = 'Bangalore';
UPDATE trains SET from_station = 'Chennai Central' WHERE from_station = 'Chennai';
UPDATE trains SET from_station = 'New Delhi' WHERE from_station = 'Delhi';

UPDATE trains SET to_station = 'Ahmedabad Junction' WHERE to_station = 'Ahmedabad';
UPDATE trains SET to_station = 'Bangalore City' WHERE to_station = 'Bangalore';
UPDATE trains SET to_station = 'Chennai Central' WHERE to_station = 'Chennai';
UPDATE trains SET to_station = 'New Delhi' WHERE to_station = 'Delhi';

-- You can add more updates for other stations/cities as needed 