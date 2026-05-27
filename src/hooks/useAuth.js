import { useState, useEffect } from "react";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { Alert } from "react-native";

export const useAuth = () => {
    // 1. Configuración de la petición de Google.
    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: "TU_ID_DE_IOS.apps.googleusercontent.com",
        androidClientId: "TU_ID_DE_ANDROID.apps.googleusercontent.com",
        expoClientId: "TU_ID_DE_EXPO_GO.apps.googleusercontent.com",
    });

    const loginConGoogle = async () => {
        try {
            //Dispara la interfaz del sistema 
            const result = await promptAsync();

            // Verificamos si la usuaria cerró la ventana o si hubo éxito
            if (result?.type === "success") {
                // Extraemos el ID Token
                const { id_token } = result.params;
                const credential = GoogleAuthProvider.credential(id_token);

                // Iniciamos sesión en Firebase usando esa credencial de Google
                const userCredential = await signInWithCredential(auth, credential);

                // Retornamos el usuario para que la pantalla sepa que todo salió bien
                return { user: userCredential.user, error: null };
            } else {
                // Si el usuario cancela o cierra la ventana, cancelamos.
                return { user: null, error: "Inicio de sesión cancelado" };
            }
        } catch (error) {
            console.error("Error detallado en login con Google:", error);
            Alert.alert(
                "Error de Conexión",
                "No pudimos conectar con tu cuenta de Google en este momento."
            );

            return { user: null, error: error.message };
        }
    };

    return {
        loginConGoogle,
        isReady: !!request,
    };
};