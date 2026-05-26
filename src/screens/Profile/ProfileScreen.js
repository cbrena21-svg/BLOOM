import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import { Colors } from '../../styles/colors';
import { FONT_BOLD, FONT_REGULAR } from '../../styles/typography';
import BottomNavigation from '../../components/common/BottomNavigationBar';
import { auth } from '../../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { getOnboardingProfile } from '../../services/storageService';

export default function ProfileScreen() {
    const [profile, setProfile] = useState(null);
    const [emailRevealed, setEmailRevealed] = useState(false);

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

    const EMAIL_TRUNCATE = 25;
    const email = profile?.email || auth.currentUser?.email || '';
    const isEmailLong = email && email.length > EMAIL_TRUNCATE;
    const displayEmail = () => {
        if (!email) return 'No disponible';
        if (isEmailLong && !emailRevealed) return email.slice(0, EMAIL_TRUNCATE) + '...';
        return email;
    };

    const determineRegularity = () => {
        if (!profile) return 'No especificado';
        if (profile.flag_regularidad) return profile.flag_regularidad === 'IRREGULAR' ? 'Atípico' : 'Típico';
        const shortest = Number(profile.inp_cycle_shortest || profile.inp_cycle_length || 0);
        const longest = Number(profile.inp_cycle_longest || profile.inp_cycle_length || 0);
        if (!shortest || !longest) return 'No especificado';
        const variab = longest - shortest;
        return variab >= 8 ? 'Atípico' : 'Típico';
    };

    const formatExercise = () => {
        const v = profile?.inp_exercise_intensity || '';
        if (!v) return 'No especificado';
        if (v.toLowerCase().includes('alta')) return 'Alta';
        if (v.toLowerCase().includes('moderado')) return 'Moderado';
        if (v.toLowerCase().includes('ligero')) return 'Ligero';
        if (v.toLowerCase().includes('sedentario')) return 'Sedentario';
        return v;
    };

    const formatSleep = () => profile?.inp_sleep_quality || 'No especificado';
    const formatDigestion = () => profile?.inp_digestion_pattern || 'No especificado';
    const formatMigraine = () => profile?.inp_migraine_timing || 'No especificado';
    const formatPads = () => (profile?.inp_pads_count !== undefined ? String(profile.inp_pads_count) : 'No especificado');
    const formatClots = () => (profile?.inp_clots || 'No especificado');
    const formatStress = () => (profile?.inp_stress_level ? 'Sí' : 'No');

    return (
        <SafeAreaView style={styles.container}>
            <Image
                source={require('../../../assets/images/CircleLayer.png')}
                style={styles.blurBackground1}
            />
            <Image
                source={require('../../../assets/images/CircleLayer.png')}
                style={styles.blurBackground2}
            />
            
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <Text style={styles.title}>Perfil</Text>
                    
                    {emailRevealed && email ? (
                        <View style={styles.banner}>
                            <Text style={styles.bannerText}>{email}</Text>
                            <TouchableOpacity onPress={() => setEmailRevealed(false)} style={styles.bannerCloseBtn}>
                                <Text style={styles.bannerCloseText}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {profile ? (
                        <>
                            <Text style={styles.sectionTitle}>Información personal</Text>
                            <View style={styles.card}>
                                <View style={styles.infoBlock}>
                                    <Text style={styles.label}>Nombre</Text>
                                    <Text style={styles.value}>{profile.name || profile.displayName || auth.currentUser?.displayName || 'No disponible'}</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.infoBlock}>
                                    <Text style={styles.label}>Correo</Text>
                                    <View style={styles.emailValueRow}>
                                        {(!isEmailLong || emailRevealed) ? (
                                            <Text style={styles.value}>{displayEmail()}</Text>
                                        ) : (
                                            <TouchableOpacity onPress={() => setEmailRevealed(true)} activeOpacity={0.8}>
                                                <Text style={styles.value}>{displayEmail()}</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.infoBlock}>
                                    <Text style={styles.label}>Edad</Text>
                                    <Text style={styles.value}>{profile.inp_age || profile.age || 'No disponible'} años</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.infoBlock}>
                                    <Text style={styles.label}>Perfil</Text>
                                    <Text style={styles.value}>{profile.user_profile || 'No especificado'}</Text>
                                </View>
                            </View>

                            <Text style={styles.sectionTitle}>Ciclo</Text>
                            <View style={styles.card}>
                                <View style={styles.infoBlock}>
                                    <Text style={styles.label}>Duración del ciclo</Text>
                                    <Text style={styles.value}>{profile.inp_cycle_length || profile.cycleLength || '28'} días</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.infoBlock}>
                                    <Text style={styles.label}>Duración del periodo</Text>
                                    <Text style={styles.value}>{profile.inp_period_length || profile.periodLength || 'No disponible'} días</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.infoBlock}>
                                    <Text style={styles.label}>Último periodo</Text>
                                    <Text style={styles.value}>{profile.inp_lmp_date ? dayjs(profile.inp_lmp_date).format('DD/MM/YYYY') : (profile.lastPeriodDate ? dayjs(profile.lastPeriodDate).format('DD/MM/YYYY') : 'No disponible')}</Text>
                                </View>
                            </View>

                            <Text style={styles.sectionTitle}>Anticonceptivos</Text>
                            <View style={styles.card}>
                                <View style={styles.infoBlock}>
                                    <Text style={styles.label}>Método actual</Text>
                                    <Text style={styles.value}>{profile.inp_contraceptive || 'No especificado'}</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.infoBlock}>
                                    <Text style={styles.label}>DIU de cobre</Text>
                                    <Text style={styles.value}>{profile.flag_diu_cobre ? 'Sí' : 'No'}</Text>
                                </View>
                            </View>

                            <Text style={styles.sectionTitle}>Salud y síntomas</Text>
                            <View style={styles.card}>
                                <View style={styles.infoBlock}>
                                    <Text style={styles.label}>Diagnósticos</Text>
                                    <Text style={styles.value}>{joinList(profile.inp_diagnoses)}</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.infoBlock}>
                                    <Text style={styles.label}>Síntomas crónicos</Text>
                                    <Text style={styles.value}>{joinList(profile.inp_chronic_symptoms)}</Text>
                                </View>

                                <View style={styles.divider} />
                                <View style={styles.infoBlock}>
                                    <Text style={styles.label}>Regularidad</Text>
                                    <Text style={styles.value}>{determineRegularity()}</Text>
                                </View>

                                <View style={styles.divider} />
                                <View style={styles.infoBlock}>
                                    <Text style={styles.label}>Actividad física</Text>
                                    <Text style={styles.value}>{formatExercise()}</Text>
                                </View>
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
    scrollContainer: {
        paddingBottom: 100, // Espacio preventivo para que la barra inferior no tape las tarjetas
    },
    content: {
        width: '100%',
        paddingHorizontal: 24,
    },
    blurBackground1: {
        position: 'absolute',
        top: -10,
        right: -30,
        width: 280,
        height: 280,
        zIndex: -1,
    },
    blurBackground2: {
        position: 'absolute',
        top: 450,
        left: -30,
        width: 280,
        height: 280,
        zIndex: -1,
    },
    card: {
        width: '100%',
        backgroundColor: Colors.tarjetas,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.04)',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 8,
    },
infoBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    emailValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginVertical: 12,
    },
    sectionTitle: {
        color: Colors.textoSecundario, // Usamos el tono gris suave del subtítulo de figma
        fontSize: 18,
        fontWeight: '600',
        fontFamily: FONT_REGULAR,
        marginBottom: 10,
        alignSelf: 'flex-start',
        marginTop: 20,
    },
    title: {
        color: Colors.textoPrincipal,
        fontSize: 30,
        fontWeight: '800',
        fontFamily: FONT_REGULAR,
        marginTop: 30, 
        alignSelf: 'flex-start',
    },
    label: {
        color: Colors.textoSecundario,
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 0,
        lineHeight: 16,
    },
    value: {
        color: Colors.textoPrincipal,
        fontSize: 12,
        fontWeight: '700',
        fontFamily: FONT_REGULAR,
        lineHeight: 16,
        textAlignVertical: 'center',
    },
    message: {
        color: Colors.textoPrincipal,
        fontSize: 18,
        textAlign: 'center',
        opacity: 0.85,
        fontFamily: FONT_REGULAR,
        marginTop: 40,
    },
    banner: {
        width: '100%',
        backgroundColor: 'rgba(106,90,205,0.12)',
        borderRadius: 12,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    bannerText: {
        color: Colors.textoPrincipal,
        flex: 1,
        marginRight: 8,
    },
    bannerCloseBtn: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    bannerCloseText: {
        color: Colors.textoSecundario,
        fontSize: 13,
    }
});