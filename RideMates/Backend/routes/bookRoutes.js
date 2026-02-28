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
const { bookSeat, getMyBookings, cancelBooking } = require('../controllers/bookController');

router.post('/new', bookSeat);
router.get('/my', getMyBookings);
router.put('/:id/cancel', cancelBooking);

module.exports = router;