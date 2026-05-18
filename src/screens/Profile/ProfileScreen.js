import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import dayjs from 'dayjs';
import { Colors } from '../../styles/colors';
import BottomNavigation from '../../components/common/BottomNavigationBar';
import { auth } from '../../services/firebaseConfig';
import { getOnboardingProfile } from '../../services/storageService';

export default function ProfileScreen() {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            const result = await getOnboardingProfile(auth.currentUser?.uid);
            if (result.success && result.data) {
                setProfile(result.data);
            }
        };

        loadProfile();
    }, []);

    const formatRegularity = value => {
        if (value === 'algo_irregular') return 'Algo irregular';
        if (value === 'irregular') return 'Irregular';
        return 'Regular';
    };

    const formatBleeding = value => {
        if (value === 'ligero') return 'Ligero';
        if (value === 'abundante') return 'Abundante';
        return 'Moderado';
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Perfil</Text>

                {profile ? (
                    <View style={styles.card}>
                        <Text style={styles.label}>Edad</Text>
                        <Text style={styles.value}>{profile.age} años</Text>

                        <Text style={styles.label}>Duración del periodo</Text>
                        <Text style={styles.value}>{profile.periodDuration} días</Text>

                        <Text style={styles.label}>Sangrado</Text>
                        <Text style={styles.value}>{formatBleeding(profile.bleedingAmount)}</Text>

                        <Text style={styles.label}>Regularidad</Text>
                        <Text style={styles.value}>{formatRegularity(profile.cycleRegularity)}</Text>

                        <Text style={styles.label}>Último periodo</Text>
                        <Text style={styles.value}>
                            {profile.lastPeriodDate ? dayjs(profile.lastPeriodDate).format('DD/MM/YYYY') : 'No disponible'}
                        </Text>
                    </View>
                ) : (
                    <Text style={styles.message}>Aún no hay datos de ciclo guardados.</Text>
                )}
            </View>

            <BottomNavigation />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.fondo,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    title: {
        color: 'white',
        fontSize: 36,
        fontWeight: '800',
        marginBottom: 12,
    },
    label: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 13,
        marginTop: 12,
    },
    value: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        marginTop: 2,
    },
    message: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        opacity: 0.85,
    },
});
