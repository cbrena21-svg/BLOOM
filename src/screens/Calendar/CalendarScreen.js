import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../styles/colors';
import BottomNavigation from '../../components/common/BottomNavigationBar';

import { obtenerPerfilUsuario } from '../../services/firebaseConfig';
import {
    getMonthWithPhases,
    getMonthName,
    getYear
} from '../../utils/dateHelpers';
import dayjs from 'dayjs';

const phases = {
    menstrual: Colors.menstrual,
    folicular: Colors.folicular,
    ovulatoria: Colors.ovulacion,
    lutea: Colors.lutea,
};

const phaseLabels = {
    menstrual: 'Menstrual',
    folicular: 'Folicular',
    ovulatoria: 'Ovulatoria',
    lutea: 'Lútea',
};

const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function CalendarScreen() {
    const [filters, setFilters] = useState({
        menstrual: true,
        folicular: true,
        ovulatoria: true,
        lutea: true,
    });

    const [monthDays, setMonthDays] = useState([]);
    const [monthName, setMonthName] = useState('');
    const [year, setYear] = useState(2026);
    const [loading, setLoading] = useState(true);

    const [userProfile, setUserProfile] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const resultado = await obtenerPerfilUsuario();
                if (resultado.success && resultado.data) {
                    setUserProfile(resultado.data);
                }
            } catch (error) {
                console.error('Error cargando datos del usuario:', error);
            } finally {
                setLoading(false);
            }
        };
        loadUserProfile();
    }, []);

    useEffect(() => {
        if (userProfile) {
            setMonthName(getMonthName(currentMonth));
            setYear(getYear(currentMonth));

            const daysWithPhases = getMonthWithPhases(currentMonth, userProfile);
            setMonthDays(daysWithPhases);
        }
    }, [currentMonth, userProfile]);

    const handlePrevMonth = () => {
        setCurrentMonth(currentMonth.subtract(1, 'month'));
    };

    const handleNextMonth = () => {
        setCurrentMonth(currentMonth.add(1, 'month'));
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.botones || '#6A5ACD'} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Calendario</Text>

                {/* Filtros horizontales dinámicos */}
                <View style={styles.filters}>
                    {Object.keys(filters).map(key => (
                        <TouchableOpacity
                            key={key}
                            style={[
                                styles.filter,
                                {
                                    backgroundColor: filters[key] ? phases[key] : '#252542',
                                },
                            ]}
                            onPress={() => {
                                setFilters({
                                    ...filters,
                                    [key]: !filters[key],
                                });
                            }}
                        >
                            <Text style={styles.filterText}>
                                {phaseLabels[key]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tarjeta del calendario */}
                <View style={styles.calendarCard}>

                    {/* Contenedor de título con flechas de navegación */}
                    <View style={styles.navigationHeader}>
                        <TouchableOpacity onPress={handlePrevMonth} style={styles.navArrow}>
                            <Text style={styles.arrowText}>◀</Text>
                        </TouchableOpacity>

                        <Text style={styles.monthTitle}>{monthName} {year}</Text>

                        <TouchableOpacity onPress={handleNextMonth} style={styles.navArrow}>
                            <Text style={styles.arrowText}>▶</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Cabecera de días */}
                    <View style={styles.weekdaysContainer}>
                        {weekdays.map((day, index) => (
                            <Text key={index} style={styles.weekdayText}>{day}</Text>
                        ))}
                    </View>

                    {/* Matriz de días */}
                    <View style={styles.calendarGrid}>
                        {monthDays.map((dayItem, index) => {
                            const phase = dayItem.phase;
                            const mostrarColor = phase && filters[phase];

                            // 🌟 CAMBIO VISUAL 2: Si es el día de ovulación exacto, forzamos un azul/morado eléctrico destacado
                            let circleColor = mostrarColor ? phases[phase] : '#252542';
                            if (dayItem.isOvulationDay && mostrarColor) {
                                circleColor = '#6366F1'; // Azul Índigo Eléctrico potente
                            }

                            return (
                                <View key={index} style={styles.dayCell}>
                                    {dayItem.day ? (
                                        <View style={styles.cellContainer}>

                                            {/* Círculo base del día */}
                                            <View
                                                style={[
                                                    styles.dayCircle,
                                                    {
                                                        backgroundColor: circleColor,
                                                        borderWidth: dayItem.isToday ? 2 : 0,
                                                        borderColor: dayItem.isToday ? 'white' : 'transparent',
                                                    },
                                                    // Si es el pico de ovulación, agregamos un borde exterior estilizado de destaque
                                                    dayItem.isOvulationDay && mostrarColor && styles.ovulationPeakRing
                                                ]}
                                            >
                                                <Text style={styles.dayText}>{dayItem.day}</Text>
                                            </View>

                                            {/* 🌟 CAMBIO VISUAL 1: Día del ciclo limpio flotando ABAJO del círculo */}
                                            <Text style={styles.cycleDayText}>
                                                {dayItem.cycleDay}
                                            </Text>

                                        </View>
                                    ) : (
                                        <View style={styles.dayCell} />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            <BottomNavigation />
        </SafeAreaView>
    );
}

const screenWidth = Dimensions.get('window').width;
const cardPadding = 20;
const gridWidth = screenWidth - (20 * 2) - (cardPadding * 2);
const cellWidth = gridWidth / 7;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.fondo || '#0D0D1E' },
    scrollContent: { padding: 20, paddingBottom: 130 },
    title: { color: 'white', fontSize: 30, fontWeight: 'bold', marginBottom: 25, marginTop: 10 },
    filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 30, width: '100%' },
    filter: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    filterText: { color: 'white', fontWeight: '600', fontSize: 14 },
    calendarCard: { backgroundColor: Colors.tarjetas || '#1A1A30', borderRadius: 20, padding: cardPadding, width: '100%', alignItems: 'center' },

    navigationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    navArrow: {
        padding: 10,
        backgroundColor: '#252542',
        borderRadius: 10,
    },
    arrowText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    monthTitle: { color: 'white', fontSize: 18, fontWeight: '700', textTransform: 'capitalize' },

    weekdaysContainer: { flexDirection: 'row', width: '100%', marginBottom: 15, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 10 },
    weekdayText: { width: cellWidth, textAlign: 'center', color: Colors.textoSecundario || '#A0A0C0', fontWeight: '600', fontSize: 13 },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },

    // Le aumentamos la altura a la celda para dar espacio al número de ciclo flotante
    dayCell: { width: cellWidth, height: cellWidth + 12, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    cellContainer: { alignItems: 'center', justifyContent: 'center' },
    dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    dayText: { color: 'white', fontWeight: '700', fontSize: 14 },

    // Anillo exterior estilizado de destaque clínico para el día exacto de ovulación
    ovulationPeakRing: {
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },

    // Estilo del número de ciclo flotando abajo (Limpio, atenuado y sin letras extra)
    cycleDayText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: '500',
        marginTop: 4
    },
});