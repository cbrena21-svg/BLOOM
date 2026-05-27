import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/colors';
import { FONT_REGULAR, FONT_BOLD } from '../../styles/typography';
import { useAuth } from '../../hooks/useAuth';
import { signUp } from '../../services/authService';

export default function SignUpScreen({ navigation }) {
    const { loginConGoogle, isReady } = useAuth();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Registro con Google
    const handleGooglePress = async () => {
        setLoading(true);
        const resultado = await loginConGoogle();

        if (resultado.error) {
            if (resultado.error !== "Inicio de sesión cancelado") {
                Alert.alert("Error con Google", resultado.error);
            }
        }
        // Si hay éxito, RootNavigator detectará el cambio solo.
        setLoading(false);
    };

    // Registro con Email/Password 
    const handleSignup = async () => {
        // Validaciones de UI 
        if (!email || !username || !password || !confirmPassword) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);

        // Llamada al Servicio
        // Le pasamos los datos y esperamos la respuesta
        const respuesta = await signUp(email, password, username);

        if (respuesta.success) {
            Alert.alert('¡Bienvenida a Bloom!', `Tu cuenta ha sido creada, ${username}.`);
            // RootNavigator nos llevará al Home automáticamente.
        } else {
            // error traducido
            Alert.alert('Error de Registro', respuesta.error);
        }

        setLoading(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container} bounces={false}>
            <Image
                source={require('../../../assets/images/CircleLayer.png')}
                style={styles.blurBackground}
            />
            <Image
                source={require('../../../assets/icons/Group_35.png')}
                style={styles.LogoPrincipal}
                resizeMode="contain"
            />

            <Text style={styles.title}>Crea tu cuenta</Text>
            <Text style={styles.text}>Comienza tu camino al equilibrio</Text>

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
                placeholder="Nombre de usuario"
                style={styles.input}
                placeholderTextColor={Colors.textoSecundario}
                value={username}
                onChangeText={setUsername}
            />
            <View style={styles.passwordWrapper}>
                <TextInput
                    placeholder="Contraseña"
                    style={styles.passwordInput}
                    placeholderTextColor={Colors.textoSecundario}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} style={styles.eyeButton} accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.textoSecundario} />
                </TouchableOpacity>
            </View>
            <View style={styles.passwordWrapper}>
                <TextInput
                    placeholder="Confirmar contraseña"
                    style={styles.passwordInput}
                    placeholderTextColor={Colors.textoSecundario}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)} style={styles.eyeButton} accessibilityLabel={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={Colors.textoSecundario} />
                </TouchableOpacity>
            </View>

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
                <Text style={styles.googleButtonText}>Registrarse con Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.linkContainer}
            >
                <Text style={styles.textNormal}>¿Ya tienes cuenta?
                    <Text style={styles.textLink}> Inicia sesión</Text>
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.signupButton}
                onPress={handleSignup}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.signupButtonText}>REGISTRARSE</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.fondo,
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
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
        fontFamily: FONT_BOLD,
        marginBottom: 10
    },
    text: {
        color: Colors.textoSecundario,
        marginBottom: 30,
        fontWeight: '350',
        fontFamily: FONT_REGULAR,
        fontSize: 16,
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
        fontFamily: FONT_REGULAR,
    },
    signupButton: {
        width: '60%',
        marginTop: 10,
        marginBottom: 40,
        backgroundColor: Colors.botones,
        borderRadius: 50,
        padding: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: FONT_BOLD,
    },
    linkContainer: {
        padding: 15,
    },
    textNormal: {
        color: "#fff",
        fontSize: 13,
        fontFamily: FONT_REGULAR,
    },
    textLink: {
        color: Colors.folicular || '#FFC0CB',
        fontWeight: 'bold',
        fontFamily: FONT_BOLD,
        textDecorationLine: 'underline',
    },
    input: {
        backgroundColor: Colors.tarjetas,
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        width: '90%',
        fontSize: 14,
        color: Colors.textoPrincipal,
    },
    passwordWrapper: {
        backgroundColor: Colors.tarjetas,
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        padding: 15,
    },
    passwordInput: {
        flex: 1,
        color: Colors.textoPrincipal,
        paddingVertical: 10,
    },
    eyeButton: {
        padding: 8,
    },
});