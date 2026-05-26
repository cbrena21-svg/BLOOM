import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../styles/colors';
import { FONT_REGULAR, FONT_BOLD } from '../../styles/typography';
import BottomNavigation from '../../components/common/BottomNavigationBar';
import { obtenerPerfilUsuario } from '../../services/firebaseConfig';
import { getMonthWithPhases } from '../../utils/dateHelpers';

import { obtenerTrackingDiarioHoy } from '../../services/trackingService';

// Importamos la base de datos de consejos
import { CONSEJOS_FASES, ALERTAS_SINTOMAS_DIAGNOSTICOS } from '../../utils/tipsData';

export default function TipsScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [faseHoy, setFaseHoy] = useState(null);
    const [estadoArtificial, setEstadoArtificial] = useState(null);
    const [alertasActivas, setAlertasActivas] = useState([]);
    const [verSuper, setVerSuper] = useState(false); // Estado para colapsar/mostrar la lista del súper

    useEffect(() => {
        const cargarDatosPantalla = async () => {
            try {
                // 1. Obtener perfil del usuario desde Firebase
                const resultado = await obtenerPerfilUsuario();
                const resultadoLog = await obtenerTrackingDiarioHoy();
                const logHoy = resultadoLog.success ? resultadoLog.data : null;

                if (resultado.success && resultado.data) {
                    const perfil = resultado.data;
                    setUserData(perfil);

                    console.log("Pathologies en Firebase perfil:", perfil);
                    console.log("Log de hoy en Firebase:", logHoy);

                    // 2. Calcular fase actual del ciclo natural o artificial
                    const diasDelMes = getMonthWithPhases(dayjs(), perfil);
                    const diaDeHoy = diasDelMes.find(d => d.isToday === true);

                    let faseCalculada = 'folicular'; // Fallback por defecto

                    if (perfil.user_profile === 'ARTIFICIAL') {
                        if (diaDeHoy && diaDeHoy.phase === 'menstrual') {
                            setEstadoArtificial('DESCANSO');
                            faseCalculada = 'menstrual';
                        } else {
                            setEstadoArtificial('ACTIVO');
                            faseCalculada = 'folicular'; // Usamos folicular como base activa estable
                        }
                    } else {
                        faseCalculada = diaDeHoy ? diaDeHoy.phase : 'folicular';
                        setFaseHoy(faseCalculada);
                    }

                    // 3. Evaluar alertas personalizadas (Diagnósticos del perfil + Síntomas)
                    // NOTA: Aquí puedes extender "logDiario" si haces la consulta a tu colección daily_logs
                    const alertas = [];

                    // --- DIAGNÓSTICOS (Onboarding) ---
                    if (perfil.flag_pathology_miomas) {
                        alertas.push(ALERTAS_SINTOMAS_DIAGNOSTICOS.diagnosticos.miomas);
                    }
                    if (perfil.flag_pathology_endo) {
                        alertas.push(ALERTAS_SINTOMAS_DIAGNOSTICOS.diagnosticos.endometriosis);
                    }
                    if (perfil.flag_pathology_pmos) {
                        alertas.push(ALERTAS_SINTOMAS_DIAGNOSTICOS.diagnosticos.pmos);
                    }

                    // --- SÍNTOMAS ACTIVOS (Tiempo Real: Se activa si es crónico O si lo marcó hoy)
                    // Nota: Evaluamos tanto en la raíz del log como dentro de 'cuerpo_sintomas' por si acaso

                    const tieneDolor = perfil.flag_symptom_pain || logHoy?.cuerpo_sintomas?.flag_symptom_pain || logHoy?.flag_symptom_pain;
                    if (tieneDolor) {
                        alertas.push(ALERTAS_SINTOMAS_DIAGNOSTICOS.sintomas.menstruacionDolorosa);
                    }

                    const tieneHinchazon = perfil.flag_symptom_bloat || logHoy?.cuerpo_sintomas?.flag_symptom_bloat || logHoy?.flag_symptom_bloat;
                    if (tieneHinchazon) {
                        alertas.push(ALERTAS_SINTOMAS_DIAGNOSTICOS.sintomas.hinchazon);
                    }

                    const tieneAcne = perfil.flag_symptom_acne || logHoy?.cuerpo_sintomas?.flag_symptom_acne || logHoy?.flag_symptom_acne;
                    if (tieneAcne) {
                        alertas.push(ALERTAS_SINTOMAS_DIAGNOSTICOS.sintomas.acne);
                    }

                    const tieneSensibilidad = perfil.flag_symptom_breast || logHoy?.cuerpo_sintomas?.flag_symptom_breast || logHoy?.flag_symptom_breast;
                    if (tieneSensibilidad) {
                        alertas.push(ALERTAS_SINTOMAS_DIAGNOSTICOS.sintomas.sensibilidadMamaria);
                    }

                    setAlertasActivas(alertas);
                }
            } catch (error) {
                console.error("Error al cargar datos en TipsScreen:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatosPantalla();
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="white" />
            </View>
        );
    }

    // Determinamos el set de consejos de fase que usaremos hoy
    const faseActualKey = userData?.user_profile === 'ARTIFICIAL'
        ? (estadoArtificial === 'DESCANSO' ? 'menstrual' : 'folicular')
        : (faseHoy || 'folicular');

    const infoFase = CONSEJOS_FASES[faseActualKey];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>

                    {/* ENCABEZADO DINÁMICO */}
                    <Text style={styles.title}>Mis Consejos</Text>
                    <View style={[styles.phaseBadge, { backgroundColor: infoFase?.colorTema || '#FFB6C1' }]}>
                        <Text style={styles.phaseBadgeText}>
                            {userData?.user_profile === 'ARTIFICIAL'
                                ? `Perfil Artificial: ${estadoArtificial}`
                                : infoFase?.titulo}
                        </Text>
                    </View>
                    <Text style={styles.subtitle}>{infoFase?.subtitulo}</Text>

                    {/* FRASE INSPIRACIONAL DEL FRASCO */}
                    <View style={styles.frascoCard}>
                        <Text style={styles.frascoText}>“ {infoFase?.fraseFrasco} ”</Text>
                    </View>

                    {/* ======================================================= */}
                    {/* SECCIÓN 1: SECCIÓN ALERTAS DE SALUD PERSONALIZADAS      */}
                    {/* ======================================================= */}
                    {alertasActivas.length > 0 && (
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionHeaderTitle}>⚠️ Ajustes por tus Síntomas o Diagnóstico</Text>
                            {alertasActivas.map((alerta, index) => (
                                <View key={index} style={styles.alertCard}>
                                    <Text style={styles.alertCardTitle}>{alerta.titulo}</Text>
                                    <Text style={styles.cardParagraph}>{alerta.consejoGeneral}</Text>

                                    <Text style={styles.bulletHeader}>Recomendaciones:</Text>
                                    {alerta.recomendados.map((rec, rIdx) => (
                                        <Text key={rIdx} style={styles.bulletItem}>• {rec}</Text>
                                    ))}

                                    {alerta.evitar && alerta.evitar.length > 0 && (
                                        <>
                                            <Text style={[styles.bulletHeader, { color: '#FF8B8B', marginTop: 8 }]}>Evitar prioritariamente:</Text>
                                            {alerta.evitar.map((ev, eIdx) => (
                                                <Text key={eIdx} style={styles.bulletItem}>• {ev}</Text>
                                            ))}
                                        </>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* ======================================================= */}
                    {/* SECCIÓN 2: NUTRICIÓN                                    */}
                    {/* ======================================================= */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>🍎 Nutrición Inteligente</Text>
                        <Text style={styles.cardParagraph}>{infoFase?.nutricion?.consejoGeneral}</Text>
                        {infoFase?.nutricion?.tipsClave.map((tip, idx) => (
                            <Text key={idx} style={styles.bulletItem}>• {tip}</Text>
                        ))}

                        {/* Desplegable de Lista del Súper para no saturar la vista */}
                        <TouchableOpacity style={styles.superDropdownButton} onPress={() => setVerSuper(!verSuper)}>
                            <Text style={styles.superDropdownButtonText}>
                                {verSuper ? '▲ Ocultar Lista del Súper sugerida' : '▼ Ver Lista del Súper sugerida'}
                            </Text>
                        </TouchableOpacity>

                        {verSuper && infoFase?.nutricion?.listaSuper && (
                            <View style={styles.superContainer}>
                                {Object.entries(infoFase.nutricion.listaSuper).map(([categoria, alimentos]) => (
                                    <View key={categoria} style={styles.superCategoryBlock}>
                                        <Text style={styles.superCategoryTitle}>{categoria.toUpperCase()}:</Text>
                                        <Text style={styles.superCategoryItems}>{alimentos.join(', ')}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* ======================================================= */}
                    {/* SECCIÓN 3: EJERCICIO Y BIENESTAR FISICO                 */}
                    {/* ======================================================= */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>💪 Ejercicio y Energía</Text>
                        <Text style={styles.cardParagraph}>{infoFase?.ejercicio?.consejoGeneral}</Text>
                        {infoFase?.ejercicio?.tipsClave.map((tip, idx) => (
                            <Text key={idx} style={styles.bulletItem}>• {tip}</Text>
                        ))}

                        <Text style={styles.bulletHeader}>Ejercicios ideales para hoy:</Text>
                        <Text style={styles.suggestedItems}>
                            {infoFase?.ejercicio?.sugeridos ? infoFase.ejercicio.sugeridos.join('   |   ') : ''}
                            {infoFase?.ejercicio?.sugeridosPrimeraMitad ? `Inicio fase: ${infoFase.ejercicio.sugeridosPrimeraMitad.join(', ')}` : ''}
                            {infoFase?.ejercicio?.sugeridosSegundaMitad ? `\nFin fase: ${infoFase.ejercicio.sugeridosSegundaMitad.join(', ')}` : ''}
                        </Text>
                    </View>

                    {/* ======================================================= */}
                    {/* SECCIÓN 4: PROYECTOS Y PRODUCTIVIDAD                    */}
                    {/* ======================================================= */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>💼 Enfoque y Proyectos</Text>
                        <Text style={styles.cardParagraph}>{infoFase?.proyectos?.consejoGeneral}</Text>
                        {infoFase?.proyectos?.tipsClave.map((tip, idx) => (
                            <Text key={idx} style={styles.bulletItem}>• {tip}</Text>
                        ))}
                    </View>

                    {/* ======================================================= */}
                    {/* SECCIÓN 5: ENFOQUE LABORAL (Exclusivo Fase Menstrual)   */}
                    {/* ======================================================= */}
                    {infoFase?.trabajo && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>🧠 Análisis Laboral & Intuición</Text>
                            <Text style={styles.cardParagraph}>{infoFase?.trabajo?.consejoGeneral}</Text>
                            {infoFase?.trabajo?.tipsClave.map((tip, idx) => (
                                <Text key={idx} style={styles.bulletItem}>• {tip}</Text>
                            ))}
                        </View>
                    )}

                    {/* ======================================================= */}
                    {/* SECCIÓN 6: RELACIONES Y SEXUALIDAD                      */}
                    {/* ======================================================= */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>❤️ Relaciones & Líbido</Text>
                        <Text style={styles.cardParagraph}>{infoFase?.relaciones?.consejoGeneral}</Text>
                        {infoFase?.relaciones?.tipsClave.map((tip, idx) => (
                            <Text key={idx} style={styles.bulletItem}>• {tip}</Text>
                        ))}
                    </View>

                </View>
            </ScrollView>

            <BottomNavigation navigation={navigation} currentScreen="Analysis" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.fondo,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 110,
        paddingTop: 10,
    },
    title: {
        color: 'white',
        fontSize: 32,
        fontFamily: FONT_BOLD,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        color: '#CCCCCC',
        fontSize: 15,
        textAlign: 'center',
        fontFamily: FONT_REGULAR,
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    phaseBadge: {
        alignSelf: 'center',
        paddingHorizontal: 18,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 8,
    },
    phaseBadgeText: {
        color: '#111111',
        fontFamily: FONT_BOLD,
        fontSize: 14,
        textTransform: 'uppercase',
    },
    frascoCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderLeftWidth: 4,
        borderLeftColor: '#E6E6FA',
        padding: 14,
        borderRadius: 8,
        marginBottom: 24,
    },
    frascoText: {
        color: '#E6E6FA',
        fontFamily: FONT_REGULAR,
        fontSize: 15,
        italic: 'italic',
        lineHeight: 22,
    },
    sectionContainer: {
        width: '100%',
        marginBottom: 20,
    },
    sectionHeaderTitle: {
        color: '#FFB6C1',
        fontSize: 18,
        fontFamily: FONT_BOLD,
        marginBottom: 10,
    },
    alertCard: {
        backgroundColor: 'rgba(255, 107, 107, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.3)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    alertCardTitle: {
        color: '#FF8B8B',
        fontSize: 16,
        fontFamily: FONT_BOLD,
        marginBottom: 6,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        width: '100%',
    },
    cardTitle: {
        color: 'white',
        fontSize: 18,
        fontFamily: FONT_BOLD,
        marginBottom: 10,
    },
    cardParagraph: {
        color: '#E0E0E0',
        fontSize: 14,
        fontFamily: FONT_REGULAR,
        lineHeight: 21,
        marginBottom: 12,
    },
    bulletHeader: {
        color: 'white',
        fontFamily: FONT_BOLD,
        fontSize: 14,
        marginTop: 12,
        marginBottom: 4,
    },
    bulletItem: {
        color: '#CCCCCC',
        fontSize: 13,
        fontFamily: FONT_REGULAR,
        lineHeight: 19,
        marginBottom: 6,
        paddingLeft: 4,
    },
    suggestedItems: {
        color: '#E6E6FA',
        fontSize: 14,
        fontFamily: FONT_BOLD,
        backgroundColor: 'rgba(255,255,255,0.04)',
        padding: 10,
        borderRadius: 8,
        textAlign: 'center',
        marginTop: 6,
    },
    superDropdownButton: {
        marginTop: 14,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    superDropdownButtonText: {
        color: 'white',
        fontFamily: FONT_BOLD,
        fontSize: 12,
    },
    superContainer: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
        padding: 12,
        marginTop: 10,
    },
    superCategoryBlock: {
        marginBottom: 8,
    },
    superCategoryTitle: {
        color: '#FFD700',
        fontSize: 11,
        fontFamily: FONT_BOLD,
        marginBottom: 2,
    },
    superCategoryItems: {
        color: '#BBBBBB',
        fontSize: 13,
        fontFamily: FONT_REGULAR,
    }
});