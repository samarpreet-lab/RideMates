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
const { calculatePrice, calculatePerSeatPrice, calculateCancellationPenalty } = require('../utils/priceCalculator');


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
      departure_time, available_seats,
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
    if (!origin_city || !destination_city || !departure_time || !available_seats || !driver_set_price) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.',
        error: 'MISSING_FIELDS',
      });
    }

    // --- FIX: Prevent double-submit within 60 seconds ---
    const [recentRides] = await pool.query(
      `SELECT id FROM rides 
       WHERE driver_id = ? 
         AND origin_city = ? 
         AND destination_city = ? 
         AND ABS(TIMESTAMPDIFF(SECOND, departure_time, ?)) < 60
         AND created_at > DATE_SUB(NOW(), INTERVAL 60 SECOND)
       LIMIT 1`,
      [driver_id, origin_city, destination_city, departure_time]
    );
    if (recentRides.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A similar ride was just posted. Please wait before posting again.',
        error: 'DUPLICATE_RIDE',
      });
    }

    // --- FIX: Validate numeric inputs ---
    const seatsNum = parseInt(available_seats);
    if (isNaN(seatsNum) || seatsNum < 1 || seatsNum > 10) {
      return res.status(400).json({
        success: false,
        message: 'Available seats must be between 1 and 10.',
        error: 'INVALID_SEATS',
      });
    }

    const priceNum = parseFloat(driver_set_price);
    if (isNaN(priceNum) || priceNum < 1 || priceNum > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Price must be between ₹1 and ₹10,000.',
        error: 'INVALID_PRICE',
      });
    }

    // --- Validate coordinates ---
    if (!origin_lat || !origin_lng || !dest_lat || !dest_lng) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination coordinates are required.',
        error: 'MISSING_COORDINATES',
      });
    }

    // FIX: Validate coordinate ranges
    const validateCoord = (val, min, max, name) => {
      const num = parseFloat(val);
      if (isNaN(num) || num < min || num > max) {
        return { valid: false, error: `${name} must be between ${min} and ${max}` };
      }
      return { valid: true, value: num };
    };

    const oLat = validateCoord(origin_lat, -90, 90, 'Origin latitude');
    const oLng = validateCoord(origin_lng, -180, 180, 'Origin longitude');
    const dLat = validateCoord(dest_lat, -90, 90, 'Destination latitude');
    const dLng = validateCoord(dest_lng, -180, 180, 'Destination longitude');

    if (!oLat.valid || !oLng.valid || !dLat.valid || !dLng.valid) {
      const errorMsg = [oLat, oLng, dLat, dLng].find(c => !c.valid)?.error;
      return res.status(400).json({
        success: false,
        message: errorMsg || 'Invalid coordinates.',
        error: 'INVALID_COORDINATES',
      });
    }

    // --- Backend OSRM Integration (Security: never trust frontend distance) ---
    // OSRM expects longitude,latitude order.
    let distance_km;
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${oLng.value},${oLat.value};${dLng.value},${dLat.value}?overview=false`;
      const osrmRes = await fetch(osrmUrl, { signal: AbortSignal.timeout(10000) });
      
      // FIX: Check HTTP status before parsing JSON
      if (!osrmRes.ok) {
        console.error('OSRM API error:', osrmRes.status);
        return res.status(503).json({
          success: false,
          message: 'Route calculation service temporarily unavailable.',
          error: 'OSRM_UNAVAILABLE',
        });
      }
      
      const osrmData = await osrmRes.json();

      if (!osrmData.routes || osrmData.routes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Unable to calculate a valid driving route between these locations.',
          error: 'NO_ROUTE',
        });
      }

      // OSRM returns distance in meters — convert to kilometres
      distance_km = osrmData.routes[0].distance / 1000;
    } catch (osrmError) {
      console.error('OSRM route calculation failed:', osrmError.message);
      return res.status(400).json({
        success: false,
        message: 'Unable to calculate a valid driving route between these locations.',
        error: 'ROUTE_CALC_FAILED',
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
    // driver_set_price is the per-seat price the driver wants to charge.
    // calculatePrice returns capped_price as per-seat (v1.5 model).
    const pricing = calculatePrice({
      distance_km,
      fuel_rate,
      vehicle_mileage: parseFloat(vehicle_mileage) || 15,
      vehicle_type: vehicle_type || 'car',
      driver_set_price: parseFloat(driver_set_price),
      available_seats: parseInt(available_seats),
    });

    // pricing.capped_price IS already per-seat — no further division needed
    const per_seat_price = pricing.capped_price;

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
        AND r.departure_time > NOW()
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

    const rideData = rides[0];

    // If the requesting user is the driver, include passenger booking info
    if (req.user && req.user.id === rideData.driver_id) {
      const [passengers] = await pool.query(
        `SELECT b.id AS booking_id, b.seats_booked, b.price_paid, b.status AS booking_status,
                pu.id AS passenger_id, pu.full_name AS passenger_name,
                pu.email AS passenger_email, pu.phone AS passenger_phone,
                pu.trust_score AS passenger_trust_score
         FROM bookings b
         JOIN users pu ON b.passenger_id = pu.id
         WHERE b.ride_id = ? AND b.status IN ('pending', 'confirmed', 'completed')
         ORDER BY b.booked_at ASC`,
        [rideId]
      );
      rideData.passengers = passengers;
    }

    // If the requesting user is a passenger, tell them about their own booking
    if (req.user && req.user.id !== rideData.driver_id) {
      const [myBookings] = await pool.query(
        `SELECT id AS booking_id, seats_booked, price_paid, status AS booking_status
         FROM bookings
         WHERE ride_id = ? AND passenger_id = ?
         LIMIT 1`,
        [rideId, req.user.id]
      );
      if (myBookings.length > 0) {
        rideData.my_booking = myBookings[0];
      }
    }

    res.status(200).json({
      success: true,
      data: rideData,
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
  // FIX: Use transaction to make ride update atomic (QA Issue #14)
  const connection = await pool.getConnection();

  try {
    const rideId = req.params.id;
    const userId = req.user.id;

    await connection.beginTransaction();

    // --- Check that the ride exists and belongs to this driver (with lock) ---
    const [rides] = await connection.query(
      'SELECT driver_id, status FROM rides WHERE id = ? FOR UPDATE',
      [rideId]
    );

    if (rides.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'This ride is no longer available.',
        error: 'RIDE_NOT_FOUND',
      });
    }

    if (rides[0].driver_id !== userId) {
      await connection.rollback();
      connection.release();
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own rides.',
        error: 'FORBIDDEN',
      });
    }

    if (rides[0].status !== 'active') {
      await connection.rollback();
      connection.release();
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
      // --- Lock: cannot change departure time if passengers have already booked ---
      const [[{ bookings }]] = await connection.query(
        'SELECT COUNT(*) AS bookings FROM bookings WHERE ride_id = ? AND status = ?',
        [rideId, 'confirmed']
      );
      if (bookings > 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'You cannot change the departure time because passengers have already booked. Please cancel and repost the ride.',
          error: 'RIDE_HAS_PASSENGERS',
        });
      }
      updates.push('departure_time = ?');
      values.push(departure_time);
    }
    if (available_seats !== undefined) {
      updates.push('available_seats = ?');
      values.push(available_seats);
    }
    if (driver_set_price !== undefined) {
      // --- Re-run pricing algorithm when price changes (SRS FR-RIDE-02/03) ---
      const [rideDetails] = await connection.query(
        'SELECT distance_km, vehicle_mileage, fuel_type, vehicle_type, available_seats FROM rides WHERE id = ?',
        [rideId]
      );
      const rd = rideDetails[0];
      const [fuelRows] = await connection.query(
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
        available_seats: parseInt(rd.available_seats) || 1,
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
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update.',
        error: 'MISSING_FIELDS',
      });
    }

    values.push(rideId);
    await connection.query(`UPDATE rides SET ${updates.join(', ')} WHERE id = ?`, values);

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Ride updated successfully.',
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error in updateRide:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  } finally {
    connection.release();
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
      'SELECT driver_id, status, departure_time FROM rides WHERE id = ?',
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

    // --- Driver cancellation penalty: mirrors the passenger penalty logic ---
    // If confirmed passengers exist and cancellation is within the penalty window,
    // deduct Trust Points from the driver — mutual accountability (SRS 8.3).
    const [confirmedBookings] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM bookings WHERE ride_id = ? AND status = ?',
      [rideId, 'confirmed']
    );
    if (confirmedBookings[0].cnt > 0) {
      const { penalty } = calculateCancellationPenalty(rides[0].departure_time, new Date());
      if (penalty > 0) {
        await pool.query(
          'UPDATE users SET trust_score = trust_score - ? WHERE id = ?',
          [penalty, userId]
        );
      }
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
      'SELECT driver_id, status, departure_time FROM rides WHERE id = ?',
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

    // --- Time Lock: cannot complete a ride before it was scheduled to depart ---
    if (new Date() < new Date(rides[0].departure_time)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot mark a ride as complete before its scheduled departure time.',
        error: 'RIDE_NOT_DEPARTED',
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
    // Time-boxed to the last 30 days + future rides to keep the query fast.
    const [postedRides] = await pool.query(
      `SELECT r.*, 'driver' AS my_role,
              (SELECT COUNT(*) FROM bookings b
               WHERE b.ride_id = r.id AND b.status IN ('confirmed', 'completed')) AS booking_count
       FROM rides r
       WHERE r.driver_id = ?
         AND r.departure_time >= NOW() - INTERVAL 30 DAY
       ORDER BY r.departure_time DESC`,
      [userId]
    );

    // --- Rides I booked as a passenger ---
    // Same 30-day time-box applied here.
    const [bookedRides] = await pool.query(
      `SELECT r.*, b.id AS booking_id, b.seats_booked, b.price_paid, b.status AS booking_status,
              'passenger' AS my_role,
              u.full_name AS driver_name
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       JOIN users u ON r.driver_id = u.id
       WHERE b.passenger_id = ?
         AND r.departure_time >= NOW() - INTERVAL 30 DAY
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