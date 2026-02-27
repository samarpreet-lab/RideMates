const pool = require('../config/db');
const { calculatePrice } = require('../utils/priceCalculator');

// @desc    Post a new ride
// @route   POST /api/rides/create
async function createRide(req, res) {
  try {
    const {
      driver_id, origin_city, origin_lat, origin_lng,
      destination_city, dest_lat, dest_lng, distance_km,
      departure_time, available_seats, vehicle_type,
      vehicle_mileage, fuel_type, driver_set_price, is_emergency_route
    } = req.body;

    // 1. Fetch current fuel rate from DB
    const [rates] = await pool.query('SELECT rate_per_litre FROM fuel_rates WHERE fuel_type = ?', [fuel_type || 'petrol']);
    const fuel_rate = rates[0] ? rates[0].rate_per_litre : 105;

    // 2. Run the math algorithm
    const pricing = calculatePrice({
      distance_km,
      fuel_rate,
      vehicle_mileage: vehicle_mileage || 15,
      driver_set_price
    });

    // 3. Save to database
    const [result] = await pool.query(
      `INSERT INTO rides 
       (driver_id, origin_city, origin_lat, origin_lng, destination_city, dest_lat, dest_lng, distance_km, 
        departure_time, available_seats, vehicle_type, vehicle_mileage, fuel_type, 
        base_price, driver_set_price, capped_price, is_emergency_route) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        driver_id, origin_city, origin_lat, origin_lng, destination_city, dest_lat, dest_lng, distance_km,
        departure_time, available_seats, vehicle_type || 'car', vehicle_mileage || 15.00, fuel_type || 'petrol',
        pricing.base_price, driver_set_price, pricing.capped_price, is_emergency_route || false
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Ride posted successfully!',
      data: {
        ride_id: result.insertId,
        pricing_breakdown: pricing,
        per_seat_price: Math.round((pricing.capped_price / available_seats) * 100) / 100
      }
    });

  } catch (error) {
    console.error('Error in createRide:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
}

async function searchRides(req, res) {
  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({ success: false, message: 'Origin and destination are required' });
    }

    // Notice the JOIN: We fetch the ride details AND the driver's name in one query!
    const [rides] = await pool.query(
      `SELECT r.*, u.full_name as driver_name 
       FROM rides r 
       JOIN users u ON r.driver_id = u.id 
       WHERE r.origin_city = ? 
       AND r.destination_city = ? 
       AND r.available_seats > 0 
       AND r.status = 'active'`,
      [origin, destination]
    );

    res.status(200).json({
      success: true,
      count: rides.length,
      data: rides
    });

  } catch (error) {
    console.error('Error in searchRides:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
}
module.exports = { createRide, searchRides };