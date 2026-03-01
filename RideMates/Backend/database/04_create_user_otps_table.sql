-- =====================================================
-- user_otps Table — OTP Authentication (SRS v1.4)
-- =====================================================
-- This table stores backend-generated 6-digit OTPs
-- for email verification during login and signup.
--
-- Run this AFTER the users table exists.
-- If starting fresh, use 00_init_all_tables.sql instead.
-- =====================================================

CREATE TABLE IF NOT EXISTS user_otps (
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
-- If migrating from Firebase auth, remove firebase_uid:
-- =====================================================
-- ALTER TABLE users DROP INDEX idx_firebase_uid;
-- ALTER TABLE users DROP COLUMN firebase_uid;
-- =====================================================
