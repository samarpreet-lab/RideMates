# 💰 Pricing, Trust System & Algorithms Explained

## 1. The Pricing Algorithm — Fair Cost-Sharing

### The Core Philosophy

RideMates is NOT a taxi service. Drivers are NOT making profit — they're **sharing fuel costs** with passengers. The pricing algorithm calculates a fair per-seat price based on the actual fuel cost of the trip.

**The key question**: If a car trip costs ₹600 in fuel, and the car has 5 seats (1 driver + 4 passengers), how much should each passenger pay?

**Simple answer**: ₹600 ÷ 5 = ₹120 per person (including the driver). The driver pays ₹120 too — they just recover ₹480 from 4 passengers.

**But it's more nuanced than that**. We add a base boarding fare (to make short trips viable), apply a vehicle-type multiplier (bikes have higher per-km costs than cars), and cap the driver's price (so they can't overcharge).

---

### The Formula — Each Step Explained

#### Step 1: Calculate Total Fuel Cost

**Question**: "How much fuel does this entire trip consume, and what does that fuel cost?"

```
total_fuel_cost = (distance_km / vehicle_mileage) × fuel_rate
```

**Breaking it down**:
- `distance_km`: The driving distance (from OSRM API). Example: 101.5 km.
- `vehicle_mileage`: How many km the vehicle travels per litre of fuel. A car might do 15 km/L, a bike might do 40 km/L.
- `fuel_rate`: Current price per litre. Petrol ≈ ₹105/L, diesel ≈ ₹92/L, CNG ≈ ₹80/L.

**Example**: 101.5 km trip in a car that does 15 km/L using diesel (₹92/L):
```
total_fuel_cost = (101.5 / 15) × 92 = 6.77 litres × ₹92 = ₹622.53
```

This is the actual fuel cost for the entire trip.

#### Step 2: Determine the Capacity Divisor

**Question**: "How many people are sharing this fuel cost?"

```
capacity_divisor = MAX(seats_offered + 1, standard_vehicle_capacity)
```

This is the **most important innovation** in our pricing system. Let me explain why.

**Why `seats + 1`?** The driver is sharing the fuel cost too! If a driver offers 3 seats, there are 4 people sharing (3 passengers + 1 driver).

**Why `MAX()` with the vehicle's full capacity?** This prevents a loophole. Without this, a driver with a 5-seat car could offer only 1 seat and charge that single passenger a huge amount (taxi pricing). With `MAX()`, even if the driver only offers 1 seat, we divide by the car's full capacity (5) — because the CAR can hold 5 people, and a fair cost-share should reflect that.

**This is the core principle of cost-SHARING vs. taxi-PRICING.**

| Vehicle | Standard Capacity (including driver) |
|---------|--------------------------------------|
| Bike | 2 (driver + 1 passenger) |
| Scooter | 2 (driver + 1 passenger) |
| Auto | 4 (driver + 3 passengers) |
| Car | 5 (driver + 4 passengers) |

**Example with the loophole protection**:

A car driver offers only 1 seat:
- Without protection: capacity_divisor = 1 + 1 = 2 (passenger pays HALF the fuel cost — that's expensive!)
- With protection: capacity_divisor = MAX(2, 5) = 5 (passenger pays only 1/5th — fair carpooling price!)

#### Step 3: Calculate Base Per-Seat Cost

```
base_per_seat = total_fuel_cost / capacity_divisor
```

This is the raw fuel share per person.

**Example**: ₹622.53 ÷ 5 = ₹124.51 per seat

#### Step 4: Apply Base Fare + Vehicle Multiplier

```
max_per_seat = base_fare + (base_per_seat × vehicle_multiplier)
```

**Base Fare**: A flat amount added to every ticket. Without this, very short trips (like 3 km) would cost almost nothing (maybe ₹8), which doesn't cover the driver's inconvenience of picking someone up. The base fare makes short trips viable.

| Vehicle | Base Fare | Why |
|---------|-----------|-----|
| Bike | ₹20 | Minimal comfort, open-air |
| Scooter | ₹20 | Similar to bike |
| Auto | ₹30 | Three-wheeler, some coverage |
| Car | ₹40 | Air-conditioned, safest, most comfortable |

**Vehicle Multiplier**: Accounts for the total cost of operating the vehicle (not just fuel). Bikes have higher maintenance per km, lower comfort, and higher wear-and-tear. Cars have A/C, safety features, and generally cost more per km overall. Counterintuitively, bikes have a HIGHER multiplier because the per-km operating cost is proportionally higher when fuel cost alone is low.

| Vehicle | Multiplier | Reasoning |
|---------|------------|-----------|
| Bike | 1.5× | Highest proportional cost: wear-and-tear significant relative to fuel |
| Scooter | 1.4× | Similar to bike, slightly lower |
| Auto | 1.35× | Mid-range |
| Car | 1.25× | Lowest proportional: high comfort, fuel cost is already substantial |

**Example**: base_fare = ₹40 (car), base_per_seat = ₹124.51, multiplier = 1.25
```
max_per_seat = 40 + (124.51 × 1.25) = 40 + 155.64 = ₹195.64 ≈ ₹196
```

#### Step 5: Cap the Driver's Price

```
capped_price = MIN(driver_set_price, max_per_seat)
```

The driver can set any price they want. But if they try to charge MORE than the calculated fair share, the system caps it. This prevents exploitation.

**Example**: Driver wants ₹300 per seat, but the calculated max is ₹196.
```
capped_price = MIN(300, 196) = ₹196
```
The driver is told "Your price was capped to ₹196." They can always charge LESS (to attract more passengers), but never MORE.

---

### Complete Worked Example: 101.5 km Car Trip

**Inputs**: 101.5 km, diesel car, 15 km/L mileage, 1 seat offered, driver wants ₹300/seat, diesel costs ₹90/L

```
Step 1: total_fuel_cost = (101.5 / 15) × 90 = ₹609
Step 2: capacity_divisor = MAX(1 + 1, 5) = MAX(2, 5) = 5
        ↑ Even though only 1 seat is offered, we use 5 (car capacity)
Step 3: base_per_seat = 609 / 5 = ₹121.80
Step 4: max_per_seat = 40 + (121.80 × 1.25) = 40 + 152.25 = ₹192
Step 5: capped_price = MIN(300, 192) = ₹192 (CAPPED! Driver wanted ₹300)

Passenger pays: ₹192 per seat
Driver recovers: ₹192 (from 1 passenger)
Driver's own fuel share: ₹609 - ₹192 = ₹417
```

### Complete Worked Example: 7 km Bike Trip

**Inputs**: 7 km, petrol bike, 40 km/L mileage, 1 seat offered, driver wants ₹50/seat, petrol costs ₹100/L

```
Step 1: total_fuel_cost = (7 / 40) × 100 = ₹17.50
Step 2: capacity_divisor = MAX(1 + 1, 2) = MAX(2, 2) = 2
Step 3: base_per_seat = 17.50 / 2 = ₹8.75
Step 4: max_per_seat = 20 + (8.75 × 1.5) = 20 + 13.13 = ₹33
        ↑ Without the ₹20 base fare, this ride would cost only ₹8.75
          which doesn't justify the driver's effort of stopping to pick someone up
Step 5: capped_price = MIN(50, 33) = ₹33 (CAPPED!)

Passenger pays: ₹33
```

---

## 2. Cancellation Penalty — Discouraging Last-Minute Cancels

### Why Penalties Exist

Imagine a driver posts a ride from Phagwara to Ludhiana at 5 PM. Three passengers book seats. At 4:45 PM (15 minutes before departure), two passengers cancel. The driver now has an almost empty car and can't find replacements at such short notice. This wastes the driver's time and fuel.

To discourage this, we penalize late cancellations by deducting **trust points**.

### The Three Tiers

The closer to departure time the cancellation happens, the higher the penalty:

**Tier 1: More than 4 hours before departure → NO PENALTY**
You cancelled with plenty of time for the driver to find a replacement. No harm done.

**Tier 2: Between 4 hours and 30 minutes before → −2 Trust Points**
Cutting it a bit close, but there might still be time to find someone. Small warning penalty.

**Tier 3: Less than 30 minutes before departure → −5 Trust Points**
This is essentially a no-show. The driver has no time to find a replacement. Significant penalty, and your clean ride streak is reset to 0.

### What Happens When a Passenger Cancels

1. The system checks: "How many minutes until this ride departs?"
2. Based on the answer, it picks the appropriate penalty tier.
3. If there's a penalty:
   - Trust score decreases (but never below 0)
   - Clean ride streak resets to 0
   - The penalty amount is recorded on the booking for audit purposes
4. The booking status changes to 'cancelled'
5. If the booking was 'confirmed' (not just 'pending'), the seat is restored back to the ride's `available_seats`

### What Happens When a DRIVER Cancels

Drivers are held to the same standard. If a driver cancels a ride that has confirmed passengers, THEY get the same penalty. The system checks how close to departure time the cancellation is and applies the appropriate tier.

Additionally, all bookings on the cancelled ride are automatically cancelled (both confirmed and pending), and confirmed passengers get their seats back.

---

## 3. The Trust Score System — Reputation Mechanics

### How It Works

Every user starts with **100 trust points** — maximum trust. Points go DOWN when bad things happen:

| What Happened | Points Lost | Why |
|---------------|-------------|-----|
| Free cancellation (>4h before) | 0 (no loss) | Cancelled early enough, no harm done |
| Late cancellation (30min-4h before) | −2 | Inconvenient but manageable |
| Last-minute cancel (<30min before) | −5 | Almost a no-show, wastes driver's time |
| No-show report filed against you | −5 | Confirmed you didn't show up |
| Pattern conduct report (2+ reporters) | −10 | Multiple people reported you = likely real problem |
| Escalation (3+ reporters) | −25 additional | Serious repeated issue |

Points go UP through clean ride streaks: +1 per clean completed ride (see Section 6 below).

### What Trust Score Does

Your trust score affects one thing: **report credibility**. If your trust score drops below 70, your reports against other users won't trigger any penalties. The report is still saved (for admin review), but it doesn't hurt the person you're reporting. This prevents users with bad reputations from weaponizing the report system against others.

---

## 4. The Report System — "The Shield" and Pattern Detection

### The Problem Reports Solve

After a completed ride, a passenger might have experienced bad behavior from the driver (or vice versa). They need a way to report it. But the system must be fair:

- **Don't punish on a single report** — one person might lie or have a personal grudge.
- **DO punish when multiple people report** — if 3 different people all say the same thing, it's probably true.
- **Don't let bad actors weaponize reports** — a user with a low trust score shouldn't be able to destroy someone's reputation.

### How the Report System Works — Decision Tree

When a report is filed, the system makes decisions in this order:

**Decision 1: "Is this a valid report?"**
- Was the ride actually completed? (You can't report a ride that's still active.)
- Is it within 12 hours of the ride's completion? (We don't accept reports from 3 days ago.)
- Has this reporter already filed a report for this ride? (One report per person per ride.)
- Is the reporter trying to report themselves? (Rejected immediately.)
- Has the reporter filed 3+ reports in the last 24 hours? (Anti-spam limit.)

**Decision 2: "Is the reporter trustworthy?"**
If the reporter's trust score is below 70, the report is SAVED (for admin records) but NO PENALTY is applied to the reported user. This prevents low-trust users from dragging others down.

**Decision 3: "What's the report reason?"**
- **No-show**: Immediate −5 penalty, bypassing all other checks. No-shows are objective (the person either showed up or didn't) and don't need pattern confirmation.
- **Bad conduct / Unsafe driving / Harassment**: These go through the pattern-match algorithm.

**Decision 4: "The Shield" — Is this a first-time report?**
The system counts how many DIFFERENT people have reported this same user in the last 30 days (for conduct-type reasons, excluding the current reporter).

- **0 other reporters** → This is the first complaint. **"The Shield" protects the user.** No penalty is applied — only a warning is logged. This prevents a single person from destroying someone's trust score out of spite.

**Decision 5: "Pattern Detected" — Multiple reporters**
- **1+ other reporters** → At least 2 different people have now reported this user. This is a PATTERN. The penalty is −10 trust points, and the clean ride streak is reset to 0.

**Decision 6: "Escalation" — Serious pattern**
- **3+ total reporters** → This user has been reported by 3 or more different people in 30 days. An additional −25 penalty is applied on top of the −10. Total: −35 trust points.

### Real-World Scenario

**Scenario**: Driver "Ravi" drives aggressively.

- **Week 1**: Passenger "Anita" reports Ravi for unsafe_driving. The Shield activates → Ravi gets a warning, no penalty. (Maybe Anita was just nervous in the car.)
- **Week 2**: Passenger "Vikram" reports Ravi for unsafe_driving. Now there are 2 different reporters → Pattern detected! Ravi loses 10 trust points (100 → 90) and his streak resets.
- **Week 3**: Passenger "Priya" also reports Ravi for unsafe_driving. Now there are 3 reporters → Escalation! Ravi loses an additional 25 trust points (90 → 65). His trust is now below 70, meaning his OWN reports against others won't trigger penalties anymore.

---

## 5. Per-Seat Pricing for Bookings

When a passenger books seats, the total price is simply:

```
price_paid = capped_price_per_seat × number_of_seats_booked
```

If the capped price is ₹115 per seat and the passenger books 2 seats (for themselves and a friend), they pay ₹230 total.

---

## 6. Clean Ride Streak System — Rewarding Good Behavior

### How It Works

The system runs a background job every 30 minutes. It looks for rides that:
1. Were completed 12+ hours ago (giving time for reports to be filed)
2. Have no reports against them (no one complained)
3. Haven't already been processed for streaks

For each clean ride found, every participant (driver + all confirmed passengers) gets `+1` to their `current_streak` counter.

### Why Wait 12 Hours?

We don't award streak points immediately after a ride completes because participants need time to file reports. If we awarded streaks immediately, a user might get streak points right before someone reports them. The 12-hour grace period gives enough time for any reports to come in.

### Anti-Collusion: The 24-Hour Cooldown

**The exploit we're preventing**: Two friends could create fake rides, book each other, complete them, and farm streak points endlessly.

**How we prevent it**: Before awarding a streak point to a passenger, the system checks: "Has this same driver-passenger pair already received streak points from another ride within the last 24 hours?"

If yes → skip the streak award for this pair. The ride itself is still marked as processed, but the pair doesn't get double rewards.

**Example**: 
- Driver "A" and Passenger "B" complete a ride at 8 AM → Both get streak +1. ✅
- Driver "A" and Passenger "B" complete ANOTHER ride at 2 PM (same day) → Both are skipped (cooldown). ❌
- Driver "A" and Passenger "C" complete a ride at 2 PM → Both get streak +1 (different pair). ✅

---

## 7. Background Jobs — Automated Cleanup

The server runs two automated tasks every 30 minutes:

### Job 1: Auto-Complete Stale Rides

**Problem**: A driver posts a ride, it departs, but the driver forgets to press "Complete." The ride sits as 'active' forever, cluttering search results and preventing streak processing.

**Solution**: Any ride that's still 'active' 24 hours after its departure time is automatically marked as 'completed.' Its confirmed bookings become 'completed' and its pending bookings become 'cancelled.'

### Job 2: Award Clean Ride Streaks

Processes rides that were completed 12+ hours ago and had no reports. Awards streak points to all participants (with the anti-collusion cooldown check).

### Safe Error Handling

Both jobs are wrapped in a `safeRunJob` function that catches any errors and logs them. This prevents a job failure from crashing the entire server. If the streak job fails, the server keeps running and the job tries again in 30 minutes.

Both jobs also run once when the server starts up (after a 5-second delay to let the database connection establish). This catches any work that accumulated while the server was down.
