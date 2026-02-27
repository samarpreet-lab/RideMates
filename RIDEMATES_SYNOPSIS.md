# PROJECT SYNOPSIS

---

**Project Title:** RideMates — University-Exclusive Peer-to-Peer Commute Network

**Academic Year:** 2025–2026

**University:** Lovely Professional University (LPU)

**Domain:** Mobile Application Development — Transportation & Commute Sharing

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Proposed System](#4-proposed-system)
5. [System Architecture](#5-system-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Database Design](#7-database-design)
8. [Module Description](#8-module-description)
9. [Pricing Algorithm](#9-pricing-algorithm)
10. [System Flow Diagrams](#10-system-flow-diagrams)
11. [Implementation Plan](#11-implementation-plan)
12. [Expected Outcomes](#12-expected-outcomes)
13. [Limitations & Future Scope](#13-limitations--future-scope)
14. [References](#14-references)

---

<!-- PAGE 1 -->

## 1. Introduction

Daily commuting is a persistent challenge for university day-scholars and faculty members who live off-campus. Existing transportation options — commercial ride-hailing apps (Uber, Rapido), open carpooling platforms (BlaBlaCar), and public transport (state buses) — each fail to address the unique constraints of the university commuter: affordability, safety, and reliability.

**RideMates** is a cross-platform mobile application designed as a hyper-local, university-exclusive peer-to-peer commute network. It connects verified university members who have empty vehicle seats with peers traveling the same route. Unlike commercial ride-hailing, RideMates operates strictly on a cost-sharing model — drivers split fuel costs with passengers but are algorithmically prevented from earning a profit, ensuring compliance with "White Plate" (non-commercial vehicle) regulations in India.

The application introduces a **Strike Resilience Mode**, enabling drivers to flag alternate village link-road routes during highway protests and bus strikes — a frequent disruption in the Punjab-Haryana corridor. By combining domain-restricted authentication, capped pricing, and visual map-based routing, RideMates delivers a trusted, affordable, and disruption-proof commute solution built exclusively for the university community.

---

## 2. Problem Statement

University day-scholars in India, particularly in semi-urban regions, face a daily commute problem that no existing platform adequately solves:

| Challenge | Current Solution | Why It Fails |
|---|---|---|
| **High daily cost** | Rapido / Uber / Ola | ₹200–400 per day is unsustainable on a student budget over an academic year |
| **Safety concerns** | BlaBlaCar / open carpooling | Matches users with unverified strangers; no institutional identity guarantee |
| **Unreliable transport** | State buses / public transport | Frequently disrupted by bus strikes, highway roadblocks, and protest gridlocks |
| **No campus-specific tool** | WhatsApp groups | Informal, unstructured, no pricing transparency, no route visualization |

Students currently resort to informal WhatsApp groups to coordinate rides, which lack any pricing logic, route visualization, or safety verification. There is no application that provides a closed, trusted network limited to verified university members with built-in cost controls and strike-resilient alternate routing.

**RideMates addresses this gap** by building a mobile platform where every user is identity-verified through their university email, every ride price is algorithmically capped to prevent profiteering, and every route is visually rendered on an interactive map.

---

<!-- PAGE 2 -->

## 3. Objectives

The primary objectives of the RideMates project are:

1. **Domain-Restricted Authentication** — Implement a registration and login system that exclusively allows users with verified university email addresses (e.g., `@lpu.in`), ensuring every participant is a confirmed student or staff member.

2. **Fair-Share Capped Pricing** — Develop a pricing algorithm that calculates the baseline fuel cost of a journey and hard-caps the maximum price a driver can charge, preventing commercial profit and ensuring legal compliance with non-commercial vehicle regulations.

3. **Dynamic Route Visualization** — Integrate Mapbox Geocoding and Directions APIs to convert city names into GPS coordinates, compute driving routes, and render the journey as an interactive polyline on a map, giving passengers a visual preview before booking.

4. **Concurrency-Safe Booking System** — Build a seat reservation mechanism using SQL transactions with row-level locking (`SELECT ... FOR UPDATE`) to prevent double-booking race conditions when multiple users attempt to book the last available seat simultaneously.

5. **Strike Resilience Mode** — Provide drivers with a toggle to indicate alternate village link-road routes during highway disruptions, with a visual badge system to inform passengers of the routing change.

6. **Scalable Client-Server Architecture** — Design the system with a clear separation between the React Native mobile frontend and the Node.js/Express backend API, connected to a cloud-hosted MySQL database, following the MVC architectural pattern.

---

## 4. Proposed System

RideMates is a two-role system: **Drivers** (who post available rides) and **Passengers** (who search and book seats). A single user can operate in both roles.

### Functional Requirements

| ID | Requirement | Description |
|---|---|---|
| FR-01 | University Email Registration | Users register using `@lpu.in` email; non-university emails are rejected |
| FR-02 | Post a Ride | Drivers input origin, destination, departure time, seats, and set a price via slider |
| FR-03 | Search Rides | Passengers search by origin-destination pair with optional date and emergency-route filters |
| FR-04 | Route Visualization | Both drivers and passengers see the computed route drawn on an interactive map |
| FR-05 | Price Capping | System auto-calculates the max allowed price; driver's set price cannot exceed the cap |
| FR-06 | Book a Seat | Passengers reserve seats; system atomically decrements available count |
| FR-07 | Strike Resilience Toggle | Drivers flag rides using alternate village roads during highway disruptions |
| FR-08 | Booking History | Users view their past rides and bookings with status tracking |

### Non-Functional Requirements

| ID | Requirement | Description |
|---|---|---|
| NFR-01 | Security | Firebase token-based authentication on all protected API endpoints |
| NFR-02 | Concurrency | SQL transactions with row-level locking prevent double-booking |
| NFR-03 | Performance | API response time under 500ms for search queries |
| NFR-04 | Usability | Intuitive mobile UI with loading states, error feedback, and map interactions |
| NFR-05 | Portability | Cross-platform (Android + iOS) via React Native / Expo |

---

<!-- PAGE 3-4 -->

## 5. System Architecture

RideMates follows a **three-tier client-server architecture**:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER                            │
│                   React Native (Expo) Mobile App                    │
│                                                                     │
│   ┌──────────┐  ┌───────────┐  ┌────────────┐  ┌───────────────┐  │
│   │  Login   │  │   Home    │  │ Post Ride  │  │  Search Map   │  │
│   │  Screen  │  │  Screen   │  │  Screen    │  │  Screen       │  │
│   └────┬─────┘  └─────┬─────┘  └─────┬──────┘  └──────┬────────┘  │
│        │              │              │               │             │
│        └──────────────┴──────────────┴───────────────┘             │
│                              │                                      │
│                    Axios HTTP Client                                │
│                    (with Firebase Token)                            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ REST API (JSON)
┌──────────────────────────────┴──────────────────────────────────────┐
│                        APPLICATION TIER                             │
│                    Node.js + Express.js Server                      │
│                                                                     │
│   ┌───────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│   │ Auth          │  │ Ride            │  │ Booking             │  │
│   │ Controller    │  │ Controller      │  │ Controller          │  │
│   │ (domain check)│  │ (price calc)    │  │ (TX + row lock)     │  │
│   └───────┬───────┘  └────────┬────────┘  └──────────┬──────────┘  │
│           │                   │                      │             │
│           └───────────────────┴──────────────────────┘             │
│                              │                                      │
│                   Firebase Admin SDK                                │
│                   (Token Verification)                              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ mysql2 (Connection Pool)
┌──────────────────────────────┴──────────────────────────────────────┐
│                          DATA TIER                                  │
│                    MySQL 8.0 (Aiven Cloud)                          │
│                                                                     │
│   ┌──────────┐       ┌──────────┐       ┌──────────────┐           │
│   │  users   │──1:N──│  rides   │──1:N──│  bookings    │           │
│   └──────────┘       └──────────┘       └──────────────┘           │
│        │                                       │                    │
│        └──────────────────1:N──────────────────┘                    │
│                                                                     │
│   ┌──────────────┐                                                  │
│   │  fuel_rates  │ (Reference table for pricing)                    │
│   └──────────────┘                                                  │
└─────────────────────────────────────────────────────────────────────┘

                    EXTERNAL SERVICES
    ┌──────────────────┐    ┌──────────────────────┐
    │  Firebase Auth   │    │  Mapbox API          │
    │  (Email OTP)     │    │  (Geocoding +        │
    │                  │    │   Directions)         │
    └──────────────────┘    └──────────────────────┘
```

### Data Flow Summary

1. User opens the app → Firebase Auth verifies university email via OTP.
2. Frontend obtains a Firebase ID Token and attaches it to every API request.
3. Backend middleware verifies the token, extracts user identity, and processes the request.
4. Ride creation triggers the pricing algorithm; booking triggers an SQL transaction with row-level locking.
5. Mapbox APIs handle geocoding (city → coordinates) and route computation (polyline generation).

---

## 6. Technology Stack

| Layer | Technology | Justification |
|---|---|---|
| **Frontend** | React Native (Expo SDK 51+) | Single codebase for Android and iOS; Expo provides managed workflow for faster development with OTA updates |
| **Backend** | Node.js 18 + Express.js | Non-blocking I/O suited for concurrent API requests; JavaScript across the full stack reduces context-switching |
| **Database** | MySQL 8.0 (Aiven Cloud) | ACID-compliant relational database; supports transactions with row-level locking required for concurrent seat booking |
| **Authentication** | Firebase Auth | Managed email OTP service with domain restriction capability; provides short-lived ID tokens (60-min expiry) for stateless API auth |
| **Maps & Routing** | Mapbox Geocoding + Directions API | Converts text to coordinates and computes driving routes with polyline geometry; free tier sufficient for project scale |
| **Device Location** | expo-location | Native GPS access with permission management for the Expo environment |
| **HTTP Client** | Axios | Promise-based HTTP client with request/response interceptors for automatic token attachment |
| **Date/Time** | dayjs | Lightweight (2KB) library for UTC ↔ local timezone conversion, preventing the MySQL timezone mismatch trap |

---

<!-- PAGE 4-5 -->

## 7. Database Design

### Entity-Relationship Diagram

```
┌────────────────────┐         ┌────────────────────┐         ┌────────────────────┐
│      USERS         │         │       RIDES        │         │     BOOKINGS       │
├────────────────────┤         ├────────────────────┤         ├────────────────────┤
│ PK id              │         │ PK id              │         │ PK id              │
│    firebase_uid    │         │ FK driver_id ──────┤────┐    │ FK ride_id ────────┤──┐
│    full_name       │    ┌───▶│    origin_city     │    │    │ FK passenger_id ───┤──┼─┐
│    email (UNIQUE)  │    │    │    origin_lat/lng  │    │    │    seats_booked    │  │ │
│    phone           │    │    │    dest_city       │    │    │    price_paid      │  │ │
│    university      │    │    │    dest_lat/lng    │    │    │    status          │  │ │
│    role            │    │    │    distance_km     │    │    │    booked_at       │  │ │
│    created_at      │    │    │    departure_time  │    │    └────────────────────┘  │ │
└────────┬───────────┘    │    │    available_seats │    │                            │ │
         │                │    │    vehicle_type    │    │         1:N                │ │
         │    1:N         │    │    base_price      │    └────────────────────────────┘ │
         └────────────────┘    │    capped_price    │              1:N                  │
         │                     │    is_emergency    │    ┌─────────────────────────────┘
         │    1:N              │    status          │    │
         └─────────────────────┤    created_at      │    │
                               └────────────────────┘    │
                                                         │
                    ┌────────────────────────────────────┘
                    │         USERS (as passenger)
```

### Table Summary

| Table | Records | Key Columns | Purpose |
|---|---|---|---|
| `users` | University members | `firebase_uid`, `email`, `role` | Stores verified user profiles linked to Firebase Auth |
| `rides` | Driver-posted rides | `driver_id`, `origin/dest`, `capped_price`, `available_seats`, `is_emergency_route` | Stores ride details with auto-calculated pricing and emergency flag |
| `bookings` | Passenger reservations | `ride_id`, `passenger_id`, `seats_booked`, `price_paid` | Links passengers to rides; UNIQUE constraint prevents duplicate bookings |
| `fuel_rates` | Reference data | `fuel_type`, `rate_per_litre` | Current fuel prices used by the pricing algorithm |

### Key Constraints

- **Referential Integrity**: Foreign keys with `ON DELETE CASCADE` ensure orphan records are automatically removed.
- **Duplicate Prevention**: `UNIQUE KEY (ride_id, passenger_id)` on bookings prevents a passenger from booking the same ride twice.
- **Seat Validation**: `CHECK (available_seats >= 0)` prevents negative seat counts at the database level.

---

## 8. Module Description

### Module 1: Authentication Module

Handles user registration and login using Firebase Email OTP. The frontend validates the email domain (`@lpu.in`) before sending to Firebase. Upon successful Firebase verification, the backend creates a corresponding user record in MySQL. All subsequent API requests carry a Firebase ID Token, which is verified by backend middleware. Tokens are refreshed automatically using `getIdToken()` before each request to handle the 60-minute expiry.

### Module 2: Ride Management Module

Enables drivers to post new rides by specifying origin, destination, departure time, vehicle details, and available seats. The system auto-calculates the base fuel cost and enforces a price cap (1.5× of base cost). Drivers adjust their price via a slider but cannot exceed the cap. The module also handles ride search with filters for origin, destination, date, and emergency-route status.

### Module 3: Booking Module

Allows passengers to book seats on available rides. This module uses SQL transactions with `SELECT ... FOR UPDATE` row-level locking to prevent the double-booking race condition — when two users try to book the last seat simultaneously, only one succeeds while the other receives an "insufficient seats" error. Seat count is decremented atomically within the transaction.

### Module 4: Map & Routing Module

Integrates Mapbox Geocoding API to convert city names to GPS coordinates and Mapbox Directions API to compute the driving route. The route is rendered as an interactive polyline on `react-native-maps`. The module also uses `expo-location` to obtain the user's current GPS position, with proper async state management (loading, permission, error) to prevent crashes when location permission is pending.

### Module 5: Strike Resilience Module

Provides a boolean toggle for drivers to indicate they are taking alternate village link-road routes during highway disruptions. Search results display an orange `⚠️ ALTERNATE ROUTE` badge on emergency rides. Passengers can filter search results to show only strike-resilient rides.

---

<!-- PAGE 5-6 -->

## 9. Pricing Algorithm

The core pricing logic follows the BlaBlaCar cost-sharing model to ensure legal compliance:

### Formula

$$
\text{base\_cost} = \frac{\text{distance\_km} \times \text{fuel\_rate\_per\_litre}}{\text{vehicle\_mileage\_kmpl}}
$$

$$
\text{max\_cap} = \text{base\_cost} \times 1.5
$$

$$
\text{per\_seat\_price} = \frac{\min(\text{driver\_set\_price},\ \text{max\_cap})}{\text{total\_passengers}}
$$

### Worked Example

| Step | Calculation | Result |
|---|---|---|
| Input | Distance = 40 km, Fuel Rate = ₹105/L, Mileage = 15 km/L | — |
| Base Cost | (40 × 105) / 15 | **₹280.00** |
| Max Cap | 280 × 1.5 | **₹420.00** |
| Driver Sets ₹350 | min(350, 420) | **₹350.00** (within cap ✅) |
| Per-Seat (3 passengers) | 350 / 3 | **₹116.67** |

If the driver attempts to set ₹500, the system auto-clamps it to ₹420 (the max cap), preventing profit.

---

## 10. System Flow Diagrams

### 10.1 Authentication Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User    │────▶│  Frontend    │────▶│  Firebase    │────▶│  Backend     │
│  Input   │     │  Domain      │     │  Email OTP   │     │  MySQL       │
│  Email   │     │  Validation  │     │  Verify      │     │  INSERT user │
└──────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                       │                     │                     │
                  @lpu.in? ✅           OTP Match? ✅        Row Created ✅
                  @gmail? ❌            (blocked)            (blocked)
```

### 10.2 Ride Booking Flow (with Concurrency Handling)

```
Passenger clicks "Book"
        │
        ▼
┌───────────────────┐
│ BEGIN TRANSACTION  │
└────────┬──────────┘
         │
         ▼
┌───────────────────────────────────┐
│ SELECT available_seats            │
│ FROM rides WHERE id = ?           │
│ FOR UPDATE  ◄── Row is LOCKED    │
└────────┬──────────────────────────┘
         │
    seats ≥ requested?
    ┌────┴────┐
   YES       NO
    │         │
    ▼         ▼
┌────────┐  ┌──────────┐
│ UPDATE │  │ ROLLBACK │──▶ Return 400: "Not enough seats"
│ seats  │  └──────────┘
│ INSERT │
│ booking│
└───┬────┘
    │
    ▼
┌──────────┐
│ COMMIT   │──▶ Return 201: "Booking confirmed"
└──────────┘
```

### 10.3 Overall Use Case Diagram

```
                        ┌─────────────────────┐
                        │     RideMates       │
                        │      System         │
                ┌───────┼─────────────────────┼───────┐
                │       │                     │       │
   ┌────────┐   │  ┌────┴─────┐  ┌───────────┴──┐    │   ┌──────────┐
   │ Driver │───┼──│Post Ride │  │ Search Rides │────┼───│Passenger │
   │        │   │  └──────────┘  └──────────────┘    │   │          │
   │        │   │  ┌──────────┐  ┌──────────────┐    │   │          │
   │        │───┼──│ Toggle   │  │  Book Seat   │────┼───│          │
   │        │   │  │Emergency │  └──────────────┘    │   │          │
   │        │   │  └──────────┘  ┌──────────────┐    │   │          │
   │        │───┼──│View My   │  │ View My      │────┼───│          │
   │        │   │  │ Rides    │  │ Bookings     │    │   │          │
   └────┬───┘   │  └──────────┘  └──────────────┘    │   └────┬─────┘
        │       │       ┌──────────────┐              │        │
        │       │       │   Login /    │              │        │
        └───────┼───────│  Register   │──────────────┼────────┘
                │       │ (@lpu.in)   │              │
                │       └──────────────┘              │
                └─────────────────────────────────────┘
```

---

<!-- PAGE 6-7 -->

## 11. Implementation Plan

| Phase | Duration | Deliverables |
|---|---|---|
| **Phase 1: Database** | Day 1 | Cloud MySQL provisioned on Aiven; all `CREATE TABLE` statements executed; seed data for fuel rates inserted |
| **Phase 2: Backend API** | Day 2–3 | Express server with auth, ride, and booking controllers; all endpoints tested via Postman; price calculator utility; SQL transaction for booking |
| **Phase 3: Authentication** | Day 4 | Firebase Auth initialized in React Native; login screen with domain validation; token-based protected routes; auto-refresh token interceptor |
| **Phase 4: Maps & Search** | Day 5–7 | Mapbox geocoding and directions integration; route polyline rendering; ride search screen with results; async location permission handling |
| **Phase 5: Pricing & Posting** | Day 8 | Post ride form with price slider; real-time cap visualization; strike resilience toggle; end-to-end testing |

---

## 12. Expected Outcomes

Upon successful completion, RideMates will deliver:

1. **A functional cross-platform mobile application** (Android/iOS) that allows verified university members to post, search, and book shared rides.

2. **A secure, domain-restricted authentication system** preventing unauthorized access by non-university users.

3. **An algorithmically capped pricing model** that ensures cost-sharing without profit, maintaining legal compliance with private vehicle regulations.

4. **A concurrency-safe booking engine** using database-level transaction locking, demonstrated to handle simultaneous booking attempts without data corruption.

5. **Interactive map-based route visualization** converting text inputs to GPS-accurate driving routes.

6. **A disruption-resilient feature** that enables continued commute coordination during regional strikes and highway blockades.

---

## 13. Limitations & Future Scope

### Current Limitations

- **Single University**: The current implementation is scoped to LPU (`@lpu.in`). Multi-university support requires a configurable domain whitelist.
- **No Real-Time Tracking**: Routes are pre-computed and static; live GPS tracking of the driver's vehicle is not implemented.
- **No In-App Payments**: The application calculates the price but does not process payments — cash settlement is assumed.
- **No Chat/Messaging**: Driver-passenger communication relies on phone numbers displayed after booking.
- **Manual Ride Completion**: Rides must be manually marked as "completed" by the driver.

### Future Scope

- **Multi-University Federation**: Allow multiple universities to join with their own email domains.
- **Live GPS Tracking**: Integrate real-time driver location sharing during an active ride using WebSockets.
- **UPI Payment Integration**: Add Razorpay or PayTM UPI payment gateway for cashless in-app transactions.
- **In-App Chat**: Real-time messaging between driver and passenger using Firebase Realtime Database.
- **AI Route Matching**: Use machine learning to suggest rides based on the user's recurring commute patterns.
- **Rating System**: Post-ride driver and passenger ratings for community trust building.
- **Push Notifications**: Firebase Cloud Messaging for booking confirmations, ride reminders, and strike alerts.

---

## 14. References

1. Firebase Authentication Documentation — https://firebase.google.com/docs/auth
2. Mapbox Geocoding API — https://docs.mapbox.com/api/search/geocoding/
3. Mapbox Directions API — https://docs.mapbox.com/api/navigation/directions/
4. React Native (Expo) Documentation — https://docs.expo.dev/
5. Express.js Official Guide — https://expressjs.com/en/guide/
6. MySQL 8.0 Reference Manual — https://dev.mysql.com/doc/refman/8.0/en/
7. MySQL Transactions and Locking — https://dev.mysql.com/doc/refman/8.0/en/innodb-locking-reads.html
8. BlaBlaCar Cost-Sharing Model — https://blog.blablacar.com/about-us
9. Motor Vehicles Act, 1988 (India) — Regulations on non-commercial vehicle usage
10. dayjs Documentation — https://day.js.org/

---

*Project: RideMates — University Peer-to-Peer Commute Network*
*Synopsis Version: 1.0 | February 2026*
