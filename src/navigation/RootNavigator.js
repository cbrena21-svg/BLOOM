import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
// El NavigationContainer es el "Universo" donde vive toda la navegación.
import { NavigationContainer } from '@react-navigation/native';
// onAuthStateChanged es el "vigilante" de Firebase que nos avisa si hay alguien logueado.
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
// Importamos los mapas de rutas
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

import { Colors } from '../styles/colors';


/**
 * RootNavigator:
 * Es el cerebro jerárquico de Bloom. Decide qué "Mundo" mostrar:
 * El mundo de Autenticación (Login/Registro) o el mundo de la App (Home/Calendario).
 */
export default function RootNavigator() {
    // 1. ESTADOS
    // user: Guarda la información del usuario si está logueado. Si es null, no hay nadie.
    const [user, setUser] = useState(null);
    // loading: Nos dice si Firebase todavía está "pensando" o verificando la sesión.
    const [loading, setLoading] = useState(true);

    // 2. EL VIGILANTE (Efecto de suscripción)
    useEffect(() => {
        /**
         * onAuthStateChanged se activa cada vez que:
         * - Se abre la app.
         * - Alguien hace Login.
         * - Alguien hace Logout.
         * - Se cierra la app.
         */
        const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
            if (authenticatedUser) {
                // Si Firebase dice que hay usuario, lo guardamos en el estado.
                setUser(authenticatedUser);
            } else {
                // Si no hay nadie, nos aseguramos de que el estado sea null.
                setUser(null);
            }
            // Una vez que Firebase respondió (con usuario o sin él), dejamos de cargar.
            setLoading(false);
        });

        // Limpieza: Cuando el componente se destruye, dejamos de escuchar a Firebase.
        return unsubscribe;
    }, []);

    // 3. PANTALLA DE CARGA (Intermedio)
    // Mientras Firebase verifica la sesión, mostramos un círculo de carga.
    // Esto evita que la usuaria vea un "flash" de la pantalla de login antes de entrar al Home.
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.botones} />
            </View>
        );
    }

    // 4. EL GRAN INTERRUPTOR (La lógica de decisión)
    return (
        <NavigationContainer>
            {/* ¿Hay un usuario en el estado? 
                SI: Muestra el AppNavigator (Donde está el Home).
                NO: Muestra el AuthNavigator (Donde está el Login).
            */}
            {user ? (
                <AppNavigator />
            ) : (
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
}

// Estilos para que la carga se vea centrada y profesional.
const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.fondo || '#000', // Usamos tu color de fondo
    },
});