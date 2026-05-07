import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { auth } from '../../services/firebaseConfig';
import { logout } from '../../services/authService';
import { Colors } from '../../styles/colors';

export default function HomeScreen() {

    const handleLogout = async () => {
        await logout();
        // Al cerrar sesión, RootNavigator nos sacará de aquí solito.
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>¡Bienvenida a Bloom!</Text>
            {/* Aquí usamos el displayName que guardamos en el SignUp */}
            <Text style={styles.userText}>Hola, {auth.currentUser?.displayName || 'Usuaria'}</Text>

            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    userText: {
        color: Colors.textoSecundario || '#ccc',
        fontSize: 18,
        marginVertical: 20,
    },
    button: {
        backgroundColor: Colors.botones || '#6200ee',
        padding: 15,
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});