# 🔐 Authentication — OTP, JWT & Security Explained

## The Big Idea: Why No Passwords?

Most apps use email + password for login. RideMates uses **email + OTP (One-Time Password)** instead. Why?

1. **Users forget passwords**. With OTP, there's nothing to remember — a fresh code is sent every time.
2. **Passwords get reused**. If a user uses the same password on another website that gets hacked, their RideMates account is compromised too. OTPs are unique and expire in 10 minutes.
3. **University verification**. By requiring an `@lpu.in` email, we guarantee every user is an actual LPU student or faculty member. The OTP proves they own that email.

---

## The Complete Login/Signup Flow — Step by Step

### Scenario: A new student signs up

**Step 1: Student opens the app and enters their email**

The student types `samar@lpu.in` and taps "Sign Up." The frontend sends this to the backend:
```
POST /api/auth/send-otp
Body: { "email": "samar@lpu.in", "purpose": "signup" }
```

**Step 2: Backend validates and generates OTP**

The `sendOtp` controller function runs. Here's what it does, in thinking order:

**"Is this a valid university email?"**
It checks if the email ends with `@lpu.in`. If someone enters `hacker@gmail.com`, it's immediately rejected. This is how we restrict the app to university members only.

**"Has this email already been registered?"**
Since the purpose is `signup`, the backend checks if this email already exists in the `users` table. If it does, the user is told "This email is already registered. Please log in instead."

**"Is this person sending too many OTP requests?"**
Two checks:
- Has this email received an OTP in the last 60 seconds? (cooldown to prevent spam)
- Has this email received 3 or more OTPs in the last 10 minutes? (rate limiting)
If either check fails, the request is rejected. This prevents someone from flooding an inbox with OTP emails.

**"Generate a secure 6-digit OTP"**
The backend calls `crypto.randomInt(100000, 999999)` which generates a number between 100000 and 999999 (always 6 digits). This uses the operating system's cryptographic random number generator — the same kind used by banks. Unlike `Math.random()` (which is predictable), this is truly random and impossible to guess.

Let's say it generates `847293`.

**"Hash the OTP before storing it"**
We run `crypto.createHash('sha256').update('847293').digest('hex')` which produces something like `a3f2b8c9d1e5f7a2b4c6...` (a 64-character hex string).

**Why hash it?** Imagine if a hacker breaks into our database. If we stored `847293` directly, they could use it to log in as this user. But if we store the hash, they can't — because SHA-256 is a one-way function. You can convert "847293" to its hash, but you CANNOT convert the hash back to "847293."

Think of hashing like a paper shredder. You can shred a document (hash the OTP), but you can't un-shred it (reverse the hash). When the user later enters their OTP, we shred THEIR input the same way and compare the shredded results.

**"Save the hash and send the email"**
The hash is stored in the `user_otps` table along with the email, purpose, and expiry time (10 minutes from now). Then the actual OTP (847293) is sent to the user's email via Nodemailer + Gmail SMTP.

**Critical detail**: The actual OTP is sent via email and then FORGOTTEN by the server. It's never stored in the database, never logged, never written anywhere. Only the hash is stored. The email is the only place the actual code exists.

**Step 3: Student receives the email and enters the OTP**

The student checks their email, sees `847293`, and enters it in the app. The frontend sends:
```
POST /api/auth/verify-otp
Body: { "email": "samar@lpu.in", "otp": "847293", "purpose": "signup",
        "full_name": "Samar Preet", "phone": "9876543210", "gender": "male" }
```

**Step 4: Backend verifies the OTP**

The `verifyOtp` controller runs:

**"Find the latest OTP for this email"**
It queries the database for the most recent, unverified OTP record for `samar@lpu.in`.

**"Has this OTP been locked due to too many failed attempts?"**
If the `attempts` counter is > 3, the OTP is locked. The user must request a new one.

**"Has this OTP expired?"**
If the current time is past the `expires_at` timestamp (10 minutes after creation), the OTP is rejected.

**"Does the entered OTP match?"**
The backend hashes the entered OTP (`847293`) with SHA-256 and compares it with the stored hash. If they match → success! If not → increment the `attempts` counter and return an error.

**"Create the new user account"**
Since this is a signup, the backend inserts a new row in the `users` table with the provided name, phone, and gender. Default values are set: `trust_score = 100`, `current_streak = 0`, `university = 'LPU'`.

**"Issue a JWT token"**
The backend creates a JWT containing `{ userId: 42, email: 'samar@lpu.in' }`, signs it with the secret key, and sets it to expire in 7 days.

**"Send the response"**
The backend returns the JWT token and user profile to the frontend. The frontend stores the token securely on the device.

**Step 5: All future requests use the JWT**

From now on, every API call from this user includes the JWT in the `Authorization` header. The backend's `verifyToken` middleware checks it on every request, and the user stays logged in for 7 days without entering any credentials.

---

## OTP Security — All 7 Layers of Protection

Here's every security measure we have on the OTP system, and WHY each one exists:

### Layer 1: University Email Domain Restriction
**What**: Only emails ending with `@lpu.in` are accepted.  
**Why**: Restricts the entire platform to verified university members. A random person with a Gmail account can't create an account.  
**What it prevents**: Non-university users from accessing the platform.

### Layer 2: Cryptographic OTP Generation
**What**: We use `crypto.randomInt()` instead of `Math.random()`.  
**Why**: `Math.random()` is a pseudo-random number generator — given enough outputs, you could predict the next one. `crypto.randomInt()` uses the OS's true random number generator (backed by hardware entropy) which is impossible to predict.  
**What it prevents**: Attackers predicting the next OTP code.

### Layer 3: OTP Hashing (SHA-256)
**What**: We store a SHA-256 hash of the OTP, never the plaintext.  
**Why**: If our database is compromised, attackers see hashes, not codes. SHA-256 is irreversible.  
**What it prevents**: Database breach leading to account compromise.

### Layer 4: 10-Minute Expiry
**What**: Each OTP is only valid for 10 minutes after creation.  
**Why**: Limits the time window an attacker has to try codes. After 10 minutes, even the correct code is rejected.  
**What it prevents**: Delayed brute-force attacks.

### Layer 5: 3-Attempt Brute Force Lock
**What**: After 3 wrong attempts, the OTP is permanently locked.  
**Why**: There are 900,000 possible 6-digit codes (100000 to 999999). With unlimited attempts, an attacker could try them all. With only 3 attempts, the chance of guessing correctly is 3/900,000 = 0.00033%.  
**What it prevents**: Automated brute-force attacks.

### Layer 6: Per-Email Rate Limiting
**What**: Maximum 3 OTP requests per 10 minutes per email, with a 60-second cooldown between requests.  
**Why**: Prevents an attacker from flooding a user's inbox with OTP emails. Also prevents creating thousands of OTP records in our database.  
**What it prevents**: Email spam, database flooding.

### Layer 7: Per-IP Rate Limiting (express-rate-limit)
**What**: Maximum 5 OTP requests per 15 minutes per IP address.  
**Why**: Layers 5 and 6 protect per-email, but what if an attacker uses MANY different emails? This layer catches that by limiting requests per IP.  
**What it prevents**: Distributed spam attacks from a single machine.

### Bonus: Previous OTP Invalidation
**What**: Before creating a new OTP, all old unverified OTPs for that email are deleted.  
**Why**: If a user requests 3 OTPs, only the LATEST one should work. Old ones are deleted so an attacker can't use a previously intercepted code.

### Bonus: XSS Prevention in Email Template
**What**: The user's name is HTML-escaped before being inserted into the email template.  
**Why**: If someone registers with the name `<script>alert('hack')</script>`, and we put that directly in the HTML email, it could execute malicious JavaScript in the recipient's email client. `escapeHtml()` converts `<` to `&lt;` and `>` to `&gt;`, making it harmless text.

---

## JWT — How "Staying Logged In" Works

### What is a JWT?

After successfully verifying an OTP, the server creates a JWT (JSON Web Token) — a small package of data that proves who the user is. Think of it as a **digital ID card** that the app carries around.

A JWT is a long encoded string with three parts separated by dots:

```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjQyLCJlbWFpbCI6InVzZXJAbHB1LmluIn0.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
|_________________________|_____________________________________________________|_____________________________________________|
      HEADER                              PAYLOAD                                        SIGNATURE
 "I'm using HS256 algorithm"     "userId: 42, email: user@lpu.in"              "This was signed by our server"
```

- **Header**: Tells what algorithm was used to sign it (HS256 = HMAC-SHA256).
- **Payload**: Contains the actual data (user ID, email, creation time, expiry time). This is NOT encrypted — it's just Base64 encoded (easily decoded). But that's fine — the signature prevents tampering.
- **Signature**: Created by combining the header + payload and hashing them with the JWT_SECRET (a random 64-character string that only our server knows). This signature proves the token was created by OUR server and hasn't been modified.

### Why Can't Someone Fake a JWT?

Because they don't know the JWT_SECRET. The signature is created using `HMAC(header + payload, JWT_SECRET)`. If someone changes the payload (e.g., changes `userId: 42` to `userId: 1`), the signature no longer matches. When the server verifies the token, it re-calculates the signature and compares — if they don't match, the token is rejected.

It's like a sealed envelope with a wax seal. You can open the envelope, read the letter, even change the letter. But you can't recreate the wax seal because you don't have the original seal stamp (the JWT_SECRET). The recipient (server) checks the seal and knows if the letter was tampered with.

### JWT Lifecycle in Our App

1. **Creation** (backend, after OTP verification): The server creates a JWT with `{ userId, email }` and signs it with JWT_SECRET. The token expires in 7 days.

2. **Storage** (frontend): The token is stored on the phone using `expo-secure-store`, which uses hardware-backed encryption — Keychain on iOS, encrypted SharedPreferences on Android. This is much more secure than storing it in plain text.

3. **Usage** (frontend, every request): An **Axios interceptor** automatically attaches the token to every outgoing HTTP request as `Authorization: Bearer <token>`. The developer doesn't have to remember to add it — it happens automatically.

4. **Verification** (backend, every protected request): The `verifyToken` middleware extracts the token, verifies its signature, checks it hasn't expired, and looks up the user in the database. If everything checks out, `req.user` is set with the user's info.

5. **Expiry handling** (frontend): Another Axios interceptor watches for `401 Unauthorized` responses (meaning the token is expired or invalid). When it sees one, it deletes the stored token and triggers the `AuthGatekeeper` to redirect to the login screen. The user sees "Session expired. Please log in again."

---

## AuthGatekeeper — The Frontend Security Guard

The `AuthGatekeeper` is a component that wraps the entire app and controls which screens the user can see based on their login status.

**How it works**:

Every time the screen changes or the app comes back from the background, the AuthGatekeeper checks: "Does this user have a valid JWT token stored on their device?"

- **No token + user is trying to access protected screens** (explore, post-ride, my-rides, profile) → **Redirect to login screen**. The user can't bypass this — even if they type the URL directly, the AuthGatekeeper catches it.

- **Token exists + user is on the login screen** → **Redirect to explore screen**. If a user is already logged in, there's no need to show the login page.

- **App returns from background** (user switched to another app and came back) → **Re-check the token**. The token might have expired while the app was in the background.

- **API returns 401** (token expired while using the app) → The Axios response interceptor calls `onAuthExpired()`, which triggers the AuthGatekeeper to re-check and redirect to login.

This multi-layered approach ensures that:
1. Unauthenticated users can NEVER see protected content
2. Users with expired tokens are immediately redirected
3. The transition is seamless — no manual logout needed

---

## Security Summary — Everything at a Glance

| Threat | How We Defend | Where |
|--------|--------------|-------|
| Non-university users accessing the app | Email domain restriction (`@lpu.in` only) | authController.js |
| OTP code prediction | Cryptographic random generation (`crypto.randomInt`) | authController.js |
| Database breach revealing OTP codes | SHA-256 hashing (one-way, irreversible) | authController.js |
| Brute-force guessing OTP codes | 3-attempt lock per OTP | authController.js |
| OTP email spam flooding | Per-email rate limiting (3 per 10 min, 60s cooldown) | authController.js |
| Distributed OTP attacks from one machine | Per-IP rate limiting (express-rate-limit) | authRoutes.js |
| Old/stale OTPs being reused | 10-minute expiry + delete old unverified OTPs | authController.js |
| JWT token forgery/tampering | HMAC-SHA256 signature with secret key | middleware/auth.js |
| Token theft from device storage | expo-secure-store (hardware encryption) | services/api.ts |
| Expired token allowing access | 7-day expiry + 401 handling + AuthGatekeeper | Throughout |
| SQL injection attacks | Parameterized queries with `?` placeholders | All controllers |
| Cross-site scripting (XSS) in emails | `escapeHtml()` function sanitizes user input | authController.js |
| CORS attacks from malicious websites | Whitelist of allowed origins | server.js |
| Man-in-the-middle on database connection | SSL/TLS encryption with CA certificate | config/db.js |
