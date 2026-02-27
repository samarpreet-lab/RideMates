const pool = require('../config/db');

// @desc    Register a new user after Firebase Auth
// @route   POST /api/auth/register
async function registerUser(req, res) {
  try {
    const { firebase_uid, full_name, email, phone, role } = req.body;

    // 1. Domain Validation (Critical for your project's unique feature)
    if (!email.endsWith('@lpu.in')) {
      return res.status(400).json({
        success: false,
        message: 'Access Denied: Only @lpu.in university emails are allowed.'
      });
    }

    // 2. Insert into MySQL Database
    const [result] = await pool.query(
      `INSERT INTO users (firebase_uid, full_name, email, phone, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [firebase_uid, full_name, email, phone, role || 'student']
    );

    // 3. Send Success Response
    res.status(201).json({
      success: true,
      message: 'User registered successfully in RideMates!',
      data: {
        id: result.insertId,
        firebase_uid,
        full_name,
        email
      }
    });

  } catch (error) {
    console.error('Error in registerUser:', error);
    
    // Handle duplicate email error specifically
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'User already exists!' });
    }
    
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
}

module.exports = { registerUser };