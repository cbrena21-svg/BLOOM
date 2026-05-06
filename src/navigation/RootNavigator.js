import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

// Importamos los dos mapas
import AuthNavigator from './AuthNavigator';
// Nota: Si aún no creas AppNavigator, puedes usar AuthNavigator temporalmente para que no de error
// import AppNavigator from './AppNavigator'; 

export default function RootNavigator() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Le preguntamos a Firebase por el estado del usuario
        const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
            setUser(authenticatedUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    if (loading) return null; // Podrías poner una pantalla de carga aquí

    return (
        <NavigationContainer>
            {/* Lógica: Si hay usuario, ir a la App. Si no, ir a Login */}
            {user ? <AuthNavigator /> : <AuthNavigator />}
            {/* 👆 Tip: Por ahora dejamos AuthNavigator en ambos para que puedas probar el diseño sin estar logueada */}
        </NavigationContainer>
    );
}
