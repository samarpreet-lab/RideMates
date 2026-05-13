# 📱 Frontend — React Native, Expo & TypeScript Explained

## What is React Native?

React Native is a framework for building **mobile apps** (Android and iOS) using **JavaScript**. The key advantage: you write ONE codebase, and it works on BOTH platforms. Without React Native, you'd need:
- **Android app**: Written in Java or Kotlin
- **iOS app**: Written in Swift
- That's two completely separate codebases to maintain!

React Native eliminates this by letting you write everything in JavaScript/TypeScript. Under the hood, it converts your code into actual native components — so a `<View>` becomes a real Android View and a real iOS UIView. It's not a website running inside a mobile browser — it's a truly native app.

**The key mental model**: React Native is like writing instructions in one universal language (JavaScript) that get translated into local languages (Android's Java, iOS's Swift) at runtime. The end result is the same — a native app — but you only had to write the instructions once.

---

## What is Expo?

Think of React Native as the engine of a car, and Expo as the complete car with dashboard, GPS, and stereo already installed. Expo is a **platform** on top of React Native that removes a lot of complexity:

- **Without Expo**: You need Android Studio, Xcode, JDK, CocoaPods, and a dozen other tools installed. Setting up a project takes hours.
- **With Expo**: You run `npx expo start`, scan a QR code with your phone, and the app is running. Setup takes minutes.

**What Expo gives us**:
- `expo-secure-store` → Encrypted storage on the device (for JWT tokens)
- `expo-location` → Access to the phone's GPS
- `expo-haptics` → Make the phone vibrate for feedback
- `expo-router` → File-based navigation (each file = one screen)
- Easy builds for Android APK and iOS IPA

---

## What is TypeScript?

TypeScript is JavaScript with **type checking**. In regular JavaScript, you can put any type of data anywhere — this leads to bugs that only crash at runtime (when the user is using the app). TypeScript catches these bugs at compile time (while you're writing code).

**Simple example**: In JavaScript, you could accidentally pass a string where a number was expected, and it would silently produce wrong results. TypeScript stops you and says "this is supposed to be a number."

**Types we use in this project**:

- `string` → Text values (email, name, city)
- `number` → Numeric values (price, seats, latitude)
- `boolean` → True/false values (is_loading, is_women_only)
- `string | null` → Either a string OR null (JWT token — exists or doesn't)
- `'local' | 'photon'` → Union type: can ONLY be one of these exact strings
- `interface LocationResult { ... }` → Defines the exact shape of an object (what properties it has and what types they are)
- `Promise<void>` → A function that runs asynchronously and doesn't return anything
- `Promise<string | null>` → A function that runs asynchronously and returns either a string or null

---

## React Core Concepts — The Building Blocks

### Components: Everything is a Piece

In React, the entire UI is built from **components** — reusable pieces of interface. Think of them like LEGO blocks. Each block has its own appearance and behavior, and you combine them to build the full screen.

**Example**: The ride search results screen is made of:
- A `TopIdentityBar` component (shows the user's name)
- A `BottomCommandSheet` component (search bar and filters)
- Multiple `RideCard` components (one for each search result)

Each component is a **function** that receives data (called "props") and returns UI elements.

When we write `<RideCard ride={rideData} />`, we're saying "render a RideCard component and give it this ride data." The RideCard component uses that data to display the origin, destination, price, etc.

---

### useState — Remembering Things

`useState` is how a component remembers data that changes over time. Without it, all data would be lost every time the screen refreshes.

**How it works**: `useState` gives you two things:
1. A **variable** that holds the current value
2. A **setter function** to update that value

When you call the setter function, React automatically **re-renders** the component with the new value. This is how the screen updates when something changes.

**Real examples in our app**:
- `const [email, setEmail] = useState('')` — Remembers what the user typed in the email field. Starts as an empty string. When the user types "s", `setEmail('s')` is called → email becomes "s" → the input shows "s".
- `const [loading, setLoading] = useState(false)` — Tracks whether we're waiting for an API response. When `true`, we show a spinner. When `false`, we show the content.
- `const [rides, setRides] = useState([])` — Stores the array of ride search results. Starts empty. After the API responds, `setRides(apiResults)` fills it.
- `const [step, setStep] = useState('email')` — On the login screen, tracks which step the user is on ('email' → 'otp' → 'profile' for signup).

---

### useEffect — Doing Things at the Right Time

`useEffect` runs code at specific moments in a component's life. Without it, you'd have no way to say "fetch data when the screen first loads" or "search when the user types something new."

**Three common patterns**:

**Pattern 1: "Run this ONCE when the screen first appears"**
```typescript
useEffect(() => {
  fetchProfile();  // Load the user's profile from the API
}, []);  // ← Empty array means "run only on mount (first load)"
```
When the profile screen opens, this loads the user's data. It doesn't run again unless the user leaves and comes back.

**Pattern 2: "Run this EVERY TIME a specific value changes"**
```typescript
useEffect(() => {
  searchLocations(query);  // Search whenever the query changes
}, [query]);  // ← Runs every time `query` changes
```
When the user types in the search box, `query` changes. This triggers a new search automatically.

**Pattern 3: "Run this once, and clean up when the screen closes"**
```typescript
useEffect(() => {
  const subscription = AppState.addEventListener('change', handleAppState);
  return () => subscription.remove();  // ← Cleanup function
}, []);
```
This listens for app state changes (background/foreground). When the screen is closed (unmounted), the cleanup function removes the listener to prevent memory leaks.

---

### useCallback — Not Recreating Functions Unnecessarily

Every time a component re-renders (which happens often — on any state change), ALL functions inside it are recreated. This is usually fine, but some functions are passed to child components, and recreating them causes those children to re-render unnecessarily.

`useCallback` memorizes a function so it's only recreated when its dependencies change.

**In our app**: The `checkAuth` function in the AuthGatekeeper is wrapped in `useCallback`. Without it, `checkAuth` would be recreated on every render, causing all child components to re-render too.

---

### useRef — Keeping Data Without Re-rendering

`useRef` creates a container that holds a value across renders, but changing it does NOT trigger a re-render. This is perfect for:

- **Timers**: When debouncing search, we store the timer ID in a ref. We need to cancel the previous timer, but changing the timer ID shouldn't re-render the screen.
- **AbortControllers**: When cancelling an in-flight API request, we store the controller in a ref. Again, this is internal plumbing that shouldn't cause a visual update.

**The difference from useState**: `useState` causes a re-render when updated. `useRef` does NOT. Use `useState` for data that should be visible to the user (email, loading status). Use `useRef` for internal values (timers, controllers).

---

### useContext — Sharing Data Globally

Normally, to pass data from a parent component to a deeply nested child, you'd have to pass it through every component in between (called "prop drilling"). This gets messy quickly.

`useContext` creates a "global channel" that any component can tap into, no matter how deep it is.

**In our app**: We use an `AlertContext` to show custom alerts from any screen. Instead of passing an `onShowAlert` function through 5 layers of components, any component can call `const { showAlert } = useContext(AlertContext)` and trigger an alert directly.

---

## React Native Components — Mobile UI Building Blocks

React Native doesn't use HTML elements. Instead, it uses its own components that map to native mobile UI:

| React Native Component | What It Does | Closest HTML/Web Equivalent |
|----------------------|--------------|---------------------------|
| `<View>` | A container that holds other elements. Like a box. | `<div>` |
| `<Text>` | Displays text. ALL text must be inside a `<Text>` — you can't just put text in a `<View>`. | `<p>` or `<span>` |
| `<TextInput>` | A text field the user can type in. | `<input type="text">` |
| `<TouchableOpacity>` | A pressable area that becomes slightly transparent when pressed. Used for buttons. | `<button>` |
| `<ScrollView>` | A scrollable area for content that doesn't fit on screen. | `overflow: scroll` |
| `<FlatList>` | An optimized list for large datasets. Only renders items that are visible on screen (virtual scrolling). Much better performance than ScrollView for hundreds of items. | `<ul>` with virtual scrolling |
| `<Modal>` | A popup overlay that covers the screen. | Dialog / modal |
| `<ActivityIndicator>` | A spinning loading indicator (the standard OS spinner). | CSS spinner |
| `<Image>` | Displays images (from URLs or local files). | `<img>` |
| `<Switch>` | A toggle switch (on/off). | `<input type="checkbox">` |

### Styling: JavaScript Objects, Not CSS

React Native does NOT use CSS files. Styles are JavaScript objects created with `StyleSheet.create()`.

**Key differences from web CSS**:
- Property names are `camelCase`: `backgroundColor` not `background-color`
- Values don't have units: `padding: 16` not `padding: 16px` (values are in density-independent pixels)
- Layout defaults to **Flexbox** with `flexDirection: 'column'` (children stack vertically)
- No cascading or inheritance — every component explicitly sets its own styles
- Drop shadows are platform-specific: `shadowColor` + `shadowOffset` for iOS, `elevation` for Android

---

## Expo Packages We Use

### expo-router — Navigation Between Screens

**How it works**: Every file you create in the `app/` directory automatically becomes a screen. You don't need to manually define routes — the file structure IS the routing.

```
app/(tabs)/explore.tsx    →  Screen accessible at /(tabs)/explore
app/(tabs)/post-ride.tsx  →  Screen accessible at /(tabs)/post-ride
app/(tabs)/my-rides.tsx   →  Screen accessible at /(tabs)/my-rides
```

**Navigating between screens**:
- `router.push('/ride-details')` → Navigate forward (user can go back)
- `router.replace('/explore')` → Replace current screen (user can't go back — used after login)
- `router.push({ pathname: '/ride-details', params: { id: 42 } })` → Navigate with data

### expo-secure-store — Encrypted Storage

Stores sensitive data (JWT tokens) using hardware-backed encryption:
- **iOS**: Uses the Keychain (Apple's secure credential storage)
- **Android**: Uses EncryptedSharedPreferences (AES-encrypted)

This is MUCH more secure than regular storage (AsyncStorage, localStorage). Even if someone has physical access to the phone, they can't read the stored token without the device's unlock credentials.

### expo-location — GPS Access

Requests permission to access the phone's GPS and returns the current coordinates (latitude, longitude). We use this to auto-detect the user's location for biasing search results toward nearby cities.

### expo-haptics — Physical Feedback

Makes the phone vibrate briefly when the user taps a button. This "tactile feedback" makes the app feel more responsive and premium. A light vibration on booking confirmation, for example, feels satisfying.

### expo-constants — App Configuration

Provides access to configuration values defined in `app.json` or `app.config.js`. We use it to read Firebase configuration keys and other environment-specific settings.

---

## Third-Party Libraries

### Axios — HTTP Client

We use Axios instead of the built-in `fetch()` for three reasons:

1. **Interceptors**: We can automatically add the JWT token to EVERY request and handle 401 errors centrally (instead of adding token logic in every single API call).

2. **Better error handling**: With `fetch`, network errors and HTTP errors are handled differently. Axios treats both consistently.

3. **Automatic JSON**: Axios automatically parses JSON responses. With `fetch`, you have to call `response.json()` manually.

### react-native-maps — Interactive Maps

Renders a full Google Maps / Apple Maps view inside the app. We use it to show the ride's route on the ride details screen with markers for origin and destination.

### react-native-safe-area-context — Notch/Cutout Handling

Modern phones have notches, camera cutouts, and rounded corners. Without safe area handling, content would be hidden behind these. This library ensures our content stays in the visible area.

---

## Custom Hooks — Reusable Logic Packages

### What is a Custom Hook?

A custom hook is a function that packages reusable stateful logic. Instead of copy-pasting the same search logic into every screen that needs it, we write it ONCE as a hook and use it anywhere.

### usePhotonSearch — The Location Search Engine

This is our most complex custom hook. Let me explain what it does step by step in plain English:

**The goal**: When the user types a city name in the search box, show matching location suggestions.

**The challenge**: We need to balance speed, API costs, and user experience.

**Step 1: Local hub check first**
Before calling any external API, we check our local list of popular hubs (like "LPU Gate 1", "Phagwara Bus Stand"). If the user's query matches a local hub, we show it instantly (no API call needed). This is fast and free.

**Step 2: Debouncing**
If the user types "Jalandhar", they go through J → Ja → Jal → Jala → Jalan → Jaland → Jalandh → Jalandha → Jalandhar. Without debouncing, that's 9 API calls! With debouncing, we wait 450ms after the LAST keystroke before calling the API. So we only make 1 call (for "Jalandhar").

**How debouncing works**: We use `setTimeout` to schedule the API call 450ms in the future. If the user types another character within those 450ms, we cancel the old timer (`clearTimeout`) and start a new 450ms timer. The API call only fires when the user pauses for 450ms.

**Step 3: Cancel previous requests**
Even with debouncing, the user might type "Jal", wait 450ms (API call fires for "Jal"), then type "andhar". Now two API calls are in flight. The "Jal" results might arrive AFTER the "Jalandhar" results, overwriting them with stale data.

We prevent this with `AbortController` — when we fire a new request, we cancel the previous one. The cancelled request throws an `AbortError` which we silently ignore.

**Step 4: Filter results to Punjab region**
The Photon API returns results from all over the world. We filter them to only show cities/towns/villages within Punjab's geographical bounds (latitude 29.5-32.6, longitude 73.8-77.0).

**Step 5: Coordinate swap**
A critical detail: Photon returns coordinates in `[longitude, latitude]` order, but our database stores `[latitude, longitude]`. We swap them when processing results.

### useLocationIQSearch — The Backup Search

Same concept as usePhotonSearch but uses the LocationIQ API instead of Photon. Uses a 300ms debounce (slightly faster) and includes a viewbox parameter to bias results toward Punjab.

---

## Responsive Design — Making It Look Good on Every Phone

### The Problem

An iPhone SE has a screen width of 320 pixels. An iPhone 15 Pro Max has 430 pixels. A Samsung Galaxy S24 Ultra has 412 pixels. A font size of 16 might look perfect on an iPhone 15 but be too large on an iPhone SE (taking up too much space) or too small on a tablet.

### The Solution: Scaling Functions

We designed the UI on an iPhone X (375 × 812 pixels) as our baseline. Our scaling functions calculate how much bigger or smaller the current device is compared to the baseline, and scale all dimensions proportionally.

**Width-proportional scaling** (`wp(size)`): Scales based on screen width.
- On iPhone X (375px): `wp(100)` = 100px
- On a 412px phone: `wp(100)` = 110px (12% wider phone → 12% larger elements)

**Height-proportional scaling** (`hp(size)`): Same concept but for height.

**Font scaling** (`fs(size)`): Uses a moderated scale (doesn't scale as aggressively as wp/hp) so fonts don't become absurdly large on tablets. Also adds a small boost on Android devices (which tend to render fonts slightly smaller than iOS).

### Pre-Scaled Design Tokens

Instead of calling scaling functions everywhere, we define pre-scaled constants:
- `SPACING.md` = 12 scaled pixels → used for medium padding
- `FONT_SIZE.lg` = 16 scaled pixels → used for regular body text
- `RADIUS.lg` = 12 scaled pixels → used for rounded corners

This keeps the code clean. Instead of `padding: wp(12)` everywhere, we write `padding: SPACING.md`.

---

## Navigation Structure — How Screens Are Organized

```
_layout.tsx (Root)
  └── AuthGatekeeper (checks login)
       └── Tab Navigator (bottom tabs)
            ├── Login       → Login/signup flow
            ├── Explore     → Search for rides
            ├── Post Ride   → Create a new ride
            ├── My Rides    → Your rides & bookings
            ├── Profile     → Your account
            └── Ride Details → Full ride view (hidden from tabs)
```

**How it works**:
1. The Root Layout wraps everything in the AuthGatekeeper
2. The AuthGatekeeper checks if the user has a valid JWT
3. If not logged in → only the Login tab is accessible
4. If logged in → Explore, Post Ride, My Rides, and Profile tabs are shown
5. Ride Details is a "hidden" screen (no tab icon) — accessed by tapping on a ride card
