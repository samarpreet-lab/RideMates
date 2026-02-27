function calculatePrice({ distance_km, fuel_rate, vehicle_mileage, driver_set_price }) {
  // 1. Calculate the raw cost of fuel for the trip
  const base_cost = (distance_km * fuel_rate) / vehicle_mileage;
  
  // 2. The absolute maximum they are legally allowed to charge (e.g., 1.5x fuel cost for wear & tear)
  const max_cap = base_cost * 1.5;
  
  // 3. Make sure the driver's requested price doesn't exceed the legal cap
  const capped_price = Math.min(driver_set_price, max_cap);

  return {
    base_price: Math.round(base_cost * 100) / 100,
    max_allowed: Math.round(max_cap * 100) / 100,
    capped_price: Math.round(capped_price * 100) / 100,
  };
}

module.exports = { calculatePrice };