# 🗄️ Database — MySQL & SQL Explained

## What is a Database? Why MySQL?

A database is where all the app's data is permanently stored. When the server restarts, all user accounts, rides, and bookings are still there because they live in the database, not in the server's memory.

**Think of it like this**: The server (Node.js) is like a cashier at a store. The cashier processes transactions and talks to customers, but all the product inventory is stored in a warehouse (the database). If the cashier goes home for the night and comes back the next morning, the warehouse still has everything.

**MySQL** is a **relational database** — meaning data is stored in **tables** (like spreadsheets) with **rows** (records) and **columns** (fields). The "relational" part means tables can be connected to each other. For example, the `bookings` table has a `ride_id` column that points to the `rides` table — this is a **relationship**.

**Why MySQL over MongoDB?** Our data has clear relationships: users create rides, rides have bookings, bookings have reports. MySQL is designed for this. It also supports **transactions** (group operations that either all succeed or all fail) and **row-level locking** (prevent two users from modifying the same data simultaneously). These are critical for our booking system where we can't afford to double-book a seat.

**Why Aiven Cloud?** If we ran MySQL on our laptop, the app would only work when our laptop is on and connected to the internet. Aiven hosts MySQL in the cloud — it's always running, accessible from anywhere, with automatic backups and SSL encryption.

---

## How the Backend Connects to the Database

The connection is configured in `config/db.js`. The key concept here is the **Connection Pool**.

### What is a Connection Pool? (Simple Analogy)

Imagine you run a customer service center. Every time a customer calls, you hire a new phone operator, they take the call, and then you fire them. That's absurd — hiring and firing takes time!

Instead, you keep 10 operators on staff. When a customer calls, an available operator picks up. When the call ends, the operator becomes available again. If all 10 are busy, new callers wait in a queue.

A database connection pool works the same way. We pre-open 10 connections to MySQL. When a request needs the database, it borrows an available connection. When it's done, the connection goes back to the pool. This is MUCH faster than opening a new connection (which involves TCP handshake, SSL negotiation, authentication — about 50-100ms each time) for every request.

**Our pool settings**:
- `connectionLimit: 10` → Maximum 10 simultaneous connections
- `waitForConnections: true` → If all 10 are busy, new requests wait (instead of crashing)
- `queueLimit: 0` → No limit on how many can wait in the queue

### SSL Encryption

The connection between our backend and MySQL is encrypted using SSL (Secure Sockets Layer). This means even if someone intercepts the network traffic, they can't read the data. We use a **CA certificate** file (`ca-certificate.pem`) — this is a certificate from the Certificate Authority that proves the Aiven server is who it claims to be, preventing man-in-the-middle attacks.

In production, we set `rejectUnauthorized: true` — meaning the backend WILL reject connections if the certificate doesn't match. In development, we set it to `false` for easier setup.

---

## Database Tables — What Data We Store

We have **6 tables**. Each table stores a specific type of data. Let me explain each one in plain language, then show the structure.

### Table 1: `users` — Who Uses the App

Every person who registers gets a row in this table. It stores their identity, contact info, and reputation.

**What each column means**:

- **`id`** (AUTO_INCREMENT): A unique number assigned by MySQL automatically. First user is 1, second is 2, etc. We never set this manually — MySQL generates it. This is the "primary key" — the unique identifier for each user.

- **`email`** (UNIQUE): Their university email. The UNIQUE constraint means MySQL will reject any attempt to register a second user with the same email — preventing duplicate accounts.

- **`trust_score`** (DEFAULT 100): This is the reputation system. Every new user starts at 100 (maximum trust). When they do bad things (late cancellations, bad conduct), this number decreases. When they have clean rides (streaks), it slowly increases. A trust score below 70 means their reports won't trigger penalties on others (anti-weaponization).

- **`current_streak`**: How many rides in a row this user completed without any issues. Getting reported or cancelling late resets this to 0. This rewards consistent good behavior.

- **`gender`**: Used for the "women-only ride" feature. If a driver marks their ride as women-only, only users with `gender = 'female'` can book it. This is a safety feature.

### Table 2: `user_otps` — Temporary Login Codes

This table stores OTP verification records. Each row represents one OTP that was sent to an email.

**Important design decisions**:

- **`otp_hash`** (not `otp`): We NEVER store the actual 6-digit OTP in the database. We store a SHA-256 hash of it. If a hacker steals our database, they see `a3f2b8c9d1e5...` instead of `847293`. SHA-256 is a one-way function — you cannot reverse it. When the user enters their OTP, we hash their input and compare the hashes.

- **`attempts`** (DEFAULT 0): Counts how many times someone tried the wrong code. After 3 failed attempts, the OTP is locked. This prevents brute-force attacks (trying all 1 million possible codes).

- **`expires_at`**: OTPs are only valid for 10 minutes. After that, they can't be used even if they're correct. This limits the window for an attacker.

- **`is_verified`** (DEFAULT FALSE): Becomes TRUE once the OTP is successfully verified. Once verified, it can't be used again.

### Table 3: `rides` — Posted Rides

Every ride posted by a driver gets a row here. This is the largest table with the most columns because a ride has many attributes.

**Key columns explained**:

- **`driver_id`** (Foreign Key → users.id): Links to the user who posted this ride. This is a foreign key — it points to the `id` column in the `users` table. This means you can't create a ride for a non-existent user.

- **GPS coordinates** (`origin_lat`, `origin_lng`, `dest_lat`, `dest_lng`): The exact GPS locations of the start and end points. Stored as DECIMAL(10,7) which gives precision up to ~1 centimeter. These are used to calculate driving distance via OSRM.

- **`distance_km`**: The actual driving distance calculated by the OSRM API. The frontend NEVER sets this — the backend calculates it to prevent price manipulation.

- **`base_price`**: The total fuel cost for the entire trip (calculated by the pricing algorithm).

- **`driver_set_price`**: What the driver WANTS to charge per seat.

- **`capped_price`**: The final per-seat price AFTER the system's fairness cap is applied. If the driver tries to charge more than the fair share, the system caps it. This is what passengers actually pay.

- **`instant_booking`**: If TRUE, bookings are immediately confirmed. If FALSE, the driver must manually accept each booking.

- **`status`**: The lifecycle state of the ride:
  - `active` → Ride is open for bookings
  - `completed` → Ride has been completed
  - `cancelled` → Ride was cancelled by the driver

- **`streak_processed`**: A flag to prevent the streak system from processing the same ride twice. Once the background job awards streak points for this ride, it sets this to TRUE so it doesn't process it again in the next cycle.

### Table 4: `bookings` — Seat Reservations

When a passenger books a seat on a ride, a row is created here.

**Key columns**:

- **`status`**: The lifecycle of a booking:
  - `pending` → Waiting for driver to accept (non-instant booking)
  - `confirmed` → Accepted and seat is reserved
  - `cancelled` → Cancelled by passenger or driver
  - `completed` → Ride was completed with this passenger

- **UNIQUE KEY (ride_id, passenger_id)**: This constraint means a passenger can only book a ride ONCE. If they try to book again, MySQL returns a "duplicate entry" error. This prevents accidental double-bookings.

- **`cancellation_penalty`**: If a passenger cancels late, we record the trust penalty here. This serves as an audit trail — we can see exactly why a user's trust score decreased.

### Table 5: `reports` — Incident Reports

When a user reports bad behavior after a completed ride, a row is created here.

**Key columns**:

- **`reason`** (ENUM): The category of the report. Limited to 4 options: `no_show` (person didn't show up), `bad_conduct`, `unsafe_driving`, `harassment`. Using ENUM prevents invalid values.

- **UNIQUE KEY (ride_id, reporter_id)**: One person can only file one report per ride. This prevents report spamming.

- **`penalty_applied`**: How many trust points were actually deducted from the reported user. This could be 0 (if it was the first report — "The Shield" protection), 5 (no-show), 10 (pattern detected), or 35 (escalation).

### Table 6: `fuel_rates` — Reference Fuel Prices

A simple lookup table that stores current fuel prices. When a ride is posted, the backend looks up the fuel rate for the selected fuel type (petrol, diesel, CNG, electric) and uses it in the pricing calculation.

---

## Foreign Keys — How Tables Are Connected

**What is a Foreign Key?** It's a column in one table that points to the primary key (id) of another table. It creates a relationship between the tables and enforces data integrity.

**Example**: `rides.driver_id` is a foreign key that references `users.id`. This means:
1. You CANNOT create a ride with `driver_id = 999` if there's no user with `id = 999` (the database will reject it).
2. With `ON DELETE CASCADE`, if you delete a user, ALL their rides are automatically deleted too (cascading delete). This prevents "orphan" data — rides pointing to users that no longer exist.

**Visual relationships**:
```
One user can post MANY rides                    users.id ←→ rides.driver_id
One user can make MANY bookings                 users.id ←→ bookings.passenger_id
One ride can have MANY bookings (one per seat)  rides.id ←→ bookings.ride_id
One user can file MANY reports                  users.id ←→ reports.reporter_id
One user can receive MANY reports               users.id ←→ reports.reported_user_id
One ride can have MANY reports                  rides.id ←→ reports.ride_id
```

---

## SQL Queries — How We Talk to the Database

SQL (Structured Query Language) is the language we use to ask the database for data, insert new data, update existing data, or delete data. Here's every type of query we use, explained in plain English:

### SELECT — "Give me this data"

When we need to READ data from the database, we use SELECT. It's like asking a librarian "find me all books by this author."

**Example: Finding active rides between two cities**

What we're asking: "Find all rides going from Phagwara to Jalandhar that are still active, have seats available, and haven't departed yet. Also, tell me the driver's name. Sort by earliest departure first."

```sql
SELECT r.*, u.full_name AS driver_name
FROM rides r
JOIN users u ON r.driver_id = u.id
WHERE r.origin_city = 'Phagwara'
  AND r.destination_city = 'Jalandhar'
  AND r.available_seats > 0
  AND r.status = 'active'
  AND r.departure_time > NOW()
ORDER BY r.departure_time ASC;
```

**Breaking it down**:
- `SELECT r.*` → Get all columns from the rides table
- `u.full_name AS driver_name` → Also get the driver's name (from the users table), and call it "driver_name" in the results
- `FROM rides r` → The main table is `rides`, and we'll call it `r` for short
- `JOIN users u ON r.driver_id = u.id` → Connect the rides table to the users table by matching `driver_id` with user `id`. This is how we get the driver's name without a separate query.
- `WHERE ...` → Filter conditions (only active rides, future departure, has seats)
- `ORDER BY r.departure_time ASC` → Show earliest departures first

### INSERT — "Save this new data"

When we need to CREATE a new record, we use INSERT. It's like filling out a form and filing it.

```sql
INSERT INTO bookings (ride_id, passenger_id, seats_booked, price_paid, status)
VALUES (42, 15, 1, 85.00, 'confirmed');
```

This creates a new row in the bookings table: passenger #15 booked 1 seat on ride #42 for ₹85.

### UPDATE — "Change this existing data"

When we need to MODIFY existing data, we use UPDATE.

```sql
-- When a booking is confirmed, reduce available seats
UPDATE rides SET available_seats = available_seats - 1 WHERE id = 42;
```

This finds ride #42 and subtracts 1 from its `available_seats`. If it was 3, it becomes 2.

```sql
-- When penalizing a user, reduce their trust score (never below 0)
UPDATE users SET trust_score = GREATEST(trust_score - 5, 0) WHERE id = 15;
```

`GREATEST(trust_score - 5, 0)` means "subtract 5, but if the result is negative, use 0 instead." This ensures trust scores never go below zero. If a user has trust_score = 3 and we subtract 5: 3 - 5 = -2, but GREATEST(-2, 0) = 0.

### DELETE — "Remove this data"

When we need to REMOVE data:

```sql
-- Delete old unverified OTPs (cleanup before creating a new one)
DELETE FROM user_otps WHERE email = 'user@lpu.in' AND is_verified = FALSE;
```

This removes all unused OTP records for a specific email. We do this before creating a new OTP to prevent old ones from being valid.

### COUNT — "How many matching records exist?"

```sql
-- How many OTP requests has this email made in the last 10 minutes?
SELECT COUNT(*) as count FROM user_otps
WHERE email = 'user@lpu.in' AND created_at > NOW() - INTERVAL 10 MINUTE;
```

If the count is 3 or more, we reject the request (rate limiting).

---

## Critical SQL Concepts Used

### JOIN — Combining Data from Multiple Tables

**The problem**: Ride data is in the `rides` table, but the driver's name is in the `users` table. When showing search results, we need BOTH.

**The solution**: JOIN connects two tables using a matching column.

**Analogy**: Imagine two spreadsheets. Spreadsheet A has ride details with a "driver_id" column. Spreadsheet B has user details with an "id" column. A JOIN is like VLOOKUP in Excel — "look up this driver_id in spreadsheet B and bring back their name."

### FOR UPDATE — Row-Level Locking (THE Most Important Concept)

**The problem**: Two passengers try to book the LAST seat on a ride at the exact same time.

**Without locking** (dangerous!):
1. User A reads: available_seats = 1 ← "Great, there's a seat!"
2. User B reads: available_seats = 1 ← "Great, there's a seat!" (SAME data, because User A hasn't finished yet)
3. User A books → seats = 0
4. User B books → seats = -1 ← OVERSOLD! 🔥

**With FOR UPDATE** (safe!):
1. User A runs `SELECT ... FOR UPDATE` → reads available_seats = 1, and the ROW IS NOW LOCKED
2. User B runs `SELECT ... FOR UPDATE` → WAITS (the row is locked by User A)
3. User A books → seats = 0 → COMMIT → lock is released
4. User B's query finally runs → reads available_seats = 0 → "Not enough seats" → booking rejected
5. Everyone is safe!

**Analogy**: It's like a changing room in a store. When someone is using it, the door is locked. The next person has to wait outside until the first person is done and unlocks the door.

### Transactions — All or Nothing

**The problem**: Booking a seat requires TWO database operations:
1. Decrease `available_seats` on the ride
2. Insert a new booking record

What if step 1 succeeds but step 2 fails (maybe the database has a hiccup)? Now we've lost a seat (it was decremented) but there's no booking for it. The seat is gone into a void.

**The solution**: Wrap both operations in a transaction. If step 2 fails, ROLLBACK undoes step 1 too. The database always stays in a consistent state.

**Analogy**: A bank transfer. Withdrawing ₹500 from Account A and depositing ₹500 into Account B must happen together. If the deposit fails, the withdrawal must be reversed. You can't have the money disappear.

```
BEGIN TRANSACTION
  Step 1: Decrease seats (the database remembers the old value)
  Step 2: Insert booking
  If everything worked → COMMIT (save permanently)
  If anything failed → ROLLBACK (undo Step 1, restore old seat count)
END
```

### NOW() — Current Time in SQL

`NOW()` returns the current date and time. We use it everywhere:
- `departure_time > NOW()` → "rides that haven't departed yet"
- `departure_time < NOW() - INTERVAL 24 HOUR` → "rides that departed more than 24 hours ago"
- `completed_at = NOW()` → "mark completion time as right now"

### INTERVAL — Time Math

MySQL lets you do arithmetic with time:
- `NOW() - INTERVAL 10 MINUTE` → "10 minutes ago"
- `NOW() - INTERVAL 24 HOUR` → "24 hours ago"
- `NOW() - INTERVAL 30 DAY` → "30 days ago"

We use this for: OTP rate limiting (last 10 min), stale ride cleanup (older than 24h), report pattern detection (last 30 days), streak cooldown (last 24h).

### ENUM — Restricted Values

`ENUM('active', 'completed', 'cancelled')` means this column can ONLY contain one of these three values. Trying to insert "deleted" or "foo" would cause a database error. This prevents invalid data at the database level — even if a bug in the backend code tries to set a wrong value.

### Parameterized Queries — SQL Injection Prevention

**The attack**: SQL injection. If we build SQL queries by directly inserting user input:
```sql
SELECT * FROM users WHERE email = 'user@lpu.in'
```
An attacker could enter `'; DROP TABLE users; --` as their email, turning the query into:
```sql
SELECT * FROM users WHERE email = ''; DROP TABLE users; --'
```
This would DELETE our entire users table! 😱

**The defense**: Parameterized queries (using `?` placeholders):
```javascript
pool.query('SELECT * FROM users WHERE email = ?', [email]);
```
The `mysql2` library treats the `?` as a placeholder and safely escapes any special characters in the email. Even if someone enters `'; DROP TABLE users; --`, it's treated as a literal string, not as SQL code. The tables are safe.

**We use parameterized queries in EVERY SINGLE database query throughout the entire backend. There are zero exceptions.**
