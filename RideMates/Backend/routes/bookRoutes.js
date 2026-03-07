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
const router = express.Router();
const { bookSeat, getMyBookings, cancelBooking, acceptBooking, rejectBooking } = require('../controllers/bookController');

router.post('/new', bookSeat);
router.get('/my', getMyBookings);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/accept', acceptBooking);
router.put('/:id/reject', rejectBooking);

module.exports = router;