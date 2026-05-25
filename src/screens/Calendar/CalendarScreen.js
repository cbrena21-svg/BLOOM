import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert, Image, Platform, Modal} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../styles/colors';
import { FONT_REGULAR, FONT_BOLD } from '../../styles/typography';
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
    const [selectedPeriodDate, setSelectedPeriodDate] = useState(dayjs().toDate());

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

            let daysWithPhases = getMonthWithPhases(currentMonth, userProfile);

            //LOGICA DE UX: Limpiar predicciones y fases antes del primer periodo registrado
            const historial = userProfile?.periods_history || [];
            if (historial.length > 0) {
                const primerPeriodo = historial[0]; // El primer elemento es el más antiguo por el .sort()
                const fechaLimite = dayjs(primerPeriodo.startDate).startOf('day');

                daysWithPhases = daysWithPhases.map(dayItem => {
                    if (dayItem.day) {
                        const fechaDia = currentMonth.date(dayItem.day).startOf('day');
                        // Si el día evaluado es estrictamente anterior al primer registro, lo limpiamos
                        if (fechaDia.isBefore(fechaLimite)) {
                            return {
                                ...dayItem,
                                phase: null,
                                isPrediction: false,
                                cycleDay: null // Quitamos también el número de la esquina en el pasado remoto
                            };
                        }
                    }
                    return dayItem;
                });
            }

            setMonthDays(daysWithPhases);
        }
    }, [currentMonth, userProfile]);

    const handlePrevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
    const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));
    const handleEditPeriod = () => {
        setSelectedPeriodDate(currentMonth.toDate() > new Date() ? new Date() : currentMonth.toDate());
        setShowDatePicker(true);
    };

    const onDateChange = (event, selectedDate) => {
        if (selectedDate) {
            setSelectedPeriodDate(selectedDate);
        }
    };

    const handleSavePeriodDate = async () => {
        setShowDatePicker(false);
        if (!selectedPeriodDate) {
            return;
        }

        setLoading(true);
        const fechaInicioString = dayjs(selectedPeriodDate).format('YYYY-MM-DD');
        const M = Number(userProfile?.inp_period_length) || 5;
        const fechaFinString = dayjs(selectedPeriodDate).add(M - 1, 'day').format('YYYY-MM-DD');

        try {
            const uid = auth.currentUser?.uid;
            const userDocRef = doc(db, 'users', uid);
            const historialActual = userProfile?.periods_history || [];
            const mesSeleccionadoStr = dayjs(selectedPeriodDate).format('YYYY-MM');
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

            let nuevoPromedioCiclo = Number(userProfile?.inp_cycle_length) || 28;
            if (nuevoHistorialActualizado.length > 1) {
                let totalDays = 0;
                let intervals = 0;
                const recentHistory = nuevoHistorialActualizado.slice(-7);
                for (let i = 1; i < recentHistory.length; i++) {
                    const prevDate = dayjs(recentHistory[i - 1].startDate);
                    const currDate = dayjs(recentHistory[i].startDate);
                    totalDays += currDate.diff(prevDate, 'day');
                    intervals++;
                }
                if (intervals > 0) {
                    nuevoPromedioCiclo = Math.round(totalDays / intervals);
                }
            }

            await updateDoc(userDocRef, {
                periods_history: nuevoHistorialActualizado,
                inp_lmp_date: nuevoLmpGlobal,
                avg_cycle_length: nuevoPromedioCiclo
            });

            setUserProfile({
                ...userProfile,
                periods_history: nuevoHistorialActualizado,
                inp_lmp_date: nuevoLmpGlobal,
                avg_cycle_length: nuevoPromedioCiclo
            });
            Alert.alert("¡Guardado!", "Tu ciclo ha sido actualizado.");
        } catch (error) {
            Alert.alert("Error", "No se pudo conectar con el servidor.");
        } finally {
            setLoading(false);
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

            <View style={styles.logoContainer}>
                <Image
                    source={require('../../../assets/icons/Group_35.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <Modal
                visible={showDatePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Selecciona el inicio del periodo</Text>
                        <DateTimePicker
                            value={selectedPeriodDate > new Date() ? new Date() : selectedPeriodDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            maximumDate={new Date()}
                            onChange={onDateChange}
                            style={styles.datePicker}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancelButton]}
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalSaveButton]}
                                onPress={handleSavePeriodDate}
                            >
                                <Text style={styles.modalSaveText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

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

                <View style={styles.calendarBlockContainer}>

                    <View style={styles.navigationHeader}>
                        <TouchableOpacity onPress={handlePrevMonth} style={styles.navArrow}>
                            <Text style={styles.arrowText}>◀</Text>
                        </TouchableOpacity>

                        <View style={styles.monthBanner}>
                            <Text style={styles.monthTitle}>{monthName} {year}</Text>
                        </View>

                        <TouchableOpacity onPress={handleNextMonth} style={styles.navArrow}>
                            <Text style={styles.arrowText}>▶</Text>
                        </TouchableOpacity>
                    </View>

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
                                const basePhaseColor = phases[phase] || 'rgba(255,255,255,0.2)';
                                let circleColor = mostrarColor ? phases[phase] : 'transparent';

                                // Identificamos si es una predicción menstrual sin importar el filtro de color activo
                                const esMenstrualPrediccion = phase === 'menstrual' && dayItem.isPrediction;

                                // 🌟 SOLUCIÓN AL APAGADO DE FILTROS: Estilos estables y explícitos sin valores null
                                const mostrarEfectoPrediccion = esMenstrualPrediccion && mostrarColor;

                                const estiloCirculoDinamico = {
                                    backgroundColor: mostrarEfectoPrediccion ? 'transparent' : circleColor,
                                    borderWidth: mostrarEfectoPrediccion ? 1.5 : 0,
                                    borderColor: mostrarEfectoPrediccion ? phases['menstrual'] : 'transparent',
                                };

                                const estiloTextoDinamico = {
                                    color: mostrarEfectoPrediccion ? phases['menstrual'] : 'rgba(255,255,255,0.8)'
                                };

                                const uniqueKey = `${year}-${monthName}-${index}`;

                                return (
                                    <View key={uniqueKey} style={styles.dayCell}>
                                        {dayItem.day ? (
                                            <View style={styles.cellContent}>

                                                {/* El número de día de ciclo se oculta automáticamente si es nulo en el pasado */}
                                                {dayItem.cycleDay ? (
                                                    <Text style={styles.cycleDayCorner}>
                                                        {dayItem.cycleDay}
                                                    </Text>
                                                ) : null}

                                                {dayItem.isToday && (
                                                    <View style={[
                                                        styles.todayOuterRing,
                                                        { borderColor: mostrarColor ? basePhaseColor : 'rgba(255,255,255,0.4)' }
                                                    ]} />
                                                )}

                                                <View style={[
                                                    styles.dayCircle,
                                                    estiloCirculoDinamico,
                                                    dayItem.isToday ? { transform: [{ scale: 1.1 }] } : null
                                                ]}>
                                                    <Text style={[
                                                        styles.dayText,
                                                        estiloTextoDinamico,
                                                        dayItem.isToday ? { fontWeight: '800', fontFamily: FONT_BOLD } : null
                                                    ]}>
                                                        {dayItem.day}
                                                    </Text>
                                                </View>

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

                    <View style={styles.bottomButtonContainer}>
                        <TouchableOpacity style={styles.mainEditButton} onPress={handleEditPeriod}>
                            <Text style={styles.mainEditButtonText}>Editar fechas de periodo</Text>
                        </TouchableOpacity>
                    </View>

                </View>

            </ScrollView>

            <BottomNavigation />
        </SafeAreaView>
    );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.fondo || '#0D0D1E'
    },
    logoContainer: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 25,
    },
    logo: {
        width: 170,
        height: 48,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 110,
        flexGrow: 1,
    },
    filterWrapper: {
        marginBottom: 20,
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
        fontSize: 12,
        fontFamily: FONT_REGULAR,
    },
    calendarBlockContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 10,
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
    arrowText: { color: 'white', fontSize: 10, fontFamily: FONT_BOLD },
    monthBanner: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    monthTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: FONT_BOLD,
        textTransform: 'capitalize',
        letterSpacing: 0.5
    },
    calendarCard: {
        backgroundColor: '#1F1E29',
        borderRadius: 24,
        padding: 15,
        marginBottom: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    datePicker: {
        width: '100%',
        height: 220,
    },
    modalCard: {
        backgroundColor: '#1F1E29',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    modalTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: FONT_BOLD,
        marginBottom: 12,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
    },
    modalCancelButton: {
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    modalSaveButton: {
        backgroundColor: Colors.botones || '#6A5ACD',
    },
    modalCancelText: {
        color: 'white',
        fontWeight: '700',
        fontFamily: FONT_REGULAR,
    },
    modalSaveText: {
        color: '#0D0D1E',
        fontWeight: '800',
        fontFamily: FONT_BOLD,
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
        fontWeight: 'bold',
        fontFamily: FONT_BOLD
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
    todayOuterRing: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        zIndex: 1,
    },
    dayCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        zIndex: 2,
    },
    dayText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: FONT_REGULAR
    },
    cycleDayCorner: {
        position: 'absolute',
        top: 0,
        right: 2,
        fontSize: 8,
        color: 'rgba(255,255,255,0.3)',
        fontWeight: 'bold',
        fontFamily: FONT_BOLD
    },
    moonIcon: {
        position: 'absolute',
        bottom: -2,
        zIndex: 3,
    },
<<<<<<< Updated upstream
=======
    sexHeartIcon: {
        position: 'absolute',
        top: -1,
        right: -1,
        zIndex: 4,
        width: 12,
        height: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sexHeartProtected: {
        transform: [{ scale: 0.95 }],
    },
    sexHeartUnprotected: {
        transform: [{ scale: 1 }],
    },
    sexHeartHormonal: {
        transform: [{ scale: 0.95 }],
    },
    sexHeartText: {
        color: '#FF5C8A',
        fontSize: 11,
        fontWeight: '900',
        fontFamily: FONT_BOLD,
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
>>>>>>> Stashed changes
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
    bottomButtonContainer: {
        marginTop: 0,
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
        fontFamily: FONT_BOLD,
        fontSize: 14,
    }
});