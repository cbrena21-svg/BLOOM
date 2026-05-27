import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CycleCircle from '../../components/Cycle/CycleCircle';
import MoonPhase from '../../components/Cycle/MoonPhase';
import EnergyBar from '../../components/Cycle/EnergyBar';
import BottomNavigation from '../../components/common/BottomNavigationBar';
import { phases } from '../../data/phases';
import { Colors } from '../../styles/colors';
import { FONT_BOLD, FONT_REGULAR } from '../../styles/typography';
import { logout } from '../../services/authService';
import { getPhaseForDay, getMonthWithPhases } from '../../utils/dateHelpers';
import { auth, db } from '../../services/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import dayjs from 'dayjs';

export default function HomeScreen() {
    const [day, setDay] = useState(1);
    const [cycleLength, setCycleLength] = useState(28);
    const [userProfile, setUserProfile] = useState(null);
    const [phaseKey, setPhaseKey] = useState('menstrual');

const parseDate = (value) => {
        if (!value) return null;
        if (typeof value.toDate === 'function') return value.toDate();
        if (value.seconds) return new Date(value.seconds * 1000);

        // Usamos dayjs para interpretar correctamente el string 'YYYY-MM-DD' en la zona local
        const parsed = dayjs(value);
        return parsed.isValid() ? parsed.toDate() : null;
    };

    const getBaseLastPeriodDate = (profile) => {
        if (!profile) return null;

        const history = Array.isArray(profile.periods_history) ? profile.periods_history : [];
        if (history.length > 0) {
            const lastHistoryItem = history[history.length - 1];
            return parseDate(lastHistoryItem?.startDate);
        }

        return parseDate(profile.inp_lmp_date || profile.lastPeriodDate);
    };

    const recalculateCycleDay = useCallback((profile) => {
        const length = Number(profile?.avg_cycle_length || profile?.inp_cycle_length || 28) || 28;

        setCycleLength(length);

        if (!profile) {
            setDay(1);
            setPhaseKey('menstrual');
            return;
        }

        // Usamos el inicio del día para evitar desfases por zonas horarias
        const monthDays = getMonthWithPhases(dayjs().startOf('day'), profile);
        const todayEntry = monthDays.find((item) => item?.isToday);

        if (todayEntry?.cycleDay) {
            setDay(todayEntry.cycleDay);
            setPhaseKey(todayEntry.phase || 'menstrual');
            return;
        }

        const fallbackPhase = getPhaseForDay(1, profile, length) || 'menstrual';
        setDay(1);
        setPhaseKey(fallbackPhase);
    }, []);

    useEffect(() => {
        let unsubscribeProfile = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (unsubscribeProfile) {
                unsubscribeProfile();
                unsubscribeProfile = null;
            }

            if (!user?.uid) {
                setUserProfile(null);
                setDay(1);
                return;
            }

            const userDocRef = doc(db, 'users', user.uid);

            unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
                if (snapshot.exists()) {
                    const profileData = snapshot.data();
                    setUserProfile(profileData);
                    recalculateCycleDay(profileData);
                } else {
                    setUserProfile(null);
                    setDay(1);
                }
            });
        });

        return () => {
            if (unsubscribeProfile) {
                unsubscribeProfile();
            }
            unsubscribeAuth();
        };
    }, [recalculateCycleDay]);

    useFocusEffect(
        useCallback(() => {
            if (userProfile) {
                recalculateCycleDay(userProfile);
            }
        }, [userProfile, recalculateCycleDay])
    );

    useEffect(() => {
        if (!userProfile) return undefined;

        const updateCurrentDay = () => {
            recalculateCycleDay(userProfile);
        };

        updateCurrentDay();

        const scheduleNextUpdate = () => {
            const now = new Date();
            const nextMidnight = new Date(now);
            nextMidnight.setHours(24, 0, 0, 0);

            const timeoutId = setTimeout(() => {
                updateCurrentDay();
                scheduleNextUpdate();
            }, nextMidnight.getTime() - now.getTime());

            return timeoutId;
        };

        const timeoutId = scheduleNextUpdate();

        return () => clearTimeout(timeoutId);
    }, [userProfile, cycleLength, recalculateCycleDay]);

    const derivedPhase = getPhaseForDay(day, userProfile, cycleLength) || phaseKey;

    // SEGURIDAD: Si currentPhase es undefined, creamos un objeto seguro temporal
    const currentPhase = phases[derivedPhase] || {
        color: Colors.menstrual || '#FF6B6B',
        title: 'Cargando...',
        message: 'Sincronizando los datos de tu ciclo...',
        moon: 'new_moon',
        energy: 0.1
    };

    const circleBaseDate = getBaseLastPeriodDate(userProfile);
    // Normalizar la base al inicio del día para mantener consistencia con dateHelpers
    const circleBaseDayjs = circleBaseDate ? dayjs(circleBaseDate).startOf('day') : null;
    const circleDate = circleBaseDayjs
        ? circleBaseDayjs.add(Math.max(day - 1, 0), 'day')
        : dayjs().startOf('day');
    const dateLabel = circleDate.format('DD/MM/YYYY');

    const handleLogout = async () => {
        const result = await logout();
        if (!result.success) {
            Alert.alert('Error', result.error || 'No se pudo cerrar la sesión');
            return;
        }
    };

    const handleDayChange = (newDay) => {
        setDay(newDay);

        if (!userProfile) {
            return;
        }

        const nextPhase = getPhaseForDay(newDay, userProfile, cycleLength) || 'menstrual';
        setPhaseKey(nextPhase);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Image source={require('../../../assets/images/CircleLayer.png')} style={styles.blurBackground} />

            <View style={styles.logoContainer}>
                <Image source={require('../../../assets/icons/Group_35.png')} style={styles.LogoPrincipal} resizeMode="contain" />
            </View>

            <View style={styles.circleContainer}>
                <CycleCircle
                    color={currentPhase.color}
                    day={day}
                    onDayChange={handleDayChange}
                    cycleLength={cycleLength}
                />

                <View style={styles.moonContainer}>
                    {/* debug={true}*/}
                    <MoonPhase phase={derivedPhase === 'menstrual' ? 'quarter_waning' : currentPhase.moon} />
                </View>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.title}>{currentPhase.title}</Text>

                <Text style={styles.dateText}>{dateLabel}</Text>

                <Text style={styles.message}>
                    {currentPhase.message}
                </Text>

                <EnergyBar
                    progress={currentPhase.energy}
                    color={currentPhase.color}
                />
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
    blurBackground: {
        position: 'absolute',
        top: -10,
        right: -30,
        width: 280,
        height: 280,
        zIndex: -1,
    },
    logoContainer: {
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    LogoPrincipal: {
        width: 190,
        height: 100,
    },
    button: {
        backgroundColor: Colors.tarjetas,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    circleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    moonContainer: {
        position: 'absolute',
    },
    title: {
        color: 'white',
        fontSize: 34,
        fontWeight: '800',
        fontFamily: FONT_BOLD,
        marginTop: 10,
    },
    dateText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: 8,
        fontFamily: FONT_REGULAR,
        letterSpacing: 0.6,
    },
    formContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    message: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        width: '80%',
        marginTop: 15,
        opacity: 0.85,
        lineHeight: 22,
        fontFamily: FONT_REGULAR,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontFamily: FONT_BOLD,
    }
});