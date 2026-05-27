import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import dayjs from 'dayjs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../styles/colors';
import { FONT_REGULAR, FONT_BOLD } from '../../styles/typography';
import BottomNavigation from '../../components/common/BottomNavigationBar';
import { obtenerPerfilUsuario } from '../../services/firebaseConfig';
import { getMonthWithPhases } from '../../utils/dateHelpers';
import { obtenerTrackingDiarioHoy } from '../../services/trackingService';

import { X } from 'lucide-react-native';

// Base de datos de consejos
import { CONSEJOS_FASES, ALERTAS_SINTOMAS_DIAGNOSTICOS } from '../../utils/tipsData';

export default function TipsScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [faseHoy, setFaseHoy] = useState(null);
    const [estadoArtificial, setEstadoArtificial] = useState(null);
    const [alertasActivas, setAlertasActivas] = useState([]);
    const [modalVisible, setModalVisible] = useState(null);

    useEffect(() => {
        const cargarDatosPantalla = async () => {
            try {
                const resultado = await obtenerPerfilUsuario();
                const resultadoLog = await obtenerTrackingDiarioHoy();
                const logHoy = resultadoLog.success ? resultadoLog.data : null;

                if (resultado.success && resultado.data) {
                    const perfil = resultado.data;
                    setUserData(perfil);

                    const diasDelMes = getMonthWithPhases(dayjs(), perfil);
                    const diaDeHoy = diasDelMes.find(d => d.isToday === true);

                    let faseCalculada = 'folicular';

                    if (perfil.user_profile === 'ARTIFICIAL') {
                        if (diaDeHoy && diaDeHoy.phase === 'menstrual') {
                            setEstadoArtificial('DESCANSO');
                            faseCalculada = 'menstrual';
                        } else {
                            setEstadoArtificial('ACTIVO');
                            faseCalculada = 'folicular';
                        }
                    } else {
                        faseCalculada = diaDeHoy ? diaDeHoy.phase : 'folicular';
                        setFaseHoy(faseCalculada);
                    }

                    const alertas = [];
                    if (perfil.flag_pathology_miomas) alertas.push(ALERTAS_SINTOMAS_DIAGNOSTICOS.diagnosticos.miomas);
                    if (perfil.flag_pathology_endo) alertas.push(ALERTAS_SINTOMAS_DIAGNOSTICOS.diagnosticos.endometriosis);
                    if (perfil.flag_pathology_pmos) alertas.push(ALERTAS_SINTOMAS_DIAGNOSTICOS.diagnosticos.pmos);

                    const tieneDolor = perfil.flag_symptom_pain || logHoy?.cuerpo_sintomas?.flag_symptom_pain || logHoy?.flag_symptom_pain;
                    if (tieneDolor) alertas.push(ALERTAS_SINTOMAS_DIAGNOSTICOS.sintomas.menstruacionDolorosa);

                    const tieneHinchazon = perfil.flag_symptom_bloat || logHoy?.cuerpo_sintomas?.flag_symptom_bloat || logHoy?.flag_symptom_bloat;
                    if (tieneHinchazon) alertas.push(ALERTAS_SINTOMAS_DIAGNOSTICOS.sintomas.hinchazon);

                    const tieneAcne = perfil.flag_symptom_acne || logHoy?.cuerpo_sintomas?.flag_symptom_acne || logHoy?.flag_symptom_acne;
                    if (tieneAcne) alertas.push(ALERTAS_SINTOMAS_DIAGNOSTICOS.sintomas.acne);

                    const tieneSensibilidad = perfil.flag_symptom_breast || logHoy?.cuerpo_sintomas?.flag_symptom_breast || logHoy?.flag_symptom_breast;
                    if (tieneSensibilidad) alertas.push(ALERTAS_SINTOMAS_DIAGNOSTICOS.sintomas.sensibilidadMamaria);

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

    const faseActualKey = userData?.user_profile === 'ARTIFICIAL'
        ? (estadoArtificial === 'DESCANSO' ? 'menstrual' : 'folicular')
        : (faseHoy || 'folicular');

    const infoFase = CONSEJOS_FASES[faseActualKey];
    const themeColor = infoFase?.colorTema || '#FFB6C1';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Image
                source={require('../../../assets/images/CircleLayer.png')}
                style={styles.blurBackground}
            />

            {/* 1. LOGO CENTRADO (Revertido a posición original) */}
            <View style={styles.headerBloomCentered}>
                <Image
                    source={require('../../../assets/icons/Group_35.png')}
                    style={styles.logoHeaderCentered}
                    resizeMode="contain"
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>

                    {/* 2. FRASE DE DOS NIVELES CENTRADA */}
                    <View style={styles.phraseContainerCentered}>
                        <Text style={styles.preTitleCentered}>Hoy es un buen día para...</Text>
                        <Text style={styles.mainTitleCentered}>
                            conectar contigo <Text style={{ color: themeColor }}></Text>
                        </Text>
                    </View>

                    {/* GRID DE TARJETAS */}
                    <View style={styles.gridContainer}>

                        {alertasActivas.length > 0 && (
                            <TouchableOpacity
                                style={styles.fullWidthCard}
                                onPress={() => setModalVisible('alertas')}
                                activeOpacity={0.8}
                            >
                                {/* 🌟 AJUSTE: NUEVO COMPONENTE ABSTRACTO (TRIÁNGULO DE ALERTA) */}
                                <View style={styles.abstractVisualTriangle}>
                                    <View style={[styles.triangleShape, { borderBottomColor: themeColor }]} />
                                </View>
                                <Text style={styles.cardText}>DIAGNÓSTICOS</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.squareCard} onPress={() => setModalVisible('nutricion')} activeOpacity={0.8}>
                            <View style={styles.cardInnerCenter}>
                                <View style={[styles.abstractVisual, { flexDirection: 'row' }]}>
                                    <View style={[styles.circleShape, { backgroundColor: themeColor, opacity: 0.8 }]} />
                                    <View style={[styles.circleShape, { backgroundColor: themeColor, opacity: 0.3, marginLeft: -12 }]} />
                                </View>
                                <Text style={styles.cardText}>NUTRICIÓN</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.squareCard} onPress={() => setModalVisible('ejercicio')} activeOpacity={0.8}>
                            <View style={styles.cardInnerCenter}>
                                <View style={styles.abstractVisualEnergy}>
                                    <View style={[styles.energyBar, { height: 10, backgroundColor: themeColor, opacity: 0.3 }]} />
                                    <View style={[styles.energyBar, { height: 16, backgroundColor: themeColor, opacity: 0.6 }]} />
                                    <View style={[styles.energyBar, { height: 24, backgroundColor: themeColor, opacity: 0.8 }]} />
                                    <View style={[styles.energyBar, { height: 32, backgroundColor: themeColor }]} />
                                </View>
                                <Text style={styles.cardText}>EJERCICIO</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.squareCard} onPress={() => setModalVisible('proyectos')} activeOpacity={0.8}>
                            <View style={styles.cardInnerCenter}>
                                <View style={styles.abstractVisualGrid}>
                                    <View style={[styles.gridBlock, { backgroundColor: themeColor }]} />
                                    <View style={[styles.gridBlock, { backgroundColor: themeColor, opacity: 0.3 }]} />
                                    <View style={[styles.gridBlock, { backgroundColor: themeColor, opacity: 0.6 }]} />
                                    <View style={[styles.gridBlockOutline, { borderColor: themeColor }]} />
                                </View>
                                <Text style={styles.cardText}>PROYECTOS</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.squareCard} onPress={() => setModalVisible('relaciones')} activeOpacity={0.8}>
                            <View style={styles.cardInnerCenter}>
                                <View style={[styles.abstractVisual, { flexDirection: 'row' }]}>
                                    <View style={[styles.ringShape, { borderColor: themeColor }]} />
                                    <View style={[styles.ringShape, { borderColor: themeColor, opacity: 0.4, marginLeft: -10 }]} />
                                </View>
                                <Text style={styles.cardText}>RELACIONES</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>

            {/* MODAL (Se mantiene igual de diseño) */}
            <Modal animationType="fade" transparent={true} visible={modalVisible !== null} onRequestClose={() => setModalVisible(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(null)} activeOpacity={0.7}>
                            <X size={24} color="white" />
                        </TouchableOpacity>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>

                            {modalVisible === 'alertas' && (
                                <View>
                                    <Text style={[styles.modalMainTitle, { color: themeColor }]}>Diagnósticos y Síntomas</Text>
                                    {alertasActivas.map((alerta, index) => (
                                        <View key={index} style={styles.infoBlock}>
                                            <Text style={styles.infoBlockTitle}>{alerta.titulo}</Text>
                                            <Text style={styles.sectionBulletHeader}>Recomendaciones:</Text>
                                            {alerta.recomendados.map((rec, rIdx) => <Text key={rIdx} style={styles.bulletItemText}>• {rec}</Text>)}
                                            {alerta.evitar && alerta.evitar.length > 0 && (
                                                <>
                                                    <Text style={[styles.sectionBulletHeader, { color: themeColor }]}>Evita:</Text>
                                                    {alerta.evitar.map((ev, eIdx) => <Text key={eIdx} style={styles.bulletItemText}>• {ev}</Text>)}
                                                </>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}

                            {modalVisible === 'nutricion' && (
                                <View>
                                    <Text style={[styles.modalMainTitle, { color: themeColor }]}>Nutrición</Text>
                                    <Text style={styles.sectionBulletHeader}>Recomendaciones:</Text>
                                    {infoFase?.nutricion?.tipsClave.map((tip, idx) => <Text key={idx} style={styles.bulletItemText}>• {tip}</Text>)}
                                    <View style={styles.superContainerInside}>
                                        <Text style={styles.sectionBulletHeader}>Lista del Súper Sugerida:</Text>
                                        {Object.entries(infoFase?.nutricion?.listaSuper || {}).map(([categoria, alimentos]) => (
                                            <View key={categoria} style={{ marginBottom: 10 }}>
                                                <Text style={[styles.superCategoryLabel, { color: themeColor }]}>{categoria.toUpperCase()}:</Text>
                                                <Text style={styles.superCategoryContent}>{alimentos.join(', ')}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {modalVisible === 'ejercicio' && (
                                <View>
                                    <Text style={[styles.modalMainTitle, { color: themeColor }]}>Ejercicio</Text>
                                    <Text style={styles.sectionBulletHeader}>Recomendaciones:</Text>
                                    {infoFase?.ejercicio?.tipsClave.map((tip, idx) => <Text key={idx} style={styles.bulletItemText}>• {tip}</Text>)}
                                    <Text style={styles.sectionBulletHeader}>Ejercicios ideales para hoy:</Text>
                                    <View style={[styles.tagContainer, { borderColor: themeColor }]}>
                                        <Text style={[styles.tagText, { color: themeColor }]}>
                                            {infoFase?.ejercicio?.sugeridos ? infoFase.ejercicio.sugeridos.join('   |   ') : ''}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {modalVisible === 'proyectos' && (
                                <View>
                                    <Text style={[styles.modalMainTitle, { color: themeColor }]}>Proyectos</Text>
                                    <Text style={styles.sectionBulletHeader}>Recomendaciones:</Text>
                                    {infoFase?.proyectos?.actividades.map((tip, idx) => <Text key={idx} style={styles.bulletItemText}>• {tip}</Text>)}
                                </View>
                            )}

                            {modalVisible === 'relaciones' && (
                                <View>
                                    <Text style={[styles.modalMainTitle, { color: themeColor }]}>Relaciones</Text>
                                    <Text style={styles.sectionBulletHeader}>Recomendaciones:</Text>
                                    {infoFase?.relaciones?.planesIdeales.map((tip, idx) => <Text key={idx} style={styles.bulletItemText}>• {tip}</Text>)}
                                </View>
                            )}

                        </ScrollView>
                    </View>
                </View>
            </Modal>

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
        paddingHorizontal: 24,
        paddingBottom: 120,
        paddingTop: 10,
    },
    blurBackground: {
        position: 'absolute',
        top: -10,
        right: -30,
        width: 280,
        height: 280,
        zIndex: -1,
    },

    // ============================================
    // 🌟 ESTILOS CABECERA CENTRADA (LOGO + FRASE)
    // ============================================
    headerBloomCentered: {
        alignItems: 'center',
        paddingTop: 25,
        paddingBottom: 10,
    },
    logoHeaderCentered: {
        width: 140, // Tamaño balanceado
        height: 40,
    },
    phraseContainerCentered: {
        marginTop: 25,
        marginBottom: 35,
        alignItems: 'center',
        width: '100%',
    },
    preTitleCentered: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: FONT_REGULAR,
        marginBottom: 4,
    },
    mainTitleCentered: {
        color: '#FFFFFF',
        fontSize: 22,
        fontFamily: FONT_BOLD,
        textAlign: 'center',
        lineHeight: 28,
    },

    // ESTILOS GRID Y TARJETAS NEUTRAS
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
    fullWidthCard: { width: '100%', height: 85, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: 4 },
    squareCard: { width: '47.5%', aspectRatio: 1, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.04)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' },
    cardInnerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    cardText: { fontFamily: FONT_BOLD, fontSize: 12, letterSpacing: 1.5, textAlign: 'center', color: '#FFFFFF' },

    // ============================================
    // 🎨 COMPONENTES ABSTRACTOS RENOVADOS
    // ============================================

    // 🌟 NUEVO: TRIÁNGULO GEOMÉTRICO (Adiós puntos)
    abstractVisualTriangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderBottomWidth: 26,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        // borderBottomColor se define dinámicamente en el JSX
        marginRight: 15, // Separación con el texto
    },
    // Estilo base para el JSX
    triangleShape: {
        position: 'absolute',
        top: -13, // Ajuste para centrarlo visualmente en la fila
        left: -15,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderBottomWidth: 26,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },

    // Resto de visuales abstractos (se mantienen)
    abstractVisual: { marginBottom: 16, height: 26, justifyContent: 'center', alignItems: 'center' },
    circleShape: { width: 26, height: 26, borderRadius: 13 },
    ringShape: { width: 26, height: 26, borderRadius: 13, borderWidth: 2.5 },
    abstractVisualEnergy: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', height: 32, gap: 5, marginBottom: 14 },
    energyBar: { width: 5, borderRadius: 3 },
    abstractVisualGrid: { width: 26, height: 26, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignContent: 'space-between', marginBottom: 16 },
    gridBlock: { width: 11, height: 11, borderRadius: 3 },
    gridBlockOutline: { width: 11, height: 11, borderRadius: 3, borderWidth: 2, backgroundColor: 'transparent' },

    // ESTILOS MODAL (Sin cambios)
    modalOverlay: { flex: 1, backgroundColor: 'rgba(10, 10, 15, 0.94)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: '#151522', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '80%', paddingHorizontal: 24, paddingTop: 55, paddingBottom: 40, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.04)' },
    closeButton: { position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 8, borderRadius: 20, zIndex: 10 },
    modalScroll: { paddingBottom: 20 },
    modalMainTitle: { fontSize: 22, fontFamily: FONT_BOLD, marginBottom: 20, letterSpacing: 0.5 },
    infoBlock: { marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
    infoBlockTitle: { fontSize: 16, fontFamily: FONT_BOLD, color: 'white', marginBottom: 6 },
    paragraphText: { fontSize: 15, fontFamily: FONT_REGULAR, color: '#D2D2DC', lineHeight: 22, marginBottom: 15 },
    sectionBulletHeader: { fontSize: 14, fontFamily: FONT_BOLD, color: 'white', marginTop: 12, marginBottom: 8 },
    bulletItemText: { fontSize: 14, fontFamily: FONT_REGULAR, color: '#9E9EAA', lineHeight: 20, marginBottom: 6 },
    tagContainer: { backgroundColor: 'rgba(255,255,255,0.01)', padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 5 },
    tagText: { fontSize: 13, fontFamily: FONT_BOLD, textAlign: 'center', lineHeight: 18 },
    superContainerInside: { backgroundColor: 'rgba(0, 0, 0, 0.15)', borderRadius: 14, padding: 16, marginTop: 15 },
    superCategoryLabel: { fontSize: 11, fontFamily: FONT_BOLD, marginBottom: 3, letterSpacing: 0.5 },
    superCategoryContent: { color: '#B2B2C2', fontSize: 13, fontFamily: FONT_REGULAR, lineHeight: 18 }
});