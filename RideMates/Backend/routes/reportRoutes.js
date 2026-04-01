// =============================================================================
// reportRoutes.js — Report Routes
// =============================================================================
// Maps HTTP endpoints to report controller functions.
// All routes here are protected by verifyToken (applied at the app.use level
// in server.js).
//
// POST /api/reports/new  — File a report against another user
// GET  /api/reports/my   — Get reports I've filed
// =============================================================================

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { fileReport, getMyReports } = require('../controllers/reportController');

// FIX: Add rate limiting to prevent report abuse
const reportLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 reports per day per IP (backend also has 3/day per user logic)
  message: { success: false, message: 'Too many reports filed. Please try again tomorrow.', error: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/new', reportLimiter, fileReport);
router.get('/my', getMyReports);

module.exports = router;
