import React from 'react'; // Trae las herramientas de React.
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Trae el sistema de "pilas" (una pantalla sobre otra).

// Importamos tus diseños de pantalla
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

const Stack = createNativeStackNavigator(); // Crea el objeto "Stack". Imaginalo como una pila de cartas.

export default function AuthNavigator() {
    return (
        // Stack.Navigator es el contenedor que decide las reglas (ej: no mostrar encabezado)
        <Stack.Navigator screenOptions={{ headerShown: false }}>

            {/* Stack.Screen define cada "carta" de la pila. El 'name' es como la llamarás después */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={SignUpScreen} />

        </Stack.Navigator>
    );
}