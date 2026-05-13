# ❓ Viva Questions & Answers — Comprehensive Preparation

> Every answer below is written in **simple, conversational language** — the way you'd actually explain it to a committee. Read through these and practice saying them out loud.

---

## General / Overview Questions

### Q: What is your project about? Explain in one paragraph.
**A**: RideMates is a mobile app that lets university students and faculty share rides between cities in Punjab. It's like a small BlaBlaCar for LPU. A driver who's going from Phagwara to Jalandhar posts their ride — how many seats they have, when they're leaving, what vehicle they drive. Other students going the same way search for rides, find a match, and book a seat. They pay a fair share of the fuel cost, not a taxi fare. The app has a trust system to keep people accountable — if you cancel last minute or behave badly, your trust score goes down. If you're a good rider, your streak goes up.

### Q: What technologies did you use and why those specifically?
**A**: 
- **React Native with Expo** for the mobile app — because it lets us write one codebase that works on both Android and iOS. Expo makes it simpler by giving us pre-built tools like secure storage and location access.
- **Node.js with Express** for the backend — because we can use JavaScript on both frontend and backend, so the entire project is in one language family. Express is lightweight and perfect for REST APIs.
- **MySQL** for the database — because our data has clear relationships (users create rides, rides have bookings, bookings have reports). MySQL's transactions and row-level locking are critical for preventing double-booking.
- **JWT** for authentication — because it's stateless. The server doesn't need to remember who's logged in — the token itself carries the proof.

### Q: Why React Native instead of native Android/iOS development?
**A**: Time and resources. Building a native Android app in Kotlin AND a native iOS app in Swift means maintaining two separate codebases — double the work, double the bugs to fix. React Native lets us write it once and run it everywhere. With Expo, we also get pre-built modules for things like secure storage, camera, and location, so we don't need to write platform-specific code.

### Q: Why MySQL instead of MongoDB?
**A**: Our data is fundamentally relational. Users create rides, rides have bookings, bookings can have reports. These relationships are naturally expressed with foreign keys in MySQL. More importantly, MySQL gives us transactions (group of operations that either all succeed or all fail) and row-level locking (prevent two users from modifying the same data simultaneously). These are critical for our booking system — without them, two people could book the last seat at the same time and we'd be oversold.

### Q: What makes your project different from Uber/Ola?
**A**: Three things. First, it's **cost-sharing, not commercial** — drivers don't make profit, they just split fuel costs. The pricing algorithm enforces this with a cap. Second, it's **university-restricted** — only @lpu.in email holders can use it, creating a trusted community. Third, it has a **peer accountability system** — trust scores, pattern-match reports, and "The Shield" protection against false accusations. Uber has ratings, but our system is more nuanced.

---

## Backend Questions

### Q: Explain how the backend works.
**A**: The backend is a Node.js server running Express. When the mobile app needs data or wants to do something, it sends an HTTP request to the backend's URL. The request goes through a chain of middleware — first CORS checks if the request is from our app, then the JSON parser reads the data, then the rate limiter checks if this IP is making too many requests, then the JWT middleware verifies the user's identity. If all checks pass, the request reaches a controller function that handles the actual business logic — querying the database, running calculations, and sending back a response.

### Q: What is middleware? Give examples from your project.
**A**: Middleware is code that runs between receiving a request and sending a response. Think of it like security checkpoints at an airport — each checkpoint either lets you through or stops you. In our project, we have: CORS middleware (checks if the request is from our app), express.json() (reads the JSON request body), express-rate-limit (blocks IPs making too many requests), and verifyToken (checks the JWT to ensure the user is logged in). Each middleware can either call next() to pass the request forward, or send an error response to stop the request.

### Q: What is a REST API?
**A**: REST (Representational State Transfer) is a style of designing web APIs. The idea is that everything is a "resource" (users, rides, bookings) and you interact with resources using HTTP methods. GET means "read this resource," POST means "create a new resource," PUT means "update this resource," DELETE means "remove this resource." For example, GET /api/rides/42 means "give me ride number 42," and DELETE /api/rides/42 means "cancel ride number 42." Each URL represents a specific resource, and the HTTP method tells the server what to do with it.

### Q: What is Express Rate Limiting and why do you need it?
**A**: Rate limiting restricts how many requests a single IP address can make within a time window. Without it, a malicious person could send thousands of OTP requests per minute, overwhelming our email service and database. Or they could try all 900,000 possible 6-digit codes to brute-force an OTP. We have different limits for different endpoints — 5 OTP sends per 15 minutes, 10 verifications per 15 minutes, 10 ride creations per hour. If someone exceeds the limit, they get a "Too Many Requests" error and have to wait.

### Q: What are background jobs? Why do you need them?
**A**: Background jobs are functions that run automatically on a timer, not triggered by user actions. We have two that run every 30 minutes. The first auto-completes rides that are still "active" 24 hours after departure (the driver forgot to mark them done). The second awards clean ride streaks — 12 hours after a ride completes, if no reports were filed, everyone gets +1 to their streak. These need to run automatically because we can't rely on users to trigger them.

---

## Authentication & Security Questions

### Q: How does your login system work?
**A**: We use passwordless authentication with email OTPs. The user enters their university email, we generate a random 6-digit code, hash it with SHA-256, store the hash in the database, and send the actual code to their email. They enter the code in the app, we hash their input and compare it with the stored hash. If they match, we create a JWT token that's valid for 7 days. The token is stored on the device in encrypted storage and sent with every subsequent API request.

### Q: Why hash the OTP? Why not store it directly?
**A**: If our database is ever compromised — hacked, leaked, accidentally exposed — the attacker would see the actual OTP codes and could use them to log in as anyone with a pending OTP. By hashing with SHA-256, they see meaningless 64-character hex strings that can't be reversed. We verify by hashing what the user enters and comparing hashes, so we never need the original code stored anywhere.

### Q: What is JWT and how does it work?
**A**: JWT stands for JSON Web Token. It's a signed string that contains user information — like a digital ID card. After login, the server creates a token containing the user's ID and email, signs it with a secret key, and gives it to the app. On every request, the app sends this token. The server verifies the signature (to make sure it wasn't tampered with), checks if it's expired, and extracts the user's identity. The key thing is: the server doesn't store any session data. The token itself IS the proof of identity. If someone modifies the token (like changing the userId), the signature breaks and the server rejects it.

### Q: How do you prevent SQL injection?
**A**: We use parameterized queries with `?` placeholders. Instead of inserting user input directly into SQL strings (which would allow someone to inject malicious SQL commands), we pass user input as separate parameters. The mysql2 library safely escapes all special characters. So even if someone enters `'; DROP TABLE users; --` as their email, it's treated as a literal string, not as SQL commands. We do this consistently in every single database query throughout the backend — there are zero exceptions.

### Q: How do you store the JWT token securely on the device?
**A**: We use expo-secure-store, which uses hardware-backed encryption. On iOS, it stores the token in the Keychain — Apple's secure credential storage. On Android, it uses EncryptedSharedPreferences with AES encryption. This means even if someone has physical access to the phone, they can't read the token without the device's unlock credentials. Regular storage (like AsyncStorage or localStorage) stores data in plain text, which is insecure.

### Q: What happens when the JWT expires?
**A**: Our tokens expire after 7 days. When an expired token is sent to the backend, the verifyToken middleware catches the TokenExpiredError and returns a 401 Unauthorized response. On the frontend, an Axios response interceptor watches for 401 responses. When it sees one, it deletes the stored token and triggers the AuthGatekeeper component, which redirects the user to the login screen. The user sees a message like "Session expired. Please log in again." This is all automatic — the developer doesn't have to add this logic to every API call.

---

## Database Questions

### Q: How many tables do you have? What are they?
**A**: Six tables. `users` stores registered members with their trust scores. `user_otps` stores hashed OTP records for login verification. `rides` stores every ride posted by drivers with GPS coordinates, pricing, and status. `bookings` stores seat reservations linking passengers to rides. `reports` stores incident reports for accountability. And `fuel_rates` is a reference table with current fuel prices used in pricing calculations.

### Q: What is a transaction and why do you use one?
**A**: A transaction groups multiple database operations into one atomic unit — they either ALL succeed or ALL fail. We use it in booking because we need to: check seat availability, decrement the seat count, and insert the booking. If the insert fails after we decremented the seats, without a transaction those seats would be lost — decremented but never booked. With a transaction, a failure triggers a ROLLBACK that undoes the seat decrement. The database is always in a consistent state.

### Q: What is FOR UPDATE and why is it important?
**A**: FOR UPDATE is a MySQL row lock. When we run `SELECT ... FOR UPDATE`, the selected row is locked and no other transaction can modify it until we commit or rollback. We use this to prevent double-booking. Without it, two users could simultaneously read "1 seat available," both proceed to book, and the seat count would go to -1 — oversold. With FOR UPDATE, the first user locks the row, the second user waits. The first user books and commits, then the second user reads the updated count (0 seats) and gets rejected.

### Q: What is a foreign key?
**A**: A foreign key is a column in one table that references the primary key of another table. For example, `rides.driver_id` references `users.id`. This creates a relationship and enforces data integrity — you can't create a ride for a user that doesn't exist. With ON DELETE CASCADE, deleting a user automatically deletes all their rides, bookings, and reports, preventing orphan data.

---

## Algorithm Questions

### Q: How does your pricing algorithm work?
**A**: It calculates a fair per-seat price based on fuel cost sharing. First, we calculate the total fuel cost for the trip: distance divided by mileage, times fuel rate. Then we divide by the vehicle's full capacity — this is the key innovation. Even if a car driver offers only 1 seat, we divide by 5 (the car's total capacity) because true cost-sharing means everyone (including the driver) shares equally. We add a base boarding fare to make short trips viable, apply a vehicle-type multiplier for operating costs, and cap the driver's price at this maximum. The driver can charge less, but never more. This prevents exploitation while ensuring fair pricing.

### Q: Why divide by full capacity instead of offered seats?
**A**: Without this, a driver with a 5-seat car offering only 1 seat would charge that passenger 50% of the fuel cost — essentially taxi pricing. By dividing by the full capacity (5), each person's share is 20% of the fuel cost — true carpooling economics. The principle is: the presence of empty seats is the driver's choice, not the passenger's burden.

### Q: Explain "The Shield" — your report protection system.
**A**: When only one person reports another user for conduct issues, we DON'T apply any trust penalty. We just log a warning. This is "The Shield" — it protects users from false accusations. Maybe the reporter had a personal grudge, or maybe they misunderstood the situation. The penalty only triggers when TWO or more different people report the same user within 30 days — that's a pattern. One complaint is a disagreement; two complaints is a trend.

### Q: How do you prevent streak farming?
**A**: We have a 24-hour cooldown for same-pair streaks. If driver A and passenger B already earned streak points from a ride today, they won't earn points from another ride together within 24 hours. This prevents two friends from creating fake rides and booking each other repeatedly to inflate their streaks.

---

## Frontend Questions

### Q: What is React Native?
**A**: React Native is a framework for building native mobile apps using JavaScript. Unlike hybrid approaches that run web code in a mobile browser, React Native converts your JavaScript into actual native components. A `<View>` becomes a real Android View and a real iOS UIView. You write one codebase that runs on both platforms, but the end result is a truly native app — not a website in a wrapper.

### Q: What is the difference between useState and useRef?
**A**: Both store data across renders, but with a critical difference. When you update `useState`, the component re-renders (the screen updates visually). When you update `useRef`, nothing visual happens — it changes silently. Use `useState` for data the user sees (email input, loading spinner, search results). Use `useRef` for internal plumbing (debounce timers, abort controllers) that shouldn't cause a visual update.

### Q: What is debouncing and where do you use it?
**A**: Debouncing means waiting a short time after the last action before doing something. We use it in location search. When a user types "Jalandhar," each keystroke would normally trigger an API call — J, Ja, Jal, Jala... that's 9 calls. With debouncing, we wait 450 milliseconds after the user stops typing before calling the API. If they type another character within 450ms, we cancel the previous timer and start a new one. Result: 1 API call instead of 9.

### Q: How do you make the UI responsive across different phone sizes?
**A**: We created scaling functions that adapt sizes based on the screen dimensions. We designed everything for an iPhone X (375×812 pixels) as the baseline. Our scaling functions calculate the ratio between the current device and the baseline, then scale all dimensions proportionally. So a 16px font on iPhone X becomes ~17.5px on a wider phone. We also have pre-scaled constants (SPACING, FONT_SIZE, RADIUS) so developers use consistent values throughout the app.

### Q: What is the AuthGatekeeper?
**A**: It's a component that wraps the entire app and acts as a security guard. It checks three things: when the app first loads, when the app returns from the background, and when the API returns a 401 error. In all three cases, it checks if a valid JWT token exists. If not, it redirects to the login screen. If the user is logged in but on the login screen, it redirects to the main app. This ensures unauthenticated users can never see protected content.

---

## Deployment Questions

### Q: Where is your app deployed?
**A**: The backend runs on Render.com, which is a cloud hosting platform. The database is on Aiven Cloud, which is a managed MySQL service. The frontend is built using Expo and can produce Android APKs and iOS IPAs. For development, we run everything locally — the backend on localhost:5000 and the frontend with Expo's development server.

### Q: How do you manage secrets and configuration?
**A**: We use environment variables stored in a `.env` file, loaded by the `dotenv` package. The `.env` file contains secrets like the database password, JWT secret key, and Gmail credentials. This file is listed in `.gitignore` so it's never committed to version control. In production on Render, these same variables are set in the dashboard settings. The code references them as `process.env.VARIABLE_NAME` — it never contains the actual secrets.

### Q: What happens if the backend server crashes?
**A**: Two things protect us. First, we have global error handlers: `process.on('unhandledRejection')` catches unhandled promise errors, and `process.on('uncaughtException')` catches synchronous exceptions. Both log the error but don't crash the server. Second, Render.com automatically restarts the server if it does crash. And since all data is in the database (not in server memory), no data is lost on restart.

### Q: How do you handle concurrent users?
**A**: Through database-level concurrency control. When multiple users try to book the same ride simultaneously, MySQL's `SELECT ... FOR UPDATE` row lock ensures only one can modify the ride at a time. Others wait in a queue until the first one finishes. This is combined with transactions to ensure data consistency — if anything goes wrong, all changes are rolled back. The connection pool handles 10 simultaneous database connections, and Express handles the HTTP request queuing.
