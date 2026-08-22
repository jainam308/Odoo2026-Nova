-- GlobeTrotter Database Schema

-- ============ MODULE A owns these ============
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  city VARCHAR(100),
  country VARCHAR(100),
  photo_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ensure all columns exist on pre-existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  country VARCHAR(100) NOT NULL,
  cost_index INTEGER DEFAULT 3, -- 1 (cheap) to 5 (expensive)
  popularity INTEGER DEFAULT 0,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50), -- sightseeing | food | adventure | nightlife | culture
  description TEXT,
  cost NUMERIC(10,2) DEFAULT 0,
  duration_minutes INTEGER,
  image_url TEXT
);

-- ============ MODULE B owns this ============
CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  cover_photo_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  share_slug VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============ MODULE C owns these ============
CREATE TABLE IF NOT EXISTS trip_stops (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  city_id INTEGER REFERENCES cities(id),
  start_date DATE,
  end_date DATE,
  order_index INTEGER DEFAULT 0,
  budget NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stop_activities (
  id SERIAL PRIMARY KEY,
  trip_stop_id INTEGER REFERENCES trip_stops(id) ON DELETE CASCADE,
  activity_id INTEGER REFERENCES activities(id),
  custom_name VARCHAR(200),
  custom_cost NUMERIC(10,2),
  scheduled_date DATE,
  order_index INTEGER DEFAULT 0,
  notes TEXT
);
