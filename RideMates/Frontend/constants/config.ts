// Frontend/constants/config.ts

// Replace 192.168.1.5 with YOUR actual IPv4 Address
const LOCAL_IP = '192.168.1.18'; 

export const CONFIG = {
  // We use this URL to talk to your Node.js backend
  API_BASE_URL: `http://${LOCAL_IP}:5000/api`,
  
  // The domain restriction we defined in the blueprint
  ALLOWED_EMAIL_DOMAIN: 'lpu.in',
};