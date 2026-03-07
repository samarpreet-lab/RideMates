// =============================================================================
// priceCalculator.js
// RideMates Pricing & Penalty Utility
//
// This file contains three pure functions (no database calls, no side effects):
//   1. calculatePrice()              — tiered ride price with vehicle-specific multiplier
//   2. calculatePerSeatPrice()       — splits total price across passengers
//   3. calculateCancellationPenalty() — decides trust-score penalty on cancellation
//
// "Pure function" means: same inputs → always same output, nothing external
// is read or changed. This makes the functions easy to test in isolation.
//
// SRS v1.3: Pricing is now tiered by vehicle type:
//   bike/scooter → 1.2x  |  auto → 1.35x  |  car → 1.5x
// SRS v1.5: Per-seat pricing model — capped_price is now stored per seat.
//   Green zone  ≤ base_per_seat × 1.2  ("Fair Price")
//   Yellow zone ≤ max_per_seat         ("Within Range")
//   Hard cap     = max_per_seat        (slider ceiling)
// =============================================================================


// =============================================================================
// CONSTANT: Vehicle Maintenance Multiplier Lookup Table (SRS Section 8.1)
//
// Different vehicles have different maintenance costs (tyres, oil, insurance).
// The multiplier determines how much above the raw fuel cost a driver may
// charge. Bigger/heavier vehicles → higher multiplier.
//
// Under India's Motor Vehicles Act, white-plate vehicles may only do
// cost-sharing. The multiplier caps the price to a legal ceiling.
// =============================================================================
const VEHICLE_MULTIPLIERS = {
  bike:    1.2,   // Low maintenance, low wear-and-tear
  scooter: 1.2,   // Same class as bike
  auto:    1.35,  // Moderate maintenance, three-wheeler upkeep
  car:     1.5,   // Highest maintenance — tyres, engine oil, insurance
};

// Fallback if an unknown vehicle type is passed
const DEFAULT_MULTIPLIER = 1.5;


// =============================================================================
// FUNCTION 1: calculatePrice (TIERED — SRS Section 8.1)
//
// PURPOSE:
//   Given the trip distance, fuel price, mileage, vehicle type, and the
//   driver's requested price — return the legal capped price using the
//   vehicle-specific maintenance multiplier.
//
// FORMULA (per-seat model — SRS v1.5):
//   base_price         = (distance_km × fuel_rate) / vehicle_mileage   ← total fuel
//   multiplier         = lookup from VEHICLE_MULTIPLIERS (1.2, 1.35, or 1.5)
//   max_allowed        = base_price × multiplier                        ← total ceiling
//   base_per_seat      = base_price / available_seats                   ← green zone start
//   recommended_per_seat = base_per_seat × 1.2                         ← green zone ceiling
//   max_per_seat       = max_allowed / available_seats                  ← hard cap (red)
//   capped_price       = MIN(driver_set_price, max_per_seat)            ← per-seat, stored in DB
//
// WORKED EXAMPLE — Car, 3 seats, 40 km, ₹105/L, 15 km/L:
//   base_price         = (40×105)/15  = ₹280.00
//   max_allowed        = 280 × 1.5   = ₹420.00
//   base_per_seat      = 280 / 3     = ₹93.33   ← Green zone start
//   recommended_per_seat = 93.33×1.2 = ₹112.00  ← Green zone ceiling (Fair Price)
//   max_per_seat       = 420 / 3     = ₹140.00  ← Hard cap
//   driver asks ₹115/seat → capped_price = ₹115.00 ✅ Within cap (Yellow zone)
//   driver asks ₹160/seat → capped to    = ₹140.00 ⚠️ Clamped
//
// PARAMETERS:
//   distance_km        (number) — total trip distance in kilometres
//   fuel_rate          (number) — cost per litre in rupees
//   vehicle_mileage    (number) — km per litre for the vehicle
//   vehicle_type       (string) — 'bike', 'scooter', 'auto', or 'car'
//   driver_set_price   (number) — per-seat price the driver wants to charge
//   available_seats    (number) — number of seats the driver is offering
//
// RETURNS:
//   {
//     base_price           : number  — total raw fuel cost (reference)
//     multiplier           : number  — vehicle multiplier used
//     max_allowed          : number  — total legal price ceiling (reference)
//     base_per_seat        : number  — pure fuel share per seat (Green zone start)
//     recommended_per_seat : number  — base_per_seat × 1.2 (Green zone ceiling)
//     max_per_seat         : number  — hard cap per seat (slider maximum)
//     capped_price         : number  — final per-seat price stored in DB
//     was_clamped          : boolean — true if driver's price was reduced
//   }
// =============================================================================
function calculatePrice({ distance_km, fuel_rate, vehicle_mileage, vehicle_type, driver_set_price, available_seats }) {

  // --- Input validation ---
  if (!distance_km || distance_km <= 0) {
    throw new Error('distance_km must be a positive number');
  }
  if (!fuel_rate || fuel_rate <= 0) {
    throw new Error('fuel_rate must be a positive number');
  }
  if (!vehicle_mileage || vehicle_mileage <= 0) {
    throw new Error('vehicle_mileage must be a positive number');
  }
  if (driver_set_price === undefined || driver_set_price === null || driver_set_price < 0) {
    throw new Error('driver_set_price must be a non-negative number');
  }

  const seats = Math.max(1, parseInt(available_seats) || 1);

  // --- Step 1: Calculate the total raw fuel cost for the trip ---
  const base_price = (distance_km * fuel_rate) / vehicle_mileage;

  // --- Step 2: Look up the vehicle-specific multiplier ---
  const multiplier = VEHICLE_MULTIPLIERS[vehicle_type] || DEFAULT_MULTIPLIER;

  // --- Step 3: Calculate the total legal price ceiling ---
  const max_allowed = base_price * multiplier;

  // --- Step 4: Per-seat zone boundaries ---
  const base_per_seat        = base_price / seats;       // Green zone: pure fuel share
  const recommended_per_seat = base_per_seat * 1.2;      // Green zone ceiling (+20% buffer)
  const max_per_seat         = max_allowed / seats;      // Hard cap — Yellow zone ceiling

  // --- Step 5: Clamp driver's per-seat price to the hard cap ---
  const capped_price = Math.min(driver_set_price, max_per_seat);  // stored per-seat in DB
  const was_clamped  = driver_set_price > max_per_seat;

  // --- Step 6: Round and return ---
  return {
    base_price:           round2(base_price),
    multiplier,
    max_allowed:          round2(max_allowed),
    base_per_seat:        round2(base_per_seat),
    recommended_per_seat: round2(recommended_per_seat),
    max_per_seat:         round2(max_per_seat),
    capped_price:         round2(capped_price),   // PER SEAT — stored in rides.capped_price
    was_clamped,
  };
}


// =============================================================================
// FUNCTION 2: calculatePerSeatPrice
//
// PURPOSE:
//   Calculate the total price a passenger pays for their booking.
//   Since capped_price is now stored AS a per-seat value, multiply by seats booked.
//
// SRS REFERENCE: Section 4.1.3 — FR-BOOK-06
//
// FORMULA:
//   price_paid = capped_price_per_seat × seats_booked
//
// WORKED EXAMPLE (car, 3 seats offered, 40 km):
//   capped_price_per_seat = ₹115 (driver set), seats_booked = 2 → price_paid = ₹230
//
// PARAMETERS:
//   capped_price_per_seat  (number) — the per-seat fare stored in rides.capped_price
//   seats_booked           (number) — how many seats the passenger is booking
//
// RETURNS:
//   number — total price paid for this booking, rounded to 2 decimal places
// =============================================================================
function calculatePerSeatPrice(capped_price_per_seat, seats_booked) {

  if (!capped_price_per_seat || capped_price_per_seat < 0) {
    throw new Error('capped_price_per_seat must be a non-negative number');
  }
  if (!seats_booked || seats_booked < 1) {
    throw new Error('seats_booked must be at least 1');
  }

  return round2(capped_price_per_seat * seats_booked);
}


// =============================================================================
// FUNCTION 3: calculateCancellationPenalty
//
// PURPOSE:
//   Determine how many Trust Points to deduct from a passenger when they
//   cancel a booking. Passengers who cancel close to departure time cause
//   real problems for drivers (empty seats, lost cost recovery), so they
//   receive a higher penalty.
//
// SRS REFERENCE: Section 8.3 — Trust Score & Cancellation Penalty Algorithm
//                Section 4.1.3 — FR-BOOK-11 — Cancellation Penalty Tiers
//
// TIER TABLE (from SRS):
//   ┌─────────────────────────────────────┬───────────────────┐
//   │ Time before departure               │ Trust penalty     │
//   ├─────────────────────────────────────┼───────────────────┤
//   │ More than 4 hours                   │ 0  (free cancel)  │
//   │ 4 hours to 30 minutes               │ −2 points         │
//   │ Less than 30 minutes (like no-show) │ −5 points         │
//   └─────────────────────────────────────┴───────────────────┘
//
// PARAMETERS:
//   departure_time    (Date | string) — when the ride was scheduled to leave
//   cancellation_time (Date | string) — when the passenger is cancelling
//                                       (pass new Date() for "right now")
//
// RETURNS:
//   {
//     penalty      : number  — trust points to deduct (0, 2, or 5)
//     tier         : string  — human-readable tier label for logging/display
//     message      : string  — user-facing message to show in the app
//   }
// =============================================================================
function calculateCancellationPenalty(departure_time, cancellation_time) {

  // Convert both dates to JavaScript Date objects in case strings were passed
  const departure     = new Date(departure_time);
  const cancellation  = new Date(cancellation_time);

  // Safety check: make sure both dates are valid
  if (isNaN(departure.getTime())) {
    throw new Error('departure_time is not a valid date');
  }
  if (isNaN(cancellation.getTime())) {
    throw new Error('cancellation_time is not a valid date');
  }

  // Calculate how many minutes remain before departure at the moment of cancellation.
  // getTime() returns milliseconds since 1970; dividing by 60000 gives minutes.
  const minutesUntilDeparture = (departure.getTime() - cancellation.getTime()) / 60000;

  // Convert to hours for the > 4 hour check
  const hoursUntilDeparture = minutesUntilDeparture / 60;

  // --- Tier logic ---

  // TIER 1: Cancelled more than 4 hours before departure → free cancellation
  // The driver has enough time to find another passenger.
  if (hoursUntilDeparture > 4) {
    return {
      penalty : 0,
      tier    : 'FREE',
      message : 'Booking cancelled successfully. No penalty applied.',
    };
  }

  // TIER 2: Cancelled between 30 minutes and 4 hours before departure → −2 points
  // Late but not catastrophic — small deterrent penalty.
  if (minutesUntilDeparture > 30) {
    return {
      penalty : 2,
      tier    : 'LATE',
      message : 'Booking cancelled. Late cancellation penalty: −2 Trust Points.',
    };
  }

  // TIER 3: Cancelled 30 minutes or less before departure → −5 points
  // Equivalent to a no-show from the driver's perspective.
  // (minutesUntilDeparture <= 30, including negative values if already departed)
  return {
    penalty : 5,
    tier    : 'LAST_MINUTE',
    message : 'Booking cancelled. Last-minute cancellation penalty: −5 Trust Points.',
  };
}


// =============================================================================
// HELPER: round2
//
// Rounds a number to the nearest integer.
// Prices are whole rupees for easy payment.
//
// Example: round2(116.66) → 117
// =============================================================================
function round2(value) {
  return Math.round(value);
}


// Export all three functions so they can be used in controllers
module.exports = {
  calculatePrice,
  calculatePerSeatPrice,
  calculateCancellationPenalty,
};