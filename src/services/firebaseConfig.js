import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDCMK9Y9Scry8bWZEKlIljJsbohUUDCIaA",
    authDomain: "bloom-22bac.firebaseapp.com",
    projectId: "bloom-22bac",
    storageBucket: "bloom-22bac.firebasestorage.app",
    messagingSenderId: "556428515695",
    appId: "1:556428515695:web:e7f1a8c1b1762ca4eb309a",
    measurementId: "G-F8P5YVZR29"
};

// 🌟 REVOLUCIÓN DEL BUG: Guardamos si ya existe ANTES de crearla
const yaExisteApp = getApps().length > 0;

// Inicializamos la App usando nuestra constante limpia
const app = yaExisteApp ? getApp() : initializeApp(firebaseConfig);

// Inicializamos Firestore
const db = getFirestore(app);

let auth;

// Ahora la condición sí va a funcionar perfectamente en los recargos de Expo
if (yaExisteApp) {
    auth = getAuth(app);
} else {
    // Esto se ejecutará SÍ O SÍ la primera vez, blindando tu sesión eterna
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
}

export const obtenerPerfilUsuario = async () => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("No hay usuario autenticado");

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { success: true, data: docSnap.data() };
        } else {
            return { success: false, error: "No se encontraron datos médicos." };
        }
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        return { success: false, error: error.message };
    }
};

export { app, auth, db };