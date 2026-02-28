// =============================================================================
// server.js — RideMates Backend Entry Point
// =============================================================================
// This is the main file that starts the entire backend server.
// It wires together all the routes and middleware.
//
// SRS References:
//   • NFR-REL-02  — Global unhandledRejection / uncaughtException handlers
//   • NFR-SEC-01  — Firebase token required on all endpoints (except /health)
//   • Section 6   — All API route prefixes defined here
// =============================================================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- Database connection pool (config/db.js) ---
const pool = require('./config/db');

// --- Firebase Auth middleware ---
const { verifyToken } = require('./middleware/auth');

// --- Route files ---
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const bookRoutes = require('./routes/bookRoutes');
const reportRoutes = require('./routes/reportRoutes');

// --- Create Express app ---
const app = express();

// --- Middleware ---
// cors()          → allows the React Native app to call this API from a different origin
// express.json()  → parses incoming JSON request bodies so req.body works
app.use(cors());
app.use(express.json());


// =============================================================================
// ROUTES
// =============================================================================
// Each route file handles a group of related endpoints.
// The first argument is the URL prefix, the second is the router.
//
//   POST   /api/auth/register       → authRoutes
//   GET    /api/auth/profile        → authRoutes
//   PUT    /api/auth/profile        → authRoutes
//   POST   /api/rides/create        → rideRoutes
//   GET    /api/rides/search        → rideRoutes
//   GET    /api/rides/:id           → rideRoutes
//   PUT    /api/rides/:id           → rideRoutes
//   DELETE /api/rides/:id           → rideRoutes
//   PUT    /api/rides/:id/complete  → rideRoutes
//   GET    /api/rides/my            → rideRoutes
//   POST   /api/bookings/new        → bookRoutes
//   GET    /api/bookings/my         → bookRoutes
//   PUT    /api/bookings/:id/cancel → bookRoutes
//   POST   /api/reports/new         → reportRoutes
//   GET    /api/reports/my          → reportRoutes
// =============================================================================

app.use('/api/auth', authRoutes);
app.use('/api/rides', verifyToken, rideRoutes);
app.use('/api/bookings', verifyToken, bookRoutes);
app.use('/api/reports', verifyToken, reportRoutes);


// --- Health Check (no auth required) ---
// Used by Postman or monitoring tools to confirm the server is alive.
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'RideMates API is running!',
    timestamp: new Date().toISOString(),
  });
});


// =============================================================================
// GLOBAL ERROR HANDLERS (SRS NFR-REL-02)
// =============================================================================
// These catch any errors that slip through individual try/catch blocks.
// Without these, an unhandled promise rejection would crash the server.
// =============================================================================

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Promise Rejection:', reason);
  // Don't crash — just log it and keep running
});

process.on('uncaughtException', (error) => {
  console.error('🔥 Uncaught Exception:', error);
  // In production you'd want to restart, but for Viva keep running
});


// =============================================================================
// SCHEDULED JOBS (Background Tasks)
// =============================================================================
// These run on a timer to handle things that aren't triggered by API calls.
// We use setInterval (built-in Node.js) instead of a cron library to keep
// it simple and beginner-friendly. Both jobs run every 30 minutes.
// =============================================================================

const THIRTY_MINUTES = 30 * 60 * 1000; // in milliseconds

// ---------------------------------------------------------------------------
// JOB 1: Auto-Complete Fallback (SRS FR-LIFE-05)
// ---------------------------------------------------------------------------
// If a driver forgets to tap "Complete Ride", we auto-complete rides that are
// still 'active' 24 hours after their departure_time. This prevents rides from
// lingering forever.
// ---------------------------------------------------------------------------
async function autoCompleteStaleRides() {
  try {
    const [result] = await pool.query(
      `UPDATE rides
       SET status = 'completed', completed_at = NOW()
       WHERE status = 'active'
         AND departure_time < NOW() - INTERVAL 24 HOUR`
    );

    if (result.affectedRows > 0) {
      console.log(`⏰ Auto-completed ${result.affectedRows} stale ride(s).`);

      // Also transition their confirmed bookings to 'completed'
      await pool.query(
        `UPDATE bookings b
         JOIN rides r ON b.ride_id = r.id
         SET b.status = 'completed'
         WHERE r.status = 'completed'
           AND b.status = 'confirmed'
           AND r.completed_at >= NOW() - INTERVAL 1 MINUTE`
      );
    }
  } catch (error) {
    console.error('Error in autoCompleteStaleRides:', error.message);
  }
}

// ---------------------------------------------------------------------------
// JOB 2: Clean Ride Streak Award (SRS FR-RIDE-13, FR-LIFE-04, FR-RPT-06)
// ---------------------------------------------------------------------------
// 12 hours after a ride is completed, if no reports were filed against it,
// we increment current_streak by 1 for the driver AND all confirmed passengers.
// This rewards consistent good behavior.
// ---------------------------------------------------------------------------
async function awardCleanRideStreaks() {
  try {
    // Find rides that were completed 12+ hours ago but haven't been processed yet.
    // We use "completed_at BETWEEN 12 and 13 hours ago" as our window to avoid
    // re-processing the same rides on every run.
    const [cleanRides] = await pool.query(
      `SELECT r.id AS ride_id, r.driver_id
       FROM rides r
       WHERE r.status = 'completed'
         AND r.completed_at IS NOT NULL
         AND r.completed_at <= NOW() - INTERVAL 12 HOUR
         AND r.completed_at > NOW() - INTERVAL 13 HOUR
         AND NOT EXISTS (
           SELECT 1 FROM reports rp WHERE rp.ride_id = r.id
         )`
    );

    for (const ride of cleanRides) {
      // Increment streak for the driver
      await pool.query(
        'UPDATE users SET current_streak = current_streak + 1 WHERE id = ?',
        [ride.driver_id]
      );

      // Increment streak for all confirmed/completed passengers
      await pool.query(
        `UPDATE users u
         JOIN bookings b ON u.id = b.passenger_id
         SET u.current_streak = u.current_streak + 1
         WHERE b.ride_id = ? AND b.status IN ('confirmed', 'completed')`,
        [ride.ride_id]
      );
    }

    if (cleanRides.length > 0) {
      console.log(`🏆 Awarded clean ride streak for ${cleanRides.length} ride(s).`);
    }
  } catch (error) {
    console.error('Error in awardCleanRideStreaks:', error.message);
  }
}

// --- Start both scheduled jobs (runs every 30 minutes) ---
setInterval(autoCompleteStaleRides, THIRTY_MINUTES);
setInterval(awardCleanRideStreaks, THIRTY_MINUTES);

// Also run once at startup (after a short delay to let DB connect)
setTimeout(() => {
  autoCompleteStaleRides();
  awardCleanRideStreaks();
}, 5000);


// =============================================================================
// START SERVER
// =============================================================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚗 RideMates server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});