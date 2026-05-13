# 📋 RideMates — Project Overview & Architecture

## What is RideMates?

RideMates is a **peer-to-peer university commute network** mobile app built for LPU (Lovely Professional University). Think of it like a small-scale Uber, but only for verified university members, and drivers are **not professionals** — they are fellow students or faculty who happen to be driving the same route and want to split fuel costs.

**The core idea is simple**: A student driving from Phagwara to Jalandhar posts a ride saying "I'm leaving at 5 PM, I have 3 seats free." Another student who also needs to go to Jalandhar searches for rides, finds this one, and books a seat. The passenger pays a fair share of the fuel cost — not a taxi fare.

**Why not just use Uber or Ola?** Because those are commercial services with professional drivers who charge for profit. RideMates is a **cost-sharing** platform. The driver doesn't make money — they just recover some fuel cost. And because it's restricted to university emails (@lpu.in), everyone is a verified member of the LPU community, which adds a layer of trust and safety.

---

## Tech Stack — What Does Each Technology Do and Why Did We Pick It?

| Layer | Technology | What It Does in Simple Terms | Why We Chose It |
|-------|-----------|------------------------------|-----------------|
| **Frontend** | React Native + Expo | This builds the mobile app that runs on both Android and iOS phones. Instead of building two separate apps (one for Android, one for iOS), React Native lets us write one codebase that works everywhere. Expo makes it even simpler by giving us pre-built tools (camera, location, secure storage). | One codebase for both platforms saves time. Expo removes complexity. |
| **Backend** | Node.js + Express.js | This is the "brain" of the app. It runs on a server and handles all the logic: checking passwords (OTPs), creating rides, processing bookings, calculating prices. It's like a waiter in a restaurant — the frontend (customer) places orders, and the backend (waiter) goes to the kitchen (database) and brings back the food (data). | JavaScript everywhere (frontend and backend use the same language). Express is lightweight and fast. |
| **Database** | MySQL (Aiven Cloud) | This is where all the data is permanently stored — user accounts, ride listings, bookings, reports. Think of it as the filing cabinet of the app. When the server restarts, the data is still there. We host it on Aiven Cloud so it's accessible from anywhere, not just our laptop. | Relational databases like MySQL are perfect for data with relationships (users → rides → bookings). Aiven gives us managed hosting with SSL security. |
| **Auth** | OTP via Email | Instead of passwords (which people forget or reuse), we send a 6-digit code to the user's university email. They enter the code, and they're logged in. This proves they actually own that email address. | Passwordless login is simpler and more secure. University email restriction ensures only LPU members can use the app. |
| **Token** | JWT (JSON Web Token) | After login, the server gives the user a "pass" (like a wristband at a concert). Every time the user opens a page or makes a request, the app shows this pass to the server. The server checks if it's valid and lets them through. This pass expires after 7 days, so the user has to log in again. | Stateless authentication — the server doesn't need to remember who's logged in. The token itself contains the proof. |
| **Geocoding** | Photon + LocationIQ | When the user types a city name (like "Jalandhar"), these services convert that text into GPS coordinates (latitude 31.3260, longitude 75.5762). This is called "geocoding." | Free APIs (Photon from OpenStreetMap). LocationIQ as a backup. |
| **Routing** | OSRM API | When a driver posts a ride from Phagwara to Jalandhar, we need to know the actual driving distance (not straight-line distance). OSRM calculates this using real road data. The distance directly affects the price. | Free, open-source, and accurate. Works without an API key. |

---

## How the App is Structured — The Big Picture

Imagine the app as a restaurant:

- **The customer (Frontend)** walks in, looks at the menu, and places an order. They don't go into the kitchen — they just talk to the waiter.
- **The waiter (Backend API)** takes the order, goes to the kitchen, and brings back the food. Before serving, they check if the customer has a valid reservation (JWT token).
- **The kitchen (Database)** stores all the ingredients (data). The waiter asks the kitchen for what they need and brings it back to the customer.
- **The recipe book (Business Logic/Controllers)** tells the waiter how to prepare each dish. For example, "to create a booking, first check if there are seats available, then lock the table, then add the reservation."

```
┌────────────────────────────────────────────────────────────────┐
│                   FRONTEND (Mobile App)                         │
│                                                                 │
│  What the user sees and touches. Built with React Native.       │
│  Screens: Login, Explore Rides, Post a Ride, My Rides, Profile  │
│                                                                 │
│  When the user does something (like tapping "Book"), the        │
│  frontend sends a message (HTTP request) to the backend.        │
│  It includes the JWT token so the backend knows WHO is asking.  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                  The internet (HTTP request with JSON data)
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                   BACKEND (Server)                              │
│                                                                 │
│  The invisible engine. Runs on a computer in the cloud.         │
│                                                                 │
│  When a request arrives, it goes through several checkpoints:   │
│                                                                 │
│  1. CORS check → "Is this request coming from our app?"         │
│  2. JSON parser → "Let me read the data they sent."             │
│  3. Rate limiter → "Is this person making too many requests?"   │
│  4. JWT check → "Is this person logged in? Who are they?"       │
│  5. Controller → "Now let me handle the actual business logic." │
│                                                                 │
│  The controller talks to the database, does calculations,       │
│  and sends a response back to the frontend.                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                   Secure TCP connection (SSL encrypted)
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                   DATABASE (MySQL on Aiven Cloud)               │
│                                                                 │
│  Permanent storage. All the data lives here:                    │
│  • users — everyone who has registered                          │
│  • rides — every ride posted by a driver                        │
│  • bookings — every seat reservation by a passenger             │
│  • reports — incident reports filed against bad behavior        │
│  • user_otps — temporary OTP codes for login                    │
│  • fuel_rates — current petrol/diesel/CNG/electric prices       │
│                                                                 │
│  The backend NEVER stores data in its own memory permanently.   │
│  If the server restarts, the database still has everything.     │
└────────────────────────────────────────────────────────────────┘
```

---

## How Data Flows — A Complete Example: "Booking a Ride"

Let's trace what happens from the moment a user taps "Book Seat" on their phone to the moment they see a success message.

### Step 1: User taps "Book" on the frontend

The user is on the ride-details screen looking at a ride from Phagwara to Jalandhar. They tap the "Book 1 Seat" button.

The frontend (React Native app) doesn't talk to the database directly. Instead, it sends a message (HTTP POST request) to the backend. Think of it like mailing a letter — the frontend writes the letter and sends it to the server's address.

The letter looks like this:
```
TO: https://ridemates-api.onrender.com/api/bookings/new
METHOD: POST
HEADERS: Authorization: Bearer eyJhbG... (the user's JWT token)
BODY: { "ride_id": 42, "seats_booked": 1 }
```

**Important**: The frontend does NOT send the user's ID in the body. Why? Because a hacker could change it to someone else's ID. Instead, the backend reads the user ID from the JWT token (which is cryptographically signed and can't be tampered with).

### Step 2: Backend receives the request and runs middleware

The request arrives at the Express server. Before it reaches the booking logic, it passes through several middleware checkpoints (like security gates at an airport):

1. **CORS middleware**: Checks if the request is coming from an allowed source (our mobile app). If someone tries to call our API from a random website, this blocks them.

2. **JSON parser**: Reads the JSON body `{ "ride_id": 42, "seats_booked": 1 }` and makes it available as `req.body`.

3. **JWT verification** (`middleware/auth.js`): Extracts the token from the `Authorization` header, decodes it, and checks:
   - Is the signature valid? (Was it created with our secret key?)
   - Has it expired? (Is it older than 7 days?)
   - Does this user still exist in our database?
   
   If all checks pass, the middleware attaches the user's information to the request: `req.user = { id: 15, email: 'student@lpu.in', gender: 'male', trust_score: 95 }`. Now the controller knows WHO is making this request.

### Step 3: The booking controller runs (bookController.js → bookSeat)

This is where the real logic happens. Here's the step-by-step thinking:

**"First, I need to make sure nobody else can modify this ride's seats while I'm working on it."**
- The controller gets a dedicated database connection and starts a **transaction**. Think of it like locking the door to a room — nobody else can enter until you're done.
- It runs `SELECT ... FOR UPDATE` on the ride row. This locks that specific row in the database. If another user tries to book at the exact same millisecond, their request will **wait** until this one finishes.

**"Let me check if this booking is even valid."**
- Does this ride exist? Is it still active (not cancelled or completed)?
- Is the departure time in the future (you can't book a ride that already left)?
- Is the user trying to book their OWN ride? (Drivers can't book their own rides.)
- If it's a women-only ride, is the passenger female?
- Are there enough seats left?

**"Calculate the price."**
- Multiply the ride's `capped_price` (per seat) by the number of seats booked.
- Example: ₹85 per seat × 1 seat = ₹85.

**"Decide the booking status."**
- If the ride has `instant_booking` enabled: the booking is immediately `confirmed` and seats are decremented right away.
- If not: the booking starts as `pending` — the driver has to manually accept it.

**"Save the booking and update the ride."**
- Insert a new row in the `bookings` table with all the details.
- If it's an instant booking, decrease `available_seats` on the ride.
- Commit the transaction (save everything permanently).

### Step 4: Backend sends the response

```json
{
  "success": true,
  "message": "Seat booked successfully!",
  "data": {
    "booking_id": 78,
    "ride_id": 42,
    "seats_booked": 1,
    "price_paid": 85,
    "status": "confirmed"
  }
}
```

### Step 5: Frontend shows the result

The React Native app receives this response and shows a success alert to the user: "Seat booked successfully! ₹85." The ride-details screen refreshes to show the updated seat count.

**What if two people book the last seat at the same time?**
- Person A's request locks the row first. They see 1 seat available, book it, seats become 0. Transaction commits, lock released.
- Person B's request was waiting. Now it reads the row and sees 0 seats available. The controller returns "Not enough seats available." Person B sees an error message.
- This is called **concurrency control** and it's handled by the `FOR UPDATE` row lock in MySQL.

---

## Folder Structure — What Lives Where and Why

```
CAPSTONE/
├── RideMates/
│   ├── Frontend/                    ← THE MOBILE APP (what users see)
│   │   ├── app/                     ← SCREENS (each file = one screen)
│   │   │   ├── (tabs)/              ← Tab-based screens
│   │   │   │   ├── login.tsx        ← Login/signup screen
│   │   │   │   ├── explore.tsx      ← Search for rides
│   │   │   │   ├── post-ride.tsx    ← Post a new ride form
│   │   │   │   ├── my-rides.tsx     ← List of your rides & bookings
│   │   │   │   ├── ride-details.tsx ← Full ride info + booking
│   │   │   │   ├── profile.tsx      ← Your profile page
│   │   │   │   └── _layout.tsx      ← Tab bar configuration
│   │   │   └── _layout.tsx          ← Root layout (AuthGatekeeper)
│   │   ├── components/              ← REUSABLE UI PIECES
│   │   │   ├── Auth/                ← Login form, OTP input, signup steps
│   │   │   ├── Explore/             ← Search bar, ride cards, map
│   │   │   ├── PostRide/            ← Route picker, vehicle selector, pricing
│   │   │   ├── MyRides/             ← Ride card for "My Rides" tab
│   │   │   ├── RideDetails/         ← Passenger list, badges, seat selector
│   │   │   └── ui/                  ← Shared: alerts, modals, loading skeletons
│   │   ├── services/                ← CODE THAT TALKS TO EXTERNAL THINGS
│   │   │   ├── api.ts               ← Axios HTTP client (talks to our backend)
│   │   │   ├── firebase.ts          ← Firebase initialization
│   │   │   └── locationiq.ts        ← LocationIQ geocoding service
│   │   ├── hooks/                   ← CUSTOM REACT HOOKS (reusable logic)
│   │   │   ├── usePhotonSearch.ts   ← Debounced Photon location search
│   │   │   └── useLocationIQSearch.ts ← Debounced LocationIQ search
│   │   └── constants/               ← CONFIGURATION & DESIGN TOKENS
│   │       ├── config.ts            ← API URL, email domain
│   │       ├── responsive.ts        ← Screen size scaling functions
│   │       └── theme.ts             ← Colors and fonts
│   │
│   └── Backend/                     ← THE SERVER (invisible logic engine)
│       ├── server.js                ← Entry point (starts the server)
│       ├── config/
│       │   └── db.js                ← Database connection setup
│       ├── middleware/
│       │   └── auth.js              ← JWT token verification
│       ├── controllers/             ← BUSINESS LOGIC (the "brain")
│       │   ├── authController.js    ← Login/signup OTP & JWT
│       │   ├── rideController.js    ← Create/search/update/cancel rides
│       │   ├── bookController.js    ← Book/cancel/accept/reject seats
│       │   └── reportController.js  ← File reports, trust penalties
│       ├── routes/                  ← URL MAPPING (which URL → which controller)
│       │   ├── authRoutes.js        ← /api/auth/* URLs
│       │   ├── rideRoutes.js        ← /api/rides/* URLs
│       │   ├── bookRoutes.js        ← /api/bookings/* URLs
│       │   └── reportRoutes.js      ← /api/reports/* URLs
│       ├── utils/
│       │   └── priceCalculator.js   ← Pricing & penalty formulas
│       └── database/
│           └── 00_init_all_tables.sql ← Creates all database tables
```

**Why separate routes from controllers?**  
The route file says "when someone visits `/api/rides/create`, call the `createRide` function." The controller file contains the actual `createRide` function with all the logic. This separation makes the code organized — if you want to change the URL, you edit the route. If you want to change the logic, you edit the controller. They're independent.

---

## Key Design Patterns — What They Mean and Why We Use Them

### 1. MVC (Model-View-Controller)
**Analogy**: A restaurant has a dining area (View), waiters (Controller), and a kitchen (Model).
- **View** = Frontend screens (what the user sees)
- **Controller** = Backend controller functions (what happens when the user does something)
- **Model** = Database tables (where data is stored)

The user (View) says "I want to book a seat." The waiter (Controller) processes the order, checks the kitchen (Model) for availability, and reports back.

### 2. Middleware Chain
**Analogy**: Airport security has multiple checkpoints: ticket check → ID check → bag scan → body scan. Each checkpoint either lets you through or stops you.

In our app, every request goes through: CORS → JSON parser → rate limiter → JWT verify → controller. If any checkpoint fails, the request is rejected immediately.

### 3. Connection Pool
**Analogy**: A car rental company keeps 10 cars in the lot. When a customer needs one, they borrow it and return it when done. They don't buy a new car for every customer.

Our database pool pre-opens 10 connections. When a request needs the database, it borrows a connection and returns it when done. This is much faster than opening a new connection every time.

### 4. Interceptor (Axios)
**Analogy**: Imagine you have a personal assistant who automatically attaches your ID badge to every letter you send, and who also opens all your incoming mail to check for "access denied" notices. You don't have to think about it — it just happens.

The Axios interceptor automatically adds the JWT token to every outgoing request and automatically handles 401 (expired token) responses by logging the user out.

### 5. File-Based Routing (Expo Router)
**Analogy**: In a library, the section where a book is placed determines its category. Fiction books go on the fiction shelf, history on the history shelf. You don't need a separate catalog — the location IS the identity.

In our app, creating a file called `explore.tsx` inside the `app/(tabs)/` folder automatically creates a screen called "Explore." No manual configuration needed.

### 6. Transaction + Row Locking
**Analogy**: Imagine a ticket counter with one last concert ticket. Two people reach the counter simultaneously. Without locking, both could be told "yes, we have 1 ticket!" and both buy it — now there are -1 tickets. With locking, the first person locks the counter: the second person has to wait. The first person buys the ticket, leaves, and then the second person is told "sorry, sold out."

This is exactly what `FOR UPDATE` does in our booking system. It prevents two people from booking the last seat at the same time.

---

## Key Terminology — Simple Definitions

| Term | What It Means (Simple) | Real Example in Our App |
|------|----------------------|------------------------|
| **OTP** | A temporary code (like 847293) sent to your email to prove you own that email. It expires in 10 minutes. | User enters email → gets OTP via email → enters OTP → logged in. |
| **JWT** | A digital "pass" the server gives you after login. It's like a wristband at a concert — shows who you are without asking again. Expires in 7 days. | After OTP verification, server creates JWT. App stores it and sends it with every request. |
| **CORS** | A security rule that says "only requests from MY app are allowed." Like a bouncer at a club checking if you're on the guest list. | Our API only accepts requests from `localhost:8081` (dev) and our production app. |
| **REST API** | A set of URLs that accept specific HTTP methods (GET to read, POST to create, PUT to update, DELETE to remove). Think of it as a menu at a restaurant — each item has a number and you tell the waiter "I want item #3." | `POST /api/rides/create` = create a ride. `GET /api/rides/search` = search for rides. |
| **Connection Pool** | Pre-opened database connections that are shared. Like a fleet of shared bicycles — grab one, use it, return it. | Our backend keeps 10 MySQL connections ready at all times. |
| **Transaction** | A group of database operations that either ALL succeed or ALL fail. Like transferring money — if the deposit fails after the withdrawal, the withdrawal is reversed. | When booking a seat: decrement seats AND insert booking. If inserting fails, seats are restored. |
| **FOR UPDATE** | A row lock in MySQL. Like putting a "Do Not Disturb" sign on a hotel room door. Nobody else can enter until you leave. | When checking seat availability, the row is locked so two users can't book the same last seat. |
| **Middleware** | Code that runs BEFORE your main logic, like security checks at an airport. | `verifyToken` middleware checks the JWT before any protected controller runs. |
| **Interceptor** | Code that automatically modifies every outgoing request or incoming response. Like a mail room that stamps every outgoing letter. | Axios automatically adds the JWT token to the `Authorization` header of every API call. |
| **Debounce** | Waiting a short time after the user stops typing before doing something. Like a search engine that waits until you've finished typing before showing results. | When typing a city name, we wait 450ms of silence before calling the geocoding API. |
| **Trust Score** | A number (0-100) that represents how reliable a user is. Starts at 100 and goes down with bad behavior (late cancellations, bad conduct reports). | New user: 100. After 2 late cancellations: 96. After a conduct report: 86. |
| **Streak** | How many rides in a row you've completed without any reports. Rewards good behavior. | 5-ride streak means you've had 5 clean rides in a row. Resets to 0 on a report or late cancel. |
