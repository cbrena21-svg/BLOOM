import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CycleCircle from '../../components/Cycle/CycleCircle';
import MoonPhase from '../../components/Cycle/MoonPhase';
import EnergyBar from '../../components/Cycle/EnergyBar';
import BottomNavigation from '../../components/common/BottomNavigationBar';
import { useCyclePhase } from '../../hooks/useCyclePhase';
import { Colors } from '../../styles/colors';
import { logout } from '../../services/authService';
import { getLastPeriodDate, getCycleLength } from '../../services/storageService';
import { getCurrentCycleDay } from '../../utils/dateHelpers';
import { auth } from '../../services/firebaseConfig';

export default function HomeScreen() {
    const [day, setDay] = useState(1);
    const [cycleLength, setCycleLength] = useState(28);

    useEffect(() => {
        const loadCycleData = async () => {
            try {
                const userId = auth.currentUser?.uid;
                const lastPeriodResult = await getLastPeriodDate(userId);
                const cycleResult = await getCycleLength(userId);

                if (lastPeriodResult.success && lastPeriodResult.data) {
                    const length = cycleResult.data || 28;
                    setCycleLength(length);
                    const currentDay = getCurrentCycleDay(lastPeriodResult.data, length);
                    setDay(currentDay);
                }
            } catch (error) {
                console.error('Error loading cycle data:', error);
            }
        };

        loadCycleData();
    }, []);

    // Obtenemos la fase actual mediante el Hook
    const phaseData = useCyclePhase(day);

    // SEGURIDAD: Si phaseData es undefined, creamos un objeto seguro temporal para que la app no explote
    const currentPhase = phaseData || {
        color: Colors.menstrual || '#FF6B6B',
        title: 'Cargando...',
        message: 'Sincronizando los datos de tu ciclo...',
        moon: 'new_moon',
        energy: 0.1
    };

    const handleLogout = async () => {
        const result = await logout();
        if (!result.success) {
            Alert.alert('Error', result.error || 'No se pudo cerrar la sesión');
            return;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Image source={require('../../../assets/images/CircleLayer.png')} style={styles.blurBackground} />

            <View style={styles.logoContainer}>
                <Image source={require('../../../assets/icons/Group_35.png')} style={styles.LogoPrincipal} resizeMode="contain" />
                <TouchableOpacity style={styles.button} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Exit</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.circleContainer}>
                <CycleCircle
                    color={currentPhase.color}
                    day={day}
                    onDayChange={setDay}
                />

                <View style={styles.moonContainer}>
                    <MoonPhase phase={currentPhase.moon} />
                </View>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.title}>{currentPhase.title}</Text>

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
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    LogoPrincipal: {
        width: 200,
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
        marginTop: 20,
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
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});