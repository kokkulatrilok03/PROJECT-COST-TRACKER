// firebaseConfig.js

import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBHRKQcdm4QNgRTjAsn4XB46VmYQoX4CTk",
  authDomain: "project-cost-tracker-65f4b.firebaseapp.com",
  projectId: "project-cost-tracker-65f4b",
  storageBucket: "project-cost-tracker-65f4b.appspot.com",
  messagingSenderId: "642187383117",
  appId: "1:642187383117:web:0dcaa46ae0e02a8c51a704",
  measurementId: "G-BH58TY9DLN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore with cache
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Firebase Auth
const auth = getAuth(app);

export { db, auth };
