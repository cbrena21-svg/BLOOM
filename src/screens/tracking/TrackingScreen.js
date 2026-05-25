import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../../styles/colors';
import { FONT_REGULAR, FONT_BOLD } from '../../styles/typography';
import BottomNavigation from '../../components/common/BottomNavigationBar';
import { guardarTrackingDiario } from '../../services/trackingService';
import { obtenerPerfilUsuario } from '../../services/firebaseConfig';

const flowColors = [
    { label: 'Brillante', flag: 'bright_red', hex: '#C81D25' },
    { label: 'Oscuro / Marrón', flag: 'dark_brown_black', hex: '#4A1525' },
    { label: 'Rosado', flag: 'pale_pink', hex: '#FFB3B3' },
];

const symptomsList = [
    { id: 'colicos', label: 'Cólicos / Dolor abdominal', flag: 'flag_symptom_pain' },
    { id: 'sensibilidad', label: 'Sensibilidad en senos', flag: 'flag_symptom_breast' },
    { id: 'acne', label: 'Acné', flag: 'flag_symptom_acne' },
    { id: 'cabezadolor', label: 'Dolor de cabeza', flag: 'inp_migraine_timing' },
    { id: 'sofocos', label: 'Sofocos', flag: 'flag_symptom_hotflashes' },
];

const digestionOptions = [
    { id: 'perfecta', label: 'Perfecta 👌' },
    { id: 'hinchada', label: 'Hinchada 🎈' },
    { id: 'estreñida', label: 'Estreñida 🐢' },
    { id: 'diarrea', label: 'Diarrea 🏃‍♀️' },
];

const energyOptions = [
    { id: 'alta', label: 'Alta 🔋' },
    { id: 'normal', label: 'Normal ⚡' },
    { id: 'baja', label: 'Fatiga 🪫' },
];

const moodOptions = [
    { id: 'feliz', label: 'Feliz / Tranquila ✨' },
    { id: 'ansiosa', label: 'Ansiosa 🌪️' },
    { id: 'irritable', label: 'Irritable 🌩️' },
    { id: 'triste', label: 'Triste 🌧️' },
];

const stressOptions = [
    { id: 'relajada', label: 'Relajada 🧘‍♀️' },
    { id: 'medio', label: 'Medio ⚖️' },
    { id: 'alto', label: 'Alto 🌋' },
];

const sleepOptions = [
    { id: 'profundo', label: 'Profundo 🛌' },
    { id: 'interrumpido', label: 'Interrumpido 🕰️' },
    { id: 'insomnio', label: 'Insomnio 🦉' },
];

const exerciseOptions = [
    { id: 'ninguno', label: 'Ninguno' },
    { id: 'suave', label: 'Suave (Yoga, Caminata)' },
    { id: 'cardio', label: 'Cardio (Correr, Bici)' },
    { id: 'fuerza', label: 'Fuerza (Pesas)' },
];

const timeOptions = [15, 30, 45, 60, 90];

// --- CONSTANTES SECCIÓN 4 (SEXUALIDAD Y FERTILIDAD) ---
const metodosHormonales = [
    'Pastillas combinadas', 'Mini-píldora (Solo Progesterona)',
    'DIU Hormonal (Mirena / Kyleena)', 'Implante subdérmico',
    'Parche', 'Anillo', 'Inyección'
];

const metodosBarreraNatural = [
    'Condón', 'DIU de Cobre (No hormonal)', 'Coito interrumpido',
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
        } else {
            Alert.alert("Error", "Problema al conectar con la base de datos.");
        }
    };

    if (cargandoFirebase) return (
        <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={Colors.menstrual || '#C81D25'} />
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Tracking Diario</Text>

                {/* --- SECCIÓN 1: REGISTRO DE SANGRADO --- */}
                <View style={[styles.moduleContainer, !isPeriodActive && styles.moduleLocked]}>
                    <View style={styles.titleHeaderRow}>
                        <Text style={styles.sectionTitle}>Registro de Sangrado</Text>
                        <TouchableOpacity style={styles.infoIconCircle} onPress={() => setShowInfo(!showInfo)}>
                            <Text style={styles.infoIconText}>i</Text>
                        </TouchableOpacity>
                    </View>

                    {showInfo && (
                        <View style={styles.tooltipBox}>
                            <Text style={styles.tooltipText}>
                                Indica la cantidad de productos sanitarios llenados hoy para calcular con precisión tus mililitros (ml) perdidos.
                            </Text>
                        </View>
                    )}

                    <Text style={styles.labelSub}>¿Qué producto utilizaste hoy?</Text>
                    <View style={styles.row}>
                        <TouchableOpacity disabled={!isPeriodActive} style={[styles.productPill, selectedProduct === 'regular' && styles.productPillSelected]} onPress={() => handleProductChange('regular')}>
                            <Text style={styles.productPillText}>Toallas / Tampones Regulares</Text>
                        </TouchableOpacity>
                        <TouchableOpacity disabled={!isPeriodActive} style={[styles.productPill, selectedProduct === 'nocturna' && styles.productPillSelected]} onPress={() => handleProductChange('nocturna')}>
                            <Text style={styles.productPillText}>Nocturnas / Extra Absorción</Text>
                        </TouchableOpacity>
                        <TouchableOpacity disabled={!isPeriodActive} style={[styles.productPill, selectedProduct === 'copa' && styles.productPillSelected]} onPress={() => handleProductChange('copa')}>
                            <Text style={styles.productPillText}>Copa Menstrual</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedProduct && (
                        <View style={styles.counterSection}>
                            <Text style={styles.labelSub}>Cantidad totalmente llenada hoy:</Text>
                            <View style={styles.counterRow}>
                                <Text style={styles.counterUnitText}>{selectedProduct === 'copa' ? `${cantidad} ml` : `${cantidad} piezas`}</Text>
                                <View style={styles.counterControls}>
                                    <TouchableOpacity disabled={!isPeriodActive} style={styles.counterBtn} onPress={() => handleCounter('sub')}>
                                        <Text style={styles.counterBtnText}>-</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity disabled={!isPeriodActive} style={styles.counterBtn} onPress={() => handleCounter('add')}>
                                        <Text style={styles.counterBtnText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}

                    {cantidad > 0 && (
                        <View style={styles.conditionalSection}>
                            <Text style={styles.labelSubMargin}>Color predominante:</Text>
                            <View style={styles.colorRow}>
                                {flowColors.map(item => (
                                    <TouchableOpacity disabled={!isPeriodActive} key={item.flag} style={styles.colorItemContainer} onPress={() => setSelectedColor(item.flag)}>
                                        <View style={[styles.colorCircle, { backgroundColor: item.hex }, selectedColor === item.flag && styles.colorCircleSelected]} />
                                        <Text style={styles.colorCircleLabel}>{item.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.labelSubMargin}>¿Identificaste presencia de coágulos?</Text>
                            <View style={styles.clotsRow}>
                                <TouchableOpacity disabled={!isPeriodActive} style={[styles.clotButton, hasClots === false && styles.clotButtonNoSelected]} onPress={() => setHasClots(false)}>
                                    <Text style={styles.clotButtonText}>No</Text>
                                </TouchableOpacity>
                                <TouchableOpacity disabled={!isPeriodActive} style={[styles.clotButton, hasClots === true && styles.clotButtonYesSelected]} onPress={() => setHasClots(true)}>
                                    <Text style={styles.clotButtonText}>Sí</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* --- SECCIÓN 2: CUERPO Y SÍNTOMAS --- */}
                <View style={[styles.moduleContainer, { marginTop: 15 }]}>
                    <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setIsSymptomsOpen(!isSymptomsOpen)} activeOpacity={0.7}>
                        <Text style={styles.sectionTitle}>Cuerpo y Síntomas</Text>
                        <Text style={styles.arrowIcon}>{isSymptomsOpen ? '▲' : '▼'}</Text>
                    </TouchableOpacity>

                    {isSymptomsOpen && (
                        <View style={styles.collapsibleContent}>
                            <Text style={styles.labelSub}>Síntomas Físicos:</Text>
                            <View style={styles.row}>
                                {symptomsList.map(symptom => (
                                    <TouchableOpacity key={symptom.id} style={[styles.productPill, selectedSymptoms.includes(symptom.id) && styles.symptomPillSelected]} onPress={() => toggleSymptom(symptom.id)}>
                                        <Text style={styles.productPillText}>{symptom.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.labelSubMargin}>Estado de tu digestión:</Text>
                            <View style={styles.row}>
                                {digestionOptions.map(option => (
                                    <TouchableOpacity key={option.id} style={[styles.productPill, selectedDigestion === option.id && styles.digestionPillSelected]} onPress={() => setSelectedDigestion(option.id)}>
                                        <Text style={styles.productPillText}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* --- SECCIÓN 3: ENERGÍA Y MENTE --- */}
                <View style={[styles.moduleContainer, { marginTop: 15 }]}>
                    <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setIsMindOpen(!isMindOpen)} activeOpacity={0.7}>
                        <Text style={styles.sectionTitle}>Energía y Mente</Text>
                        <Text style={styles.arrowIcon}>{isMindOpen ? '▲' : '▼'}</Text>
                    </TouchableOpacity>

                    {isMindOpen && (
                        <View style={styles.collapsibleContent}>
                            <Text style={styles.labelSub}>Nivel de Energía (Batería):</Text>
                            <View style={styles.row}>
                                {energyOptions.map(option => (
                                    <TouchableOpacity key={option.id} style={[styles.productPill, selectedEnergy === option.id && styles.energyPillSelected]} onPress={() => setSelectedEnergy(option.id)}>
                                        <Text style={styles.productPillText}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.labelSubMargin}>Estado de Ánimo:</Text>
                            <View style={styles.row}>
                                {moodOptions.map(option => (
                                    <TouchableOpacity key={option.id} style={[styles.productPill, selectedMood === option.id && styles.moodPillSelected]} onPress={() => setSelectedMood(option.id)}>
                                        <Text style={styles.productPillText}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.labelSubMargin}>Nivel de Estrés:</Text>
                            <View style={styles.row}>
                                {stressOptions.map(option => (
                                    <TouchableOpacity key={option.id} style={[styles.productPill, selectedStress === option.id && styles.stressPillSelected]} onPress={() => setSelectedStress(option.id)}>
                                        <Text style={styles.productPillText}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.labelSubMargin}>Calidad del Sueño:</Text>
                            <View style={styles.row}>
                                {sleepOptions.map(option => (
                                    <TouchableOpacity key={option.id} style={[styles.productPill, selectedSleep === option.id && styles.sleepPillSelected]} onPress={() => setSelectedSleep(option.id)}>
                                        <Text style={styles.productPillText}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.labelSubMargin}>Ejercicio Físico:</Text>
                            <View style={styles.row}>
                                {exerciseOptions.map(option => (
                                    <TouchableOpacity key={option.id} style={[styles.productPill, selectedExercise === option.id && styles.exercisePillSelected]} onPress={() => {
                                        setSelectedExercise(option.id);
                                        if (option.id === 'ninguno') setExerciseMinutes(null);
                                    }}>
                                        <Text style={styles.productPillText}>{option.label}</Text>
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
                                                    styles.timePill,
                                                    exerciseMinutes === time && styles.timePillSelected
                                                ]}
                                                onPress={() => setExerciseMinutes(time)}
                                            >
                                                <Text style={styles.timePillText}>{time} min</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* --- SECCIÓN 4: SEXUALIDAD Y FERTILIDAD --- */}
                <View style={[styles.moduleContainer, { marginTop: 15 }]}>
                    <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setIsSexOpen(!isSexOpen)} activeOpacity={0.7}>
                        <Text style={styles.sectionTitle}>Sexualidad y Fertilidad</Text>
                        <Text style={styles.arrowIcon}>{isSexOpen ? '▲' : '▼'}</Text>
                    </TouchableOpacity>

                    {isSexOpen && (
                        <View style={styles.collapsibleContent}>
                            <Text style={styles.labelSub}>Flujo Cervical:</Text>
                            <View style={styles.row}>
                                {cervicalFluidOptions.map(option => (
                                    <TouchableOpacity key={option.id} style={[styles.productPill, selectedFluid === option.id && styles.fluidPillSelected]} onPress={() => setSelectedFluid(option.id)}>
                                        <Text style={styles.productPillText}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.labelSubMargin}>Relaciones sexuales:</Text>
                            <View style={styles.row}>
                                <TouchableOpacity style={[styles.productPill, sexPresent === 'si' && (isHormonal ? styles.sexNeutralSelected : styles.sexPillGenericSelected)]} onPress={() => { setSexPresent('si'); setProtectionType(null); setSelectedProtection(null); }}>
                                    <Text style={styles.productPillText}>Sí</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.productPill, sexPresent === 'no' && styles.digestionPillSelected]} onPress={() => { setSexPresent('no'); setProtectionType(null); setSelectedProtection(null); }}>
                                    <Text style={styles.productPillText}>No</Text>
                                </TouchableOpacity>
                            </View>

                            {/* FLUJO PERFIL NATURAL */}
                            {!isHormonal && sexPresent === 'si' && (
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.labelSubMargin}>Protección utilizada:</Text>
                                    <View style={styles.row}>
                                        <TouchableOpacity style={[styles.productPill, protectionType === 'con_proteccion' && styles.sexSafeSelected]} onPress={() => { setProtectionType('con_proteccion'); setSelectedProtection(null); }}>
                                            <Text style={styles.productPillText}>Con protección</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.productPill, protectionType === 'sin_proteccion' && styles.sexUnsafeSelected]} onPress={() => { setProtectionType('sin_proteccion'); setSelectedProtection(null); }}>
                                            <Text style={styles.productPillText}>Sin protección</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {protectionType === 'con_proteccion' && (
                                        <View style={{ marginTop: 10 }}>
                                            <Text style={styles.labelSubMargin}>Método de barrera o natural:</Text>
                                            <View style={styles.row}>
                                                {metodosBarreraNatural.map(metodo => (
                                                    <TouchableOpacity key={metodo} style={[styles.productPill, selectedProtection === metodo && styles.protectionSelected]} onPress={() => setSelectedProtection(metodo)}>
                                                        <Text style={styles.productPillText}>{metodo}</Text>
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
                                        <TouchableOpacity style={[styles.productPill, contraceptiveVerified === 'si' && styles.verificationSuccessSelected]} onPress={() => setContraceptiveVerified('si')}>
                                            <Text style={styles.productPillText}>Sí</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.productPill, contraceptiveVerified === 'no' && styles.sexUnsafeSelected]} onPress={() => setContraceptiveVerified('no')}>
                                            <Text style={styles.productPillText}>No</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </View>

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

                {/* BOTÓN GUARDAR (Este ya lo tienes, va justo debajo) */}

                {/* BOTÓN GUARDAR */}
                <TouchableOpacity
                    style={[styles.saveButton, cargando && { opacity: 0.6 }]}
                    onPress={handleGuardarDatos}
                    disabled={cargando}
                >
                    <Text style={styles.saveButtonText}>
                        {cargando ? "Guardando..." : "Guardar Registro"}
                    </Text>
                </TouchableOpacity>

            </ScrollView>
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
    infoIconCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#2E2E42', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
    infoIconText: { color: '#AAA', fontSize: 12, fontWeight: 'bold', fontFamily: FONT_BOLD },
    tooltipBox: { backgroundColor: '#1A1A2E', padding: 12, borderRadius: 10, marginBottom: 15, borderColor: '#2E2E42', borderWidth: 1 },
    tooltipText: { color: '#BBB', fontSize: 12, lineHeight: 16, fontFamily: FONT_REGULAR },
    labelSub: { color: '#888', fontSize: 13, marginBottom: 10, marginTop: 10, fontFamily: FONT_REGULAR },
    labelSubMargin: { color: '#888', fontSize: 13, marginBottom: 12, marginTop: 20, fontFamily: FONT_REGULAR },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

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
    colorRow: { flexDirection: 'row', justifyContent: 'flex-start', gap: 25, marginTop: 5 },
    colorItemContainer: { alignItems: 'center' },
    colorCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
    colorCircleSelected: { borderColor: 'white' },
    colorCircleLabel: { color: '#AAA', fontSize: 11, marginTop: 6, fontWeight: '500', fontFamily: FONT_REGULAR },
    clotsRow: { flexDirection: 'row', gap: 12, marginTop: 5 },
    clotButton: { flex: 1, backgroundColor: '#1A1A2E', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    clotButtonNoSelected: { backgroundColor: '#2E2E42' },
    clotButtonYesSelected: { backgroundColor: Colors.menstrual || '#C81D25' },
    clotButtonText: { color: 'white', fontSize: 15, fontWeight: '700', fontFamily: FONT_BOLD },
    saveButton: { backgroundColor: 'white', borderRadius: 25, paddingVertical: 15, alignItems: 'center', marginTop: 30 },
    saveButtonText: { color: Colors.fondo, fontSize: 16, fontWeight: '800', fontFamily: FONT_BOLD },

    // --- ESTILOS SECCIÓN 4 (SEXUALIDAD) ---
    fluidPillSelected: { backgroundColor: '#E91E63' },
    sexPillGenericSelected: { backgroundColor: '#2E2E42' },
    sexNeutralSelected: { backgroundColor: '#8E44AD' },
    sexSafeSelected: { backgroundColor: '#3498DB' },
    sexUnsafeSelected: { backgroundColor: '#E74C3C' },
    protectionSelected: { backgroundColor: '#4A1525' },
    verificationSuccessSelected: { backgroundColor: '#5CB85C' },
    // Agrégalo al final de tu StyleSheet
    textInputStyle: { borderWidth: 1, borderColor: '#2E2E42', backgroundColor: '#1A1A2E', color: 'white', borderRadius: 12, padding: 15, minHeight: 100, textAlignVertical: 'top', marginTop: 5, fontSize: 14, },
});