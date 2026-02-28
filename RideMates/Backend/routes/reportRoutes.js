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
const router = express.Router();
const { fileReport, getMyReports } = require('../controllers/reportController');

router.post('/new', fileReport);
router.get('/my', getMyReports);

module.exports = router;
