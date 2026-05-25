import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image, Animated, Easing, Dimensions, Alert, Platform, Modal } from 'react-native';
import { Colors } from '../../styles/colors';
import { FONT_REGULAR, FONT_BOLD } from '../../styles/typography';
import { guardarPerfilOnboarding } from '../../services/authService';
import { calcularPerfilClinico } from '../../utils/clicnicCalculator';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation, onOnboardingComplete }) {
    const [paginaActual, setPaginaActual] = useState(1);
    const [isCalculating, setIsCalculating] = useState(false);
    const [textoCarga, setTextoCarga] = useState('Analizando tus respuestas...');
    const [showCalendar, setShowCalendar] = useState(false);

    const [onboardingData, setOnboardingData] = useState({
        inp_age: '',
        inp_contraceptive: '',
        inp_lmp_date: new Date(),
        inp_cycle_length: 28,
        inp_cycle_shortest: 28,
        inp_cycle_longest: 28,
        inp_period_length: 5,
        inp_pads_count: 3,
        inp_clots: '',
        inp_diagnoses: [],
        inp_chronic_symptoms: [],
        inp_migraine_timing: '',
        inp_exercise_intensity: '',
        inp_stress_level: false,
        inp_digestion_pattern: '',
        inp_sleep_quality: 'Excelente'
    });

    const totalPaginas = 15;
    const ageScrollViewRef = useRef(null);

    const [tempLmpDate, setTempLmpDate] = useState(onboardingData.inp_lmp_date || new Date());

    const opcionesAnticonceptivos = [
        'Ninguno', 'Pastillas combinadas', 'Mini-píldora (Solo Progesterona)',
        'DIU Hormonal (Mirena / Kyleena)', 'DIU de Cobre (No hormonal)',
        'Implante subdérmico', 'Parche', 'Anillo', 'Inyección', 'Condón',
        'Coito interrumpido', 'Ritmo', 'Moco Cervical', 'Temperatura Basal'
    ];

    const rangoEdades = Array.from({ length: 51 }, (_, i) => i + 10);
    const rangoSangrado = Array.from({ length: 10 }, (_, i) => i + 1); // 1 al 10
    const rangoToallas = Array.from({ length: 12 }, (_, i) => i + 1); // 1 al 12

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

    // Controla el brinco (0 = en el suelo, 1 = punto más alto)
    const bounceValue = useRef(new Animated.Value(0)).current;

    // Interpolación para el movimiento vertical de la luna
    const moonTranslateY = bounceValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -30] // Sube 30 píxeles
    });

    // Interpolación para el tamaño de la sombra
    const shadowScale = bounceValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.4] // Se encoge a menos de la mitad cuando la luna sube
    });

    // Interpolación para la opacidad de la sombra
    const shadowOpacity = bounceValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 0.1] // Se vuelve más tenue al subir
    });

    useEffect(() => {
        if (isCalculating) {
            // Animación en bucle: Sube fluido y baja con gravedad
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bounceValue, {
                        toValue: 1,
                        duration: 550,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true
                    }),
                    Animated.timing(bounceValue, {
                        toValue: 0,
                        duration: 450,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: true
                    })
                ])
            ).start();

            // Frases limpias y profesionales sin emojis
            const frases = [
                "Analizando regularidad de tu ciclo...",
                "Calculando reservas y flujo menstrual...",
                "Estructurando pautas de estilo de vida...",
                "Creando tu perfil Bloom..."
            ];
            let step = 0;
            setTextoCarga(frases[0]);

            const interval = setInterval(() => {
                step++;
                if (step < frases.length) {
                    setTextoCarga(frases[step]);
                } else {
                    clearInterval(interval);
                }
            }, 2500);

            return () => clearInterval(interval);
        }
    }, [isCalculating]);


    const handleSiguiente = async () => {
        if (paginaActual < totalPaginas) {
            setPaginaActual(paginaActual + 1);
        } else {
            // --- ¡LLEGAMOS AL FINAL DE LAS 16 PREGUNTAS! ---

            // COMPROBACIÓN LOCAL (Esto responde a tu pregunta 4 sobre el console.log):
            // Sirve para ver en tu terminal de la computadora si los cálculos matemáticos son correctos antes de subirlos.
            const perfilCalculado = calcularPerfilClinico(onboardingData);
            console.log("PROBANDO CÁLCULOS BLOOM:", perfilCalculado);

            // Activamos tu hermosa pantalla de carga con las frases clínicas
            setIsCalculating(true);

            // Mandamos los datos brutos a la "aduana" de Firebase que creamos en el paso anterior
            const resultado = await guardarPerfilOnboarding(onboardingData);

            // Apagamos el cargando simulado (puedes darle unos segundos si lo deseas, o directo)
            setIsCalculating(false);

            if (resultado.success) {
                console.log("¡Perfil clínico guardado con éxito en la nube!");
                // ✅ Activamos el puente para cambiar de pantalla de inmediato
                if (onOnboardingComplete) {
                    onOnboardingComplete();
                }
            } else {
                Alert.alert("Error de Guardado", "No pudimos procesar tus datos de salud: " + resultado.error);
            }
        }
    };

    const handleAtras = () => {
        if (paginaActual > 1) {
            setPaginaActual(paginaActual - 1);
        }
    };

    const formatearFecha = (date) => {
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const onDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowCalendar(false);
            if (selectedDate) {
                setOnboardingData(prev => ({ ...prev, inp_lmp_date: selectedDate }));
            }
            return;
        }

        if (selectedDate) {
            setTempLmpDate(selectedDate);
        }
    };

    const openCalendar = () => {
        setTempLmpDate(onboardingData.inp_lmp_date || new Date());
        setShowCalendar(true);
    };

    const cancelCalendar = () => setShowCalendar(false);

    const saveCalendar = () => {
        setOnboardingData(prev => ({ ...prev, inp_lmp_date: tempLmpDate }));
        setShowCalendar(false);
    };

    // ---- LISTAS PARA PREGUNTAS 8 A 11 ----
    const opcionesCoagulos = [
        { id: 'No presento coágulos (Flujo líquido continuo)', title: 'Flujo líquido continuo', subtitle: 'Sin coágulos', type: 'none' },
        { id: 'Pequeños (Ocasionales, tamaño de una lenteja)', title: 'Pequeños', subtitle: 'Tamaño de una lenteja', type: 'small' },
        { id: 'Grandes (Frecuentes, tamaño de una moneda o más)', title: 'Grandes', subtitle: 'Tamaño de una moneda o más', type: 'large' }
    ];

    const opcionesDiagnosticos = ['PMOS', 'Endometriosis', 'Miomas uterinos', 'Ninguno de los anteriores'];

    const opcionesSintomas = [
        'Cólicos incapacitantes (requieren pastillas)',
        'Hinchazón corporal severa / Retención de líquidos',
        'Acné hormonal (mandíbula/mejillas)',
        'Sensibilidad o dolor en los pechos',
        'Sofocos o calores nocturnos antes de la regla',
        'Ninguno'
    ];

    const opcionesMigranas = [
        'No sufro de migrañas',
        'Días antes de mi periodo (Premenstrual)',
        'Durante el sangrado (Menstrual)',
        'Me dan en ambos momentos'
    ];

    // ---- LISTAS PARA PREGUNTAS 12 A 15 ----
    const opcionesEjercicio = [
        { id: 'Alta intensidad constante (Crossfit, HIIT, correr diario)', title: 'Alta intensidad', subtitle: 'Crossfit, HIIT, correr', level: 3 },
        { id: 'Moderado / Mixto (Gimnasio, Pilates, Yoga)', title: 'Moderado / Mixto', subtitle: 'Gimnasio, Pilates, Yoga', level: 2 },
        { id: 'Ligero (Caminar, estiramientos, bajo impacto)', title: 'Ligero', subtitle: 'Caminar, estiramientos', level: 1 },
        { id: 'Sedentario (No realizo ejercicio actualmente)', title: 'Sedentario', subtitle: 'Sin actividad actual', level: 0 }
    ];

    const opcionesDigestion = [
        'Se mantiene regular y normal',
        'Sufro de estreñimiento severo',
        'Tiendo a evacuaciones sueltas o diarrea'
    ];

    const opcionesSueno = [
        { id: 'Duermo profundo y amanezco descansada', label: 'Profundo', level: 3 },
        { id: 'Tengo sueño ligero o interrupciones constantes', label: 'Ligero', level: 2 },
        { id: 'Insomnio (me cuesta mucho conciliar el sueño)', label: 'Insomnio', level: 1 }
    ];


    // ---- LÓGICA PARA SELECCIÓN MÚLTIPLE (Páginas 9 y 10) ----
    const toggleMultiSelect = (field, item, isNoneOption) => {
        setOnboardingData(prev => {
            const currentList = prev[field];
            if (isNoneOption) {
                return { ...prev, [field]: [item] };
            } else {
                let newList = currentList.filter(i => i !== 'Ninguno' && i !== 'Ninguno de los anteriores');
                if (newList.includes(item)) {
                    newList = newList.filter(i => i !== item);
                } else {
                    newList.push(item);
                }
                return { ...prev, [field]: newList };
            }
        });
    };

    // Verifica si la página actual tiene los datos obligatorios
    const validarBotonDeshabilitado = () => {
        const d = onboardingData;
        switch (paginaActual) {
            case 1: return d.inp_age === '';
            case 2: return d.inp_contraceptive === ''; // Aplica esta lógica a las páginas 3 a la 7 según tus variables
            case 8: return d.inp_clots === '';
            case 9: return d.inp_diagnoses.length === 0;
            case 10: return d.inp_chronic_symptoms.length === 0;
            case 11: return d.inp_migraine_timing === '';
            case 12: return d.inp_exercise_intensity === '';
            // El case 13 (Estrés) no se bloquea porque el switch siempre tiene un valor (true/false)
            case 14: return d.inp_digestion_pattern === '';
            case 15: return d.inp_sleep_quality === '';
            default: return false;
        }
    };

    const botonDeshabilitado = validarBotonDeshabilitado();

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
                                            <Text style={[styles.ageText, esSeleccionado && styles.ageTextActive]}>{age}</Text>
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
                                        <Text style={[styles.optionText, esSeleccionado && styles.optionTextActive]}>{metodo}</Text>
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
                            <Text style={styles.dateDisplay}>{formatearFecha(onboardingData.inp_lmp_date)}</Text>
                            <TouchableOpacity style={styles.dateDisplayButtonAndroid} onPress={openCalendar}>
                                <Text style={styles.dateDisplayTextAndroid}>Seleccionar fecha</Text>
                            </TouchableOpacity>

                            {showCalendar && (
                                <Modal
                                    visible={showCalendar}
                                    transparent
                                    animationType="fade"
                                    onRequestClose={cancelCalendar}
                                >
                                    <View style={styles.modalOverlay}>
                                        <View style={styles.modalCard}>
                                            <Text style={styles.modalTitle}>Selecciona el inicio del periodo</Text>
                                            <Calendar
                                                current={tempLmpDate.toISOString().split('T')[0]}
                                                minDate={fechaMinima.toISOString().split('T')[0]}
                                                maxDate={new Date().toISOString().split('T')[0]}
                                                onDayPress={(day) => {
                                                    const selected = new Date(day.dateString + 'T00:00:00');
                                                    setTempLmpDate(selected);
                                                }}
                                                markedDates={{
                                                    [tempLmpDate.toISOString().split('T')[0]]: { selected: true, selectedColor: Colors.botones || '#6A5ACD' }
                                                }}
                                                theme={{
                                                    backgroundColor: '#1F1E29',
                                                    calendarBackground: '#1F1E29',
                                                    textSectionTitleColor: 'rgba(255,255,255,0.8)',
                                                    selectedDayBackgroundColor: Colors.botones || '#6A5ACD',
                                                    selectedDayTextColor: '#ffffff',
                                                    todayTextColor: Colors.botones || '#6A5ACD',
                                                    dayTextColor: 'rgba(255,255,255,0.9)',
                                                    monthTextColor: 'white',
                                                    arrowColor: 'white',
                                                }}
                                            />
                                            <View style={styles.modalActions}>
                                                <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={cancelCalendar}>
                                                    <Text style={styles.modalCancelText}>Cancelar</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.modalButton, styles.modalSaveButton]} onPress={saveCalendar}>
                                                    <Text style={styles.modalSaveText}>Guardar</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </Modal>
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
                                onPress={() => setOnboardingData(prev => ({ ...prev, inp_cycle_length: Math.max(15, prev.inp_cycle_length - 1) }))}
                            >
                                <Text style={styles.counterButtonText}>−</Text>
                            </TouchableOpacity>
                            <View style={styles.counterValueWrapper}>
                                <Text style={styles.counterValue}>{onboardingData.inp_cycle_length}</Text>
                                <Text style={styles.counterUnit}>días</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.counterButton}
                                onPress={() => setOnboardingData(prev => ({ ...prev, inp_cycle_length: Math.min(50, prev.inp_cycle_length + 1) }))}
                            >
                                <Text style={styles.counterButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            case 5:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>Tu variación de ciclo</Text>
                        <Text style={styles.questionSubtitle}>Pensando en el último año, ¿cuántos días duró tu ciclo más corto y tu ciclo más largo?</Text>

                        <View style={styles.dualCounterContainer}>
                            {/* Ciclo más corto (Rango libre 15-50) */}
                            <View style={styles.smallCounterBox}>
                                <Text style={styles.smallCounterLabel}>Más corto</Text>
                                <View style={styles.smallCounterControls}>
                                    <TouchableOpacity
                                        style={styles.smallCounterBtn}
                                        onPress={() => setOnboardingData(prev => ({ ...prev, inp_cycle_shortest: Math.max(15, prev.inp_cycle_shortest - 1) }))}
                                    >
                                        <Text style={styles.smallCounterBtnText}>−</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.smallCounterValue}>{onboardingData.inp_cycle_shortest}</Text>
                                    <TouchableOpacity
                                        style={styles.smallCounterBtn}
                                        onPress={() => setOnboardingData(prev => ({ ...prev, inp_cycle_shortest: Math.min(50, prev.inp_cycle_shortest + 1) }))}
                                    >
                                        <Text style={styles.smallCounterBtnText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Divisor */}
                            <View style={styles.counterDivider} />

                            {/* Ciclo más largo (Rango libre 15-50) */}
                            <View style={styles.smallCounterBox}>
                                <Text style={styles.smallCounterLabel}>Más largo</Text>
                                <View style={styles.smallCounterControls}>
                                    <TouchableOpacity
                                        style={styles.smallCounterBtn}
                                        onPress={() => setOnboardingData(prev => ({ ...prev, inp_cycle_longest: Math.max(15, prev.inp_cycle_longest - 1) }))}
                                    >
                                        <Text style={styles.smallCounterBtnText}>−</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.smallCounterValue}>{onboardingData.inp_cycle_longest}</Text>
                                    <TouchableOpacity
                                        style={styles.smallCounterBtn}
                                        onPress={() => setOnboardingData(prev => ({ ...prev, inp_cycle_longest: Math.min(50, prev.inp_cycle_longest + 1) }))}
                                    >
                                        <Text style={styles.smallCounterBtnText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                );

            case 6:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>Duración del sangrado</Text>
                        <Text style={styles.questionSubtitle}>¿Cuántos días dura tu menstruación normalmente?</Text>

                        {/* AHORA: Medidor de intensidad para la duración de días */}
                        <View style={styles.volumeContainer}>
                            {rangoSangrado.map((num) => {
                                const estaIluminado = num <= onboardingData.inp_period_length;
                                const esElSeleccionado = num === onboardingData.inp_period_length;

                                return (
                                    <TouchableOpacity
                                        key={num}
                                        style={[
                                            styles.volumeItem,
                                            estaIluminado && styles.volumeItemActive,
                                            esElSeleccionado && styles.volumeItemHighlight
                                        ]}
                                        onPress={() => setOnboardingData(prev => ({ ...prev, inp_period_length: num }))}
                                    >
                                        <Text style={[
                                            styles.volumeItemText,
                                            estaIluminado && styles.volumeItemTextActive,
                                            esElSeleccionado && styles.volumeItemTextHighlight
                                        ]}>
                                            {num}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <Text style={styles.volumeFooterText}>
                            {onboardingData.inp_period_length} {onboardingData.inp_period_length === 1 ? 'día' : 'días'} de flujo continuos
                        </Text>
                    </View>
                );

            case 7:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>Volumen de flujo</Text>
                        <Text style={styles.questionSubtitle}>En tu día de mayor flujo, ¿cuántas toallas, tampones o copas utilizas en 24 horas?</Text>

                        {/* AHORA: Cuadrícula (Grid) para elegir el número exacto */}
                        <View style={styles.gridContainer}>
                            {rangoToallas.map((dia) => {
                                const esSeleccionado = onboardingData.inp_pads_count === dia;
                                return (
                                    <TouchableOpacity
                                        key={dia}
                                        style={[styles.gridItem, esSeleccionado && styles.gridItemActive]}
                                        onPress={() => setOnboardingData(prev => ({ ...prev, inp_pads_count: dia }))}
                                    >
                                        <Text style={[styles.gridItemText, esSeleccionado && styles.gridItemTextActive]}>{dia}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <Text style={styles.gridFooterText}>cambios al día aprox.</Text>
                    </View>
                );
            case 8:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>Textura del flujo</Text>
                        <Text style={styles.questionSubtitle}>Durante tu periodo, ¿cómo describirías la presencia de coágulos de sangre?</Text>

                        {/* CAMBIO AQUÍ: Cambiamos View por ScrollView y agregamos padding */}
                        <ScrollView
                            style={{ width: '100%' }}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={[styles.clotsContainer, { paddingBottom: 20 }]}
                        >
                            {opcionesCoagulos.map((opcion) => {
                                const esSeleccionado = onboardingData.inp_clots === opcion.id;
                                return (
                                    <TouchableOpacity
                                        key={opcion.id}
                                        style={[styles.clotCard, esSeleccionado && styles.clotCardActive]}
                                        onPress={() => setOnboardingData(prev => ({ ...prev, inp_clots: opcion.id }))}
                                    >
                                        <View style={styles.clotVisualContainer}>
                                            {opcion.type === 'none' && <View style={styles.clotVisualLine} />}
                                            {opcion.type === 'small' && (
                                                <View style={styles.clotVisualDotsRow}>
                                                    <View style={styles.clotDotSmall} /><View style={styles.clotDotSmall} /><View style={styles.clotDotSmall} />
                                                </View>
                                            )}
                                            {opcion.type === 'large' && (
                                                <View style={styles.clotVisualDotsRow}>
                                                    <View style={styles.clotDotLarge} /><View style={styles.clotDotLarge} />
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.clotTextContainer}>
                                            <Text style={[styles.clotTitle, esSeleccionado && styles.clotTitleActive]}>{opcion.title}</Text>
                                            <Text style={styles.clotSubtitle}>{opcion.subtitle}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                );

            case 9:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>Diagnósticos</Text>
                        <Text style={styles.questionSubtitle}>¿Has sido diagnosticada por un médico con alguna de estas condiciones? (Puedes elegir varias)</Text>

                        <ScrollView style={styles.listPickerContainer} showsVerticalScrollIndicator={false}>
                            {opcionesDiagnosticos.map((diag) => {
                                const esSeleccionado = onboardingData.inp_diagnoses.includes(diag);
                                const isNone = diag === 'Ninguno de los anteriores';
                                return (
                                    <TouchableOpacity
                                        key={diag}
                                        style={[styles.checkboxRow, esSeleccionado && styles.checkboxRowActive]}
                                        onPress={() => toggleMultiSelect('inp_diagnoses', diag, isNone)}
                                    >
                                        <View style={[styles.checkbox, esSeleccionado && styles.checkboxActive]}>
                                            {esSeleccionado && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={[styles.checkboxText, esSeleccionado && styles.checkboxTextActive]}>{diag}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                );

            case 10:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>Síntomas Frecuentes</Text>
                        <Text style={styles.questionSubtitle}>¿Sufres habitualmente de alguno de estos síntomas a lo largo de tu ciclo?</Text>

                        {/* AHORA: Usa el formato uniforme de Checkboxes de la Pág 9 */}
                        <ScrollView style={styles.listPickerContainer} showsVerticalScrollIndicator={false}>
                            {opcionesSintomas.map((sintoma) => {
                                const esSeleccionado = onboardingData.inp_chronic_symptoms.includes(sintoma);
                                const isNone = sintoma === 'Ninguno';
                                return (
                                    <TouchableOpacity
                                        key={sintoma}
                                        style={[styles.checkboxRow, esSeleccionado && styles.checkboxRowActive]}
                                        onPress={() => toggleMultiSelect('inp_chronic_symptoms', sintoma, isNone)}
                                    >
                                        <View style={[styles.checkbox, esSeleccionado && styles.checkboxActive]}>
                                            {esSeleccionado && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text style={[styles.checkboxText, esSeleccionado && styles.checkboxTextActive]}>{sintoma}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                );

            case 11:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>Dolores de Cabeza</Text>
                        <Text style={styles.questionSubtitle}>Si sufres de migrañas intensas, ¿en qué momento ocurren?</Text>

                        {/* AHORA: Usa el formato exacto de la Pregunta 2 */}
                        <ScrollView style={styles.listPickerContainer} showsVerticalScrollIndicator={false}>
                            {opcionesMigranas.map((momento) => {
                                const esSeleccionado = onboardingData.inp_migraine_timing === momento;
                                return (
                                    <TouchableOpacity
                                        key={momento}
                                        style={[styles.optionRow, esSeleccionado && styles.optionRowActive]}
                                        onPress={() => setOnboardingData(prev => ({ ...prev, inp_migraine_timing: momento }))}
                                    >
                                        <Text style={[styles.optionText, esSeleccionado && styles.optionTextActive]}>{momento}</Text>
                                        {esSeleccionado && <View style={styles.radioCheck} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                );
            case 12:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>Actividad Física</Text>
                        <Text style={styles.questionSubtitle}>¿Cómo es tu rutina de ejercicio físico habitualmente?</Text>

                        {/* Selector visual de barras de energía */}
                        <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20, gap: 10 }}>
                            {opcionesEjercicio.map((opcion) => {
                                const esSeleccionado = onboardingData.inp_exercise_intensity === opcion.id;
                                return (
                                    <TouchableOpacity
                                        key={opcion.id}
                                        style={[styles.exerciseCard, esSeleccionado && styles.exerciseCardActive]}
                                        onPress={() => setOnboardingData(prev => ({ ...prev, inp_exercise_intensity: opcion.id }))}
                                    >
                                        <View style={styles.exerciseVisualContainer}>
                                            <View style={[styles.energyBar, { height: 10 }, opcion.level >= 0 ? styles.energyBarActive : null]} />
                                            <View style={[styles.energyBar, { height: 18 }, opcion.level >= 1 ? styles.energyBarActive : null]} />
                                            <View style={[styles.energyBar, { height: 26 }, opcion.level >= 2 ? styles.energyBarActive : null]} />
                                            <View style={[styles.energyBar, { height: 34 }, opcion.level >= 3 ? styles.energyBarActive : null]} />
                                        </View>
                                        <View style={styles.exerciseTextContainer}>
                                            <Text style={[styles.exerciseTitle, esSeleccionado && styles.exerciseTitleActive]}>{opcion.title}</Text>
                                            <Text style={styles.exerciseSubtitle}>{opcion.subtitle}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                );

            case 13:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>Nivel de Estrés</Text>
                        <Text style={styles.questionSubtitle}>¿Consideras que vives con niveles de estrés crónico o fatiga mental últimamente?</Text>

                        {/* Custom Switch Elegante */}
                        <View style={styles.stressContainer}>
                            <Text style={styles.stressLabel}>{onboardingData.inp_stress_level ? 'Sí, bastante' : 'No, estoy tranquila'}</Text>
                            <TouchableOpacity
                                style={[styles.customSwitch, onboardingData.inp_stress_level ? styles.switchOn : styles.switchOff]}
                                activeOpacity={0.9}
                                onPress={() => setOnboardingData(prev => ({ ...prev, inp_stress_level: !prev.inp_stress_level }))}
                            >
                                <View style={[styles.switchCircle, onboardingData.inp_stress_level ? styles.switchCircleOn : styles.switchCircleOff]} />
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            case 14:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>Patrón de Digestión</Text>
                        <Text style={styles.questionSubtitle}>¿Cómo se comporta tu digestión en los días previos o durante tu periodo?</Text>

                        {/* Selector igual a la pregunta 2 */}
                        <ScrollView style={styles.listPickerContainer} showsVerticalScrollIndicator={false}>
                            {opcionesDigestion.map((opcion) => {
                                const esSeleccionado = onboardingData.inp_digestion_pattern === opcion;
                                return (
                                    <TouchableOpacity
                                        key={opcion}
                                        style={[styles.optionRow, esSeleccionado && styles.optionRowActive]}
                                        onPress={() => setOnboardingData(prev => ({ ...prev, inp_digestion_pattern: opcion }))}
                                    >
                                        <Text style={[styles.optionText, esSeleccionado && styles.optionTextActive]}>{opcion}</Text>
                                        {esSeleccionado && <View style={styles.radioCheck} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                );

            case 15:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>Calidad de Sueño</Text>
                        <Text style={styles.questionSubtitle}>¿Cómo describirías tu calidad de sueño en general?</Text>

                        {/* Acomodo HORIZONTAL de 3 tarjetas */}
                        <View style={styles.sleepRowContainer}>
                            {opcionesSueno.map((opcion) => {
                                const esSeleccionado = onboardingData.inp_sleep_quality === opcion.id;
                                return (
                                    <TouchableOpacity
                                        key={opcion.id}
                                        style={[styles.sleepCard, esSeleccionado && styles.sleepCardActive]}
                                        onPress={() => setOnboardingData(prev => ({ ...prev, inp_sleep_quality: opcion.id }))}
                                    >
                                        {/* Contenedor Visual (Reemplaza el Emoji) */}
                                        <View style={styles.sleepVisualWrapper}>
                                            {opcion.level === 3 && (
                                                <View style={styles.sleepVisualRow}>
                                                    <View style={styles.moonFull} />
                                                    <View style={styles.starDot} /><View style={styles.starDot} /><View style={styles.starDot} />
                                                </View>
                                            )}
                                            {opcion.level === 2 && (
                                                <View style={styles.sleepVisualRow}>
                                                    <View style={styles.moonHalf} />
                                                    <View style={styles.starDot} /><View style={styles.starDot} />
                                                </View>
                                            )}
                                            {opcion.level === 1 && (
                                                <View style={styles.sleepVisualRow}>
                                                    <View style={styles.moonCrescent} />
                                                    <View style={styles.starDot} />
                                                </View>
                                            )}
                                        </View>

                                        <Text style={[styles.sleepLabel, esSeleccionado && styles.sleepLabelActive]}>{opcion.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        {/* Texto descriptivo completo debajo */}
                        <Text style={styles.sleepDescriptionText}>
                            {onboardingData.inp_sleep_quality || 'Selecciona una opción'}
                        </Text>
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

    if (isCalculating) {
        return (
            <View style={styles.loadingScreen}>
                <View style={styles.loadingCard}>

                    {/* Escenario del Loading Animado */}
                    <View style={styles.animationContainer}>
                        {/* Luna Creciente que brinca */}
                        <Animated.View style={[styles.moonContainer, { transform: [{ translateY: moonTranslateY }] }]}>
                            <View style={styles.moonBody} />
                            <View style={[styles.moonMask, { backgroundColor: Colors.tarjetas || '#1F1E29' }]} />
                        </Animated.View>

                        {/* Sombra elíptica en el suelo que reacciona al brinco */}
                        <Animated.View style={[styles.moonShadow, { transform: [{ scaleX: shadowScale }], opacity: shadowOpacity }]} />
                    </View>

                    <Text style={styles.loadingTitle}>Personalizando tu espacio</Text>
                    <Text style={styles.loadingSubtitle}>{textoCarga}</Text>
                </View>
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

                <View style={styles.contentBody}>
                    {renderPregunta()}
                </View>

                <TouchableOpacity
                    style={[styles.continueButton, botonDeshabilitado && { opacity: 0.3 }]}
                    onPress={handleSiguiente}
                    disabled={botonDeshabilitado}
                >
                    <Text style={styles.continueButtonText}>
                        {paginaActual === totalPaginas ? 'FINALIZAR' : 'Continuar'}
                    </Text>
                </TouchableOpacity>

                {paginaActual > 1 && (
                    <TouchableOpacity style={styles.backLink} onPress={handleAtras}>
                        <Text style={styles.backLinkText}>Atrás</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

// ---- ESTILOS ----
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
    progressText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginBottom: 8, opacity: 0.8, fontFamily: FONT_REGULAR },
    progressTrack: { height: 5, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10, width: '100%', marginBottom: 24 },
    progressBar: { height: '100%', backgroundColor: Colors.botones || '#6A5ACD', borderRadius: 10 },
    contentBody: { width: '100%', height: 280, justifyContent: 'center' },
    questionWrapper: { alignItems: 'center', width: '100%', height: '100%' },
    questionTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, fontFamily: FONT_BOLD },
    questionSubtitle: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: 10, marginBottom: 16 },

    // Pág 1: Edad
    pickerContainer: { width: '100%', height: 70, justifyContent: 'center', alignItems: 'center' },
    ageScrollContent: { paddingHorizontal: width / 2 - 58, alignItems: 'center' },
    ageItem: { width: 54, height: 54, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', justifyContent: 'center', alignItems: 'center', marginHorizontal: 7 },
    ageItemActive: { backgroundColor: Colors.botones || '#6A5ACD', borderColor: Colors.botones || '#6A5ACD' },
    ageText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', opacity: 0.7, fontFamily: FONT_REGULAR },
    ageTextActive: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', opacity: 1.0, fontFamily: FONT_BOLD },

    // Pág 2: List Picker
    listPickerContainer: { width: '100%', flex: 1 },
    optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.04)', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: 'transparent' },
    optionRowActive: { backgroundColor: 'rgba(106, 90, 205, 0.15)', borderColor: Colors.botones || '#6A5ACD' },
    optionText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, flex: 1 },
    optionTextActive: { color: '#FFFFFF', fontWeight: '600', fontFamily: FONT_REGULAR },
    radioCheck: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.botones || '#6A5ACD' },

    // Pág 3: Calendario
    calendarCard: { width: '100%', alignItems: 'center', marginTop: 10 },
    dateDisplay: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', fontFamily: FONT_BOLD, backgroundColor: 'rgba(255, 255, 255, 0.06)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginBottom: 10, overflow: 'hidden' },
    dateDisplayButtonAndroid: { backgroundColor: 'rgba(255, 255, 255, 0.06)', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', marginTop: 20 },
    dateDisplayTextAndroid: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', fontFamily: FONT_BOLD },
    nativePicker: { width: '100%', height: 160 },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    modalCard: {
        backgroundColor: '#1F1E29',
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)'
    },
    modalTitle: { color: 'white', fontSize: 16, fontWeight: '700', marginBottom: 10, textAlign: 'center', fontFamily: FONT_BOLD },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
    modalButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    modalCancelButton: { backgroundColor: 'rgba(255,255,255,0.06)' },
    modalSaveButton: { backgroundColor: Colors.botones || '#6A5ACD' },
    modalCancelText: { color: 'white', fontWeight: '700', fontFamily: FONT_REGULAR },
    modalSaveText: { color: '#0D0D1E', fontWeight: '800', fontFamily: FONT_BOLD },

    // Pág 4: Counter UI
    counterContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 20 },
    counterButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255, 255, 255, 0.06)', justifyContent: 'center', alignItems: 'center' },
    counterButtonText: { color: '#FFFFFF', fontSize: 24, fontWeight: '300', fontFamily: FONT_REGULAR },
    counterValueWrapper: { alignItems: 'center', marginHorizontal: 35 },
    counterValue: { color: '#FFFFFF', fontSize: 48, fontWeight: 'bold', fontFamily: FONT_BOLD },
    counterUnit: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, marginTop: -4 },

    // Pág 5: Dual Counter
    dualCounterContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 10, paddingHorizontal: 10 },
    smallCounterBox: { flex: 1, alignItems: 'center' },
    smallCounterLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 13, marginBottom: 12 },
    smallCounterControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    smallCounterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.06)', justifyContent: 'center', alignItems: 'center' },
    smallCounterBtnText: { color: '#FFFFFF', fontSize: 20, fontWeight: '300', fontFamily: FONT_REGULAR },
    smallCounterValue: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginHorizontal: 15, width: 35, textAlign: 'center', fontFamily: FONT_BOLD },
    counterDivider: { width: 1, height: 60, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginHorizontal: 10, marginTop: 20 },

    // Cuadrícula (ahora para Volumen)
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%', gap: 10, marginTop: 5 },
    gridItem: { width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.04)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
    gridItemActive: { backgroundColor: Colors.botones || '#6A5ACD', borderColor: Colors.botones || '#6A5ACD' },
    gridItemText: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 16, fontWeight: '600', fontFamily: FONT_REGULAR },
    gridItemTextActive: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', fontFamily: FONT_BOLD },
    gridFooterText: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 13, marginTop: 16 },

    // Medidor de intensidad (ahora para Duración de días)
    volumeContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '90%', gap: 8, marginTop: 5 },
    volumeItem: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255, 255, 255, 0.04)', justifyContent: 'center', alignItems: 'center' },
    volumeItemActive: { backgroundColor: 'rgba(106, 90, 205, 0.3)' },
    volumeItemHighlight: { backgroundColor: Colors.botones || '#6A5ACD', transform: [{ scale: 1.1 }] },
    volumeItemText: { color: 'rgba(255, 255, 255, 0.3)', fontSize: 15, fontWeight: 'bold', fontFamily: FONT_BOLD },
    volumeItemTextActive: { color: '#FFFFFF', opacity: 0.8 },
    volumeItemTextHighlight: { color: '#FFFFFF', fontSize: 17, opacity: 1 },
    volumeFooterText: { color: Colors.botones || '#6A5ACD', fontSize: 14, fontWeight: '600', marginTop: 20, fontFamily: FONT_REGULAR },

    continueButton: { backgroundColor: Colors.botones || '#6A5ACD', width: '100%', paddingVertical: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
    continueButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', fontFamily: FONT_BOLD },
    backLink: { marginTop: 12, paddingVertical: 4 },
    backLinkText: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, textDecorationLine: 'underline' },
    loadingContainer: { flex: 1, backgroundColor: Colors.fondo || '#12111A', justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#FFFFFF', fontSize: 15, marginTop: 16, textAlign: 'center', paddingHorizontal: 40 },

    // Pág 8: Coágulos (Tarjetas Visuales)
    clotsContainer: { width: '100%', gap: 10 },
    clotCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
    clotCardActive: { backgroundColor: 'rgba(106, 90, 205, 0.15)', borderColor: Colors.botones || '#6A5ACD' },
    clotVisualContainer: { width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.08)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    clotTextContainer: { flex: 1 },
    clotTitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 15, fontWeight: 'bold', marginBottom: 4, fontFamily: FONT_BOLD },
    clotTitleActive: { color: '#FFFFFF' },
    clotSubtitle: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 },
    clotVisualLine: { width: 25, height: 4, backgroundColor: Colors.botones || '#6A5ACD', borderRadius: 2 },
    clotVisualDotsRow: { flexDirection: 'row', gap: 4, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', width: 30 },
    clotDotSmall: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.botones || '#6A5ACD' },
    clotDotLarge: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.botones || '#6A5ACD' },

    // Pág 9: Checkboxes (Diagnósticos)
    checkboxRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.04)', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: 'transparent' },
    checkboxRowActive: { backgroundColor: 'rgba(106, 90, 205, 0.1)', borderColor: 'rgba(106, 90, 205, 0.5)' },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.3)', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
    checkboxActive: { backgroundColor: Colors.botones || '#6A5ACD', borderColor: Colors.botones || '#6A5ACD' },
    checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', fontFamily: FONT_BOLD },
    checkboxText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, flex: 1 },
    checkboxTextActive: { color: '#FFFFFF', fontWeight: '600', fontFamily: FONT_REGULAR },

    // Pág 12: Ejercicio (Tarjetas Visuales de Energía)
    exerciseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'transparent' },
    exerciseCardActive: { backgroundColor: 'rgba(106, 90, 205, 0.15)', borderColor: Colors.botones || '#6A5ACD' },
    exerciseVisualContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', width: 35, height: 35, marginRight: 16, paddingBottom: 2 },
    energyBar: { width: 6, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 3 },
    energyBarActive: { backgroundColor: Colors.botones || '#6A5ACD' },
    exerciseTextContainer: { flex: 1 },
    exerciseTitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 15, fontWeight: 'bold', marginBottom: 4, fontFamily: FONT_BOLD },
    exerciseTitleActive: { color: '#FFFFFF' },
    exerciseSubtitle: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 },

    // Pág 13: Estrés (Custom Switch)
    stressContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
    stressLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 30, fontFamily: FONT_BOLD },
    customSwitch: { width: 100, height: 50, borderRadius: 25, padding: 4, justifyContent: 'center' },
    switchOff: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    switchOn: { backgroundColor: Colors.botones || '#6A5ACD' },
    switchCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
    switchCircleOff: { alignSelf: 'flex-start' },
    switchCircleOn: { alignSelf: 'flex-end' },

    // Pág 15: Sueño (Tarjetas Horizontales con Lunas/Estrellas)
    sleepRowContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
    sleepCard: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 20, paddingVertical: 20, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: 'transparent' },
    sleepCardActive: { backgroundColor: 'rgba(106, 90, 205, 0.15)', borderColor: Colors.botones || '#6A5ACD', transform: [{ scale: 1.05 }] },

    sleepVisualWrapper: { height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    sleepVisualRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'center', width: 40 },

    // Figuras geométricas simples y a prueba de errores
    moonFull: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.botones || '#6A5ACD' },
    moonHalf: { width: 14, height: 14, borderBottomLeftRadius: 14, borderTopLeftRadius: 14, backgroundColor: Colors.botones || '#6A5ACD' },
    moonCrescent: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: Colors.botones || '#6A5ACD', borderTopColor: 'transparent', borderRightColor: 'transparent', transform: [{ rotate: '-45deg' }] },
    starDot: { width: 6, height: 6, backgroundColor: '#FFFFFF', transform: [{ rotate: '45deg' }], opacity: 0.8 },

    sleepLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, fontWeight: '600', fontFamily: FONT_REGULAR },
    sleepLabelActive: { color: '#FFFFFF', fontWeight: 'bold', fontFamily: FONT_BOLD },
    sleepDescriptionText: { color: Colors.botones || '#6A5ACD', fontSize: 14, textAlign: 'center', marginTop: 24, paddingHorizontal: 10, fontWeight: '500', fontFamily: FONT_REGULAR },

    // --- ESTILOS PANTALLA DE CARGA FINAL (LUNA BRINCANDO) ---
    loadingScreen: { flex: 1, backgroundColor: Colors.fondo || '#12111A', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    loadingCard: { backgroundColor: Colors.tarjetas || '#1F1E29', borderRadius: 28, width: '100%', paddingVertical: 50, paddingHorizontal: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    loadingTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 12, fontFamily: FONT_BOLD },
    loadingSubtitle: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, textAlign: 'center', height: 40 },

    // Contenedor que fija el espacio para que el brinco no mueva los textos de abajo
    animationContainer: { height: 90, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 24, width: 100, position: 'relative' },

    // Construcción vectorial de la Luna Creciente
    moonContainer: { width: 40, height: 40, position: 'relative', marginBottom: 4 },
    moonBody: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.botones || '#6A5ACD' },
    moonMask: { width: 40, height: 40, borderRadius: 20, position: 'absolute', top: -5, left: 7 }, // Hace el recorte perfecto de la fase

    // Sombra ovalada idéntica a la de tu referencia
    moonShadow: { width: 30, height: 5, borderRadius: 2.5, backgroundColor: '#000000' }
});