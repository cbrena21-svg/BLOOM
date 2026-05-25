import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import { Colors } from '../../styles/colors';
import { FONT_BOLD, FONT_REGULAR } from '../../styles/typography';
import BottomNavigation from '../../components/common/BottomNavigationBar';
import { auth } from '../../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { getOnboardingProfile } from '../../services/storageService';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        let unsub = null;

        const loadProfile = async (userId) => {
            const result = await getOnboardingProfile(userId);
            if (result.success && result.data) {
                setProfile(result.data);
            }
        };

        if (auth.currentUser && auth.currentUser.uid) {
            loadProfile(auth.currentUser.uid);
        } else {
            unsub = onAuthStateChanged(auth, (user) => {
                if (user && user.uid) {
                    loadProfile(user.uid);
                }
            });
        }

        return () => {
            if (unsub) unsub();
        };
    }, []);

    const formatRegularity = value => {
        if (!value) return 'No especificado';
        if (value === 'algo_irregular' || value === 'IRREGULAR') return 'Algo irregular';
        if (value === 'irregular') return 'Irregular';
        return 'Regular';
    };

    const formatBleeding = value => {
        if (!value) return 'No especificado';
        if (value === 'ligero') return 'Ligero';
        if (value === 'abundante') return 'Abundante';
        return 'Moderado';
    };

    const joinList = (list) => {
        if (!list || !Array.isArray(list) || list.length === 0) return 'Ninguno';
        return list.join(', ');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.content}>
                    <Text style={styles.title}>Perfil</Text>

                    {profile ? (
                        <>
                        <Text style={styles.sectionTitle}>Información personal</Text>
                            <View style={styles.card}>
                                <Text style={styles.label}>Edad</Text>
                                <Text style={styles.value}>{profile.inp_age || profile.age || 'No disponible'} años</Text>
                                <Text style={styles.label}>Perfil</Text>
                                <Text style={styles.value}>{profile.user_profile || 'No especificado'}</Text>
                            </View>

                        <Text style={styles.sectionTitle}>Ciclo</Text>
                            <View style={styles.card}>
                                <Text style={styles.label}>Duración del ciclo</Text>
                                <Text style={styles.value}>{profile.inp_cycle_length || profile.cycleLength || '28'} días</Text>

                                <Text style={styles.label}>Duración del periodo</Text>
                                <Text style={styles.value}>{profile.inp_period_length || profile.periodLength || 'No disponible'} días</Text>

                                <Text style={styles.label}>Último periodo</Text>
                                <Text style={styles.value}>{profile.inp_lmp_date ? dayjs(profile.inp_lmp_date).format('DD/MM/YYYY') : (profile.lastPeriodDate ? dayjs(profile.lastPeriodDate).format('DD/MM/YYYY') : 'No disponible')}</Text>
                            </View>

                                <Text style={styles.sectionTitle}>Anticonceptivos</Text>
                            <View style={styles.card}>
                                <Text style={styles.label}>Método actual</Text>
                                <Text style={styles.value}>{profile.inp_contraceptive || 'No especificado'}</Text>
                                <Text style={styles.label}>DIU de cobre</Text>
                                <Text style={styles.value}>{profile.flag_diu_cobre ? 'Sí' : 'No'}</Text>
                            </View>

                        <Text style={styles.sectionTitle}>Salud y síntomas</Text>
                            <View style={styles.card}>
                                <Text style={styles.label}>Diagnósticos</Text>
                                <Text style={styles.value}>{joinList(profile.inp_diagnoses)}</Text>
                                <Text style={styles.label}>Síntomas crónicos</Text>
                                <Text style={styles.value}>{joinList(profile.inp_chronic_symptoms)}</Text>
                            </View>
                        </>
                    ) : (
                        <Text style={styles.message}>Aún no hay datos de ciclo guardados.</Text>
                    )}
                </View>
            </ScrollView>
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
        backgroundColor: Colors.tarjetas,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.04)',
        marginBottom: 12,
    },
    sectionTitle: {
        color: Colors.textoPrincipal,
        fontSize: 18,
        fontWeight: '800',
        fontFamily: FONT_BOLD,
        marginBottom: 8,
        alignSelf: 'flex-start',
        marginTop: 24,
    },
    title: {
        color: Colors.textoPrincipal,
        fontSize: 20,
        fontWeight: '800',
        fontFamily: FONT_BOLD,
        marginBottom: 12,
        marginTop: 20, 
        alignSelf: 'flex-start',
    },
    label: {
        color: Colors.textoSecundario,
        fontSize: 13,
        marginTop: 12,
    },
    value: {
        color: Colors.textoPrincipal,
        fontSize: 18,
        fontWeight: '700',
        fontFamily: FONT_BOLD,
        marginTop: 2,
    },
    message: {
        color: Colors.textoPrincipal,
        fontSize: 18,
        textAlign: 'center',
        opacity: 0.85,
        fontFamily: FONT_REGULAR,
    },
});
