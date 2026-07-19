// firebase.js — Firebase SDK init. Loaded via CDN ES modules (no npm install, no bundler).
//
// Replace the placeholder values below with the config object from your Firebase
// project's console: Project settings -> General -> Your apps -> SDK setup and
// configuration. This config is meant to be public/client-visible — Firestore
// Security Rules (see firestore.rules) are the real security boundary, not this file.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDOTvc4EBt7s4EPbLXwM6O41Pm39kehb1E',
  authDomain: 'sisyphus-midjuly.firebaseapp.com',
  projectId: 'sisyphus-midjuly',
  storageBucket: 'sisyphus-midjuly.firebasestorage.app',
  messagingSenderId: '815250856678',
  appId: '1:815250856678:web:57df835d36edb922827927',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default { app, db };
