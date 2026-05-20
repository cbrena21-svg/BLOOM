import { auth, db } from './firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { calcularPerfilClinico } from '../utils/clicnicCalculator';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
/**
 * authService:
 * Este archivo centraliza todas las peticiones a Firebase Auth.
 * Retornamos objetos { success: true/false, error: string } para que 
 * las pantallas solo tengan que leer el resultado.
 */

// 1. REGISTRO DE NUEVA CUENTA
export const signUp = async (email, password, username) => {
    try {
        // Paso A: Crear el usuario con correo y contraseña
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Paso B: Guardar el "Nombre de Usuario" en el perfil de Firebase
        // Firebase por defecto solo guarda el email, así que usamos updateProfile.
        await updateProfile(user, {
            displayName: username
        });

        return { success: true, user: user };
    } catch (error) {
        return { success: false, error: traducirError(error.code) };
    }
};

// 2. INICIO DE SESIÓN
export const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: traducirError(error.code) };
    }
};

// 3. CERRAR SESIÓN
export const logout = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: "No se pudo cerrar la sesión" };
    }
};

// 4. RECUPERAR CONTRASEÑA
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        return { success: false, error: traducirError(error.code) };
    }
};

/**
 * FUNCIÓN AUXILIAR: traducirError
 * Firebase devuelve códigos técnicos como 'auth/invalid-email'.
 * Esta función los convierte en mensajes humanos y bonitos para Bloom.
 */
const traducirError = (errorCode) => {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return "Este correo ya está registrado.";
        case 'auth/invalid-email':
            return "El formato del correo no es válido.";
        case 'auth/weak-password':
            return "La contraseña es muy débil (mínimo 6 caracteres).";
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return "Correo o contraseña incorrectos.";
        default:
            return "Ocurrió un error inesperado. Inténtalo de nuevo.";
    }
};

export const guardarPerfilOnboarding = async (inputsRaw) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("No hay un usuario autenticado activo.");

        // Ejecutamos las matemáticas y banderas clínicas de tu Notion
        const perfilCompleto = calcularPerfilClinico(inputsRaw);

        // Guardamos el documento en Firestore usando el UID del usuario como ID del documento
        await setDoc(doc(db, "users", user.uid), perfilCompleto);

        return { success: true };
    } catch (error) {
        console.error("Error al guardar el onboarding:", error);
        return { success: false, error: error.message };
    }
};