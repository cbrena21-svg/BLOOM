import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { getLastPeriodDate } from '../services/storageService';
import { Colors } from '../styles/colors';

export default function RootNavigator() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [firstTime, setFirstTime] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
            try {
                if (authenticatedUser) {
                    // 1. PRIMERO verificamos la base de datos de manera asíncrona
                    const lastPeriodResult = await getLastPeriodDate(authenticatedUser.uid);
                    
                    if (!lastPeriodResult.success || !lastPeriodResult.data) {
                        // Es primer uso (No hay encuesta previa guardada)
                        setFirstTime(true);
                    } else {
                        // Ya tiene datos guardados
                        setFirstTime(false);
                    }

                    // 2. HASTA QUE YA SABEMOS si es primer uso o no, guardamos al usuario.
                    // Esto evita renderizados intermedios que manden al Home por error.
                    setUser(authenticatedUser);

                } else {
                    setUser(null);
                    setFirstTime(false);
                }
            } catch (error) {
                console.error("Error comprobando onboarding:", error);
                setUser(null);
                setFirstTime(false);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.botones} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {/* El key dinámico fuerza a React Navigation a reconstruir el árbol de pantallas correctamente */}
            {user ? (
                <AppNavigator
                    key={`${user.uid}-${firstTime ? 'onboarding' : 'home'}`}
                    screenName={firstTime ? 'LastPeriod' : 'Home'}
                />
            ) : (
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.fondo || '#000',
    },
});