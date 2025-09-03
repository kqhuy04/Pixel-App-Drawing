import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase config - Thay thế bằng config của bạn
const firebaseConfig = {
    apiKey: "AIzaSyBMMw1PL_xxk-H87OfD2FpQanjI2-S8eQQ",
    authDomain: "pixel-app-draw.firebaseapp.com",
    projectId: "pixel-app-draw",
    storageBucket: "pixel-app-draw.firebasestorage.app",
    messagingSenderId: "58568347140",
    appId: "1:58568347140:web:4420b617fc47acea3f6f51",
    measurementId: "G-QSW4FZCT5J"
  };
``
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
