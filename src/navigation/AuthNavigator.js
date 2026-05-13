import React from 'react';
// Importamos la función para crear el stack de navegación nativo.
// "Native Stack" utiliza las transiciones de pantalla optimizadas de iOS y Android.
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importamos las pantallas que formarán parte del flujo.
// Asegúrate de que las rutas de los archivos sean correctas según tu carpeta.
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// 1. Inicializamos el Stack. 
// Esto nos devuelve dos componentes: Navigator y Screen.
const Stack = createNativeStackNavigator();

/**
 * AuthNavigator:
 * Este componente define el "mapa" de las pantallas que verá un usuario
 * que aún no ha iniciado sesión.
 */
export default function AuthNavigator() {
    return (
        /* 2. El contenedor principal del Stack.
            - initialRouteName: Define qué pantalla se ve primero al abrir este flujo.
            - screenOptions: Configuraciones globales para todas las pantallas del stack.
                headerShown: false -> Quitamos la barra superior blanca que pone Android/iOS por defecto,
                ya que nosotros diseñaremos nuestro propio encabezado en Figma.
        */
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right', // Animación de deslizamiento
                contentStyle: { backgroundColor: '#000' }
            }}
        >

            {/* 3. Definición de cada pantalla (Carta en la pila).
                - name: Es el "apodo" único de la ruta. Es lo que usas en navigation.navigate('Nombre').
                - component: Es el archivo de React que se va a renderizar.
            */}
            <Stack.Screen
                name="Login"
                component={LoginScreen}
            />

            <Stack.Screen
                name="Signup"
                component={SignUpScreen}
            />

            <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
            />

        </Stack.Navigator>
    );
}