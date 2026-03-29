// Frontend/constants/config.ts

// Replace 192.168.1.5 with YOUR actual IPv4 Address (for local development)
const LOCAL_IP = '192.168.1.9'; 
const DEV_API = `http://${LOCAL_IP}:5000/api`;
const PROD_API = 'https://ridemates-api.onrender.com/api';

// Use development API for local testing, production API for deployed app
const IS_DEV = process.env.NODE_ENV === 'development';

export const CONFIG = {
  // We use this URL to talk to your Node.js backend
  API_BASE_URL: IS_DEV ? DEV_API : PROD_API,
  
  // The domain restriction we defined in the blueprint
  ALLOWED_EMAIL_DOMAIN: 'lpu.in',
};