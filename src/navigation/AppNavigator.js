import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importamos las pantallas principales (las que son para usuarias logueadas)
// Asegúrate de tener este archivo creado en esa ruta
import HomeScreen from '../screens/home/HomeScreen';
import CalendarScreen from '../screens/Calendar/CalendarScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import NotificationSettingsScreen from '../screens/Analysis/AnalysisScreen';
import CycleConfigScreen from '../screens/onboarding/CycleConfigScreen';
import LastPeriodScreen from '../screens/onboarding/LastPeriodScreen';
import TrackingScreen from '../screens/tracking/TrackingScreen';

const Stack = createNativeStackNavigator();

/**
 * AppNavigator:
 * Este es el mapa de navegación interno. Aquí solo entran personas
 * que ya pasaron por el Login o Registro.
 */
export default function AppNavigator({ screenName = "Home" }) {
    return (
        <Stack.Navigator
            // La pantalla inicial puede cambiar: "LastPeriod" en primer uso, "Home" en otros casos
            initialRouteName={screenName}
            screenOptions={{
                headerShown: false, // Seguimos usando nuestro propio diseño de Bloom
                animation: 'fade',  // Una transición más suave (desvanecido) para la entrada principal
                contentStyle: { backgroundColor: '#000' }
            }}
        >
            {/* Pantalla de onboarding - configurar período */}
            <Stack.Screen
                name="LastPeriod"
                component={LastPeriodScreen}
            />

            {/* Pantalla principal de la App */}
            <Stack.Screen
                name="Home"
                component={HomeScreen}
            />

            <Stack.Screen
                name="Calendar"
                component={CalendarScreen}
            />

            <Stack.Screen
                name="Tracking"
                component={TrackingScreen}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="CycleConfig"
                component={CycleConfigScreen}
            />

            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
            />

            <Stack.Screen
                name="Analysis"
                component={NotificationSettingsScreen}
            />

            {/* Aquí irás agregando más como:
                <Stack.Screen name="Calendar" component={CalendarScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} /> 
            */}

        </Stack.Navigator>
    );
}