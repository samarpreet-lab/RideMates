// =============================================================================
// rideController.js — Ride CRUD Controller
// =============================================================================
// Handles creating, searching, viewing, updating, cancelling, completing
// rides, and retrieving the logged-in user's rides.
//
// SRS References:
//   Section 6.2 — Ride Endpoints
//   Section 8.1 — Tiered Pricing Algorithm
//   FR-RIDE-01 through FR-RIDE-13
//   FR-LIFE-02 — Mark ride complete
// =============================================================================

const pool = require('../config/db');
const { calculatePrice, calculatePerSeatPrice } = require('../utils/priceCalculator');


// =============================================================================
// POST /api/rides/create
// =============================================================================
// The driver fills out a form and posts a new ride. We auto-calculate prices
// using the tiered pricing algorithm (different multiplier per vehicle type).
//
// SRS: FR-RIDE-01, FR-RIDE-02, FR-RIDE-03
//
// Request Body:
//   origin_city, origin_lat, origin_lng, destination_city, dest_lat, dest_lng,
//   distance_km, departure_time, available_seats, vehicle_type, vehicle_mileage,
//   fuel_type, driver_set_price, is_emergency_route?, is_women_only?,
//   instant_booking?, instant_booking_ack?
// =============================================================================
async function createRide(req, res) {
  try {
    const {
      origin_city, origin_lat, origin_lng,
      destination_city, dest_lat, dest_lng,
      distance_km, departure_time, available_seats,
      vehicle_type, vehicle_mileage, fuel_type,
      driver_set_price,
      is_emergency_route,
      is_women_only,
      instant_booking,
      instant_booking_ack,
    } = req.body;

    // The driver's ID comes from the verified token (middleware), not the body.
    // This prevents someone from posting rides as another user.
    const driver_id = req.user.id;

    // --- Validate required fields ---
    if (!origin_city || !destination_city || !distance_km || !departure_time || !available_seats || !driver_set_price) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.',
        error: 'MISSING_FIELDS',
      });
    }

    // --- Instant Booking Acknowledgment (SRS FR-BOOK-09) ---
    // If the driver enables Instant Booking, they MUST check the acknowledgment
    // checkbox (accepting the Trust Score penalty clause). We refuse to publish
    // the ride until they do.
    if (instant_booking && !instant_booking_ack) {
      return res.status(400).json({
        success: false,
        message: 'You must acknowledge the Instant Booking trust contract before publishing.',
        error: 'INSTANT_BOOKING_ACK_REQUIRED',
      });
    }

    // --- Fetch current fuel rate from the database ---
    // The fuel_rates table has one row per fuel type (petrol, diesel, cng, electric)
    const [rates] = await pool.query(
      'SELECT rate_per_litre FROM fuel_rates WHERE fuel_type = ?',
      [fuel_type || 'petrol']
    );
    const fuel_rate = rates.length > 0 ? parseFloat(rates[0].rate_per_litre) : 105;

    // --- Run the tiered pricing algorithm (SRS Section 8.1) ---
    // This calculates base_price, max_allowed, and capped_price
    // using the vehicle-specific multiplier (bike 1.2x, auto 1.35x, car 1.5x)
    const pricing = calculatePrice({
      distance_km: parseFloat(distance_km),
      fuel_rate,
      vehicle_mileage: parseFloat(vehicle_mileage) || 15,
      vehicle_type: vehicle_type || 'car',
      driver_set_price: parseFloat(driver_set_price),
    });

    // --- Calculate per-seat price for display ---
    const per_seat_price = calculatePerSeatPrice(pricing.capped_price, parseInt(available_seats));

    // --- Insert the ride into MySQL ---
    const [result] = await pool.query(
      `INSERT INTO rides
       (driver_id, origin_city, origin_lat, origin_lng,
        destination_city, dest_lat, dest_lng, distance_km,
        departure_time, available_seats, vehicle_type, vehicle_mileage,
        fuel_type, base_price, driver_set_price, capped_price,
        is_emergency_route, is_women_only, instant_booking, instant_booking_ack)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        driver_id,
        origin_city, origin_lat || 0, origin_lng || 0,
        destination_city, dest_lat || 0, dest_lng || 0,
        distance_km,
        departure_time,
        available_seats,
        vehicle_type || 'car',
        vehicle_mileage || 15.00,
        fuel_type || 'petrol',
        pricing.base_price,
        driver_set_price,
        pricing.capped_price,
        is_emergency_route || false,
        is_women_only || false,
        instant_booking || false,
        instant_booking_ack || false,
      ]
    );

    // --- Return the ride details + pricing breakdown ---
    res.status(201).json({
      success: true,
      message: 'Ride posted successfully!',
      data: {
        ride_id: result.insertId,
        base_price: pricing.base_price,
        max_allowed: pricing.max_allowed,
        capped_price: pricing.capped_price,
        was_clamped: pricing.was_clamped,
        multiplier: pricing.multiplier,
        per_seat_price,
      },
    });
  } catch (error) {
    console.error('Error in createRide:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  }
}


// =============================================================================
// GET /api/rides/search?origin=X&destination=Y&date=YYYY-MM-DD&emergency_only=true
// =============================================================================
// Search for active rides with available seats. Supports optional filters:
//   • date          — filter by departure date (YYYY-MM-DD)
//   • emergency_only — only show rides marked as emergency routes
//
// SRS: FR-RIDE-06, FR-RIDE-09 (emergency route filter)
// =============================================================================
async function searchRides(req, res) {
  try {
    const { origin, destination, date, emergency_only } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination are required.',
        error: 'MISSING_FIELDS',
      });
    }

    // --- Build the SQL query dynamically ---
    // Start with base conditions, then add optional filters
    let sql = `
      SELECT r.*, u.full_name AS driver_name, u.trust_score AS driver_trust_score
      FROM rides r
      JOIN users u ON r.driver_id = u.id
      WHERE r.origin_city = ?
        AND r.destination_city = ?
        AND r.available_seats > 0
        AND r.status = 'active'
    `;
    const params = [origin, destination];

    // Optional: filter by specific date
    if (date) {
      sql += ' AND DATE(r.departure_time) = ?';
      params.push(date);
    }

    // Optional: only emergency routes (for strikes/transport shutdowns)
    if (emergency_only === 'true') {
      sql += ' AND r.is_emergency_route = TRUE';
    }

    // Sort by departure time (soonest first)
    sql += ' ORDER BY r.departure_time ASC';

    const [rides] = await pool.query(sql, params);

    res.status(200).json({
      success: true,
      count: rides.length,
      data: rides,
    });
  } catch (error) {
    console.error('Error in searchRides:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  }
}


// =============================================================================
// GET /api/rides/:id
// =============================================================================
// Get full details of a single ride, including driver info.
//
// SRS: Section 6.2 — GET /api/rides/:id
// =============================================================================
async function getRideById(req, res) {
  try {
    const rideId = req.params.id;

    const [rides] = await pool.query(
      `SELECT r.*,
              u.full_name AS driver_name,
              u.email AS driver_email,
              u.trust_score AS driver_trust_score,
              u.phone AS driver_phone
       FROM rides r
       JOIN users u ON r.driver_id = u.id
       WHERE r.id = ?`,
      [rideId]
    );

    if (rides.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'This ride is no longer available.',
        error: 'RIDE_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: rides[0],
    });
  } catch (error) {
    console.error('Error in getRideById:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  }
}


// =============================================================================
// PUT /api/rides/:id
// =============================================================================
// Update a ride. Only the driver who posted the ride can edit it.
// Updatable fields: departure_time, available_seats, driver_set_price,
//                   is_emergency_route, is_women_only
//
// SRS: Section 6.2 — PUT /api/rides/:id (driver only, 403 otherwise)
// =============================================================================
async function updateRide(req, res) {
  try {
    const rideId = req.params.id;
    const userId = req.user.id;

    // --- Check that the ride exists and belongs to this driver ---
    const [rides] = await pool.query(
      'SELECT driver_id, status FROM rides WHERE id = ?',
      [rideId]
    );

    if (rides.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'This ride is no longer available.',
        error: 'RIDE_NOT_FOUND',
      });
    }

    if (rides[0].driver_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own rides.',
        error: 'FORBIDDEN',
      });
    }

    if (rides[0].status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active rides can be updated.',
        error: 'RIDE_NOT_ACTIVE',
      });
    }

    // --- Build the SET clause dynamically ---
    const { departure_time, available_seats, driver_set_price, is_emergency_route, is_women_only } = req.body;
    const updates = [];
    const values = [];

    if (departure_time) {
      updates.push('departure_time = ?');
      values.push(departure_time);
    }
    if (available_seats !== undefined) {
      updates.push('available_seats = ?');
      values.push(available_seats);
    }
    if (driver_set_price !== undefined) {
      // --- Re-run pricing algorithm when price changes (SRS FR-RIDE-02/03) ---
      // We need the ride's distance, mileage, fuel_type, and vehicle_type to recalculate
      const [rideDetails] = await pool.query(
        'SELECT distance_km, vehicle_mileage, fuel_type, vehicle_type FROM rides WHERE id = ?',
        [rideId]
      );
      const rd = rideDetails[0];
      const [fuelRows] = await pool.query(
        'SELECT rate_per_litre FROM fuel_rates WHERE fuel_type = ?',
        [rd.fuel_type]
      );
      const fuelRate = fuelRows.length > 0 ? parseFloat(fuelRows[0].rate_per_litre) : 105;

      const repricing = calculatePrice({
        distance_km: parseFloat(rd.distance_km),
        fuel_rate: fuelRate,
        vehicle_mileage: parseFloat(rd.vehicle_mileage),
        vehicle_type: rd.vehicle_type,
        driver_set_price: parseFloat(driver_set_price),
      });

      updates.push('driver_set_price = ?');
      values.push(driver_set_price);
      updates.push('capped_price = ?');
      values.push(repricing.capped_price);
      updates.push('base_price = ?');
      values.push(repricing.base_price);
    }
    if (is_emergency_route !== undefined) {
      updates.push('is_emergency_route = ?');
      values.push(is_emergency_route);
    }
    if (is_women_only !== undefined) {
      updates.push('is_women_only = ?');
      values.push(is_women_only);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update.',
        error: 'MISSING_FIELDS',
      });
    }

    values.push(rideId);
    await pool.query(`UPDATE rides SET ${updates.join(', ')} WHERE id = ?`, values);

    res.status(200).json({
      success: true,
      message: 'Ride updated successfully.',
    });
  } catch (error) {
    console.error('Error in updateRide:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  }
}


// =============================================================================
// DELETE /api/rides/:id
// =============================================================================
// Cancel a ride by setting status to 'cancelled'. Only the driver can cancel.
// This does NOT delete the row — we keep it for history/reports.
//
// SRS: Section 6.2 — DELETE /api/rides/:id (driver only)
// =============================================================================
async function cancelRide(req, res) {
  try {
    const rideId = req.params.id;
    const userId = req.user.id;

    // --- Check ownership ---
    const [rides] = await pool.query(
      'SELECT driver_id, status FROM rides WHERE id = ?',
      [rideId]
    );

    if (rides.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'This ride is no longer available.',
        error: 'RIDE_NOT_FOUND',
      });
    }

    if (rides[0].driver_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own rides.',
        error: 'FORBIDDEN',
      });
    }

    if (rides[0].status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This ride is already ' + rides[0].status + '.',
        error: 'RIDE_NOT_ACTIVE',
      });
    }

    // --- Cancel the ride ---
    await pool.query("UPDATE rides SET status = 'cancelled' WHERE id = ?", [rideId]);

    // --- Also cancel all confirmed bookings on this ride ---
    await pool.query(
      "UPDATE bookings SET status = 'cancelled' WHERE ride_id = ? AND status = 'confirmed'",
      [rideId]
    );

    res.status(200).json({
      success: true,
      message: 'Ride cancelled successfully.',
    });
  } catch (error) {
    console.error('Error in cancelRide:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  }
}


// =============================================================================
// PUT /api/rides/:id/complete
// =============================================================================
// Mark a ride as completed. Only the driver can do this. Sets status to
// 'completed' and records the completion timestamp. All confirmed bookings
// on this ride also transition to 'completed'.
//
// SRS: FR-LIFE-02 — Mark ride complete
// =============================================================================
async function completeRide(req, res) {
  try {
    const rideId = req.params.id;
    const userId = req.user.id;

    // --- Check ownership ---
    const [rides] = await pool.query(
      'SELECT driver_id, status FROM rides WHERE id = ?',
      [rideId]
    );

    if (rides.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'This ride is no longer available.',
        error: 'RIDE_NOT_FOUND',
      });
    }

    if (rides[0].driver_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the driver can mark a ride as complete.',
        error: 'FORBIDDEN',
      });
    }

    if (rides[0].status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active rides can be completed.',
        error: 'RIDE_NOT_ACTIVE',
      });
    }

    // --- Mark ride as completed + record timestamp ---
    await pool.query(
      "UPDATE rides SET status = 'completed', completed_at = NOW() WHERE id = ?",
      [rideId]
    );

    // --- Transition all confirmed bookings to 'completed' (FR-LIFE-02) ---
    await pool.query(
      "UPDATE bookings SET status = 'completed' WHERE ride_id = ? AND status = 'confirmed'",
      [rideId]
    );

    res.status(200).json({
      success: true,
      message: 'Ride completed! The 12-hour report window is now open.',
    });
  } catch (error) {
    console.error('Error in completeRide:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  }
}


// =============================================================================
// GET /api/rides/my
// =============================================================================
// Get all rides associated with the logged-in user — both rides they posted
// (as driver) and rides they booked (as passenger).
//
// SRS: Section 6.2 — overview endpoint for "My Rides" screen
// =============================================================================
async function getMyRides(req, res) {
  try {
    const userId = req.user.id;

    // --- Rides I posted as a driver ---
    const [postedRides] = await pool.query(
      `SELECT r.*, 'driver' AS my_role
       FROM rides r
       WHERE r.driver_id = ?
       ORDER BY r.departure_time DESC`,
      [userId]
    );

    // --- Rides I booked as a passenger ---
    const [bookedRides] = await pool.query(
      `SELECT r.*, b.seats_booked, b.price_paid, b.status AS booking_status,
              'passenger' AS my_role,
              u.full_name AS driver_name
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       JOIN users u ON r.driver_id = u.id
       WHERE b.passenger_id = ?
       ORDER BY r.departure_time DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        as_driver: postedRides,
        as_passenger: bookedRides,
      },
    });
  } catch (error) {
    console.error('Error in getMyRides:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  }
}


module.exports = {
  createRide,
  searchRides,
  getRideById,
  updateRide,
  cancelRide,
  completeRide,
  getMyRides,
};