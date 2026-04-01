// =============================================================================
// bookRoutes.js — Booking Routes
// =============================================================================
// Maps HTTP endpoints to booking controller functions.
// All routes here are protected by verifyToken (applied at the app.use level
// in server.js).
//
// POST /api/bookings/new         — Book seat(s) on a ride
// GET  /api/bookings/my          — Get my bookings
// PUT  /api/bookings/:id/cancel  — Cancel a booking
// =============================================================================

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { bookSeat, getMyBookings, cancelBooking, acceptBooking, rejectBooking } = require('../controllers/bookController');

// FIX: Add rate limiting to prevent booking spam
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 bookings per hour per IP
  message: { success: false, message: 'Too many booking requests. Please try again later.', error: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

const actionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 actions per 15 min per IP
  message: { success: false, message: 'Too many requests. Please slow down.', error: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/new', bookingLimiter, bookSeat);
router.get('/my', getMyBookings);
router.put('/:id/cancel', actionLimiter, cancelBooking);
router.put('/:id/accept', actionLimiter, acceptBooking);
router.put('/:id/reject', actionLimiter, rejectBooking);

module.exports = router;