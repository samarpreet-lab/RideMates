const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/authController');

// Define the POST route for registration
router.post('/register', registerUser);

module.exports = router;