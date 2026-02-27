const pool = require('../config/db');

// @desc    Book a seat on a ride
// @route   POST /api/bookings/new
async function bookSeat(req, res) {
  // 1. We grab a dedicated connection for the transaction
  const connection = await pool.getConnection();
  
  try {
    const { ride_id, passenger_id, seats_to_book } = req.body;

    // 2. Start the lock
    await connection.beginTransaction();

    // 3. Check seats with 'FOR UPDATE' (This locks the row so nobody else can touch it)
    const [rideData] = await connection.query(
      `SELECT available_seats, capped_price FROM rides WHERE id = ? FOR UPDATE`,
      [ride_id]
    );

    if (rideData.length === 0) throw new Error("Ride not found");
    const ride = rideData[0];

    // 4. Validate enough seats exist
    if (ride.available_seats < seats_to_book) {
      throw new Error(`Booking failed: Only ${ride.available_seats} seats remaining.`);
    }

    // 5. Decrement the seats
    await connection.query(
      `UPDATE rides SET available_seats = available_seats - ? WHERE id = ?`,
      [seats_to_book, ride_id]
    );

    // 6. Calculate price (simplified for this booking)
    const price_paid = (ride.capped_price / (ride.available_seats + seats_to_book)) * seats_to_book;

    // 7. Save the booking record
    const [booking] = await connection.query(
      `INSERT INTO bookings (ride_id, passenger_id, seats_booked, price_paid) VALUES (?, ?, ?, ?)`,
      [ride_id, passenger_id, seats_to_book, price_paid]
    );

    // 8. ALL GOOD - Commit the changes!
    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Seat booked successfully!',
      data: { booking_id: booking.insertId, seats_booked: seats_to_book }
    });

  } catch (error) {
    // IF ANYTHING FAILS, undo all changes instantly
    await connection.rollback();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
}

module.exports = { bookSeat };