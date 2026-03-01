// =============================================================================
// middleware/auth.js — JWT Token Verification Middleware
// =============================================================================
// This middleware runs BEFORE every protected route.
// It checks the "Authorization: Bearer <token>" header, verifies the
// backend-issued JWT, and attaches the user's info to `req.user`.
//
// SRS References:
//   • FR-AUTH-04 — All protected endpoints require backend-issued JWT
//   • NFR-SEC-01 — All API endpoints (except /health) require auth
//   • NFR-SEC-02 — Tokens verified server-side via jsonwebtoken
//
// HOW IT WORKS:
//   1. Client sends:  Authorization: Bearer eyJhbGciOiJIUzI1Ni...
//   2. This middleware extracts the token after "Bearer "
//   3. jsonwebtoken verifies the signature, checks expiry
//   4. If valid → looks up user in MySQL, attaches to req.user, calls next()
//   5. If invalid → 401 error returned, controller never runs
// =============================================================================

const jwt = require('jsonwebtoken');
const pool = require('../config/db');

if (!process.env.JWT_SECRET) {
  console.error('\n❌ FATAL: JWT_SECRET environment variable is not set!');
  console.error('   Set it in your .env file:  JWT_SECRET=your-secure-random-string');
  console.error('   Generate one with:         node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"\n');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;


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

    // --- Step 2: Verify the JWT signature and expiry ---
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.',
          error: 'TOKEN_EXPIRED',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
        error: 'INVALID_TOKEN',
      });
    }

    // --- Step 3: Validate JWT claims before DB lookup ---
    if (!decoded || !decoded.userId || typeof decoded.userId !== 'number') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.',
        error: 'INVALID_TOKEN_CLAIMS',
      });
    }

    // --- Step 4: Look up the user in our MySQL database ---
    // decoded.userId was set when we signed the JWT in authController
    const [users] = await pool.query(
      'SELECT id, full_name, email, gender, trust_score, current_streak FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account not found. Please register.',
        error: 'USER_NOT_FOUND',
      });
    }

    // --- Step 5: Attach full user info to the request object ---
    // Now every controller can access req.user.id, req.user.email, etc.
    req.user = users[0];

    // --- Step 6: Move on to the next middleware or controller ---
    next();

  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
      error: 'AUTH_ERROR',
    });
  }
}

module.exports = { verifyToken };
