# 📚 RideMates — Complete Documentation Index

> These documentation files explain **every technology, function, and feature** used in the RideMates capstone project. Read them to understand how the project works before your viva.

---

## Documentation Files

| # | File | What It Covers |
|---|------|---------------|
| 01 | [PROJECT_OVERVIEW.md](./01_PROJECT_OVERVIEW.md) | Architecture, tech stack, data flow, folder structure, design patterns, key terminology |
| 02 | [BACKEND_NODEJS_EXPRESS.md](./02_BACKEND_NODEJS_EXPRESS.md) | Node.js, Express.js, all NPM packages, built-in modules, middleware, routing, HTTP status codes |
| 03 | [DATABASE_MYSQL.md](./03_DATABASE_MYSQL.md) | MySQL, all 6 tables, SQL queries, JOINs, transactions, FOR UPDATE locking, indexes, parameterized queries |
| 04 | [AUTHENTICATION_SECURITY.md](./04_AUTHENTICATION_SECURITY.md) | OTP flow, JWT lifecycle, all security features, Nodemailer, expo-secure-store, AuthGatekeeper |
| 05 | [ALGORITHMS_PRICING_TRUST.md](./05_ALGORITHMS_PRICING_TRUST.md) | Pricing formula (with worked examples), cancellation penalties, trust system, report evaluation, streak system, background jobs |
| 06 | [FRONTEND_REACT_NATIVE.md](./06_FRONTEND_REACT_NATIVE.md) | React Native, Expo, TypeScript, React hooks (useState, useEffect, useCallback, useRef, useContext), all packages, custom hooks, responsive design, navigation |
| 07 | [APIS_EXTERNAL_SERVICES.md](./07_APIS_EXTERNAL_SERVICES.md) | OSRM routing, Photon geocoding, LocationIQ, Gmail SMTP, Aiven MySQL, Firebase, Render hosting, API endpoint reference |
| 08 | [CONTROLLERS_BUSINESS_LOGIC.md](./08_CONTROLLERS_BUSINESS_LOGIC.md) | Every backend controller function with flow, validations, SQL queries, and JavaScript patterns used |
| 09 | [VIVA_QUESTIONS_ANSWERS.md](./09_VIVA_QUESTIONS_ANSWERS.md) | 40+ prepared Q&A for viva covering all aspects: general, backend, database, algorithms, frontend, security, deployment |

---

## Recommended Reading Order

1. **Start with**: `01_PROJECT_OVERVIEW.md` — understand the big picture
2. **Then read**: `09_VIVA_QUESTIONS_ANSWERS.md` — see what questions to expect
3. **Deep dive into**:
   - `02_BACKEND_NODEJS_EXPRESS.md` for backend concepts
   - `03_DATABASE_MYSQL.md` for database understanding
   - `06_FRONTEND_REACT_NATIVE.md` for frontend concepts
4. **Understand the algorithms**: `05_ALGORITHMS_PRICING_TRUST.md`
5. **Know the auth system**: `04_AUTHENTICATION_SECURITY.md`
6. **Reference as needed**: `07_APIS_EXTERNAL_SERVICES.md` and `08_CONTROLLERS_BUSINESS_LOGIC.md`

---

## Quick Summary of Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| React Native | 0.81.5 | Cross-platform mobile framework |
| Expo | 54.0.33 | React Native development platform |
| TypeScript | 5.9.2 | JavaScript with static types |
| Node.js | — | JavaScript runtime for server |
| Express.js | 5.2.1 | Web framework for REST API |
| MySQL | — | Relational database (Aiven Cloud) |
| JWT (jsonwebtoken) | 9.0.3 | Session token management |
| Nodemailer | 8.0.1 | Email sending (SMTP) |
| Axios | 1.13.5 | HTTP client with interceptors |
| expo-secure-store | 15.0.8 | Encrypted device storage |
| expo-router | 6.0.23 | File-based navigation |
| react-native-maps | 1.20.1 | Interactive maps |
| express-rate-limit | 8.2.1 | API rate limiting |
| mysql2 | 3.18.2 | MySQL Node.js driver |
| cors | 2.8.6 | Cross-origin resource sharing |
| dotenv | 17.3.1 | Environment variable management |
