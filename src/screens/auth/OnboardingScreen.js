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

import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
    const [paginaActual, setPaginaActual] = useState(1);
    const [isCalculating, setIsCalculating] = useState(false);
    const [textoCarga, setTextoCarga] = useState('Analizando tus respuestas...');
    const [showCalendar, setShowCalendar] = useState(false);

    const [onboardingData, setOnboardingData] = useState({
        inp_age: 20,
        inp_contraceptive: '',
        inp_lmp_date: new Date(),
        inp_cycle_length: 28,
        inp_cycle_shortest: 28,
        inp_cycle_longest: 28,
        inp_period_length: 5,
        inp_pads_count: 3,
        inp_clots: 'No presento coágulos (Flujo líquido continuo)',
        inp_diagnoses: [],
        inp_chronic_symptoms: [],
        inp_migraine_timing: '',
        inp_exercise_intensity: 'Moderado',
        inp_stress_level: false,
        inp_digestion_pattern: 'Sin cambios / Normal',
        inp_sleep_quality: 'Excelente'
    });

    const totalPaginas = 15;
    const ageScrollViewRef = useRef(null);

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
                    console.log("Datos del Onboarding:", onboardingData);
                    alert("✨ ¡Simulación Exitosa! ✨");
                }
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [isCalculating]);

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

    const formatearFecha = (date) => {
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const onDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowCalendar(false);
        }
        if (selectedDate) {
            setOnboardingData(prev => ({ ...prev, inp_lmp_date: selectedDate }));
        }
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
        'Días antes de mi periodo (Premenstrual)',
        'Durante el sangrado (Menstrual)',
        'Me dan en ambos momentos',
        'No sufro de migrañas'
    ];

    // ---- LISTAS PARA PREGUNTAS 12 A 15 ----
    const opcionesEjercicio = [
        { id: 'Alta intensidad constante (Crossfit, HIIT, correr diario)', title: 'Alta intensidad', subtitle: 'Crossfit, HIIT, correr', level: 3 },
        { id: 'Moderado / Mixto (Gimnasio, Pilates, Yoga)', title: 'Moderado / Mixto', subtitle: 'Gimnasio, Pilates, Yoga', level: 2 },
        { id: 'Ligero (Caminar, estiramientos, bajo impacto)', title: 'Ligero', subtitle: 'Caminar, estiramientos', level: 1 },
        { id: 'Sedentario (No realizo ejercicio actualmente)', title: 'Sedentario', subtitle: 'Sin actividad actual', level: 0 }
    ];

    const opcionesDigestion = [
        'Sufro de estreñimiento severo',
        'Tiendo a evacuaciones sueltas o diarrea',
        'Se mantiene regular y normal'
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
                            {Platform.OS === 'ios' ? (
                                <>
                                    <Text style={styles.dateDisplay}>{formatearFecha(onboardingData.inp_lmp_date)}</Text>
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
                                    <TouchableOpacity style={styles.dateDisplayButtonAndroid} onPress={() => setShowCalendar(true)}>
                                        <Text style={styles.dateDisplayTextAndroid}>📅 {formatearFecha(onboardingData.inp_lmp_date)}</Text>
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
    progressText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginBottom: 8, opacity: 0.8 },
    progressTrack: { height: 5, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10, width: '100%', marginBottom: 24 },
    progressBar: { height: '100%', backgroundColor: Colors.botones || '#6A5ACD', borderRadius: 10 },
    contentBody: { width: '100%', height: 280, justifyContent: 'center' },
    questionWrapper: { alignItems: 'center', width: '100%', height: '100%' },
    questionTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    questionSubtitle: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: 10, marginBottom: 16 },

    // Pág 1: Edad
    pickerContainer: { width: '100%', height: 70, justifyContent: 'center', alignItems: 'center' },
    ageScrollContent: { paddingHorizontal: width / 2 - 58, alignItems: 'center' },
    ageItem: { width: 54, height: 54, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', justifyContent: 'center', alignItems: 'center', marginHorizontal: 7 },
    ageItemActive: { backgroundColor: Colors.botones || '#6A5ACD', borderColor: Colors.botones || '#6A5ACD' },
    ageText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', opacity: 0.7 },
    ageTextActive: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', opacity: 1.0 },

    // Pág 2: List Picker
    listPickerContainer: { width: '100%', flex: 1 },
    optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.04)', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: 'transparent' },
    optionRowActive: { backgroundColor: 'rgba(106, 90, 205, 0.15)', borderColor: Colors.botones || '#6A5ACD' },
    optionText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, flex: 1 },
    optionTextActive: { color: '#FFFFFF', fontWeight: '600' },
    radioCheck: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.botones || '#6A5ACD' },

    // Pág 3: Calendario
    calendarCard: { width: '100%', alignItems: 'center', marginTop: 10 },
    dateDisplay: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', backgroundColor: 'rgba(255, 255, 255, 0.06)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginBottom: 10, overflow: 'hidden' },
    dateDisplayButtonAndroid: { backgroundColor: 'rgba(255, 255, 255, 0.06)', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', marginTop: 20 },
    dateDisplayTextAndroid: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    nativePicker: { width: '100%', height: 160 },

    // Pág 4: Counter UI
    counterContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 20 },
    counterButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255, 255, 255, 0.06)', justifyContent: 'center', alignItems: 'center' },
    counterButtonText: { color: '#FFFFFF', fontSize: 24, fontWeight: '300' },
    counterValueWrapper: { alignItems: 'center', marginHorizontal: 35 },
    counterValue: { color: '#FFFFFF', fontSize: 48, fontWeight: 'bold' },
    counterUnit: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, marginTop: -4 },

    // Pág 5: Dual Counter
    dualCounterContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 10, paddingHorizontal: 10 },
    smallCounterBox: { flex: 1, alignItems: 'center' },
    smallCounterLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 13, marginBottom: 12 },
    smallCounterControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    smallCounterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.06)', justifyContent: 'center', alignItems: 'center' },
    smallCounterBtnText: { color: '#FFFFFF', fontSize: 20, fontWeight: '300' },
    smallCounterValue: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginHorizontal: 15, width: 35, textAlign: 'center' },
    counterDivider: { width: 1, height: 60, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginHorizontal: 10, marginTop: 20 },

    // Cuadrícula (ahora para Volumen)
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%', gap: 10, marginTop: 5 },
    gridItem: { width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.04)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
    gridItemActive: { backgroundColor: Colors.botones || '#6A5ACD', borderColor: Colors.botones || '#6A5ACD' },
    gridItemText: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 16, fontWeight: '600' },
    gridItemTextActive: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    gridFooterText: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 13, marginTop: 16 },

    // Medidor de intensidad (ahora para Duración de días)
    volumeContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '90%', gap: 8, marginTop: 5 },
    volumeItem: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255, 255, 255, 0.04)', justifyContent: 'center', alignItems: 'center' },
    volumeItemActive: { backgroundColor: 'rgba(106, 90, 205, 0.3)' },
    volumeItemHighlight: { backgroundColor: Colors.botones || '#6A5ACD', transform: [{ scale: 1.1 }] },
    volumeItemText: { color: 'rgba(255, 255, 255, 0.3)', fontSize: 15, fontWeight: 'bold' },
    volumeItemTextActive: { color: '#FFFFFF', opacity: 0.8 },
    volumeItemTextHighlight: { color: '#FFFFFF', fontSize: 17, opacity: 1 },
    volumeFooterText: { color: Colors.botones || '#6A5ACD', fontSize: 14, fontWeight: '600', marginTop: 20 },

    continueButton: { backgroundColor: Colors.botones || '#6A5ACD', width: '100%', paddingVertical: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
    continueButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
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
    clotTitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
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
    checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
    checkboxText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, flex: 1 },
    checkboxTextActive: { color: '#FFFFFF', fontWeight: '600' },

    // Pág 12: Ejercicio (Tarjetas Visuales de Energía)
    exerciseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'transparent' },
    exerciseCardActive: { backgroundColor: 'rgba(106, 90, 205, 0.15)', borderColor: Colors.botones || '#6A5ACD' },
    exerciseVisualContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', width: 35, height: 35, marginRight: 16, paddingBottom: 2 },
    energyBar: { width: 6, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 3 },
    energyBarActive: { backgroundColor: Colors.botones || '#6A5ACD' },
    exerciseTextContainer: { flex: 1 },
    exerciseTitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
    exerciseTitleActive: { color: '#FFFFFF' },
    exerciseSubtitle: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 },

    // Pág 13: Estrés (Custom Switch)
    stressContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
    stressLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 30 },
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

    sleepLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, fontWeight: '600' },
    sleepLabelActive: { color: '#FFFFFF', fontWeight: 'bold' },
    sleepDescriptionText: { color: Colors.botones || '#6A5ACD', fontSize: 14, textAlign: 'center', marginTop: 24, paddingHorizontal: 10, fontWeight: '500' }
});