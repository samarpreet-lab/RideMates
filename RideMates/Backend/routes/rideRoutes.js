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

// IMPORTANT: /my must come BEFORE /:id, otherwise Express treats "my" as an :id
router.post('/create', createRide);
router.get('/search', searchRides);
router.get('/my', getMyRides);
router.get('/:id', getRideById);
router.put('/:id', updateRide);
router.delete('/:id', cancelRide);
router.put('/:id/complete', completeRide);

module.exports = router;