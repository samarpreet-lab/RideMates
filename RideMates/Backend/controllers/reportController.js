// =============================================================================
// reportController.js — Report & Accountability Controller
// =============================================================================
// Handles filing reports against other users and the pattern-match evaluation
// algorithm that determines whether to apply trust score penalties.
//
// SRS References:
//   Section 4.1.5 — Report & Accountability Module (FR-RPT-01 to FR-RPT-09)
//   Section 8.4   — Pattern-Match Report Evaluation Algorithm
//
// Key Concepts:
//   • "The Shield" — A single conduct report only triggers a warning (no penalty).
//     This protects users from false accusations by a single liar.
//   • Pattern Match — When 2+ different people report the same user within 30 days,
//     a penalty is applied (−10 per qualifying report, streak reset).
//   • Escalation — 3+ pattern-matched reports → additional −25 penalty.
//   • No-Show — Bypasses the shield entirely (immediate −5 penalty).
// =============================================================================

const pool = require('../config/db');


// =============================================================================
// POST /api/reports/new
// =============================================================================
// File a report against another user for a specific ride.
//
// Request Body: { ride_id, reported_user_id, reason, description? }
//
// reason must be one of: 'no_show', 'bad_conduct', 'unsafe_driving', 'harassment'
//
// ALGORITHM (SRS Section 8.4):
//   1. If reason == 'no_show' → immediate −5, bypass shield
//   2. Else → count distinct reporters in last 30 days
//      a. 0 other reporters → WARNING_ONLY (The Shield)
//      b. 1+ other reporters → PATTERN_PENALTY (−10, streak reset)
//      c. 3+ total pattern reports → ESCALATION (additional −25)
// =============================================================================
async function fileReport(req, res) {
  try {
    const reporter_id = req.user.id;
    const { ride_id, reported_user_id, reason, description } = req.body;

    // --- Validate required fields ---
    if (!ride_id || !reported_user_id || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.',
        error: 'MISSING_FIELDS',
      });
    }

    // --- Validate reason is one of the allowed values ---
    const validReasons = ['no_show', 'bad_conduct', 'unsafe_driving', 'harassment'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report reason. Must be: no_show, bad_conduct, unsafe_driving, or harassment.',
        error: 'INVALID_REASON',
      });
    }

    // --- Can't report yourself ---
    if (reported_user_id === reporter_id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot report yourself.',
        error: 'SELF_REPORT',
      });
    }

    // --- Ride Status Check (SRS FR-RPT-01) ---
    // Reports can only be filed against completed or no-show rides,
    // not against active or cancelled rides.
    const [rideRows] = await pool.query(
      'SELECT status, completed_at FROM rides WHERE id = ?',
      [ride_id]
    );

    if (rideRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'This ride is no longer available.',
        error: 'RIDE_NOT_FOUND',
      });
    }

    const ride = rideRows[0];

    if (ride.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Reports can only be filed for completed rides.',
        error: 'RIDE_NOT_COMPLETED',
      });
    }

    // --- 12-Hour Grace Period Check (SRS FR-LIFE-03) ---
    // Reports must be filed within 12 hours of the ride being marked complete.
    if (ride.completed_at) {
      const completedAt = new Date(ride.completed_at);
      const twelveHoursLater = new Date(completedAt.getTime() + 12 * 60 * 60 * 1000);
      if (new Date() > twelveHoursLater) {
        return res.status(400).json({
          success: false,
          message: 'The 12-hour report window for this ride has expired.',
          error: 'REPORT_WINDOW_EXPIRED',
        });
      }
    }

    // --- Report Cooldown: max 3 reports per 24 hours (FR-RPT-08) ---
    const [recentReports] = await pool.query(
      `SELECT COUNT(*) AS count FROM reports
       WHERE reporter_id = ? AND created_at >= NOW() - INTERVAL 24 HOUR`,
      [reporter_id]
    );

    if (recentReports[0].count >= 3) {
      return res.status(400).json({
        success: false,
        message: 'You have reached the daily report limit. Try again tomorrow.',
        error: 'REPORT_COOLDOWN',
      });
    }

    // =====================================================================
    // TRUST-WEIGHTED PENALTY GATE (Anti-Weaponization)
    // =====================================================================
    // Before applying ANY penalty, check the reporter's own trust score.
    // If the reporter's trust_score < 70, they are in the "untrusted" tier.
    // Their report is still logged (admins can review it), but the reported
    // user's trust score is NOT deducted. This mathematically cuts off
    // low-reputation users from weaponizing the reporting system.
    // =====================================================================

    const [reporterRows] = await pool.query(
      'SELECT trust_score FROM users WHERE id = ?',
      [reporter_id]
    );
    const reporterTrustScore = reporterRows[0].trust_score;

    let penalty_applied = 0;
    let action = '';
    let userMessage = '';

    if (reporterTrustScore < 70) {
      // --- UNTRUSTED REPORTER: Log the report, but apply 0-point deduction ---
      // The report is still inserted into the database so admins can see it,
      // but it does NOT affect the reported user's trust score or streak.
      penalty_applied = 0;
      action = 'UNTRUSTED_REPORTER';
      userMessage = 'Report submitted and logged for admin review.';
    } else {
      // =====================================================================
      // PATTERN-MATCH EVALUATION (SRS Section 8.4)
      // =====================================================================
      // Reporter is trusted (trust_score >= 70), so apply normal penalty logic.

      // --- CASE 1: No-Show → Immediate penalty, bypass the shield (FR-RPT-09) ---
      if (reason === 'no_show') {
        penalty_applied = 5;
        action = 'IMMEDIATE_PENALTY';

        // Deduct 5 points and reset streak
        await pool.query(
          `UPDATE users
           SET trust_score = GREATEST(trust_score - 5, 0),
               current_streak = 0
           WHERE id = ?`,
          [reported_user_id]
        );

        userMessage = 'Report submitted. No-show penalty applied: −5 Trust Points.';
      } else {
        // --- CASE 2: Conduct report → Check for pattern (The Shield) ---

        // Count how many DIFFERENT people have reported this user in the last 30 days
        // (excluding the current reporter — we're checking prior reports)
        const [priorReports] = await pool.query(
          `SELECT COUNT(DISTINCT reporter_id) AS distinct_reporters
           FROM reports
           WHERE reported_user_id = ?
             AND reporter_id != ?
             AND reason IN ('bad_conduct', 'unsafe_driving', 'harassment')
             AND created_at >= NOW() - INTERVAL 30 DAY`,
          [reported_user_id, reporter_id]
        );

        const distinctReporters = priorReports[0].distinct_reporters;

        if (distinctReporters === 0) {
          // ---- SHIELD: First/only reporter → Warning only (FR-RPT-03) ----
          // One person lying shouldn't ruin someone's trust score.
          penalty_applied = 0;
          action = 'WARNING_ONLY';
          userMessage = 'Report submitted. A system warning has been issued.';
        } else {
          // ---- PATTERN CONFIRMED: 2+ different reporters (FR-RPT-04) ----
          // Two unrelated people reporting = credible pattern.
          penalty_applied = 10;
          action = 'PATTERN_PENALTY';

          await pool.query(
            `UPDATE users
             SET trust_score = GREATEST(trust_score - 10, 0),
                 current_streak = 0
             WHERE id = ?`,
            [reported_user_id]
          );

          userMessage = 'Report submitted. Pattern detected — trust score adjusted.';

          // ---- ESCALATION: 3+ pattern-matched reports (FR-RPT-05) ----
          // Including the current report, how many total pattern reporters?
          const totalPatternReporters = distinctReporters + 1; // +1 for current reporter

          if (totalPatternReporters >= 3) {
            // Apply an additional −25 escalation penalty
            await pool.query(
              `UPDATE users
               SET trust_score = GREATEST(trust_score - 25, 0)
               WHERE id = ?`,
              [reported_user_id]
            );

            penalty_applied += 25; // Total: 10 + 25 = 35
            userMessage = 'Report submitted. Escalated pattern detected — account flagged for review.';
          }
        }
      }
    }

    // --- Insert the report record ---
    const [result] = await pool.query(
      `INSERT INTO reports (ride_id, reporter_id, reported_user_id, reason, description, penalty_applied)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ride_id, reporter_id, reported_user_id, reason, description || null, penalty_applied]
    );

    // --- Mark the booking as reported (FR-RPT-03) ---
    // Find the booking between the reported user and this ride, and flag it.
    await pool.query(
      `UPDATE bookings SET is_reported = TRUE
       WHERE ride_id = ? AND (passenger_id = ? OR passenger_id = ?)`,
      [ride_id, reported_user_id, reporter_id]
    );

    res.status(200).json({
      success: true,
      message: userMessage,
      data: {
        report_id: result.insertId,
        action,
        penalty_applied,
      },
    });
  } catch (error) {
    console.error('Error in fileReport:', error);

    // Handle duplicate report (UNIQUE KEY on ride_id + reporter_id)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'You have already filed a report for this ride.',
        error: 'DUPLICATE_REPORT',
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
// GET /api/reports/my
// =============================================================================
// Get all reports filed BY the logged-in user.
// =============================================================================
async function getMyReports(req, res) {
  try {
    const userId = req.user.id;

    const [reports] = await pool.query(
      `SELECT rp.*,
              r.origin_city, r.destination_city, r.departure_time,
              u.full_name AS reported_user_name
       FROM reports rp
       JOIN rides r ON rp.ride_id = r.id
       JOIN users u ON rp.reported_user_id = u.id
       WHERE rp.reporter_id = ?
       ORDER BY rp.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error('Error in getMyReports:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  }
}


module.exports = { fileReport, getMyReports };
