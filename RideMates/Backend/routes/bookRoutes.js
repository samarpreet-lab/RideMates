const express = require('express');
const router = express.Router();
const { bookSeat } = require('../controllers/bookController');

router.post('/new', bookSeat);

module.exports = router;