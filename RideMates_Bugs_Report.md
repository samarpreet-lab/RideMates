# RideMates Codebase Review Report

A comprehensive review of the `RideMates` project codebase (Backend and Frontend) was conducted. The following is a detailed list of bugs, logic errors, and compilation issues found across the project.

## 🔴 Backend Logic Bugs & Errors

### 1. Concurrency/State Flaw in `updateRide` (rideController.js)
* **Issue:** When a driver updates both `driver_set_price` and `available_seats` simultaneously, the `calculatePrice` algorithm incorrectly uses the *old* `available_seats` value fetched from the database (`parseInt(rd.available_seats) || 1`) rather than the *new* value provided in the request body.
* **Impact:** The `capped_price` and tier boundaries are calculated using the wrong number of seats, violating the pricing model.

### 2. Unique Constraint Bypass via Empty String (authController.js)
* **Issue:** In the `updateProfile` endpoint, the validation logic uses `if (phone)` to check for duplicate phone numbers. This evaluates to `false` for an empty string (`""`), bypassing the `SELECT` query. However, the subsequent check `if (phone !== undefined)` evaluates to `true` and includes the empty string in the `UPDATE` SQL statement.
* **Impact:** A user can successfully update their phone number to `""`. If a second user does the same, it will trigger an `ER_DUP_ENTRY` database crash, breaking the profile update functionality for them.

### 3. Flawed Brute-Force Lock Logic in OTP Verification (authController.js)
* **Issue:** In `verifyOtp`, the check for maximum attempts is `if (otpRecord.attempts >= MAX_OTP_ATTEMPTS)` *before* verifying the input. If `MAX_OTP_ATTEMPTS = 3`, a user can fail 3 times. On the 3rd failure, the remaining attempts string evaluates to `3 - (2 + 1) = 0 attempt(s) remaining`. The account is only locked on the *4th* attempt.
* **Impact:** Allows 4 failed attempts instead of the intended 3.

### 4. Input Validation Typo in `createRide` (rideController.js)
* **Issue:** The parsed `priceNum` is validated to be between 1 and 10000, but the pricing algorithm is later fed the unparsed, raw `driver_set_price` string.
* **Impact:** While JavaScript often coerces this successfully during multiplication, it's a typing inconsistency that can lead to subtle bugs or `NaN` values propagating into the database.

---

## 🟡 Frontend Compilation Errors & Warnings

### 1. TypeScript Mismatches in `LocationPickerModal.tsx`
* **Issue:** The `FlatList` component is fed an array that doesn't match its strictly typed expected props. The `icon` property sometimes receives `"directions"`, which isn't part of the accepted union type.
* **Issue:** Line 94 attempts to access `item.lat` and `item.lng`, but these properties are missing from the interface definition of `ALL_HUBS` or the Search Results type.
* **Impact:** Halts compilation (`TS2339` and `TS2769`).

### 2. Missing React Hook Dependencies (`exhaustive-deps`)
* **Issue:** Multiple `useEffect` and `useCallback` hooks omit necessary dependencies.
  * `app/(tabs)/explore.tsx` (misses `loadData`)
  * `app/(tabs)/my-rides.tsx` (misses `fetchMyRides`)
  * `app/(tabs)/post-ride.tsx` (misses `loadProfile`, `seats`)
  * `app/(tabs)/profile.tsx` (misses `fetchProfile`)
  * `app/(tabs)/ride-details.tsx` (misses `fetchRide`)
  * `components/ui/CustomAlert.tsx` (misses `fadeAnim`, `scaleAnim`)
  * `components/ui/SkeletonLoader.tsx` (misses `pulseAnim`)
  * `hooks/usePhotonSearch.ts` (misses `localHubs`)
* **Impact:** Creates stale closures where state/props inside the hooks refer to outdated values from previous renders, causing subtle UI bugs.

### 3. JSX Syntax Errors
* **Issue:** Unescaped single quotes (`'`) in `components/Auth/OtpStep.tsx` and `components/Auth/ProfileStep.tsx`.
* **Impact:** Throws `react/no-unescaped-entities` errors, breaking ESLint checks.

### 4. Linter Rule Violations
* **Issue:** Usage of `Array<T>` instead of `T[]` in `hooks/usePhotonSearch.ts` and `components/Explore/constants.ts` violates the `@typescript-eslint/array-type` rule.
* **Issue:** Dozens of defined but unused variables (e.g., `ActivityIndicator`, `Alert`, `searchError`, `StyleSheet`) across the React Native app.
