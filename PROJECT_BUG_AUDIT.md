# RideMates Project Bug & Logic Audit

**Generated:** 2026-05-09  
**Scope:** Full tracked Backend + Frontend source/config audit (no source code modified)  
**Method:** File-by-file review with focused validation of critical/high findings

## Summary

- **Total findings:** 25
- **Critical:** 2
- **High:** 7
- **Medium:** 14
- **Low:** 2

---

## Backend Findings

| Severity | File:Line(s) | Issue | Impact / Why it matters | Trigger |
|---|---|---|---|---|
| critical | `Backend/controllers/reportController.js:75-78, 215-226` | Missing authorization in report filing | Any authenticated user can report users from rides they did not participate in, causing unfair trust penalties. | Call `POST /api/reports/new` with arbitrary `ride_id` + `reported_user_id`. |
| high | `Backend/controllers/bookController.js:412-460, 479-507` | Accept/reject booking race condition | `acceptBooking` is transactional and locked, `rejectBooking` is not; concurrent calls can create contradictory final state. | Fire accept and reject nearly simultaneously on same pending booking. |
| high | `Backend/server.js:195-264, 284-291` | Streak reward job can double-process | Streak job reads and updates `streak_processed` without global lock/transaction boundary across workers/instances. | Run multiple backend instances with scheduler enabled. |
| medium | `Backend/controllers/bookController.js:40-45` | Invalid `seats_booked` coerced to 1 | `parseInt(seats_booked) || 1` silently turns invalid values (like `"abc"` or `0`) into `1`. | Submit booking with non-numeric/zero `seats_booked`. |
| medium | `Backend/controllers/rideController.js:475-478, 527` | `available_seats` update lacks validation | No numeric/range check in update path; bad values can cause SQL errors or invalid ride state. | Update ride with negative/non-numeric `available_seats`. |
| medium | `Backend/controllers/rideController.js:481-499` | Repricing uses stale seat count | Price recalculation uses old DB `available_seats` when both seats and price are edited in same request. | Update `available_seats` and `driver_set_price` together. |
| medium | `Backend/controllers/rideController.js:607-612` | Driver trust score may go negative | Penalty subtracts directly (`trust_score = trust_score - ?`) instead of clamping to 0. | Driver with low trust cancels late ride with confirmed bookings. |
| medium | `Backend/controllers/reportController.js:61` | Self-report check can be bypassed by type mismatch | Strict compare (`===`) may fail when `reported_user_id` is string and `req.user.id` is number. | Send own ID as string in payload. |
| medium | `Backend/controllers/authController.js:628-640, 650` | Phone duplicate check can be bypassed by formatting | Input is validated with cleaned phone, but duplicate query uses raw `phone` value. | Existing `9876543210`; update with `+919876543210`. |
| high | `Backend/database/README.md:31-34`, `Backend/database/02_create_bookings_table.sql:6-37`, `Backend/controllers/reportController.js:223-226` | Setup-script/schema mismatch (`is_reported`) | Option B setup creates bookings table without `is_reported`, but runtime report flow updates that column. | Use Option B scripts then file a report. |
| medium | `Backend/database/01_create_rides_table.sql:13`, `Backend/utils/priceCalculator.js:32-37` | Vehicle enum mismatch (`scooter`) | Pricing logic supports `scooter` but SQL enum in script 01 does not. | Create ride with `vehicle_type = 'scooter'` using DB from script 01. |
| medium | `Backend/database/03_create_fuel_rates_table.sql:23-26`, `Backend/controllers/rideController.js:486-491` | Missing electric fuel seed | Script seeds petrol/diesel/cng only; electric falls back to 105 in controller. | Post electric ride on DB initialized with script 03. |
| low | `Backend/database/add_streak_processed.sql:8-13` | Migration not idempotent | File claims IF NOT EXISTS behavior but runs plain `ALTER TABLE ... ADD COLUMN`. | Execute migration twice. |
| medium (needs confirmation) | `Backend/controllers/authController.js:454-484` | Signup inserts unvalidated `role` | `role` from client is inserted directly; behavior depends on SQL mode and enum constraints (error/coercion). | Verify OTP signup with invalid role value. |

---

## Frontend Findings

| Severity | File:Line(s) | Issue | Impact / Why it matters | Trigger |
|---|---|---|---|---|
| critical | `Frontend/components/ui/RideStatusModal.tsx:108-110` | Backdrop triggers primary action | Tapping outside modal calls `primaryAction.onPress`, potentially executing destructive actions unintentionally. | Open status modal and tap outside card. |
| high | `Frontend/app/(tabs)/profile.tsx:54-66, 162` | Blank profile screen on fetch failure | On error, `profile` remains null and component returns `null`, producing empty screen. | Lose network and open Profile tab. |
| high | `Frontend/app/(tabs)/explore.tsx:123-125` | Android back always exits app | Back handler force-calls `BackHandler.exitApp()`, bypassing expected back/modal behavior. | Press hardware back on Explore (Android). |
| high | `Frontend/components/PostRide/LocationPickerModal.tsx:28`, `Frontend/hooks/useLocationIQSearch.ts:41-113` | Extra location-search churn from unstable dependency | `ALL_HUBS.map(...)` creates a new array every render, retriggering effect and extra searches. | Open location picker, type query, observe repeated calls. |
| high | `Frontend/components/Explore/constants.ts:171-182` | Date filter uses UTC day conversion | `toISOString().split('T')[0]` can shift date around midnight in non-UTC zones. | Use app near midnight local time in UTC+ zones. |
| high | `Frontend/constants/config.ts:20-30` | Hardcoded development API host | Base URL is pinned to a local IP and does not use `EXPO_PUBLIC_API_BASE_URL`, breaking portability. | Run app on different machine/network/device. |
| medium | `Frontend/services/locationiq.ts:10`, `Frontend/.env.example:23` | LocationIQ key exposed in source/examples | API key is embedded in code and shared in env example, increasing abuse/quota risk. | Key visible in repository/app bundle. |
| medium | `Frontend/components/ui/ReportModal.tsx:37-39, 89-99` | Report modal state persists across reopen | `reason` and `description` are not reset on close/reopen, causing stale input reuse. | Fill report form, close modal, reopen. |
| medium (needs confirmation) | `Frontend/app/(tabs)/post-ride.tsx:179-187` | Frontend allows past departure attempts | `canPublish()` does not check departure > now; backend may reject but UI allows attempt. | Select today + past time and publish. |
| medium | `Frontend/components/RideDetails/EditRideModal.tsx:72, 150` | Price label/field semantics mismatch | Label says “Total Trip Price” but payload sends `driver_set_price` (per-seat). | Edit ride price based on displayed wording. |
| low | `Frontend/components/Auth/OtpStep.tsx`, `Frontend/components/Auth/ProfileStep.tsx` | Lint-blocking unescaped apostrophes | Unescaped `'` in JSX text triggers `react/no-unescaped-entities` and can fail lint-gated CI. | Run frontend lint. |

---

## Coverage

- **Backend files inspected:** 23 tracked text files (`controllers`, `routes`, `middleware`, `utils`, `config`, SQL scripts, server/package/env docs).
- **Frontend files inspected:** 79 tracked non-binary text files (`app`, `components`, `hooks`, `services`, `constants`, config files, README/scripts).
- **Excluded from logic audit:** binary assets (`.png`) and data-only fixture file `Frontend/components/Data/test.json`.

