-- =====================================================
-- RideMates Database Initialization Script (SRS v1.3)
-- =====================================================
-- 
-- This script DROPS all old tables and recreates them
-- from scratch to match the SRS exactly.
-- 
-- ⚠️  WARNING: This will DELETE all existing data!
--     Only run this when you want a fresh database.
--
-- Drop order (reverse of create — respect foreign keys):
--   reports → bookings → rides → user_otps → users → fuel_rates
--
-- Create order (dependencies first):
--   1. users      (no dependencies)
--   2. user_otps  (depends on users — OTP verification records)
--   3. rides      (depends on users)
--   4. bookings   (depends on users + rides)
--   5. reports    (depends on users + rides)
--   6. fuel_rates (no dependencies, used by pricing logic)
--

-- =====================================================
-- STEP 0: Drop existing tables
-- =====================================================

DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS rides;
DROP TABLE IF EXISTS user_otps;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS fuel_rates;


-- =====================================================
-- TABLE 1: users
-- =====================================================
-- Stores every verified university member.
--
-- • No firebase_uid — auth is handled by backend OTP + JWT
-- • gender         → used for women-only ride filtering
-- • trust_score    → starts at 100, decremented by penalties
-- • current_streak → consecutive clean rides, resets on penalty
-- =====================================================

CREATE TABLE users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(100) NOT NULL               COMMENT 'User full name',
    email           VARCHAR(100) NOT NULL UNIQUE        COMMENT 'University email (must be @lpu.in)',
    phone           VARCHAR(15)                         COMMENT 'Phone number (optional)',
    university      VARCHAR(100) DEFAULT 'LPU'          COMMENT 'University name',
    role            ENUM('student', 'faculty') DEFAULT 'student' COMMENT 'User role',
    profile_photo   VARCHAR(255)                        COMMENT 'URL to profile photo (optional)',
    gender          ENUM('male', 'female', 'other') DEFAULT 'other' COMMENT 'Used for women-only ride filtering',
    trust_score     INT NOT NULL DEFAULT 100            COMMENT 'Trust score — starts at 100, penalties deduct points',
    current_streak  INT NOT NULL DEFAULT 0              COMMENT 'Consecutive clean rides — resets to 0 on any penalty',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='All verified university members (SRS Section 5.1)';


-- =====================================================
-- TABLE 2: user_otps (SRS v1.4 — OTP Authentication)
-- =====================================================
-- Stores backend-generated 6-digit OTPs for email verification.
--
-- • otp_hash       → SHA-256 hash of the 6-digit OTP (never store plaintext)
-- • expires_at     → OTP valid for 10 minutes (SRS FR-AUTH-08)
-- • attempts       → tracks failed verification attempts (max 3, SRS FR-AUTH-10)
-- • is_verified    → set to TRUE once OTP is successfully verified
-- • purpose        → 'login' or 'signup' to distinguish flows
-- =====================================================

CREATE TABLE user_otps (
    id              INT AUTO_INCREMENT PRIMARY KEY       COMMENT 'Unique OTP record ID',
    email           VARCHAR(100) NOT NULL                COMMENT 'Email the OTP was sent to',
    otp_hash        VARCHAR(64) NOT NULL                 COMMENT 'SHA-256 hash of the 6-digit OTP',
    purpose         ENUM('login', 'signup') NOT NULL DEFAULT 'login' COMMENT 'Whether OTP is for login or signup',
    attempts        INT NOT NULL DEFAULT 0               COMMENT 'Failed verification attempts (locked after 3)',
    is_verified     BOOLEAN DEFAULT FALSE                COMMENT 'TRUE once OTP successfully verified',
    expires_at      DATETIME NOT NULL                    COMMENT 'OTP expiry time (10 minutes after creation)',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP  COMMENT 'When the OTP was generated',

    INDEX idx_email (email),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='OTP records for email verification (SRS Section 5.1, FR-AUTH-02)';


-- =====================================================
-- TABLE 3: rides
-- =====================================================
-- Stores every ride posted by drivers.
-- Depends on: users (driver_id → users.id)
--
-- • vehicle_type includes 'scooter' (SRS v1.3)
-- • capped_price uses vehicle-specific multiplier
-- • is_women_only, instant_booking, instant_booking_ack
-- • completed_at starts the 12-hour report grace period
-- =====================================================

CREATE TABLE rides (
    id                  INT AUTO_INCREMENT PRIMARY KEY   COMMENT 'Unique ride ID',
    driver_id           INT NOT NULL                     COMMENT 'FK → users.id (who posted this ride)',
    origin_city         VARCHAR(100) NOT NULL            COMMENT 'Starting city name (e.g., Phagwara)',
    origin_lat          DECIMAL(10, 7) NOT NULL          COMMENT 'Starting GPS latitude',
    origin_lng          DECIMAL(10, 7) NOT NULL          COMMENT 'Starting GPS longitude',
    destination_city    VARCHAR(100) NOT NULL            COMMENT 'Ending city name (e.g., Jalandhar)',
    dest_lat            DECIMAL(10, 7) NOT NULL          COMMENT 'Destination GPS latitude',
    dest_lng            DECIMAL(10, 7) NOT NULL          COMMENT 'Destination GPS longitude',
    distance_km         DECIMAL(6, 2) NOT NULL           COMMENT 'Total route distance in km (from Mapbox)',
    departure_time      DATETIME NOT NULL                COMMENT 'Departure time stored in UTC (ISO 8601)',
    available_seats     TINYINT NOT NULL CHECK (available_seats >= 0) COMMENT 'Seats currently available',
    vehicle_type        ENUM('bike', 'scooter', 'auto', 'car') DEFAULT 'car'
                                                         COMMENT 'Vehicle type — determines price cap multiplier (bike/scooter 1.2x, auto 1.35x, car 1.5x)',
    vehicle_mileage     DECIMAL(5, 2) DEFAULT 15.00      COMMENT 'Fuel efficiency in km/litre',
    fuel_type           ENUM('petrol', 'diesel', 'cng', 'electric') DEFAULT 'petrol' COMMENT 'Fuel type',
    base_price          DECIMAL(8, 2) NOT NULL           COMMENT 'System-calculated total raw fuel cost (reference only)',
    driver_set_price    DECIMAL(8, 2) NOT NULL           COMMENT 'Per-seat price the driver wants to charge',
    capped_price        DECIMAL(8, 2) NOT NULL           COMMENT 'Per-seat final price = MIN(driver_set_price, max_per_seat). Stored per-seat for price certainty (SRS v1.5)',
    is_emergency_route  BOOLEAN DEFAULT FALSE            COMMENT 'TRUE = alternate village road during highway strikes',
    is_women_only       BOOLEAN DEFAULT FALSE            COMMENT 'TRUE = only female passengers can instant-book',
    instant_booking     BOOLEAN DEFAULT FALSE            COMMENT 'TRUE = passengers auto-book without driver approval',
    instant_booking_ack BOOLEAN DEFAULT FALSE            COMMENT 'TRUE = driver accepted the Trust Contract for instant booking',
    status              ENUM('active', 'completed', 'cancelled') DEFAULT 'active' COMMENT 'Ride lifecycle status',
    completed_at        TIMESTAMP NULL                   COMMENT 'When the driver confirmed ride completion (starts 12h grace period)',
    streak_processed    BOOLEAN DEFAULT FALSE            COMMENT 'TRUE after clean-ride streak has been awarded for this ride',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the ride was posted',

    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_driver_id (driver_id),
    INDEX idx_origin (origin_city),
    INDEX idx_destination (destination_city),
    INDEX idx_status (status),
    INDEX idx_departure (departure_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='All rides posted by drivers (SRS Section 5.1)';


-- =====================================================
-- TABLE 4: bookings
-- =====================================================
-- Stores every seat reservation by passengers.
-- Depends on: users (passenger_id) and rides (ride_id)
--
-- • is_reported          → flagged when a report is filed
-- • cancellation_penalty → trust points lost (0, 2, or 5)
-- • UNIQUE KEY prevents double-booking (SRS FR-BOOK-05)
-- =====================================================

CREATE TABLE bookings (
    id                  INT AUTO_INCREMENT PRIMARY KEY   COMMENT 'Unique booking ID',
    ride_id             INT NOT NULL                     COMMENT 'FK → rides.id (which ride was booked)',
    passenger_id        INT NOT NULL                     COMMENT 'FK → users.id (who booked the seat)',
    seats_booked        TINYINT DEFAULT 1                COMMENT 'Number of seats reserved',
    price_paid          DECIMAL(8, 2) NOT NULL           COMMENT 'Total price paid for all booked seats',
    status              ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'confirmed' COMMENT 'Booking status — pending = awaiting driver approval',
    is_reported         BOOLEAN DEFAULT FALSE            COMMENT 'TRUE if a report was filed involving this booking',
    cancellation_penalty INT DEFAULT 0                   COMMENT 'Trust points deducted for late cancel (0, 2, or 5)',
    booked_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the booking was made',

    UNIQUE KEY unique_ride_passenger (ride_id, passenger_id),
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ride_id (ride_id),
    INDEX idx_passenger_id (passenger_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='All seat reservations by passengers (SRS Section 5.1)';


-- =====================================================
-- TABLE 5: reports
-- =====================================================
-- Stores incident reports filed by users.
-- Depends on: users (reporter_id, reported_user_id) and rides (ride_id)
--
-- Trust System (SRS Section 4.1.5):
--   • 1 report  → Warning only (The Shield)
--   • 2+ reports from DIFFERENT people → Pattern → penalty
--   • no_show   → Immediate −5 penalty (bypasses shield)
-- =====================================================

CREATE TABLE reports (
    id                INT AUTO_INCREMENT PRIMARY KEY     COMMENT 'Unique report ID',
    ride_id           INT NOT NULL                       COMMENT 'FK → rides.id (the ride where the incident happened)',
    reporter_id       INT NOT NULL                       COMMENT 'FK → users.id (who filed the report)',
    reported_user_id  INT NOT NULL                       COMMENT 'FK → users.id (who is being reported)',
    reason            ENUM('no_show', 'bad_conduct', 'unsafe_driving', 'harassment') NOT NULL
                                                         COMMENT 'Category of the incident',
    description       TEXT                               COMMENT 'Optional free-text description of what happened',
    penalty_applied   INT NOT NULL DEFAULT 10            COMMENT 'Trust points deducted from the reported user',
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the report was filed',

    UNIQUE KEY unique_ride_reporter (ride_id, reporter_id),
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reported_user (reported_user_id),
    INDEX idx_reporter (reporter_id),
    INDEX idx_ride_id (ride_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Incident reports for trust system (SRS Section 5.1)';


-- =====================================================
-- TABLE 6: fuel_rates (Reference Table)
-- =====================================================
-- Stores current fuel prices used by the pricing algorithm.
-- No foreign keys — standalone lookup table.
-- =====================================================

CREATE TABLE fuel_rates (
    id              INT AUTO_INCREMENT PRIMARY KEY       COMMENT 'Fuel rate ID',
    fuel_type       ENUM('petrol', 'diesel', 'cng', 'electric') NOT NULL UNIQUE
                                                         COMMENT 'Type of fuel',
    rate_per_litre  DECIMAL(6, 2) NOT NULL               COMMENT 'Price per litre (or per kWh for electric)',
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                                                         COMMENT 'When this rate was last updated',

    INDEX idx_fuel_type (fuel_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Current fuel prices for pricing algorithm (SRS Section 5.1)';


-- =====================================================
-- SEED DATA: Default fuel rates (India, Feb 2026)
-- =====================================================

INSERT INTO fuel_rates (fuel_type, rate_per_litre) VALUES
('petrol',   105.00),
('diesel',    92.00),
('cng',       80.00),
('electric',   5.00);


-- =====================================================
-- ✅ ALL 6 TABLES CREATED SUCCESSFULLY
-- =====================================================
--
-- Summary:
--   1. users      — university members (with trust_score, gender)
--   2. user_otps  — OTP records for email verification (login/signup)
--   3. rides      — driver-posted rides (with women-only, instant booking)
--   4. bookings   — passenger reservations (with cancellation_penalty)
--   5. reports    — incident reports (pattern-match trust system)
--   6. fuel_rates — fuel prices for pricing algorithm
--
-- Foreign key chain:
--   users ──1:N──▶ rides ──1:N──▶ bookings
--   users ──1:N──▶ bookings
--   users ──1:N──▶ reports (as reporter)
--   users ──1:N──▶ reports (as reported)
--   rides ──1:N──▶ reports
--   user_otps references users by email (no FK — allows OTPs before registration)
--
-- Next steps:
--   1. Run this entire script in your Aiven MySQL console
--   2. Verify with: SHOW TABLES;
--   3. Verify columns with: DESCRIBE users; DESCRIBE rides; etc.
-- =====================================================
