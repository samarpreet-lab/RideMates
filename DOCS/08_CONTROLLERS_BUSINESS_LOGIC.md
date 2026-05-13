# 🔄 Backend Controllers — Business Logic Explained

## What is a Controller?

A controller is the function that runs when a specific API endpoint is called. If the routes are like a phone menu ("Press 1 for rides, press 2 for bookings"), then controllers are the actual employees who handle your call.

The controller is where the REAL WORK happens. It:
1. **Reads the input** — What data did the user send?
2. **Validates** — Is the input correct and allowed?
3. **Processes** — Talks to the database, runs calculations
4. **Responds** — Sends back the result

We have 4 controller files, each handling a different area of the app.

---

## authController.js — Login, Signup, and Profile

### sendOtp — "Send me a login code"

**When it runs**: User taps "Send OTP" on the login/signup screen.

**What it does, step by step**:

1. **Read the email and purpose** from the request body. The purpose is either "login" or "signup" — this determines what checks we run.

2. **Clean the email**: Convert to lowercase and trim whitespace. `" User@LPU.IN "` becomes `"user@lpu.in"`. This prevents confusion where `User@LPU.IN` and `user@lpu.in` are treated as different accounts.

3. **Check the email domain**: If it doesn't end with `@lpu.in`, reject immediately. This is our first gatekeeper — only university members allowed.

4. **Check if the user exists (for login)**: If the purpose is "login", query the database for this email. If the user doesn't exist, return "No account found with this email." We don't want to send an OTP to someone who hasn't registered.

5. **Check if the user exists (for signup)**: If the purpose is "signup", check if the email is ALREADY registered. If yes, return "This email is already registered." We don't want duplicate accounts.

6. **Rate limiting check**: 
   - Has this email received an OTP in the last 60 seconds? (Prevents spamming "Send OTP" button)
   - Has this email received 3+ OTPs in the last 10 minutes? (Prevents flooding)
   
7. **Generate the OTP**: Use `crypto.randomInt(100000, 999999)` to create a cryptographically secure 6-digit code.

8. **Hash the OTP**: SHA-256 hash so we never store the actual code in the database.

9. **Clean up old OTPs**: Delete any previous unused OTPs for this email. Only the latest one should be valid.

10. **Save the hash**: Insert into `user_otps` table with the hash, email, purpose, and expiry time (10 minutes from now).

11. **Send the email**: Use Nodemailer to send the actual OTP code via Gmail SMTP. The email is HTML-formatted with the RideMates branding.

12. **Handle email failure**: If Nodemailer throws an error (Gmail is down, bad credentials), we DELETE the OTP record we just created. Why? Because that record counts toward the rate limit. If we left it there, the user would be rate-limited without ever receiving their code. That's unfair, so we clean it up.

### verifyOtp — "Check my login code and log me in"

**When it runs**: User enters the 6-digit code and taps "Verify."

**What it does, step by step**:

1. **Read the email and OTP** from the request body.

2. **Validate format**: The OTP must be exactly 6 digits. If someone sends "hello" or "1234567", reject immediately before even touching the database.

3. **Find the latest OTP record**: Query the database for the most recent unverified OTP for this email.

4. **Check brute force lock**: If the `attempts` counter is > 3, this OTP has been guessed at too many times. Reject and tell the user to request a new OTP.

5. **Check expiry**: If the current time is past the OTP's `expires_at` timestamp (10 minutes after creation), reject.

6. **Compare hashes**: Hash the entered OTP with SHA-256 and compare with the stored hash. If they DON'T match, increment the `attempts` counter and return "Incorrect OTP."

7. **If the hashes match — success!**

8. **For signup**: Create a new user in the `users` table with the provided name, phone, and gender. Default trust_score is 100.

9. **For login**: Find the existing user in the `users` table.

10. **Mark OTP as verified**: Set `is_verified = TRUE` so it can't be used again.

11. **Create JWT token**: Sign a token containing `{ userId, email }` with the JWT secret, set to expire in 7 days.

12. **Return the token and user profile**: The frontend stores the token and navigates to the explore screen.

### getProfile — "Show me my profile"

**Simple flow**: The `verifyToken` middleware already figured out who the user is and set `req.user.id`. We just query the database for that user's full profile (name, email, phone, university, role, photo, gender, trust_score, streak) and return it.

### updateProfile — "Update my profile info"

**What makes this interesting**: The user might send ANY combination of fields to update — maybe just their name, maybe name + phone, maybe just their photo. The controller handles this dynamically:

1. For each field provided (full_name, phone, gender, profile_photo), add it to an UPDATE query.
2. **Phone validation**: Must match the Indian mobile number format (starts with 6-9, 10 digits). Also checks if another user already has this phone number.
3. **Gender whitelist**: Only accepts 'male', 'female', or 'other'. This prevents SQL injection through the gender field (since it's used in ENUM).
4. Build a dynamic SQL query that only updates the provided fields: `UPDATE users SET full_name = ?, phone = ? WHERE id = ?`

---

## rideController.js — Creating and Managing Rides

### createRide — "Post a new ride"

This is the most complex creation endpoint because it involves external API calls, pricing calculations, and multiple validations.

**Step by step**:

1. **Get the driver's ID from the JWT** (NOT from the request body). The driver is whoever is logged in. We never trust the frontend to tell us who they are — the JWT proves it.

2. **Validate all required fields**: origin_city, destination_city, GPS coordinates, departure_time, available_seats, vehicle_type, vehicle_mileage, fuel_type, driver_set_price. If anything is missing, return a clear error message.

3. **Prevent double-submit**: Check if this driver already posted a ride with the same origin and destination in the last 60 seconds. This prevents accidental duplicate rides from double-tapping the "Post" button.

4. **Validate numeric ranges**: Seats must be 1-10, price must be ₹1-₹10,000, latitude must be -90 to 90, longitude must be -180 to 180. This catches invalid GPS coordinates and unreasonable values.

5. **Call OSRM API**: Send the GPS coordinates to OSRM and get back the actual driving distance in kilometres. If OSRM is down, return "Route calculation service temporarily unavailable." If no valid route exists (e.g., origin and destination are on different islands with no bridge), return "Unable to calculate a valid driving route."

6. **Check instant booking acknowledgment**: If the driver enables instant booking (auto-confirm all bookings), they must explicitly acknowledge it. This is like checking the "I agree" box — prevents accidentally enabling a feature they don't understand.

7. **Look up the fuel rate**: Query the `fuel_rates` table for the current price of their fuel type. If not found, default to ₹105/L (petrol fallback).

8. **Calculate the fair price**: Run the pricing algorithm (explained in detail in the Algorithms doc). This produces the `capped_price` — the maximum fair per-seat price.

9. **Insert the ride**: Save everything to the `rides` table and return the ride ID plus the pricing breakdown.

### searchRides — "Find me a ride from A to B"

**What it does**: Takes an origin city and destination city, and returns all matching rides that are still active, have seats available, and haven't departed yet.

**How the query is built dynamically**: The base query always filters by origin, destination, active status, available seats > 0, and future departure. But optional filters are added conditionally:
- If the user specifies a date → add `AND DATE(departure_time) = ?`
- If the user wants emergency routes only → add `AND is_emergency_route = TRUE`

Results are sorted by departure time (soonest first) and include the driver's name and trust score (via a JOIN with the users table).

### getRideById — "Show me the details of ride #42"

This endpoint behaves differently depending on WHO is asking:

**If the requester IS the driver**: The response includes the full passenger list — names, booking statuses, seats booked. The driver needs this to know who's coming.

**If the requester is a passenger**: The response includes ONLY their own booking (if any). They can see the ride details but not other passengers' information.

**Why the difference?** Privacy. A passenger shouldn't see other passengers' names and booking details. The driver needs to see everyone because they're responsible for the ride.

### updateRide — "Change ride details"

Uses a transaction with `FOR UPDATE` locking to prevent race conditions. Can't change departure time if passengers have already booked (unfair to them). If the price changes, re-runs the pricing algorithm.

### cancelRide — "Cancel my ride"

Sets the ride status to 'cancelled' (not actually deleted from the database — we keep records). If confirmed passengers exist, the driver gets a cancellation penalty (same tiers as passenger cancellations). All bookings are automatically cancelled.

### completeRide — "My ride is done"

Only the driver can do this. Only active rides can be completed. **Time lock**: You cannot complete a ride BEFORE its scheduled departure time (prevents gaming the system by immediately completing to earn streak points).

Side effects: All confirmed bookings → 'completed', all pending bookings → 'cancelled', `completed_at` timestamp is recorded (this starts the 12-hour report window).

### getMyRides — "Show me all my rides"

Returns TWO separate arrays:
- **as_driver**: All rides you posted, with a count of how many bookings each has
- **as_passenger**: All rides you booked, with the driver's name and your booking status

Both are limited to the last 30 days to keep the response size manageable.

---

## bookController.js — The Booking System

### bookSeat — "Book a seat on this ride"

This is the most technically complex function in the entire backend because it must handle **concurrent access** safely (two people booking the last seat at the same time).

**The concurrency problem** (explained simply):

Imagine a concert with 1 ticket left. Person A and Person B both click "Buy" at the exact same millisecond.

Without protection: Both read "1 ticket available", both buy, tickets = -1. Oversold!

With our protection: Person A locks the ticket counter. Person B has to wait. Person A buys → tickets = 0 → unlocks. Person B now reads "0 tickets" → "Sold out!" → safe.

**The full flow**:

1. **Get a dedicated database connection** and start a transaction. This connection is exclusively ours until we commit or rollback.

2. **Lock the ride row** with `SELECT ... FOR UPDATE`. Nobody else can modify this ride until our transaction finishes.

3. **Validate everything**:
   - Ride exists and is active?
   - Departure time is in the future?
   - Passenger is NOT the driver? (Can't book your own ride)
   - Women-only check: If ride is women-only, is the passenger female?
   - Enough seats available?
   - Seats requested is a valid number (1-10)?

4. **Calculate price**: `capped_price × seats_booked`. Simple multiplication.

5. **Determine booking status**: If the ride has `instant_booking` enabled → status is 'confirmed' (and seats are decremented immediately). Otherwise → status is 'pending' (driver must accept, seats aren't decremented yet).

6. **Check for existing booking**: If this passenger already has an active booking for this ride, reject (UNIQUE constraint on ride_id + passenger_id). But if they have a CANCELLED booking, we can reactivate it.

7. **Insert or update the booking** in the database.

8. **Commit the transaction**: Everything is saved permanently. The lock is released.

9. **Return the booking details** to the frontend.

### cancelBooking — "Cancel my booking"

**Two different paths** depending on the booking status:

**If the booking is 'pending'** (driver hasn't accepted yet): Cancel freely. No penalty, no seat restoration (pending bookings never decremented seats in the first place).

**If the booking is 'confirmed'** (already accepted):
1. Calculate the cancellation penalty based on time until departure (3 tiers: free, −2, −5)
2. If there's a penalty: deduct trust points, reset streak, record penalty on the booking
3. Cancel the booking
4. Restore the seats back to the ride (increment `available_seats`)

### acceptBooking — "Driver accepts a passenger request"

The driver sees a pending booking and taps "Accept." The system:
1. Locks BOTH the booking and the ride (joined with `FOR UPDATE`)
2. Verifies the booking is still pending and the ride has enough seats
3. Changes booking status to 'confirmed'
4. Decrements `available_seats` on the ride
5. Commits the transaction

### rejectBooking — "Driver rejects a passenger request"

Simpler: changes the booking status to 'cancelled'. No seats to restore (pending bookings never took seats).

---

## reportController.js — Filing Reports

### fileReport — "Report bad behavior"

**Validation (before any database transaction)**:
1. Are all required fields provided (ride_id, reported_user_id, reason)?
2. Is the reason valid (must be one of: no_show, bad_conduct, unsafe_driving, harassment)?
3. Is the reporter trying to report themselves? (Rejected)

**Validation (within the transaction)**:
4. Is the ride completed? (Can only report completed rides)
5. Is it within the 12-hour report window? (Calculated from the ride's `completed_at` timestamp)
6. Has this reporter already filed a report for THIS ride? (One report per person per ride)
7. Has this reporter filed 3+ reports in the last 24 hours? (Anti-spam limit)

**Trust-Weighted Gate**:
8. If the reporter's trust score is below 70 → the report is saved in the database (for admin review), but NO penalty is applied to the reported user. Low-trust users can't weaponize reports.

**Pattern-Match Decision**:
9. If the reason is `no_show` → immediate −5 penalty (no-shows are objective, no need for pattern confirmation)
10. If the reason is a conduct issue → count how many DIFFERENT people have reported this user in the last 30 days:
    - 0 others → **The Shield** activates. Warning only, no penalty. Protects against false accusations.
    - 1+ others → **Pattern detected**. −10 penalty + streak reset.
    - 3+ total → **Escalation**. Additional −25 penalty.

---

## JavaScript Patterns Used — Why Code Looks the Way It Does

### Destructuring — Unpacking Data

Instead of writing `const email = req.body.email; const otp = req.body.otp;` on separate lines, we write:
```javascript
const { email, otp, full_name } = req.body;
```
This "unpacks" the object in one line. `email: rawEmail` is a special form that unpacks `email` but renames it to `rawEmail` (used when we want to clean/transform the value before using it).

The same works with arrays: `const [rides] = await pool.query(...)` takes the first element from the array that `pool.query` returns (which is `[rows, fieldMetadata]` — we only need the rows).

### Async/Await — Waiting for Things

Database queries and API calls take time (milliseconds, but not instant). `async/await` lets us write code that WAITS for a result before continuing, but in a clean, readable way.

Without async/await, you'd use nested callbacks (called "callback hell") that are hard to read and debug. With async/await, the code reads top-to-bottom, like a recipe: "first do this, then do that, then do this other thing."

The `try/catch/finally` pattern wraps async operations: `try` runs the happy path, `catch` handles errors, `finally` runs cleanup (like releasing database connections) no matter what happened.

### Template Literals — Building Dynamic Strings

Using backticks (`` ` ``), we can embed variables directly in strings:
```javascript
`Auto-completed ${count} stale ride(s).`  // → "Auto-completed 5 stale ride(s)."
```
This is much cleaner than string concatenation: `"Auto-completed " + count + " stale ride(s)."`

### Ternary Operator — If/Else in One Line

```javascript
const status = ride.instant_booking ? 'confirmed' : 'pending';
```
This reads as: "If instant_booking is true, use 'confirmed'. Otherwise, use 'pending'." Used when the decision is simple and fits on one line.

### Array Methods — Processing Lists

- `.map()` — Transform every element: `[{id:1},{id:2}].map(r => r.id)` → `[1, 2]`
- `.filter()` — Keep elements that pass a test: `hubs.filter(h => h.city === 'Jalandhar')`
- `.find()` — Get the first matching element: `results.find(r => r.id === 42)`
- `.includes()` — Check if an array contains a value: `['active','completed'].includes(status)`
- `.join()` — Combine into a string: `['name = ?', 'phone = ?'].join(', ')` → `'name = ?, phone = ?'`

### parseInt/parseFloat — Converting Strings to Numbers

Data from HTTP requests arrives as strings (even numbers). `parseInt('3')` converts the string `"3"` to the number `3`. `parseFloat('115.50')` converts `"115.50"` to `115.5`. We use these before doing any math.
