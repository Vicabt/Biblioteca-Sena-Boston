import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Aquí necesitarás añadir tus credenciales de Firebase
  apiKey: "AIzaSyDomn-I0rornU6A7QArxckITGndKUizemg",
  authDomain: "biblioteca-sena-boston.firebaseapp.com",
  projectId: "biblioteca-sena-boston",
  storageBucket: "biblioteca-sena-boston.firebasestorage.app",
  messagingSenderId: "947790657292",
  appId: "1:947790657292:web:7a8c1ef063162d19727b29",
  measurementId: "G-RXXN2NT2F4"
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };