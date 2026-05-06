import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDCMK9Y9Scry8bWZEKlIljJsbohUUDCIaA",
    authDomain: "bloom-22bac.firebaseapp.com",
    projectId: "bloom-22bac",
    storageBucket: "bloom-22bac.firebasestorage.app",
    messagingSenderId: "556428515695",
    appId: "1:556428515695:web:e7f1a8c1b1762ca4eb309a",
    measurementId: "G-F8P5YVZR29"
};

// Inicializamos Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
if (getApps().length > 0) {
    try {
        auth = getAuth(app);
    } catch (e) {
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage)
        });
    }
}

export { auth };