import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { resetPassword } from '../../services/authService';
import { Colors } from '../../styles/colors';


export default function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
            return;
        }
        setLoading(true);
        try {
            const resultado = await resetPassword(email);

            if (!resultado.success) {
                Alert.alert('Error', resultado.error || 'Ocurrió un error al solicitar el restablecimiento de contraseña');
                return;
            }

            Alert.alert('Éxito', 'Se ha enviado un correo para restablecer tu contraseña');
            navigation.navigate('Login');
        } catch (error) {
            Alert.alert('Error', error.message || 'Ocurrió un error al solicitar el restablecimiento de contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>Regresar</Text>
            </TouchableOpacity>
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
            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.subtitle}>
                No te preocupes, te ayudamos a recuperarla.
            </Text>
            <Text style={styles.subtitle}>
                Ingresa tu correo electrónico, teléfono o nombre de usuario y te enviaremos un enlace para que recuperes el acceso a tu cuenta.
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor={Colors.textoSecundario}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleForgotPassword} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ENVIAR CODIGO</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: Colors.fondo,
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
        marginBottom: 20,
        marginTop: 40,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 18,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    backButtonText: {
        color: Colors.textoSecundario,
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 20,
        color: Colors.textoPrincipal,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        lineHeight: 20,
        color: Colors.textoSecundario,
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        width: '90%',
        height: 50,
        borderColor: Colors.tarjetas,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 80,
        color: Colors.textoPrincipal,
        backgroundColor: Colors.tarjetas,
        marginTop: 30,
    },
    button: {
        width: '60%',
        marginTop: 30,
        marginBottom: 40,
        backgroundColor: Colors.botones,
        borderRadius: 50,
        padding: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});  