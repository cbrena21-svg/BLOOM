import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    ScrollView,
    ActivityIndicator
} from 'react-native';

// Importamos tus herramientas globales
import { Colors } from '../../styles/colors';
import { useAuth } from '../../hooks/useAuth';
import { signUp } from '../../services/authService'; // <--- Tu servicio profesional

/**
 * SignUpScreen:
 * Esta es la "cara" del registro. No procesa datos, solo los recolecta
 * y los envía al authService para que él haga el trabajo sucio.
 */
export default function SignUpScreen({ navigation }) {
    // 1. Estados para capturar lo que la usuaria escribe
    const { loginConGoogle, isReady } = useAuth();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // 2. Lógica para Registro con Google
    const handleGooglePress = async () => {
        setLoading(true);
        const resultado = await loginConGoogle();

        if (resultado.error) {
            // Si hubo un error real (no cancelación), avisamos.
            if (resultado.error !== "Inicio de sesión cancelado") {
                Alert.alert("Error con Google", resultado.error);
            }
        }
        // Si hay éxito, RootNavigator detectará el cambio solo.
        setLoading(false);
    };

    // 3. Lógica para Registro con Email/Password (Usando tu servicio)
    const handleSignup = async () => {
        // A. Validaciones de UI (Antes de molestar al servidor)
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

        // B. Llamada al Servicio (La "Magia")
        // Le pasamos los datos y esperamos la respuesta limpia que programamos en authService.
        const respuesta = await signUp(email, password, username);

        if (respuesta.success) {
            Alert.alert('¡Bienvenida a Bloom!', `Tu cuenta ha sido creada, ${username}.`);
            // No navegamos manualmente; RootNavigator nos llevará al Home automáticamente.
        } else {
            // Aquí se muestra el error ya traducido por tu función "traducirError"
            Alert.alert('Error de Registro', respuesta.error);
        }

        setLoading(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container} bounces={false}>
            {/* Elementos visuales de fondo */}
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

            {/* Formulario de Entrada */}
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
            <TextInput
                placeholder="Contraseña"
                style={styles.input}
                placeholderTextColor={Colors.textoSecundario}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                placeholder="Confirmar contraseña"
                style={styles.input}
                placeholderTextColor={Colors.textoSecundario}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

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
                <Text style={styles.googleButtonText}>Registrarse con Google</Text>
            </TouchableOpacity>

            {/* Enlace para volver al Login */}
            <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.linkContainer}
            >
                <Text style={styles.textNormal}>¿Ya tienes cuenta?
                    <Text style={styles.textLink}> Inicia sesión</Text>
                </Text>
            </TouchableOpacity>

            {/* Botón de Registro Principal */}
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
        marginBottom: 10
    },
    text: {
        color: Colors.textoSecundario,
        marginBottom: 30,
        fontWeight: '350',
        fontSize: 16,
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