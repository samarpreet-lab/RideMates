// Frontend/constants/config.ts

// =============================================================================
// API Configuration — Backend Connection
// =============================================================================
// Choose the correct IP for your development setup:
//
// For Android Emulator:     use '10.0.2.2'   (special IP to reach host)
// For iOS Simulator:        use 'localhost' or your machine's IP
// For Physical Device:      use your machine's IP (e.g., '192.168.x.x')
//
// To find your machine IP on Windows: Run 'ipconfig' in terminal
// To find your machine IP on Mac/Linux: Run 'ifconfig' or 'hostname -I'
// =============================================================================

// CHANGE THIS based on your development environment:
// ✅ Android Emulator → '10.0.2.2'
// ✅ iOS Simulator    → 'localhost'
// ✅ Physical Device  → Your machine's local IP (192.168.x.x or 10.x.x.x)
const LOCAL_IP = '192.168.1.15'; // 🔧 UPDATE THIS FOR YOUR SETUP

const DEV_API = `http://${LOCAL_IP}:5000/api`;
const PROD_API = 'https://ridemates-api.onrender.com/api';

// Use development API for local testing, production API for deployed app
const IS_DEV = process.env.NODE_ENV === 'development';

export const CONFIG = {
  // We use this URL to talk to your Node.js backend
  API_BASE_URL: IS_DEV ? DEV_API : PROD_API,
  
  // The domain restriction we defined in the blueprint
  ALLOWED_EMAIL_DOMAIN: 'lpu.in',
  
  // For debugging network issues
  DEV_ENDPOINT: DEV_API,
};