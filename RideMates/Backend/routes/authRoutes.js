// =============================================================================
// authRoutes.js — Authentication & Profile Routes (OTP + JWT)
// =============================================================================
// Maps HTTP endpoints to controller functions for OTP auth and profile.
//
// POST /api/auth/send-otp    — Generate and email a 6-digit OTP (no auth)
// POST /api/auth/verify-otp  — Verify OTP, register (if signup), issue JWT (no auth)
// GET  /api/auth/profile     — Get own profile (needs JWT)
// PUT  /api/auth/profile     — Update own profile (needs JWT)
// =============================================================================

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { sendOtp, verifyOtp, getProfile, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// --- Rate limiters for public OTP endpoints ---
// Prevent abuse / brute-force on unauthenticated routes
const sendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // 5 requests per window per IP
  standardHeaders: true,    // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests from this IP. Please try again after 15 minutes.',
    error: 'IP_RATE_LIMITED',
  },
});

const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // 10 verify attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts from this IP. Please try again after 15 minutes.',
    error: 'IP_RATE_LIMITED',
  },
});

// --- OTP endpoints (public — no auth required) ---
// These are used BEFORE the user has a JWT token
router.post('/send-otp', sendOtpLimiter, sendOtp);
router.post('/verify-otp', verifyOtpLimiter, verifyOtp);

// --- Profile endpoints (protected — JWT required) ---
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;