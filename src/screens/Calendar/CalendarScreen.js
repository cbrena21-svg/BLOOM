import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Colors } from '../../styles/colors';
import BottomNavigation from '../../components/common/BottomNavigationBar';
import { getLastPeriodDate, getCycleLength } from '../../services/storageService';
import { 
    getMonthWithPhases,
    getMonthName,
    getYear,
    getTodayDay 
} from '../../utils/dateHelpers';
import dayjs from 'dayjs';
import { auth } from '../../services/firebaseConfig';

const phases = {
    menstrual: Colors.menstrual,
    follicular: Colors.folicular,
    ovulacion: Colors.ovulacion,
    lutea: Colors.lutea,
};

// Diccionario para mostrar los textos bonitos en español como en la imagen
const phaseLabels = {
    menstrual: 'Menstrual',
    follicular: 'Folicular',
    ovulacion: 'Ovulatoria',
    lutea: 'Lútea',
};

const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function CalendarScreen() {
    const [filters, setFilters] = useState({
        menstrual: true,
        follicular: true,
        ovulacion: true,
        lutea: true,
    });

    const [monthDays, setMonthDays] = useState([]);
    const [monthName, setMonthName] = useState('Mayo');
    const [year, setYear] = useState(2026);
    const [todayDay, setTodayDay] = useState(getTodayDay());
    const [lastPeriodDate, setLastPeriodDate] = useState(null);
    const [cycleLength, setCycleLength] = useState(28);

    useEffect(() => {
        const loadCalendarData = async () => {
            try {
                const userId = auth.currentUser?.uid;
                const lastPeriodResult = await getLastPeriodDate(userId);
                const cycleResult = await getCycleLength(userId);

                if (lastPeriodResult.success && lastPeriodResult.data) {
                    setLastPeriodDate(lastPeriodResult.data);
                    setCycleLength(cycleResult.data || 28);

                    const today = dayjs();
                    setMonthName(getMonthName(today));
                    setYear(getYear(today));
                    setTodayDay(getTodayDay());

                    // Calcular los días del mes con fases
                    const daysWithPhases = getMonthWithPhases(today, lastPeriodResult.data, cycleResult.data || 28);
                    setMonthDays(daysWithPhases);
                }
            } catch (error) {
                console.error('Error loading calendar data:', error);
            }
        };

        loadCalendarData();
    }, []);

    const getPhase = day => {
        if (day <= 5) return 'menstrual';
        if (day <= 13) return 'follicular';
        if (day <= 16) return 'ovulatory';
        return 'luteal';
    };

    const getDayPhase = (dayItem) => {
        if (!dayItem.day) return null;
        return dayItem.phase;
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Calendario</Text>

                {/* Filtros horizontales idénticos a la imagen */}
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
                
                {/* Contenedor principal del calendario estilo tarjeta */}
                <View style={styles.calendarCard}>
                    {/* Encabezado del mes */}
                    <Text style={styles.monthTitle}>{monthName} {year}</Text>

                    {/* Días de la semana (L, M, M, J, V, S, D) */}
                    <View style={styles.weekdaysContainer}>
                        {weekdays.map((day, index) => (
                            <Text key={index} style={styles.weekdayText}>{day}</Text>
                        ))}
                    </View>

                    {/* Cuadrícula de los días numéricos */}
                    <View style={styles.calendarGrid}>
                        {monthDays.map((dayItem, index) => {
                            const phase = getDayPhase(dayItem);
                            const phaseColor = phase ? 
                                (phase === 'menstrual' ? Colors.menstrual :
                                    phase === 'follicular' ? Colors.folicular :
                                    phase === 'ovulacion' ? Colors.ovulacion :
                                    Colors.lutea) 
                                : '#252542';

                            return (
                                <View key={index} style={styles.dayCell}>
                                    {dayItem.day ? (
                                        <View
                                            style={[
                                                styles.dayCircle,
                                                {
                                                    backgroundColor: filters[phase] ? phaseColor : '#252542',
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

// Cálculo matemático para que los 7 días ocupen exactamente el ancho disponible de forma simétrica
const screenWidth = Dimensions.get('window').width;
const cardPadding = 20;
const gridWidth = screenWidth - (20 * 2) - (cardPadding * 2); // Ajustado al padding de la tarjeta
const cellWidth = gridWidth / 7;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.fondo,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 130,
    },
    title: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 25,
        marginTop: 10,
    },
    filters: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 30,
        width: '100%',
    },
    filter: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    filterText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    calendarCard: {
        backgroundColor: Colors.tarjetas || '#1A1A30', // Usa el color de fondo de tus inputs/tarjetas
        borderRadius: 20,
        padding: cardPadding,
        width: '100%',
        alignItems: 'center',
    },
    monthTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
        alignSelf: 'flex-start',
        paddingLeft: 5,
    },
    weekdaysContainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingBottom: 10,
    },
    weekdayText: {
        width: cellWidth,
        textAlign: 'center',
        color: Colors.textoSecundario || '#A0A0C0',
        fontWeight: '600',
        fontSize: 13,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
    },
    dayCell: {
        width: cellWidth,
        height: cellWidth, // Celda cuadrada perfecta
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    dayCircle: {
        width: 38, // Tamaño estilizado para que respire espacio entre círculos
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
});