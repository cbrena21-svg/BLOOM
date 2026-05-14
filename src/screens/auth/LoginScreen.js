import React, { useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';

// Importamos tus herramientas globales
import { Colors } from '../../styles/colors';
import { useAuth } from '../../hooks/useAuth';
import { login } from '../../services/authService'; // Usamos la función de login

export default function LoginScreen({ navigation }) {
    // 1. Estados: Solo necesitamos Email y Password
    const { loginConGoogle, isReady } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // 2. Lógica de Login con Email (Usando tu servicio Pro)
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Campos incompletos', 'Por favor, ingresa tu correo y contraseña.');
            return;
        }

        setLoading(true);
        const respuesta = await login(email, password);

        if (respuesta.success) {
            // El RootNavigator detectará al usuario y nos mandará al Home
            console.log("Sesión iniciada correctamente");
        } else {
            // Muestra el error traducido (ej: "Correo o contraseña incorrectos")
            Alert.alert('Error de acceso', respuesta.error);
        }
        setLoading(false);
    };

    // 3. Lógica de Google (Reutilizamos la misma lógica)
    const handleGooglePress = async () => {
        setLoading(true);
        const resultado = await loginConGoogle();
        if (resultado.error && resultado.error !== "Inicio de sesión cancelado") {
            Alert.alert("Error con Google", resultado.error);
        }
        setLoading(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container} bounces={false}>
            {/* Fondo y Logo igual al SignUp */}
            <Image
                source={require('../../../assets/images/CircleLayer.png')}
                style={styles.blurBackground}
            />
            <Image
                source={require('../../../assets/icons/Group_35.png')}
                style={styles.LogoPrincipal}
                resizeMode="contain"
            />

            <Text style={styles.title}>Bienvenida de nuevo</Text>
            <Text style={styles.text}>Retoma tu equilibrio</Text>

            {/* Formulario de Inicio de Sesión */}
            <View style = {styles.formContainer}>
            <TextInput
                placeholder="Correo electrónico"
                style={styles.input}
                placeholderTextColor={Colors.textoSecundario}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Contraseña"
                style={styles.input}
                placeholderTextColor={Colors.textoSecundario}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            {/* Enlace de Olvidé mi contraseña */}
            <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotContainer}
            >
                <Text style={styles.forgotText}>¿Has olvidado tu contraseña?</Text>
            </TouchableOpacity>
            </View>

            {/* Botón de Google */}
            <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGooglePress}
                disabled={!isReady || loading}
            >
                <Image
                    source={require('../../../assets/icons/GoogleIcon.png')}
                    style={styles.GoogleIcon}
                    resizeMode="contain"
                />
                <Text style={styles.googleButtonText}>Iniciar sesión con Google</Text>
            </TouchableOpacity>

            {/* Enlace para ir al Registro */}
            <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                style={styles.linkContainer}
            >
                <Text style={styles.textNormal}>¿No tienes cuenta?
                    <Text style={styles.textLink}> Regístrate</Text>
                </Text>
            </TouchableOpacity>

            {/* Botón Principal de Iniciar Sesión */}
            <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.loginButtonText}>INICIAR SESIÓN</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

// Mismos estilos que SignUp para consistencia total
const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.fondo,
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    blurBackground: {
        position: 'absolute',
        top: -10,
        right: -30,
        width: 280,
        height: 280,
        zIndex: -1,
    },
    LogoPrincipal: {
        width: 280,
        height: 130,
        marginTop: 40,
    },
    title: {
        fontSize: 22,
        color: Colors.textoPrincipal,
        fontWeight: 'bold',
        marginBottom: 5
    },
    text: {
        color: Colors.textoSecundario,
        marginBottom: 30,
        fontSize: 16,
    },
        formContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    input: {
        backgroundColor: Colors.tarjetas,
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        width: '90%',
        color: Colors.textoPrincipal,
        marginTop: 10,
    },
    forgotContainer: {
        alignSelf: 'flex-end',
        marginRight: '5%',
        marginBottom: 20,
    },
    forgotText: {
        color: Colors.textoSecundario,
        fontSize: 13,
        textDecorationLine: 'underline',
    },
    googleButton: {
        width: '90%',
        backgroundColor: Colors.tarjetas,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 50,
        marginTop: 10,
    },
    GoogleIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    googleButtonText: {
        color: "#fff",
        fontSize: 14,
    },
    loginButton: {
        width: '60%',
        marginTop: 10,
        marginBottom: 40,
        backgroundColor: Colors.botones,
        borderRadius: 50,
        padding: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    linkContainer: {
        padding: 15,
    },
    textNormal: {
        color: "#fff",
        fontSize: 13,
    },
    textLink: {
        color: Colors.folicular || '#FFC0CB',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});