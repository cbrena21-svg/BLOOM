import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../styles/colors';

export default function LastPeriodScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>¿Cuándo inició tu último periodo?</Text>
                <Text style={styles.subtitle}>
                    Puedes registrar la fecha ahora o hacerlo después en el calendario.
                </Text>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.secondary]}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.buttonText}>Ahora no</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.primary]}
                        onPress={() => navigation.navigate('CycleConfig')}
                    >
                        <Text style={[styles.buttonText, { color: '#0D0D1E' }]}>Registrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.fondo || '#0D0D1E', justifyContent: 'center' },
    card: { margin: 20, backgroundColor: '#1F1E29', borderRadius: 20, padding: 20, alignItems: 'center' },
    title: { color: 'white', fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
    subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', marginBottom: 20 },
    actions: { flexDirection: 'row', gap: 12 },
    button: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 14, minWidth: 110, alignItems: 'center' },
    primary: { backgroundColor: Colors.botones || '#6A5ACD' },
    secondary: { backgroundColor: 'rgba(255,255,255,0.06)' },
    buttonText: { color: 'white', fontWeight: '700' },
});
