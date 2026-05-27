import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../../styles/colors';
import { FONT_REGULAR, FONT_BOLD } from '../../styles/typography';
import BottomNavigation from '../../components/common/BottomNavigationBar';
import { guardarTrackingDiario, obtenerTrackingDiarioHoy } from '../../services/trackingService';
import { obtenerPerfilUsuario } from '../../services/firebaseConfig';
import dayjs from 'dayjs';
import { getMonthWithPhases } from '../../utils/dateHelpers';
import { CONSEJOS_FASES } from '../../utils/tipsData';

const flowColors = [
    { label: 'Rojo brillante', flag: 'bright_red', hex: '#C81D25' },
    { label: 'Marrón oscuro', flag: 'dark_brown_black', hex: '#4A1525' },
    { label: 'Rosado', flag: 'pale_pink', hex: '#FFB3B3' },
];

const symptomsList = [
    { id: 'colicos', label: 'Cólicos', flag: 'flag_symptom_pain' },
    { id: 'sensibilidad', label: 'Sensibilidad en senos', flag: 'flag_symptom_breast' },
    { id: 'acne', label: 'Acné', flag: 'flag_symptom_acne' },
    { id: 'cabezadolor', label: 'Dolor de cabeza', flag: 'inp_migraine_timing' },
    { id: 'sofocos', label: 'Sofocos', flag: 'flag_symptom_hotflashes' },
];

const digestionOptions = [
    { id: 'perfecta', label: 'Perfecta' },
    { id: 'hinchada', label: 'Hinchada' },
    { id: 'estreñida', label: 'Estreñida' },
    { id: 'diarrea', label: 'Diarrea' },
];

const energyOptions = [
    { id: 'alta', label: 'Alta' },
    { id: 'normal', label: 'Normal' },
    { id: 'baja', label: 'Fatiga' },
];

const moodOptions = [
    { id: 'feliz', label: 'Tranquila' },
    { id: 'ansiosa', label: 'Ansiosa' },
    { id: 'irritable', label: 'Irritable' },
    { id: 'triste', label: 'Triste' },
];

const stressOptions = [
    { id: 'relajada', label: 'Relajada' },
    { id: 'medio', label: 'Medio' },
    { id: 'alto', label: 'Alto' },
];

const sleepOptions = [
    { id: 'profundo', label: 'Profundo' },
    { id: 'interrumpido', label: 'Interrumpido' },
    { id: 'insomnio', label: 'Insomnio' },
];

const exerciseOptions = [
    { id: 'ninguno', label: 'Ninguno' },
    { id: 'suave', label: 'Suave' },
    { id: 'cardio', label: 'Cardio' },
    { id: 'fuerza', label: 'Fuerza' },
];

const timeOptions = [15, 30, 45, 60, 90];

// --- CONSTANTES SECCIÓN 4 (SEXUALIDAD Y FERTILIDAD) ---
const metodosHormonales = [
    'Pastillas combinadas', 'Mini-píldora (Solo Progesterona)',
    'DIU Hormonal (Mirena / Kyleena)', 'Implante subdérmico',
    'Parche', 'Anillo', 'Inyección'
];

const metodosBarreraNatural = [
    'Condón', 'DIU de Cobre', 'Coito interrumpido',
    'Ritmo', 'Moco Cervical', 'Temperatura Basal'
];

const cervicalFluidOptions = [
    { id: 'seco', label: 'Seco' },
    { id: 'cremoso', label: 'Cremoso' },
    { id: 'acuoso', label: 'Acuoso' },
    { id: 'clara_de_huevo', label: 'Clara de huevo' },
];

export default function TrackingScreen() {
    const [isPeriodActive, setIsPeriodActive] = useState(false);
    const [cargandoFirebase, setCargandoFirebase] = useState(true);

    const [isSymptomsOpen, setIsSymptomsOpen] = useState(false);
    const [isMindOpen, setIsMindOpen] = useState(false);

    const [showInfo, setShowInfo] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cantidad, setCantidad] = useState(0);
    const [selectedColor, setSelectedColor] = useState(null);
    const [hasClots, setHasClots] = useState(null);

    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [selectedDigestion, setSelectedDigestion] = useState(null);

    const [selectedEnergy, setSelectedEnergy] = useState(null);
    const [selectedMood, setSelectedMood] = useState(null);
    const [selectedStress, setSelectedStress] = useState(null);
    const [selectedSleep, setSelectedSleep] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [exerciseMinutes, setExerciseMinutes] = useState(null);

    // --- ESTADOS SECCIÓN 4 (SEXUALIDAD Y FERTILIDAD) ---
    const [isSexOpen, setIsSexOpen] = useState(false);
    const [userContraceptive, setUserContraceptive] = useState('Ninguno');
    const [isHormonal, setIsHormonal] = useState(false);

    const [selectedFluid, setSelectedFluid] = useState(null);
    const [sexPresent, setSexPresent] = useState(null);
    const [protectionType, setProtectionType] = useState(null);
    const [selectedProtection, setSelectedProtection] = useState(null);
    const [contraceptiveVerified, setContraceptiveVerified] = useState(null);

    const [notas, setNotas] = useState('');
    const [cargando, setCargando] = useState(false);
    const [mostrarResumen, setMostrarResumen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [themeColor, setThemeColor] = useState('#FFB6C1');

    useEffect(() => {
        const calcularColorDeFase = async () => {
            try {
                const resultado = await obtenerPerfilUsuario();

                if (resultado.success && resultado.data) {
                    const perfil = resultado.data;
                    const diasDelMes = getMonthWithPhases(dayjs(), perfil);
                    const diaDeHoy = diasDelMes.find(d => d.isToday === true);

                    let faseCalculada = 'folicular';

                    // Lógica de perfil artificial o natural
                    if (perfil.user_profile === 'ARTIFICIAL') {
                        if (diaDeHoy && diaDeHoy.phase === 'menstrual') {
                            faseCalculada = 'menstrual';
                        } else {
                            faseCalculada = 'folicular';
                        }
                    } else {
                        faseCalculada = diaDeHoy ? diaDeHoy.phase : 'folicular';
                    }

                    // Extraer el color de CONSEJOS_FASES
                    const infoFase = CONSEJOS_FASES[faseCalculada];
                    setThemeColor(infoFase?.colorTema || '#FFB6C1');
                }
            } catch (error) {
                console.error("Error al calcular la fase en Tracking:", error);
            } finally {
                setLoading(false);
            }
        };

        calcularColorDeFase();
    }, []);


    useFocusEffect(
        useCallback(() => {
            const cargarDatosDeHoy = async () => {
                try {
                    setCargandoFirebase(true);
                    const resultado = await obtenerTrackingDiarioHoy();

                    if (resultado.success && resultado.data) {
                        const data = resultado.data;

                        // 1. Mapeamos de vuelta los síntomas físicos (IDs correspondientes)
                        const symptomsArr = [];
                        if (data.cuerpo_sintomas?.flag_symptom_pain) symptomsArr.push('colicos');
                        if (data.cuerpo_sintomas?.flag_symptom_breast) symptomsArr.push('sensibilidad');
                        if (data.cuerpo_sintomas?.flag_symptom_acne) symptomsArr.push('acne');
                        if (data.cuerpo_sintomas?.inp_migraine_timing) symptomsArr.push('cabezadolor');
                        if (data.cuerpo_sintomas?.flag_symptom_hotflashes) symptomsArr.push('sofocos');
                        setSelectedSymptoms(symptomsArr);

                        // 2. Mapeamos el resto de los estados de tu formulario
                        setSelectedDigestion(data.cuerpo_sintomas?.digestion === 'none' ? null : data.cuerpo_sintomas?.digestion);
                        setSelectedEnergy(data.energia_mente?.bateria_energia === 'none' ? null : data.energia_mente?.bateria_energia);
                        setSelectedMood(data.energia_mente?.animo === 'none' ? null : data.energia_mente?.animo);
                        setSelectedStress(data.energia_mente?.flag_stress_level === 'none' ? null : data.energia_mente?.flag_stress_level);
                        setSelectedSleep(data.energia_mente?.inp_sleep_quality === 'none' ? null : data.energia_mente?.inp_sleep_quality);
                        setSelectedExercise(data.actividad_physica?.tipo_ejercicio === 'none' ? null : data.actividad_physica?.tipo_ejercicio);
                        setExerciseMinutes(data.actividad_physica?.minutos || null);
                        setSelectedFluid(data.sexualidad_fertilidad?.flujo_cervical === 'none' ? null : data.sexualidad_fertilidad?.flujo_cervical);
                        setNotas(data.notas || '');

                        // Datos del periodo
                        setSelectedProduct(data.flujo_menstrual?.metodo_utilizado === 'none' ? null : data.flujo_menstrual?.metodo_utilizado);
                        setCantidad(data.flujo_menstrual?.cantidad_registrada || 0);
                        setSelectedColor(data.flujo_menstrual?.color === 'none' ? null : data.flujo_menstrual?.color);
                        setHasClots(data.flujo_menstrual?.inp_clots ?? null);

                        // Activamos la vista de "Cajita de resumen"
                        setMostrarResumen(true);
                    } else {
                        // Si no hay datos guardados para hoy, aseguramos que se vea el formulario limpio
                        setMostrarResumen(false);
                    }
                } catch (error) {
                    console.error("Error al sincronizar datos de enfoque:", error);
                } finally {
                    setCargandoFirebase(false);
                }
            };

            cargarDatosDeHoy();
        }, [])
    );

    useEffect(() => {
        const verificarPeriodoActivo = async () => {
            try {
                setCargandoFirebase(true);
                const resultado = await obtenerPerfilUsuario();

                if (resultado.success && resultado.data) {
                    const userData = resultado.data;

                    // Extraer y configurar tipo de perfil anticonceptivo
                    const metodoGuardado = userData.inp_contraceptive || 'Ninguno';
                    setUserContraceptive(metodoGuardado);
                    setIsHormonal(metodosHormonales.includes(metodoGuardado));

                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0);

                    let periodoActivo = false;

                    if (userData.periods_history && userData.periods_history.length > 0) {
                        for (const periodo of userData.periods_history) {
                            const [yInicio, mInicio, dInicio] = periodo.startDate.split('-').map(Number);
                            const fechaInicio = new Date(yInicio, mInicio - 1, dInicio);
                            fechaInicio.setHours(0, 0, 0, 0);

                            const [yFin, mFin, dFin] = periodo.endDate.split('-').map(Number);
                            const fechaFin = new Date(yFin, mFin - 1, dFin);
                            fechaFin.setHours(0, 0, 0, 0);

                            if (hoy >= fechaInicio && hoy <= fechaFin) {
                                periodoActivo = true;
                                break;
                            }
                        }
                    }
                    setIsPeriodActive(periodoActivo);

                    if (!periodoActivo) {
                        setSelectedProduct(null);
                        setCantidad(0);
                        setSelectedColor(null);
                        setHasClots(null);
                    }
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setCargandoFirebase(false);
            }
        };
        verificarPeriodoActivo();
    }, []);

    const handleCounter = (operation) => {
        if (!isPeriodActive) return;
        const step = selectedProduct === 'copa' ? 5 : 1;
        if (operation === 'add') setCantidad(cantidad + step);
        if (operation === 'sub' && cantidad > 0) setCantidad(cantidad - step);
    };

    const handleProductChange = (productType) => {
        if (!isPeriodActive) return;
        setSelectedProduct(productType);
        setCantidad(0);
    };

    const toggleSymptom = (id) => {
        if (selectedSymptoms.includes(id)) {
            setSelectedSymptoms(selectedSymptoms.filter(s => s !== id));
        } else {
            setSelectedSymptoms([...selectedSymptoms, id]);
        }
    };

    const handleGuardarDatos = async () => {
        setCargando(true);

        let ml_calculados = 0;
        if (isPeriodActive) {
            if (selectedProduct === 'regular') ml_calculados = cantidad * 5;
            if (selectedProduct === 'nocturna') ml_calculados = cantidad * 10;
            if (selectedProduct === 'copa') ml_calculados = cantidad;
        }

        let volumen_flag = 'none';
        if (ml_calculados > 0 && ml_calculados <= 15) volumen_flag = 'light';
        if (ml_calculados > 15 && ml_calculados <= 30) volumen_flag = 'medium';
        if (ml_calculados > 30) volumen_flag = 'heavy';

        const sintomasAmigables = symptomsList
            .filter(s => selectedSymptoms.includes(s.id))
            .map(s => s.label.split(' / ')[0]);
        if (selectedDigestion === 'hinchada') sintomasAmigables.push("Hinchazón");

        const payload = {
            flujo_menstrual: {
                en_periodo: isPeriodActive,
                metodo_utilizado: isPeriodActive ? (selectedProduct || 'none') : 'none',
                cantidad_registrada: isPeriodActive ? cantidad : 0,
                ml_estimados_dia: ml_calculados,
                volumen_diario_calculado: volumen_flag,
                color: ml_calculados > 0 ? selectedColor : 'none',
                inp_clots: ml_calculados > 0 ? hasClots : false
            },
            sintomas_fisicos: sintomasAmigables,
            cuerpo_sintomas: {
                flag_symptom_pain: selectedSymptoms.includes('colicos'),
                flag_symptom_bloat: selectedDigestion === 'hinchada',
                flag_symptom_breast: selectedSymptoms.includes('sensibilidad'),
                flag_symptom_acne: selectedSymptoms.includes('acne'),
                inp_migraine_timing: selectedSymptoms.includes('cabezadolor'),
                flag_symptom_hotflashes: selectedSymptoms.includes('sofocos'),
                digestion: selectedDigestion || 'none',
            },
            energia_mente: {
                bateria_energia: selectedEnergy || 'none',
                animo: selectedMood || 'none',
                flag_stress_level: selectedStress || 'none',
                inp_sleep_quality: selectedSleep || 'none'
            },
            actividad_physica: {
                tipo_ejercicio: selectedExercise || 'none',
                minutos: selectedExercise && selectedExercise !== 'ninguno' ? (exerciseMinutes || 0) : 0
            },
            sexualidad_fertilidad: {
                flujo_cervical: selectedFluid || 'none',
                actividad_sexual: sexPresent === 'si'
                    ? (isHormonal ? 'si' : (protectionType || 'si'))
                    : (sexPresent === 'no' ? 'no' : 'none'),
                metodo_proteccion: (!isHormonal && protectionType === 'con_proteccion')
                    ? (selectedProtection || 'none')
                    : 'none',
                anticonceptivo_verificado: isHormonal ? (contraceptiveVerified === 'si') : false
            },
            notas: notas.trim(),
            ultima_actualizacion: new Date().toISOString()
        };

        const resultado = await guardarTrackingDiario(payload);
        setCargando(false);

        if (resultado.success) {
            Alert.alert("¡Guardado!", "Tus datos del día han sido sincronizados.");
            setMostrarResumen(true);
        } else {
            Alert.alert("Error", "Problema al conectar con la base de datos.");
        }
    };

    if (loading) return (
        <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={Colors.menstrual || '#C81D25'} />
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* El logo superior solo se muestra si NO estamos en la vista de resumen */}
            {!mostrarResumen && (
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../../assets/icons/Group_35.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
            )}

            <Image
                source={require('../../../assets/images/CircleLayer.png')}
                style={styles.blurBackground}
            />

            {mostrarResumen ? (
                /* =========================================================
                   VISTA DE LA CAJITA (RESUMEN DE SÍNTOMAS)
                   ========================================================= */
                <View style={styles.summaryCenterContainer}>
                    <View style={styles.summaryCardTransparent}>

                        {/* Logo Bloom más grande integrado en el resumen */}
                        <Image
                            source={require('../../../assets/icons/Group_35.png')}
                            style={styles.logoLarge}
                            resizeMode="contain"
                        />

                        <Text style={[styles.sectionTitle, { marginBottom: 15, textAlign: 'center' }]}>
                            Síntomas Registrados Hoy
                        </Text>

                        <Text style={{ color: '#666', textAlign: 'center', marginBottom: 35, fontSize: 16, lineHeight: 22 }}>
                            Ya guardaste tu registro de hoy.
                        </Text>

                        <TouchableOpacity
                            style={[styles.transparentAccentButton, { backgroundColor: themeColor }]}
                            onPress={() => setMostrarResumen(false)}
                        >
                            <Text style={[styles.productPillText, { color: '#000', fontWeight: 'bold' }]}>
                                Editar Registro
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                /* =========================================================
                   VISTA DEL FORMULARIO ORIGINAL
                   ========================================================= */
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <Text style={[styles.screenSubtitle, { color: themeColor }]}>Registra tus síntomas de hoy</Text>

                    {/* --- SECCIÓN 1: CONTROL DE FLUJO --- */}
                    <View style={styles.moduleContainer}>
                        <View style={styles.titleHeaderRow}>
                            <Text style={styles.sectionTitle}>Control de Flujo</Text>
                        </View>

                        {!isPeriodActive ? (
                            <View style={styles.emptyStateBox}>
                                <Text style={styles.emptyStateTitle}>Fuera de periodo</Text>
                                <Text style={styles.emptyStateText}>
                                    Puedes ajustar las fechas desde tu calendario principal.
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.staticContent}>
                                <Text style={styles.labelSub}>¿Qué producto utilizaste hoy?</Text>
                                <View style={styles.row}>
                                    <TouchableOpacity
                                        style={[
                                            styles.productPill,
                                            selectedProduct === 'regular' && styles.singleSelectedPill,
                                            selectedProduct === 'regular' && { backgroundColor: themeColor, borderColor: themeColor }
                                        ]}
                                        onPress={() => handleProductChange('regular')}
                                    >
                                        <Text style={[styles.productPillText, selectedProduct === 'regular' && styles.singleSelectedText]}>
                                            Regulares
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.productPill,
                                            selectedProduct === 'nocturna' && styles.singleSelectedPill,
                                            selectedProduct === 'nocturna' && { backgroundColor: themeColor, borderColor: themeColor }
                                        ]}
                                        onPress={() => handleProductChange('nocturna')}
                                    >
                                        <Text style={[styles.productPillText, selectedProduct === 'nocturna' && styles.singleSelectedText]}>
                                            Nocturnas
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.productPill,
                                            selectedProduct === 'copa' && styles.singleSelectedPill,
                                            selectedProduct === 'copa' && { backgroundColor: themeColor, borderColor: themeColor }
                                        ]}
                                        onPress={() => handleProductChange('copa')}
                                    >
                                        <Text style={[styles.productPillText, selectedProduct === 'copa' && styles.singleSelectedText]}>
                                            Copa Menstrual
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Pregunta de coágulos (ahora independiente del contador) */}
                                <Text style={styles.labelSubMargin}>¿Identificaste presencia de coágulos?</Text>
                                <View style={styles.row}>
                                    <TouchableOpacity
                                        disabled={!isPeriodActive}
                                        style={[
                                            styles.productPill,
                                            hasClots === false && styles.singleSelectedPill,
                                            hasClots === false && { backgroundColor: themeColor, borderColor: themeColor }
                                        ]}
                                        onPress={() => setHasClots(false)}
                                    >
                                        <Text style={[styles.productPillText, hasClots === false && styles.singleSelectedText]}>No</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        disabled={!isPeriodActive}
                                        style={[
                                            styles.productPill,
                                            hasClots === true && styles.singleSelectedPill,
                                            hasClots === true && { backgroundColor: themeColor, borderColor: themeColor }
                                        ]}
                                        onPress={() => setHasClots(true)}
                                    >
                                        <Text style={[styles.productPillText, hasClots === true && styles.singleSelectedText]}>Sí</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                    {/* FIN SECCIÓN 1 */}

                    {/* --- SECCIÓN 2: CUERPO Y SÍNTOMAS --- */}
                    <View style={[styles.moduleContainer, { marginTop: 15 }]}>
                        <View style={styles.titleHeaderRow}>
                            <Text style={styles.sectionTitle}>Cuerpo y Síntomas</Text>
                        </View>

                        <View style={styles.staticContent}>
                            <Text style={styles.labelSub}>Síntomas Físicos:</Text>
                            <View style={styles.row}>
                                {symptomsList.map(symptom => (
                                    <TouchableOpacity
                                        key={symptom.id}
                                        style={[
                                            styles.productPill,
                                            selectedSymptoms.includes(symptom.id) && styles.singleSelectedPill,
                                            selectedSymptoms.includes(symptom.id) && { backgroundColor: themeColor, borderColor: themeColor }
                                        ]}
                                        onPress={() => toggleSymptom(symptom.id)}
                                    >
                                        <Text style={[styles.productPillText, selectedSymptoms.includes(symptom.id) && styles.singleSelectedText]}>{symptom.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.labelSubMargin}>Estado de tu digestión:</Text>
                            <View style={styles.row}>
                                {digestionOptions.map(option => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.productPill,
                                            selectedDigestion === option.id && styles.singleSelectedPill,
                                            selectedDigestion === option.id && { backgroundColor: themeColor, borderColor: themeColor }
                                        ]}
                                        onPress={() => setSelectedDigestion(option.id)}
                                    >
                                        <Text style={[styles.productPillText, selectedDigestion === option.id && styles.singleSelectedText]}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                    {/* FIN SECCIÓN 2 */}

                    {/* --- SECCIÓN 3: ENERGÍA Y MENTE --- */}
                    <View style={[styles.moduleContainer, { marginTop: 15 }]}>
                        <View style={styles.titleHeaderRow}>
                            <Text style={styles.sectionTitle}>Energía y Mente</Text>
                        </View>

                        <View style={styles.staticContent}>
                            <Text style={styles.labelSub}>Nivel de Energía (Batería):</Text>
                            <View style={styles.row}>
                                {energyOptions.map(option => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.productPill,
                                            selectedEnergy === option.id && styles.singleSelectedPill,
                                            selectedEnergy === option.id && { backgroundColor: themeColor, borderColor: themeColor }
                                        ]}
                                        onPress={() => setSelectedEnergy(option.id)}
                                    >
                                        <Text style={[styles.productPillText, selectedEnergy === option.id && styles.singleSelectedText]}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.labelSubMargin}>Estado de Ánimo:</Text>
                            <View style={styles.row}>
                                {moodOptions.map(option => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.productPill,
                                            selectedMood === option.id && styles.singleSelectedPill,
                                            selectedMood === option.id && { backgroundColor: themeColor, borderColor: themeColor }
                                        ]}
                                        onPress={() => setSelectedMood(option.id)}
                                    >
                                        <Text style={[styles.productPillText, selectedMood === option.id && styles.singleSelectedText]}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.labelSubMargin}>Nivel de Estrés:</Text>
                            <View style={styles.row}>
                                {stressOptions.map(option => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.productPill,
                                            selectedStress === option.id && styles.singleSelectedPill,
                                            selectedStress === option.id && { backgroundColor: themeColor, borderColor: themeColor }
                                        ]}
                                        onPress={() => setSelectedStress(option.id)}
                                    >
                                        <Text style={[styles.productPillText, selectedStress === option.id && styles.singleSelectedText]}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.labelSubMargin}>Calidad del Sueño:</Text>
                            <View style={styles.row}>
                                {sleepOptions.map(option => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.productPill,
                                            selectedSleep === option.id && styles.singleSelectedPill,
                                            selectedSleep === option.id && { backgroundColor: themeColor, borderColor: themeColor }
                                        ]}
                                        onPress={() => setSelectedSleep(option.id)}
                                    >
                                        <Text style={[styles.productPillText, selectedSleep === option.id && styles.singleSelectedText]}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.labelSubMargin}>Ejercicio Físico:</Text>
                            <View style={styles.row}>
                                {exerciseOptions.map(option => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.productPill,
                                            selectedExercise === option.id && styles.singleSelectedPill,
                                            selectedExercise === option.id && { backgroundColor: themeColor, borderColor: themeColor }
                                        ]}
                                        onPress={() => {
                                            setSelectedExercise(option.id);
                                            if (option.id === 'ninguno') setExerciseMinutes(null);
                                        }}
                                    >
                                        <Text style={[styles.productPillText, selectedExercise === option.id && styles.singleSelectedText]}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {selectedExercise && selectedExercise !== 'ninguno' && (
                                <View style={styles.timeInputContainer}>
                                    <Text style={styles.labelSubMargin}>Duración aproximada:</Text>
                                    <View style={styles.row}>
                                        {timeOptions.map(time => (
                                            <TouchableOpacity
                                                key={time}
                                                style={[
                                                    styles.productPill,
                                                    exerciseMinutes === time && styles.singleSelectedPill,
                                                    exerciseMinutes === time && { backgroundColor: themeColor, borderColor: themeColor }
                                                ]}
                                                onPress={() => setExerciseMinutes(time)}
                                            >
                                                <Text style={[styles.productPillText, exerciseMinutes === time && styles.singleSelectedText]}>{time} min</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                    {/* FIN SECCIÓN 3 */}

                    {/* --- SECCIÓN 4: SEXUALIDAD Y FERTILIDAD --- */}
                    <View style={[styles.moduleContainer, { marginTop: 15 }]}>
                        <View style={styles.titleHeaderRow}>
                            <Text style={styles.sectionTitle}>Sexualidad y Fertilidad</Text>
                        </View>

                        <View style={styles.staticContent}>
                            <Text style={styles.labelSub}>Flujo Cervical:</Text>
                            <View style={styles.row}>
                                {cervicalFluidOptions.map(option => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.productPill,
                                            selectedFluid === option.id && styles.singleSelectedPill,
                                            selectedFluid === option.id && { backgroundColor: themeColor, borderColor: themeColor }
                                        ]}
                                        onPress={() => setSelectedFluid(option.id)}
                                    >
                                        <Text style={[styles.productPillText, selectedFluid === option.id && styles.singleSelectedText]}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.labelSubMargin}>Relaciones sexuales:</Text>
                            <View style={styles.row}>
                                <TouchableOpacity
                                    style={[
                                        styles.productPill,
                                        sexPresent === 'si' && styles.singleSelectedPill,
                                        sexPresent === 'si' && { backgroundColor: themeColor, borderColor: themeColor }
                                    ]}
                                    onPress={() => { setSexPresent('si'); setProtectionType(null); setSelectedProtection(null); }}
                                >
                                    <Text style={[styles.productPillText, sexPresent === 'si' && styles.singleSelectedText]}>Sí</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.productPill,
                                        sexPresent === 'no' && styles.singleSelectedPill,
                                        sexPresent === 'no' && { backgroundColor: themeColor, borderColor: themeColor }
                                    ]}
                                    onPress={() => { setSexPresent('no'); setProtectionType(null); setSelectedProtection(null); }}
                                >
                                    <Text style={[styles.productPillText, sexPresent === 'no' && styles.singleSelectedText]}>No</Text>
                                </TouchableOpacity>
                            </View>

                            {/* FLUJO PERFIL NATURAL */}
                            {!isHormonal && sexPresent === 'si' && (
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.labelSubMargin}>Protección utilizada:</Text>
                                    <View style={styles.row}>
                                        <TouchableOpacity
                                            style={[
                                                styles.productPill,
                                                protectionType === 'con_proteccion' && styles.singleSelectedPill,
                                                protectionType === 'con_proteccion' && { backgroundColor: themeColor, borderColor: themeColor }
                                            ]}
                                            onPress={() => { setProtectionType('con_proteccion'); setSelectedProtection(null); }}
                                        >
                                            <Text style={[styles.productPillText, protectionType === 'con_proteccion' && styles.singleSelectedText]}>Con protección</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.productPill,
                                                protectionType === 'sin_proteccion' && styles.singleSelectedPill,
                                                protectionType === 'sin_proteccion' && { backgroundColor: themeColor, borderColor: themeColor }
                                            ]}
                                            onPress={() => { setProtectionType('sin_proteccion'); setSelectedProtection(null); }}
                                        >
                                            <Text style={[styles.productPillText, protectionType === 'sin_proteccion' && styles.singleSelectedText]}>Sin protección</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {protectionType === 'con_proteccion' && (
                                        <View style={{ marginTop: 10 }}>
                                            <Text style={styles.labelSubMargin}>Método de barrera o natural:</Text>
                                            <View style={styles.row}>
                                                {metodosBarreraNatural.map(metodo => (
                                                    <TouchableOpacity
                                                        key={metodo}
                                                        style={[
                                                            styles.productPill,
                                                            selectedProtection === metodo && styles.singleSelectedPill,
                                                            selectedProtection === metodo && { backgroundColor: themeColor, borderColor: themeColor }
                                                        ]}
                                                        onPress={() => setSelectedProtection(metodo)}
                                                    >
                                                        <Text style={[styles.productPillText, selectedProtection === metodo && styles.singleSelectedText]}>{metodo}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* FLUJO PERFIL ARTIFICIAL / HORMONAL */}
                            {isHormonal && (
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.labelSubMargin}>¿Verificaste tu método hoy? ({userContraceptive})</Text>
                                    <View style={styles.row}>
                                        <TouchableOpacity
                                            style={[
                                                styles.productPill,
                                                contraceptiveVerified === 'si' && styles.singleSelectedPill,
                                                contraceptiveVerified === 'si' && { backgroundColor: themeColor, borderColor: themeColor }
                                            ]}
                                            onPress={() => setContraceptiveVerified('si')}
                                        >
                                            <Text style={[styles.productPillText, contraceptiveVerified === 'si' && styles.singleSelectedText]}>Sí</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.productPill,
                                                contraceptiveVerified === 'no' && styles.singleSelectedPill,
                                                contraceptiveVerified === 'no' && { backgroundColor: themeColor, borderColor: themeColor }
                                            ]}
                                            onPress={() => setContraceptiveVerified('no')}
                                        >
                                            <Text style={[styles.productPillText, contraceptiveVerified === 'no' && styles.singleSelectedText]}>No</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                    {/* FIN SECCIÓN 4 */}

                    {/* --- SECCIÓN 5: NOTAS --- */}
                    <View style={[styles.moduleContainer, { marginTop: 15, marginBottom: 20 }]}>
                        <Text style={styles.sectionTitle}>Notas del día</Text>
                        <Text style={styles.labelSub}>
                            Espacio libre para registrar cómo te sientes, antojos o cualquier detalle importante.
                        </Text>
                        <TextInput
                            style={styles.textInputStyle}
                            multiline
                            value={notas}
                            onChangeText={setNotas}
                            placeholder="Escribe algo sobre tu día..."
                            placeholderTextColor="#666"
                        />
                    </View>
                    {/* FIN SECCIÓN 5 */}

                    {/* BOTÓN GUARDAR */}
                    <TouchableOpacity
                        style={[
                            styles.transparentAccentButton,
                            { backgroundColor: themeColor },
                            cargando && { opacity: 0.6 }
                        ]}
                        onPress={handleGuardarDatos}
                        disabled={cargando}
                    >
                        <Text style={styles.saveButtonText}>
                            {cargando ? "Guardando..." : "Guardar Registro"}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            )}
            <BottomNavigation />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.fondo },
    scrollContent: { padding: 20, paddingBottom: 140 },
    title: { color: 'white', fontSize: 34, fontWeight: '800', fontFamily: FONT_BOLD },
    moduleContainer: { borderRadius: 16, backgroundColor: '#0D0D1E', padding: 18, position: 'relative', overflow: 'hidden' },
    moduleLocked: { opacity: 0.25 },
    collapsibleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
    collapsibleContent: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#2E2E42', paddingTop: 10 },
    arrowIcon: { color: '#AAA', fontSize: 14, fontWeight: 'bold', fontFamily: FONT_BOLD },
    titleHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    sectionTitle: { color: 'white', fontSize: 18, fontWeight: '700', fontFamily: FONT_BOLD },
    tooltipBox: { backgroundColor: '#1A1A2E', padding: 12, borderRadius: 10, marginBottom: 15, borderColor: '#2E2E42', borderWidth: 1 },
    tooltipText: { color: '#BBB', fontSize: 12, lineHeight: 16, fontFamily: FONT_REGULAR },
    labelSub: { color: '#888', fontSize: 13, marginBottom: 10, marginTop: 10, fontFamily: FONT_REGULAR },
    labelSubMargin: { color: '#888', fontSize: 13, marginBottom: 12, marginTop: 20, fontFamily: FONT_REGULAR },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

    logoContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 10, backgroundColor: Colors.fondo, borderBottomWidth: 1, borderBottomColor: '#1A1A2E' },
    logo: { width: 120, height: 40 },
    blurBackground: { position: 'absolute', top: 80, right: -80, width: 280, height: 280, zIndex: -1 },
    questionText: { color: 'white', fontSize: 16, fontFamily: FONT_BOLD, marginBottom: 12 },

    // ------------------------------------------
    // FRASE PRINCIPAL (Ajustada para fondo oscuro)
    // ------------------------------------------
    screenSubtitle: {
        fontSize: 22,
        fontWeight: '900', // Máximo grosor para que no se vea pálida
        color: '#FFF',     // Blanco puro para resaltar en el fondo oscuro
        textAlign: 'center',
        marginVertical: 15,
    },

    // ------------------------------------------
    // UNIFICACIÓN DE COLOR (Seleccionado)
    // ------------------------------------------
    singleSelectedPill: {
        backgroundColor: '#333',
        borderColor: '#333',
        borderWidth: 1,
    },
    singleSelectedText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    // ------------------------------------------
    // CAJITA DE RESUMEN (Centrada y Transparente)
    // ------------------------------------------
    summaryCenterContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    summaryCard: {
        width: '100%',
        minHeight: 280,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    summaryCardTransparent: {
        width: '100%',
        minHeight: 280,
        backgroundColor: 'transparent', // Sin cajita blanca
        padding: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoLarge: {
        width: 140, // Logo más grande para el centro
        height: 60,
        marginBottom: 20,
    },

    // ------------------------------------------
    // BOTONES SEMI-TRANSPARENTES (Fase)
    // ------------------------------------------
    transparentAccentButton: {
        backgroundColor: 'rgba(200, 29, 37, 0.7)',
        borderRadius: 15,
        paddingHorizontal: 40,
        paddingVertical: 14,
        alignItems: 'center',
        width: '100%',
    },

    staticContent: {
        marginTop: 10,
    },

    emptyStateBox: { backgroundColor: '#1A1A2E', padding: 20, borderRadius: 16, alignItems: 'center', marginTop: 10 },
    emptyStateIcon: { fontSize: 30, marginBottom: 10 },
    emptyStateTitle: { color: 'white', fontSize: 16, fontFamily: FONT_BOLD, marginBottom: 5 },
    emptyStateText: { color: '#888', fontSize: 13, fontFamily: FONT_REGULAR, textAlign: 'center', lineHeight: 18 },
    cardsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    productCard: { flex: 1, backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#2E2E42', borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    productCardActive: { borderColor: Colors.menstrual || '#C81D25', backgroundColor: '#4A1525' },
    productCardText: { color: '#AAA', fontSize: 13, fontFamily: FONT_REGULAR, textAlign: 'center' },
    productCardTextActive: { color: 'white', fontFamily: FONT_BOLD },

    // --- ESTILOS DE PÍLDORAS BASE ---
    productPill: { backgroundColor: '#1A1A2E', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginBottom: 4 },
    productPillText: { color: 'white', fontSize: 13, fontWeight: '600', fontFamily: FONT_REGULAR },

    // --- COLORES ACTIVOS POR CATEGORÍA ---
    productPillSelected: { backgroundColor: Colors.menstrual || '#C81D25' },
    symptomPillSelected: { backgroundColor: '#4A1525' },
    digestionPillSelected: { backgroundColor: '#2E2E42' },
    energyPillSelected: { backgroundColor: '#6A5ACD' },
    moodPillSelected: { backgroundColor: '#F4B41A' },
    stressPillSelected: { backgroundColor: '#D9534F' },
    sleepPillSelected: { backgroundColor: '#5BC0DE' },
    exercisePillSelected: { backgroundColor: '#5CB85C' },

    // --- ESTILOS BOTONES DE TIEMPO ---
    timeInputContainer: { marginTop: 5 },
    timePill: { backgroundColor: '#0D0D1E', borderWidth: 1, borderColor: '#2E2E42', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, marginBottom: 4 },
    timePillSelected: { backgroundColor: '#5CB85C', borderColor: '#5CB85C' },
    timePillText: { color: 'white', fontSize: 13, fontWeight: '600', fontFamily: FONT_REGULAR },

    counterSection: { marginTop: 15, backgroundColor: '#1A1A2E', padding: 12, borderRadius: 12 },
    counterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    counterUnitText: { color: 'white', fontSize: 18, fontWeight: '700', paddingLeft: 5, fontFamily: FONT_BOLD },
    counterControls: { flexDirection: 'row', gap: 5 },
    counterBtn: { width: 40, height: 40, backgroundColor: '#0D0D1E', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    counterBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold', fontFamily: FONT_BOLD },
    conditionalSection: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#2E2E42', paddingTop: 5 },
    clotButton: { flex: 1, backgroundColor: '#1A1A2E', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    clotButtonNoSelected: { backgroundColor: '#2E2E42' },
    clotButtonYesSelected: { backgroundColor: Colors.menstrual || '#C81D25' },
    clotButtonText: { color: 'white', fontSize: 15, fontWeight: '700', fontFamily: FONT_BOLD },
    saveButton: { backgroundColor: 'white', borderRadius: 25, paddingVertical: 15, alignItems: 'center', marginTop: 30 },
    saveButtonText: { color: '#000', fontSize: 16, fontWeight: '800', fontFamily: FONT_BOLD },

    // --- ESTILOS SECCIÓN 4 (SEXUALIDAD) ---
    fluidPillSelected: { backgroundColor: '#E91E63' },
    sexPillGenericSelected: { backgroundColor: '#2E2E42' },
    sexNeutralSelected: { backgroundColor: '#8E44AD' },
    sexSafeSelected: { backgroundColor: '#3498DB' },
    sexUnsafeSelected: { backgroundColor: '#E74C3C' },
    protectionSelected: { backgroundColor: '#4A1525' },
    verificationSuccessSelected: { backgroundColor: '#5CB85C' },

    // --- INPUT NOTAS ---
    textInputStyle: {
        borderWidth: 1,
        borderColor: '#2E2E42',
        backgroundColor: '#1A1A2E',
        color: 'white',
        borderRadius: 12,
        padding: 15,
        minHeight: 100,
        textAlignVertical: 'top',
        marginTop: 5,
        fontSize: 14,
    },
});