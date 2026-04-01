// =============================================================================
// server.js — RideMates Backend Entry Point
// =============================================================================
// This is the main file that starts the entire backend server.
// It wires together all the routes and middleware.
//
// SRS References:
//   • NFR-REL-02  — Global unhandledRejection / uncaughtException handlers
//   • NFR-SEC-01  — JWT token required on all protected endpoints
//   • Section 6   — All API route prefixes defined here
// =============================================================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- Database connection pool (config/db.js) ---
const pool = require('./config/db');

// --- JWT Auth middleware ---
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

// FIX: Restrict CORS to specific origins instead of allowing all
const corsOptions = {
  origin: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:8081', 'exp://'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));
app.use(express.json());
app.set('trust proxy', true); // Required for Render to properly identify client IP via X-Forwarded-For


// =============================================================================
// ROUTES
// =============================================================================
// Each route file handles a group of related endpoints.
// The first argument is the URL prefix, the second is the router.
//
//   POST   /api/auth/send-otp       → authRoutes (public — no JWT needed)
//   POST   /api/auth/verify-otp     → authRoutes (public — no JWT needed)
//   GET    /api/auth/profile        → authRoutes (needs JWT)
//   PUT    /api/auth/profile        → authRoutes (needs JWT)
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
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Step 1: Find stale active rides (still active 24h after departure)
    const [staleRides] = await conn.query(
      `SELECT id FROM rides
       WHERE status = 'active'
         AND departure_time < NOW() - INTERVAL 24 HOUR`
    );

    if (staleRides.length > 0) {
      const rideIds = staleRides.map(r => r.id);

      // Step 2: Mark those rides as completed
      await conn.query(
        `UPDATE rides SET status = 'completed', completed_at = NOW()
         WHERE id IN (?)`,
        [rideIds]
      );

      // Step 3: Transition their confirmed bookings to completed
      await conn.query(
        `UPDATE bookings
         SET status = 'completed'
         WHERE ride_id IN (?)
           AND status = 'confirmed'`,
        [rideIds]
      );

      console.log(`⏰ Auto-completed ${rideIds.length} stale ride(s) and their bookings.`);
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    console.error('Error in autoCompleteStaleRides:', error.message);
  } finally {
    conn.release();
  }
}

// ---------------------------------------------------------------------------
// JOB 2: Clean Ride Streak Award (SRS FR-RIDE-13, FR-LIFE-04, FR-RPT-06)
// ---------------------------------------------------------------------------
// 12 hours after a ride is completed, if no reports were filed against it,
// we increment current_streak by 1 for the driver AND all confirmed passengers.
// This rewards consistent good behavior.
//
// ANTI-COLLUSION: 24-Hour Cooldown
// If the same driver_id + passenger_id pair already had a streak-awarded ride
// within the last 24 hours, the passenger's streak reward is SKIPPED.
// This prevents friends from booking each other's fake rides to farm points.
//
// Uses streak_processed flag instead of the fragile time-window approach
// to ensure no rides are missed or double-processed.
// ---------------------------------------------------------------------------
async function awardCleanRideStreaks() {
  try {
    // Find rides that were completed 12+ hours ago AND haven't been processed yet.
    // Using streak_processed flag is reliable — no rides slip through the cracks.
    const [cleanRides] = await pool.query(
      `SELECT r.id AS ride_id, r.driver_id, r.completed_at
       FROM rides r
       WHERE r.status = 'completed'
         AND r.completed_at IS NOT NULL
         AND r.completed_at <= NOW() - INTERVAL 12 HOUR
         AND r.streak_processed = FALSE
         AND NOT EXISTS (
           SELECT 1 FROM reports rp WHERE rp.ride_id = r.id
         )`
    );

    for (const ride of cleanRides) {
      // Increment streak for the driver (always — they can only drive one ride at a time)
      await pool.query(
        'UPDATE users SET current_streak = current_streak + 1 WHERE id = ?',
        [ride.driver_id]
      );

      // --- 24-HOUR COOLDOWN CHECK (Anti-Collusion) ---
      // For each confirmed/completed passenger on this ride, check if they
      // already earned a streak from a ride with the SAME DRIVER in the last 24h.
      // If yes → skip their streak reward (prevents farming).
      // If no  → award normally.
      const [passengers] = await pool.query(
        `SELECT b.passenger_id
         FROM bookings b
         WHERE b.ride_id = ? AND b.status IN ('confirmed', 'completed')`,
        [ride.ride_id]
      );

      for (const passenger of passengers) {
        // Check: did this exact driver–passenger pair already have a
        // streak-processed ride that completed within the last 24 hours?
        const [recentPairRides] = await pool.query(
          `SELECT COUNT(*) AS pair_count
           FROM rides r2
           JOIN bookings b2 ON r2.id = b2.ride_id
           WHERE r2.driver_id = ?
             AND b2.passenger_id = ?
             AND r2.streak_processed = TRUE
             AND r2.completed_at >= NOW() - INTERVAL 24 HOUR
             AND r2.id != ?`,
          [ride.driver_id, passenger.passenger_id, ride.ride_id]
        );

        if (recentPairRides[0].pair_count === 0) {
          // No recent duplicate pair → award the streak point
          await pool.query(
            'UPDATE users SET current_streak = current_streak + 1 WHERE id = ?',
            [passenger.passenger_id]
          );
        } else {
          console.log(
            `⏳ Cooldown: Skipped streak for passenger ${passenger.passenger_id} ` +
            `(duplicate pair with driver ${ride.driver_id} within 24h)`
          );
        }
      }

      // Mark ride as streak-processed so it isn't picked up again
      await pool.query(
        'UPDATE rides SET streak_processed = TRUE WHERE id = ?',
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

// FIX: Wrap scheduled jobs in error handler to prevent silent failures
const safeRunJob = async (jobFn, jobName) => {
  try {
    await jobFn();
  } catch (error) {
    console.error(`❌ Job ${jobName} failed:`, error.message);
  }
};

// --- Start both scheduled jobs (runs every 30 minutes) ---
setInterval(() => safeRunJob(autoCompleteStaleRides, 'autoCompleteStaleRides'), THIRTY_MINUTES);
setInterval(() => safeRunJob(awardCleanRideStreaks, 'awardCleanRideStreaks'), THIRTY_MINUTES);

// Also run once at startup (after a short delay to let DB connect)
setTimeout(() => {
  safeRunJob(autoCompleteStaleRides, 'autoCompleteStaleRides');
  safeRunJob(awardCleanRideStreaks, 'awardCleanRideStreaks');
}, 5000);


// =============================================================================
// START SERVER
// =============================================================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚗 RideMates server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});