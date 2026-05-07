import { useState, useEffect } from "react";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { Alert } from "react-native";

/**
 * HOOK: useAuth
 * Este hook es una "herramienta empaquetada" que contiene toda la lógica 
 * necesaria para hablar con los servidores de Google y luego con Firebase.
 */
export const useAuth = () => {
    // 1. Configuración de la petición de Google.
    // Aquí es donde Expo prepara el "túnel" de comunicación.
    const [request, response, promptAsync] = Google.useAuthRequest({
        // IMPORTANTE: Se deben usar los IDs completos que terminan en .apps.googleusercontent.com
        // Estos se obtienen en la consola de Google Cloud (GCP) vinculada a tu Firebase.
        iosClientId: "TU_ID_DE_IOS.apps.googleusercontent.com",
        androidClientId: "TU_ID_DE_ANDROID.apps.googleusercontent.com",
        // El expoClientId es fundamental para probar la app en "Expo Go" antes de publicarla.
        expoClientId: "TU_ID_DE_EXPO_GO.apps.googleusercontent.com",
    });

    /**
     * loginConGoogle:
     * Es la función principal que llamarás desde el botón en LoginScreen o SignupScreen.
     */
    const loginConGoogle = async () => {
        try {
            // A. Dispara la interfaz del sistema (la ventanita que pregunta "¿Quieres usar google.com?")
            const result = await promptAsync();

            // B. Verificamos si la usuaria cerró la ventana o si hubo éxito
            if (result?.type === "success") {
                // Extraemos el ID Token (la llave que nos da Google para probar quién es el usuario)
                const { id_token } = result.params;

                // C. Convertimos esa llave de Google en una "Credencial" que Firebase pueda entender
                const credential = GoogleAuthProvider.credential(id_token);

                // D. Iniciamos sesión en Firebase usando esa credencial de Google
                // Esto crea el usuario en la pestaña "Authentication" de tu consola de Firebase
                const userCredential = await signInWithCredential(auth, credential);

                // Retornamos el usuario para que la pantalla sepa que todo salió bien
                return { user: userCredential.user, error: null };
            } else {
                // Si el usuario cancela o cierra la ventana, no mandamos error técnico, solo cancelamos.
                return { user: null, error: "Inicio de sesión cancelado" };
            }
        } catch (error) {
            // Log detallado para que ustedes como desarrolladoras vean qué falló exactamente
            console.error("Error detallado en login con Google:", error);

            // Mensaje amigable para la usuaria de Bloom
            Alert.alert(
                "Error de Conexión",
                "No pudimos conectar con tu cuenta de Google en este momento."
            );

            return { user: null, error: error.message };
        }
    };

    return {
        loginConGoogle, // La función que ejecuta el proceso
        isReady: !!request, // Un booleano que dice si el botón ya puede presionarse (true/false)
    };
};