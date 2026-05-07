import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDCMK9Y9Scry8bWZEKlIljJsbohUUDCIaA",
    authDomain: "bloom-22bac.firebaseapp.com",
    projectId: "bloom-22bac",
    storageBucket: "bloom-22bac.firebasestorage.app",
    messagingSenderId: "556428515695",
    appId: "1:556428515695:web:e7f1a8c1b1762ca4eb309a",
    measurementId: "G-F8P5YVZR29"
};

// 1. Inicializamos la App (Lógica limpia)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Inicializamos Auth con PERSISTENCIA 
// Usamos un let para poder definirlo según la condición
let auth;

/**
 * ¿Por qué hacemos esto?
 * Si la app ya tiene una instancia de Auth (por un recargo de código), la usamos.
 * Si no tiene ninguna, la inicializamos con AsyncStorage para que la sesión sea eterna.
 */
if (getApps().length > 0) {
    // Si la app ya existía, intentamos obtener el Auth ya configurado
    auth = getAuth(app);
} else {
    // Si es la primera vez que arranca, configuramos la persistencia móvil
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
}

export { app, auth };