// =============================================================================
// bookController.js — Booking Controller
// =============================================================================
// Handles seat booking (with transaction + row-level locking), retrieving
// the user's bookings, and cancelling a booking (with tiered penalty).
//
// SRS References:
//   Section 6.3 — Booking Endpoints
//   Section 8.2 — Concurrency Control (FOR UPDATE locking)
//   Section 8.3 — Trust Score & Cancellation Penalty Algorithm
//   FR-BOOK-01 through FR-BOOK-11
// =============================================================================

const pool = require('../config/db');
const { calculateCancellationPenalty } = require('../utils/priceCalculator');


// =============================================================================
// POST /api/bookings/new
// =============================================================================
// Book seat(s) on a ride. Uses a MySQL transaction with SELECT ... FOR UPDATE
// to prevent the double-booking race condition (SRS Section 8.2).
//
// Request Body: { ride_id, seats_booked }
//
// WHY "FOR UPDATE"?
//   Without it, two passengers could simultaneously read available_seats = 1,
//   both try to book, and one ends up with seats = -1 (oversold!).
//   FOR UPDATE locks the row so the second passenger waits until the first
//   transaction finishes. See SRS Section 8.2 for the full explanation.
// =============================================================================
async function bookSeat(req, res) {
  // Get a dedicated connection (not from the shared pool) for the transaction
  const connection = await pool.getConnection();

  try {
    const { ride_id, seats_booked } = req.body;
    const passenger_id = req.user.id; // From verified token, not from body

    const seatsRequested = parseInt(seats_booked) || 1;

    // --- Validate inputs ---
    if (!ride_id) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Please specify a ride to book.',
        error: 'MISSING_FIELDS',
      });
    }

    // ====================== START TRANSACTION ======================
    await connection.beginTransaction();

    // --- Step 1: Lock the ride row (SRS Section 8.2) ---
    // FOR UPDATE tells MySQL: "Lock this row. Any other transaction trying
    // to read/write it must wait until I COMMIT or ROLLBACK."
    const [rideData] = await connection.query(
      `SELECT available_seats, capped_price, status, driver_id, is_women_only, instant_booking
       FROM rides WHERE id = ? FOR UPDATE`,
      [ride_id]
    );

    if (rideData.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'This ride is no longer available.',
        error: 'RIDE_NOT_FOUND',
      });
    }

    const ride = rideData[0];

    // Can't book your own ride
    if (ride.driver_id === passenger_id) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own ride.',
        error: 'SELF_BOOKING',
      });
    }

    // Can only book active rides
    if (ride.status !== 'active') {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'This ride is no longer active.',
        error: 'RIDE_NOT_ACTIVE',
      });
    }

    // --- Women-Only Ride Enforcement (SRS FR-BOOK-10) ---
    // If the ride is marked women-only, only female passengers may book.
    if (ride.is_women_only && req.user.gender !== 'female') {
      await connection.rollback();
      connection.release();
      return res.status(403).json({
        success: false,
        message: 'This ride is reserved for women only.',
        error: 'WOMEN_ONLY_RIDE',
      });
    }

    // --- Step 2: Check seat availability (while row is locked) ---
    if (ride.available_seats < seatsRequested) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: `Not enough seats available. Requested: ${seatsRequested}, Available: ${ride.available_seats}`,
        error: 'INSUFFICIENT_SEATS',
      });
    }

    // --- Step 3: Calculate price paid ---
    // capped_price is stored as a per-seat value (SRS v1.5 per-seat model).
    // price_paid = capped_price × seats_requested — no division needed.
    // This ensures price certainty: passengers always pay the same per-seat rate
    // regardless of how many seats are still available.
    const price_paid = Math.round(parseFloat(ride.capped_price) * seatsRequested);

    // --- Step 4: Determine booking status based on instant_booking flag ---
    // Instant Booking  → confirmed immediately, seats decremented now.
    // Manual Approval  → pending; seats NOT decremented yet (held only after
    //                    the driver explicitly accepts via PUT /bookings/:id/accept).
    const bookingStatus = ride.instant_booking ? 'confirmed' : 'pending';

    if (ride.instant_booking) {
      await connection.query(
        'UPDATE rides SET available_seats = available_seats - ? WHERE id = ?',
        [seatsRequested, ride_id]
      );
    }

    // Check if there's a previously cancelled booking for this passenger+ride
    const [existingBooking] = await connection.query(
      `SELECT id FROM bookings WHERE ride_id = ? AND passenger_id = ? AND status = 'cancelled'`,
      [ride_id, passenger_id]
    );

    let bookingId;
    if (existingBooking.length > 0) {
      // Reactivate the cancelled booking
      bookingId = existingBooking[0].id;
      await connection.query(
        `UPDATE bookings SET status = ?, seats_booked = ?, price_paid = ?, cancellation_penalty = 0 WHERE id = ?`,
        [bookingStatus, seatsRequested, price_paid, bookingId]
      );
    } else {
      // Insert a fresh booking
      const [bookingResult] = await connection.query(
        `INSERT INTO bookings (ride_id, passenger_id, seats_booked, price_paid, status)
         VALUES (?, ?, ?, ?, ?)`,
        [ride_id, passenger_id, seatsRequested, price_paid, bookingStatus]
      );
      bookingId = bookingResult.insertId;
    }

    // --- Step 5: Commit — both changes become permanent ---
    await connection.commit();

    res.status(201).json({
      success: true,
      message: ride.instant_booking
        ? 'Seat booked successfully!'
        : 'Booking request sent! Waiting for driver approval.',
      data: {
        booking_id: bookingId,
        booking_status: bookingStatus,
        ride_id: parseInt(ride_id),
        seats_booked: seatsRequested,
        price_paid,
        remaining_seats: ride.instant_booking
          ? ride.available_seats - seatsRequested
          : ride.available_seats,
      },
    });
  } catch (error) {
    // If ANYTHING fails, undo all changes
    await connection.rollback();
    console.error('Error in bookSeat:', error);

    // Handle duplicate booking (UNIQUE KEY on ride_id + passenger_id)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'You have already booked this ride.',
        error: 'ALREADY_BOOKED',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  } finally {
    // ALWAYS release the connection back to the pool, whether success or failure
    connection.release();
  }
}


// =============================================================================
// GET /api/bookings/my
// =============================================================================
// Get all bookings for the logged-in user. Includes ride details and driver info.
//
// SRS: Section 6.3 — GET /api/bookings/my
// =============================================================================
async function getMyBookings(req, res) {
  try {
    const userId = req.user.id;

    const [bookings] = await pool.query(
      `SELECT b.*,
              r.origin_city, r.destination_city, r.departure_time,
              r.status AS ride_status, r.capped_price, r.vehicle_type,
              u.full_name AS driver_name, u.phone AS driver_phone
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       JOIN users u ON r.driver_id = u.id
       WHERE b.passenger_id = ?
       ORDER BY r.departure_time DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Error in getMyBookings:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  }
}


// =============================================================================
// PUT /api/bookings/:id/cancel
// =============================================================================
// Cancel a booking. Only the passenger who booked can cancel. Applies a tiered
// trust score penalty based on how close to departure the cancellation is.
//
// SRS: FR-BOOK-08, FR-BOOK-11, Section 8.3
//
// Penalty Tiers:
//   > 4 hours before departure  → 0 penalty (free cancellation)
//   ≤ 4h but > 30 min           → −2 Trust Points
//   ≤ 30 min                    → −5 Trust Points (like a no-show)
// =============================================================================
async function cancelBooking(req, res) {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    // --- Fetch the booking + ride departure time ---
    const [bookings] = await pool.query(
      `SELECT b.*, r.departure_time, r.id AS ride_id
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
        error: 'BOOKING_NOT_FOUND',
      });
    }

    const booking = bookings[0];

    // --- Only the passenger can cancel their own booking ---
    if (booking.passenger_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings.',
        error: 'FORBIDDEN',
      });
    }

    if (booking.status !== 'confirmed' && booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already ' + booking.status + '.',
        error: 'BOOKING_NOT_ACTIVE',
      });
    }

    // Pending bookings can be withdrawn freely — no penalty, no seat to restore.
    if (booking.status === 'pending') {
      await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [bookingId]);
      return res.status(200).json({
        success: true,
        message: 'Booking request withdrawn.',
        data: { penalty: 0, tier: 'FREE' },
      });
    }

    // --- Calculate the cancellation penalty (SRS Section 8.3) ---
    const penaltyResult = calculateCancellationPenalty(
      booking.departure_time,
      new Date() // current time = when the cancellation happens
    );

    // --- Apply the penalty if any ---
    if (penaltyResult.penalty > 0) {
      // Deduct trust points and reset streak
      await pool.query(
        `UPDATE users
         SET trust_score = GREATEST(trust_score - ?, 0),
             current_streak = 0
         WHERE id = ?`,
        [penaltyResult.penalty, userId]
      );

      // Record the penalty on the booking for audit trail
      await pool.query(
        'UPDATE bookings SET cancellation_penalty = ? WHERE id = ?',
        [penaltyResult.penalty, bookingId]
      );
    }

    // --- Cancel the booking ---
    await pool.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
      [bookingId]
    );

    // --- Restore the seats back to the ride ---
    await pool.query(
      'UPDATE rides SET available_seats = available_seats + ? WHERE id = ?',
      [booking.seats_booked, booking.ride_id]
    );

    res.status(200).json({
      success: true,
      message: penaltyResult.message,
      data: {
        penalty: penaltyResult.penalty,
        tier: penaltyResult.tier,
      },
    });
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: 'INTERNAL_ERROR',
    });
  }
}


module.exports = { bookSeat, getMyBookings, cancelBooking, acceptBooking, rejectBooking };


// =============================================================================
// PUT /api/bookings/:id/accept
// =============================================================================
// Driver accepts a pending booking. Confirms the booking and decrements
// available_seats atomically (FOR UPDATE prevents a double-accept race).
//
// SRS: FR-BOOK-09 — Manual approval for non-instant-booking rides.
// =============================================================================
async function acceptBooking(req, res) {
  const connection = await pool.getConnection();
  try {
    const bookingId = req.params.id;
    const driverId = req.user.id;

    await connection.beginTransaction();

    // Lock both the booking and the ride row together to prevent a race where
    // the driver double-taps Accept or two concurrent requests sneak through.
    const [rows] = await connection.query(
      `SELECT b.status AS booking_status, b.seats_booked, b.ride_id,
              r.driver_id, r.available_seats
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       WHERE b.id = ? FOR UPDATE`,
      [bookingId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Booking not found.', error: 'BOOKING_NOT_FOUND' });
    }

    const row = rows[0];

    if (row.driver_id !== driverId) {
      await connection.rollback();
      connection.release();
      return res.status(403).json({ success: false, message: 'Only the ride driver can accept bookings.', error: 'FORBIDDEN' });
    }

    if (row.booking_status !== 'pending') {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: 'Only pending bookings can be accepted.', error: 'BOOKING_NOT_PENDING' });
    }

    if (row.available_seats < row.seats_booked) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: 'Not enough seats left to accept this request.', error: 'INSUFFICIENT_SEATS' });
    }

    await connection.query(`UPDATE bookings SET status = 'confirmed' WHERE id = ?`, [bookingId]);
    await connection.query(
      'UPDATE rides SET available_seats = available_seats - ? WHERE id = ?',
      [row.seats_booked, row.ride_id]
    );

    await connection.commit();
    res.status(200).json({ success: true, message: 'Booking accepted.' });
  } catch (error) {
    await connection.rollback();
    console.error('Error in acceptBooking:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.', error: 'INTERNAL_ERROR' });
  } finally {
    connection.release();
  }
}


// =============================================================================
// PUT /api/bookings/:id/reject
// =============================================================================
// Driver rejects a pending booking. Marks it cancelled — no seat to restore
// since pending bookings never decremented available_seats.
//
// SRS: FR-BOOK-09
// =============================================================================
async function rejectBooking(req, res) {
  try {
    const bookingId = req.params.id;
    const driverId = req.user.id;

    const [rows] = await pool.query(
      `SELECT b.status AS booking_status, r.driver_id
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.', error: 'BOOKING_NOT_FOUND' });
    }

    const row = rows[0];

    if (row.driver_id !== driverId) {
      return res.status(403).json({ success: false, message: 'Only the ride driver can reject bookings.', error: 'FORBIDDEN' });
    }

    if (row.booking_status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending bookings can be rejected.', error: 'BOOKING_NOT_PENDING' });
    }

    await pool.query(`UPDATE bookings SET status = 'cancelled' WHERE id = ?`, [bookingId]);
    res.status(200).json({ success: true, message: 'Booking request rejected.' });
  } catch (error) {
    console.error('Error in rejectBooking:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.', error: 'INTERNAL_ERROR' });
  }
}