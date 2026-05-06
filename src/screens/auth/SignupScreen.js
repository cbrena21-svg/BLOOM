import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../styles/colors';

export default function SignUp({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Crear Cuenta</Text>

            <View style={styles.card}>
                <Text style={styles.text}>Aquí irá el formulario de registro</Text>

                {/* Botón para regresar al Login */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.link}
                >
                    <Text style={styles.linkText}>Ya tengo cuenta, volver</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.fondo,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        color: Colors.botones,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    card: {
        padding: 20,
        alignItems: 'center',
    },
    text: {
        color: Colors.texto,
        marginBottom: 20,
    },
    linkText: {
        color: Colors.botones,
        textDecorationLine: 'underline',
    }
});