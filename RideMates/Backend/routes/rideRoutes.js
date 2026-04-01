// =============================================================================
// rideRoutes.js — Ride Routes
// =============================================================================
// Maps HTTP endpoints to ride controller functions.
// All routes here are protected by verifyToken (applied at the app.use level
// in server.js), so we don't need to add it again per-route.
//
// POST   /api/rides/create       — Post a new ride
// GET    /api/rides/search       — Search rides by origin/destination
// GET    /api/rides/my           — Get my rides (as driver + as passenger)
// GET    /api/rides/:id          — Get single ride details
// PUT    /api/rides/:id          — Update a ride (driver only)
// DELETE /api/rides/:id          — Cancel a ride (driver only)
// PUT    /api/rides/:id/complete — Mark ride as completed (driver only)
// =============================================================================

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  createRide,
  searchRides,
  getRideById,
  updateRide,
  cancelRide,
  completeRide,
  getMyRides,
} = require('../controllers/rideController');

// FIX: Add rate limiting to prevent abuse
const createRideLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 rides per hour per IP
  message: { success: false, message: 'Too many rides created. Please try again later.', error: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute per IP
  message: { success: false, message: 'Too many search requests. Please slow down.', error: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

const updateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 updates per 15 min per IP
  message: { success: false, message: 'Too many update requests. Please try again later.', error: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// IMPORTANT: /my must come BEFORE /:id, otherwise Express treats "my" as an :id
router.post('/create', createRideLimiter, createRide);
router.get('/search', searchLimiter, searchRides);
router.get('/my', getMyRides);
router.get('/:id', getRideById);
router.put('/:id', updateLimiter, updateRide);
router.delete('/:id', updateLimiter, cancelRide);
router.put('/:id/complete', updateLimiter, completeRide);

module.exports = router;