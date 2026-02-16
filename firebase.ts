import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBPVPogXHyNPGFHEC0Z3--zikqNjRxDWM0",
  authDomain: "coin-6341e.firebaseapp.com",
  databaseURL: "https://coin-6341e-default-rtdb.firebaseio.com",
  projectId: "coin-6341e",
  storageBucket: "coin-6341e.firebasestorage.app",
  messagingSenderId: "233663527132",
  appId: "1:233663527132:web:97e4699ee7e62a98319c19",
  measurementId: "G-Z6VYPGPKG3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);