// Frontend/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDTXW8MvIb-DYc24j1aldJM8cyCFA3sfXI",
  authDomain: "ridemates-e865c.firebaseapp.com",
  projectId: "ridemates-e865c",
  storageBucket: "ridemates-e865c.firebasestorage.app",
  messagingSenderId: "632957917795",
  appId: "1:632957917795:web:e6389bb6e90195f9707656"
};
console.log("🔥 THE APP IS CURRENTLY USING THIS API KEY: ", firebaseConfig.apiKey);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);