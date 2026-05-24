import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    Alert,
    Image, // 🌟 Para el logo
    Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../styles/colors';
import BottomNavigation from '../../components/common/BottomNavigationBar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db, auth } from '../../services/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
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
    const [showDatePicker, setShowDatePicker] = useState(false);

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

    const handlePrevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
    const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));
    const handleEditPeriod = () => setShowDatePicker(true);

    const onDateChange = async (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setLoading(true);
            const fechaInicioString = dayjs(selectedDate).format('YYYY-MM-DD');
            const M = Number(userProfile?.inp_period_length) || 5;
            const fechaFinString = dayjs(selectedDate).add(M - 1, 'day').format('YYYY-MM-DD');

            try {
                const uid = auth.currentUser?.uid;
                const userDocRef = doc(db, 'users', uid);
                const historialActual = userProfile?.periods_history || [];
                const mesSeleccionadoStr = dayjs(selectedDate).format('YYYY-MM');
                const historialFiltrado = historialActual.filter(item => !item.startDate.startsWith(mesSeleccionadoStr));

                const nuevoRegistroPeriodo = {
                    startDate: fechaInicioString,
                    endDate: fechaFinString,
                    duration: M
                };

                const nuevoHistorialActualizado = [...historialFiltrado, nuevoRegistroPeriodo].sort(
                    (a, b) => dayjs(a.startDate).diff(dayjs(b.startDate))
                );

                const ultimoPeriodoRegistrado = nuevoHistorialActualizado[nuevoHistorialActualizado.length - 1];
                const nuevoLmpGlobal = ultimoPeriodoRegistrado ? ultimoPeriodoRegistrado.startDate : fechaInicioString;

                await updateDoc(userDocRef, {
                    periods_history: nuevoHistorialActualizado,
                    inp_lmp_date: nuevoLmpGlobal
                });

                setUserProfile({
                    ...userProfile,
                    periods_history: nuevoHistorialActualizado,
                    inp_lmp_date: nuevoLmpGlobal
                });
                Alert.alert("¡Guardado!", "Tu ciclo ha sido actualizado.");
            } catch (error) {
                Alert.alert("Error", "No se pudo conectar con el servidor.");
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.botones || '#6A5ACD'} />
            </SafeAreaView>
        );
    }

    const isArtificial = userProfile?.user_profile === 'ARTIFICIAL';
    const filtradoLlaves = isArtificial ? ['menstrual'] : Object.keys(filters);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            {/* 🌟 LOGO BLOOM SUPERIOR */}
            <View style={styles.logoContainer}>
                <Image
                    source={require('../../../assets/icons/Group_35.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            {/* Selector de fecha nativo */}
            {showDatePicker && (
                <DateTimePicker
                    value={currentMonth.toDate() > new Date() ? new Date() : currentMonth.toDate()}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={onDateChange}
                />
            )}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 🌟 FILTROS DESLIZABLES HORIZONTALES */}
                <View style={styles.filterWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtersHorizontal}
                    >
                        {filtradoLlaves.map(key => (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles.filterPill,
                                    { backgroundColor: filters[key] ? phases[key] : 'rgba(255,255,255,0.05)' }
                                ]}
                                onPress={() => setFilters({ ...filters, [key]: !filters[key] })}
                            >
                                <View style={[styles.dot, { backgroundColor: filters[key] ? 'white' : phases[key] }]} />
                                <Text style={styles.filterText}>{phaseLabels[key]}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* HEADER DE NAVEGACIÓN */}
                <View style={styles.navigationHeader}>
                    <TouchableOpacity onPress={handlePrevMonth} style={styles.navArrow}>
                        <Text style={styles.arrowText}>◀</Text>
                    </TouchableOpacity>
                    <Text style={styles.monthTitle}>{monthName} {year}</Text>
                    <TouchableOpacity onPress={handleNextMonth} style={styles.navArrow}>
                        <Text style={styles.arrowText}>▶</Text>
                    </TouchableOpacity>
                </View>

                {/* CALENDARIO */}
                <View style={styles.calendarCard}>
                    <View style={styles.weekdaysContainer}>
                        {weekdays.map((day, index) => (
                            <Text key={index} style={styles.weekdayText}>{day}</Text>
                        ))}
                    </View>

                    <View style={styles.calendarGrid}>
                        {monthDays.map((dayItem, index) => {
                            const phase = dayItem.phase;
                            const mostrarColor = phase && filters[phase];
                            let circleColor = mostrarColor ? phases[phase] : 'transparent';

                            return (
                                <View key={index} style={styles.dayCell}>
                                    {dayItem.day ? (
                                        <View style={styles.cellContent}>

                                            {/* 🌟 DÍA DEL CICLO (Esquina) */}
                                            <Text style={styles.cycleDayCorner}>
                                                {dayItem.cycleDay}
                                            </Text>

                                            {/* Círculo del día */}
                                            <View style={[
                                                styles.dayCircle,
                                                { backgroundColor: circleColor },
                                                dayItem.isToday && styles.todayHighlight,
                                            ]}>
                                                <Text style={[styles.dayText, dayItem.isToday && { color: 'white' }]}>
                                                    {dayItem.day}
                                                </Text>
                                            </View>

                                            {/* 🌟 LA LUNA DE OVULACIÓN */}
                                            {dayItem.isOvulationDay && mostrarColor && !isArtificial && (
                                                <View style={styles.moonIcon}>
                                                    <View style={styles.fullMoon} />
                                                </View>
                                            )}

                                        </View>
                                    ) : null}
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* 🌟 BOTÓN EDITAR ABAJO (Estilo Figma) */}
                <TouchableOpacity style={styles.mainEditButton} onPress={handleEditPeriod}>
                    <Text style={styles.mainEditButtonText}>Editar fechas de periodo</Text>
                </TouchableOpacity>

            </ScrollView>

            <BottomNavigation />
        </SafeAreaView>
    );
}

const screenWidth = Dimensions.get('window').width;
const cellWidth = (screenWidth - 60) / 7;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.fondo || '#0D0D1E'
    },
    logoContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    logo: {
        width: 140,
        height: 40,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 150
    },
    filterWrapper: {
        marginVertical: 15,
    },
    filtersHorizontal: {
        paddingRight: 20,
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 8,
    },
    filterText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12
    },
    navigationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    navArrow: {
        width: 36,
        height: 36,
        backgroundColor: '#1F1E29',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowText: { color: 'white', fontSize: 10 },
    monthTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'capitalize'
    },
    calendarCard: {
        backgroundColor: '#1F1E29',
        borderRadius: 24,
        padding: 15,
        marginBottom: 30,
    },
    weekdaysContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    weekdayText: {
        width: (screenWidth - 90) / 7,
        textAlign: 'center',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: 'bold'
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: (screenWidth - 90) / 7,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    cellContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600'
    },
    todayHighlight: {
        backgroundColor: 'rgba(106, 90, 205, 0.3)', // Color Bloom con transparencia
        borderWidth: 1,
        borderColor: '#6A5ACD',
        shadowColor: '#6A5ACD',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    cycleDayCorner: {
        position: 'absolute',
        top: 0,
        right: 2,
        fontSize: 8,
        color: 'rgba(255,255,255,0.3)',
        fontWeight: 'bold'
    },
    moonIcon: {
        position: 'absolute',
        bottom: -2,
    },
    fullMoon: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFF',
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 3,
        elevation: 5,
    },
    mainEditButton: {
        backgroundColor: '#1F1E29',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 15,
        borderRadius: 20,
        alignItems: 'center',
    },
    mainEditButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    }
});