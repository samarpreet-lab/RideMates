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

The application introduces a **Strike Resilience Mode**, enabling drivers to flag alternate village link-road routes during highway protests and bus strikes — a frequent disruption in the Punjab-Haryana corridor. It also implements a **Trust System** with pattern-match reporting: users start with a trust score of 100 and a "Good Citizen" streak counter. A single conduct report triggers only a warning (the "Shield"), but corroborated reports from multiple independent users across different rides result in trust score deductions. No-shows are penalized immediately. Late booking cancellations also carry tiered penalties to protect drivers from last-minute seat loss.

After a successful booking, the app uses a **Native Handoff** pattern — providing WhatsApp and Call buttons linked to the driver's phone number — enabling off-platform coordination without building an in-app messaging system.

By combining domain-restricted authentication, capped pricing, visual map-based routing, a report-based trust system, and ride lifecycle management, RideMates delivers a trusted, affordable, and disruption-proof commute solution built exclusively for the university community.

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

7. **Trust & Accountability System** — Implement a report-based mutual accountability system where users can flag incidents (no-show, bad conduct, unsafe driving, harassment). A pattern-match shield ensures single reports trigger only warnings; penalties apply only when multiple independent reporters corroborate the same behavior across different rides.

8. **Ride Lifecycle Management** — Build a ride completion flow where drivers confirm trip completion, triggering a 12-hour grace period for reports. Clean rides (no reports) increment a "Good Citizen" streak for both driver and passengers.

9. **Tiered Cancellation Policy** — Enforce passenger cancellation penalties proportional to proximity to departure time (free if >4 hours, −2 points if ≤4 hours, −5 points if ≤30 minutes) to protect drivers from last-minute seat loss.

10. **Post-Booking Native Handoff** — After booking confirmation, provide actionable WhatsApp and Call buttons using deep links (`wa.me` and `tel:` protocols) for off-platform driver-passenger coordination, eliminating the need for in-app chat.

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
| FR-09 | Trust System | Each user starts with trust_score = 100 and current_streak = 0; penalties are applied for pattern-matched reports and late cancellations |
| FR-10 | Report Incident | Users can report no-show, bad conduct, unsafe driving, or harassment after a ride; single reports trigger a warning only ("Shield"); penalties require corroboration from 2+ independent reporters |
| FR-11 | Instant Booking | Drivers can enable auto-booking with a Trust Contract acknowledgment; women-only rides restrict instant booking to female-verified passengers |
| FR-12 | Booking Cancellation Tiers | >4h before: free; ≤4h: −2 trust points; ≤30min: −5 trust points |
| FR-13 | Ride Lifecycle | 2 hours post-departure, driver is prompted to complete the ride; 12-hour grace period for reports; clean rides award streak to all participants |
| FR-14 | Post-Booking Handoff | Booking success screen provides WhatsApp and Call buttons for off-platform coordination via native deep links |

### Non-Functional Requirements

| ID | Requirement | Description |
|---|---|---|
| NFR-01 | Security | Firebase token-based authentication on all protected API endpoints |
| NFR-02 | Concurrency | SQL transactions with row-level locking prevent double-booking |
| NFR-03 | Performance | API response time under 500ms for search queries |
| NFR-04 | Usability | Intuitive mobile UI with loading states, error feedback, and map interactions |
| NFR-05 | Portability | Cross-platform (Android + iOS) via React Native / Expo |
| NFR-06 | Fairness | Pattern-match shield prevents single false reports from penalizing users; penalties require corroboration |

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
│   ┌──────────────┐       ┌──────────┐                               │
│   │  fuel_rates  │       │  reports │                               │
│   └──────────────┘       └──────────┘                               │
│   (Pricing reference)      (Trust & accountability)                  │
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
5. Mapbox APIs handle geocoding (city → coordinates) and route computation (polyline generation). Regional hubs (e.g., Mukerian, Jalandhar) are resolved via an offline JSON dataset; Mapbox Geocoding is used only as a fallback.

---

## 6. Technology Stack

| Layer | Technology | Justification |
|---|---|---|
| **Frontend** | React Native (Expo SDK 51+) | Single codebase for Android and iOS; Expo provides managed workflow for faster development with OTA updates |
| **Backend** | Node.js 18 + Express.js | Non-blocking I/O suited for concurrent API requests; JavaScript across the full stack reduces context-switching |
| **Database** | MySQL 8.0 (Aiven Cloud) | ACID-compliant relational database; supports transactions with row-level locking required for concurrent seat booking |
| **Authentication** | Firebase Auth | Managed email OTP service with domain restriction capability; provides short-lived ID tokens (60-min expiry) for stateless API auth |
| **Maps & Routing** | Local JSON + Mapbox Geocoding (fallback) + Directions API | Resolves regional hub coordinates offline via JSON dataset; falls back to Mapbox for unknown cities; Directions API computes driving routes with polyline geometry; free tier sufficient for project scale |
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
│    gender          │    │    │    dest_lat/lng    │    │    │    status          │  │ │
│    university      │    │    │    distance_km     │    │    │    is_reported     │  │ │
│    role            │    │    │    departure_time  │    │    │    cancel_penalty  │  │ │
│    trust_score     │    │    │    available_seats │    │    │    booked_at       │  │ │
│    current_streak  │    │    │    vehicle_type    │    │    └────────────────────┘  │ │
│    created_at      │    │    │    base_price      │    │                            │ │
└────────┬───────────┘    │    │    capped_price    │    │         1:N                │ │
         │                │    │    is_emergency    │    └────────────────────────────┘ │
         │    1:N         │    │    is_women_only   │              1:N                  │
         └────────────────┘    │    instant_booking │    ┌─────────────────────────────┘
         │                     │    completed_at    │    │
         │    1:N              │    status          │    │
         └─────────────────────┤    created_at      │    │
                               └────────────────────┘    │
                                                         │
                    ┌────────────────────────────────────┘
                    │         USERS (as passenger)

┌────────────────────┐
│     REPORTS        │
├────────────────────┤
│ PK id              │
│ FK ride_id         │ → rides.id
│ FK reporter_id     │ → users.id
│ FK reported_user_id│ → users.id
│    reason           │ (no_show, bad_conduct, unsafe_driving, harassment)
│    description      │
│    penalty_applied  │
│    created_at       │
└────────────────────┘
```

### Table Summary

| Table | Records | Key Columns | Purpose |
|---|---|---|---|
| `users` | University members | `firebase_uid`, `email`, `role`, `trust_score`, `current_streak`, `gender` | Stores verified user profiles linked to Firebase Auth; includes trust score (default 100) and good-citizen streak counter |
| `rides` | Driver-posted rides | `driver_id`, `origin/dest`, `capped_price`, `available_seats`, `is_emergency_route`, `is_women_only`, `instant_booking`, `completed_at` | Stores ride details with auto-calculated pricing, emergency flag, women-only flag, instant booking state, and completion tracking |
| `bookings` | Passenger reservations | `ride_id`, `passenger_id`, `seats_booked`, `price_paid`, `is_reported`, `cancellation_penalty` | Links passengers to rides; tracks report flags and cancellation penalties; UNIQUE constraint prevents duplicate bookings |
| `reports` | Incident reports | `ride_id`, `reporter_id`, `reported_user_id`, `reason`, `penalty_applied` | Stores user-filed reports for no-show, bad conduct, unsafe driving, or harassment; drives the pattern-match trust penalty system |
| `fuel_rates` | Reference data | `fuel_type`, `rate_per_litre` | Current fuel prices used by the pricing algorithm |

### Key Constraints

- **Referential Integrity**: Foreign keys with `ON DELETE CASCADE` ensure orphan records are automatically removed.
- **Duplicate Prevention**: `UNIQUE KEY (ride_id, passenger_id)` on bookings prevents a passenger from booking the same ride twice.
- **Report Uniqueness**: `UNIQUE KEY (ride_id, reporter_id)` on reports prevents a user from filing multiple reports for the same ride.
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

Integrates a hybrid geocoding approach: a local JSON dataset resolves regional hub city names (Mukerian, Jalandhar, Phagwara, etc.) to GPS coordinates offline, while Mapbox Geocoding API serves as a fallback for cities not in the dataset. The Mapbox Directions API computes driving routes, and the route is rendered as an interactive polyline on `react-native-maps`. The module also uses `expo-location` to obtain the user's current GPS position, with proper async state management (loading, permission, error) to prevent crashes when location permission is pending.

### Module 5: Strike Resilience Module

Provides a boolean toggle for drivers to indicate they are taking alternate village link-road routes during highway disruptions. Search results display an orange `⚠️ ALTERNATE ROUTE` badge on emergency rides. Passengers can filter search results to show only strike-resilient rides.

### Module 6: Report & Accountability Module

Enables post-ride incident reporting with a pattern-match shield to prevent abuse. Users can file reports categorized as: no-show, bad conduct, unsafe driving, or harassment. A single conduct report triggers only a system warning with zero point deduction (the "Shield"), protecting users from false accusations. Trust score penalties (−10 per report) are applied only when 2 or more independent reporters corroborate the same behavior across different rides within a 30-day window. Three or more pattern-matched reports trigger an escalated penalty (−25 additional). No-show reports bypass the shield and immediately deduct −5 points, since a no-show is an objectively verifiable event. A cooldown of 3 reports per 24 hours prevents system abuse.

### Module 7: Ride Lifecycle Module

Manages the ride completion flow. Two hours after the scheduled departure time, the driver is prompted on their next app open: "Is your trip to {destination} finished?" Upon tapping "Complete Ride", the system records the completion timestamp and transitions all confirmed bookings to completed status. A 12-hour grace period begins, during which all participants may file reports. If no reports are filed within the grace window, the system awards a "Clean Ride" by incrementing `current_streak` for both the driver and all passengers. An auto-completion fallback ensures rides are automatically completed if the driver doesn't respond within 24 hours.

### Module 8: Booking Cancellation & Trust Module

Enforces a tiered cancellation penalty system to protect drivers:
- Cancellation **> 4 hours** before departure: **No penalty** (free cancellation)
- Cancellation **≤ 4 hours but > 30 minutes** before departure: **−2 Trust Points**
- Cancellation **≤ 30 minutes** before departure: **−5 Trust Points** (equivalent to a no-show)

All penalties reset the user's `current_streak` to 0. The penalty amount is recorded in `bookings.cancellation_penalty` for auditability.

### Module 9: Post-Booking Native Handoff

After a successful booking, the confirmation screen displays the booking summary alongside two actionable buttons: a WhatsApp button (using the `wa.me` API with pre-filled ride details) and a Call button (using the `tel:` URI protocol). This "Native Handoff" pattern enables driver-passenger coordination without requiring an in-app messaging system. If the driver has no phone number on file, both buttons are hidden with a fallback message.

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
   │        │───┼──│Complete  │  │Cancel Booking│────┼───│          │
   │        │   │  │Ride      │  └──────────────┘    │   │          │
   │        │   │  └──────────┘  ┌──────────────┐    │   │          │
   │        │───┼──│View My   │  │ View My      │────┼───│          │
   │        │   │  │ Rides    │  │ Bookings     │    │   │          │
   │        │   │  └──────────┘  └──────────────┘    │   │          │
   │        │───┼──│ Report   │──────────────────────┼───│          │
   │        │   │  │Incident  │  (both roles)        │   │          │
   └────┬───┘   │  └──────────┘                      │   └────┬─────┘
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
| **Phase 6: Trust & Reports** | Day 9–10 | Report filing UI; pattern-match evaluation logic; trust score display on profile; cancellation penalty tiers; ride lifecycle completion flow |

---

## 12. Expected Outcomes

Upon successful completion, RideMates will deliver:

1. **A functional cross-platform mobile application** (Android/iOS) that allows verified university members to post, search, and book shared rides.

2. **A secure, domain-restricted authentication system** preventing unauthorized access by non-university users.

3. **An algorithmically capped pricing model** that ensures cost-sharing without profit, maintaining legal compliance with private vehicle regulations.

4. **A concurrency-safe booking engine** using database-level transaction locking, demonstrated to handle simultaneous booking attempts without data corruption.

5. **Interactive map-based route visualization** converting text inputs to GPS-accurate driving routes, with offline resolution for regional hubs.

6. **A disruption-resilient feature** that enables continued commute coordination during regional strikes and highway blockades.

7. **A report-based mutual accountability system** with pattern-match shielding that prevents false accusations while penalizing verified bad behavior across multiple independent reports.

8. **A ride lifecycle management system** with driver-confirmed completion, 12-hour grace periods for report filing, and automatic "Good Citizen" streak awards for clean rides.

9. **A post-booking native handoff** enabling off-platform coordination via WhatsApp and Call deep links without requiring in-app messaging infrastructure.

---

## 13. Limitations & Future Scope

### Current Limitations

- **Single University**: The current implementation is scoped to LPU (`@lpu.in`). Multi-university support requires a configurable domain whitelist.
- **No Real-Time Tracking**: Routes are pre-computed and static; live GPS tracking of the driver's vehicle is not implemented.
- **No In-App Payments**: The application calculates the price but does not process payments — cash settlement is assumed.
- **No In-App Chat**: Driver-passenger communication uses the Native Handoff pattern (WhatsApp and Call deep links) instead of a built-in messaging system.
- **No Push Notifications**: Ride completion prompts and report warnings are displayed in-app on next open, not via push notifications.

### Future Scope

- **Multi-University Federation**: Allow multiple universities to join with their own email domains.
- **Live GPS Tracking**: Integrate real-time driver location sharing during an active ride using WebSockets.
- **UPI Payment Integration**: Add Razorpay or PayTM UPI payment gateway for cashless in-app transactions.
- **In-App Chat**: Real-time messaging between driver and passenger using Firebase Realtime Database.
- **AI Route Matching**: Use machine learning to suggest rides based on the user's recurring commute patterns.
- **Push Notifications**: Firebase Cloud Messaging for booking confirmations, ride reminders, completion prompts, trust warnings, and strike alerts.
- **Trust Score Recovery**: Allow users to recover trust score points by maintaining extended clean-ride streaks (e.g., +1 point per 10-streak milestone).

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
*Synopsis Version: 1.2 | February 2026*
