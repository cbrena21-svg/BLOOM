import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../styles/colors';
import BottomNavigation from '../../components/common/BottomNavigationBar';

// 🌟 Componente nativo para seleccionar la fecha
import DateTimePicker from '@react-native-community/datetimepicker';

// 🌟 Importaciones reales de Firebase para conectarse a tu base de datos
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
    // Estados para controlar los filtros de visualización de fases
    const [filters, setFilters] = useState({
        menstrual: true,
        folicular: true,
        ovulatoria: true,
        lutea: true,
    });

    // Estados para la gestión de días, mes y carga
    const [monthDays, setMonthDays] = useState([]);
    const [monthName, setMonthName] = useState('');
    const [year, setYear] = useState(2026);
    const [loading, setLoading] = useState(true);

    // Estados para el perfil de usuario y control del mes actual en pantalla
    const [userProfile, setUserProfile] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    // Estado para controlar cuándo se abre el selector de fecha en pantalla
    const [showDatePicker, setShowDatePicker] = useState(false);

    // EFECTO 1: Carga inicial del perfil de usuario desde Firebase al abrir la pantalla
    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const resultado = await obtenerPerfilUsuario();
                if (resultado.success && resultado.data) {
                    setUserProfile(resultado.data);
                }
            } catch (error) {
                console.error('Error cargando datos del usuario:', error);
                Alert.alert("Error", "No se pudieron obtener los datos de tu perfil.");
            } finally {
                setLoading(false);
            }
        };
        loadUserProfile();
    }, []);

    // EFECTO 2: Recalcula los días del calendario cada vez que cambia el mes o el perfil de la usuaria
    useEffect(() => {
        if (userProfile) {
            setMonthName(getMonthName(currentMonth));
            setYear(getYear(currentMonth));

            // El helper matemático calcula las fases usando el inp_lmp_date actual
            const daysWithPhases = getMonthWithPhases(currentMonth, userProfile);
            setMonthDays(daysWithPhases);
        }
    }, [currentMonth, userProfile]);

    // Navegación de meses
    const handlePrevMonth = () => {
        setCurrentMonth(currentMonth.subtract(1, 'month'));
    };

    const handleNextMonth = () => {
        setCurrentMonth(currentMonth.add(1, 'month'));
    };

    // Abre el selector de fecha nativo del dispositivo
    const handleEditPeriod = () => {
        setShowDatePicker(true);
    };

    // 🌟 FUNCIÓN QUE ENVÍA LA NUEVA FECHA A FIRESTORE DE FORMA PERMANENTE
    const onDateChange = async (event, selectedDate) => {
        // Cierra el selector inmediatamente (requerido en Android/iOS)
        setShowDatePicker(false);

        // Si la usuaria seleccionó una fecha válida y no canceló el modal
        if (selectedDate) {
            setLoading(true); // Encendemos indicador de carga mientras va a internet

            // Formateamos la fecha a String 'YYYY-MM-DD' para mantener la consistencia ginecológica
            const nuevaFechaString = dayjs(selectedDate).format('YYYY-MM-DD');

            try {
                // 1. Obtener el ID único de la usuaria autenticada actualmente en la app
                const uid = auth.currentUser?.uid;
                if (!uid) {
                    throw new Error("No se encontró una sesión de usuario activa.");
                }

                // 2. Crear la referencia exacta al documento de la usuaria en Firestore
                // (Asegúrate de cambiar 'usuarios' si tu colección en la base de datos se llama diferente, ej: 'users')
                const userDocRef = doc(db, 'users', uid);

                // 3. Guardar de forma permanente en la nube
                await updateDoc(userDocRef, {
                    inp_lmp_date: nuevaFechaString
                });

                // 4. Actualizar el estado local para que impacte la pantalla de inmediato
                const perfilActualizado = { ...userProfile, inp_lmp_date: nuevaFechaString };
                setUserProfile(perfilActualizado);

            } catch (error) {
                console.error("Error al guardar en Firestore:", error);
                Alert.alert(
                    "Error de Conexión",
                    "No pudimos guardar la fecha en la nube. Revisa tu conexión a internet e inténtalo de nuevo."
                );
            } finally {
                setLoading(false); // Apagamos el indicador de carga
            }
        }
    };

    // Vista de carga en lo que responde Firebase
    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.botones || '#6A5ACD'} />
            </SafeAreaView>
        );
    }

    // Validación ginecológica del perfil actual
    const isArtificial = userProfile?.user_profile === 'ARTIFICIAL';
    const filtradoLlaves = isArtificial ? ['menstrual'] : Object.keys(filters);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            {/* Componente oculto del DatePicker que se activa bajo demanda */}
            {showDatePicker && (
                <DateTimePicker
                    value={userProfile?.inp_lmp_date ? new Date(userProfile.inp_lmp_date) : new Date()}
                    mode="date"
                    display="default"
                    maximumDate={new Date()} // Bloquea la selección de fechas en el futuro
                    onChange={onDateChange}
                />
            )}

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Encabezado Principal */}
                <View style={styles.headerTitleRow}>
                    <Text style={styles.title}>Calendario</Text>

                    <TouchableOpacity style={styles.editPeriodButton} onPress={handleEditPeriod}>
                        <Text style={styles.editPeriodButtonText}>✏️ Editar Período</Text>
                    </TouchableOpacity>
                </View>

                {/* Banner Informativo clínico para Perfil Artificial */}
                {isArtificial && (
                    <View style={styles.infoBanner}>
                        <Text style={styles.infoBannerText}>
                            ✨ Tu calendario está optimizado para tu <Text style={{ fontWeight: '700' }}>Perfil Anticonceptivo</Text>. En esta modalidad se calcula únicamente el sangrado por deprivación y se remueven las fases naturales para evitar confusión visual.
                        </Text>
                    </View>
                )}

                {/* Botones de Filtros Horizontales */}
                <View style={styles.filters}>
                    {filtradoLlaves.map(key => (
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

                {/* Tarjeta Contenedora del Calendario */}
                <View style={styles.calendarCard}>

                    {/* Controles de navegación mes a mes */}
                    <View style={styles.navigationHeader}>
                        <TouchableOpacity onPress={handlePrevMonth} style={styles.navArrow}>
                            <Text style={styles.arrowText}>◀</Text>
                        </TouchableOpacity>

                        <Text style={styles.monthTitle}>{monthName} {year}</Text>

                        <TouchableOpacity onPress={handleNextMonth} style={styles.navArrow}>
                            <Text style={styles.arrowText}>▶</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Cabecera de letras de los días de la semana */}
                    <View style={styles.weekdaysContainer}>
                        {weekdays.map((day, index) => (
                            <Text key={index} style={styles.weekdayText}>{day}</Text>
                        ))}
                    </View>

                    {/* Matriz/Grid con todos los días del mes */}
                    <View style={styles.calendarGrid}>
                        {monthDays.map((dayItem, index) => {
                            const phase = dayItem.phase;
                            const mostrarColor = phase && filters[phase];

                            let circleColor = mostrarColor ? phases[phase] : '#252542';

                            // Si es el día exacto del pico de la ovulación y no es artificial, cambiamos a azul eléctrico
                            if (dayItem.isOvulationDay && mostrarColor && !isArtificial) {
                                circleColor = '#6366F1';
                            }

                            return (
                                <View key={index} style={styles.dayCell}>
                                    {dayItem.day ? (
                                        <View style={styles.cellContainer}>

                                            {/* Círculo que representa el día */}
                                            <View
                                                style={[
                                                    styles.dayCircle,
                                                    {
                                                        backgroundColor: circleColor,
                                                        borderWidth: dayItem.isToday ? 2 : 0,
                                                        borderColor: dayItem.isToday ? 'white' : 'transparent',
                                                    },
                                                    dayItem.isOvulationDay && mostrarColor && !isArtificial && styles.ovulationPeakRing
                                                ]}
                                            >
                                                <Text style={styles.dayText}>{dayItem.day}</Text>
                                            </View>

                                            {/* Número limpio de la posición lineal del ciclo (1 a X) */}
                                            <Text style={styles.cycleDayText}>
                                                {dayItem.cycleDay}
                                            </Text>

                                        </View>
                                    ) : (
                                        // Relleno transparente para los días vacíos al inicio/final del mes
                                        <View style={styles.dayCell} />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            {/* Barra de navegación inferior global de la app */}
            <BottomNavigation />
        </SafeAreaView>
    );
}

// CONFIGURACIÓN DINÁMICA DE DIMENSIONES (Para que sea 100% responsivo en cualquier pantalla)
const screenWidth = Dimensions.get('window').width;
const cardPadding = 20;
const gridWidth = screenWidth - (20 * 2) - (cardPadding * 2);
const cellWidth = gridWidth / 7;

// HOJA DE ESTILOS DE LA PANTALLA (AQUÍ ESTÁ EL RESTO DE LAS LÍNEAS ORIGINALES)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.fondo || '#0D0D1E'
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 130
    },
    headerTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10
    },
    title: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold'
    },
    editPeriodButton: {
        backgroundColor: '#252542',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    editPeriodButtonText: {
        color: '#F2F2F2',
        fontSize: 12,
        fontWeight: '600'
    },
    infoBanner: {
        backgroundColor: 'rgba(94, 90, 138, 0.15)',
        borderColor: '#5E5A8A',
        borderWidth: 1,
        borderRadius: 15,
        padding: 12,
        marginBottom: 20
    },
    infoBannerText: {
        color: '#C5C6D0',
        fontSize: 11,
        lineHeight: 16
    },
    filters: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 25,
        width: '100%'
    },
    filter: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20
    },
    filterText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14
    },
    calendarCard: {
        backgroundColor: Colors.tarjetas || '#1A1A30',
        borderRadius: 20,
        padding: cardPadding,
        width: '100%',
        alignItems: 'center'
    },
    navigationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20
    },
    navArrow: {
        padding: 10,
        backgroundColor: '#252542',
        borderRadius: 10
    },
    arrowText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
    },
    monthTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        textTransform: 'capitalize'
    },
    weekdaysContainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingBottom: 10
    },
    weekdayText: {
        width: cellWidth,
        textAlign: 'center',
        color: Colors.textoSecundario || '#A0A0C0',
        fontWeight: '600',
        fontSize: 13
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%'
    },
    dayCell: {
        width: cellWidth,
        height: cellWidth + 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6
    },
    cellContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    dayCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center'
    },
    dayText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14
    },
    ovulationPeakRing: {
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4
    },
    cycleDayText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: '500',
        marginTop: 4
    },
});