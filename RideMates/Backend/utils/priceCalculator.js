// =============================================================================
// priceCalculator.js
// RideMates Pricing & Penalty Utility
//
// This file contains three pure functions (no database calls, no side effects):
//   1. calculatePrice()              — fuel-based price with capacity-aware divisor
//   2. calculatePerSeatPrice()       — splits total price across passengers
//   3. calculateCancellationPenalty() — decides trust-score penalty on cancellation
//
// "Pure function" means: same inputs → always same output, nothing external
// is read or changed. This makes the functions easy to test in isolation.
//
// SRS v2.0: TRUE COST-SHARING MODEL
//   ✓ Uses vehicle's FULL CAPACITY (not offered seats) to divide fuel cost
//   ✓ Prevents taxi-like pricing (driver with 1 seat in a 4-seat car pays fairly)
//   ✓ Makes short trips viable with base boarding fares
//   ✓ Fair, legal cost-recovery pricing model
//
// INNOVATION:
//   capacity_divisor = Math.max(seats + 1, standard_capacity)
//   This ensures we divide fuel by the whole vehicle's capacity, making
//   true cost-sharing equitable across all vehicle types and trip lengths.
// =============================================================================


// =============================================================================
// CONSTANTS: Vehicle Capacities, Base Fares, and Multipliers
// 
// VEHICLE_CAPACITIES: Total capacity including driver (driver + passengers)
//   - Bike: 2 (1 driver + 1 passenger)
//   - Scooter: 2 (1 driver + 1 passenger)
//   - Auto: 4 (1 driver + 3 passengers)
//   - Car: 4 (1 driver + 3 passengers)
//
// BASE_FARE: Fixed boarding fare (in ₹) to make short trips viable
//   - Bike: ₹20
//   - Scooter: ₹20
//   - Auto: ₹30
//   - Car: ₹40
//
// VEHICLE_MULTIPLIERS: Cost multiplier for fuel/per-seat calculation
//   - Bike: 1.5 (minimal comfort, no A/C)
//   - Scooter: 1.4 (slightly better than bike)
//   - Auto: 1.35 (moderate comfort, 3 seats)
//   - Car: 1.25 (A/C, comfort, safety features)
//
// RATIONALE:
//   The capacity_divisor = Math.max(seats + 1, standard_capacity) ensures we
//   divide fuel cost by the WHOLE vehicle capacity, not just offered seats.
//   This implements true cost-sharing: a driver offering 1 seat in a 4-seat
//   car doesn't force that 1 passenger to pay 100% of fuel (like a taxi).
//   Instead, the cost is divided by 4, making short trips (e.g., 7 km on a
//   bike for ~₹30) viable for cost-sharing.
// =============================================================================

const VEHICLE_CAPACITIES = {
  bike:    2,    // Driver + 1 passenger
  scooter: 2,    // Driver + 1 passenger
  auto:    4,    // Driver + 3 passengers
  car:     5,    // Driver + 4 passengers (standard 5-seater)
};

const BASE_FARE = {
  bike:    20,   // ₹20 boarding fee
  scooter: 20,   // ₹20 boarding fee
  auto:    30,   // ₹30 boarding fee
  car:     40,   // ₹40 boarding fee
};

const VEHICLE_MULTIPLIERS = {
  bike:    1.5,  // 1.5x multiplier for fuel cost
  scooter: 1.4,  // 1.4x multiplier for fuel cost
  auto:    1.35, // 1.35x multiplier for fuel cost
  car:     1.25, // 1.25x multiplier for fuel cost
};

// Fallback values if an unknown vehicle type is passed
const DEFAULT_CAPACITY = 4;
const DEFAULT_BASE_FARE = 40;
const DEFAULT_MULTIPLIER = 1.25;


// =============================================================================
// FUNCTION 1: calculatePrice (REFACTORED — True Cost-Sharing Model)
//
// PURPOSE:
//   Calculate a fair, legal per-seat price based on actual fuel cost and
//   vehicle capacity. Ensures cost-sharing (not profit-making) and makes
//   short trips viable by adding a base boarding fare.
//
// KEY INNOVATION:
//   Instead of dividing cost by available_seats (which would force a single
//   passenger in a 4-seat car to pay 100% of fuel), we divide by the vehicle's
//   TOTAL CAPACITY using: capacity_divisor = Math.max(seats + 1, standard_capacity)
//
//   This ensures:
//   - Short trips (e.g., 7 km bike) aren't underpriced (₹8 → with base fare → ₹30)
//   - Drivers offering 1 seat don't charge taxi prices (4-seat car ÷ 4, not ÷ 1)
//   - Cost-sharing is truly equitable across all vehicle types
//
// FORMULA:
//   1. total_fuel_cost = (distance_km / vehicle_mileage) * fuel_rate
//   2. capacity_divisor = Math.max(seats + 1, standard_capacity)
//   3. base_per_seat = total_fuel_cost / capacity_divisor
//   4. max_per_seat = base_fare + (base_per_seat * vehicle_multiplier)
//   5. capped_price = MIN(driver_set_price, max_per_seat)
//
// WORKED EXAMPLES:
//
//   Example 1: 101.5 km Car trip (Diesel, ₹90/L, 15 km/L, 1 seat offered)
//   ───────────────────────────────────────────────────────────────────
//   total_fuel_cost = (101.5 / 15) * 90 = ₹609
//   capacity_divisor = Math.max(1 + 1, 4) = 4  ← Use car's full capacity!
//   base_per_seat = 609 / 4 = ₹152.25
//   max_per_seat = 40 + (152.25 * 1.25) = 40 + 190.31 = ₹230.31 ≈ ₹230 ✓
//   → Maximum driver can charge: ₹230/seat (fair, not taxi-priced)
//   → Under ₹300 validation target ✓
//
//   Example 2: 7 km Bike trip (Petrol, ₹100/L, 40 km/L, 1 seat offered)
//   ──────────────────────────────────────────────────────────────────
//   total_fuel_cost = (7 / 40) * 100 = ₹17.50
//   capacity_divisor = Math.max(1 + 1, 2) = 2  ← Use bike's full capacity!
//   base_per_seat = 17.50 / 2 = ₹8.75
//   max_per_seat = 20 + (8.75 * 1.5) = 20 + 13.13 = ₹33.13 ≈ ₹33 ✓
//   → Maximum driver can charge: ₹33/seat (viable short trip!)
//   → Within ₹30-40 validation target ✓
//
// PARAMETERS:
//   distance_km        (number) — total trip distance in kilometres
//   fuel_rate          (number) — fuel price in ₹/liter
//   vehicle_mileage    (number) — vehicle efficiency in km/liter
//   vehicle_type       (string) — 'bike', 'scooter', 'auto', or 'car'
//   driver_set_price   (number) — per-seat price the driver wants to charge
//   available_seats    (number) — number of seats the driver is offering
//
// RETURNS:
//   {
//     total_fuel_cost  : number  — total fuel cost for this trip
//     capacity_divisor : number  — denominator used (vehicle capacity)
//     base_per_seat    : number  — cost per seat before multiplier (reference)
//     max_per_seat     : number  — hard cap per seat (base_fare + multiplied cost)
//     capped_price     : number  — final per-seat price (clamped to max_per_seat)
//     was_clamped      : boolean — true if driver's price was reduced
//   }
// =============================================================================
function calculatePrice({ distance_km, fuel_rate, vehicle_mileage, vehicle_type, driver_set_price, available_seats }) {

  // --- Input validation ---
  if (!distance_km || isNaN(distance_km) || distance_km <= 0.1) {
    throw new Error('Calculated distance is too short or invalid.');
  }
  if (driver_set_price === undefined || driver_set_price === null || driver_set_price < 0) {
    throw new Error('driver_set_price must be a non-negative number');
  }
  if (!fuel_rate || isNaN(fuel_rate) || fuel_rate <= 0) {
    throw new Error('fuel_rate must be a positive number');
  }
  if (!vehicle_mileage || isNaN(vehicle_mileage) || vehicle_mileage <= 0) {
    throw new Error('vehicle_mileage must be a positive number');
  }

  const seats = Math.max(1, parseInt(available_seats) || 1);

  // --- Step 1: Look up vehicle-specific constants ---
  const standard_capacity = VEHICLE_CAPACITIES[vehicle_type] || DEFAULT_CAPACITY;
  const base_fare = BASE_FARE[vehicle_type] || DEFAULT_BASE_FARE;
  const multiplier = VEHICLE_MULTIPLIERS[vehicle_type] || DEFAULT_MULTIPLIER;

  // --- Step 2: Calculate total fuel cost for the trip ---
  const total_fuel_cost = (distance_km / vehicle_mileage) * fuel_rate;

  // --- Step 3: Determine capacity divisor (KEY INNOVATION) ---
  // Use the vehicle's FULL CAPACITY, not just offered seats.
  // This ensures true cost-sharing and prevents taxi-like pricing.
  const capacity_divisor = Math.max(seats + 1, standard_capacity);

  // --- Step 4: Calculate base per-seat cost (before multiplier) ---
  const base_per_seat = total_fuel_cost / capacity_divisor;

  // --- Step 5: Calculate maximum per-seat price (hard cap) ---
  // Formula: base_fare + (base_per_seat * vehicle_multiplier)
  const max_per_seat = base_fare + (base_per_seat * multiplier);

  // --- Step 6: Clamp driver's per-seat price to the hard cap ---
  const capped_price = Math.min(driver_set_price, max_per_seat);
  const was_clamped = driver_set_price > max_per_seat;

  // --- Step 7: Round and return ---
  return {
    total_fuel_cost: round2(total_fuel_cost),
    capacity_divisor,
    base_per_seat:   round2(base_per_seat),
    max_per_seat:    round2(max_per_seat),
    capped_price:    round2(capped_price),
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