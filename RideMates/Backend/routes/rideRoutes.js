const express = require('express');
const router = express.Router();
const { createRide, searchRides } = require('../controllers/rideController');

router.post('/create', createRide);
router.get('/search', searchRides); // <-- Added this line

module.exports = router;