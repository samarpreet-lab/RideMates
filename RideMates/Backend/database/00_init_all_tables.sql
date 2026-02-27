-- =====================================================
-- RideMates Database Initialization Script
-- =====================================================
-- 
-- This script creates all tables for RideMates in the correct order.
-- Run this ONCE when setting up your database.
-- 
-- Order is important:
--   1. users (no dependencies)
--   2. rides (depends on users)
--   3. bookings (depends on both users and rides)
--   4. fuel_rates (no dependencies, but used by pricing logic)
--

-- =====================================================
-- TABLE 1: users
-- Stores every verified university member
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid    VARCHAR(128) NOT NULL UNIQUE,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone           VARCHAR(15),
    university      VARCHAR(100) DEFAULT 'LPU',
    role            ENUM('student','faculty') DEFAULT 'student',
    profile_photo   VARCHAR(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_firebase_uid (firebase_uid),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='All verified university members';

-- =====================================================
-- TABLE 2: rides
-- Stores every ride posted by drivers
-- =====================================================

CREATE TABLE IF NOT EXISTS rides (
    id                  INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique ride ID',
    driver_id           INT NOT NULL COMMENT 'Reference to the driver (user)',
    origin_city         VARCHAR(100) NOT NULL COMMENT 'Starting city name (e.g., Phagwara)',
    origin_lat          DECIMAL(10,7) NOT NULL COMMENT 'Starting latitude',
    origin_lng          DECIMAL(10,7) NOT NULL COMMENT 'Starting longitude',
    destination_city    VARCHAR(100) NOT NULL COMMENT 'Ending city name (e.g., Jalandhar)',
    dest_lat            DECIMAL(10,7) NOT NULL COMMENT 'Destination latitude',
    dest_lng            DECIMAL(10,7) NOT NULL COMMENT 'Destination longitude',
    distance_km         DECIMAL(6,2) NOT NULL COMMENT 'Total distance in kilometers',
    departure_time      DATETIME NOT NULL COMMENT 'Departure time (stored in UTC)',
    available_seats     TINYINT NOT NULL DEFAULT 4 COMMENT 'Number of available seats',
    vehicle_type        ENUM('car','bike','auto') DEFAULT 'car' COMMENT 'Type of vehicle',
    vehicle_mileage     DECIMAL(5,2) DEFAULT 15.00 COMMENT 'Vehicle fuel efficiency (km/liter)',
    fuel_type           ENUM('petrol','diesel','cng','electric') DEFAULT 'petrol' COMMENT 'Type of fuel',
    base_price          DECIMAL(8,2) NOT NULL COMMENT 'System-calculated fuel cost',
    driver_set_price    DECIMAL(8,2) NOT NULL COMMENT 'Price set by driver (before capping)',
    capped_price        DECIMAL(8,2) NOT NULL COMMENT 'Final price after applying the 1.5x cap',
    is_emergency_route  BOOLEAN DEFAULT FALSE COMMENT 'TRUE if using alternate village roads',
    status              ENUM('active','completed','cancelled') DEFAULT 'active' COMMENT 'Ride status',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the ride was posted',
    
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_driver_id (driver_id),
    INDEX idx_destination (destination_city),
    INDEX idx_origin (origin_city),
    INDEX idx_status (status),
    INDEX idx_departure_time (departure_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='All rides posted by drivers - the main data for RideMates';

-- =====================================================
-- TABLE 3: bookings
-- Stores every seat reservation by passengers
-- =====================================================

CREATE TABLE IF NOT EXISTS bookings (
    id              INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique booking ID',
    ride_id         INT NOT NULL COMMENT 'Reference to the ride being booked',
    passenger_id    INT NOT NULL COMMENT 'Reference to the passenger (user)',
    seats_booked    TINYINT DEFAULT 1 COMMENT 'Number of seats reserved',
    price_paid      DECIMAL(8,2) NOT NULL COMMENT 'Total price paid by passenger',
    status          ENUM('confirmed','cancelled','completed') DEFAULT 'confirmed' COMMENT 'Booking status',
    booked_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the booking was made',
    
    UNIQUE KEY unique_ride_passenger (ride_id, passenger_id),
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_passenger_id (passenger_id),
    INDEX idx_ride_id (ride_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='All seat reservations - represents the relationship between passengers and rides';

-- =====================================================
-- TABLE 4: fuel_rates (Reference Table)
-- Stores current fuel prices for pricing calculations
-- =====================================================

CREATE TABLE IF NOT EXISTS fuel_rates (
    id              INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Fuel rate ID',
    fuel_type       ENUM('petrol','diesel','cng','electric') NOT NULL UNIQUE COMMENT 'Type of fuel',
    rate_per_litre  DECIMAL(6,2) NOT NULL COMMENT 'Price per liter (or kWh for electric)',
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When last updated',
    
    INDEX idx_fuel_type (fuel_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Current fuel prices used in pricing algorithm calculations';

-- Insert default fuel rates (India prices as of Feb 2026)
INSERT IGNORE INTO fuel_rates (fuel_type, rate_per_litre) VALUES
('petrol',  105.00),
('diesel',   92.00),
('cng',      80.00);

-- =====================================================
-- ✅ All tables created successfully!
-- =====================================================
-- 
-- Summary:
--   ✓ users table: Stores university members
--   ✓ rides table: Stores driver-posted rides
--   ✓ bookings table: Stores passenger bookings (with double-booking prevention)
--   ✓ fuel_rates table: Stores fuel prices for cost calculation
--
-- All foreign key relationships are set up with CASCADE delete.
-- All indexes are in place for fast queries.
--
-- Next steps:
--   1. Test by inserting a sample user
--   2. Create backend controllers (auth, rides, bookings)
--   3. Create API routes
