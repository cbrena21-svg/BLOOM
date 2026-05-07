import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importamos las pantallas principales (las que son para usuarias logueadas)
// Asegúrate de tener este archivo creado en esa ruta
import HomeScreen from '../screens/home/HomeScreen';

const Stack = createNativeStackNavigator();

/**
 * AppNavigator:
 * Este es el mapa de navegación interno. Aquí solo entran personas
 * que ya pasaron por el Login o Registro.
 */
export default function AppNavigator() {
    return (
        <Stack.Navigator
            // En la App, la primera pantalla suele ser el Home.
            initialRouteName="Home"
            screenOptions={{
                headerShown: false, // Seguimos usando nuestro propio diseño de Bloom
                animation: 'fade',  // Una transición más suave (desvanecido) para la entrada principal
                contentStyle: { backgroundColor: '#000' }
            }}
        >
            {/* Pantalla principal de la App */}
            <Stack.Screen
                name="Home"
                component={HomeScreen}
            />

            {/* Aquí irás agregando más como:
                <Stack.Screen name="Calendar" component={CalendarScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} /> 
            */}

        </Stack.Navigator>
    );
}