-- =====================================================
-- TABLE: fuel_rates (Reference Table)
-- Purpose: Store current fuel prices for pricing calculations
-- =====================================================

CREATE TABLE IF NOT EXISTS fuel_rates (
    -- Primary Key
    id          INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Fuel rate ID',
    
    -- Data
    fuel_type   ENUM('petrol','diesel','cng','electric') NOT NULL UNIQUE COMMENT 'Type of fuel (or electric)',
    rate_per_litre DECIMAL(6,2) NOT NULL COMMENT 'Price per liter (or per kWh for electric)',
    
    -- Timestamps
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When this rate was last updated',
    
    -- Indexes
    INDEX idx_fuel_type (fuel_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Current fuel prices used in pricing algorithm calculations';

-- Insert default fuel rates (India prices as of Feb 2026)
INSERT IGNORE INTO fuel_rates (fuel_type, rate_per_litre) VALUES
('petrol',  105.00),  -- Indian fuel rate (₹/liter)
('diesel',   92.00),  -- Indian fuel rate
('cng',      80.00);  -- Indian fuel rate
