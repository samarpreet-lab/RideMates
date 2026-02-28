// =============================================================================
// middleware/auth.js — Firebase Token Verification Middleware
// =============================================================================
// This middleware runs BEFORE every protected route.
// It checks the "Authorization: Bearer <token>" header, verifies the
// Firebase ID Token, and attaches the user's info to `req.user`.
//
// SRS References:
//   • FR-AUTH-04 — All protected endpoints require Firebase token
//   • NFR-SEC-01 — All API endpoints (except /health) require auth
//   • NFR-SEC-02 — Tokens verified server-side via Firebase Admin SDK
//
// HOW IT WORKS:
//   1. Client sends:  Authorization: Bearer eyJhbGciOiJSUzI1Ni...
//   2. This middleware extracts the token after "Bearer "
//   3. Firebase Admin SDK verifies the token is real and not expired
//   4. If valid → req.user = { uid, email, ... } and next() is called
//   5. If invalid → 401 error returned, controller never runs
// =============================================================================

const admin = require('firebase-admin');
const pool = require('../config/db');

// --- Initialize Firebase Admin SDK ---
// The service account key is a JSON file you download from Firebase Console.
// Store the path in your .env file as FIREBASE_SERVICE_ACCOUNT_PATH.
// NEVER commit the key file to Git!

// Check if Firebase Admin is already initialized (prevents double-init errors)
if (!admin.apps.length) {
  // Option 1: Use a service account JSON file (recommended for production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Option 2: Use default credentials (works in some cloud environments)
    // For local development, you can also set GOOGLE_APPLICATION_CREDENTIALS env var
    admin.initializeApp();
  }
}


// =============================================================================
// MIDDLEWARE: verifyToken
// =============================================================================
// Usage in routes:
//   router.get('/profile', verifyToken, getProfile);
//                          ^^^^^^^^^^^
//   Express runs verifyToken first. If it calls next(), Express runs getProfile.
//   If it sends a response (401), Express stops — getProfile never runs.
// =============================================================================

async function verifyToken(req, res, next) {
  try {
    // --- Step 1: Extract the token from the Authorization header ---
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to continue.',
        error: 'NO_TOKEN',
      });
    }

    // "Bearer eyJhbG..." → "eyJhbG..."
    const token = authHeader.split(' ')[1];

    // --- Step 2: Verify the token with Firebase Admin SDK ---
    // This checks:  Is it a real Firebase token? Is it expired? Was it tampered with?
    const decodedToken = await admin.auth().verifyIdToken(token);

    // --- Step 3: Look up the user in our MySQL database ---
    // We need the MySQL user ID for all our queries (rides, bookings, etc.)
    const [users] = await pool.query(
      'SELECT id, firebase_uid, full_name, email, gender, trust_score, current_streak FROM users WHERE firebase_uid = ?',
      [decodedToken.uid]
    );

    if (users.length === 0) {
      // User not in MySQL yet — this is expected during /register.
      // We still attach the Firebase UID so the register controller can use it.
      req.user = {
        firebase_uid: decodedToken.uid,
        email: decodedToken.email || null,
        isNewUser: true,           // flag so controllers know this is a fresh user
      };
    } else {
      // --- Step 4: Attach full user info to the request object ---
      // Now every controller can access req.user.id, req.user.email, etc.
      req.user = users[0];
    }

    // --- Step 5: Move on to the next middleware or controller ---
    next();

  } catch (error) {
    console.error('Auth middleware error:', error.message);

    // Firebase throws specific error codes we can check
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
        error: 'INVALID_TOKEN',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
      error: 'INVALID_TOKEN',
    });
  }
}

module.exports = { verifyToken };
