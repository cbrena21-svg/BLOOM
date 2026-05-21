import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../styles/colors';
import BottomNavigation from '../../components/common/BottomNavigationBar';

// 1. Reemplazamos storageService por tu servicio real de Firestore
import { obtenerPerfilUsuario } from '../../services/firebaseConfig';
import {
    getMonthWithPhases,
    getMonthName,
    getYear,
    getTodayDay
} from '../../utils/dateHelpers';
import dayjs from 'dayjs';

// 🌟 ESTANDARIZACIÓN: Unificamos los nombres de las 4 fases para que todo el código hable el mismo idioma
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
    const [loading, setLoading] = useState(true); // Agregamos un estado de carga clínico

    useEffect(() => {
        const loadCalendarData = async () => {
            try {
                const resultado = await obtenerPerfilUsuario();

                if (resultado.success && resultado.data) {
                    const userProfile = resultado.data; // Obtenemos el JSON completo desde Firestore

                    const today = dayjs();
                    setMonthName(getMonthName(today));
                    setYear(getYear(today));

                    // 🌟 CAMBIO CLAVE: Le pasamos el perfil completo del usuario al helper
                    const daysWithPhases = getMonthWithPhases(today, userProfile);
                    setMonthDays(daysWithPhases);
                }
            } catch (error) {
                console.error('Error cargando datos del calendario:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCalendarData();
    }, []);

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
                                    [key]: !filters[key], // Prende y apaga la fase reduciendo el ruido visual
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
                    <Text style={styles.monthTitle}>{monthName} {year}</Text>

                    {/* Cabecera de días */}
                    <View style={styles.weekdaysContainer}>
                        {weekdays.map((day, index) => (
                            <Text key={index} style={styles.weekdayText}>{day}</Text>
                        ))}
                    </View>

                    {/* Matriz de días */}
                    <View style={styles.calendarGrid}>
                        {monthDays.map((dayItem, index) => {
                            const phase = dayItem.phase; // Viene directamente calculado desde tu helper genérico

                            // Si la fase está activa en los filtros superiores, se pinta de su color clínico; si no, queda oscura.
                            const mostrarColor = phase && filters[phase];
                            const circleColor = mostrarColor ? phases[phase] : '#252542';

                            return (
                                <View key={index} style={styles.dayCell}>
                                    {dayItem.day ? (
                                        <View
                                            style={[
                                                styles.dayCircle,
                                                {
                                                    backgroundColor: circleColor,
                                                    borderWidth: dayItem.isToday ? 2 : 0,
                                                    borderColor: dayItem.isToday ? 'white' : 'transparent',
                                                },
                                            ]}
                                        >
                                            <Text style={styles.dayText}>{dayItem.day}</Text>
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

// Arquitectura del cálculo responsivo de la cuadrícula
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
    monthTitle: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 20, alignSelf: 'flex-start', paddingLeft: 5 },
    weekdaysContainer: { flexDirection: 'row', width: '100%', marginBottom: 15, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 10 },
    weekdayText: { width: cellWidth, textAlign: 'center', color: Colors.textoSecundario || '#A0A0C0', fontWeight: '600', fontSize: 13 },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
    dayCell: { width: cellWidth, height: cellWidth, justifyContent: 'center', ExtAlign: 'center', alignItems: 'center', marginBottom: 8 },
    dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    dayText: { color: 'white', fontWeight: '600', fontSize: 14 },
});