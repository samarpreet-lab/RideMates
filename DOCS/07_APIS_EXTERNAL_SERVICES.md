# 🌐 APIs & External Services — How We Talk to the Outside World

## What is an API?

An API (Application Programming Interface) is a way for one software to talk to another. In our project, the frontend talks to our backend API, and our backend talks to several external APIs. Think of APIs like menus at a restaurant — you don't go into the kitchen yourself. You look at the menu, place your order, and the kitchen sends back your food.

**Every API call follows this pattern**: You send a **request** (the order) and get back a **response** (the food). The request specifies what you want, and the response gives you the result.

---

## 1. OSRM — Calculating Driving Distance

### What It Is and Why We Need It

OSRM (Open Source Routing Machine) is a free routing engine that calculates the **actual driving distance** between two GPS points using real road data. This is NOT a straight-line distance — it follows roads, highways, and turns.

**Why we can't skip this**: The driving distance directly determines the ride price. If we used straight-line distance, a trip through winding mountain roads would seem short (maybe 10 km as the crow flies) when the actual drive is 35 km. The price would be too low.

**Why the backend calls it (not the frontend)**: Security. If the frontend calculated distance, a malicious user could intercept the request and change `distance_km: 0` to get a free ride. By having the BACKEND call OSRM directly, the user never touches the distance value. They only send GPS coordinates, and the backend calculates everything.

### How It Works — Step by Step

1. A driver posts a ride with origin coordinates (31.2536, 75.7037) and destination coordinates (31.3260, 75.5762).

2. The backend constructs an OSRM URL. **Important quirk**: OSRM expects coordinates in `longitude,latitude` order (reversed from the usual `latitude,longitude`):
   ```
   https://router.project-osrm.org/route/v1/driving/75.7037,31.2536;75.5762,31.3260?overview=false
   ```

3. The backend calls this URL with a 10-second timeout (to prevent hanging if OSRM is slow).

4. OSRM responds with the driving distance in **meters** (e.g., 15,320 meters). We divide by 1000 to get kilometres (15.32 km).

5. If OSRM is down or returns an error, we tell the user "Route calculation service temporarily unavailable" instead of letting them post a ride with no distance.

### What OSRM's Response Looks Like

```json
{
  "routes": [{
    "distance": 15320,    // 15,320 meters = 15.32 km of actual road
    "duration": 1620      // 1,620 seconds = 27 minutes driving time
  }],
  "code": "Ok"
}
```

---

## 2. Photon — Searching for Locations

### What It Is and Why We Need It

When a user types "Jalandhar" in the search box, we need to convert that text into GPS coordinates (31.3260, 75.5762). This process is called **geocoding** — converting a place name into coordinates.

Photon is a **free geocoding API** built on OpenStreetMap data (the Wikipedia of maps — community-maintained, open-source).

### How It Works — Step by Step

1. User starts typing "Jal" in the location search box.

2. Our custom hook (`usePhotonSearch`) waits 450 milliseconds after the last keystroke (debouncing). This prevents calling the API for every single letter typed.

3. After the 450ms silence, it constructs a Photon URL:
   ```
   https://photon.komoot.io/api/?q=Jalandhar&lat=31.2536&lon=75.7037&limit=8
   ```
   The `lat` and `lon` parameters bias results toward LPU — so "Phagwara" near LPU ranks higher than a "Phagwara" on the other side of India.

4. Photon responds with a list of matching places, each with a name, state, country, type (city/town/village), and GPS coordinates.

5. We filter the results to only show places in the Punjab region (latitude between 29.5-32.6, longitude between 73.8-77.0). Without this filter, typing "Delhi" might show results from Delhi, India AND Delhi, USA.

6. **Critical coordinate swap**: Photon returns coordinates as `[longitude, latitude]` (like most GeoJSON), but our database and the rest of our app uses `[latitude, longitude]`. We swap them when processing results to avoid placing markers in the wrong location.

### Why We Also Check Local Hubs

Before calling Photon, we check a local list of popular locations (like "LPU Gate 1", "Phagwara Bus Stand", "Jalandhar Railway Station"). If the user's query matches a local hub, we show it immediately without any API call. This is:
- **Faster**: No network latency
- **Free**: No API usage
- **More relevant**: These are the most commonly used locations

---

## 3. LocationIQ — The Backup Geocoding Service

### What It Is

LocationIQ is a **commercial geocoding API** (with a free tier of 5,000 requests/day). We use it as an alternative to Photon — sometimes one API has better results than the other for certain locations.

### How It Differs from Photon

| Feature | Photon | LocationIQ |
|---------|--------|-----------|
| Cost | Completely free | Free tier (5,000/day) |
| Data source | OpenStreetMap | OpenStreetMap + others |
| API key needed? | No | Yes |
| Result quality | Good for cities | Better for specific addresses |
| Viewbox filtering | Manual (we filter ourselves) | Built-in (pass viewbox parameter) |

### Extra Feature: Reverse Geocoding

LocationIQ also supports **reverse geocoding** — converting coordinates BACK to a human-readable address. If we have GPS coordinates (31.2536, 75.7037), we can ask LocationIQ "what place is at these coordinates?" and it responds with "LPU, Phagwara, Punjab, India."

We use this when the user's current GPS location is detected — instead of showing raw coordinates, we show a readable address.

---

## 4. Gmail SMTP — Sending OTP Emails

### What It Is

SMTP (Simple Mail Transfer Protocol) is the standard protocol for sending emails. When you send an email from Gmail, your email client talks to Gmail's SMTP server, which routes the email to the recipient's server. We use this same system to send OTP verification emails programmatically.

### How It Works — The Email Journey

1. Our backend creates a "transporter" — a connection to Gmail's SMTP server at `smtp.gmail.com` on port 587.

2. It authenticates using an **App Password** (not a regular Gmail password). App Passwords are special 16-character passwords generated in Google's security settings specifically for third-party apps. This is required because Google blocks regular password login for apps (for security).

3. When a user requests an OTP, we create an email object specifying: sender ("RideMates"), recipient (user's email), subject ("Your RideMates Verification Code"), and HTML body (a styled email with the 6-digit code).

4. We call `transporter.sendMail()` which sends the email through Gmail's SMTP server.

5. **Error recovery**: If the email fails to send (Gmail is down, network issue, etc.), we DELETE the OTP hash from the database. Why? Because the OTP record counts toward the rate limit. If the email failed but the record stayed, the user would be unfairly rate-limited without ever receiving a code.

### SMTP Verification at Startup

When the server starts, we immediately test the SMTP connection with `transporter.verify()`. This tells us right away if there's a configuration problem (wrong password, network block, etc.). If it fails, we log a warning — the server still runs, but email sending will fail until the issue is fixed.

---

## 5. Aiven — Cloud Database Hosting

### What It Is

Aiven is a managed cloud database provider. Instead of running MySQL on our own laptop (which would only work when the laptop is on), Aiven runs MySQL on servers in a data center that's always on, always backed up, and always accessible.

### Why Cloud Instead of Local?

- **Always available**: The database runs 24/7 on Aiven's servers, not on our laptop
- **Accessible from anywhere**: The backend (wherever it's deployed) can reach the database
- **Managed backups**: Aiven automatically backs up the data
- **SSL encryption**: All connections are encrypted in transit
- **No setup hassle**: We don't need to install MySQL locally, manage updates, or worry about disk space

### SSL Connection

The connection between our backend and Aiven's MySQL is encrypted using SSL. We have a **CA certificate** file (`ca-certificate.pem`) — this is like an ID card that proves Aiven's server is who it claims to be. When our backend connects, it checks this certificate to make sure it's not talking to an imposter (man-in-the-middle attack prevention).

---

## 6. Firebase — Google's App Platform

Firebase is Google's mobile development platform. In our project, it's initialized on the frontend for potential Google Sign-In integration. The configuration (API key, project ID, etc.) is loaded from environment variables through `expo-constants`.

While we currently use email OTP for authentication, Firebase provides the infrastructure to add Google/Apple sign-in as an alternative in the future.

---

## 7. Render.com — Where the Backend Lives

### What It Is

Render is a cloud hosting platform where our Node.js backend runs. When we "deploy" the app, Render takes our code from GitHub, installs dependencies, and runs `node server.js` on their servers.

### How the Frontend Knows Where the Backend Is

The frontend has a configuration file (`constants/config.ts`) that switches between development and production URLs:

- **During development** (on our laptop): The backend is at `http://192.168.1.15:5000/api` (local network IP)
- **In production** (deployed): The backend is at `https://ridemates-api.onrender.com/api`

The frontend checks `process.env.NODE_ENV` and uses the appropriate URL. This means the same code works for both local testing and production deployment without any manual changes.

---

## Complete API Endpoint Reference

Here's every URL the frontend can call, organized by category:

### Authentication (Public — No Login Required)

| What You Send | URL | What Happens |
|--------------|-----|-------------|
| POST with email and purpose | `/api/auth/send-otp` | Generates OTP, hashes it, sends email. Returns success/failure. |
| POST with email and OTP code | `/api/auth/verify-otp` | Verifies OTP hash match. If valid, returns JWT token + user profile. |

### Profile (Protected — JWT Required)

| What You Send | URL | What Happens |
|--------------|-----|-------------|
| GET request | `/api/auth/profile` | Returns the logged-in user's full profile (name, email, phone, trust score, streak). |
| PUT with updated fields | `/api/auth/profile` | Updates the user's name, phone, gender, or photo. Only changes fields that are provided. |

### Rides (Protected)

| What You Send | URL | What Happens |
|--------------|-----|-------------|
| POST with ride details | `/api/rides/create` | Calculates distance (OSRM), calculates fair price, creates the ride. Returns ride ID + pricing breakdown. |
| GET with origin & destination | `/api/rides/search` | Finds active rides with available seats between two cities. Returns array of matching rides. |
| GET request | `/api/rides/my` | Returns two arrays: rides you posted as driver + rides you booked as passenger (last 30 days). |
| GET with ride ID | `/api/rides/:id` | Returns full ride details. If you're the driver: includes passenger list. If you're a passenger: includes your booking. |
| PUT with updated fields | `/api/rides/:id` | Updates ride details (driver only). Uses transaction with row lock. Re-calculates price if needed. |
| DELETE request | `/api/rides/:id` | Cancels the ride. Applies penalty if confirmed passengers exist. Cancels all bookings. |
| PUT request | `/api/rides/:id/complete` | Marks ride as completed. Cannot complete before departure time. Starts the 12-hour report window. |

### Bookings (Protected)

| What You Send | URL | What Happens |
|--------------|-----|-------------|
| POST with ride_id & seats | `/api/bookings/new` | Books seat(s) using transaction + row lock. Calculates price. Returns booking details. |
| GET request | `/api/bookings/my` | Returns all your bookings with ride and driver details. |
| PUT request | `/api/bookings/:id/cancel` | Cancels booking. Applies time-based penalty for confirmed bookings. Restores seats. |
| PUT request | `/api/bookings/:id/accept` | Driver accepts a pending booking. Decrements available seats. |
| PUT request | `/api/bookings/:id/reject` | Driver rejects a pending booking. No seat changes needed. |

### Reports (Protected)

| What You Send | URL | What Happens |
|--------------|-----|-------------|
| POST with ride_id, user_id, reason | `/api/reports/new` | Files report. Runs pattern-match algorithm. Applies trust penalty based on report history. |
| GET request | `/api/reports/my` | Returns all reports you've filed. |

### Health Check (Public)

| What You Send | URL | What Happens |
|--------------|-----|-------------|
| GET request | `/api/health` | Returns `{ status: 'OK' }`. Used to check if the server is running. |
