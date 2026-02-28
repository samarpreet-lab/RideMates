// =============================================================================
// authController.js — Authentication & Profile Controller
// =============================================================================
// Handles user registration, profile retrieval, and profile updates.
//
// SRS References:
//   Section 6.1 — Authentication Endpoints
//   FR-AUTH-01   — Domain validation (@lpu.in only)
//   FR-AUTH-03   — Create user record in MySQL after Firebase verification
//   FR-AUTH-06   — Profile retrieval (GET /api/auth/profile)
//   FR-AUTH-07   — Profile update (PUT /api/auth/profile)
// =============================================================================

const pool = require('../config/db');


// =============================================================================
// POST /api/auth/register
// =============================================================================
// Called right after the user verifies their email OTP on the frontend.
// Firebase Auth has already confirmed this is a real person. Now we save
// their info in our MySQL database so we can track rides, bookings, etc.
//
// Request Body: { firebase_uid, full_name, email, phone, role, gender }
// Success:      201 Created
// Errors:       400 (bad email), 409 (duplicate)
// =============================================================================
async function registerUser(req, res) {
  try {
    const { full_name, email, phone, role, gender } = req.body;

    // The firebase_uid comes from the verified token (set by middleware),
    // NOT from the request body — this prevents spoofing.
    const firebase_uid = req.user.firebase_uid;

    // --- Validate required fields ---
    if (!firebase_uid || !full_name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.',
        error: 'MISSING_FIELDS',
      });
    }

    // --- Domain validation (SRS FR-AUTH-01) ---
    // Only @lpu.in emails are allowed. This is the core safety feature.
    if (!email.endsWith('@lpu.in')) {
      return res.status(400).json({
        success: false,
        message: 'Only university emails (@lpu.in) are allowed.',
        error: 'INVALID_EMAIL_DOMAIN',
      });
    }

    // --- Insert the user into MySQL ---
    // trust_score defaults to 100 and current_streak defaults to 0 (set in DB schema)
    const [result] = await pool.query(
      `INSERT INTO users (firebase_uid, full_name, email, phone, role, gender)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [firebase_uid, full_name, email, phone || null, role || 'student', gender || 'other']
    );

    // --- Return success ---
    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      data: {
        id: result.insertId,
        firebase_uid,
        full_name,
        email,
      },
    });
  } catch (error) {
    console.error('Error in registerUser:', error);

    // Handle duplicate email or firebase_uid
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
        error: 'DUPLICATE_EMAIL',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  }
}


// =============================================================================
// GET /api/auth/profile
// =============================================================================
// Returns the authenticated user's full profile from MySQL.
// The verifyToken middleware already looked up the user and put it in req.user,
// but we fetch the full row here to include all fields.
//
// SRS FR-AUTH-06 — Profile retrieval
// =============================================================================
async function getProfile(req, res) {
  try {
    const [users] = await pool.query(
      `SELECT id, firebase_uid, full_name, email, phone, university, role,
              profile_photo, gender, trust_score, current_streak, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
        error: 'USER_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  }
}


// =============================================================================
// PUT /api/auth/profile
// =============================================================================
// Allows the user to update their mutable profile fields.
// Only full_name, phone, and profile_photo can be changed.
// Email and firebase_uid are immutable (set at registration).
//
// SRS FR-AUTH-07 — Profile update
// Request Body: { full_name?, phone?, profile_photo? }
// =============================================================================
async function updateProfile(req, res) {
  try {
    const { full_name, phone, profile_photo } = req.body;

    // Build the SET clause dynamically — only update fields that were provided
    const updates = [];
    const values = [];

    if (full_name) {
      updates.push('full_name = ?');
      values.push(full_name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (profile_photo !== undefined) {
      updates.push('profile_photo = ?');
      values.push(profile_photo);
    }

    // If nothing was provided to update, return early
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update.',
        error: 'MISSING_FIELDS',
      });
    }

    // Add the WHERE clause value
    values.push(req.user.id);

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  }
}


module.exports = { registerUser, getProfile, updateProfile };