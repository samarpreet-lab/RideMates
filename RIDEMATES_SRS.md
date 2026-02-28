# Software Requirements Specification (SRS)

## RideMates — University-Exclusive Peer-to-Peer Commute Network

---

**Document Version:** 1.3

**Date:** February 28, 2026

**Prepared for:** Lovely Professional University — Capstone Project

**Standard:** Based on IEEE 830-1998 (Recommended Practice for Software Requirements Specifications)

---

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | February 27, 2026 | Project Team | Initial SRS creation |
| 1.1 | February 28, 2026 | Project Team | Added Trust System fields to schema, hybrid geocoding model, Instant Booking Trust Contract, Report Module for mutual accountability, and Post-Booking Native Handoff UI |
| 1.2 | February 28, 2026 | Project Team | v2.1 Blueprint: Ride Lifecycle completion trigger, tiered passenger cancellation penalties, pattern-match reporting shield (single report = warning only), schema additions (current_streak, bookings.is_reported, rides.completed_at) |
| 1.3 | February 28, 2026 | Project Team | Tiered Pricing: vehicle-specific maintenance multipliers (bike/scooter 1.2x, auto 1.35x, car 1.5x), vehicle_type ENUM expanded to include 'scooter', Section 8.1 algorithm reworked with multi-vehicle worked examples |

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Purpose](#11-purpose)
   - 1.2 [Scope](#12-scope)
   - 1.3 [Definitions, Acronyms, and Abbreviations](#13-definitions-acronyms-and-abbreviations)
   - 1.4 [References](#14-references)
   - 1.5 [Overview](#15-overview)
2. [Overall Description](#2-overall-description)
   - 2.1 [Product Perspective](#21-product-perspective)
   - 2.2 [Product Functions](#22-product-functions)
   - 2.3 [User Classes and Characteristics](#23-user-classes-and-characteristics)
   - 2.4 [Operating Environment](#24-operating-environment)
   - 2.5 [Design and Implementation Constraints](#25-design-and-implementation-constraints)
   - 2.6 [Assumptions and Dependencies](#26-assumptions-and-dependencies)
3. [System Architecture](#3-system-architecture)
   - 3.1 [Architecture Overview](#31-architecture-overview)
   - 3.2 [Technology Stack](#32-technology-stack)
   - 3.3 [Deployment Architecture](#33-deployment-architecture)
4. [Specific Requirements](#4-specific-requirements)
   - 4.1 [Functional Requirements](#41-functional-requirements)
     - 4.1.1 [Authentication Module](#411-authentication-module)
     - 4.1.2 [Ride Management Module](#412-ride-management-module)
     - 4.1.3 [Booking Module](#413-booking-module)
     - 4.1.4 [Map & Routing Module](#414-map--routing-module)
     - 4.1.5 [Report & Accountability Module](#415-report--accountability-module)
     - 4.1.6 [Ride Lifecycle Module](#416-ride-lifecycle-module)
   - 4.2 [External Interface Requirements](#42-external-interface-requirements)
   - 4.3 [Non-Functional Requirements](#43-non-functional-requirements)
5. [Data Requirements](#5-data-requirements)
   - 5.1 [Database Schema](#51-database-schema)
   - 5.2 [Data Dictionary](#52-data-dictionary)
   - 5.3 [Entity-Relationship Diagram](#53-entity-relationship-diagram)
6. [API Specification](#6-api-specification)
   - 6.1 [Authentication Endpoints](#61-authentication-endpoints)
   - 6.2 [Ride Endpoints](#62-ride-endpoints)
   - 6.3 [Booking Endpoints](#63-booking-endpoints)
   - 6.4 [Error Response Format](#64-error-response-format)
7. [Behavioral Models](#7-behavioral-models)
   - 7.1 [Use Case Diagrams](#71-use-case-diagrams)
   - 7.2 [Activity Diagrams](#72-activity-diagrams)
   - 7.3 [Sequence Diagrams](#73-sequence-diagrams)
8. [Algorithms](#8-algorithms)
   - 8.1 [Pricing Algorithm](#81-pricing-algorithm)
   - 8.2 [Concurrency Control — Booking Transaction](#82-concurrency-control--booking-transaction)
   - 8.3 [Trust Score & Cancellation Penalty Algorithm](#83-trust-score--cancellation-penalty-algorithm)
   - 8.4 [Pattern-Match Report Evaluation Algorithm](#84-pattern-match-report-evaluation-algorithm)
9. [User Interface Requirements](#9-user-interface-requirements)
   - 9.1 [Screen Inventory](#91-screen-inventory)
   - 9.2 [Screen Flow](#92-screen-flow)
   - 9.3 [UI Component Specifications](#93-ui-component-specifications)
10. [Appendices](#10-appendices)
    - 10.1 [Appendix A — Glossary of Domain Terms](#101-appendix-a--glossary-of-domain-terms)
    - 10.2 [Appendix B — Error Code Reference](#102-appendix-b--error-code-reference)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a complete and detailed description of the requirements for the **RideMates** mobile application. It is intended for:

- **Developers** — as the authoritative technical reference for implementation.
- **Faculty Evaluators** — as evidence of thorough requirements analysis for the Capstone Viva.
- **Testers** — as the basis for deriving test cases and acceptance criteria.

This document describes both the functional behavior of the system and the non-functional quality attributes it must satisfy.

### 1.2 Scope

**RideMates** is a cross-platform mobile application (Android and iOS) that provides a university-exclusive, peer-to-peer ride-sharing network. The system enables verified university members to:

- **Post rides** with origin, destination, departure time, available seats, and a price capped by the system.
- **Search and book seats** on rides posted by other verified members, with concurrency-safe seat reservation.
- **Visualize routes** on an interactive map before booking.
- **Flag alternate routes** during regional transportation disruptions (strikes, protests).

**In Scope:**

- Domain-restricted registration and authentication (`@lpu.in` emails only)
- Algorithmically capped pricing based on real fuel costs
- Map-based route visualization (static polyline, not live tracking)
- Concurrent booking management via database-level transaction locking
- Strike Resilience Mode with alternate route flagging

**Out of Scope (for current release):**

- In-app payment processing (UPI / credit card)
- Real-time GPS tracking of the driver's vehicle
- In-app chat or messaging between driver and passenger
- Multi-university federation (currently single university)
- Push notification system
- Automated star-based rating and review system (replaced by report-based mutual accountability — see Section 4.1.5)

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| **API** | Application Programming Interface |
| **CRUD** | Create, Read, Update, Delete |
| **DBMS** | Database Management System |
| **ER** | Entity-Relationship |
| **GPS** | Global Positioning System |
| **HTTP** | Hypertext Transfer Protocol |
| **IEEE** | Institute of Electrical and Electronics Engineers |
| **IST** | Indian Standard Time (UTC+5:30) |
| **JSON** | JavaScript Object Notation |
| **JWT** | JSON Web Token |
| **MVC** | Model-View-Controller |
| **OTP** | One-Time Password |
| **REST** | Representational State Transfer |
| **SDK** | Software Development Kit |
| **SQL** | Structured Query Language |
| **SRS** | Software Requirements Specification |
| **TX** | Transaction |
| **UI** | User Interface |
| **URI** | Uniform Resource Identifier |
| **UTC** | Coordinated Universal Time |
| **UX** | User Experience |
| **White Plate** | Non-commercial private vehicle registration in India |
| **Day-Scholar** | University student who commutes daily and does not live on campus |
| **Polyline** | A series of connected GPS coordinates rendered as a visible route on a map |
| **Row-Level Locking** | A database mechanism that locks a specific row during a transaction to prevent concurrent modification |

### 1.4 References

| # | Reference | URL |
|---|-----------|-----|
| 1 | IEEE 830-1998 Standard for SRS | https://standards.ieee.org/standard/830-1998.html |
| 2 | Firebase Authentication Docs | https://firebase.google.com/docs/auth |
| 3 | Mapbox Geocoding API | https://docs.mapbox.com/api/search/geocoding/ |
| 4 | Mapbox Directions API | https://docs.mapbox.com/api/navigation/directions/ |
| 5 | React Native (Expo) Docs | https://docs.expo.dev/ |
| 6 | Express.js Official Guide | https://expressjs.com/en/guide/ |
| 7 | MySQL 8.0 InnoDB Locking Reads | https://dev.mysql.com/doc/refman/8.0/en/innodb-locking-reads.html |
| 8 | Motor Vehicles Act, 1988 (India) | Legal framework for non-commercial vehicle use |
| 9 | BlaBlaCar Cost-Sharing Model | https://blog.blablacar.com/about-us |

### 1.5 Overview

The remainder of this SRS is organized as follows:

- **Section 2** describes the overall product from a high level — its context, users, environment, and constraints.
- **Section 3** details the system architecture, technology choices, and deployment model.
- **Section 4** specifies all functional requirements (what the system does), external interfaces, and non-functional requirements (quality attributes).
- **Section 5** defines the database schema, data dictionary, and entity relationships.
- **Section 6** enumerates the complete REST API specification with request/response examples.
- **Section 7** provides behavioral models (use cases, activity diagrams, sequence diagrams).
- **Section 8** documents the core algorithms (pricing and concurrency control).
- **Section 9** describes the user interface screens and navigation flow.
- **Section 10** contains appendices with glossary and error code reference.

---

## 2. Overall Description

### 2.1 Product Perspective

RideMates is a **new, self-contained product** — it is not a replacement or extension of an existing system. It operates as a three-tier client-server application:

1. **Client Tier** — A React Native (Expo) mobile app installed on the user's Android or iOS device.
2. **Server Tier** — A Node.js + Express.js REST API deployed on a server.
3. **Data Tier** — A MySQL 8.0 database hosted on Aiven cloud.

The system also depends on two external services:

- **Firebase Auth** — for OTP-based email authentication and token management.
- **Mapbox API** — for geocoding (city name → coordinates) and route computation.

**Context Diagram:**

```
                    ┌─────────────────────┐
                    │   Firebase Auth     │
                    │  (Email OTP +       │
                    │   Token Issuer)     │
                    └────────┬────────────┘
                             │
┌──────────────┐    ┌────────┴────────┐    ┌──────────────────┐
│   User's     │◄──►│   RideMates    │◄──►│  MySQL Database  │
│   Mobile     │    │   Backend API   │    │  (Aiven Cloud)   │
│   Device     │    │  (Node/Express) │    │                  │
│  (Expo App)  │    └────────┬────────┘    └──────────────────┘
└──────┬───────┘             │
       │            ┌────────┴────────┐
       └───────────►│   Mapbox API    │
                    │ (Geocoding +    │
                    │  Directions)    │
                    └─────────────────┘
```

### 2.2 Product Functions

The system provides the following high-level functions:

| ID | Function | Description |
|----|----------|-------------|
| PF-01 | **User Authentication** | Register and login with university email; domain validation; OTP verification |
| PF-02 | **Ride Posting** | Create a ride with origin, destination, time, seats, vehicle info, and capped price |
| PF-03 | **Ride Search** | Search available rides by origin-destination pair, date, and emergency-route filter |
| PF-04 | **Route Visualization** | Display the driving route on an interactive map via Mapbox |
| PF-05 | **Seat Booking** | Reserve seats with concurrency-safe transaction locking |
| PF-06 | **Price Calculation** | Auto-compute base fuel cost and enforce price cap |
| PF-07 | **Strike Resilience** | Toggle alternate-route flag for highway disruptions |
| PF-08 | **Ride History** | View past rides (as driver) and bookings (as passenger) |
| PF-09 | **Profile Management** | View and update user profile information |
| PF-10 | **Ride Cancellation** | Cancel a ride (driver) or a booking (passenger) |
| PF-11 | **Trust System** | Track user trust score and good-citizen streaks; enforce penalties for no-shows and bad conduct |
| PF-12 | **Report & Accountability** | Allow users to flag no-shows and bad conduct incidents, triggering pattern-recognition penalties |
| PF-13 | **Post-Booking Handoff** | Provide native WhatsApp and Call links for off-platform coordination after booking confirmation |

### 2.3 User Classes and Characteristics

The system supports two user roles. A single registered user can operate in **both roles**.

| User Class | Description | Technical Proficiency | Usage Frequency |
|------------|-------------|----------------------|-----------------|
| **Driver** | A university member who owns a vehicle and has empty seats. Posts rides with route, time, and price details. | Low to moderate. Expects a simple form-based interface. | 1–2 times per day (morning + evening commute) |
| **Passenger** | A university member who needs a ride. Searches, views routes on the map, and books seats. | Low. Expects one-tap search and clear visual route display. | 1–2 times per day |
| **Admin** | (Future scope) System administrator for monitoring and moderation. | High. Not implemented in current release. | N/A |

**User Personas:**

- **Persona 1 — Ramesh (Driver):** 3rd-year B.Tech student, owns a car, commutes 35 km daily from Jalandhar. Wants to split fuel costs with 2–3 classmates going the same route.
- **Persona 2 — Priya (Passenger):** 1st-year MBA student, no vehicle, spends ₹300/day on Rapido. Looking for a cheaper, safer daily commute option with verified university peers.

### 2.4 Operating Environment

**Client (Mobile App):**

| Attribute | Requirement |
|-----------|-------------|
| Platform | Android 10+ (API Level 29) and iOS 15+ |
| Runtime | Expo Go app (development) or standalone build (production) |
| Network | Active internet connection (Wi-Fi or mobile data) |
| Location | GPS-enabled device with location permissions granted |
| Storage | Minimum 100 MB free storage |

**Server (Backend API):**

| Attribute | Requirement |
|-----------|-------------|
| Runtime | Node.js 18.x LTS or higher |
| Framework | Express.js 4.x |
| OS | Any OS with Node.js support (Linux recommended for production) |
| Network | Public IP or domain with HTTPS (production) |

**Database:**

| Attribute | Requirement |
|-----------|-------------|
| Engine | MySQL 8.0 (InnoDB storage engine for transaction support) |
| Hosting | Aiven Cloud (or equivalent MySQL-as-a-Service) |
| Connection | SSL/TLS encrypted connections |
| Connection Pool | Maximum 10 concurrent connections |

### 2.5 Design and Implementation Constraints

| Constraint | Description | Rationale |
|------------|-------------|-----------|
| **University Email Only** | Registration restricted to `@lpu.in` email domain | Core safety feature; eliminates unverified users |
| **Tiered Price Cap** | The driver-set price is restricted by a maintenance multiplier specific to the vehicle type (Bike/Scooter: 1.2x, Auto: 1.35x, Car: 1.5x) to ensure legal non-commercial compliance | Legal compliance with India's Motor Vehicles Act (White Plate regulations) |
| **No Profit** | System is designed for cost-sharing only, not commercial ride-hailing | Regulatory requirement for non-commercial vehicles |
| **Token Expiry** | Firebase ID Tokens expire every 60 minutes; must be refreshed before each API call | Firebase security architecture |
| **Timezone Handling** | All datetime values must be stored in UTC (ISO 8601) and converted to local time on display | Prevents IST/UTC mismatch between phone and Aiven MySQL server |
| **Separate Codebases** | Backend and Frontend must reside in completely separate directories | Clean separation of concerns; independent deployment |
| **No Secrets in Frontend** | MySQL credentials, Firebase Admin keys must NEVER appear in React Native code | APK files are extractable; secrets would be exposed |

### 2.6 Assumptions and Dependencies

**Assumptions:**

| # | Assumption |
|---|------------|
| A1 | Users have a valid, active university email address (`@lpu.in`) |
| A2 | Users have a smartphone with GPS capability and an active internet connection |
| A3 | The Aiven MySQL database maintains 99.9% uptime |
| A4 | Firebase Auth service is available and operational |
| A5 | Mapbox API free tier quota (100,000 requests/month) is sufficient for project scale |
| A6 | Cash-based settlement is acceptable between driver and passengers (no in-app payment) |
| A7 | User's phone has the Expo Go app installed (for development builds) |

**Dependencies:**

| # | Dependency | Impact if Unavailable |
|---|------------|----------------------|
| D1 | Firebase Auth | Users cannot register or login; all API calls fail (401) |
| D2 | Aiven MySQL | All read/write operations fail; app shows error states |
| D3 | Mapbox Geocoding API | Fallback geocoding fails for cities not in the local JSON dataset; core regional hubs remain functional via offline data |
| D4 | Mapbox Directions API | Route polyline cannot be computed or displayed |
| D5 | Device GPS (expo-location) | User's current location cannot be auto-detected; manual entry required |
| D6 | Internet connectivity | All API calls and external service integrations fail |

---

## 3. System Architecture

### 3.1 Architecture Overview

RideMates follows a **three-tier client-server architecture** with the **MVC (Model-View-Controller)** pattern on the backend.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION TIER                                 │
│                     React Native (Expo) Mobile App                          │
│                                                                             │
│   ┌──────────┐  ┌───────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐ │
│   │  Login   │  │   Home    │  │ Post Ride  │  │ Search Map │  │Profile │ │
│   │  Screen  │  │  Screen   │  │  Screen    │  │  Screen    │  │ Screen │ │
│   └────┬─────┘  └─────┬─────┘  └─────┬──────┘  └──────┬─────┘  └───┬────┘ │
│        └──────────────┴──────────────┴────────────────┴─────────────┘      │
│                                    │                                        │
│                          Axios HTTP Client                                  │
│                     + Firebase Token Interceptor                            │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ REST API (HTTPS / JSON)
┌────────────────────────────────────┴────────────────────────────────────────┐
│                           APPLICATION TIER                                  │
│                      Node.js + Express.js Server                            │
│                                                                             │
│   ┌─────────────────────┐                                                   │
│   │  Auth Middleware     │  (Verifies Firebase Token on every request)       │
│   └─────────┬───────────┘                                                   │
│             │                                                               │
│   ┌─────────┴──────────┐  ┌────────────────┐  ┌──────────────────────┐     │
│   │  Auth Controller   │  │ Ride Controller│  │ Booking Controller   │     │
│   │  • Domain check    │  │ • Price calc   │  │ • BEGIN TRANSACTION  │     │
│   │  • Register user   │  │ • CRUD rides   │  │ • SELECT...FOR UPDATE│     │
│   │  • Get profile     │  │ • Search       │  │ • Seat decrement     │     │
│   └────────────────────┘  └────────────────┘  └──────────────────────┘     │
│                                                                             │
│   ┌──────────────────────────────┐                                          │
│   │  Utils: priceCalculator.js   │  (Pure function: fuel cost + cap logic) │
│   └──────────────────────────────┘                                          │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ mysql2 (Connection Pool, SSL)
┌────────────────────────────────────┴────────────────────────────────────────┐
│                              DATA TIER                                      │
│                      MySQL 8.0 (Aiven Cloud)                                │
│                                                                             │
│   ┌──────────┐       ┌──────────┐       ┌──────────────┐                   │
│   │  users   │──1:N──│  rides   │──1:N──│  bookings    │                   │
│   └──────────┘       └──────────┘       └──────────────┘                   │
│        │                                       │                            │
│        └──────────────────1:N──────────────────┘                            │
│                                                                             │
│   ┌──────────────┐                                                          │
│   │  fuel_rates  │  (Reference table for pricing algorithm)                │
│   └──────────────┘                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

                         EXTERNAL SERVICES
          ┌──────────────────┐    ┌──────────────────────┐
          │  Firebase Auth   │    │  Mapbox API          │
          │  • Email OTP     │    │  • Geocoding         │
          │  • Token issue   │    │  • Directions        │
          │  • Token verify  │    │  • Polyline routes   │
          └──────────────────┘    └──────────────────────┘
```

### 3.2 Technology Stack

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| Frontend | React Native (Expo) | SDK 51+ | Single codebase for Android/iOS; managed workflow with OTA updates |
| Backend | Node.js + Express.js | 18.x LTS + 4.x | Non-blocking I/O for concurrent requests; JavaScript full-stack |
| Database | MySQL (InnoDB) | 8.0 | ACID-compliant; supports transactions with row-level locking for concurrent booking |
| Authentication | Firebase Auth | Latest | Managed email OTP; short-lived tokens (60-min); domain restriction |
| Maps — Geocoding | Local JSON + Mapbox Geocoding API (fallback) | v5 | Resolves regional hub coordinates offline; falls back to Mapbox for unknown cities |
| Maps — Routing | Mapbox Directions API | v5 | Computes driving route with polyline geometry |
| Device Location | expo-location | Latest | Native GPS access with permission management |
| HTTP Client | Axios | Latest | Promise-based; request/response interceptors for token attachment |
| Navigation | React Navigation | 6.x | File-based routing with Expo Router |
| Date/Time | dayjs | Latest | UTC ↔ local timezone conversion (2 KB library) |

### 3.3 Deployment Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT ENVIRONMENT                      │
│                                                                  │
│  ┌───────────────┐         ┌──────────────────┐                 │
│  │  Developer's  │  Wi-Fi  │  Physical Phone  │                 │
│  │  Laptop       │◄───────►│  (Expo Go app)   │                 │
│  │               │         │                  │                 │
│  │  • Node.js    │         │  • React Native  │                 │
│  │    Server     │         │    App Bundle    │                 │
│  │    :5000      │         │                  │                 │
│  │               │         │  IP: phone's IP  │                 │
│  │  • Expo       │         └──────────────────┘                 │
│  │    Bundler    │                                               │
│  │    :8081      │         ┌──────────────────┐                 │
│  │               │  SSL    │  Aiven MySQL     │                 │
│  │  IP: 192.168  │◄───────►│  Cloud DB        │                 │
│  │    .x.x       │         │  :12345          │                 │
│  └───────────────┘         └──────────────────┘                 │
│                                                                  │
│  IMPORTANT: Both laptop and phone MUST be on the same Wi-Fi.    │
│  API_BASE_URL must use laptop's IPv4 address, NOT "localhost".  │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Specific Requirements

### 4.1 Functional Requirements

#### 4.1.1 Authentication Module

| ID | Requirement | Priority | Description |
|----|------------|----------|-------------|
| FR-AUTH-01 | Domain Validation | Critical | The system SHALL reject any registration attempt with an email not ending in `@lpu.in`. |
| FR-AUTH-02 | Email OTP | Critical | The system SHALL send an OTP to the user's university email via Firebase Auth for verification. |
| FR-AUTH-03 | User Registration | Critical | Upon successful Firebase verification, the system SHALL create a corresponding user record in MySQL with `firebase_uid`, `full_name`, `email`, `phone`, and `role`. |
| FR-AUTH-04 | Token-Based Auth | Critical | All protected API endpoints SHALL require a valid Firebase ID Token in the `Authorization: Bearer <token>` header. |
| FR-AUTH-05 | Token Auto-Refresh | High | The frontend SHALL call `getIdToken(false)` before every API request to handle the 60-minute token expiry transparently. |
| FR-AUTH-06 | Profile Retrieval | Medium | The system SHALL allow authenticated users to retrieve their profile via `GET /api/auth/profile`. |
| FR-AUTH-07 | Profile Update | Medium | The system SHALL allow authenticated users to update their `full_name`, `phone`, and `profile_photo` via `PUT /api/auth/profile`. |

#### 4.1.2 Ride Management Module

| ID | Requirement | Priority | Description |
|----|------------|----------|-------------|
| FR-RIDE-01 | Create Ride | Critical | An authenticated driver SHALL be able to post a ride with: origin city, destination city, GPS coordinates, distance, departure time, available seats, vehicle type, mileage, fuel type, and desired price. |
| FR-RIDE-02 | Auto Price Calculation | Critical | The system SHALL auto-calculate `base_price` as `(distance_km × fuel_rate) / vehicle_mileage` and apply a **vehicle-specific maintenance multiplier** (1.2x for bikes/scooters, 1.35x for autos, 1.5x for cars) to establish the `max_allowed_price`. The `capped_price` SHALL be `MIN(driver_set_price, max_allowed_price)`. |
| FR-RIDE-03 | Price Cap Enforcement | Critical | If the driver's set price exceeds the vehicle-specific max cap, the system SHALL clamp it to the cap value. The driver SHALL NOT be able to exceed this limit. The multiplier is determined by the ride's `vehicle_type`. |
| FR-RIDE-04 | Search Rides | Critical | An authenticated user SHALL be able to search rides by `origin_city` and `destination_city`, with optional filters for `date` and `emergency_only`. |
| FR-RIDE-05 | View Ride Details | High | The system SHALL return full ride details (including driver info, route, price breakdown) for a specific `ride_id`. |
| FR-RIDE-06 | Update Ride | Medium | The driver who created a ride SHALL be able to update it (e.g., change departure time or available seats). |
| FR-RIDE-07 | Cancel Ride | Medium | The driver who created a ride SHALL be able to cancel it by setting `status = 'cancelled'`. |
| FR-RIDE-08 | Datetime UTC Storage | High | All `departure_time` values SHALL be stored in UTC format (ISO 8601). The frontend SHALL convert to/from the user's local timezone using `dayjs`. |
| FR-RIDE-09 | Strike Resilience Toggle | High | The driver SHALL be able to set `is_emergency_route = true` to indicate alternate village link-road routing during highway disruptions. |
| FR-RIDE-10 | Emergency Route Filter | Medium | Search results SHALL support filtering to show only rides with `is_emergency_route = true`. |
| FR-RIDE-11 | Emergency Badge | Medium | Rides with `is_emergency_route = true` SHALL display an `⚠️ ALTERNATE ROUTE` badge in the UI. |
| FR-RIDE-12 | Ride Completion Prompt | High | 2 hours after the scheduled `departure_time`, the system SHALL prompt the driver (via in-app notification on next app open): "Is your trip to {destination_city} finished?" The driver SHALL tap "Complete Ride" to set `status = 'completed'` and record `completed_at`. |
| FR-RIDE-13 | Clean Ride Streak Award | High | Once a ride is marked as completed, the system SHALL wait 12 hours. If no reports are filed against the ride within that 12-hour window, the system SHALL increment `current_streak` by 1 for **both** the driver and all passengers who had confirmed bookings on that ride. |

#### 4.1.3 Booking Module

| ID | Requirement | Priority | Description |
|----|------------|----------|-------------|
| FR-BOOK-01 | Book Seat | Critical | An authenticated passenger SHALL be able to book 1 or more seats on an active ride. |
| FR-BOOK-02 | Concurrency Locking | Critical | The booking operation SHALL use an SQL transaction with `SELECT ... FOR UPDATE` row-level locking to prevent double-booking when concurrent requests target the same ride. |
| FR-BOOK-03 | Atomic Seat Decrement | Critical | Within the transaction, `available_seats` SHALL be decremented by `seats_booked` and a booking record SHALL be inserted atomically. Both succeed or both fail. |
| FR-BOOK-04 | Seat Availability Check | Critical | The system SHALL reject a booking if `seats_booked > available_seats`, returning a `400` error with message "Not enough seats available." |
| FR-BOOK-05 | Duplicate Prevention | High | The system SHALL prevent a passenger from booking the same ride twice, enforced by a `UNIQUE KEY (ride_id, passenger_id)` constraint. Violation returns a `409` error. |
| FR-BOOK-06 | Per-Seat Price | High | The system SHALL calculate `price_paid` as the per-seat share of the `capped_price` at booking time. |
| FR-BOOK-07 | View My Bookings | Medium | An authenticated user SHALL be able to retrieve all their bookings via `GET /api/bookings/my`. |
| FR-BOOK-08 | Cancel Booking | Medium | A passenger SHALL be able to cancel a confirmed booking. Upon cancellation, `available_seats` SHALL be incremented back. The system SHALL apply a tiered Trust Score penalty based on proximity to departure (see FR-BOOK-11). |
| FR-BOOK-11 | Cancellation Penalty Tiers | High | Passenger booking cancellation penalties SHALL follow a tiered model: **(a)** Cancellation **> 4 hours** before departure → **0 penalty** (free cancellation). **(b)** Cancellation **≤ 4 hours but > 30 minutes** before departure → **−2 Trust Points**. **(c)** Cancellation **≤ 30 minutes** before departure → **−5 Trust Points** (equivalent to a No-Show). This protects drivers from last-minute seat loss. |
| FR-BOOK-09 | Instant Booking Acknowledgment | Critical | When publishing a ride with Instant Booking enabled, the system SHALL require the driver to check an "Instant Booking Acknowledgment" checkbox, legally binding them to the Trust Score penalty (see Section 4.1.5) for last-minute cancellations after a passenger has auto-booked. The ride SHALL NOT be published until this acknowledgment is checked. |
| FR-BOOK-10 | Women-Only Instant Booking | High | If a ride is marked as `is_women_only = true`, only passengers whose profile gender is `female` SHALL be permitted to use the Instant Booking path. |

#### 4.1.4 Map & Routing Module

| ID | Requirement | Priority | Description |
|----|------------|----------|-------------|
| FR-MAP-01 | Hybrid Geocoding | Critical | The system SHALL resolve GPS coordinates for city names via a **local JSON dataset** containing regional hub locations (e.g., Mukerian, Jalandhar, Phagwara). Mapbox Geocoding API SHALL be used only as a fallback for cities not found in the local dataset. Mapbox Directions API SHALL still be used for route polyline generation and distance computation. This hybrid approach ensures the app remains free and functional even when the Mapbox Geocoding quota is exhausted. |
| FR-MAP-02 | Route Computation | Critical | The system SHALL compute the driving route between origin and destination using the Mapbox Directions API, returning a polyline geometry. |
| FR-MAP-03 | Route Display | Critical | The frontend SHALL render the computed route as a visible polyline on a `react-native-maps` MapView component. |
| FR-MAP-04 | Map Markers | High | The map SHALL display a green marker at the origin ("Pickup") and a red marker at the destination ("Drop-off"). |
| FR-MAP-05 | Distance Extraction | High | The system SHALL extract `distance_km` and `duration_min` from the Mapbox Directions API response. |
| FR-MAP-06 | Location Permission | Critical | The app SHALL request foreground location permission from the user using `expo-location`. The map SHALL NOT render until permission is granted and coordinates are available. |
| FR-MAP-07 | Permission Error State | High | If location permission is denied, the app SHALL display a user-friendly message instructing them to enable it in device Settings. |
| FR-MAP-08 | Loading State | High | While location is being fetched, the app SHALL display a loading indicator (spinner) instead of an empty or broken map. |

#### 4.1.5 Report & Accountability Module

| ID | Requirement | Priority | Description |
|----|------------|----------|-------------|
| FR-RPT-01 | Report Incident | Critical | An authenticated user SHALL be able to file a report against another user for a specific completed or no-show ride, selecting a reason from: `no_show`, `bad_conduct`, `unsafe_driving`, `harassment`. |
| FR-RPT-02 | One Report Per Ride | High | The system SHALL enforce a maximum of one report per reporter per ride, using a `UNIQUE KEY (ride_id, reporter_id)` constraint. |
| FR-RPT-03 | Single Report — Warning Only | Critical | When a **single** report for `bad_conduct`, `unsafe_driving`, or `harassment` is filed against a user, the system SHALL issue a **System Warning** to the reported user but SHALL NOT deduct any trust points. The booking's `is_reported` flag SHALL be set to `true`. This is the "Shield" — one person can lie, so a single report is never punitive. |
| FR-RPT-04 | Pattern-Match Penalty Trigger | Critical | A trust score deduction SHALL **only** occur when a user receives **2 or more reports from different reporters across different rides** within a rolling 30-day window. At that point, the system SHALL apply a **−10 point** deduction per qualifying report and reset `current_streak` to 0. Two unrelated people reporting the same behavior constitutes a pattern. |
| FR-RPT-05 | Escalated Pattern Penalty | High | If a user accumulates **3 or more pattern-matched reports** (from different reporters across different rides) within a rolling 30-day window, the system SHALL flag the account for review and apply an additional escalated penalty of **−25 points** on top of per-report deductions. |
| FR-RPT-06 | Streak Increment | Medium | Upon each completed ride with no incidents (no reports filed within 12 hours of ride completion — see FR-RIDE-13), the system SHALL increment the user's `current_streak` by 1. |
| FR-RPT-09 | No-Show Immediate Penalty | Critical | Reports filed with reason `no_show` SHALL bypass the pattern-match shield and immediately deduct **−5 Trust Points** from the reported user and reset `current_streak` to 0. A no-show is a verifiable objective event, not a subjective opinion. |
| FR-RPT-07 | Trust Score Display | Medium | The user's current `trust_score` SHALL be displayed on their Profile screen. Scores below 50 SHALL display a warning badge. |
| FR-RPT-08 | Report Cooldown | Medium | A user SHALL NOT be able to file more than 3 reports in a single 24-hour period, to prevent abuse of the reporting system. |

#### 4.1.6 Ride Lifecycle Module

| ID | Requirement | Priority | Description |
|----|------------|----------|-------------|
| FR-LIFE-01 | Completion Prompt | High | 2 hours after the scheduled `departure_time`, the system SHALL display an in-app prompt to the driver on their next app open: "Is your trip to {destination_city} finished?" with a "Complete Ride" button. |
| FR-LIFE-02 | Mark Ride Complete | High | When the driver taps "Complete Ride", the system SHALL set `rides.status = 'completed'` and record the current timestamp in `rides.completed_at`. All associated confirmed bookings SHALL also transition to `status = 'completed'`. |
| FR-LIFE-03 | 12-Hour Grace Period | High | After `completed_at` is recorded, a 12-hour grace window begins. During this window, all participants (driver and passengers) may file reports against each other for that ride. |
| FR-LIFE-04 | Clean Ride Award | High | If no reports are filed against the ride within the 12-hour grace period after completion, the system SHALL increment `current_streak` by 1 for the driver and all passengers with confirmed bookings on that ride. |
| FR-LIFE-05 | Auto-Completion Fallback | Medium | If the driver does not tap "Complete Ride" within 24 hours after `departure_time`, the system SHALL automatically set `status = 'completed'` and record `completed_at` to prevent rides from lingering in 'active' state indefinitely. |

### 4.2 External Interface Requirements

#### 4.2.1 User Interfaces

| Interface | Description |
|-----------|-------------|
| **Login Screen** | Email input field, password field, "Register" and "Login" buttons. Domain validation message on invalid email. |
| **Home Screen** | Dashboard with two primary actions: "Post a Ride" and "Find a Ride." Displays recent activity summary. |
| **Post Ride Screen** | Form with city inputs (origin/destination), date/time picker, seat count, vehicle details, price slider with visual cap indicator, emergency route toggle, women-only toggle, and Instant Booking toggle with Trust Contract acknowledgment checkbox. |
| **Search/Map Screen** | Origin and destination input fields with autocomplete. Interactive map displaying the route polyline. List of matching rides below the map as scrollable cards. |
| **Booking Screen** | Ride details card with driver info, route, price breakdown, and "Book Now" button. Fetches fresh data on mount to prevent ghost seats. |
| **My Rides Screen** | Two tabs — "As Driver" (rides I posted) and "As Passenger" (rides I booked). Status badges for active/completed/cancelled. |
| **Profile Screen** | Displays user name, email, phone, role, trust score, and current streak. Edit functionality for mutable fields. Trust score below 50 shows a warning badge. |

#### 4.2.2 Hardware Interfaces

| Interface | Description |
|-----------|-------------|
| **GPS Module** | The app accesses the device's GPS hardware via `expo-location` to detect the user's current position. |
| **Network Adapter** | The app requires an active internet connection (Wi-Fi or cellular data) for all API calls and map rendering. |
| **Touchscreen** | All interactions occur via touch input on a smartphone display. |

#### 4.2.3 Software Interfaces

| External System | Interface Type | Protocol | Data Format |
|----------------|---------------|----------|-------------|
| Firebase Auth | SDK + REST | HTTPS | JSON (ID Token, User object) |
| Mapbox Geocoding API | REST | HTTPS | JSON (GeoJSON features) |
| Mapbox Directions API | REST | HTTPS | JSON (GeoJSON geometry + route metadata) |
| Aiven MySQL | TCP | mysql2 driver (SSL) | SQL queries / result sets |

#### 4.2.4 Communication Interfaces

| Interface | Protocol | Details |
|-----------|----------|---------|
| Frontend ↔ Backend | HTTP/HTTPS | RESTful JSON API; `Authorization: Bearer <Firebase ID Token>` header |
| Backend ↔ MySQL | TCP (SSL) | mysql2 connection pool; max 10 connections; query parameterization |
| Frontend ↔ Firebase | HTTPS | Firebase SDK handles token lifecycle transparently |
| Frontend ↔ Mapbox | HTTPS | Direct API calls with `access_token` query parameter |

### 4.3 Non-Functional Requirements

#### 4.3.1 Performance Requirements

| ID | Requirement | Target |
|----|------------|--------|
| NFR-PERF-01 | API response time for ride search | ≤ 500 ms (excluding network latency) |
| NFR-PERF-02 | API response time for booking | ≤ 1000 ms (includes transaction locking time) |
| NFR-PERF-03 | Map route rendering | ≤ 2 seconds after receiving coordinates |
| NFR-PERF-04 | App cold start | ≤ 3 seconds on a mid-range Android device |
| NFR-PERF-05 | Concurrent booking throughput | System handles up to 10 simultaneous booking requests for the same ride without data corruption |

#### 4.3.2 Security Requirements

| ID | Requirement |
|----|------------|
| NFR-SEC-01 | All API endpoints (except health check) SHALL require Firebase token authentication. |
| NFR-SEC-02 | Firebase ID Tokens SHALL be verified server-side using Firebase Admin SDK. |
| NFR-SEC-03 | MySQL credentials, Firebase Admin keys, and any server-side secrets SHALL be stored exclusively in the backend `.env` file and NEVER in frontend code. |
| NFR-SEC-04 | Frontend environment variables SHALL only contain public keys (Mapbox public token, Firebase App ID) and MUST use the `EXPO_PUBLIC_` prefix. |
| NFR-SEC-05 | Database connections SHALL use SSL/TLS encryption. |
| NFR-SEC-06 | All SQL queries SHALL use parameterized queries to prevent SQL injection. |
| NFR-SEC-07 | The `.env` file SHALL be listed in `.gitignore` and NEVER committed to version control. |

#### 4.3.3 Reliability & Availability Requirements

| ID | Requirement |
|----|------------|
| NFR-REL-01 | Every `async` controller function SHALL be wrapped in `try/catch` to prevent unhandled promise rejections from crashing the server. |
| NFR-REL-02 | The backend SHALL include global handlers for `unhandledRejection` and `uncaughtException` as a safety net. |
| NFR-REL-03 | Database transactions SHALL `ROLLBACK` on any error and `COMMIT` only on success. |
| NFR-REL-04 | The database connection pool SHALL automatically reconnect on transient failures. |
| NFR-REL-05 | Target system availability: 99% during development/demo phase. |

#### 4.3.4 Usability Requirements

| ID | Requirement |
|----|------------|
| NFR-USE-01 | All error states SHALL display user-friendly messages (not raw error codes or stack traces). |
| NFR-USE-02 | Asynchronous operations (API calls, location fetch) SHALL show visual loading indicators. |
| NFR-USE-03 | The app SHALL display appropriate empty states (e.g., "No rides found") instead of blank screens. |
| NFR-USE-04 | Color contrast ratios SHALL meet WCAG AA standards for text readability. |
| NFR-USE-05 | Form inputs SHALL provide inline validation feedback before submission. |

#### 4.3.5 Portability Requirements

| ID | Requirement |
|----|------------|
| NFR-PORT-01 | The mobile app SHALL run on both Android (10+) and iOS (15+) from a single React Native codebase. |
| NFR-PORT-02 | The backend SHALL be deployable on any OS with Node.js 18+ support. |
| NFR-PORT-03 | The database SHALL be compatible with any MySQL 8.0-compatible hosting provider. |

#### 4.3.6 Maintainability Requirements

| ID | Requirement |
|----|------------|
| NFR-MAIN-01 | Backend SHALL follow the MVC pattern with controllers, routes, and config in separate directories. |
| NFR-MAIN-02 | Frontend SHALL separate screens, components, services, hooks, and constants into distinct directories. |
| NFR-MAIN-03 | API response format SHALL be consistent across all endpoints: `{ success, message, data, error }`. |
| NFR-MAIN-04 | Pricing logic SHALL be isolated in a pure utility function (`priceCalculator.js`) with no side effects. |

---

## 5. Data Requirements

### 5.1 Database Schema

#### Table: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `firebase_uid` | VARCHAR(128) | NOT NULL, UNIQUE | Firebase Authentication UID |
| `full_name` | VARCHAR(100) | NOT NULL | User's full name |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE | University email address |
| `phone` | VARCHAR(15) | NULLABLE | Phone number |
| `university` | VARCHAR(100) | DEFAULT 'LPU' | University name |
| `role` | ENUM('student','faculty') | DEFAULT 'student' | User role |
| `profile_photo` | VARCHAR(255) | NULLABLE | URL to profile photo |
| `gender` | ENUM('male','female','other') | DEFAULT 'other' | User's gender (used for women-only ride filtering) |
| `trust_score` | INT | NOT NULL, DEFAULT 100 | User's trust score; starts at 100, decremented by penalties for no-shows/bad-conduct pattern-matched reports |
| `current_streak` | INT | NOT NULL, DEFAULT 0 | Consecutive completed rides without incident ("Good Citizen" streak); resets to 0 on any penalty |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration timestamp |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

> **Trust System Note:** New users start with `trust_score = 100` and `current_streak = 0`. A single conduct report triggers only a warning (the "Shield"). Point deductions (−10 per report) occur only when 2+ reports from different people across different rides establish a pattern. No-Show reports bypass the shield and immediately deduct −5 points. Three pattern-matched reports in 30 days triggers an escalated penalty (−25 additional). The streak resets on any penalty and increments on clean ride completions (12-hour grace period after ride completion).

#### Table: `rides`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique ride identifier |
| `driver_id` | INT | NOT NULL, FK → users(id) | Reference to driver |
| `origin_city` | VARCHAR(100) | NOT NULL | Origin city name |
| `origin_lat` | DECIMAL(10,7) | NOT NULL | Origin latitude |
| `origin_lng` | DECIMAL(10,7) | NOT NULL | Origin longitude |
| `destination_city` | VARCHAR(100) | NOT NULL | Destination city name |
| `dest_lat` | DECIMAL(10,7) | NOT NULL | Destination latitude |
| `dest_lng` | DECIMAL(10,7) | NOT NULL | Destination longitude |
| `distance_km` | DECIMAL(6,2) | NOT NULL | Route distance in kilometers |
| `departure_time` | DATETIME | NOT NULL | Departure time (stored in UTC) |
| `available_seats` | TINYINT | NOT NULL, CHECK ≥ 0 | Currently available seats |
| `vehicle_type` | ENUM('bike','scooter','auto','car') | DEFAULT 'car' | Type of vehicle (determines maintenance multiplier: bike/scooter 1.2x, auto 1.35x, car 1.5x) |
| `vehicle_mileage` | DECIMAL(5,2) | DEFAULT 15.00 | Vehicle fuel efficiency (km/l) |
| `fuel_type` | ENUM('petrol','diesel','cng','electric') | DEFAULT 'petrol' | Fuel type |
| `base_price` | DECIMAL(8,2) | NOT NULL | System-calculated base fuel cost |
| `driver_set_price` | DECIMAL(8,2) | NOT NULL | Price set by driver (may be clamped) |
| `capped_price` | DECIMAL(8,2) | NOT NULL | min(driver_set_price, vehicle-specific max cap) |
| `is_emergency_route` | BOOLEAN | DEFAULT FALSE | Strike resilience flag |
| `is_women_only` | BOOLEAN | DEFAULT FALSE | If true, only female-verified passengers may use Instant Booking on this ride |
| `instant_booking` | BOOLEAN | DEFAULT FALSE | If true, passengers can auto-book without driver approval |
| `instant_booking_ack` | BOOLEAN | DEFAULT FALSE | Driver has acknowledged the Trust Contract penalty clause for Instant Booking |
| `status` | ENUM('active','completed','cancelled') | DEFAULT 'active' | Ride lifecycle status |
| `completed_at` | TIMESTAMP | NULLABLE | Timestamp when the driver confirmed ride completion (used for 12-hour report grace period) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

#### Table: `bookings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique booking identifier |
| `ride_id` | INT | NOT NULL, FK → rides(id) | Reference to the ride |
| `passenger_id` | INT | NOT NULL, FK → users(id) | Reference to the passenger |
| `seats_booked` | TINYINT | DEFAULT 1 | Number of seats reserved |
| `price_paid` | DECIMAL(8,2) | NOT NULL | Total price paid for booked seats |
| `status` | ENUM('confirmed','cancelled','completed') | DEFAULT 'confirmed' | Booking status |
| `is_reported` | BOOLEAN | DEFAULT FALSE | Flag set to true when a report has been filed against this booking's counterpart |
| `cancellation_penalty` | INT | DEFAULT 0 | Trust score points deducted due to late cancellation (0, 2, or 5) |
| `booked_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Booking timestamp |

**Unique Constraint:** `UNIQUE KEY (ride_id, passenger_id)` — prevents duplicate bookings.

#### Table: `reports`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique report identifier |
| `ride_id` | INT | NOT NULL, FK → rides(id) | Reference to the ride the incident occurred on |
| `reporter_id` | INT | NOT NULL, FK → users(id) | User who filed the report |
| `reported_user_id` | INT | NOT NULL, FK → users(id) | User being reported |
| `reason` | ENUM('no_show','bad_conduct','unsafe_driving','harassment') | NOT NULL | Category of the incident |
| `description` | TEXT | NULLABLE | Optional free-text description of the incident |
| `penalty_applied` | INT | NOT NULL, DEFAULT 10 | Trust score points deducted from the reported user |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Report timestamp |

**Unique Constraint:** `UNIQUE KEY (ride_id, reporter_id)` — prevents duplicate reports per ride per user.

#### Table: `fuel_rates`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Identifier |
| `fuel_type` | ENUM('petrol','diesel','cng','electric') | NOT NULL, UNIQUE | Fuel type |
| `rate_per_litre` | DECIMAL(6,2) | NOT NULL | Current price per litre/kWh |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last rate update |

### 5.2 Data Dictionary

| Data Element | Format | Valid Range | Source |
|-------------|--------|-------------|--------|
| Email | string | Must match `*@lpu.in` pattern | User input → Firebase → Backend |
| Latitude | DECIMAL(10,7) | -90.0000000 to +90.0000000 | Mapbox Geocoding API |
| Longitude | DECIMAL(10,7) | -180.0000000 to +180.0000000 | Mapbox Geocoding API |
| Distance (km) | DECIMAL(6,2) | 0.01 to 9999.99 | Mapbox Directions API |
| Departure Time | ISO 8601 string | Any future datetime | User input → dayjs → UTC conversion |
| Available Seats | TINYINT | 0 to 127 (practical: 1–6) | User input |
| Fuel Rate | DECIMAL(6,2) | 1.00 to 9999.99 (₹/litre) | fuel_rates table |
| Vehicle Mileage | DECIMAL(5,2) | 1.00 to 999.99 (km/l) | User input |
| Price | DECIMAL(8,2) | 0.01 to 999999.99 (₹) | Calculated by pricing algorithm |
| **Trust Score** | INT | 0 to 100 (practical), no hard lower bound | Derived from reports and cancellation penalties |
| **Current Streak** | INT | 0+ | Incremented on clean ride completions; reset on any penalty |
| Firebase UID | VARCHAR(128) | Alphanumeric, up to 128 chars | Firebase Auth |
| Firebase ID Token | string (JWT) | ~1000 chars; expires every 60 min | Firebase SDK |

### 5.3 Entity-Relationship Diagram

```
┌────────────────────────┐
│        USERS           │
├────────────────────────┤
│ PK  id                 │
│     firebase_uid (UQ)  │
│     full_name          │
│     email (UQ)         │         ┌────────────────────────┐
│     phone              │         │        RIDES           │
│     gender             │         ├────────────────────────┤
│     university         │    ┌───▶│ PK  id                 │
│     role               │    │    │ FK  driver_id ─────────┤────┐
│     trust_score (100)  │    │    │     origin_city        │    │
│     current_streak (0) │    │    │     is_women_only      │    │
│     created_at         │    │    │     instant_booking    │    │
└────────┬───────────────┘    │    │     instant_booking_ack│    │
         │                    │    │     completed_at       │    │
         │                    │    │     origin_lat/lng     │    │
         │   1:N (as driver)  │    │     dest_city          │    │
         └────────────────────┘    │     dest_lat/lng       │    │
         │                         │     distance_km        │    │
         │   1:N (as passenger)    │     departure_time     │    │
         │                         │     available_seats    │    │
         │    ┌────────────────────│     vehicle_type       │    │
         │    │                    │     base_price         │    │
         │    │                    │     capped_price       │    │
         │    │                    │     is_emergency_route │    │
         │    │                    │     status             │    │
         │    │                    └────────┬───────────────┘    │
         │    │                             │                    │
         │    │                    1:N      │                    │
         │    │                             │                    │
         │    │                    ┌────────┴───────────────┐    │
         │    │                    │      BOOKINGS          │    │
         │    │                    ├────────────────────────┤    │
         │    │                    │ PK  id                 │    │
         │    └───────────────────▶│ FK  ride_id ───────────┤────┘
         │                         │ FK  passenger_id ──────┤──┐
         └─────────────────────────│     seats_booked       │  │
                                   │     price_paid         │  │
                                   │     status             │  │
                                   │     is_reported        │  │
                                   │     cancellation_penalty│  │
                                   │     booked_at          │  │
                                   └────────────────────────┘  │
                                                               │
                               ┌───────────────────────────────┘
                               │  References users.id (passenger)
                               │
                    ┌──────────┴───────────┐
                    │     FUEL_RATES       │
                    ├──────────────────────┤
                    │ PK  id              │
                    │     fuel_type (UQ)  │
                    │     rate_per_litre  │
                    │     updated_at      │
                    └─────────────────────┘

                    ┌─────────────────────┐
                    │      REPORTS        │
                    ├─────────────────────┤
                    │ PK  id              │
                    │ FK  ride_id ────────│──▶ rides.id
                    │ FK  reporter_id ────│──▶ users.id
                    │ FK  reported_user_id│──▶ users.id
                    │     reason          │
                    │     description     │
                    │     penalty_applied │
                    │     created_at      │
                    └─────────────────────┘
```

**Relationship Summary:**

| Relationship | Type | Description |
|-------------|------|-------------|
| users → rides | 1:N | One user (driver) can post many rides |
| rides → bookings | 1:N | One ride can have many bookings |
| users → bookings | 1:N | One user (passenger) can have many bookings |
| users → reports (as reporter) | 1:N | One user can file many reports |
| users → reports (as reported) | 1:N | One user can be reported many times |
| rides → reports | 1:N | One ride can have multiple reports from different users |

---

## 6. API Specification

### Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://{laptop-IPv4}:5000/api` |
| Production | `https://{your-domain}/api` |

### 6.1 Authentication Endpoints

#### `POST /api/auth/register`

| Attribute | Value |
|-----------|-------|
| **Description** | Register a new user after successful Firebase OTP verification |
| **Auth** | Firebase ID Token (Bearer) |
| **Request Body** | `{ firebase_uid, full_name, email, phone, role }` |
| **Success** | `201 Created` — `{ success: true, data: { id, firebase_uid, full_name, email } }` |
| **Error 400** | Email domain is not `@lpu.in` |
| **Error 409** | Email or firebase_uid already registered |

#### `GET /api/auth/profile`

| Attribute | Value |
|-----------|-------|
| **Description** | Get the authenticated user's profile |
| **Auth** | Firebase ID Token (Bearer) |
| **Success** | `200 OK` — `{ success: true, data: { id, full_name, email, phone, role, university } }` |
| **Error 404** | User not found in MySQL |

#### `PUT /api/auth/profile`

| Attribute | Value |
|-----------|-------|
| **Description** | Update the authenticated user's profile |
| **Auth** | Firebase ID Token (Bearer) |
| **Request Body** | `{ full_name?, phone?, profile_photo? }` |
| **Success** | `200 OK` — `{ success: true, message: "Profile updated" }` |

### 6.2 Ride Endpoints

#### `POST /api/rides/create`

| Attribute | Value |
|-----------|-------|
| **Description** | Post a new ride with auto-calculated capped pricing |
| **Auth** | Firebase ID Token (Bearer) |
| **Request Body** | `{ origin_city, origin_lat, origin_lng, destination_city, dest_lat, dest_lng, distance_km, departure_time (ISO 8601 UTC), available_seats, vehicle_type, vehicle_mileage, fuel_type, driver_set_price, is_emergency_route? }` |
| **Success** | `201 Created` — `{ success: true, data: { ride_id, base_price, capped_price, max_allowed, per_seat_price } }` |

#### `GET /api/rides/search`

| Attribute | Value |
|-----------|-------|
| **Description** | Search for available rides matching origin and destination |
| **Auth** | Firebase ID Token (Bearer) |
| **Query Params** | `origin` (required), `destination` (required), `date` (optional, YYYY-MM-DD), `emergency_only` (optional, boolean) |
| **Success** | `200 OK` — `{ success: true, data: [ ...rides ] }` |

#### `GET /api/rides/:id`

| Attribute | Value |
|-----------|-------|
| **Description** | Get full details of a specific ride |
| **Auth** | Firebase ID Token (Bearer) |
| **Success** | `200 OK` — `{ success: true, data: { ...ride, driver: { name, email } } }` |
| **Error 404** | Ride not found |

#### `PUT /api/rides/:id`

| Attribute | Value |
|-----------|-------|
| **Description** | Update a ride (driver only) |
| **Auth** | Firebase ID Token (Bearer) |
| **Success** | `200 OK` |
| **Error 403** | Authenticated user is not the ride's driver |

#### `DELETE /api/rides/:id`

| Attribute | Value |
|-----------|-------|
| **Description** | Cancel a ride by setting status to 'cancelled' |
| **Auth** | Firebase ID Token (Bearer) |
| **Success** | `200 OK` — `{ success: true, message: "Ride cancelled" }` |
| **Error 403** | Authenticated user is not the ride's driver |

### 6.3 Booking Endpoints

#### `POST /api/bookings/new`

| Attribute | Value |
|-----------|-------|
| **Description** | Book seat(s) on a ride (uses SQL transaction with row-level locking) |
| **Auth** | Firebase ID Token (Bearer) |
| **Request Body** | `{ ride_id, seats_booked }` |
| **Success** | `201 Created` — `{ success: true, data: { booking_id, ride_id, seats_booked, price_paid, remaining_seats } }` |
| **Error 400** | Not enough seats available |
| **Error 404** | Ride not found |
| **Error 409** | Passenger already booked this ride |

#### `GET /api/bookings/my`

| Attribute | Value |
|-----------|-------|
| **Description** | Get all bookings for the authenticated user |
| **Auth** | Firebase ID Token (Bearer) |
| **Success** | `200 OK` — `{ success: true, data: [ ...bookings ] }` |

#### `PUT /api/bookings/:id/cancel`

| Attribute | Value |
|-----------|-------|
| **Description** | Cancel a booking and restore available seats |
| **Auth** | Firebase ID Token (Bearer) |
| **Success** | `200 OK` — `{ success: true, message: "Booking cancelled" }` |
| **Error 403** | Authenticated user is not the booking's passenger |

### 6.4 Error Response Format

All error responses follow a consistent JSON structure:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "error": "TECHNICAL_ERROR_CODE"
}
```

**Error Code Reference:** See [Appendix B](#102-appendix-b--error-code-reference).

---

## 7. Behavioral Models

### 7.1 Use Case Diagrams

#### Primary Use Cases

```
                         ┌───────────────────────────────────────┐
                         │           RideMates System            │
                ┌────────┼───────────────────────────────────────┼────────┐
                │        │                                       │        │
   ┌────────┐   │   ┌────┴──────┐    ┌────────────────┐         │  ┌─────┴────┐
   │        │───┼──▶│ Register  │    │  Search Rides  │◀────────┼──│          │
   │        │   │   │ (Email)   │    │  (by route)    │         │  │          │
   │        │   │   └───────────┘    └────────────────┘         │  │          │
   │        │   │   ┌───────────┐    ┌────────────────┐         │  │          │
   │ Driver │───┼──▶│ Post Ride │    │   Book Seat    │◀────────┼──│Passenger │
   │        │   │   └───────────┘    └────────────────┘         │  │          │
   │        │   │   ┌───────────┐    ┌────────────────┐         │  │          │
   │        │───┼──▶│ Toggle    │    │  View Route    │◀────────┼──│          │
   │        │   │   │ Emergency │    │  on Map        │         │  │          │
   │        │   │   └───────────┘    └────────────────┘         │  │          │
   │        │   │   ┌───────────┐    ┌────────────────┐         │  │          │
   │        │───┼──▶│ Cancel    │    │ Cancel Booking │◀────────┼──│          │
   │        │   │   │ Ride      │    └────────────────┘         │  │          │
   │        │   │   └───────────┘    ┌────────────────┐         │  │          │
   │        │───┼──▶│ View My   │    │ View My        │◀────────┼──│          │
   │        │   │   │ Rides     │    │ Bookings       │         │  │          │
   └────┬───┘   │   └───────────┘    └────────────────┘         │  └────┬─────┘
        │       │            ┌───────────────┐                  │       │
        └───────┼───────────▶│    Login      │◀─────────────────┼───────┘
                │            │  (@lpu.in)    │                  │
                │            └───────────────┘                  │
                └───────────────────────────────────────────────┘
```

#### Use Case Descriptions

**UC-01: Register**

| Attribute | Description |
|-----------|-------------|
| **Actor** | Unregistered University Member |
| **Precondition** | User has a valid `@lpu.in` email address |
| **Main Flow** | 1. User enters email → 2. System validates domain → 3. Firebase sends OTP → 4. User enters OTP → 5. Firebase verifies → 6. Backend creates MySQL record |
| **Alternate Flow** | 2a. Email not `@lpu.in` → Error displayed, registration blocked |
| **Postcondition** | User record exists in MySQL with `firebase_uid` linked |

**UC-02: Post Ride**

| Attribute | Description |
|-----------|-------------|
| **Actor** | Authenticated Driver |
| **Precondition** | User is logged in with a valid token |
| **Main Flow** | 1. Driver enters ride details → 2. System geocodes cities → 3. Map shows route → 4. Driver adjusts price via slider → 5. System enforces price cap → 6. Ride saved to MySQL |
| **Alternate Flow** | 5a. Driver price exceeds cap → System clamps to max |
| **Postcondition** | Ride visible in search results with status 'active' |

**UC-03: Book Seat**

| Attribute | Description |
|-----------|-------------|
| **Actor** | Authenticated Passenger |
| **Precondition** | Ride exists with `available_seats ≥ 1` and `status = 'active'` |
| **Main Flow** | 1. Passenger navigates to ride (by `rideId`) → 2. Screen fetches fresh ride data → 3. Passenger clicks "Book" → 4. Backend begins TX → 5. `SELECT ... FOR UPDATE` locks row → 6. Seats decremented → 7. Booking inserted → 8. TX committed |
| **Alternate Flow** | 6a. `available_seats < seats_booked` → TX rolled back, 400 error returned |
| **Postcondition** | Booking record created; `available_seats` decremented |

### 7.2 Activity Diagrams

#### Ride Booking Activity

```
                    ┌─────────┐
                    │  Start  │
                    └────┬────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Navigate to Ride    │
              │ (pass rideId only)  │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Fetch fresh ride    │
              │ GET /api/rides/:id  │
              └──────────┬──────────┘
                         │
                    ┌────┴────┐
                   ╱ Ride    ╲
                  ╱  exists?  ╲
                 ╱             ╲
                YES             NO
                 │               │
                 ▼               ▼
    ┌────────────────┐    ┌───────────┐
    │ Display ride   │    │ Show      │
    │ details + seat │    │ "Not      │
    │ count          │    │ Found"    │
    └───────┬────────┘    └───────────┘
            │
            ▼
  ┌──────────────────┐
  │ User clicks      │
  │ "Book Now"       │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ POST /api/       │
  │ bookings/new     │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ BEGIN TRANSACTION│
  │ SELECT ... FOR   │
  │ UPDATE (lock row)│
  └────────┬─────────┘
           │
      ┌────┴────┐
     ╱ Seats   ╲
    ╱ Available? ╲
   ╱              ╲
  YES              NO
   │                │
   ▼                ▼
┌───────────┐  ┌──────────┐
│ UPDATE    │  │ ROLLBACK │
│ seats     │  │ Return   │
│ INSERT    │  │ 400 error│
│ booking   │  └──────────┘
│ COMMIT    │
└─────┬─────┘
      │
      ▼
┌───────────┐
│ Show      │
│ "Booking  │
│ Confirmed"│
└─────┬─────┘
      │
      ▼
  ┌───────┐
  │  End  │
  └───────┘
```

#### Authentication Activity

```
  ┌─────────┐
  │  Start  │
  └────┬────┘
       │
       ▼
┌──────────────┐
│ User enters  │
│ email        │
└──────┬───────┘
       │
  ┌────┴────┐
 ╱ Email    ╲
╱ ends with  ╲
╲ @lpu.in?   ╱
 ╲          ╱
  YES     NO
   │       │
   │       ▼
   │  ┌───────────┐
   │  │ Show error│──▶ End
   │  │ "Only     │
   │  │ university│
   │  │ emails"   │
   │  └───────────┘
   ▼
┌──────────────┐
│ Firebase     │
│ sends OTP    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ User enters  │
│ OTP code     │
└──────┬───────┘
       │
  ┌────┴────┐
 ╱  OTP     ╲
╱  Valid?    ╲
╲            ╱
 ╲          ╱
  YES     NO
   │       │
   │       ▼
   │  ┌───────────┐
   │  │ Show error│──▶ Re-enter OTP
   │  │ "Invalid  │
   │  │  code"    │
   │  └───────────┘
   ▼
┌──────────────┐
│ POST /api/   │
│ auth/register│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ User record  │
│ created in   │
│ MySQL        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Redirect to  │
│ Home Screen  │
└──────┬───────┘
       │
       ▼
   ┌───────┐
   │  End  │
   └───────┘
```

### 7.3 Sequence Diagrams

#### Ride Search & Booking Sequence

```
  User           Frontend         Backend API        MySQL DB         Mapbox API
   │                │                 │                  │                │
   │  Type origin   │                 │                  │                │
   │  & destination │                 │                  │                │
   │───────────────▶│                 │                  │                │
   │                │  Geocode origin │                  │                │
   │                │────────────────────────────────────────────────────▶│
   │                │                 │                  │   {lat, lng}   │
   │                │◀────────────────────────────────────────────────────│
   │                │  Geocode dest   │                  │                │
   │                │────────────────────────────────────────────────────▶│
   │                │                 │                  │   {lat, lng}   │
   │                │◀────────────────────────────────────────────────────│
   │                │  Get directions │                  │                │
   │                │────────────────────────────────────────────────────▶│
   │                │                 │                  │   polyline     │
   │                │◀────────────────────────────────────────────────────│
   │  Show map      │                 │                  │                │
   │◀───────────────│                 │                  │                │
   │                │  GET /rides/    │                  │                │
   │                │  search?origin  │                  │                │
   │                │  =X&dest=Y     │                  │                │
   │                │────────────────▶│                  │                │
   │                │                 │  SELECT * FROM   │                │
   │                │                 │  rides WHERE...  │                │
   │                │                 │─────────────────▶│                │
   │                │                 │  [ride results]  │                │
   │                │                 │◀─────────────────│                │
   │                │  [ride list]    │                  │                │
   │                │◀────────────────│                  │                │
   │  Show rides    │                 │                  │                │
   │◀───────────────│                 │                  │                │
   │                │                 │                  │                │
   │  Tap ride #42  │                 │                  │                │
   │───────────────▶│                 │                  │                │
   │                │  navigate       │                  │                │
   │                │  ({rideId: 42}) │                  │                │
   │                │  GET /rides/42  │                  │                │
   │                │────────────────▶│                  │                │
   │                │                 │  SELECT (fresh)  │                │
   │                │                 │─────────────────▶│                │
   │                │                 │  [ride detail]   │                │
   │                │                 │◀─────────────────│                │
   │                │  [ride data]    │                  │                │
   │                │◀────────────────│                  │                │
   │  Show details  │                 │                  │                │
   │◀───────────────│                 │                  │                │
   │                │                 │                  │                │
   │  Click "Book"  │                 │                  │                │
   │───────────────▶│                 │                  │                │
   │                │  POST /bookings │                  │                │
   │                │  /new           │                  │                │
   │                │────────────────▶│                  │                │
   │                │                 │  BEGIN TX         │                │
   │                │                 │  SELECT...FOR    │                │
   │                │                 │  UPDATE          │                │
   │                │                 │─────────────────▶│                │
   │                │                 │  [locked row]    │                │
   │                │                 │◀─────────────────│                │
   │                │                 │  UPDATE seats    │                │
   │                │                 │  INSERT booking  │                │
   │                │                 │─────────────────▶│                │
   │                │                 │  COMMIT          │                │
   │                │                 │─────────────────▶│                │
   │                │                 │  [done]          │                │
   │                │                 │◀─────────────────│                │
   │                │  201 Confirmed  │                  │                │
   │                │◀────────────────│                  │                │
   │  "Booking      │                 │                  │                │
   │   Confirmed!"  │                 │                  │                │
   │◀───────────────│                 │                  │                │
```

---

## 8. Algorithms

### 8.1 Pricing Algorithm (Tiered by Vehicle Type)

**Purpose:** Calculate a vehicle-specific capped ride price that ensures cost-sharing without commercial profit. Different vehicles incur different maintenance costs, so the price ceiling varies by type.

**Maintenance Multiplier Table:**

| Vehicle Type | Multiplier | Rationale |
|-------------|------------|----------|
| `bike` / `scooter` | 1.2x | Low maintenance, low wear-and-tear |
| `auto` | 1.35x | Moderate maintenance, three-wheeler upkeep |
| `car` | 1.5x | Highest maintenance — tyres, engine oil, insurance |

**Input Parameters:**

| Parameter | Source | Type |
|-----------|--------|------|
| `distance_km` | Mapbox Directions API | DECIMAL |
| `fuel_rate` | `fuel_rates` table in MySQL | DECIMAL (₹/litre) |
| `vehicle_mileage` | User input | DECIMAL (km/l) |
| `vehicle_type` | User input (ride form) | ENUM('bike','scooter','auto','car') |
| `driver_set_price` | User input via slider | DECIMAL (₹) |

**Algorithm (Pseudocode):**

```
FUNCTION calculatePrice(distance_km, fuel_rate, vehicle_mileage, vehicle_type, driver_set_price):

    // Step 1: Calculate baseline fuel cost
    base_cost = (distance_km × fuel_rate) / vehicle_mileage

    // Step 2: Lookup vehicle-specific maintenance multiplier
    IF vehicle_type IN ('bike', 'scooter'):
        multiplier = 1.2
    ELSE IF vehicle_type == 'auto':
        multiplier = 1.35
    ELSE:   // 'car' or unknown — default to highest
        multiplier = 1.5

    // Step 3: Calculate the maximum allowed price (vehicle-specific cap)
    max_allowed = base_cost × multiplier

    // Step 4: Clamp driver's price to the cap
    capped_price = MIN(driver_set_price, max_allowed)

    // Step 5: Return all values (rounded to 2 decimal places)
    RETURN {
        base_price:   ROUND(base_cost, 2),
        multiplier:   multiplier,
        max_allowed:  ROUND(max_allowed, 2),
        capped_price: ROUND(capped_price, 2),
        was_clamped:  driver_set_price > max_allowed
    }

END FUNCTION
```

**Complexity:** O(1) — constant time, single arithmetic computation with a lookup.

**Worked Example — Same Route, Different Vehicles:**

```
Common Input: distance_km = 40, fuel_rate = ₹105/litre

┌───────────┬─────────┬────────────┬────────────┬──────────┬───────────┐
│ Vehicle   │ Mileage │ base_cost  │ Multiplier │ max_cap  │ Per-Seat  │
│           │ (km/l)  │ (fuel)     │            │ (ceiling)│ (3 seats) │
├───────────┼─────────┼────────────┼────────────┼──────────┼───────────┤
│ Bike      │ 45      │ ₹93.33     │ 1.2x       │ ₹112.00  │ ₹37.33    │
│ Auto      │ 25      │ ₹168.00    │ 1.35x      │ ₹226.80  │ ₹75.60    │
│ Car       │ 15      │ ₹280.00    │ 1.5x       │ ₹420.00  │ ₹140.00   │
└───────────┴─────────┴────────────┴────────────┴──────────┴───────────┘

Detailed — Bike Example:
  Step 1: base_cost   = (40 × 105) / 45 = 4200 / 45 = ₹93.33
  Step 2: multiplier  = 1.2  (bike)
  Step 3: max_allowed = 93.33 × 1.2 = ₹112.00
  Step 4: driver asks ₹150 → capped_price = MIN(150, 112) = ₹112.00  ⚠️ Clamped

Detailed — Car Example:
  Step 1: base_cost   = (40 × 105) / 15 = 4200 / 15 = ₹280.00
  Step 2: multiplier  = 1.5  (car)
  Step 3: max_allowed = 280 × 1.5 = ₹420.00
  Step 4: driver asks ₹350 → capped_price = MIN(350, 420) = ₹350.00  ✅ Within cap
  Per-seat (3 passengers): 350 / 3 = ₹116.67
```

### 8.2 Concurrency Control — Booking Transaction

**Purpose:** Prevent the double-booking race condition when multiple passengers attempt to book the last seat simultaneously.

**Problem:**

```
WITHOUT Locking (Race Condition):

    Time T1: Student A → SELECT available_seats → returns 1
    Time T1: Student B → SELECT available_seats → returns 1  (same stale value!)
    Time T2: Student A → UPDATE seats = 0, INSERT booking → ✅ OK
    Time T2: Student B → UPDATE seats = -1, INSERT booking → ❌ OVERSOLD!
```

**Solution Algorithm (Pseudocode):**

```
FUNCTION bookSeat(ride_id, passenger_id, seats_requested):

    connection = pool.getConnection()

    TRY:
        connection.BEGIN_TRANSACTION()

        // Step 1: Lock the specific ride row
        ride = connection.QUERY(
            "SELECT available_seats, capped_price FROM rides WHERE id = ? FOR UPDATE",
            [ride_id]
        )
        // Other transactions trying to read/write this row are now BLOCKED

        // Step 2: Validate seat availability (while row is locked)
        IF ride.available_seats < seats_requested THEN
            connection.ROLLBACK()
            RETURN Error(400, "Not enough seats")
        END IF

        // Step 3: Calculate per-seat price
        price = (ride.capped_price / ride.available_seats) × seats_requested

        // Step 4: Atomic update + insert
        connection.QUERY("UPDATE rides SET available_seats = available_seats - ? WHERE id = ?")
        connection.QUERY("INSERT INTO bookings (ride_id, passenger_id, seats_booked, price_paid) VALUES (?, ?, ?, ?)")

        // Step 5: Commit — both changes become permanent atomically
        connection.COMMIT()
        RETURN Success(201, booking_data)

    CATCH error:
        connection.ROLLBACK()
        IF error is DUPLICATE_ENTRY THEN
            RETURN Error(409, "Already booked")
        END IF
        RETURN Error(500, "Server error")

    FINALLY:
        connection.release()  // Always return connection to pool

END FUNCTION
```

**Correctness Proof:**

```
WITH SELECT ... FOR UPDATE:

    T1: Student A → BEGIN; SELECT...FOR UPDATE → sees 1, ROW LOCKED
    T1: Student B → BEGIN; SELECT...FOR UPDATE → ⏳ BLOCKED (waiting for lock)
    T2: Student A → UPDATE seats=0, INSERT, COMMIT → ✅ Lock released
    T3: Student B → SELECT...FOR UPDATE → now sees 0 → ROLLBACK → ❌ "No seats"

    Result: Exactly 1 booking created. No overselling. ✅
```

### 8.3 Trust Score & Cancellation Penalty Algorithm

**Purpose:** Apply tiered trust score penalties for passenger booking cancellations based on proximity to departure time.

**Algorithm (Pseudocode):**

```
FUNCTION calculateCancellationPenalty(departure_time, cancellation_time):

    hours_before = (departure_time - cancellation_time) / 3600  // in hours

    // Tier 1: Free cancellation (> 4 hours before departure)
    IF hours_before > 4 THEN
        penalty = 0

    // Tier 2: Late cancellation (≤ 4 hours but > 30 minutes)
    ELSE IF hours_before > 0.5 THEN
        penalty = 2

    // Tier 3: Last-minute / No-Show equivalent (≤ 30 minutes)
    ELSE
        penalty = 5

    END IF

    RETURN penalty

END FUNCTION

FUNCTION applyCancellationPenalty(booking_id, passenger_id, departure_time):

    penalty = calculateCancellationPenalty(departure_time, NOW())

    IF penalty > 0 THEN
        UPDATE users SET trust_score = trust_score - penalty,
                         current_streak = 0
                     WHERE id = passenger_id

        UPDATE bookings SET cancellation_penalty = penalty
                        WHERE id = booking_id
    END IF

    // Restore seat regardless of penalty
    UPDATE rides SET available_seats = available_seats + seats_booked
    UPDATE bookings SET status = 'cancelled'

END FUNCTION
```

**Worked Example:**

```
Scenario: Departure at 14:00, passenger cancels at 13:45 (15 mins before)

    hours_before = (14:00 - 13:45) / 60 = 0.25 hours
    0.25 ≤ 0.5 → Tier 3 → penalty = 5

    Result: −5 Trust Points, streak reset to 0.
    User sees: "Booking cancelled. Late cancellation penalty: −5 Trust Points."

Scenario: Departure at 14:00, passenger cancels at 08:00 (6 hours before)

    hours_before = 6
    6 > 4 → Tier 1 → penalty = 0

    Result: No penalty. Free cancellation.
    User sees: "Booking cancelled successfully."
```

### 8.4 Pattern-Match Report Evaluation Algorithm

**Purpose:** Prevent false accusations by requiring corroboration from multiple independent reporters before applying trust score penalties. Single reports serve only as warnings ("The Shield").

**Algorithm (Pseudocode):**

```
FUNCTION evaluateReport(reported_user_id, report_reason, ride_id, reporter_id):

    // Step 1: No-Show bypasses the shield entirely
    IF report_reason == 'no_show' THEN
        UPDATE users SET trust_score = trust_score - 5,
                         current_streak = 0
                     WHERE id = reported_user_id
        RETURN { action: "IMMEDIATE_PENALTY", points: -5 }
    END IF

    // Step 2: For conduct reports, check for pattern
    // Count distinct reporters across distinct rides in the last 30 days
    recent_reports = SELECT COUNT(DISTINCT reporter_id)
                     FROM reports
                     WHERE reported_user_id = ?
                       AND reporter_id != reporter_id  // exclude current reporter
                       AND reason IN ('bad_conduct', 'unsafe_driving', 'harassment')
                       AND created_at >= NOW() - INTERVAL 30 DAY

    // Step 3: Single report → Warning only (The Shield)
    IF recent_reports == 0 THEN
        // This is the first/only reporter — issue warning, no deduction
        INSERT system_warning for reported_user
        RETURN { action: "WARNING_ONLY", points: 0 }
    END IF

    // Step 4: 2+ reports from different people → Pattern confirmed
    IF recent_reports >= 1 THEN  // current report makes it 2+
        // Deduct for each qualifying report
        UPDATE users SET trust_score = trust_score - 10,
                         current_streak = 0
                     WHERE id = reported_user_id
        penalty = -10
    END IF

    // Step 5: Escalation check (3+ pattern-matched reports)
    total_pattern_reports = recent_reports + 1  // including current
    IF total_pattern_reports >= 3 THEN
        UPDATE users SET trust_score = trust_score - 25
                     WHERE id = reported_user_id
        penalty = penalty - 25
    END IF

    RETURN { action: "PATTERN_PENALTY", points: penalty }

END FUNCTION
```

**Worked Example:**

```
Case 1 — Single liar:
    User X reports User Y for "bad_conduct" on Ride #50.
    No other reports against Y in 30 days.
    → WARNING_ONLY. Y's trust_score unchanged. Shield protects Y. ✅

Case 2 — Real pattern:
    User X reports User Y for "bad_conduct" on Ride #50 → Warning only.
    User Z (different person) reports User Y for "unsafe_driving" on Ride #55.
    → Pattern confirmed (2 different people, 2 different rides).
    → −10 Trust Points. Streak reset. Y is notified.

Case 3 — No-Show:
    User X reports User Y as "no_show" on Ride #60.
    → Immediate −5 Trust Points. No shield needed — no-show is objective fact.
```

---

## 9. User Interface Requirements

### 9.1 Screen Inventory

| # | Screen | Access | Primary Action |
|---|--------|--------|----------------|
| 1 | Login / Register | Unauthenticated | Enter university email, OTP verification |
| 2 | Home Dashboard | Authenticated | Choose "Post a Ride" or "Find a Ride" |
| 3 | Post Ride | Authenticated (Driver) | Fill ride form, adjust price slider, submit |
| 4 | Search / Map | Authenticated (Passenger) | Enter route, view map, browse ride cards |
| 5 | Booking Details | Authenticated (Passenger) | View fresh ride data, confirm booking |
| 6 | Booking Success | Authenticated (Passenger) | Confirmation with WhatsApp and Call native handoff buttons |
| 7 | My Rides | Authenticated | View ride/booking history with statuses; file reports |
| 8 | Profile | Authenticated | View/edit personal information; view trust score and current streak |

### 9.2 Screen Flow

```
┌─────────────────────────────────────────────────────────┐
│                    APP LAUNCH                            │
└────────────────────────┬────────────────────────────────┘
                         │
                   ┌─────┴─────┐
                  ╱ Logged in? ╲
                 ╱              ╲
               YES               NO
                │                 │
                ▼                 ▼
    ┌───────────────┐    ┌───────────────┐
    │  Home Screen  │    │ Login Screen  │
    │  (Tab Nav)    │    │               │
    └───────┬───────┘    └───────┬───────┘
            │                    │
            │              [OTP Success]
            │                    │
            │◀───────────────────┘
            │
    ┌───────┴───────────────────────────────────┐
    │              TAB NAVIGATOR                 │
    │                                            │
    │  ┌──────┐  ┌────────┐  ┌──────┐  ┌──────┐│
    │  │ Home │  │ Search │  │  My  │  │Profile││
    │  │      │  │  /Map  │  │Rides │  │      ││
    │  └──┬───┘  └───┬────┘  └──────┘  └──────┘│
    │     │          │                           │
    └─────┼──────────┼───────────────────────────┘
          │          │
    ┌─────┴───┐ ┌────┴──────────┐
    │Post Ride│ │Booking Details│
    │ (Modal) │ │ (push screen) │
    └─────────┘ └───────────────┘
```

### 9.3 UI Component Specifications

#### RideCard Component

| Attribute | Specification |
|-----------|---------------|
| **Content** | Driver name, origin → destination, departure time (local TZ), available seats, per-seat price |
| **Emergency Badge** | Orange badge with `⚠️ ALTERNATE ROUTE` text if `is_emergency_route = true` |
| **Tap Action** | Navigates to Booking Details with `rideId` param only (no full object) |
| **Empty State** | "No rides found for this route" with a refresh button |

#### PriceSlider Component

| Attribute | Specification |
|-----------|---------------|
| **Range** | ₹0 to `max_cap` |
| **Hard Stop** | Slider cannot exceed `max_cap` value |
| **Visual Indicator** | Vertical line at `max_cap` position with "MAX" label |
| **Real-Time Display** | Shows `base_price`, `driver_set_price`, and `per_seat_price` updating live |

#### MapRoute Component

| Attribute | Specification |
|-----------|---------------|
| **Map Provider** | `react-native-maps` (MapView) |
| **Origin Marker** | Green pin with "Pickup" title |
| **Destination Marker** | Red pin with "Drop-off" title |
| **Route Line** | Blue polyline (`#4A90D9`, 4px width) |
| **Initial Region** | Centered between origin and destination with appropriate zoom |
| **Precondition** | Location permission granted AND coordinates loaded (not null) |

#### BookingSuccess Component

| Attribute | Specification |
|-----------|---------------|
| **Trigger** | Displayed immediately after a successful `201 Created` response from `POST /api/bookings/new` |
| **Content** | Confirmation message ("Seat Booked!"), booking summary (ride origin → destination, departure time, seats booked, price paid), and driver's name |
| **WhatsApp Button** | Actionable link using the WhatsApp API (`https://wa.me/{driver_phone}?text=...`) pre-filled with ride details. Opens the device's WhatsApp app for off-platform coordination. |
| **Call Button** | Actionable link using the `tel:` URI protocol (`tel:{driver_phone}`) to initiate a native phone call to the driver. |
| **Rationale** | Since in-app chat is explicitly out of scope, the Native Handoff pattern ensures passengers and drivers can coordinate pickup logistics without requiring RideMates to build a messaging system. |
| **Fallback** | If the driver has no phone number on file, both buttons SHALL be hidden and a message SHALL display: "Driver has not shared contact details yet." |

#### ReportIncident Component

| Attribute | Specification |
|-----------|---------------|
| **Access** | Available on the My Rides / My Bookings screen for completed or no-show rides |
| **Content** | Reason selector (dropdown: No-Show, Bad Conduct, Unsafe Driving, Harassment), optional free-text description (max 500 chars), and "Submit Report" button |
| **Confirmation** | After submission, display a confirmation: "Report submitted. Our system will review the pattern." |
| **Cooldown Indicator** | If the user has filed 3 reports in 24 hours, the button SHALL be disabled with tooltip: "You have reached the daily report limit." |

---

## 10. Appendices

### 10.1 Appendix A — Glossary of Domain Terms

| Term | Definition |
|------|------------|
| **Day-Scholar** | A university student who commutes daily from outside the campus |
| **White Plate Vehicle** | A privately registered vehicle (non-commercial) in India; cannot legally be used for commercial ride-hailing |
| **Cost-Sharing** | A model where fuel costs are split and adjusted by a tiered maintenance buffer (1.2x – 1.5x) based on vehicle wear and tear; distinct from commercial fare |
| **Strike Resilience** | The ability to continue operations during regional transportation disruptions (bus strikes, highway blockades) |
| **Link Road** | A secondary village road that connects two towns, bypassing the main highway |
| **Geocoding** | Converting a text place name into GPS coordinates (latitude, longitude) |
| **Polyline** | A series of GPS points rendered as a connected line on a map to represent a route |
| **Row-Level Lock** | A database lock on a single table row that prevents other transactions from modifying it until the lock is released |
| **Idempotent** | An operation that produces the same result whether executed once or multiple times |
| **Token Refresh** | The process of obtaining a new authentication token when the current one expires |
| **Trust Score** | A numerical reputation metric (starting at 100) that decreases with verified penalties and increases indirectly via clean ride streaks |
| **Current Streak** | A counter of consecutive completed rides with no incidents; resets to 0 on any trust penalty |
| **Pattern-Match Shield** | The rule that a single conduct report triggers only a warning; penalties require corroboration from 2+ independent reporters across different rides |
| **Clean Ride** | A completed ride with no reports filed within the 12-hour grace period after the driver marks it complete |
| **Native Handoff** | Redirecting the user to an external app (WhatsApp, Phone Dialer) via a deep link (`wa.me`, `tel:`) for off-platform coordination |

### 10.2 Appendix B — Error Code Reference

| HTTP Status | Error Code | Trigger Condition | User-Facing Message |
|------------|------------|-------------------|---------------------|
| 400 | `INVALID_EMAIL_DOMAIN` | Email does not end with `@lpu.in` | "Only university emails (@lpu.in) are allowed" |
| 400 | `MISSING_FIELDS` | Required request body fields are absent | "Please fill in all required fields" |
| 400 | `INSUFFICIENT_SEATS` | `seats_booked > available_seats` | "Not enough seats available. Requested: X, Available: Y" |
| 400 | `PRICE_EXCEEDS_CAP` | Driver price > max cap (will be auto-corrected) | "Price has been adjusted to the maximum allowed" |
| 401 | `NO_TOKEN` | `Authorization` header missing | "Please log in to continue" |
| 401 | `INVALID_TOKEN` | Firebase token invalid, malformed, or expired | "Session expired. Please log in again" |
| 404 | `RIDE_NOT_FOUND` | `ride_id` does not exist in database | "This ride is no longer available" |
| 404 | `USER_NOT_FOUND` | `firebase_uid` has no corresponding MySQL record | "User profile not found" |
| 409 | `ALREADY_BOOKED` | Passenger already has a booking for this ride | "You have already booked this ride" |
| 409 | `DUPLICATE_EMAIL` | Email already registered in `users` table | "An account with this email already exists" |
| 500 | `DB_ERROR` | MySQL query failure | "Something went wrong. Please try again" |
| 500 | `INTERNAL_ERROR` | Unhandled server error | "Something went wrong. Please try again" |
| 400 | `CANCELLATION_PENALTY` | Booking cancelled within penalty window | "Booking cancelled. Late cancellation penalty: −{X} Trust Points" |
| 400 | `REPORT_COOLDOWN` | User has filed 3 reports in 24 hours | "You have reached the daily report limit. Try again tomorrow" |
| 200 | `REPORT_WARNING_ONLY` | Single conduct report filed (shield applied) | "Report submitted. A system warning has been issued" |
| 200 | `REPORT_PATTERN_PENALTY` | Pattern-matched conduct reports confirmed | "Report submitted. Pattern detected — trust score adjusted" |
| 200 | `RIDE_COMPLETION_PROMPT` | 2+ hours after departure, driver prompted | "Is your trip to {destination} finished?" |

---

*Document: Software Requirements Specification (SRS)*
*Project: RideMates — University Peer-to-Peer Commute Network*
*Version: 1.2 | February 2026*
*Standard: IEEE 830-1998*
