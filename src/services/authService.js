import { auth } from './firebaseConfig';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
} from 'firebase/auth';

export const signUp = async (email, password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        return { user: res.user, error: null };
    } catch (error) {
        let msg = "Error al registrarse.";
        if (error.code === 'auth/email-already-in-use') msg = "El correo ya existe.";
        if (error.code === 'auth/weak-password') msg = "Contraseña muy débil";
        return { user: null, error: msg };
    }
};

export const login = async (email, password) => {
    try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        return { user: res.user, error: null };
    } catch (error) {
        return { user: null, error: "Correo o contraseña incorrectos." };
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, error: null };
    } catch (error) {
        return { success: false, error: "Error al enviar correo." };
    }
};