const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
// 1. Import your new route file
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// 2. Tell Express to use the route
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RideMates API is running perfectly!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚗 Server running on port ${PORT}`);
});

// Add this right under the authRoutes import:
const rideRoutes = require('./routes/rideRoutes');

// Add this right under app.use('/api/auth', authRoutes):
app.use('/api/rides', rideRoutes);

const bookRoutes = require('./routes/bookRoutes'); // <-- Add this
app.use('/api/bookings', bookRoutes); // <-- Add this