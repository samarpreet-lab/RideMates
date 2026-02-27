-- =====================================================
-- TABLE: bookings
-- Purpose: Store every seat reservation by passengers
-- =====================================================

CREATE TABLE IF NOT EXISTS bookings (
    -- Primary Key
    id              INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique booking ID',
    
    -- Foreign Keys
    ride_id         INT NOT NULL COMMENT 'Reference to the ride being booked',
    passenger_id    INT NOT NULL COMMENT 'Reference to the passenger (user)',
    
    -- Booking Details
    seats_booked    TINYINT DEFAULT 1 COMMENT 'Number of seats reserved in this booking',
    price_paid      DECIMAL(8,2) NOT NULL COMMENT 'Total price paid by passenger for booked seats',
    
    -- Status
    status          ENUM('confirmed','cancelled','completed') DEFAULT 'confirmed' COMMENT 'Booking status',
    
    -- Timestamps
    booked_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the booking was made',
    
    -- Constraints
    -- ⚠️ CRITICAL: Prevents double-booking (one passenger, one ride, max one booking)
    UNIQUE KEY unique_ride_passenger (ride_id, passenger_id),
    
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for fast queries
    INDEX idx_passenger_id (passenger_id),
    INDEX idx_ride_id (ride_id),
    INDEX idx_status (status),
    INDEX idx_booked_at (booked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='All seat reservations - represents the relationship between passengers and rides';
