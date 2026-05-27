import { auth, db } from './firebaseConfig';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { calcularPerfilClinico } from '../utils/clicnicCalculator';
import { saveOnboardingProfile, clearCycleData } from './storageService';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    deleteUser
} from 'firebase/auth';

//nueva cuenta
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

// inicio de sesión
export const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: traducirError(error.code) };
    }
};

// cerrar sesión
export const logout = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: "No se pudo cerrar la sesión" };
    }
};

// recuperar contraseña
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

        // matemáticas y banderas clínicas Notion
        const perfilCompleto = calcularPerfilClinico(inputsRaw);

        await setDoc(doc(db, "users", user.uid), perfilCompleto);

        //guardamos una copia local en AsyncStorage para acceso rápido en la app -majo profileScreen
        try {
            await saveOnboardingProfile(perfilCompleto, user.uid);
        } catch (err) {
            console.warn('No se pudo guardar perfil en storage local:', err);
        }

        return { success: true };
    } catch (error) {
        console.error("Error al guardar el onboarding:", error);
        return { success: false, error: error.message };
    }
};

export const deleteAccount = async () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'No hay una sesión activa.' };
        }

        try {
            await deleteDoc(doc(db, 'users', user.uid));
        } catch (error) {
            // Si falla borrar documento, no bloqueamos el borrado de Auth.
            console.warn('No se pudo borrar el documento de usuario:', error);
        }

        try {
            await clearCycleData(user.uid);
        } catch (error) {
            console.warn('No se pudo limpiar almacenamiento local:', error);
        }

        await deleteUser(user);
        return { success: true };
    } catch (error) {
        if (error?.code === 'auth/requires-recent-login') {
            return {
                success: false,
                error: 'Por seguridad, vuelve a iniciar sesión e intenta eliminar la cuenta de nuevo.'
            };
        }

        return {
            success: false,
            error: 'No se pudo eliminar la cuenta. Inténtalo de nuevo.'
        };
    }
};