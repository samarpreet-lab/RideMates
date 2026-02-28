// =============================================================================
// authRoutes.js — Authentication & Profile Routes
// =============================================================================
// Maps HTTP endpoints to controller functions for user auth / profile.
//
// POST /api/auth/register  — Create new user (needs Firebase token)
// GET  /api/auth/profile   — Get own profile (needs Firebase token)
// PUT  /api/auth/profile   — Update own profile (needs Firebase token)
// =============================================================================

const express = require('express');
const router = express.Router();
const { registerUser, getProfile, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Registration needs a valid Firebase token so we know WHO is registering
router.post('/register', verifyToken, registerUser);

// Profile endpoints — user must be logged in
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;