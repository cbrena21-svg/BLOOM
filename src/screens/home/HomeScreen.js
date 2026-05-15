import React, { useState } from 'react';
import {View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Image} from 'react-native';

import CycleCircle from '../../components/Cycle/CycleCircle';
import MoonPhase from '../../components/Cycle/MoonPhase';
import EnergyBar from '../../components/Cycle/EnergyBar';
import BottomNavigation from '../../components/common/BottomNavigationBar';
import { useCyclePhase } from '../../hooks/useCyclePhase';
import { Colors } from '../../styles/colors';
import { phases } from '../../data/phases';
import { logout } from '../../services/authService';

export default function HomeScreen() {
    const [day, setDay] = useState(1);

    const currentPhase = useCyclePhase(day);

    const handleLogout = async () => {
        const result = await logout();
        if (!result.success) {
            Alert.alert('Error', result.error || 'No se pudo cerrar la sesión');
            return;
        }
        // Al cerrar sesión, RootNavigator nos sacará de aquí solito.
    };
    return (
    <SafeAreaView style={styles.container}>
        <Image source={require('../../../assets/images/CircleLayer.png')} style={styles.blurBackground}/>
        <View style = {styles.logoContainer}>
            <Image source={require('../../../assets/icons/Group_35.png')} style={styles.LogoPrincipal} resizeMode="contain"/>
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
    fontSize: 38,
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
    fontSize: 20,
    textAlign: 'center',
    width: '80%',
    marginTop: 15,
    opacity: 0.85,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});