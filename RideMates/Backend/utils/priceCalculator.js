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
// FORMULA:
//   base_price  = (distance_km × fuel_rate) / vehicle_mileage
//   multiplier  = lookup from VEHICLE_MULTIPLIERS (1.2, 1.35, or 1.5)
//   max_allowed = base_price × multiplier
//   capped_price = MIN(driver_set_price, max_allowed)
//
// WORKED EXAMPLES (from SRS Section 8.1):
//
//   Bike: 40 km, ₹105/L, 45 km/L mileage
//     base_price  = (40×105)/45 = ₹93.33
//     max_allowed = 93.33 × 1.2 = ₹112.00
//     driver asks ₹150 → capped to ₹112.00  ⚠️ Clamped
//
//   Car: 40 km, ₹105/L, 15 km/L mileage
//     base_price  = (40×105)/15 = ₹280.00
//     max_allowed = 280 × 1.5  = ₹420.00
//     driver asks ₹350 → stays ₹350.00  ✅ Within cap
//
// PARAMETERS:
//   distance_km      (number) — total trip distance in kilometres
//   fuel_rate        (number) — cost per litre in rupees
//   vehicle_mileage  (number) — km per litre for the vehicle
//   vehicle_type     (string) — 'bike', 'scooter', 'auto', or 'car'
//   driver_set_price (number) — price the driver wants to charge
//
// RETURNS:
//   {
//     base_price   : number  — raw fuel cost
//     multiplier   : number  — the multiplier used (1.2, 1.35, or 1.5)
//     max_allowed  : number  — the legal price ceiling
//     capped_price : number  — the price the driver may charge
//     was_clamped  : boolean — true if driver's price was reduced
//   }
// =============================================================================
function calculatePrice({ distance_km, fuel_rate, vehicle_mileage, vehicle_type, driver_set_price }) {

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

  // --- Step 1: Calculate the raw fuel cost for the trip ---
  const base_price = (distance_km * fuel_rate) / vehicle_mileage;

  // --- Step 2: Look up the vehicle-specific multiplier ---
  // If vehicle_type is missing or unknown, default to car (1.5x — highest)
  const multiplier = VEHICLE_MULTIPLIERS[vehicle_type] || DEFAULT_MULTIPLIER;

  // --- Step 3: Calculate the legal price ceiling ---
  const max_allowed = base_price * multiplier;

  // --- Step 4: Clamp the driver's price to the ceiling ---
  const capped_price = Math.min(driver_set_price, max_allowed);
  const was_clamped = driver_set_price > max_allowed;

  // --- Step 5: Round and return ---
  return {
    base_price:   round2(base_price),
    multiplier,
    max_allowed:  round2(max_allowed),
    capped_price: round2(capped_price),
    was_clamped,
  };
}


// =============================================================================
// FUNCTION 2: calculatePerSeatPrice
//
// PURPOSE:
//   Divide the total trip cost among the passengers who booked seats.
//
// SRS REFERENCE: Section 4.1.3 — FR-BOOK-06
//
// FORMULA:
//   per_seat_price = capped_price / seats_booked
//
// WORKED EXAMPLE:
//   capped_price = ₹350, seats_booked = 3 → ₹116.67 per seat
//
// PARAMETERS:
//   capped_price  (number) — the total fare for the ride (from calculatePrice)
//   seats_booked  (number) — how many seats the passenger is booking
//
// RETURNS:
//   number — price per seat, rounded to 2 decimal places
// =============================================================================
function calculatePerSeatPrice(capped_price, seats_booked) {

  if (!capped_price || capped_price < 0) {
    throw new Error('capped_price must be a non-negative number');
  }
  if (!seats_booked || seats_booked < 1) {
    throw new Error('seats_booked must be at least 1');
  }

  const per_seat = capped_price / seats_booked;
  return round2(per_seat);
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
// Rounds a number to exactly 2 decimal places.
// Used internally by the functions above.
//
// Example: round2(116.666...) → 116.67
// =============================================================================
function round2(value) {
  return Math.round(value * 100) / 100;
}


// Export all three functions so they can be used in controllers
module.exports = {
  calculatePrice,
  calculatePerSeatPrice,
  calculateCancellationPenalty,
};