# 🖥️ Backend — Node.js & Express.js Explained

## What is Node.js?

Normally, JavaScript can only run inside a web browser (Chrome, Firefox, etc.). **Node.js changes that** — it takes the same JavaScript engine that Chrome uses (called V8) and puts it on a server. Now you can write JavaScript that runs on a computer somewhere in the cloud, handling database queries, sending emails, and processing business logic.

**Why this matters for our project**: Our frontend (React Native) is written in TypeScript (a flavor of JavaScript). Our backend (Express) is written in JavaScript. This means we use **one language for the entire project** — frontend and backend. A developer doesn't need to learn Java or Python separately for the server.

**Think of it like this**: JavaScript was born as a language for making websites interactive (buttons, animations). Node.js took it out of the browser and said "you can also use this language to build servers, talk to databases, and send emails." That's what we do.

---

## What is Express.js?

Express is a **framework** (a set of pre-built tools) that sits on top of Node.js and makes it easy to build a web server. Without Express, you'd have to write hundreds of lines of code just to handle HTTP requests. Express reduces that to a few lines.

**The core idea**: Express is a routing system. You tell it "when someone sends a POST request to `/api/auth/send-otp`, run this function." Express handles all the plumbing — reading the URL, parsing the data, sending the response — so you just focus on the logic.

**Real-world analogy**: Node.js is like a blank kitchen with all the equipment. Express is like a recipe book + trained chef that tells the kitchen what to do when an order comes in. You could cook without Express, but it would take much longer.

### How Express Works in Our Project

The entry point is `server.js`. Here's what happens when you run `npm start`:

1. **Express creates an app**: `const app = express()` — this is the heart of everything. Every request goes through this app.

2. **Middleware is attached**: Express runs each request through a chain of middleware functions (like security checkpoints). We attach `cors()` (allows mobile app to call us), `express.json()` (reads JSON data from requests), and `verifyToken` (checks login status).

3. **Routes are mounted**: We tell Express "anything starting with `/api/auth` should go to the auth routes," "anything starting with `/api/rides` should go to the ride routes," and so on. Each route file maps specific URLs to specific controller functions.

4. **Server starts listening**: `app.listen(5000)` tells Express "start listening for requests on port 5000." Now the server is running and waiting for requests from the mobile app.

```javascript
// This is the simplified flow of server.js:

const express = require('express');      // 1. Import Express
const app = express();                    // 2. Create the app

app.use(cors(corsOptions));              // 3. Attach middleware
app.use(express.json());

app.use('/api/auth', authRoutes);        // 4. Mount routes (public)
app.use('/api/rides', verifyToken, rideRoutes);   // (protected — needs JWT)
app.use('/api/bookings', verifyToken, bookRoutes);
app.use('/api/reports', verifyToken, reportRoutes);

app.listen(5000);                        // 5. Start listening
```

**What does "protected" mean?** Notice that `/api/auth` does NOT have `verifyToken` in front of it — because the user isn't logged in yet when they're trying to send an OTP or verify it. But `/api/rides`, `/api/bookings`, and `/api/reports` all have `verifyToken` — meaning the user MUST be logged in (have a valid JWT) to use these endpoints.

---

## NPM Packages — What We Installed and Why

NPM (Node Package Manager) is like an app store for JavaScript libraries. Instead of writing everything from scratch, we install pre-built packages. Here's every package we use and what it does:

### 1. `express` — The Web Framework
**What it gives us**: The ability to create HTTP endpoints (URLs), handle requests, and send responses.

**Without Express**, creating a simple endpoint would require 30+ lines of raw Node.js code to parse the URL, read the method, handle the body, set headers, etc. **With Express**, it's 3 lines.

**Key functions we use**:
- `express()` → Creates the application
- `express.json()` → Middleware that reads JSON data from the request body. Without this, if the frontend sends `{ "email": "user@lpu.in" }`, the backend would see `undefined` when trying to read `req.body.email`.
- `express.Router()` → Creates a mini-router for a group of related endpoints. We have one router for auth, one for rides, one for bookings, one for reports.
- `app.use(path, handler)` → Says "for any URL starting with this path, use this handler."
- `app.listen(port)` → Starts the server on a specific port.

### 2. `cors` — Cross-Origin Resource Sharing
**The problem it solves**: Web browsers and mobile apps have a security rule called the "same-origin policy." This means a website at `http://myapp.com` cannot call an API at `http://myserver.com` by default. The browser blocks it for safety (to prevent malicious websites from stealing your data).

**What CORS does**: It tells the browser "it's OK — I trust these specific frontends." We configure it with a list of allowed origins (URLs that are permitted to call our API). Any request from an unlisted origin is rejected.

**In our project**: We allow requests from `http://localhost:3000` and `http://localhost:8081` (for development) and our production frontend URL. We also specify which HTTP methods are allowed (GET, POST, PUT, DELETE) and which headers can be sent (Content-Type, Authorization).

### 3. `dotenv` — Environment Variables
**The problem it solves**: Our code needs secrets — the database password, the JWT secret key, the Gmail password for sending OTPs. If we put these directly in the source code and upload to GitHub, anyone could see them. That's a security disaster.

**What dotenv does**: It reads a file called `.env` (which is NOT uploaded to GitHub, it's in `.gitignore`) and makes those values available as `process.env.VARIABLE_NAME`.

**How it works in practice**: We create a `.env` file with our secrets. At the top of `server.js`, we call `require('dotenv').config()`. After that line, `process.env.DB_PASSWORD` returns the actual password. The code never contains the actual secret — just a reference to it.

### 4. `mysql2` — MySQL Database Driver
**What it does**: Lets Node.js talk to a MySQL database. We use the `mysql2/promise` version, which supports modern `async/await` syntax (instead of old-style callbacks).

**Connection Pool concept**: Instead of opening a new database connection for every request (which is slow — each connection takes ~50ms to establish), we pre-open 10 connections and keep them alive. When a request needs the database, it "borrows" one of these connections, uses it, and returns it. This is much faster.

**Analogy**: Imagine you're at a library with 10 computers. You don't buy a new computer every time you need to check something — you wait for one to be free, use it, and then give it back.

**Key operations we use**:
- `pool.query(sql, params)` → Run a SQL query and get results
- `pool.getConnection()` → Borrow a dedicated connection (needed for transactions)
- `connection.beginTransaction()` → Start a group of operations that must all succeed or all fail
- `connection.commit()` → Save all changes from the transaction
- `connection.rollback()` → Undo all changes (if something went wrong)
- `connection.release()` → Return the borrowed connection to the pool

### 5. `jsonwebtoken` — JWT Tokens
**What it does**: Creates and verifies JSON Web Tokens.

**How JWT works (simply)**: After login, we create a small package of data (like `{ userId: 42, email: 'user@lpu.in' }`) and "sign" it with a secret key that only our server knows. This creates a long encoded string (the token). We give this token to the frontend.

Every time the frontend makes a request, it sends this token. The backend "verifies" it — checks that it hasn't been tampered with (using the secret key), hasn't expired, and extracts the user's ID from it.

**Why not just send the user ID directly?** Because anyone could change it. If the frontend sent `{ userId: 42 }` directly, a hacker could change it to `{ userId: 1 }` and pretend to be someone else. But with JWT, the token is signed — any modification breaks the signature, and the server rejects it.

### 6. `nodemailer` — Sending Emails
**What it does**: Sends emails from our Node.js server. We use it to send OTP verification codes.

**How it works**: We connect to Gmail's SMTP server (like connecting to a post office), authenticate with an App Password (not the regular Gmail password), and then send emails. The SMTP server handles the actual delivery.

**SMTP explained simply**: SMTP (Simple Mail Transfer Protocol) is the system that emails use to travel between servers. When you send an email, your email client talks to an SMTP server, which routes it to the recipient's email server. Nodemailer handles this communication for us.

**Why Gmail App Password?** Google blocked regular password login for apps in 2022 for security reasons. Instead, you generate a special 16-character "App Password" in Google's security settings. This password only works for SMTP, not for logging into Gmail.

### 7. `express-rate-limit` — Abuse Prevention
**The problem it solves**: Without rate limiting, a malicious person could:
- Send 1000 OTP requests per minute (overwhelming our email service)
- Try every possible 6-digit code (1,000,000 combinations) to brute-force an OTP
- Create thousands of fake rides to spam the platform

**What it does**: Limits how many requests an IP address can make within a time window. For example, "maximum 5 OTP requests per 15 minutes." If someone exceeds the limit, they get a `429 Too Many Requests` response.

**We have different limits for different endpoints**:
- OTP sending: 5 per 15 minutes (prevents email spam)
- OTP verification: 10 per 15 minutes (prevents brute force)
- Ride creation: 10 per hour
- Booking: 15 per hour
- Reports: 5 per hour

### 8. `firebase-admin` — Firebase Server SDK
**What it does**: Provides server-side access to Firebase services (push notifications, user management). Currently initialized for potential future features.

### 9. `nodemon` — Development Auto-Restart
**What it does**: Watches your source files. Every time you save a change, it automatically restarts the server. Without this, you'd have to press Ctrl+C and type `node server.js` after every code change — very tedious during development.

---

## Built-in Node.js Modules — No Installation Needed

These modules come with Node.js. You don't install them — you just `require()` them.

### `crypto` — Secure Randomness & Hashing
**Where we use it**: Generating OTPs and hashing them.

**Two things we do with it**:

1. **Generate a secure random OTP**: `crypto.randomInt(100000, 999999)` creates a random 6-digit number. Unlike `Math.random()` (which is predictable and could theoretically be guessed), `crypto.randomInt()` uses the operating system's cryptographic random number generator — the same one used by banks and security systems. It's impossible to predict.

2. **Hash the OTP before storing**: `crypto.createHash('sha256').update(otp).digest('hex')` takes the OTP (like "847293") and runs it through the SHA-256 algorithm to produce a 64-character hexadecimal string. This is a ONE-WAY process — you can convert "847293" to its hash, but you CANNOT convert the hash back to "847293." This means if a hacker steals our database, they see hashes, not actual OTP codes.

### `fs` (File System) — Reading Files
**Where we use it**: Reading the SSL certificate file for the database connection. `fs.readFileSync()` reads a file's contents synchronously (waits until done). We read the `ca-certificate.pem` file which contains the certificate authority's certificate — this is needed to establish a secure SSL connection to Aiven's MySQL server.

### `path` — Cross-Platform File Paths
**Where we use it**: Building file paths that work on both Windows and Linux/Mac. Windows uses backslashes (`C:\project\config`) while Linux uses forward slashes (`/project/config`). `path.join()` handles this automatically. `__dirname` is a Node.js variable that always points to the directory of the current file.

### `process` — Environment & Error Handling
**What it gives us**:
- `process.env` → Access to environment variables (loaded by dotenv)
- `process.on('unhandledRejection', handler)` → Catches promise errors that nobody handled (prevents silent crashes)
- `process.on('uncaughtException', handler)` → Catches synchronous errors that nobody caught (prevents server from dying)
- `process.exit(1)` → Kills the server (used if critical configuration is missing)

### `fetch` — HTTP Requests (Built into modern Node.js)
**Where we use it**: Calling the OSRM API from the backend to calculate driving distance. `fetch()` makes an HTTP request to a URL and returns the response. We call OSRM when a driver posts a ride — we send the GPS coordinates and OSRM returns the actual driving distance in meters.

### `setInterval` and `setTimeout` — Timers
**Where we use them**: Running scheduled background jobs.
- `setInterval(fn, 30 * 60 * 1000)` → Runs `fn` every 30 minutes, forever.
- `setTimeout(fn, 5000)` → Runs `fn` once after 5 seconds (we use this to run jobs once at startup, with a small delay to let the database connection establish first).

---

## Express Middleware — The Security Checkpoint System

### What is Middleware?

Imagine you're going through airport security. Before you can board your flight (reach the controller), you go through multiple checkpoints: ticket check, ID verification, bag scan, body scan. Each checkpoint can let you through (call `next()`) or reject you (send back an error).

In Express, middleware works the same way. Every request passes through a chain of functions before reaching the controller. Each function can:
- **Pass** the request forward (`next()`) — "you're clear, proceed"
- **Reject** the request (`res.status(401).json(...)`) — "you're not authorized, go away"

```
Frontend sends request
        ↓
  [1. CORS middleware]        → "Is this request from our app? Yes → pass. No → block."
        ↓
  [2. express.json()]         → "Read the JSON body and attach it to req.body."
        ↓
  [3. Rate limiter]           → "Has this IP made too many requests? No → pass. Yes → block."
        ↓
  [4. verifyToken middleware] → "Does this request have a valid JWT? Yes → attach user info → pass. No → block."
        ↓
  [5. Controller function]    → "Run the actual business logic."
        ↓
  Send response back to frontend
```

### Our Custom Middleware: `verifyToken`

This is the most important middleware. It runs before EVERY protected endpoint (rides, bookings, reports). Here's what it does step by step:

1. **Extract the token**: The frontend sends the JWT in the `Authorization` header like this: `Authorization: Bearer eyJhbGciOi...`. The middleware splits this string by space and takes the second part (the actual token).

2. **Verify the token**: Using the `jsonwebtoken` package, it checks:
   - Was this token signed with our JWT secret? (If not, someone forged it → reject)
   - Has it expired? (If yes → reject, tell the frontend "session expired")
   - Is the payload valid? (Does it contain a userId that's a number?)

3. **Look up the user**: Even if the token is valid, we still check the database to make sure this user still exists and hasn't been deleted. We get their latest `trust_score`, `gender`, and other info.

4. **Attach user to request**: We set `req.user = { id: 42, email: 'user@lpu.in', gender: 'male', trust_score: 95 }`. Now any controller function that runs after this middleware can access `req.user.id` to know WHO is making this request.

5. **Call `next()`**: This tells Express "this checkpoint is done, move to the next one (or the controller)." If we DON'T call `next()`, the request hangs forever and the user sees a loading spinner that never stops.

---

## Express Routing System — How URLs Map to Functions

### The Big Idea

When the frontend sends a request, it has two parts:
1. **HTTP Method**: GET (read data), POST (create data), PUT (update data), DELETE (remove data)
2. **URL**: `/api/rides/create`, `/api/bookings/42/cancel`, etc.

The combination of method + URL determines which controller function runs. Think of it like a phone menu: "Press 1 for rides, press 2 for bookings." Then: "Press 1 to create a ride, press 2 to search rides."

### How Routes Connect to Controllers

In `server.js`, we mount route groups:
- `app.use('/api/auth', authRoutes)` → anything starting with `/api/auth` goes to `authRoutes.js`
- `app.use('/api/rides', verifyToken, rideRoutes)` → anything starting with `/api/rides` (after JWT check) goes to `rideRoutes.js`

Inside `rideRoutes.js`, we define specific endpoints:
- `router.post('/create', createRide)` → `POST /api/rides/create` runs `createRide()`
- `router.get('/search', searchRides)` → `GET /api/rides/search` runs `searchRides()`
- `router.get('/:id', getRideById)` → `GET /api/rides/42` runs `getRideById()` with `req.params.id = "42"`

### Three Ways Data Comes In

1. **URL Parameters** (`:id`): Used for identifying a specific resource. When the URL is `/api/rides/42`, `req.params.id` is `"42"`. It's like saying "I want ride number 42."

2. **Query Parameters** (`?key=value`): Used for filtering/searching. When the URL is `/api/rides/search?origin=Phagwara&destination=Jalandhar`, `req.query.origin` is `"Phagwara"` and `req.query.destination` is `"Jalandhar"`. It's like saying "search for rides FROM Phagwara TO Jalandhar."

3. **Request Body** (`req.body`): Used for sending data (POST/PUT). When creating a ride, the frontend sends `{ "origin_city": "Phagwara", "available_seats": 3 }` in the body. The controller reads it as `req.body.origin_city`.

### Why Route Order Matters

Express checks routes from top to bottom and uses the FIRST match. This means `/my` must come BEFORE `/:id` in the code:

```javascript
router.get('/my', getMyRides);      // ← This must come FIRST
router.get('/:id', getRideById);    // ← Otherwise, Express thinks "my" is an ID!
```

If `/:id` came first, visiting `/api/rides/my` would match `/:id` with `id = "my"` — which would try to find a ride with ID "my" and fail.

---

## HTTP Status Codes — What Each Number Means

Every response the backend sends has a status code. The frontend uses these to know what happened:

| Code | Name | What It Means | When We Use It |
|------|------|---------------|----------------|
| **200** | OK | Everything worked. Here's your data. | Profile loaded, ride updated, search results returned. |
| **201** | Created | A new thing was created successfully. | New ride posted, new booking created, new user registered. |
| **400** | Bad Request | You sent invalid data. Fix your input and try again. | Missing email, OTP expired, invalid seat count, past departure time. |
| **401** | Unauthorized | You're not logged in, or your session expired. | No JWT token, expired token, tampered token. |
| **403** | Forbidden | You're logged in, but you don't have permission for this action. | Trying to cancel someone else's ride, too many failed OTP attempts. |
| **404** | Not Found | The thing you're looking for doesn't exist. | Ride was deleted, user not found, booking doesn't exist. |
| **409** | Conflict | What you're trying to do conflicts with existing data. | Email already registered, already booked this ride. |
| **429** | Too Many Requests | You've made too many requests. Slow down. | Rate limited (too many OTP requests, too many bookings). |
| **500** | Internal Server Error | Something broke on our end. It's not your fault. | Database error, unexpected bug, unhandled exception. |
| **503** | Service Unavailable | An external service we depend on is down. | Gmail SMTP is down (can't send OTP), OSRM is down (can't calculate distance). |

---

## Response Format — How Every Response Looks

Every response follows a consistent format so the frontend always knows what to expect:

**Success responses** always have `"success": true` and include the relevant data in a `data` field:
```json
{
  "success": true,
  "message": "Ride posted successfully!",
  "data": {
    "ride_id": 42,
    "distance_km": 15.3,
    "capped_price": 85
  }
}
```

**Error responses** always have `"success": false` and include a human-readable message plus a machine-readable error code:
```json
{
  "success": false,
  "message": "Only active rides can be updated.",
  "error": "RIDE_NOT_ACTIVE"
}
```

The `message` field is shown to the user. The `error` field is used by the frontend code to handle specific cases (like showing a different screen for `TOKEN_EXPIRED` vs `INVALID_TOKEN`).

---

## Trust Proxy — A Deployment Detail

When our app is deployed on Render.com (a cloud hosting platform), all requests first go through Render's proxy server before reaching our app. This means every request appears to come from the proxy's IP address, not the user's real IP.

This breaks rate limiting! If everyone looks like they're coming from the same IP, rate limiting would block ALL users after just 5 requests.

The line `app.set('trust proxy', 1)` tells Express "I'm behind 1 proxy. Look at the `X-Forwarded-For` header (which contains the real user IP) instead of the connection IP." Now rate limiting correctly identifies individual users.
