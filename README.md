# 🚗 RideMates — University Peer-to-Peer Commute Network

A hyper-local, university-exclusive ride-sharing platform that connects verified university members (students & faculty) for cost-effective, trusted daily commutes.

**Status:** 🚀 Beta (Capstone Project)  
**GitHub Repository:** [samarpreet-lab/RideMates](https://github.com/samarpreet-lab/RideMates)

---

## 📋 Project Structure

```
CAPSTONE/
├── RideMates/                       # Main application
│   ├── Backend/                     # Node.js + Express API
│   │   ├── config/                  # Database configuration
│   │   ├── controllers/             # Business logic
│   │   ├── routes/                  # API endpoints
│   │   ├── utils/                   # Helper functions (pricing algorithm)
│   │   ├── database/                # SQL schema files
│   │   ├── server.js                # Express server entry point
│   │   └── package.json             # Backend dependencies
│   │
│   └── Frontend/                    # React Native + Expo app
│       ├── app/                     # File-based routing (Expo Router)
│       ├── services/                # API calls, Firebase, Mapbox
│       ├── components/              # Reusable UI components
│       ├── constants/               # Theme, config, constants
│       ├── hooks/                   # Custom React hooks
│       └── package.json             # Frontend dependencies
│
├── RIDEMATES_BLUEPRINT.md           # Complete technical blueprint
├── RIDEMATES_SRS.md                 # Software Requirements Specification
├── RIDEMATES_SYNOPSIS.md            # Academic synopsis (7 pages)
└── .gitignore                       # Git ignore patterns
```

---

## 🎯 Core Features

| Feature | Description |
|---------|-------------|
| **Domain-Restricted Auth** | Only `@lpu.in` emails can register; all users are verified |
| **Fair-Share Pricing** | BlaBlaCar model: base cost + 1.5x price cap (no profit) |
| **Visual Routes** | Mapbox-powered interactive map showing exact route before booking |
| **Concurrency-Safe Booking** | SQL row-level locking prevents double-booking race conditions |
| **Strike Resilience** | Drivers can flag alternate village link-road routes during highway blockades |

---

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 18.x LTS
- **Framework:** Express.js 4.x
- **Database:** MySQL 8.0 (Aiven Cloud)
- **Authentication:** Firebase Auth (Email OTP)
- **External APIs:** Mapbox (Geocoding & Directions)

### Frontend
- **Cross-Platform:** React Native with Expo SDK 51+
- **Navigation:** Expo Router (file-based routing)
- **HTTP Client:** Axios with request interceptors
- **Maps:** react-native-maps + Mapbox API
- **Location:** expo-location (native GPS)
- **Date/Time:** dayjs (UTC timezone handling)

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** installed
- **Aiven MySQL** database (or local MySQL 8.0)
- **Firebase Project** (for authentication)
- **Mapbox Account** (for mapping APIs)

### Required API Keys

| Service | Purpose | Where to Get |
|---------|---------|-------------|
| **Firebase** | Email OTP authentication | [Firebase Console](https://console.firebase.google.com/) |
| **Mapbox Public Token** | Geocoding & directions | [Mapbox Dashboard](https://account.mapbox.com/tokens/) |
| **MySQL Connection URI** | Database access | Aiven Cloud console |

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/samarpreet-lab/RideMates.git
cd RideMates
```

### 2. Set Up Backend

```bash
cd RideMates/Backend

# Install dependencies
npm install

# Create .env file with your secrets
cat > .env << EOF
PORT=5000
NODE_ENV=development

# MySQL (Aiven)
DB_HOST=your-aiven-host.aivencloud.io
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=your_password
DB_NAME=ridemates
DB_SSL=true

# Firebase (from console)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_ADMIN_KEY={"type":"service_account",...}

# Pricing
DEFAULT_FUEL_RATE=105
PRICE_CAP_MULTIPLIER=1.5
EOF

# Create database tables
# Use MySQL client to run: RideMates/Backend/database/00_init_all_tables.sql

# Start the server
npm start
# Server runs on http://localhost:5000
```

### 3. Set Up Frontend

```bash
cd ../Frontend

# Install dependencies
npm install

# Create Expo config (frontend .env)
cat > .env << EOF
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.X:5000/api
EOF

# Note: Replace 192.168.1.X with your laptop's IPv4 address (from ipconfig on Windows)

# Start Expo
npm start
# Or: npx expo start
# Then press 'a' for Android or 'i' for iOS
```

### 4. Find Your Laptop's IP Address

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your network adapter (e.g., `192.168.1.5`)

**On macOS/Linux:**
```bash
ifconfig
```
Look for `inet` address (e.g., `192.168.1.5`)

---

## 📚 Documentation

### Core Documents

- **[RIDEMATES_BLUEPRINT.md](./RIDEMATES_BLUEPRINT.md)** — Complete technical blueprint with:
  - Database schema (SQL CREATE TABLE statements)
  - API reference (all endpoints with examples)
  - 9 critical traps & solutions (concurrency, timezone, token expiry, etc.)
  - Firebase authentication flow
  - Mapbox routing integration
  - Pricing algorithm with worked examples

- **[RIDEMATES_SRS.md](./RIDEMATES_SRS.md)** — IEEE 830 SRS document with:
  - 36+ functional requirements
  - 20+ non-functional requirements
  - Use case diagrams
  - Sequence diagrams
  - Complete API specification
  - Error codes reference

- **[RIDEMATES_SYNOPSIS.md](./RIDEMATES_SYNOPSIS.md)** — Academic 7-page synopsis with:
  - Problem statement
  - System architecture (3-tier diagram)
  - Database design + ER diagram
  - Implementation plan

### Backend Documentation

- [Backend Database Setup](./RideMates/Backend/database/README.md) — SQL schema guide
- [Backend Config](./RideMates/Backend/config/db.js) — Database connection pool

### Frontend Documentation

- [Frontend README](./RideMates/Frontend/README.md) — Expo app setup

---

## 🔐 Security & Secrets

### ⚠️ Critical: Never Commit Secrets

Your `.env` file contains sensitive information:
- MySQL password
- Firebase Admin Key
- API tokens

**These files are in `.gitignore` — do NOT commit them!**

### Backend vs Frontend Secrets

| Location | Safe? | Example |
|----------|--------|---------|
| **Backend `.env`** | ✅ YES | DB_PASSWORD, FIREBASE_ADMIN_KEY |
| **Frontend `.env` (Expo)** | ❌ NO | Hardcoded into APK file |

**Rule:** Frontend `.env` only contains PUBLIC keys with `EXPO_PUBLIC_` prefix:
```env
EXPO_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoi...
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
```

---

## 🗄️ Database Setup

### Create Tables

1. Open your Aiven MySQL console
2. Copy the entire SQL from: `RideMates/Backend/database/00_init_all_tables.sql`
3. Paste and execute
4. Tables created: `users`, `rides`, `bookings`, `fuel_rates`

### Verify Setup

```sql
-- Check tables
SHOW TABLES;

-- View sample fuel rates
SELECT * FROM fuel_rates;

-- Check structure
DESCRIBE rides;
DESCRIBE bookings;
```

---

## 🐛 Troubleshooting

### "Cannot find server" / 404 on /health

**Problem:** Frontend can't reach backend  
**Solution:**
1. Ensure backend is running (`npm start` in Backend folder)
2. Check your IPv4 address: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Update `EXPO_PUBLIC_API_BASE_URL` in Frontend `.env` with correct IP
4. Restart Expo: Press `q` then `npm start` again

### "Token verification failed" / 401 errors

**Problem:** Firebase token not valid  
**Solution:**
1. Check `FIREBASE_ADMIN_KEY` is set in Backend `.env`
2. Ensure Frontend has `EXPO_PUBLIC_FIREBASE_API_KEY` and `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
3. Tokens expire every 60 minutes — handled automatically by Axios interceptor

### "Table doesn't exist" / Database errors

**Problem:** Database tables not created  
**Solution:**
1. Run SQL script: `RideMates/Backend/database/00_init_all_tables.sql`
2. Verify connection string: `mysql -h HOST -u USER -p PASSWORD DB_NAME`
3. Check `.env` file has correct DB credentials

### "Cannot read property 'toISOString' of undefined"

**Problem:** Timezone issue when posting rides  
**Solution:**
1. Make sure `dayjs` is installed: `npm list dayjs`
2. Convert dates to ISO string before sending to backend: `dayjs(date).toISOString()`
3. Backend stores in UTC, frontend displays in local TZ

---

## 🎓 Learning Resources

This project demonstrates:
- ✅ **Database Design** — SQL schemas, foreign keys, indexes, transactions
- ✅ **Concurrency Control** — Row-level locking (SELECT ... FOR UPDATE)
- ✅ **REST API Design** — CRUD endpoints, error handling, authentication
- ✅ **React Native** — File-based routing, hooks, state management
- ✅ **Third-Party Integrations** — Firebase, Mapbox, Aiven
- ✅ **Security Best Practices** — Secrets management, token verification, CORS
- ✅ **Timezone Handling** — UTC storage, local display
- ✅ **Cost-Sharing Algorithm** — BlaBlaCar pricing model

---

## 🚦 Development Workflow

### Backend Development

```bash
cd RideMates/Backend

# Install nodemon for auto-restart on file changes
npm install --save-dev nodemon

# Run with auto-reload
npx nodemon server.js

# Or add to package.json scripts: "dev": "nodemon server.js"
npm run dev
```

### Frontend Development

```bash
cd RideMates/Frontend

# Start Expo with clear cache
npx expo start --clear

# Run on physical Android device
# 1. Install Expo Go app from Play Store
# 2. Scan QR code from terminal
# 3. App loads on your phone
```

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add booking confirmation screen"

# Push to GitHub
git push origin feature/my-feature

# Create Pull Request on GitHub
```

---

## 📞 Support & Contact

**Project Lead:** RideMates Team  
**Repository:** [github.com/samarpreet-lab/RideMates](https://github.com/samarpreet-lab/RideMates)  
**Capstone:** Lovely Professional University

---

## 📄 License

This project is part of a university capstone assignment. 

---

## 🎉 Key Achievements

- ✅ Full-stack peer-to-peer commute platform
- ✅ Domain-restricted, verified-user-only network
- ✅ Cost-fair pricing with hard caps
- ✅ Concurrency-safe database transactions
- ✅ Strike-resilient alternate routing
- ✅ Cross-platform mobile app (Android/iOS)
- ✅ Comprehensive documentation (Blueprint, SRS, Synopsis)

---

**Last Updated:** February 27, 2026  
**Status:** Production Ready (Capstone Submission)
