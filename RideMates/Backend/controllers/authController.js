// =============================================================================
// authController.js — Authentication & Profile Controller (OTP + JWT)
// =============================================================================
// Handles OTP generation/verification, user registration, JWT issuance,
// profile retrieval, and profile updates.
//
// SRS References:
//   Section 6.1  — Authentication Endpoints
//   FR-AUTH-01   — Domain validation (@lpu.in only)
//   FR-AUTH-02   — Backend-generated 6-digit OTP via SMTP
//   FR-AUTH-03   — Create user record + issue JWT after OTP verification
//   FR-AUTH-05   — JWT session tokens (7-day expiry)
//   FR-AUTH-06   — Profile retrieval (GET /api/auth/profile)
//   FR-AUTH-07   — Profile update (PUT /api/auth/profile)
//   FR-AUTH-08   — OTP expires after 10 minutes
//   FR-AUTH-09   — Rate limiting: max 3 OTP requests per 10 minutes per email
//   FR-AUTH-10   — Brute force protection: lock after 3 failed attempts
// =============================================================================

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require('../config/db');

if (!process.env.JWT_SECRET) {
  console.error('\n❌ FATAL: JWT_SECRET environment variable is not set!');
  console.error('   Set it in your .env file:  JWT_SECRET=your-secure-random-string');
  console.error('   Generate one with:         node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"\n');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d'; // SRS FR-AUTH-05: 7-day JWT expiry
const OTP_EXPIRY_MINUTES = 10; // SRS FR-AUTH-08: OTP valid for 10 minutes
const MAX_OTP_REQUESTS = 3; // SRS FR-AUTH-09: max 3 requests per 10 min
const MAX_OTP_ATTEMPTS = 3; // SRS FR-AUTH-10: lock after 3 failed attempts


// --- SMTP Transporter (Nodemailer) ---
// Configured via environment variables. Uses Gmail by default.
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


// =============================================================================
// HELPER: Generate a cryptographically secure 6-digit OTP
// =============================================================================
function generateOTP() {
  // crypto.randomInt generates a secure random integer
  return crypto.randomInt(100000, 999999).toString();
}


// =============================================================================
// HELPER: Hash OTP with SHA-256 (never store plaintext OTPs in DB)
// =============================================================================
function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}


// =============================================================================
// HELPER: Sign a JWT with the user's ID and email
// =============================================================================
function signToken(userId, email) {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}


// =============================================================================
// POST /api/auth/send-otp
// =============================================================================
// Generates a 6-digit OTP, stores its hash in the `user_otps` table,
// and sends it to the user's university email via SMTP.
//
// Request Body: { email, purpose? }
//   - purpose: 'login' or 'signup' (defaults to 'login')
// Success:      200 OK
// Errors:       400 (bad email), 429 (rate limited)
//
// SRS: FR-AUTH-01, FR-AUTH-02, FR-AUTH-08, FR-AUTH-09
// =============================================================================
async function sendOtp(req, res) {
  try {
    const { email: rawEmail, purpose = 'login' } = req.body;

    // --- Validate email ---
    if (!rawEmail || !rawEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address.',
        error: 'MISSING_EMAIL',
      });
    }

    // Normalize email to lowercase so USER@LPU.IN and user@lpu.in are treated the same
    const email = rawEmail.trim().toLowerCase();

    // --- Domain validation (SRS FR-AUTH-01) ---
    if (!email.endsWith('@lpu.in')) {
      return res.status(400).json({
        success: false,
        message: 'Only university emails (@lpu.in) are allowed.',
        error: 'INVALID_EMAIL_DOMAIN',
      });
    }

    // --- For login: check if user exists ---
    if (purpose === 'login') {
      const [existingUsers] = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      if (existingUsers.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email. Please sign up first.',
          error: 'USER_NOT_FOUND',
        });
      }
    }

    // --- For signup: check if user already exists ---
    if (purpose === 'signup') {
      const [existingUsers] = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please log in.',
          error: 'DUPLICATE_EMAIL',
        });
      }
    }

    // --- Rate limiting (SRS FR-AUTH-09): max 3 OTPs per 10 minutes ---
    const [recentOtps] = await pool.query(
      `SELECT COUNT(*) as count FROM user_otps
       WHERE email = ? AND created_at > NOW() - INTERVAL 10 MINUTE`,
      [email]
    );

    if (recentOtps[0].count >= MAX_OTP_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please wait 10 minutes before trying again.',
        error: 'RATE_LIMITED',
      });
    }

    // --- Generate OTP and hash it ---
    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    // --- Calculate expiry time (10 minutes from now) ---
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // --- Invalidate any previous unused OTPs for this email ---
    await pool.query(
      `DELETE FROM user_otps WHERE email = ? AND is_verified = FALSE`,
      [email]
    );

    // --- Store OTP hash in database ---
    await pool.query(
      `INSERT INTO user_otps (email, otp_hash, purpose, expires_at)
       VALUES (?, ?, ?, ?)`,
      [email, otpHash, purpose, expiresAt]
    );

    // --- Send OTP via email (SMTP) ---
    const mailOptions = {
      from: `"RideMates" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your RideMates Verification Code',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RideMates Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #333;">
  <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="margin-bottom: 32px;">
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <span style="font-size: 24px; margin-right: 8px;"></span>
        <span style="font-size: 20px; font-weight: 800; color: #ff8c42;">RideMates</span>
      </div>
    </div>

    <!-- Main Content -->
    <div style="margin-bottom: 32px;">
      <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #333;">
        Hi ${email.split('@')[0]},
      </p>
      
      <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #666;">
        Use the following 6-digit code to securely log in to your RideMates account. This code ensures only verified LPU students can access the carpool network.
      </p>
    </div>

    <!-- OTP Display -->
    <div style="background-color: #f5f5f5; border-radius: 12px; padding: 40px 20px; text-align: center; margin-bottom: 28px; border: 2px solid #ff8c42;">
      <p style="margin: 0; font-size: 56px; font-weight: 900; letter-spacing: 12px; color: #ff8c42; font-family: 'Monaco', 'Courier New', monospace;">
        ${otp}
      </p>
    </div>

    <!-- Expiry Info -->
    <div style="text-align: center; margin-bottom: 28px; color: #888; font-size: 13px;">
      Valid for the next 10 minutes
    </div>

    <!-- Security Warning -->
    <div style="background-color: #fef9f0; border-left: 4px solid #ff8c42; padding: 16px; margin-bottom: 28px; border-radius: 4px;">
      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #333;">
        <strong>Never share this code.</strong> RideMates staff and verified drivers will never ask for your OTP. Do not forward this email to anyone.
      </p>
    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid #eee; padding-top: 20px; font-size: 11px; color: #999; text-align: center;">
      <p style="margin: 0;">This email was sent to ${email}</p>
      <p style="margin: 8px 0 0 0;">© 2026 RideMates. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`📧 OTP sent to ${email} (purpose: ${purpose})`);

    // --- Return success (never expose the OTP in the response!) ---
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully! Check your email.',
    });
  } catch (error) {
    console.error('Error in sendOtp:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  }
}


// =============================================================================
// POST /api/auth/verify-otp
// =============================================================================
// Verifies the OTP the user entered. If valid:
//   - For LOGIN:  finds the existing user, issues JWT
//   - For SIGNUP: creates a new user, issues JWT
//
// Request Body: { email, otp, full_name?, phone?, role?, gender? }
//   - full_name is required for signup, optional for login
// Success:      200 OK (with JWT token + user data)
// Errors:       400 (invalid/expired), 403 (locked), 404 (no OTP found)
//
// SRS: FR-AUTH-03, FR-AUTH-05, FR-AUTH-08, FR-AUTH-10
// =============================================================================
async function verifyOtp(req, res) {
  try {
    const { email: rawEmail, otp, full_name, phone, role, gender } = req.body;

    // Normalize email to lowercase for consistent lookups
    const email = rawEmail ? rawEmail.trim().toLowerCase() : '';

    // --- Validate inputs ---
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.',
        error: 'MISSING_FIELDS',
      });
    }

    if (otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be exactly 6 digits.',
        error: 'INVALID_OTP_FORMAT',
      });
    }

    // --- Find the latest unverified OTP for this email ---
    const [otpRecords] = await pool.query(
      `SELECT id, otp_hash, purpose, attempts, expires_at
       FROM user_otps
       WHERE email = ? AND is_verified = FALSE
       ORDER BY created_at DESC
       LIMIT 1`,
      [email]
    );

    if (otpRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No OTP found. Please request a new one.',
        error: 'OTP_NOT_FOUND',
      });
    }

    const otpRecord = otpRecords[0];

    // --- Check brute force protection (SRS FR-AUTH-10) ---
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      return res.status(403).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.',
        error: 'OTP_LOCKED',
      });
    }

    // --- Check expiry (SRS FR-AUTH-08) ---
    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
        error: 'OTP_EXPIRED',
      });
    }

    // --- Verify the OTP hash ---
    const inputHash = hashOTP(otp);

    if (inputHash !== otpRecord.otp_hash) {
      // Increment failed attempts counter
      await pool.query(
        'UPDATE user_otps SET attempts = attempts + 1 WHERE id = ?',
        [otpRecord.id]
      );

      const remainingAttempts = MAX_OTP_ATTEMPTS - (otpRecord.attempts + 1);
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
        error: 'OTP_INVALID',
      });
    }

    // --- OTP hash matches! Now complete the signup/login flow BEFORE marking verified ---
    // We delay marking is_verified = TRUE until the entire flow succeeds.
    // This way, if user creation fails, the user can retry with the same OTP.

    let user;
    let isNewUser = false;

    if (otpRecord.purpose === 'signup') {
      // --- SIGNUP FLOW: Create new user ---
      if (!full_name || !full_name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Full name is required for registration.',
          error: 'MISSING_NAME',
        });
      }

      try {
        const [result] = await pool.query(
          `INSERT INTO users (full_name, email, phone, role, gender)
           VALUES (?, ?, ?, ?, ?)`,
          [full_name.trim(), email, phone || null, role || 'student', gender || 'other']
        );

        user = {
          id: result.insertId,
          full_name: full_name.trim(),
          email,
        };
        isNewUser = true;
      } catch (dbError) {
        if (dbError.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({
            success: false,
            message: 'An account with this email already exists.',
            error: 'DUPLICATE_EMAIL',
          });
        }
        throw dbError;
      }
    } else {
      // --- LOGIN FLOW: Find existing user ---
      const [users] = await pool.query(
        'SELECT id, full_name, email FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No account found. Please sign up first.',
          error: 'USER_NOT_FOUND',
        });
      }
      user = users[0];
    }

    // --- Everything succeeded — NOW mark OTP as verified ---
    await pool.query(
      'UPDATE user_otps SET is_verified = TRUE WHERE id = ?',
      [otpRecord.id]
    );

    // --- Issue JWT (SRS FR-AUTH-05) ---
    const token = signToken(user.id, user.email);

    console.log(`✅ ${isNewUser ? 'Signup' : 'Login'} successful for ${email}`);

    // --- Return JWT + user info ---
    res.status(200).json({
      success: true,
      message: isNewUser
        ? 'Account created successfully! Welcome to RideMates!'
        : 'Login successful! Welcome back!',
      data: {
        token,
        isNewUser,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  }
}


// =============================================================================
// GET /api/auth/profile
// =============================================================================
// Returns the authenticated user's full profile from MySQL.
// The verifyToken middleware already looked up the user and put it in req.user.
//
// SRS FR-AUTH-06 — Profile retrieval
// =============================================================================
async function getProfile(req, res) {
  try {
    const [users] = await pool.query(
      `SELECT id, full_name, email, phone, university, role,
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
// Email is immutable (set at registration).
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


module.exports = { sendOtp, verifyOtp, registerUser: verifyOtp, getProfile, updateProfile };