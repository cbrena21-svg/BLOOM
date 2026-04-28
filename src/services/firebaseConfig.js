import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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
const app = initializeApp(firebaseConfig);

// Exportamos la autenticación para usarla en el Login
export const auth = getAuth(app);