import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../styles/colors'; // Usando tus colores
import { signUp } from '../../services/authService';

export default function LoginScreen({ navigation }) {
    const pruebaRegistro = async () => {
        console.log("Probando conexión...");
        const resultado = await signUp("test_bloom@gmail.com", "123456");

        if (resultado.user) {
            Alert.alert("✅ Éxito", "¡Usuario creado en Firebase!");
            console.log("Usuario:", resultado.user.email);
        } else {
            Alert.alert("❌ Error", resultado.error);
            console.log("Error:", resultado.error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bloom</Text>

            <View style={styles.card}>
                <Text style={styles.subtitle}>Bienvenida a tu espacio</Text>

                <TouchableOpacity style={styles.button} onPress={pruebaRegistro}>
                    <Text style={styles.buttonText}>Probar Registro (Firebase)</Text>
                </TouchableOpacity>

                {/* Botón de prueba para navegar a Registro */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.buttonText}>Ir a Registro</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.fondo, // Tu color de fondo
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 42,
        color: Colors.botones, // Tu color lavanda
        fontWeight: 'bold',
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)', // Un toque de transparencia
        padding: 30,
        borderRadius: 20,
        width: '80%',
        alignItems: 'center',
    },
    subtitle: {
        color: Colors.texto,
        marginBottom: 20,
    },
    button: {
        backgroundColor: Colors.botones,
        padding: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.fondo,
        fontWeight: 'bold',
    }
});