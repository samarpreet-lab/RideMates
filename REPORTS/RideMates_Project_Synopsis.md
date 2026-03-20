# RideMates — University-Exclusive Peer-to-Peer Commute Network

## Project Synopsis

---

**Document Title:** Project Synopsis  
**Project Name:** RideMates  
**Course Code:** CAP463 – CAPSTONE PROJECT  
**Document Date:** 26 February 2026  
**Current Version Date:** 15 March 2026  

### Submitted By

| Field | Details |
|-------|---------|
| **Name** | Samarpreet Singh |
| **Roll Number** | 43 |
| **Registration Number** | 12315307 |

### Submitted To

| Field | Details |
|-------|---------|
| **Evaluator Name** | Ayushi |
| **Evaluator UID** | 34377 |

### Institution

**School of Computer Applications**  
**Lovely Professional University**  
**Punjab, India**

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Motivation & Problem Statement](#2-motivation--problem-statement)
   - [2.1 Vulnerability to Strikes & Gridlock](#21-vulnerability-to-strikes--gridlock)
   - [2.2 The Hidden Cost of Public Transport](#22-the-hidden-cost-of-public-transport)
   - [2.3 The "Trust Deficit" in Open Networks](#23-the-trust-deficit-in-open-networks)
3. [Objectives of the Project](#3-objectives-of-the-project)
   - [3.1 Primary Objectives](#31-primary-objectives)
   - [3.2 Secondary Objectives](#32-secondary-objectives)
4. [Project Scope](#4-project-scope)
   - [4.1 Functional Scope](#41-functional-scope)
   - [4.2 Exclusions (Out of Scope)](#42-exclusions-out-of-scope)
5. [System Analysis & Methodology](#5-system-analysis--methodology)
   - [5.1 Technology Stack](#51-technology-stack)
6. [Feasibility Study](#6-feasibility-study)
   - [6.1 Technical Feasibility](#61-technical-feasibility)
   - [6.2 Economic Feasibility](#62-economic-feasibility)
7. [System Design (Proposed)](#7-system-design-proposed)
   - [7.1 Database Schema](#71-database-schema)
   - [7.2 Data Flow](#72-data-flow)
8. [Conclusion](#8-conclusion)
9. [References](#9-references)

---

## 1. Introduction

The modern university ecosystem in Punjab faces a unique logistical challenge: a significant portion of the student and faculty body act as **"day-scholars,"** commuting daily from neighboring cities such as Ludhiana, Jalandhar, and Phagwara. While the distance is manageable (20–40 km), the existing transport infrastructure fails to provide an optimal balance between **cost**, **time**, and **comfort**.

**RideMates** is a mobile application designed to bridge this gap by creating a **university-exclusive peer-to-peer ride-sharing network**. The platform focuses on **"Asset Utilization"** by connecting vehicle owners (students/staff with cars or two-wheelers) who have empty seats with peers traveling along the same route.

Unlike commercial aggregators like Uber or Rapido, RideMates operates on a **closed-loop verification system** and a **non-profit cost-sharing model**. By restricting access strictly to users with a valid University Institutional Email (e.g., `@lpu.in`), RideMates creates a secure, legal, and community-driven alternative to public transport without requiring manual ID card checks.

---

## 2. Motivation & Problem Statement

The development of RideMates is driven by **four critical inefficiencies** in the current commuting landscape:

### 2.1 Vulnerability to Strikes & Gridlock

The region frequently experiences disruptions due to:
- Bus Worker Strikes
- Citizen protests (Bandhs)
- Highway gridlocks caused by accidents

During these events, rigid public transport systems collapse, leaving students stranded. **Two-wheelers**, however, offer the necessary agility to navigate alternative routes and link roads, ensuring students can reach the university even when highways are blocked.

### 2.2 The Hidden Cost of Public Transport

While public bus tickets appear cheap (₹20–30 from Jalandhar, ~₹70 from Ludhiana), the **"Total Commute Cost"** is significantly higher. Students must pay for:
- Auto-rickshaws to reach the bus stand
- Shuttles to reach their campus block

**RideMates** offers a **"Door-to-Block"** service where the fuel-split cost is comparable to the bus ticket, but eliminates the expensive and time-consuming **"Last Mile"** connections.

### 2.3 The "Trust Deficit" in Open Networks

Existing carpooling solutions (e.g., BlaBlaCar) and bike-taxis (e.g., Rapido) operate on **open networks**. Students, particularly **female commuters**, are often uncomfortable sharing a ride—especially a two-wheeler—with **unverified strangers** on highways.

---

## 3. Objectives of the Project

The primary goal of this project is to develop a **robust Android/iOS application** that democratizes campus commuting.

### 3.1 Primary Objectives

1. **To Create an Automated Verified Ecosystem**  
   Implement a strict approach where every user is authenticated via **Domain-Restricted Email Verification**. Only users who can access a valid `@lpu.in` inbox can register.

2. **To Optimize Two-Wheeler Commuting**  
   Leverage the high density of bikes/scooters to provide an **agile commuting option** that is resilient to traffic jams and strikes.

3. **To Implement a Non-Commercial Cost Model**  
   Develop a **"Fair-Share Algorithm"** that calculates fuel costs based on Standardized Vehicle Categories with **vehicle-specific maintenance multipliers** (Bike/Scooter: 1.2x, Auto: 1.35x, Car: 1.5x). Enforce **per-seat price caps (BlaBlaCar-style)** to prevent commercial profit and ensure cost certainty.

### 3.2 Secondary Objectives

1. **Strike Resilience**  
   To enable a **"Route Agility"** feature where drivers can tag rides as **"Emergency/Alternative Route"** during public transport strikes.

2. **Social Networking**  
   To transform **dead commute time** into **networking opportunities** between juniors and seniors.

3. **Mutual Accountability**  
   To implement a **user-driven Report & Accountability system** that flags no-shows and bad conduct, with **pattern-match evaluation** to penalize repeat offenders and award trust streaks to clean users.

---

## 4. Project Scope

### 4.1 Functional Scope

- **User Module**  
  Automated Registration via University Email OTP (One Time Password), Profile Management.

- **Ride Management**  
  Post Ride (One-Time), Search Ride, Filter by Visual Vehicle Categories (e.g., "Two-Wheeler", "Car"). Map-based Route Visualization (static polyline). Emergency Route Flagging for strike resilience.

- **Safety Module**  
  "Gender-Lock" (Female-to-Female only filter), "Spare Helmet" Checkbox.

- **Booking Module**  
  Auto-booking engine with SQL transaction locking to prevent double-booking. Concurrency-safe seat reservation.

- **Report & Accountability Module**  
  User-filed reports for no-shows and bad conduct; pattern-match evaluation; mutual accountability shield.

- **Post-Booking Handoff**  
  Native WhatsApp and Call links for off-platform driver-passenger coordination after booking confirmation.

- **Ride Lifecycle Module**  
  Ride completion prompt 2 hours post-departure; clean streak awards for rides with no reports within 12 hours.

### 4.2 Exclusions (Out of Scope)

- **In-App Payment Processing**  
  To avoid banking regulations and complexities, the app will facilitate offline settlements (Cash/UPI) based on the calculated split amount.

- **Real-Time GPS Tracking**  
  The app matches users based on "Source/Destination" text logic and static route polylines. Live turn-by-turn navigation and vehicle tracking are excluded to reduce battery drain and complexity.

- **In-App Chat/Messaging**  
  Driver-passenger communication occurs off-platform (WhatsApp, Call) after booking.

- **Automated Star-Based Rating System**  
  Replaced by report-based mutual accountability model for mitigating manipulation.

- **Push Notification System**  
  Not implemented in current release.

---

## 5. System Analysis & Methodology

### 5.1 Technology Stack (React Native + Node.js + MySQL)

| Component | Technology | Justification |
|-----------|-----------|--------------|
| **Frontend** | React Native | Chosen for its ability to compile to native Android/iOS code using JavaScript. |
| **Backend** | Node.js & Express.js | Chosen for non-blocking I/O, essential for handling concurrent booking requests. |
| **Database** | MySQL | A Relational Database Management System (RDBMS) is critical for maintaining structured relationships between Users, Rides, and Trust Scores. |
| **Authentication** | Backend-generated OTP (6-digit, delivered via SMTP) + JWT session tokens | Configured to allow sign-ups only from the university domain (e.g., `*@lpu.in`). OTP expires after 10 minutes; JWT tokens persist for 7 days. |

---

## 6. Feasibility Study

### 6.1 Technical Feasibility

The project utilizes open-source technologies and demonstrates strong technical feasibility:

- ✓ The team possesses the requisite skills in **React Native**, **Node.js**, **SQL**, and **SMTP integration**.
- ✓ Backend OTP generation and verification is **standard practice** in production systems.
- ✓ Transaction-level row locking (`SELECT...FOR UPDATE`) in MySQL ensures **concurrency-safe booking**.
- ✓ **Mapbox API** and **SMTP** (e.g., Nodemailer) are battle-tested services for routing and email delivery, reducing development risk.

### 6.2 Economic Feasibility

- ✓ The project requires **zero capital investment**.
- ✓ Hosting will be managed via **free-tier cloud services**.
- ✓ The app relies on the existing hardware (smartphones) of the users.

---

## 7. System Design (Proposed)

### 7.1 Database Schema

The database schema comprises the following core entities:

- **users** — User profiles with authentication details and trust metrics
- **rides** — Ride postings with route, pricing, and lifecycle status
- **bookings** — Seat reservations with transactional integrity
- **user_otps** — OTP records for authentication verification
- **fuel_rates** — Reference data for pricing algorithm
- **reports** — User-filed incident reports for accountability

*(Detailed ER diagram and schema specifications available in the SRS document.)*

### 7.2 Data Flow

**Authentication Flow:**
```
User Email Input → Backend OTP Generation → SMTP Delivery → 
User OTP Entry → Verification → JWT Token Issuance → 
Session Management (7-day expiry)
```

**Ride Posting & Booking Flow:**
```
Driver Posts Ride → System Price Calculation (with multipliers) → 
Price Cap Enforcement → Passenger Searches → Map Visualization → 
Booking Transaction (row-level locking) → Seat Decrement → 
Post-Booking Handoff (WhatsApp/Call)
```

**Ride Completion & Accountability Flow:**
```
Ride Completion Prompt (2 hours post-departure) → 
Driver Marks Complete → 12-hour Report Window → 
Pattern-Match Evaluation → Streak Award/Penalty
```

---

## 8. Conclusion

**RideMates** represents a paradigm shift from **"Transactional Transport"** to **"Community Commuting."**

By solving the specific pain points of the university demographic—namely:
- **Cost** (inefficient public transport pricing)
- **Safety** (trust deficit in open networks)
- **Resilience** (vulnerability to strikes and gridlock)

—RideMates provides a **vital utility** that is:

- ✓ **Technically challenging** — Requires expertise in mobile development, concurrent database transactions, and distributed systems
- ✓ **Socially responsible** — Fosters peer trust and community engagement
- ✓ **Economically viable** — Zero capital cost with sustainable peer-to-peer economics

This project makes a strong candidate for a **Capstone Project** by demonstrating innovation, technical depth, and real-world impact.

---

## 9. References

1. **Motor Vehicles Act, 1988 (Section 66)**  
   Regarding private vehicle usage and non-commercial ride-sharing regulations.

2. **Case Study: BlaBlaCar**  
   Analyzing the trust model of long-distance carpooling and per-seat pricing mechanisms.

3. **React Native Documentation**  
   For cross-platform mobile development standards and best practices.

---

## Document Metadata

| Property | Value |
|----------|-------|
| **Document Type** | Project Synopsis |
| **Status** | Final |
| **Created Date** | 26 February 2026 |
| **Last Updated** | 15 March 2026 |
| **Version** | 1.0 (Aligned with SRS v1.5) |
| **Audience** | Faculty Evaluators, Project Team, Stakeholders |

---

*This document is part of the RideMates Capstone Project submission package. For detailed technical specifications, see the Software Requirements Specification (SRS) document.*
