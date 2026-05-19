import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Image,
    Dimensions,
    Platform
} from 'react-native';
import { Colors } from '../../styles/colors';

// Importamos el DatePicker nativo de la plataforma
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
    // ---- 1. ESTADOS DEL MOTOR ----
    const [paginaActual, setPaginaActual] = useState(1);
    const [isCalculating, setIsCalculating] = useState(false);
    const [textoCarga, setTextoCarga] = useState('Analizando tus respuestas...');

    // Estado añadido para controlar la visibilidad del modal en Android sin bucles
    const [showCalendar, setShowCalendar] = useState(false);

    // ---- 2. ESTADO DE LOS INPUTS (Esquema de Notion) ----
    const [onboardingData, setOnboardingData] = useState({
        inp_age: 20,
        inp_contraceptive: 'Ninguno',
        inp_lmp_date: new Date(), // Guardamos el objeto Date directamente
        inp_cycle_length: 28,
        inp_cycle_shortest: 28,
        inp_cycle_longest: 28,
        inp_period_length: 5,
        inp_pads_count: 3,
        inp_clots: 'Ninguno',
        inp_diagnoses: [],
        inp_chronic_symptoms: [],
        inp_migraine_timing: 'No sufro migrañas',
        inp_exercise_intensity: 'Moderado',
        inp_stress_level: false,
        inp_digestion_pattern: 'Sin cambios / Normal',
        inp_sleep_quality: 'Excelente'
    });

    const totalPaginas = 16;
    const ageScrollViewRef = useRef(null);

    // Opciones para la pregunta de anticonceptivos
    const opcionesAnticonceptivos = [
        'Ninguno', 'Pastillas combinadas', 'Mini-píldora (Solo Progesterona)',
        'DIU Hormonal (Mirena / Kyleena)', 'DIU de Cobre (No hormonal)',
        'Implante subdérmico', 'Parche', 'Anillo', 'Inyección', 'Condón',
        'Coito interrumpido', 'Ritmo', 'Moco Cervical', 'Temperatura Basal'
    ];

    const rangoEdades = Array.from({ length: 51 }, (_, i) => i + 10);

    // Auto-scroll para el selector de edad
    useEffect(() => {
        if (paginaActual === 1 && ageScrollViewRef.current) {
            setTimeout(() => {
                const index = rangoEdades.indexOf(onboardingData.inp_age);
                if (index !== -1) {
                    ageScrollViewRef.current.scrollTo({ x: index * 68 - (width / 2 - 68), animated: true });
                }
            }, 300);
        }
    }, [paginaActual]);

    // ---- 3. SIMULADOR DE PREDICCIONES ----
    useEffect(() => {
        if (isCalculating) {
            const frases = [
                "Analizando regularidad según criterios FIGO... 📊",
                "Calculando volumen de flujo y reservas de hierro... 🩸",
                "Estructurando pautas de alimentación hormonal... 🥑",
                "¡Todo listo! Creando tu perfil Bloom... ✨"
            ];
            let index = 0;
            const interval = setInterval(() => {
                if (index < frases.length - 1) {
                    index++;
                    setTextoCarga(frases[index]);
                } else {
                    clearInterval(interval);
                    setIsCalculating(false);
                    setPaginaActual(1);
                    console.log("Datos del Onboarding Listos:", onboardingData);
                    alert("✨ ¡Simulación Exitosa! ✨\nDatos listos para sincronizar con Firebase.");
                }
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [isCalculating]);

    // ---- 4. MANEJADORES DE NAVEGACIÓN ----
    const handleSiguiente = () => {
        if (paginaActual < totalPaginas) {
            setPaginaActual(paginaActual + 1);
        } else {
            setIsCalculating(true);
        }
    };

    const handleAtras = () => {
        if (paginaActual > 1) {
            setPaginaActual(paginaActual - 1);
        }
    };

    // Auxiliar para formatear de manera elegante la fecha seleccionada en pantalla
    const formatearFecha = (date) => {
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Manejador unificado que cierra la alerta nativa en Android inmediatamente tras seleccionar
    const onDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowCalendar(false);
        }
        if (selectedDate) {
            setOnboardingData(prev => ({ ...prev, inp_lmp_date: selectedDate }));
        }
    };

    // ---- 5. EL "CEREBRO" DINÁMICO DE LAS PREGUNTAS ----
    const renderPregunta = () => {
        switch (paginaActual) {
            case 1:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>¿Cuál es tu edad?</Text>
                        <Text style={styles.questionSubtitle}>Esto nos ayuda a personalizar tu experiencia.</Text>

                        <View style={styles.pickerContainer}>
                            <ScrollView
                                ref={ageScrollViewRef}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.ageScrollContent}
                                snapToInterval={68}
                                decelerationRate="fast"
                            >
                                {rangoEdades.map((age) => {
                                    const esSeleccionado = age === onboardingData.inp_age;
                                    return (
                                        <TouchableOpacity
                                            key={age}
                                            style={[styles.ageItem, esSeleccionado && styles.ageItemActive]}
                                            activeOpacity={0.8}
                                            onPress={() => setOnboardingData(prev => ({ ...prev, inp_age: age }))}
                                        >
                                            <Text style={[styles.ageText, esSeleccionado && styles.ageTextActive]}>
                                                {age}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </View>
                );

            case 2:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>¿Utilizas actualmente algún método anticonceptivo?</Text>
                        <Text style={styles.questionSubtitle}>Selecciona tu alternativa actual de seguimiento.</Text>

                        <ScrollView style={styles.listPickerContainer} showsVerticalScrollIndicator={false}>
                            {opcionesAnticonceptivos.map((metodo) => {
                                const esSeleccionado = onboardingData.inp_contraceptive === metodo;
                                return (
                                    <TouchableOpacity
                                        key={metodo}
                                        style={[styles.optionRow, esSeleccionado && styles.optionRowActive]}
                                        onPress={() => setOnboardingData(prev => ({ ...prev, inp_contraceptive: metodo }))}
                                    >
                                        <Text style={[styles.optionText, esSeleccionado && styles.optionTextActive]}>
                                            {metodo}
                                        </Text>
                                        {esSeleccionado && <View style={styles.radioCheck} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                );

            case 3:
                const fechaMinima = new Date();
                fechaMinima.setDate(fechaMinima.getDate() - 60);

                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>¿Cuándo inició tu último periodo?</Text>
                        <Text style={styles.questionSubtitle}>Cuenta el primer día de flujo abundante, no manchas.</Text>

                        <View style={styles.calendarCard}>
                            {Platform.OS === 'ios' ? (
                                <>
                                    <Text style={styles.dateDisplay}>
                                        {formatearFecha(onboardingData.inp_lmp_date)}
                                    </Text>
                                    <DateTimePicker
                                        value={onboardingData.inp_lmp_date}
                                        mode="date"
                                        display="inline"
                                        maximumDate={new Date()}
                                        minimumDate={fechaMinima}
                                        themeVariant="dark"
                                        onChange={onDateChange}
                                        style={styles.nativePicker}
                                    />
                                </>
                            ) : (
                                <>
                                    {/* En Android disparamos la interfaz nativa mediante este botón contenedor */}
                                    <TouchableOpacity
                                        style={styles.dateDisplayButtonAndroid}
                                        onPress={() => setShowCalendar(true)}
                                    >
                                        <Text style={styles.dateDisplayTextAndroid}>
                                            {formatearFecha(onboardingData.inp_lmp_date)}
                                        </Text>
                                    </TouchableOpacity>

                                    {showCalendar && (
                                        <DateTimePicker
                                            value={onboardingData.inp_lmp_date}
                                            mode="date"
                                            display="default"
                                            maximumDate={new Date()}
                                            minimumDate={fechaMinima}
                                            onChange={onDateChange}
                                        />
                                    )}
                                </>
                            )}
                        </View>
                    </View>
                );

            case 4:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>¿Cuánto dura tu ciclo total?</Text>
                        <Text style={styles.questionSubtitle}>Desde el primer día de una regla hasta el primero de la siguiente.</Text>

                        <View style={styles.counterContainer}>
                            <TouchableOpacity
                                style={styles.counterButton}
                                onPress={() => setOnboardingData(prev => ({
                                    ...prev,
                                    inp_cycle_length: Math.max(15, prev.inp_cycle_length - 1)
                                }))}
                            >
                                <Text style={styles.counterButtonText}>−</Text>
                            </TouchableOpacity>

                            <View style={styles.counterValueWrapper}>
                                <Text style={styles.counterValue}>{onboardingData.inp_cycle_length}</Text>
                                <Text style={styles.counterUnit}>días</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.counterButton}
                                onPress={() => setOnboardingData(prev => ({
                                    ...prev,
                                    inp_cycle_length: Math.min(50, prev.inp_cycle_length + 1)
                                }))}
                            >
                                <Text style={styles.counterButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            default:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>Pregunta {paginaActual}</Text>
                        <Text style={styles.questionSubtitle}>Configuración en proceso para las siguientes secciones.</Text>
                    </View>
                );
        }
    };

    // ---- 6. RENDERIZADO GENERAL ----
    if (isCalculating) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.botones || '#6A5ACD'} />
                <Text style={styles.loadingText}>{textoCarga}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image
                source={require('../../../assets/icons/Group_35.png')}
                style={styles.logoTop}
                resizeMode="contain"
            />

            <View style={styles.mainCard}>
                <Text style={styles.progressText}>{paginaActual} de {totalPaginas}</Text>

                <View style={styles.progressTrack}>
                    <View style={[styles.progressBar, { width: `${(paginaActual / totalPaginas) * 100}%` }]} />
                </View>

                {/* Contenedor dinámico */}
                <View style={styles.contentBody}>
                    {renderPregunta()}
                </View>

                <TouchableOpacity style={styles.continueButton} onPress={handleSiguiente}>
                    <Text style={styles.continueButtonText}>
                        {paginaActual === totalPaginas ? 'FINALIZAR' : 'Continuar'}
                    </Text>
                </TouchableOpacity>

                {paginaActual > 1 && (
                    <TouchableOpacity style={styles.backLink} onPress={handleAtras}>
                        <Text style={styles.backLinkText}>Volver a la pregunta anterior</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

// ---- 7. ESTILOS DE COMPONENTES DEL ONBOARDING ----
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.fondo || '#12111A',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    logoTop: {
        width: 240,
        height: 60,
        marginBottom: 20,
        marginTop: 10,
    },
    mainCard: {
        backgroundColor: Colors.tarjetas || '#1F1E29',
        borderRadius: 28,
        width: '100%',
        paddingVertical: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    progressText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.8,
    },
    progressTrack: {
        height: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        width: '100%',
        marginBottom: 24,
    },
    progressBar: {
        height: '100%',
        backgroundColor: Colors.botones || '#6A5ACD',
        borderRadius: 10,
    },
    contentBody: {
        width: '100%',
        height: 280,
        justifyContent: 'center',
    },
    questionWrapper: {
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    questionTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    questionSubtitle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 10,
        marginBottom: 16,
    },
    // Estilos Pregunta 1: Age Picker
    pickerContainer: {
        width: '100%',
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ageScrollContent: {
        paddingHorizontal: width / 2 - 58,
        alignItems: 'center',
    },
    ageItem: {
        width: 54,
        height: 54,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 7,
    },
    ageItemActive: {
        backgroundColor: Colors.botones || '#6A5ACD',
        borderColor: Colors.botones || '#6A5ACD',
    },
    ageText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        opacity: 0.7,
    },
    ageTextActive: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        opacity: 1.0,
    },
    // Estilos Pregunta 2: List Picker (Anticonceptivos)
    listPickerContainer: {
        width: '100%',
        flex: 1,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    optionRowActive: {
        backgroundColor: 'rgba(106, 90, 205, 0.15)',
        borderColor: Colors.botones || '#6A5ACD',
    },
    optionText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        flex: 1,
    },
    optionTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    radioCheck: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.botones || '#6A5ACD',
    },
    // Estilos Pregunta 3: Calendario
    calendarCard: {
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    dateDisplay: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 10,
        overflow: 'hidden',
    },
    // Botón específico añadido para Android con el fin de emular el diseño original
    dateDisplayButtonAndroid: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        marginTop: 20,
    },
    dateDisplayTextAndroid: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    nativePicker: {
        width: '100%',
        height: 160,
    },
    // Estilos Pregunta 4: Counter UI
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop: 20,
    },
    counterButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterButtonText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '300',
    },
    counterValueWrapper: {
        alignItems: 'center',
        marginHorizontal: 35,
    },
    counterValue: {
        color: '#FFFFFF',
        fontSize: 48,
        fontWeight: 'bold',
    },
    counterUnit: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 14,
        marginTop: -4,
    },
    // Estilos comunes inferiores
    continueButton: {
        backgroundColor: Colors.botones || '#6A5ACD',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
    backLink: {
        marginTop: 12,
        paddingVertical: 4,
    },
    backLinkText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        textDecorationLine: 'underline',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: Colors.fondo || '#12111A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 15,
        marginTop: 16,
        textAlign: 'center',
        paddingHorizontal: 40,
    }
});