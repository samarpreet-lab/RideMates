# RideMates — Final Capstone Project Report

## University Peer-to-Peer Commute Sharing Mobile Application

---

**Project Title:** RideMates — University Peer-to-Peer Commute Sharing Network

**Submitted By:** Samar Bhamra

**University:** Lovely Professional University (LPU)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Review of Literature](#2-review-of-literature)
3. [Rationale and Scope of the Study (Including Problem Statement)](#3-rationale-and-scope-of-the-study-including-problem-statement)
4. [Objectives and Hypothesis of the Study](#4-objectives-and-hypothesis-of-the-study)
5. [Research Methodology (System Flowchart and Logical Diagram)](#5-research-methodology-system-flowchart-and-logical-diagram)
6. [Complete Work Plan with Timelines](#6-complete-work-plan-with-timelines)
7. [Expected Outcomes of the Study](#7-expected-outcomes-of-the-study)
8. [Research and Experimental Work Done](#8-research-and-experimental-work-done)
9. [Results and Discussion](#9-results-and-discussion)
10. [Conclusions and Summary of the Work Done](#10-conclusions-and-summary-of-the-work-done)
11. [References and Bibliography](#11-references-and-bibliography)
12. [Approved Project Topic](#12-approved-project-topic)

---

## 1. Introduction

RideMates is a mobile application built for university students and faculty members to share rides with each other for their daily commute. The app is specifically designed for Lovely Professional University (LPU), where thousands of students travel between the campus and nearby cities like Jalandhar, Phagwara, and surrounding towns every day.

The core idea is simple — instead of everyone traveling alone (which is expensive and adds traffic), students can post their rides on the app, and other students going in the same direction can book a seat. This way, the cost of fuel is split among passengers, everyone saves money, and there are fewer vehicles on the road.

Unlike commercial ride-hailing apps like Ola or Uber, RideMates is not a business. It runs on a cost-sharing model, which means drivers can only charge up to a capped price that covers their fuel and basic vehicle maintenance — no profit-making is allowed. This keeps it legal under Indian motor vehicle regulations for white-plate (private) vehicles.

The app has two main parts:
- **Frontend** — A cross-platform mobile app built with React Native and Expo, which works on both Android and iOS devices.
- **Backend** — A REST API server built with Node.js and Express, which handles all the business logic, stores data in a MySQL database (hosted on Aiven Cloud), and sends OTP verification emails through Gmail SMTP.

Key features of the app include:
- University-only access (only @lpu.in emails are allowed to sign up)
- OTP-based email authentication (no passwords needed)
- Real-time ride posting with GPS-based location selection
- An intelligent pricing algorithm that caps prices per vehicle type
- A trust score system that rewards good behavior and penalizes bad conduct
- Women-only ride option for added safety
- Instant booking and manual approval modes
- A reporting system with shield protection against false accusations

---

## 2. Review of Literature

Before building RideMates, we studied several existing solutions and relevant literature to understand what works and what does not in the ride-sharing space.

### 2.1 Existing Ride-Sharing Platforms

**BlaBlaCar** is one of the largest ride-sharing platforms in Europe and India. It connects drivers with passengers for intercity travel. While BlaBlaCar works well for long-distance trips, it is not designed for short daily commutes within a university ecosystem. It also lacks university-specific features like campus email verification and trust systems tailored for student communities.

**Ola and Uber** are commercial ride-hailing services. They operate on a profit model where drivers are professionals and fares include company commission. These platforms are too expensive for daily student commutes and do not support peer-to-peer cost sharing among known community members.

**QuickRide** is an Indian carpooling app that focuses on office commutes in metro cities. It has some cost-sharing features but does not specifically target university campuses. It also uses phone-based registration, which does not provide the same level of identity verification as university email.

### 2.2 University Transportation Challenges in India

Multiple studies have highlighted that private vehicle usage around Indian university campuses leads to traffic congestion, parking shortages, and increased commute costs for students. According to a survey conducted among LPU students, a large number of students travel from Jalandhar and nearby areas daily, often alone in their vehicles, while other students going to the same area have no affordable transport options.

### 2.3 Trust and Safety in Peer-to-Peer Systems

Research on peer-to-peer platforms (Airbnb, eBay, etc.) shows that trust is the most critical factor in user adoption. Without a reliable trust mechanism, users are reluctant to share rides with strangers. We studied pattern-based reputation systems used in platforms like Stack Overflow and eBay, where a single bad review does not destroy a user's reputation (to protect against false reports), but multiple independent complaints trigger action. This concept became the foundation for our "Shield" mechanism in the RideMates trust system.

### 2.4 Legal Framework for Cost-Sharing in India

Under India's Motor Vehicles Act, private (white-plate) vehicles cannot be used for commercial purposes. However, genuine cost-sharing — where the driver only recovers fuel costs — is generally permitted. Our pricing algorithm was designed to enforce this limit by capping the maximum fare at a vehicle-specific multiplier of the raw fuel cost, ensuring no driver can overcharge.

### 2.5 Technology Choices

We reviewed several technology stacks for mobile app development:
- **Flutter** — Good cross-platform support but uses Dart, which has a smaller community than JavaScript.
- **React Native with Expo** — Uses JavaScript/TypeScript, has a massive ecosystem, supports both Android and iOS from a single codebase, and Expo provides managed workflow for easier deployment.
- **Native Android/iOS** — Would require separate codebases for each platform, doubling development effort.

We chose React Native with Expo because it let us target both platforms with a single TypeScript codebase, and Expo handled the build and deployment complexities.

For the backend, we chose Node.js with Express because:
- It uses JavaScript, same language as the frontend, reducing context switching.
- Express is lightweight and well-documented for REST API development.
- MySQL was chosen over MongoDB because our data has clear relationships (users → rides → bookings → reports), making a relational database the natural fit.

---

## 3. Rationale and Scope of the Study (Including Problem Statement)

### 3.1 Problem Statement

University students at LPU face multiple transportation problems:

1. **High Commute Costs** — Students traveling from Jalandhar, Phagwara, Nakodar, and other nearby cities spend a significant portion of their monthly budget on fuel or public transport fares. Many students rely on auto-rickshaws or private vehicles, which are expensive for daily use.

2. **No Organized Ride-Sharing** — While informal ride-sharing happens through WhatsApp groups and word of mouth, there is no structured system for students to find and offer rides. Students often do not know who is going in their direction or at what time.

3. **Safety Concerns** — Sharing rides with unknown people raises safety concerns, especially for female students. There is no mechanism to verify identities or hold people accountable for bad behavior.

4. **Traffic and Parking Issues** — Hundreds of students driving alone to campus contributes to traffic congestion around LPU and creates parking pressure on campus.

5. **No Existing Solution for Indian University Campuses** — Commercial apps like Ola and Uber are too expensive for daily commutes, and general carpooling apps don't cater to the unique needs of a university community (verified identities, trust systems, campus-specific routes).

### 3.2 Rationale

The rationale behind building RideMates is to create a platform that solves all the above problems in one place:

- **Reduce individual commute costs** by splitting fuel expenses among co-travelers.
- **Provide a structured platform** where students can post rides, search for rides, and book seats with a few taps.
- **Ensure safety** through university email verification (only @lpu.in), a behavioral trust score system, women-only ride options, and a reporting mechanism.
- **Reduce traffic and pollution** by encouraging shared commutes, leading to fewer vehicles on the road.

### 3.3 Scope

The scope of this project includes:

- **User Authentication** — OTP-based email verification restricted to university email domains (@lpu.in).
- **Ride Management** — Full lifecycle of ride creation, searching, booking, completing, and cancellation.
- **Pricing System** — An intelligent pricing algorithm that calculates fair prices based on distance, fuel cost, vehicle mileage, and vehicle type, with hard caps to prevent overcharging.
- **Trust and Safety System** — Trust scores, clean ride streaks, cancellation penalties, and a report system with pattern-matching evaluation.
- **Women-Only Rides** — An option for drivers to create female-only rides for added safety.
- **Instant Booking vs Manual Approval** — Drivers can choose whether passengers are auto-confirmed or need manual approval.
- **Real-Time Map Interface** — An interactive map showing campus landmarks on the home screen with location-based search using LocationIQ geocoding API.

**Out of Scope** (not included in this version):
- In-app payment integration (payments are handled offline between driver and passenger).
- Real-time GPS tracking of rides.
- Push notifications (can be added in future versions).
- Admin dashboard for university authorities.

---

## 4. Objectives and Hypothesis of the Study

### 4.1 Objectives

1. **Design and develop a full-stack mobile application** that allows university students to share rides for daily commutes in a safe, affordable, and organized manner.

2. **Implement a secure authentication system** using OTP-based email verification restricted to university email addresses, eliminating the need for passwords while ensuring only verified university members can use the platform.

3. **Build an intelligent pricing algorithm** that enforces fair pricing through vehicle-specific multipliers and price caps, ensuring compliance with Indian motor vehicle cost-sharing regulations.

4. **Create a behavioral trust system** that rewards consistent good behavior (clean ride streaks) and penalizes misconduct (cancellation penalties, report-based deductions), while including anti-abuse measures like The Shield and anti-collusion cooldowns.

5. **Develop a reporting and accountability module** that uses pattern-matching evaluation to distinguish between genuine complaints and false accusations.

6. **Design a clean, intuitive mobile user interface** with features like interactive maps, location autocomplete, date/time pickers, ride search with filters, and detailed ride views.

7. **Implement concurrency control** using database-level row locking (SELECT ... FOR UPDATE) to prevent the double-booking race condition where two passengers simultaneously try to book the last available seat.

8. **Deploy the application** with the backend hosted on Render (cloud platform) and the database hosted on Aiven (managed MySQL), making it accessible from real mobile devices.

### 4.2 Hypothesis

- **H1:** A peer-to-peer ride-sharing platform restricted to university members will reduce the average daily commute cost for participating students compared to traveling alone.

- **H2:** University email verification combined with a behavioral trust score system will create a safer environment for ride-sharing compared to open platforms with no identity verification.

- **H3:** A pricing cap algorithm based on fuel costs and vehicle type will prevent overcharging while still allowing drivers to recover their commute expenses.

- **H4:** A pattern-matching report evaluation system (requiring complaints from multiple independent reporters before penalizing) will reduce false accusations compared to traditional single-report penalty systems.

---

## 5. Research Methodology (System Flowchart and Logical Diagram)

### 5.1 Development Methodology

We followed an **iterative development methodology** where the project was built in small, testable increments. After each increment, we tested the feature, gathered feedback, and improved it before moving to the next one. This approach allowed us to catch issues early and make adjustments without having to redo large portions of the codebase.

### 5.2 System Architecture

The system follows a **client-server architecture** with three main layers:

```
┌────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Mobile Client)                        │
│                                                                    │
│    React Native + Expo (TypeScript)                                │
│    ├── Screens: Login, Explore (Map), Post Ride, My Rides,         │
│    │            Ride Details, Profile                               │
│    ├── Services: Axios HTTP Client, Firebase (phone auth),         │
│    │             LocationIQ Geocoding                              │
│    ├── Secure Storage: JWT token stored via expo-secure-store      │
│    └── Navigation: Expo Router (file-based routing)                │
│                                                                    │
│    Runs on: Android / iOS devices                                  │
└──────────────────────────┬─────────────────────────────────────────┘
                           │  HTTPS (REST API)
                           │  Authorization: Bearer <JWT>
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│                    BACKEND (API Server)                             │
│                                                                    │
│    Node.js + Express (JavaScript)                                  │
│    ├── Routes: /api/auth, /api/rides, /api/bookings, /api/reports  │
│    ├── Controllers: authController, rideController,                │
│    │                bookController, reportController               │
│    ├── Middleware: JWT verification (auth.js)                      │
│    ├── Utils: priceCalculator.js (pricing + penalties)             │
│    ├── Scheduled Jobs: Auto-complete stale rides,                  │
│    │                   Clean ride streak awards                    │
│    └── External APIs: OSRM (route distance), Gmail SMTP (OTP)     │
│                                                                    │
│    Hosted on: Render (cloud platform)                              │
└──────────────────────────┬─────────────────────────────────────────┘
                           │  mysql2 (SSL connection)
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL)                                 │
│                                                                    │
│    Hosted on: Aiven Cloud (managed MySQL)                          │
│    Tables: users, user_otps, rides, bookings, reports, fuel_rates  │
│    Features: Foreign keys, indexes, ENUM constraints,              │
│              UNIQUE keys (prevent duplicate bookings/reports)       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 5.3 Authentication Flow

```
┌──────────┐         ┌──────────────┐         ┌──────────────┐
│  Mobile  │         │   Backend    │         │   Gmail      │
│  App     │         │   Server     │         │   SMTP       │
└────┬─────┘         └──────┬───────┘         └──────┬───────┘
     │                      │                        │
     │  POST /auth/send-otp │                        │
     │  { email }           │                        │
     │ ─────────────────────>                        │
     │                      │                        │
     │                      │  Validate @lpu.in      │
     │                      │  Generate 6-digit OTP  │
     │                      │  Hash with SHA-256     │
     │                      │  Store hash in DB      │
     │                      │                        │
     │                      │  Send OTP email        │
     │                      │ ───────────────────────>
     │                      │                        │
     │  200 OK              │                        │
     │ <─────────────────────                        │
     │                      │                        │
     │  POST /auth/verify   │                        │
     │  { email, otp }      │                        │
     │ ─────────────────────>                        │
     │                      │                        │
     │                      │  Hash input OTP        │
     │                      │  Compare with stored   │
     │                      │  Create/find user      │
     │                      │  Sign JWT token        │
     │                      │                        │
     │  200 OK + JWT token  │                        │
     │ <─────────────────────                        │
     │                      │                        │
     │  Store JWT securely  │                        │
     │  (expo-secure-store) │                        │
     │                      │                        │
```

### 5.4 Ride Lifecycle Flowchart

```
    ┌──────────────────┐
    │  Driver posts a  │
    │  new ride         │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  Backend validates│
    │  + calculates     │
    │  price using      │
    │  OSRM distance    │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  Ride is ACTIVE  │◄──────────────────────────────┐
    │  (visible in     │                               │
    │  search results) │                               │
    └────────┬─────────┘                               │
             │                                         │
     ┌───────┼───────┐                                 │
     │       │       │                                 │
     ▼       ▼       ▼                                 │
  Passenger  Driver  24hrs after                       │
  books a   cancels  departure                         │
  seat       ride    (auto-complete)                   │
     │       │       │                                 │
     ▼       ▼       ▼                                 │
  Booking  CANCELLED COMPLETED                         │
  created     │       │                                │
     │        │       ├── 12h grace period for reports │
     │        │       │                                │
     │        │       ├── 12h later: award clean       │
     │        │       │   ride streaks (if no reports) │
     │        │       │                                │
     ▼        ▼       ▼                                │
  COMPLETED  END     END                               │
```

### 5.5 Trust Score System Logic

```
  New User: trust_score = 100, current_streak = 0

  ┌─────────────────────────────────────────────┐
  │              POSITIVE ACTIONS               │
  │                                             │
  │  Clean ride completed (no reports after     │
  │  12 hours) → current_streak + 1            │
  │  (Anti-collusion: 24h cooldown per          │
  │   driver-passenger pair)                    │
  └─────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────┐
  │              NEGATIVE ACTIONS               │
  │                                             │
  │  Late cancellation (4h–30min before ride)   │
  │    → trust_score − 2, streak reset to 0    │
  │                                             │
  │  Last-minute cancel (<30 min before ride)   │
  │    → trust_score − 5, streak reset to 0    │
  │                                             │
  │  No-show report                             │
  │    → trust_score − 5, streak reset to 0    │
  │                                             │
  │  Conduct report (pattern confirmed)         │
  │    → trust_score − 10, streak reset to 0   │
  │                                             │
  │  Escalation (3+ independent reporters)      │
  │    → additional trust_score − 25           │
  └─────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────┐
  │              SHIELD PROTECTION              │
  │                                             │
  │  First conduct report from a single person  │
  │    → WARNING ONLY (0 penalty)               │
  │  Protects against one person lying          │
  │                                             │
  │  Reporter trust_score < 70                  │
  │    → Report logged, but 0 penalty applied   │
  │  Prevents low-trust users from weaponizing  │
  │  the report system                          │
  └─────────────────────────────────────────────┘
```

### 5.6 Pricing Algorithm Logic

```
  INPUTS:
    distance_km     ← calculated by OSRM (backend, not frontend)
    fuel_rate       ← from fuel_rates table in database
    vehicle_mileage ← entered by driver (km/litre)
    vehicle_type    ← bike/scooter (1.2x), auto (1.35x), car (1.5x)
    driver_set_price← per-seat price the driver wants to charge
    available_seats ← number of seats offered

  CALCULATION:
    base_price         = (distance_km × fuel_rate) / vehicle_mileage
    multiplier         = VEHICLE_MULTIPLIERS[vehicle_type]
    max_allowed        = base_price × multiplier
    base_per_seat      = base_price / available_seats
    recommended_per_seat = base_per_seat × 1.2    (Green zone ceiling)
    max_per_seat       = max_allowed / available_seats  (Hard cap)
    capped_price       = MIN(driver_set_price, max_per_seat)

  WORKED EXAMPLE — Car, 3 seats, 40 km, ₹105/L petrol, 15 km/L:
    base_price           = (40 × 105) / 15 = ₹280
    max_allowed          = 280 × 1.5 = ₹420
    base_per_seat        = 280 / 3   = ₹93
    recommended_per_seat = 93 × 1.2  = ₹112
    max_per_seat         = 420 / 3   = ₹140
    Driver asks ₹115/seat → capped_price = ₹115 ✔ (within cap)
    Driver asks ₹160/seat → capped_price = ₹140 ✔ (clamped to cap)
```

### 5.7 Database Schema (Entity-Relationship)

```
  ┌──────────────┐
  │    users     │
  │──────────────│
  │ id (PK)      │
  │ full_name    │
  │ email (UQ)   │     ┌──────────────┐
  │ phone        │     │  user_otps   │
  │ university   │     │──────────────│
  │ role         │     │ id (PK)      │
  │ gender       │     │ email        │──── references by email
  │ trust_score  │     │ otp_hash     │
  │ current_streak│    │ purpose      │
  │ created_at   │     │ attempts     │
  └──────┬───────┘     │ is_verified  │
         │             │ expires_at   │
         │             └──────────────┘
         │
    ┌────┴──────────────┬──────────────────┐
    │ 1:N               │ 1:N              │ 1:N
    ▼                   ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    rides     │  │   bookings   │  │   reports    │
│──────────────│  │──────────────│  │──────────────│
│ id (PK)      │  │ id (PK)      │  │ id (PK)      │
│ driver_id(FK)│  │ ride_id (FK) │  │ ride_id (FK) │
│ origin_city  │  │ passenger_id │  │ reporter_id  │
│ dest_city    │  │ seats_booked │  │ reported_user│
│ distance_km  │  │ price_paid   │  │ reason       │
│ departure_time│ │ status       │  │ description  │
│ available_seats││ is_reported  │  │ penalty      │
│ vehicle_type │  │ cancel_penalty│ │ created_at   │
│ base_price   │  │ booked_at    │  └──────────────┘
│ capped_price │  └──────────────┘
│ is_women_only│                    ┌──────────────┐
│ instant_book │                    │  fuel_rates  │
│ status       │                    │──────────────│
│ completed_at │                    │ id (PK)      │
│ streak_processed│                 │ fuel_type    │
└──────────────┘                    │ rate_per_litre│
                                    └──────────────┘
```

---

## 6. Complete Work Plan with Timelines

| Phase | Task | Duration | Timeline |
|-------|------|----------|----------|
| **Phase 1: Research & Planning** | Study existing platforms, legal framework, technology selection | 2 weeks | Week 1 – Week 2 |
| **Phase 2: SRS Document** | Write Software Requirements Specification (functional requirements, non-functional requirements, use cases, algorithms) | 2 weeks | Week 3 – Week 4 |
| **Phase 3: Database Design** | Design MySQL schema (6 tables with relationships, constraints, indexes) | 1 week | Week 5 |
| **Phase 4: Backend — Authentication** | Implement OTP generation, email sending, OTP verification, JWT issuance, profile CRUD | 2 weeks | Week 6 – Week 7 |
| **Phase 5: Backend — Rides** | Implement ride creation, search, update, cancel, complete, OSRM integration, pricing algorithm | 2 weeks | Week 8 – Week 9 |
| **Phase 6: Backend — Bookings** | Implement seat booking with transaction locking, cancellation with penalty tiers, accept/reject booking | 2 weeks | Week 10 – Week 11 |
| **Phase 7: Backend — Reports** | Implement report filing, The Shield, pattern-matching evaluation, escalation, anti-weaponization gate | 1 week | Week 12 |
| **Phase 8: Backend — Scheduled Jobs** | Auto-complete stale rides, clean ride streak awards with anti-collusion cooldown | 1 week | Week 13 |
| **Phase 9: Frontend — Auth Screens** | Login screen, signup screen, OTP input, profile setup (React Native + Expo) | 2 weeks | Week 14 – Week 15 |
| **Phase 10: Frontend — Explore Screen** | Map view with campus landmarks, search modal, location picker, ride cards | 2 weeks | Week 16 – Week 17 |
| **Phase 11: Frontend — Post Ride** | Route section, vehicle section, pricing section with slider, location autocomplete via LocationIQ | 2 weeks | Week 18 – Week 19 |
| **Phase 12: Frontend — My Rides & Ride Details** | Ride history (as driver + passenger), ride detail view, booking management, report filing UI | 2 weeks | Week 20 – Week 21 |
| **Phase 13: Frontend — Profile** | Profile view, edit profile, trust score display, streak display, logout | 1 week | Week 22 |
| **Phase 14: Testing & Bug Fixes** | End-to-end testing, API testing with Postman, concurrency testing, edge case fixes, security hardening | 2 weeks | Week 23 – Week 24 |
| **Phase 15: Deployment** | Deploy backend to Render, database on Aiven, build APK using EAS Build, final documentation | 2 weeks | Week 25 – Week 26 |

---

## 7. Expected Outcomes of the Study

1. **A fully functional mobile application** that runs on both Android and iOS, allowing LPU students and faculty to post, search, and book shared rides.

2. **Reduced commute costs** — By splitting fuel costs among passengers, each individual's daily travel expense is expected to reduce significantly. For example, a 40 km car trip costing ₹280 in fuel can be shared among 3 passengers at approximately ₹115 each (instead of the full ₹280 per person).

3. **A verified and safe community** — By restricting access to @lpu.in email addresses and implementing a trust score system with streak rewards and pattern-based penalties, the platform creates an accountable environment where users are less likely to misbehave.

4. **Fair pricing enforcement** — The tiered pricing algorithm with vehicle-specific multipliers (1.2x for bikes, 1.35x for autos, 1.5x for cars) ensures that drivers cannot overcharge beyond what is reasonable for fuel recovery.

5. **Protection against false accusations** — The Shield mechanism (first-report-only warning) and the trust-weighted penalty gate (reporters with trust_score below 70 cannot trigger penalties) ensure that the reporting system cannot be easily abused.

6. **Anti-gaming measures** — The 24-hour cooldown between the same driver-passenger pair and the streak_processed flag ensure that users cannot farm trust scores through fake ride cycles.

7. **Reduced campus traffic** — If adopted widely, the platform can meaningfully reduce the number of single-occupancy vehicles traveling to and from LPU campus.

---

## 8. Research and Experimental Work Done

### 8.1 Technology Stack Implemented

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend Framework | React Native 0.81 + Expo 54 | Cross-platform mobile app (Android + iOS) |
| Frontend Language | TypeScript | Type-safe JavaScript for fewer bugs |
| Navigation | Expo Router 6 (file-based routing) | Screen navigation with tab and stack layouts |
| Maps | react-native-maps + Google Maps | Interactive map on explore screen |
| Location Search | LocationIQ Autocomplete API | Location search with bias toward LPU/Punjab region |
| Secure Storage | expo-secure-store | Encrypted storage for JWT tokens on device |
| HTTP Client | Axios | API calls with JWT interceptor and 401 handling |
| Backend Runtime | Node.js | Server-side JavaScript execution |
| Backend Framework | Express 5 | REST API routing and middleware |
| Database | MySQL (hosted on Aiven Cloud) | Relational data storage with SSL |
| Database Driver | mysql2/promise | Async MySQL queries with connection pooling |
| Authentication | Custom OTP + JWT (jsonwebtoken) | Passwordless email-based auth |
| Email Service | Nodemailer + Gmail SMTP | Sending OTP verification emails |
| Route Distance | OSRM (Open Source Routing Machine) | Backend distance calculation (never trusts frontend) |
| Hosting | Render (backend), Aiven (database) | Cloud deployment |
| Rate Limiting | express-rate-limit | Prevent brute force and abuse |

### 8.2 Backend Implementation Details

The backend is organized into a clean MVC-style structure:

**Controllers (Business Logic):**
- `authController.js` (702 lines) — Handles OTP generation with SHA-256 hashing, rate limiting (max 3 OTPs per 10 minutes, 60-second cooldown between requests), brute force protection (lock after 3 failed attempts), user registration, JWT issuance (7-day expiry), and profile management.
- `rideController.js` (784 lines) — Handles ride CRUD with backend OSRM distance calculation, double-submit prevention (60-second window), coordinate validation, pricing algorithm execution, and Driver cancellation penalties.
- `bookController.js` (514 lines) — Handles seat booking with MySQL transaction + FOR UPDATE row locking, women-only enforcement, instant vs manual booking flow, cancellation with tiered penalties, and driver accept/reject of pending bookings.
- `reportController.js` (317 lines) — Handles report filing with 12-hour grace period enforcement, report cooldown (max 3 per 24 hours), trust-weighted penalty gate, The Shield (first-reporter warning), pattern matching (2+ independent reporters), and escalation (3+ reporters → additional −25).

**Middleware:**
- `auth.js` (120 lines) — JWT verification middleware that runs before every protected route. Extracts token from Authorization header, verifies signature and expiry, looks up user in MySQL, and attaches user info to `req.user`.

**Utilities:**
- `priceCalculator.js` (279 lines) — Three pure functions: `calculatePrice()` for tiered pricing, `calculatePerSeatPrice()` for booking price calculation, and `calculateCancellationPenalty()` for tiered penalty logic.

**Scheduled Background Jobs (in server.js):**
- Auto-complete stale rides — Every 30 minutes, finds rides that are still 'active' 24 hours past departure and marks them as completed.
- Clean ride streak awards — Every 30 minutes, finds completed rides that were finished 12+ hours ago with no reports filed, and increments trust streaks for the driver and passengers (with 24-hour anti-collusion cooldown per driver-passenger pair).

### 8.3 Frontend Implementation Details

The frontend uses Expo Router for file-based navigation with the following screen structure:

**Authentication Flow:**
- `index.tsx` — Entry screen (AuthGatekeeper) that checks for existing JWT token and routes to login or explore.
- `login.tsx` — Multi-step auth screen: email input → OTP input → (for signup) profile setup with name, phone, role, and gender.

**Main App Tabs:**
- `explore.tsx` — Full-screen Google Maps view with LPU campus landmarks. Shows user identity bar at top (name, trust score, streak) and a bottom command sheet for searching rides and quick actions.
- `post-ride.tsx` — Wizard-style form with three sections: Route (origin, destination, date, time, emergency route toggle), Vehicle (type, seats, mileage, fuel type), and Pricing (slider with Green/Yellow/Red zones, instant booking toggle, women-only toggle).
- `my-rides.tsx` — Shows all rides associated with the user — both as driver (posted rides) and as passenger (booked rides), with actions like complete, cancel, and view details.

**Detail Screens (no tab bar):**
- `ride-details.tsx` — Full ride detail view showing route timeline, driver info, price breakdown, ride badges (instant booking, women-only, emergency route), passenger list (for drivers), and action buttons (book, cancel booking, complete ride, file report).
- `profile.tsx` — User profile display with edit functionality for name, phone, and gender.

**Component Library (50+ reusable components):**
- Auth folder: LoginEmailStep, SignupEmailStep, OtpStep, ProfileStep, GenderPicker, FormInput, etc.
- Explore folder: SearchModal, LocationPickerModal, TopIdentityBar, BottomCommandSheet, RideCard, ProfileModal.
- PostRide folder: RouteSection, VehicleSection, PricingSection, LocationPickerModal.
- RideDetails folder: DriverInfoCard, RouteTimeline, PriceBreakdown, RideBadges, SeatSelector, PassengerList, EditRideModal.
- MyRides folder: MyRideCard.
- UI folder: AlertContext (custom alert system), SkeletonLoader, RideStatusModal.

### 8.4 Database Implementation

The MySQL database consists of 6 tables:

1. **users** — Stores all verified university members with trust_score (default 100) and current_streak (default 0). Email is unique and restricted to @lpu.in during registration.

2. **user_otps** — Stores OTP records with SHA-256 hashed OTPs, attempt counter (max 3), expiry time (10 minutes), and verification status. Records are cleaned up when new OTPs are requested.

3. **rides** — Stores all ride data including GPS coordinates, distance (from OSRM), vehicle details, pricing (base_price, driver_set_price, capped_price), flags (women_only, instant_booking, emergency_route), and lifecycle status (active → completed/cancelled).

4. **bookings** — Stores seat reservations with UNIQUE constraint on (ride_id, passenger_id) to prevent double booking. Tracks cancellation penalties and report flags.

5. **reports** — Stores incident reports with UNIQUE constraint on (ride_id, reporter_id) to prevent duplicate reports. Tracks penalty amounts applied.

6. **fuel_rates** — Reference table with current fuel prices (petrol ₹105, diesel ₹92, CNG ₹80, electric ₹5 per unit).

### 8.5 Security Measures Implemented

- **University email domain validation** — Only @lpu.in emails are accepted during registration.
- **OTP hashing** — OTPs are stored as SHA-256 hashes; plaintext OTPs are never stored in the database.
- **JWT authentication** — All protected endpoints require a valid JWT token in the Authorization header.
- **Rate limiting** — Max 3 OTP requests per 10 minutes, 60-second cooldown between requests, max 3 reports per 24 hours per user.
- **Brute force protection** — OTP verification locked after 3 failed attempts.
- **CORS restrictions** — Backend accepts requests only from whitelisted origins.
- **SQL injection prevention** — All database queries use parameterized queries (prepared statements with ? placeholders).
- **XSS protection** — User input in emails is escaped using a custom `escapeHtml()` function.
- **Input validation** — All API endpoints validate input types, ranges, and formats (phone numbers, coordinates, seat counts, prices).
- **Backend distance calculation** — Distance is always calculated server-side via OSRM, never trusting the frontend value, preventing fare manipulation.
- **SSL database connection** — MySQL connection uses SSL with CA certificate verification in production.
- **Atomic transactions** — Booking and cancellation operations use MySQL transactions with row-level locking (FOR UPDATE) to prevent race conditions.
- **Anti-PII logging** — Server logs mask email addresses and user details to protect privacy.

---

## 9. Results and Discussion

### 9.1 Application Features Developed

We successfully built and deployed a complete ride-sharing application with the following working features:

1. **OTP-Based Authentication** — Users can sign up and log in using their @lpu.in university email. A 6-digit OTP is sent via Gmail SMTP with a professionally designed HTML email template. OTPs expire after 10 minutes and are locked after 3 failed attempts.

2. **Ride Posting** — Drivers can post rides with full details including origin/destination (selected via LocationIQ autocomplete), departure date/time, vehicle type and mileage, and a price slider that shows Green (fair), Yellow (acceptable), and Red (capped) zones.

3. **Ride Search and Discovery** — Passengers can search for rides by origin, destination, date, seat count, and emergency route filter. Results are displayed in ride cards with driver name, trust score, price, departure time, and available seats.

4. **Seat Booking** — Passengers can book seats with concurrency-safe transactions. Instant booking rides confirm immediately; manual approval rides go to pending status until the driver accepts or rejects.

5. **Ride Lifecycle Management** — Drivers can mark rides as complete (only after departure time), and the system automatically completes stale rides 24 hours after departure. Cancelled rides properly restore passenger seats and apply appropriate penalties.

6. **Trust Score and Streaks** — Every user starts with a trust score of 100. Clean rides (no reports after 12 hours) increment the streak counter. Cancellations and reports reduce the score and reset the streak. The anti-collusion system prevents gaming.

7. **Report System** — Users can file reports against other participants for no-show, bad conduct, unsafe driving, or harassment. The pattern-matching system requires 2+ independent reporters before penalizing, and The Shield protects against single false accusations.

8. **Women-Only Rides** — Female drivers can mark their rides as women-only, and the backend enforces that only female passengers can book.

9. **Map Interface** — The explore screen shows an interactive Google Maps view centered on LPU, with custom markers for campus landmarks (gates, hostels, blocks).

### 9.2 Performance and Scalability

- The backend uses a **MySQL connection pool** (10 concurrent connections) to handle multiple simultaneous API requests efficiently.
- All database tables are **indexed** on frequently queried columns (email, status, departure_time, driver_id, passenger_id) for fast lookups.
- The frontend uses **skeleton loaders** during data fetching to provide a smooth user experience without blank screens.
- **Rate limiting** on the authentication endpoints prevents abuse and keeps the email service within Gmail's sending limits.
- The background jobs use **`streak_processed` flags** instead of time-window queries to ensure no rides are missed or double-processed.

### 9.3 Challenges Faced and Solutions

| Challenge | Solution |
|-----------|----------|
| SMTP timeout on Render's IPv6 network | Forced IPv4 connections (`family: 4`) and increased socket timeouts |
| Double-booking race condition | MySQL `SELECT ... FOR UPDATE` row-level locking inside transactions |
| Users gaming streak system with fake rides | 24-hour cooldown per driver-passenger pair + `streak_processed` flag |
| Frontend distance manipulation | Distance always calculated server-side via OSRM API, never from client |
| False reports ruining trust scores | The Shield (first report = warning only) + trust-weighted penalty gate |
| OTP brute force attacks | Lock after 3 failed attempts + rate limit 3 requests per 10 minutes |
| Stale rides lingering forever | Auto-complete background job runs every 30 minutes |
| Connection pool exhaustion | Proper `connection.release()` in both success and error paths using `try/finally` |

### 9.4 Comparison with Objectives

| Objective | Status | Evidence |
|-----------|--------|----------|
| Full-stack mobile application | ✅ Achieved | Working React Native + Node.js app with 6 database tables |
| Secure OTP authentication | ✅ Achieved | SHA-256 hashing, rate limiting, brute force protection |
| Intelligent pricing algorithm | ✅ Achieved | Vehicle-specific multipliers, per-seat capping, OSRM distance |
| Behavioral trust system | ✅ Achieved | Trust score, streaks, penalties, anti-collusion cooldown |
| Reporting with pattern-matching | ✅ Achieved | Shield, pattern penalty, escalation, trust-weighted gate |
| Clean mobile UI | ✅ Achieved | Maps, modals, sliders, skeleton loaders, status indicators |
| Concurrency control | ✅ Achieved | FOR UPDATE locking, atomic transactions |
| Cloud deployment | ✅ Achieved | Render (backend), Aiven (database) |

---

## 10. Conclusions and Summary of the Work Done

### 10.1 Summary

We have successfully designed, developed, and deployed RideMates — a full-stack peer-to-peer ride-sharing mobile application built specifically for university students. The project went through complete software engineering phases: requirements analysis, system design, database modeling, backend development, frontend development, testing, and cloud deployment.

The final application consists of:
- A **React Native mobile app** (TypeScript, Expo) with 8 screens, 50+ reusable components, interactive maps, and location autocomplete.
- A **Node.js Backend API** (Express) with 4 route groups, 15+ API endpoints, JWT authentication, and 2 scheduled background jobs.
- A **MySQL database** (Aiven Cloud) with 6 normalized tables, foreign key relationships, optimized indexes, and constraint-based data integrity.

### 10.2 Key Contributions

1. **Vehicle-Specific Tiered Pricing** — Instead of a flat multiplier, we implemented different pricing caps based on vehicle type (bikes are cheaper to maintain than cars), making the pricing fairer for all vehicle categories.

2. **The Shield Anti-False-Report Mechanism** — A single malicious report cannot damage a user's trust score. Only when multiple independent people report the same user does the system apply a penalty. This is a novel approach for small-community platforms.

3. **Anti-Collusion Streak Cooldown** — Friends cannot boost each other's streak scores by creating fake rides. The 24-hour cooldown between identical driver-passenger pairs prevents this gaming behavior.

4. **Trust-Weighted Report Gate** — Users with low trust scores (below 70) cannot trigger penalties on others, preventing the weaponization of the report system by serial offenders.

5. **Backend Distance Verification** — Unlike most ride-sharing apps that trust front-end distance calculations, RideMates calculates distance server-side via OSRM, preventing users from manipulating fares by altering distance values.

### 10.3 Future Scope

The current version of RideMates provides a solid foundation that can be extended with:

- **Push Notifications** — Notify drivers when someone books their ride, and passengers when their booking is accepted.
- **In-App Payments** — Integrate UPI or wallet-based payments so passengers can pay drivers within the app.
- **Real-Time GPS Tracking** — Show the driver's live location to confirmed passengers.
- **Admin Dashboard** — A web-based panel for university authorities to monitor reports, manage users, and update fuel rates.
- **Multi-University Support** — Extend the platform to support multiple universities with their own email domains.
- **Ride Reviews and Ratings** — Let passengers rate their ride experience after completion.
- **Route-Based Matching** — Instead of exact city-to-city matching, match rides if the passenger's destination falls along the driver's route.
- **Carbon Savings Dashboard** — Show users how much CO₂ they've saved by sharing rides.

### 10.4 Conclusion

RideMates demonstrates that a university-specific ride-sharing platform can be built using modern, freely available technologies (React Native, Node.js, MySQL) with thoughtful features that address real transportation challenges. The trust system, pricing algorithm, and safety features make it more suitable for a closed community than generic ride-hailing apps. The project validates the hypothesis that university email verification combined with behavioral accountability mechanisms can create a safer and more affordable commuting experience for students.

---

## 11. References and Bibliography

1. **React Native Documentation** — https://reactnative.dev/docs/getting-started — Official React Native framework documentation.

2. **Expo Documentation** — https://docs.expo.dev/ — Managed workflow for React Native development and deployment.

3. **Express.js Documentation** — https://expressjs.com/ — Node.js web framework for REST API development.

4. **MySQL 8.0 Reference Manual** — https://dev.mysql.com/doc/refman/8.0/en/ — MySQL database server documentation.

5. **JSON Web Tokens (JWT) RFC 7519** — https://datatracker.ietf.org/doc/html/rfc7519 — Internet Engineering Task Force standard for JWT.

6. **OSRM API Documentation** — https://project-osrm.org/docs/v5.24.0/api/ — Open Source Routing Machine routing API for distance calculation.

7. **LocationIQ API Documentation** — https://locationiq.com/docs — Geocoding and autocomplete API for location search.

8. **Nodemailer Documentation** — https://nodemailer.com/ — Node.js module for sending emails via SMTP.

9. **BlaBlaCar** — https://www.blablacar.in/ — Intercity ride-sharing platform (referenced for feature comparison).

10. **India Motor Vehicles Act, 1988** — Central motor vehicle rules regarding use of private vehicles for cost-sharing purposes.

11. **Resnick, P., Zeckhauser, R., et al.** (2000). "Reputation Systems." *Communications of the ACM*, 43(12), 45-48. — Foundation for pattern-based reputation systems.

12. **Google Maps SDK for React Native** — https://github.com/react-native-maps/react-native-maps — Open-source package for native map integration.

13. **Aiven Cloud MySQL** — https://aiven.io/mysql — Managed MySQL database hosting service.

14. **Render Cloud Platform** — https://render.com/ — Cloud hosting platform for Node.js backend deployment.

15. **Expo Secure Store** — https://docs.expo.dev/versions/latest/sdk/securestore/ — Encrypted key-value storage for sensitive data on mobile devices.

---

## 12. Approved Project Topic

**Project Title:** RideMates — University Peer-to-Peer Commute Sharing Network

**Type:** Full-Stack Mobile Application (Capstone Project)

**Domain:** Transportation / Social Networking / Mobile App Development

**Technologies Used:** React Native, Expo, TypeScript, Node.js, Express, MySQL, JWT, OSRM, LocationIQ, Firebase, Gmail SMTP

**Description:** A mobile application that enables university students and faculty to share rides for daily commutes. The platform uses OTP-based email authentication restricted to university domains, an intelligent pricing algorithm with vehicle-specific caps, a behavioral trust score system with anti-gaming measures, and a pattern-matching report evaluation mechanism to create a safe, affordable, and accountable ride-sharing community within the university ecosystem.

---
