# RideMates: Master Architecture & Development Blueprint

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Features & Business Logic](#2-core-features--business-logic)
3. [Technology Stack](#3-technology-stack)
4. [Database Schema](#4-database-schema)
5. [API Reference](#5-api-reference)
6. [File Structure](#6-file-structure)
7. [Prerequisites & Environment Setup](#7-prerequisites--environment-setup)
8. [Development Roadmap](#8-development-roadmap)
9. [Pricing Algorithm](#9-pricing-algorithm)
10. [Authentication Flow](#10-authentication-flow)
11. [Map & Routing Flow](#11-map--routing-flow)
12. [Strike Resilience Mode](#12-strike-resilience-mode)
13. [Error Handling Strategy](#13-error-handling-strategy)
14. [Common Traps & Solutions](#14-common-traps--solutions)
15. [Deployment Checklist](#15-deployment-checklist)

---

## 1. Project Overview

**RideMates** is a hyper-local, university-exclusive peer-to-peer commute network. It connects university day-scholars and faculty who have empty vehicle seats with peers traveling the exact same route.

### Core Problem Solved

It bridges the gap between:

| Problem                        | Existing Solution     | Why It Fails                                      |
| ------------------------------ | --------------------- | ------------------------------------------------- |
| Expensive daily commute        | Rapido / Uber         | ₹200–400/day is unsustainable for students        |
| Unsafe open carpooling         | BlaBlaCar             | Matches you with strangers; no identity guarantee  |
| Unreliable public transport    | State buses           | Vulnerable to bus strikes and highway roadblocks   |

### RideMates Value Proposition

- **Trusted Network** — Only verified university students and staff can join.
- **Cost-Sharing, Not Profit** — Drivers split fuel costs, never earn profit.
- **Strike-Proof** — Alternate village link-road routes when highways are blocked.
- **Visual Routes** — Map-based UX shows the exact route before booking.

---

## 2. Core Features & Business Logic

### 2.1 Domain-Restricted Authentication

| Attribute       | Detail                                                                 |
| --------------- | ---------------------------------------------------------------------- |
| **How**         | Users register/login exclusively with a valid university email (e.g., `@lpu.in`) |
| **Why**         | Eliminates "stranger danger"; every user is a verified student or staff member   |
| **Mechanism**   | Firebase Auth sends an OTP to the university email; backend validates the domain |
| **Rejection**   | Any email NOT matching the allowed domain pattern is rejected at signup          |

**Allowed Domain Validation (Backend):**

```javascript
const ALLOWED_DOMAINS = ['lpu.in'];

function isUniversityEmail(email) {
  const domain = email.split('@')[1];
  return ALLOWED_DOMAINS.includes(domain);
}
```

---

### 2.2 "Fair-Share" Capped Pricing (BlaBlaCar Model)

| Attribute       | Detail                                                                          |
| --------------- | ------------------------------------------------------------------------------- |
| **How**         | App calculates baseline fuel cost: `Distance × Fuel Rate / Mileage`            |
| **Slider**      | Drivers adjust via a slider, but price is **hard-capped** at a maximum limit    |
| **Why**         | Prevents commercial profit; keeps the app legal under "White Plate" regulations |
| **Split**       | Final passenger price = `capped_price / number_of_passengers`                   |

**Pricing Formula:**

```
base_cost      = (distance_km × fuel_rate_per_litre) / vehicle_mileage_kmpl
max_cap        = base_cost × 1.5
per_seat_price = min(driver_set_price, max_cap) / total_passengers
```

**Example Calculation:**

| Parameter             | Value        |
| --------------------- | ------------ |
| Distance              | 40 km        |
| Fuel Rate             | ₹105/litre   |
| Vehicle Mileage       | 15 km/l      |
| Base Fuel Cost        | ₹280         |
| Max Cap (×1.5)        | ₹420         |
| Driver Sets           | ₹350 ✅      |
| Passengers            | 3            |
| **Per-Seat Price**    | **₹116.67**  |

---

### 2.3 Dynamic Node Routing

| Attribute       | Detail                                                                          |
| --------------- | ------------------------------------------------------------------------------- |
| **How**         | User types a city name → Mapbox Geocoding API converts to GPS coordinates → Polyline drawn on map |
| **Why**         | Visual, map-based UX without the heavy cost of real-time live-tracking          |
| **Flow**        | `City Name → Lat/Lng → Mapbox Directions API → Decoded Polyline → MapView`     |

**Geocoding Request:**

```
GET https://api.mapbox.com/geocoding/v5/mapbox.places/{city_name}.json?access_token={TOKEN}
```

**Directions Request:**

```
GET https://api.mapbox.com/directions/v5/mapbox/driving/{origin_lng},{origin_lat};{dest_lng},{dest_lat}?geometries=polyline&access_token={TOKEN}
```

---

### 2.4 Strike Resilience Mode

| Attribute       | Detail                                                                          |
| --------------- | ------------------------------------------------------------------------------- |
| **How**         | A boolean toggle `is_emergency_route` that drivers activate                     |
| **When**        | Highway protests, gridlock, bus strikes                                         |
| **Effect**      | Indicates the driver is taking village link-roads to bypass blocked highways     |
| **UI**          | Orange badge on the RideCard: `⚠️ ALTERNATE ROUTE`                             |
| **Schema**      | `is_emergency_route BOOLEAN DEFAULT FALSE` in the `rides` table                 |

---

## 3. Technology Stack

| Layer              | Technology               | Purpose in RideMates                                                        |
| ------------------ | ------------------------ | --------------------------------------------------------------------------- |
| **Frontend**       | React Native (Expo)      | Cross-platform UI (Android/iOS). Map rendering and user inputs.             |
| **Backend API**    | Node.js & Express.js     | Server-side logic: price cap calculation, seat availability, ride matching. |
| **Database**       | MySQL (via Aiven)        | Stores relational data: Users, Rides, Bookings.                            |
| **Authentication** | Firebase Auth            | Sends Email OTP and verifies university domain.                            |
| **Mapping**        | Mapbox API               | Text → Lat/Lng conversion, polyline route drawing.                         |
| **Location**       | expo-location            | Gets user's current GPS coordinates on device.                             |
| **HTTP Client**    | Axios                    | Frontend-to-backend API communication.                                     |
| **Navigation**     | React Navigation         | Screen-to-screen routing within the mobile app.                            |

### Version Requirements

| Tool         | Minimum Version |
| ------------ | --------------- |
| Node.js      | 18.x LTS       |
| npm          | 9.x            |
| Expo SDK     | 51+             |
| MySQL        | 8.0             |
| React Native | 0.74+           |

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram (Textual)

```
┌──────────┐       ┌──────────┐       ┌──────────────┐
│  users   │──1:N──│  rides   │──1:N──│  bookings    │
└──────────┘       └──────────┘       └──────────────┘
     │                                       │
     └──────────────────1:N──────────────────┘
```

### 4.2 SQL CREATE TABLE Statements

```sql
-- =============================================
-- TABLE 1: users
-- Stores every verified university member
-- =============================================
CREATE TABLE users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid    VARCHAR(128) NOT NULL UNIQUE,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone           VARCHAR(15),
    university      VARCHAR(100) DEFAULT 'LPU',
    role            ENUM('student', 'faculty') DEFAULT 'student',
    profile_photo   VARCHAR(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_firebase_uid (firebase_uid)
);

-- =============================================
-- TABLE 2: rides
-- Every ride a driver posts
-- =============================================
CREATE TABLE rides (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    driver_id           INT NOT NULL,
    origin_city         VARCHAR(100) NOT NULL,
    origin_lat          DECIMAL(10, 7) NOT NULL,
    origin_lng          DECIMAL(10, 7) NOT NULL,
    destination_city    VARCHAR(100) NOT NULL,
    dest_lat            DECIMAL(10, 7) NOT NULL,
    dest_lng            DECIMAL(10, 7) NOT NULL,
    distance_km         DECIMAL(6, 2) NOT NULL,
    departure_time      DATETIME NOT NULL,
    available_seats     TINYINT NOT NULL CHECK (available_seats >= 0),
    vehicle_type        ENUM('car', 'bike', 'auto') DEFAULT 'car',
    vehicle_mileage     DECIMAL(5, 2) DEFAULT 15.00,
    fuel_type           ENUM('petrol', 'diesel', 'cng', 'electric') DEFAULT 'petrol',
    base_price          DECIMAL(8, 2) NOT NULL,
    driver_set_price    DECIMAL(8, 2) NOT NULL,
    capped_price        DECIMAL(8, 2) NOT NULL,
    is_emergency_route  BOOLEAN DEFAULT FALSE,
    status              ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_departure (departure_time),
    INDEX idx_origin (origin_city),
    INDEX idx_destination (destination_city)
);

-- =============================================
-- TABLE 3: bookings
-- Every seat reservation by a passenger
-- =============================================
CREATE TABLE bookings (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    ride_id         INT NOT NULL,
    passenger_id    INT NOT NULL,
    seats_booked    TINYINT DEFAULT 1,
    price_paid      DECIMAL(8, 2) NOT NULL,
    status          ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
    booked_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking (ride_id, passenger_id),
    INDEX idx_ride (ride_id),
    INDEX idx_passenger (passenger_id)
);
```

### 4.3 Fuel Rate Reference Table

```sql
-- =============================================
-- TABLE 4: fuel_rates (Optional but useful)
-- Current fuel prices for cost calculation
-- =============================================
CREATE TABLE fuel_rates (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    fuel_type   ENUM('petrol', 'diesel', 'cng', 'electric') NOT NULL UNIQUE,
    rate_per_litre DECIMAL(6, 2) NOT NULL,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO fuel_rates (fuel_type, rate_per_litre) VALUES
('petrol', 105.00),
('diesel', 92.00),
('cng', 80.00),
('electric', 5.00);  -- per kWh equivalent
```

---

## 5. API Reference

### Base URL

```
Development:  http://localhost:5000/api
Production:   https://your-domain.com/api
```

### 5.1 Authentication Endpoints

| Method | Endpoint              | Description                         | Auth Required |
| ------ | --------------------- | ----------------------------------- | ------------- |
| POST   | `/api/auth/register`  | Register new user (after Firebase)  | Firebase Token |
| GET    | `/api/auth/profile`   | Get current user's profile          | Firebase Token |
| PUT    | `/api/auth/profile`   | Update user profile                 | Firebase Token |

#### POST `/api/auth/register`

**Request Body:**

```json
{
  "firebase_uid": "abc123xyz",
  "full_name": "Sameer Kumar",
  "email": "sameer.kumar@lpu.in",
  "phone": "9876543210",
  "role": "student"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "firebase_uid": "abc123xyz",
    "full_name": "Sameer Kumar",
    "email": "sameer.kumar@lpu.in"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Only university emails (@lpu.in) are allowed"
}
```

---

### 5.2 Ride Endpoints

| Method | Endpoint               | Description                         | Auth Required |
| ------ | ---------------------- | ----------------------------------- | ------------- |
| POST   | `/api/rides/create`    | Post a new ride                     | Yes           |
| GET    | `/api/rides/search`    | Search rides by origin/destination  | Yes           |
| GET    | `/api/rides/:id`       | Get single ride details             | Yes           |
| PUT    | `/api/rides/:id`       | Update ride (driver only)           | Yes           |
| DELETE | `/api/rides/:id`       | Cancel ride (driver only)           | Yes           |

#### POST `/api/rides/create`

> **⚠️ TIMEZONE TRAP — MySQL vs. JavaScript:**
> Your phone is in IST (UTC+5:30). Your Aiven MySQL is likely in UTC.
> If you send `2026-03-01 08:30:00` as a plain string, MySQL may store it in UTC,
> shifting it by −5.5 hours. When a passenger fetches the ride, it shows **3:00 AM**!
>
> **The Fix:** Install `dayjs` on the frontend. Before sending dates to the backend,
> always convert to an ISO 8601 string: `dayjs(date).toISOString()`.
> This produces a UTC timestamp like `2026-03-01T03:00:00.000Z`.
> When the app fetches it back, `dayjs` automatically converts it to the user's
> local phone timezone for display. See [Section 14.1](#141-the-timezone-trap) for full implementation.

**Request Body:**

```json
{
  "origin_city": "Phagwara",
  "origin_lat": 31.2240,
  "origin_lng": 75.7708,
  "destination_city": "Jalandhar",
  "dest_lat": 31.3260,
  "dest_lng": 75.5762,
  "distance_km": 22.5,
  "departure_time": "2026-03-01T03:00:00.000Z",
  "available_seats": 3,
  "vehicle_type": "car",
  "vehicle_mileage": 15,
  "fuel_type": "petrol",
  "driver_set_price": 180
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Ride created successfully",
  "data": {
    "ride_id": 42,
    "base_price": 157.50,
    "capped_price": 180.00,
    "max_allowed": 236.25,
    "per_seat_price": 60.00
  }
}
```

#### GET `/api/rides/search`

**Query Parameters:**

| Parameter         | Type    | Required | Description                     |
| ----------------- | ------- | -------- | ------------------------------- |
| origin            | string  | Yes      | Origin city name                |
| destination       | string  | Yes      | Destination city name           |
| date              | string  | No       | Filter by date (YYYY-MM-DD)    |
| emergency_only    | boolean | No       | Show only strike-resilient rides |

**Example:** `GET /api/rides/search?origin=Phagwara&destination=Jalandhar&date=2026-03-01`

---

### 5.3 Booking Endpoints

| Method | Endpoint                  | Description                      | Auth Required |
| ------ | ------------------------- | -------------------------------- | ------------- |
| POST   | `/api/bookings/new`       | Book a seat on a ride            | Yes           |
| GET    | `/api/bookings/my`        | Get current user's bookings      | Yes           |
| PUT    | `/api/bookings/:id/cancel`| Cancel a booking                 | Yes           |

#### POST `/api/bookings/new`

> **CRITICAL — Double Booking Prevention:**
> A naive implementation (SELECT seats, then UPDATE) will fail under concurrency.
> If two students click "Book" at the exact same millisecond for the last seat,
> both `SELECT` queries see `available_seats = 1` and both proceed to book.
> **You MUST use an SQL Transaction with row-level locking (`SELECT ... FOR UPDATE`)**
> to guarantee only one booking succeeds.

**Request Body:**

```json
{
  "ride_id": 42,
  "seats_booked": 1
}
```

**Backend Implementation (Atomic Booking with Row Lock):**

```javascript
// controllers/bookController.js
const pool = require('../config/db');

async function bookSeat(req, res) {
  const { ride_id, seats_booked = 1 } = req.body;
  const passenger_id = req.userId;

  // Get a dedicated connection (transactions require a single connection, NOT the pool)
  const connection = await pool.getConnection();

  try {
    // ── START TRANSACTION ──────────────────────────────────
    await connection.beginTransaction();

    // Step 1: Lock the ride row. No other transaction can read/write
    //         this row until we COMMIT or ROLLBACK.
    //         This is what prevents the double-booking race condition.
    const [rides] = await connection.query(
      'SELECT available_seats, capped_price FROM rides WHERE id = ? FOR UPDATE',
      [ride_id]
    );

    if (rides.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    const ride = rides[0];

    // Step 2: Check seat availability (while the row is locked)
    if (ride.available_seats < seats_booked) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Not enough seats available. Requested: ${seats_booked}, Available: ${ride.available_seats}`,
        error: 'INSUFFICIENT_SEATS'
      });
    }

    // Step 3: Calculate per-seat price
    const price_paid = Math.round(
      (ride.capped_price / (ride.available_seats)) * seats_booked * 100
    ) / 100;

    // Step 4: Decrement seats atomically
    await connection.query(
      'UPDATE rides SET available_seats = available_seats - ? WHERE id = ?',
      [seats_booked, ride_id]
    );

    // Step 5: Insert the booking record
    const [result] = await connection.query(
      `INSERT INTO bookings (ride_id, passenger_id, seats_booked, price_paid)
       VALUES (?, ?, ?, ?)`,
      [ride_id, passenger_id, seats_booked, price_paid]
    );

    // ── COMMIT — Only now are both changes made permanent ──
    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Booking confirmed',
      data: {
        booking_id: result.insertId,
        ride_id,
        seats_booked,
        price_paid,
        remaining_seats: ride.available_seats - seats_booked
      }
    });
  } catch (error) {
    // ── ROLLBACK — If anything fails, undo everything ──
    await connection.rollback();

    // Handle duplicate booking (UNIQUE KEY on ride_id + passenger_id)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'You have already booked this ride',
        error: 'ALREADY_BOOKED'
      });
    }

    res.status(500).json({ success: false, message: error.message });
  } finally {
    // ALWAYS release the connection back to the pool
    connection.release();
  }
}

module.exports = { bookSeat };
```

**Why This Works (Race Condition Explained):**

```
❌ WITHOUT Transaction (Broken):

  Student A: SELECT available_seats → sees 1  ⬅ both read the same value
  Student B: SELECT available_seats → sees 1  ⬅ race condition!
  Student A: UPDATE seats = 0, INSERT booking  ✅ booked
  Student B: UPDATE seats = -1, INSERT booking ❌ oversold!

✅ WITH SELECT ... FOR UPDATE (Fixed):

  Student A: BEGIN; SELECT ... FOR UPDATE → sees 1, LOCKS the row
  Student B: BEGIN; SELECT ... FOR UPDATE → ⏳ BLOCKED (waits for A's lock)
  Student A: UPDATE seats = 0, INSERT booking, COMMIT → ✅ booked, lock released
  Student B: SELECT ... FOR UPDATE → now sees 0 → ❌ "Not enough seats" → ROLLBACK
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Booking confirmed",
  "data": {
    "booking_id": 108,
    "ride_id": 42,
    "seats_booked": 1,
    "price_paid": 60.00,
    "remaining_seats": 2
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Not enough seats available. Requested: 2, Available: 1"
}
```

---

## 6. File Structure

> **Critical Rule:** Backend and Frontend live in completely separate folders.

### 6.1 Backend (`/Backend`)

Follows a simple **MVC (Model-View-Controller)** pattern.

```
Backend/
│
├── .env                      # SECRET: MySQL URI, API keys (NEVER commit)
├── .gitignore                # Ignores node_modules, .env
├── server.js                 # ENTRY POINT: Starts Express, connects to MySQL
├── package.json              # Dependencies: express, mysql2, cors, dotenv
│
├── config/
│   └── db.js                 # MySQL connection pool (Aiven)
│
├── middleware/
│   └── authMiddleware.js     # Verifies Firebase token on protected routes
│
├── controllers/              # THE LOGIC ("Brains")
│   ├── authController.js     # Save Firebase users to MySQL, domain validation
│   ├── rideController.js     # BlaBlaCar price calculation, CRUD for rides
│   └── bookController.js     # Seat decrement logic, booking management
│
├── routes/                   # THE URLs ("Doors")
│   ├── authRoutes.js         # POST /api/auth/register, GET /api/auth/profile
│   ├── rideRoutes.js         # POST /api/rides/create, GET /api/rides/search
│   └── bookRoutes.js         # POST /api/bookings/new, GET /api/bookings/my
│
└── utils/
    └── priceCalculator.js    # Pure function: fuel cost + cap logic
```

### 6.2 Frontend (`/Frontend`)

Uses **Expo Router** (file-based routing) with a Screen/Component split.

```
Frontend/
│
├── app.json                  # Expo configuration
├── package.json              # Dependencies: axios, react-native-maps, firebase
├── tsconfig.json             # TypeScript configuration
│
├── app/                      # FILE-BASED ROUTING (Expo Router)
│   ├── _layout.tsx           # Root layout (Navigation container)
│   ├── modal.tsx             # Modal screen
│   │
│   ├── (auth)/               # AUTH GROUP (unauthenticated screens)
│   │   ├── _layout.tsx       # Auth stack layout
│   │   └── login.tsx         # Firebase Email OTP login screen
│   │
│   └── (tabs)/               # TAB GROUP (authenticated screens)
│       ├── _layout.tsx       # Tab navigator layout
│       ├── index.tsx         # Home: Dashboard (Post or Find ride)
│       ├── search.tsx        # Search rides + Mapbox map view
│       ├── post-ride.tsx     # Post ride form + Price slider
│       ├── my-rides.tsx      # User's rides and bookings
│       └── profile.tsx       # User profile screen
│
├── components/               # REUSABLE UI PIECES
│   ├── RideCard.tsx          # Visual card showing ride details
│   ├── CustomButton.tsx      # Standardized button
│   ├── PriceSlider.tsx       # Capped pricing slider component
│   ├── MapRoute.tsx          # Mapbox polyline route renderer
│   ├── EmergencyBadge.tsx    # ⚠️ Strike route indicator badge
│   └── ui/                   # Base UI primitives
│       ├── collapsible.tsx
│       ├── icon-symbol.tsx
│       └── icon-symbol.ios.tsx
│
├── services/                 # API CALLERS
│   ├── api.ts                # Axios instance + interceptors for backend
│   ├── mapbox.ts             # Mapbox geocoding + directions API calls
│   └── firebase.ts           # Firebase Auth initialization + helpers
│
├── constants/
│   ├── theme.ts              # Colors, fonts, spacing tokens
│   └── config.ts             # API_BASE_URL, MAPBOX_TOKEN, fuel rates
│
├── hooks/
│   ├── useAuth.ts            # Auth state management hook
│   ├── useLocation.ts        # expo-location GPS hook
│   └── use-color-scheme.ts   # Theme detection
│
└── assets/
    └── images/               # App icons, splash, illustrations
```

---

## 7. Prerequisites & Environment Setup

### 7.1 Required API Keys & URIs

Before writing **line 1** of code, generate and save these:

| Key                      | Source                   | Format Example                                      |
| ------------------------ | ------------------------ | --------------------------------------------------- |
| MySQL Connection URI     | Aiven / Clever Cloud     | `mysql://user:pass@host:port/db?ssl-mode=REQUIRED`  |
| Firebase Config Object   | Firebase Console         | `{ apiKey: "...", projectId: "ridemates-xxxxx" }`   |
| Mapbox Public Token      | Mapbox Dashboard         | `pk.eyJ1Ijoi...`                                    |

### 7.2 Backend `.env` File

> **🔒 LEAKED SECRETS TRAP:**
> In Node.js, `.env` is hidden securely on the server. But React Native apps compile
> into an `.apk` that lives on the user's phone. If you put your MySQL password or
> Firebase Admin Private Key into the **React Native** `.env`, Expo bundles those
> passwords **directly into the app**. Anyone can extract them and delete your data.
>
> **Rule:** Draw a hard line — **Backend `.env`** holds ALL secrets (DB passwords,
> admin keys). **Frontend** only stores safe, public keys (Mapbox Public Token,
> Firebase App ID). In Expo, public keys must be prefixed with `EXPO_PUBLIC_`.

```env
# Server
PORT=5000
NODE_ENV=development

# MySQL (Aiven) — ⛔ BACKEND ONLY, NEVER put in React Native
DB_HOST=mysql-ridemates-xxxx.aiven.io
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=your_secure_password
DB_NAME=ridemates
DB_SSL=true

# Firebase Admin — ⛔ BACKEND ONLY, NEVER put in React Native
FIREBASE_PROJECT_ID=ridemates-xxxxx
# FIREBASE_ADMIN_KEY=path/to/serviceAccountKey.json

# Pricing Constants
DEFAULT_FUEL_RATE=105
PRICE_CAP_MULTIPLIER=1.5
```

### 7.2.1 Frontend `.env` File (Expo — Public Keys Only)

```env
# ✅ SAFE: These are PUBLIC keys designed to be embedded in client apps
# In Expo, all env vars MUST start with EXPO_PUBLIC_ to be accessible

EXPO_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoi...
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ridemates-xxxxx
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.5:5000/api

# ⛔ NEVER put these in the frontend .env:
# DB_PASSWORD, DB_USER, FIREBASE_ADMIN_KEY, any server-side secret
```

**What Goes Where:**

| Secret / Key                | Backend `.env` | Frontend `.env` | Why                                |
| --------------------------- | -------------- | --------------- | ---------------------------------- |
| MySQL password              | ✅ Yes         | ⛔ NEVER        | Full DB access                     |
| Firebase Admin Private Key  | ✅ Yes         | ⛔ NEVER        | Can impersonate any user           |
| Firebase API Key (public)   | Optional       | ✅ Yes          | Designed to be public (scoped)     |
| Mapbox Public Token (`pk.`) | Not needed     | ✅ Yes          | Public by design                   |
| API Base URL                | Not needed     | ✅ Yes          | Just a URL, no secret              |

### 7.3 Frontend Config Constants

> **🚨 "LOCALHOST" NETWORK TRAP — The #1 Student Killer:**
> When you write `axios.get('http://localhost:5000/api/rides')` in React Native,
> it will **NOT** connect to your laptop's Node server. "Localhost" means "this device."
> Your phone thinks localhost is **the phone itself**, not your laptop.
> The request fails instantly with `Network Error`, and you'll waste hours
> thinking your Node code is broken when it's a routing issue.
>
> **The Fix:** NEVER use `localhost` in mobile app code. Use your computer's
> local Wi-Fi IPv4 address (e.g., `192.168.1.5`). Both phone and laptop must be on
> the **same Wi-Fi network**.

**How to find your IPv4 address:**

```bash
# Windows (PowerShell):
ipconfig | Select-String "IPv4"
# Look for: IPv4 Address. . . . . . . . . . . : 192.168.1.5

# Mac/Linux:
ifconfig | grep "inet "
# Look for: inet 192.168.1.5
```

```typescript
// constants/config.ts
export const CONFIG = {
  // ✅ CORRECT: Use your laptop's Wi-Fi IP address
  // ❌ WRONG:   'http://localhost:5000/api' (phone can't reach your laptop)
  // ❌ WRONG:   'http://127.0.0.1:5000/api' (same as localhost)
  API_BASE_URL: __DEV__
    ? 'http://192.168.1.5:5000/api'    // ← Replace with YOUR IPv4 from ipconfig
    : 'https://your-production-url.com/api',

  MAPBOX_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1Ijoi...',

  ALLOWED_EMAIL_DOMAIN: 'lpu.in',

  FUEL_RATES: {
    petrol: 105,
    diesel: 92,
    cng: 80,
    electric: 5,
  },

  PRICE_CAP_MULTIPLIER: 1.5,
  DEFAULT_MILEAGE: 15, // km/l
};
```

> **Viva Tip:** Your IP address changes when you switch Wi-Fi networks.
> Before your presentation, run `ipconfig` again and update this value.
> Both your laptop and demo phone **must be on the same Wi-Fi**.

### 7.4 Local Environment Setup

```bash
# 1. Install Node.js (v18+)
node --version   # Should print v18.x.x or higher

# 2. Install Expo CLI globally
npm install -g expo-cli

# 3. Backend setup
cd Backend
npm init -y
npm install express mysql2 cors dotenv firebase-admin dayjs
npm install --save-dev nodemon

# 4. Frontend setup
cd Frontend
npx expo install axios react-native-maps expo-location dayjs
npm install @react-native-firebase/app @react-native-firebase/auth

# 5. Install Expo Go on your physical phone (from App Store / Play Store)
```

---

## 8. Development Roadmap

> **Rule: Do not skip steps. You cannot build the roof before the foundation.**

### Step 1: Database Setup (Day 1)

**Goal:** Cloud MySQL is live and schema is ready.

- [ ] Create a MySQL instance on Aiven (free tier)
- [ ] Copy the connection URI to `.env`
- [ ] Connect via MySQL Workbench or CLI and verify connection
- [ ] Run all `CREATE TABLE` SQL statements from Section 4
- [ ] Insert seed data for `fuel_rates`
- [ ] Test with a manual `INSERT` into `users` table

**Verification:**

```sql
SELECT * FROM users;
-- Should return the test row
```

---

### Step 2: Backend API (Day 2–3)

**Goal:** All API endpoints work when tested via Postman.

#### Day 2: Foundation

- [ ] Initialize `server.js` with Express
- [ ] Create `config/db.js` with MySQL connection pool
- [ ] Build `authController.js` — register user with domain check
- [ ] Build `authRoutes.js` — wire POST `/api/auth/register`
- [ ] Test with Postman: register a user

#### Day 3: Rides & Bookings

- [ ] Build `utils/priceCalculator.js` — pure pricing function
- [ ] Build `rideController.js` — create ride with auto-calculated prices
- [ ] Build `bookController.js` — book seat with **SQL Transaction + `SELECT ... FOR UPDATE`** row-level locking (see Section 5.3 for full implementation)
- [ ] Wire all routes
- [ ] Test every endpoint with Postman

**`server.js` Template:**

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const bookRoutes = require('./routes/bookRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚗 RideMates server running on port ${PORT}`);
});
```

**`config/db.js` Template:**

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
  });

module.exports = pool;
```

**`utils/priceCalculator.js` Template:**

```javascript
function calculatePrice({ distance_km, fuel_rate, vehicle_mileage, driver_set_price }) {
  const base_cost = (distance_km * fuel_rate) / vehicle_mileage;
  const max_cap = base_cost * parseFloat(process.env.PRICE_CAP_MULTIPLIER || 1.5);
  const capped_price = Math.min(driver_set_price, max_cap);

  return {
    base_price: Math.round(base_cost * 100) / 100,
    max_allowed: Math.round(max_cap * 100) / 100,
    capped_price: Math.round(capped_price * 100) / 100,
  };
}

module.exports = { calculatePrice };
```

---

### Step 3: Auth & Frontend Connection (Day 4)

**Goal:** User can log in with university email and a record is created in MySQL.

- [ ] Initialize Firebase in the React Native app
- [ ] Build `(auth)/login.tsx` — email input + OTP verification
- [ ] Validate email domain on the frontend BEFORE sending to Firebase
- [ ] On successful Firebase login, call `POST /api/auth/register`
- [ ] Build `hooks/useAuth.ts` — manage auth state with `onAuthStateChanged`
- [ ] Redirect authenticated users to `(tabs)` and unauthenticated to `(auth)`

**Authentication Flow Diagram:**

```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌─────────┐
│  User    │────▶│ Frontend │────▶│Firebase │────▶│ Backend │
│  Types   │     │ Validates│     │ Sends   │     │ Saves   │
│  Email   │     │ @lpu.in  │     │ OTP     │     │ to MySQL│
└─────────┘     └──────────┘     └─────────┘     └─────────┘
     │               │                │               │
     │  email input   │  domain check  │  OTP verify   │  INSERT user
     ▼               ▼                ▼               ▼
  "sam@lpu.in"   ✅ Valid        ✅ OTP Match    ✅ Row Created
  "sam@gmail"    ❌ Rejected     (never reached)  (never reached)
```

---

### Step 4: Map & Search (Day 5–7)

**Goal:** User can search for a ride, see the route on a map.

#### Day 5: Mapbox Integration

- [ ] Set up Mapbox token in config
- [ ] Build `services/mapbox.ts` — geocoding + directions API
- [ ] Build `components/MapRoute.tsx` — renders the polyline

#### Day 6: Search Screen

- [ ] Build `(tabs)/search.tsx` — origin/destination inputs
- [ ] Integrate autocomplete for city names
- [ ] Display route on map after search
- [ ] Call `GET /api/rides/search` and show results as `RideCard` list

#### Day 7: Polish & Edge Cases

- [ ] **Handle async location permission states** (`isLoading`, `hasPermission`, `errorMsg`) — map MUST NOT render until permission is granted and coordinates are available (see Section 11 for `useLocation` hook)
- [ ] Handle "no rides found" state
- [ ] Add loading spinners for API calls
- [ ] Add pull-to-refresh
- [ ] Show `EmergencyBadge` on strike-resilient rides

**`services/mapbox.ts` Template:**

```typescript
import { CONFIG } from '../constants/config';

const BASE_URL = 'https://api.mapbox.com';

export async function geocodeCity(cityName: string) {
  const url = `${BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json?access_token=${CONFIG.MAPBOX_TOKEN}&country=IN&limit=5`;
  const response = await fetch(url);
  const data = await response.json();

  return data.features.map((f: any) => ({
    name: f.place_name,
    lat: f.center[1],
    lng: f.center[0],
  }));
}

export async function getRoute(
  originLng: number, originLat: number,
  destLng: number, destLat: number
) {
  const url = `${BASE_URL}/directions/v5/mapbox/driving/${originLng},${originLat};${destLng},${destLat}?geometries=geojson&overview=full&access_token=${CONFIG.MAPBOX_TOKEN}`;
  const response = await fetch(url);
  const data = await response.json();

  const route = data.routes[0];
  return {
    coordinates: route.geometry.coordinates.map(([lng, lat]: number[]) => ({
      latitude: lat,
      longitude: lng,
    })),
    distance_km: route.distance / 1000,
    duration_min: route.duration / 60,
  };
}
```

---

### Step 5: Pricing Logic & Post Ride (Day 8)

**Goal:** Driver can post a ride with capped pricing.

- [ ] Build `(tabs)/post-ride.tsx` — form with all ride fields
- [ ] Build `components/PriceSlider.tsx` — slider with visual price cap
- [ ] Calculate `base_price`, `max_cap`, and `per_seat_price` in real-time
- [ ] Submit ride to `POST /api/rides/create`
- [ ] Show confirmation with price breakdown

**Price Slider UX:**

```
 ₹0 ──────────●───────|──── ₹420
              ₹180    ₹315
             (current) (MAX CAP)

 Base Cost: ₹280  |  You Set: ₹180  |  Per Seat (3): ₹60
```

---

## 9. Pricing Algorithm

### Complete Implementation

```javascript
// Backend: controllers/rideController.js

const { calculatePrice } = require('../utils/priceCalculator');
const pool = require('../config/db');

async function createRide(req, res) {
  try {
    const {
      origin_city, origin_lat, origin_lng,
      destination_city, dest_lat, dest_lng,
      distance_km, departure_time, available_seats,
      vehicle_type, vehicle_mileage, fuel_type,
      driver_set_price, is_emergency_route
    } = req.body;

    // Get fuel rate from DB
    const [rates] = await pool.query(
      'SELECT rate_per_litre FROM fuel_rates WHERE fuel_type = ?',
      [fuel_type || 'petrol']
    );
    const fuel_rate = rates[0]?.rate_per_litre || 105;

    // Calculate capped price
    const pricing = calculatePrice({
      distance_km,
      fuel_rate,
      vehicle_mileage: vehicle_mileage || 15,
      driver_set_price
    });

    // Insert ride
    const [result] = await pool.query(
      `INSERT INTO rides
       (driver_id, origin_city, origin_lat, origin_lng,
        destination_city, dest_lat, dest_lng, distance_km,
        departure_time, available_seats, vehicle_type,
        vehicle_mileage, fuel_type, base_price,
        driver_set_price, capped_price, is_emergency_route)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.userId, origin_city, origin_lat, origin_lng,
        destination_city, dest_lat, dest_lng, distance_km,
        departure_time, available_seats, vehicle_type,
        vehicle_mileage, fuel_type, pricing.base_price,
        driver_set_price, pricing.capped_price, is_emergency_route || false
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Ride created successfully',
      data: {
        ride_id: result.insertId,
        ...pricing,
        per_seat_price: Math.round((pricing.capped_price / available_seats) * 100) / 100
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
```

---

## 10. Authentication Flow

### Android SHA-1 Fingerprint Setup (Required)

> **CRITICAL — Firebase Android Configuration Trap:**
> Pasting Firebase API keys into your app is NOT enough for Android.
> Firebase **silently rejects** all login attempts on Android devices unless
> you register your app's **SHA-1 fingerprint certificate** in the Firebase Console.
> There is no error message — the login just fails with a generic error.

**Step-by-step SHA-1 setup:**

```bash
# Step 1: Generate your debug SHA-1 fingerprint
# Run this in your terminal (Windows):
cd %USERPROFILE%\.android
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android

# On Mac/Linux:
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Look for this line in the output:
#   SHA1: DA:39:A3:EE:5E:6B:4B:0D:32:55:BF:EF:95:60:18:90:AF:D8:07:09
#   ^^^^ Copy this entire value
```

**Step 2: Register SHA-1 in Firebase Console:**

```
1. Go to https://console.firebase.google.com
2. Select your project → ⚙️ Project Settings
3. Scroll to "Your apps" → Select your Android app
4. Click "Add fingerprint"
5. Paste the SHA1 value: DA:39:A3:EE:5E:6B:4B:0D:...
6. Click Save
7. Download the updated google-services.json
8. Place it in your project root (Frontend/)
```

**Step 3: For Expo (EAS Build), also get the EAS SHA-1:**

```bash
# If using EAS Build (production), get the EAS-managed keystore SHA-1:
npx eas credentials
# Select Android → Select your profile → Show SHA-1
# Add this SHA-1 to Firebase Console as well
```

**Common Symptoms When SHA-1 is Missing:**

| What You See                                     | Actual Cause          |
| ------------------------------------------------ | --------------------- |
| `auth/internal-error` with no details             | Missing SHA-1         |
| Login works on web/iOS but fails on Android       | Missing SHA-1         |
| Firebase returns a generic "something went wrong" | Missing SHA-1         |
| `signInWithEmailAndPassword` resolves but `user` is null | Missing SHA-1  |

> **Expo Go Note:** If testing with Expo Go (not a custom dev build), Firebase Auth
> uses the Expo Go app's own SHA-1, which is already registered by Expo. However,
> when you create a **standalone build** (EAS Build / `expo build`), you MUST register
> your own SHA-1.

---

### Complete Firebase Integration

**Frontend (`services/firebase.ts`):**

```typescript
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { CONFIG } from '../constants/config';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'ridemates-xxxxx.firebaseapp.com',
  projectId: 'ridemates-xxxxx',
  storageBucket: 'ridemates-xxxxx.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export function isAllowedDomain(email: string): boolean {
  return email.endsWith(`@${CONFIG.ALLOWED_EMAIL_DOMAIN}`);
}

export async function registerWithEmail(email: string, password: string) {
  if (!isAllowedDomain(email)) {
    throw new Error(`Only @${CONFIG.ALLOWED_EMAIL_DOMAIN} emails are allowed`);
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user);
  return userCredential.user;
}

export async function loginWithEmail(email: string, password: string) {
  if (!isAllowedDomain(email)) {
    throw new Error(`Only @${CONFIG.ALLOWED_EMAIL_DOMAIN} emails are allowed`);
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * ⚠️ EXPIRING TOKEN TRAP:
 * Firebase ID Tokens expire every 60 minutes. If you store the token
 * in a variable or AsyncStorage, it will go stale. NEVER cache it.
 *
 * Instead, call getIdToken() RIGHT BEFORE every API request.
 * Firebase SDK automatically checks if the token is expired and
 * silently refreshes it — you get a valid token every time.
 */
export async function getFreshToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  // false = use cached token if still valid; true = force refresh
  return await user.getIdToken(false);
}
```

**Frontend API Service with Auto-Fresh Tokens (`services/api.ts`):**

> **Key Insight:** Do NOT store the Firebase token in a variable, AsyncStorage, or
> React state. Call `getFreshToken()` at the **moment of each request**.
> Firebase handles the refresh logic internally.

```typescript
// services/api.ts — Axios with auto-fresh Firebase tokens
import axios from 'axios';
import { Alert } from 'react-native';
import { CONFIG } from '../constants/config';
import { getFreshToken } from './firebase';

const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 10000,
});

// ✅ Request interceptor: attach a FRESH token to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await getFreshToken();
    config.headers.Authorization = `Bearer ${token}`;
  } catch (error) {
    // User is not logged in — request will proceed without token
    // Backend will reject it with 401
  }
  return config;
});

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    Alert.alert('Error', message);
    return Promise.reject(error);
  }
);

export default api;
```

**Why This Matters — The 60-Minute Failure:**

```
❌ WITHOUT getFreshToken() (Broken):

  8:00 AM — User logs in → token stored in variable → works fine
  8:30 AM — User books a ride → same stored token → works fine
  9:01 AM — User tries to search → same stored token → EXPIRED!
  Backend: 401 Unauthorized → "Invalid or expired token"
  User sees: "Something went wrong" with no way to fix it

✅ WITH getFreshToken() (Fixed):

  8:00 AM — User logs in → token generated
  8:30 AM — getFreshToken() → token still valid → reuses it
  9:01 AM — getFreshToken() → detects expiry → silently refreshes → new token!
  Backend: 200 OK → works perfectly
  User notices: absolutely nothing (seamless)
```

---

**Backend Middleware (`middleware/authMiddleware.js`):**

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin (do this once in server.js)
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No authentication token provided'
    });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.firebaseUid = decodedToken.uid;
    req.userEmail = decodedToken.email;

    // Get internal user ID from MySQL
    const pool = require('../config/db');
    const [users] = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = ?',
      [decodedToken.uid]
    );

    if (users.length > 0) {
      req.userId = users[0].id;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

module.exports = verifyFirebaseToken;
```

---

## 11. Map & Routing Flow

### Visual Flow

```
User Types "Phagwara"
        │
        ▼
┌────────────────────┐
│ Mapbox Geocoding   │──▶ Returns: { lat: 31.224, lng: 75.770 }
│ API                │
└────────────────────┘
        │
        ▼
User Types "Jalandhar"
        │
        ▼
┌────────────────────┐
│ Mapbox Geocoding   │──▶ Returns: { lat: 31.326, lng: 75.576 }
│ API                │
└────────────────────┘
        │
        ▼
┌────────────────────┐
│ Mapbox Directions  │──▶ Returns: GeoJSON polyline + distance (22.5 km)
│ API                │
└────────────────────┘
        │
        ▼
┌────────────────────┐
│ react-native-maps  │──▶ Renders: <Polyline> on <MapView>
│ MapView            │
└────────────────────┘
```

### Async Location Permission Hook (Critical)

> **WARNING — App Crash Prevention:**
> Mobile GPS access is asynchronous. The user must tap "Allow" on a system dialog
> before `expo-location` can return coordinates. If your map component tries to
> render with `null` coordinates (before permission is granted), **the app will crash**.
>
> You MUST manage three async states: `isLoading`, `hasPermission`, and `errorMsg`.
> The map should only render AFTER permission is granted AND coordinates are available.

**`hooks/useLocation.ts` — Safe Location Hook:**

```typescript
// hooks/useLocation.ts
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  isLoading: boolean;
  hasPermission: boolean | null;  // null = not yet asked
  errorMsg: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    isLoading: true,          // Start as loading
    hasPermission: null,      // Permission not yet requested
    errorMsg: null,
  });

  useEffect(() => {
    let isMounted = true;     // Prevent state updates on unmounted component

    (async () => {
      // Step 1: Request permission (shows system dialog)
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (!isMounted) return;

      if (status !== 'granted') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasPermission: false,
          errorMsg: 'Location permission denied. Please enable it in Settings.',
        }));
        return;
      }

      // Step 2: Get current position (only AFTER permission is granted)
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) return;

        setState({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          isLoading: false,
          hasPermission: true,
          errorMsg: null,
        });
      } catch (error) {
        if (!isMounted) return;

        setState(prev => ({
          ...prev,
          isLoading: false,
          hasPermission: true,
          errorMsg: 'Failed to get location. Please try again.',
        }));
      }
    })();

    // Cleanup: prevent memory leaks
    return () => { isMounted = false; };
  }, []);

  return state;
}
```

**Using the Hook in a Screen (Safe Pattern):**

```tsx
// app/(tabs)/search.tsx
import { useLocation } from '../../hooks/useLocation';
import MapRoute from '../../components/MapRoute';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function SearchScreen() {
  const { latitude, longitude, isLoading, hasPermission, errorMsg } = useLocation();

  // ── State 1: Still loading (waiting for user to tap Allow/Deny) ──
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text>Getting your location...</Text>
      </View>
    );
  }

  // ── State 2: Permission denied ──
  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>📍 {errorMsg}</Text>
        <Text>Go to Settings → RideMates → Location → Allow</Text>
      </View>
    );
  }

  // ── State 3: Permission granted but location fetch failed ──
  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{errorMsg}</Text>
      </View>
    );
  }

  // ── State 4: Everything ready — SAFE to render the map ──
  return (
    <View style={styles.container}>
      {latitude && longitude && (
        <MapRoute
          origin={{ latitude, longitude }}
          destination={{ latitude: 31.326, longitude: 75.576 }}  // example
          routeCoordinates={[]}  // populated after search
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  error: { color: 'red', fontSize: 16, marginBottom: 10, textAlign: 'center' },
});
```

**Why This Matters — The Crash Sequence:**

```
❌ WITHOUT state management:

  App mounts → useLocation() starts async request
  Map renders IMMEDIATELY with latitude=null, longitude=null
  MapView tries to set region with null values → 💥 APP CRASH

✅ WITH state management:

  App mounts → useLocation() starts → isLoading=true → shows spinner
  User taps "Allow" → permission granted → GPS fetched
  isLoading=false, latitude=31.22, longitude=75.77
  Map renders with valid coordinates → ✅ works perfectly
```

---

### MapRoute Component Template

```tsx
// components/MapRoute.tsx
import React from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface MapRouteProps {
  origin: Coordinate;
  destination: Coordinate;
  routeCoordinates: Coordinate[];
}

export default function MapRoute({ origin, destination, routeCoordinates }: MapRouteProps) {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: (origin.latitude + destination.latitude) / 2,
          longitude: (origin.longitude + destination.longitude) / 2,
          latitudeDelta: Math.abs(origin.latitude - destination.latitude) * 1.5,
          longitudeDelta: Math.abs(origin.longitude - destination.longitude) * 1.5,
        }}
      >
        <Marker coordinate={origin} title="Pickup" pinColor="green" />
        <Marker coordinate={destination} title="Drop-off" pinColor="red" />
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#4A90D9"
          strokeWidth={4}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
});
```

---

## 12. Strike Resilience Mode

### How It Works

```
Normal Mode                           Strike Mode (Emergency)
─────────────                         ──────────────────────
Highway NH-1                          Village Link Roads
┌─────────────────────┐               ┌─────────────────────┐
│ Phagwara ──NH1──▶   │               │ Phagwara ──Village──▶│
│          Jalandhar  │               │ Roads ──▶ Jalandhar │
│                     │               │                     │
│ 🟢 Normal Route    │               │ ⚠️ Alternate Route  │
│ 22.5 km | 30 min   │               │ 35 km | 55 min      │
└─────────────────────┘               └─────────────────────┘
```

### Implementation

**Driver Toggle (PostRideScreen):**

```tsx
<View style={styles.emergencyToggle}>
  <Text style={styles.label}>⚠️ Strike Resilience Mode</Text>
  <Text style={styles.hint}>
    Enable if you're taking alternate village roads to bypass highway blockages
  </Text>
  <Switch
    value={isEmergencyRoute}
    onValueChange={setIsEmergencyRoute}
    trackColor={{ true: '#FF6B00', false: '#ccc' }}
  />
</View>
```

**Passenger View (RideCard):**

```tsx
{ride.is_emergency_route && (
  <View style={styles.emergencyBadge}>
    <Text style={styles.badgeText}>⚠️ ALTERNATE ROUTE</Text>
    <Text style={styles.badgeSubtext}>Driver is bypassing highway via village roads</Text>
  </View>
)}
```

**Search Filter:**

```sql
-- Backend: GET /api/rides/search with emergency filter
SELECT * FROM rides
WHERE origin_city = ? AND destination_city = ?
  AND status = 'active'
  AND departure_time > NOW()
  AND (? IS NULL OR is_emergency_route = ?)
ORDER BY departure_time ASC;
```

---

## 13. Error Handling Strategy

### The "Silent Server Crash" Trap (Unhandled Promises)

> **CRITICAL — Your Server Will Die During Viva:**
> You are using `async/await` to talk to MySQL. If an `await` call fails and you
> forgot to wrap it in `try/catch`, Node.js triggers an **"Unhandled Promise Rejection"**.
> This **instantly crashes and shuts down your entire backend server**.
> Every subsequent click in your app will fail silently with `Network Error`.
>
> **The Rule:** Every single controller function MUST be wrapped in `try/catch`.
> No exceptions. No shortcuts.

**The Mandatory Pattern (Every Controller):**

```javascript
// ✅ CORRECT — Server survives any error
async function getRides(req, res) {
  try {
    // Put ALL your database logic here
    const [rides] = await pool.query('SELECT * FROM rides WHERE status = ?', ['active']);
    res.json({ success: true, data: rides });
  } catch (error) {
    // If ANYTHING fails, the server survives and sends this:
    console.error('getRides error:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: 'INTERNAL_ERROR' });
  }
}

// ❌ WRONG — One bad query kills the server
async function getRides(req, res) {
  // If this query fails → Unhandled Promise Rejection → SERVER CRASH
  const [rides] = await pool.query('SELECT * FROM rides');
  res.json({ success: true, data: rides });
}
```

**Global Safety Net (Add to `server.js`):**

```javascript
// server.js — Add these AFTER all your routes

// Catch any unhandled promise rejections (last resort)
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Promise Rejection:', reason);
  // Server stays alive instead of crashing
});

// Catch any uncaught exceptions (last resort)
process.on('uncaughtException', (error) => {
  console.error('⚠️ Uncaught Exception:', error);
  // Server stays alive instead of crashing
});

// Express global error handler middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});
```

---

### Backend Error Responses

All API responses follow a consistent format:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... } | null,
  "error": "TECHNICAL_ERROR_CODE"  // Only on failure
}
```

### Error Codes Reference

| HTTP Code | Error Code              | Scenario                                    |
| --------- | ----------------------- | ------------------------------------------- |
| 400       | `INVALID_EMAIL_DOMAIN`  | Email is not `@lpu.in`                      |
| 400       | `MISSING_FIELDS`        | Required request body fields are missing    |
| 400       | `INSUFFICIENT_SEATS`    | Requested seats > available seats           |
| 400       | `PRICE_EXCEEDS_CAP`     | Driver price > max cap (auto-corrected)     |
| 401       | `INVALID_TOKEN`         | Firebase token is invalid or expired        |
| 401       | `NO_TOKEN`              | Authorization header is missing             |
| 404       | `RIDE_NOT_FOUND`        | Ride ID does not exist                      |
| 404       | `USER_NOT_FOUND`        | Firebase UID not in MySQL                   |
| 409       | `ALREADY_BOOKED`        | Passenger already booked this ride          |
| 409       | `DUPLICATE_EMAIL`       | Email already registered in MySQL           |
| 500       | `DB_ERROR`              | MySQL query failed                          |
| 500       | `INTERNAL_ERROR`        | Unexpected server error                     |

### Frontend Error Display

> **Note:** The full API service with auto-fresh Firebase tokens is in
> [Section 10 — Authentication Flow](#10-authentication-flow). The Axios interceptor
> there handles both token refresh and error display. Refer to that implementation
> as the canonical `services/api.ts`.

---

## 14. Common Traps & Solutions

This section consolidates the 6 most dangerous pitfalls that crash student projects during Viva.

### 14.1 The "Timezone" Trap (MySQL vs. JavaScript)

**The Assumption:** If a driver selects "8:00 AM" in the app, it saves as "8:00 AM" in MySQL.

**The Reality:** Your phone is in IST (UTC+5:30). Your Aiven MySQL server runs in UTC. If you send `2026-03-01 08:00:00` as a plain string, the database may shift it by −5.5 hours. When a passenger downloads the ride, it shows up as **2:30 AM**!

**The Fix — Use `dayjs` (already installed):**

```typescript
// Frontend: When SENDING a date to the backend
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Driver picks: March 1, 2026 at 8:30 AM IST
const userSelectedDate = new Date(2026, 2, 1, 8, 30); // JS month is 0-indexed

// ✅ CORRECT: Convert to ISO string (UTC) before sending
const isoString = dayjs(userSelectedDate).toISOString();
// Result: "2026-03-01T03:00:00.000Z" (8:30 IST = 3:00 UTC)

await api.post('/rides/create', {
  ...rideData,
  departure_time: isoString,  // ← Always send ISO strings
});
```

```typescript
// Frontend: When DISPLAYING a date from the backend
const rideFromDB = await api.get('/rides/42');

// ✅ dayjs automatically converts UTC back to the phone's local timezone
const displayTime = dayjs(rideFromDB.departure_time).format('MMM D, YYYY h:mm A');
// On an IST phone: "Mar 1, 2026 8:30 AM" ← Correct!
```

```javascript
// Backend: Store as-is. MySQL DATETIME stores the UTC value.
// No conversion needed on the server — it just passes the ISO string through.
const { departure_time } = req.body; // "2026-03-01T03:00:00.000Z"
// Insert directly into MySQL — it stores the UTC timestamp
```

**The Flow:**

```
Driver picks 8:30 AM IST
    │
    ▼
dayjs converts → "2026-03-01T03:00:00.000Z" (UTC)
    │
    ▼
Backend stores in MySQL as UTC
    │
    ▼
Passenger fetches → dayjs converts UTC → phone's timezone
    │
    ▼
Displays "8:30 AM" on IST phone ✅
Displays "3:00 AM" on UTC phone ✅ (correct for their timezone)
```

---

### 14.2 The "Expiring Token" Trap (Firebase + Node.js)

**The Assumption:** Once a user logs into Firebase, they stay authenticated forever.

**The Reality:** Firebase ID Tokens expire **every 60 minutes**. If a student opens the app, pockets the phone, and tries to book a ride an hour later, the backend rejects with `401 Unauthorized`.

**The Fix:** Never store the token. Call `getIdToken()` at the moment of each request.

See **[Section 10 — Authentication Flow](#10-authentication-flow)** for the complete `getFreshToken()` implementation and the Axios request interceptor that auto-attaches fresh tokens.

---

### 14.3 The "Ghost Seat" Trap (React Navigation)

**The Assumption:** Pass the entire ride object (driver name, coordinates, `available_seats`) between screens.

**The Reality:** React Navigation has performance issues with large objects passed between screens (memory leaks, lag). Worse: if you pass `available_seats = 3` and the user stares at the screen for 5 minutes, someone else may book a seat in the background. Your screen still says "3 seats" but the database has 2. This creates a **"Ghost Seat"** — the user tries to book a seat that no longer exists.

**The Fix — Pass only the `ride_id`, then fetch fresh data:**

```typescript
// ❌ WRONG: Passing the full ride object (stale data risk)
navigation.navigate('BookRide', {
  ride: {
    id: 42,
    driver_name: 'Sameer',
    available_seats: 3,     // ← This might be outdated!
    capped_price: 180,
    origin_city: 'Phagwara',
    // ...20 more fields
  }
});

// ✅ CORRECT: Pass only the ID (lightweight + always fresh)
navigation.navigate('BookRide', { rideId: 42 });
```

```tsx
// BookRideScreen.tsx — Fetch fresh data when screen opens
import { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import api from '../services/api';

export default function BookRideScreen() {
  const route = useRoute();
  const { rideId } = route.params as { rideId: number };
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fresh fetch — seat count is 100% accurate at this moment
    async function loadRide() {
      try {
        const data = await api.get(`/rides/${rideId}`);
        setRide(data);
      } catch (error) {
        Alert.alert('Error', 'Ride not found or no longer available');
      } finally {
        setLoading(false);
      }
    }
    loadRide();
  }, [rideId]);

  if (loading) return <ActivityIndicator />;
  if (!ride) return <Text>Ride not available</Text>;

  return (
    <View>
      <Text>Seats Available: {ride.available_seats}</Text> {/* ← Always accurate */}
      <CustomButton title="Book Now" onPress={() => bookSeat(rideId)} />
    </View>
  );
}
```

**Why This Matters:**

```
❌ Ghost Seat scenario:
  9:00 AM — User opens ride details (passed available_seats = 3)
  9:03 AM — Another user books 2 seats (DB now has 1 seat)
  9:05 AM — User clicks "Book 2 seats" → Backend: "Only 1 seat available!" → Confusion

✅ Fresh fetch scenario:
  9:00 AM — User navigates with rideId = 42
  9:00 AM — Screen fetches GET /api/rides/42 → available_seats = 3
  9:03 AM — Another user books 2 seats
  9:05 AM — User clicks "Book" → bookSeat triggers another fresh check → accurate
```

---

### 14.4 The "Localhost" Network Trap

See **[Section 7.3 — Frontend Config Constants](#73-frontend-config-constants)** for the complete explanation and fix.

**Quick reminder:** Replace `localhost` with your laptop's IPv4 address. Run `ipconfig` (Windows) to find it. Both devices must be on the same Wi-Fi.

---

### 14.5 The "Silent Server Crash" Trap

See **[Section 13 — Error Handling Strategy](#13-error-handling-strategy)** for the `try/catch` pattern and the global safety net code for `server.js`.

**Quick reminder:** Every `async` controller function MUST have a `try/catch`. Add `process.on('unhandledRejection')` to `server.js` as a safety net.

---

### 14.6 The "Leaked Secrets" Expo Trap

See **[Section 7.2 — Backend `.env` File](#72-backend-env-file)** for the complete breakdown.

**Quick reminder:** MySQL passwords and Firebase Admin keys go in **backend `.env` ONLY**. Frontend `.env` uses `EXPO_PUBLIC_` prefix and only holds public keys (Mapbox token, Firebase App ID).

---

### Trap Quick-Reference Card

```
╔════════════════════════════════════════════════════════════════════╗
║                    6 TRAPS THAT KILL STUDENT PROJECTS              ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  1. TIMEZONE     → Use dayjs().toISOString() before sending dates  ║
║  2. TOKEN EXPIRY → Call getIdToken(false) before every API request ║
║  3. GHOST SEATS  → Pass only rideId, fetch fresh data on screen   ║
║  4. LOCALHOST     → Use 192.168.x.x (ipconfig), same Wi-Fi        ║
║  5. SERVER CRASH → Wrap EVERY async controller in try/catch       ║
║  6. LEAKED KEYS  → Backend .env = secrets, Frontend = public only ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## 15. Deployment Checklist

### Pre-Deployment Verification

- [ ] All `.env` secrets are set (never committed to Git)
- [ ] **No secrets leaked in frontend `.env`** — only `EXPO_PUBLIC_` keys (Section 14.6)
- [ ] MySQL tables are created and seeded
- [ ] **MySQL timezone** verified — dates stored/retrieved as UTC ISO strings (Section 14.1)
- [ ] All API endpoints pass Postman tests
- [ ] **Every controller wrapped in try/catch** — no unhandled promise rejections (Section 14.5)
- [ ] **`process.on('unhandledRejection')` added** to `server.js` as safety net
- [ ] Firebase Auth is configured with correct domain
- [ ] **Android SHA-1 fingerprint** is registered in Firebase Console (Section 10)
- [ ] **EAS Build SHA-1** is also registered if using `eas build` for production
- [ ] **Token auto-refresh** working — `getFreshToken()` used in Axios interceptor (Section 14.2)
- [ ] Mapbox token has correct scopes
- [ ] **API_BASE_URL** set to laptop IPv4 (not `localhost`) for Viva demo (Section 14.4)
- [ ] Both laptop and demo phone on **same Wi-Fi network**
- [ ] CORS is configured for production domain
- [ ] **Navigation passes only IDs** between screens, not full objects (Section 14.3)
- [ ] Error handling covers all edge cases

### `.gitignore` (Both projects)

```gitignore
# Dependencies
node_modules/

# Environment
.env
.env.local

# Expo
.expo/
dist/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Build
*.tsbuildinfo
```

### Viva Demo Flow

| Step | Action                              | What to Show                           |
| ---- | ----------------------------------- | -------------------------------------- |
| 1    | Open the app                        | Login screen with `@lpu.in` input     |
| 2    | Try `@gmail.com`                    | Error: "Only university emails..."    |
| 3    | Login with `@lpu.in`               | OTP flow → Dashboard                  |
| 4    | Post a ride                         | Fill form → Slider → Price cap in action |
| 5    | Toggle emergency route              | Show the orange badge                  |
| 6    | Search for a ride                   | Map with polyline route                |
| 7    | Book a seat                         | Seat count decrements                  |
| 8    | Show Postman                        | API requests & responses               |
| 9    | Show MySQL Workbench                | Data in tables                         |

---

## Quick Reference Card

```
╔══════════════════════════════════════════════════════════════╗
║                   RIDEMATES QUICK REFERENCE                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Start Backend:    cd Backend && npm run dev                 ║
║  Start Frontend:   cd Frontend && npx expo start             ║
║                                                              ║
║  API Base:         http://localhost:5000/api                 ║
║  Health Check:     GET /api/health                           ║
║                                                              ║
║  Register User:    POST /api/auth/register                   ║
║  Create Ride:      POST /api/rides/create                    ║
║  Search Rides:     GET  /api/rides/search?origin=X&dest=Y    ║
║  Book Seat:        POST /api/bookings/new                    ║
║                                                              ║
║  Price Formula:    base = (dist × fuel_rate) / mileage       ║
║  Price Cap:        max  = base × 1.5                         ║
║  Per Seat:         seat = min(driver_price, max) / passengers║
║                                                              ║
║  Allowed Email:    *@lpu.in ONLY                             ║
║  Emergency Mode:   is_emergency_route = true                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

*Last Updated: February 27, 2026*
*Version: 1.1.0 — Added 6 Common Traps & Solutions*
*Project: RideMates — University Peer-to-Peer Commute Network*
