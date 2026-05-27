import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import { getOnboardingProfile } from '../services/storageService';

import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

import { Colors } from '../styles/colors';

export default function RootNavigator() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [firstTime, setFirstTime] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
            try {
                if (authenticatedUser) {
                    const docRef = doc(db, "users", authenticatedUser.uid);
                    const docSnap = await getDoc(docRef);

                    if (!docSnap.exists()) {
                        // Si el documento NO existe en Firestore, es su primer uso
                        setFirstTime(true);
                    } else {
                        // Si ya existe el documento, ya hizo el Onboarding
                        setFirstTime(false);
                    }

                    // Hasta que Firestore nos responde, guardamos al usuario de forma segura
                    setUser(authenticatedUser);

                } else {
                    setUser(null);
                    setFirstTime(false);
                }
            } catch (error) {
                console.error("Error comprobando onboarding en Firestore:", error);
                // Fallback: si falla la conexión a Firestore, intentamos leer el perfil local -majo profileScreen
                try {
                    if (authenticatedUser && authenticatedUser.uid) {
                        const local = await getOnboardingProfile(authenticatedUser.uid);
                        if (local.success && local.data) {
                            setFirstTime(false);
                        } else {
                            setFirstTime(true);
                        }
                        setUser(authenticatedUser);
                    } else {
                        setUser(null);
                        setFirstTime(false);
                    }
                } catch (e) {
                    console.error('Error leyendo perfil local como fallback:', e);
                    setUser(authenticatedUser || null);
                    setFirstTime(false);
                }
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.botones || '#6A5ACD'} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? (
                firstTime ? (
                    <OnboardingScreen
                        key={`onboarding-${user.uid}`}
                        onOnboardingComplete={() => setFirstTime(false)}
                    />
                ) : (
                    <AppNavigator key={`app-${user.uid}`} />
                )
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