import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyChoEkenNrhfYzVhHA9VKBN7dJxqKMgHbs",
  authDomain: "safeid-auth.firebaseapp.com",
  projectId: "safeid-auth",
  storageBucket: "safeid-auth.firebasestorage.app",
  messagingSenderId: "1015314944157",
  appId: "1:1015314944157:web:a92fa3a116bb652b890474",
  measurementId: "G-HPCJ3LFH45"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
