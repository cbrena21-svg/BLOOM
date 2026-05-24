import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../../styles/colors';
import BottomNavigation from '../../components/common/BottomNavigationBar';
import { guardarTrackingDiario } from '../../services/trackingService';
import { obtenerPerfilUsuario } from '../../services/firebaseConfig';

const flowColors = [
    { label: 'Brillante', flag: 'bright_red', hex: '#C81D25' },
    { label: 'Oscuro / Marrón', flag: 'dark_brown_black', hex: '#4A1525' },
    { label: 'Rosado', flag: 'pale_pink', hex: '#FFB3B3' },
];

export default function TrackingScreen() {
    const [isPeriodActive, setIsPeriodActive] = useState(false);
    const [cargandoFirebase, setCargandoFirebase] = useState(true);

    useEffect(() => {
        const verificarPeriodoActivo = async () => {
            try {
                setCargandoFirebase(true);
                const resultado = await obtenerPerfilUsuario();

                if (resultado.success && resultado.data) {
                    const userData = resultado.data;
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
                        setNotas('');
                    }
                }
            } catch (error) {
                console.error("Error obteniendo datos para el tracking:", error);
                Alert.alert("Error", "No se pudo verificar tu ciclo actual.");
            } finally {
                setCargandoFirebase(false);
            }
        };

        verificarPeriodoActivo();
    }, []);

    const [showInfo, setShowInfo] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cantidad, setCantidad] = useState(0);
    const [selectedColor, setSelectedColor] = useState(null);
    const [hasClots, setHasClots] = useState(null);
    const [notas, setNotas] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleCounter = (operation) => {
        const step = selectedProduct === 'copa' ? 5 : 1;
        if (operation === 'add') setCantidad(cantidad + step);
        if (operation === 'sub' && cantidad > 0) setCantidad(cantidad - step);
    };

    const handleProductChange = (productType) => {
        setSelectedProduct(productType);
        setCantidad(0);
    };

    const handleGuardarDatos = async () => {
        if (!isPeriodActive) {
            Alert.alert("Módulo Bloqueado", "No puedes registrar datos de sangrado fuera de tu fase menstrual.");
            return;
        }

        setCargando(true);

        let ml_calculados = 0;
        if (selectedProduct === 'regular') ml_calculados = cantidad * 5;
        if (selectedProduct === 'nocturna') ml_calculados = cantidad * 10;
        if (selectedProduct === 'copa') ml_calculados = cantidad;

        let volumen_flag = 'none';
        if (ml_calculados > 0 && ml_calculados <= 15) volumen_flag = 'light';
        if (ml_calculados > 15 && ml_calculados <= 30) volumen_flag = 'medium';
        if (ml_calculados > 30) volumen_flag = 'heavy';

        const payload = {
            flujo_menstrual: {
                en_periodo: isPeriodActive,
                metodo_utilizado: selectedProduct || 'none',
                cantidad_registrada: cantidad,
                ml_estimados_dia: ml_calculados,
                volumen_diario_calculado: volumen_flag,
                color: ml_calculados > 0 ? selectedColor : 'none',
                inp_clots: ml_calculados > 0 ? hasClots : false
            },
            notas: notas.trim()
        };

        const resultado = await guardarTrackingDiario(payload);
        setCargando(false);

        if (resultado.success) {
            Alert.alert("¡Guardado!", "Datos de flujo menstrual synchronized con Firebase.");
        } else {
            Alert.alert("Error", "Problema al conectar con la base de datos.");
        }
    };

    if (cargandoFirebase) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.menstrual || '#C81D25'} />
                <Text style={{ color: 'white', marginTop: 15 }}>Verificando tu ciclo...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Tracking Diario</Text>
                <Text style={styles.subtitle}>Fase Menstrual</Text>

                {/* EL CONTENEDOR MANTIENE LA OPACIDAD SI ESTÁ BLOQUEADO */}
                <View style={[styles.moduleContainer, !isPeriodActive && styles.moduleLocked]}>

                    {/* El mensaje negro de bloqueo ha sido eliminado de aquí */}

                    <View style={styles.titleHeaderRow}>
                        <Text style={styles.sectionTitle}>Registro de Sangrado</Text>
                        <TouchableOpacity style={styles.infoIconCircle} onPress={() => setShowInfo(!showInfo)}>
                            <Text style={styles.infoIconText}>i</Text>
                        </TouchableOpacity>
                    </View>

                    {showInfo && (
                        <View style={styles.tooltipBox}>
                            <Text style={styles.tooltipText}>
                                Indica la cantidad de productos sanitarios que se empaparon o llenaron por completo hoy para calcular con precisión médica tus mililitros (ml) perdidos.
                            </Text>
                        </View>
                    )}

                    <Text style={styles.labelSub}>¿Qué producto utilizaste hoy?</Text>
                    <View style={styles.row}>
                        <TouchableOpacity
                            style={[styles.productPill, selectedProduct === 'regular' && styles.productPillSelected]}
                            onPress={() => handleProductChange('regular')}>
                            <Text style={styles.productPillText}>Toallas / Tampones Regulares</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.productPill, selectedProduct === 'nocturna' && styles.productPillSelected]}
                            onPress={() => handleProductChange('nocturna')}>
                            <Text style={styles.productPillText}>Nocturnas / Extra Absorción</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.productPill, selectedProduct === 'copa' && styles.productPillSelected]}
                            onPress={() => handleProductChange('copa')}>
                            <Text style={styles.productPillText}>Copa Menstrual</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedProduct && (
                        <View style={styles.counterSection}>
                            <Text style={styles.labelSub}>Cantidad totalmente llenada hoy:</Text>
                            <View style={styles.counterRow}>
                                <Text style={styles.counterUnitText}>
                                    {selectedProduct === 'copa' ? `${cantidad} ml` : `${cantidad} piezas`}
                                </Text>
                                <View style={styles.counterControls}>
                                    <TouchableOpacity style={styles.counterBtn} onPress={() => handleCounter('sub')}>
                                        <Text style={styles.counterBtnText}>-</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.counterBtn} onPress={() => handleCounter('add')}>
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
                                    <TouchableOpacity
                                        key={item.flag}
                                        style={styles.colorItemContainer}
                                        onPress={() => setSelectedColor(item.flag)}>
                                        <View style={[
                                            styles.colorCircle,
                                            { backgroundColor: item.hex },
                                            selectedColor === item.flag && styles.colorCircleSelected
                                        ]} />
                                        <Text style={styles.colorCircleLabel}>{item.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.labelSubMargin}>¿Identificaste presencia de coágulos?</Text>
                            <View style={styles.clotsRow}>
                                <TouchableOpacity
                                    style={[styles.clotButton, hasClots === false && styles.clotButtonNoSelected]}
                                    onPress={() => setHasClots(false)}>
                                    <Text style={styles.clotButtonText}>No</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.clotButton, hasClots === true && styles.clotButtonYesSelected]}
                                    onPress={() => setHasClots(true)}>
                                    <Text style={styles.clotButtonText}>Sí</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                <Text style={styles.sectionTitleGlobal}>Notas del Día</Text>
                <TextInput
                    style={styles.textArea}
                    multiline
                    placeholder="Escribe anotaciones adicionales aquí..."
                    placeholderTextColor="#666"
                    value={notas}
                    onChangeText={setNotas}
                />

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
    title: { color: 'white', fontSize: 34, fontWeight: '800' },
    subtitle: { color: '#AAA', fontSize: 16, marginBottom: 15, fontWeight: '500' },
    moduleContainer: { borderRadius: 16, backgroundColor: '#0D0D1E', padding: 18, position: 'relative', overflow: 'hidden' },
    moduleLocked: { opacity: 0.25 }, // Mantiene la transparencia elegante cuando está inactivo
    titleHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    sectionTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
    infoIconCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#2E2E42', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
    infoIconText: { color: '#AAA', fontSize: 12, fontWeight: 'bold' },
    tooltipBox: { backgroundColor: '#1A1A2E', padding: 12, borderRadius: 10, marginBottom: 15, borderColor: '#2E2E42', borderWidth: 1 },
    tooltipText: { color: '#BBB', fontSize: 12, lineHeight: 16 },
    labelSub: { color: '#888', fontSize: 13, marginBottom: 10, marginTop: 10 },
    labelSubMargin: { color: '#888', fontSize: 13, marginBottom: 12, marginTop: 20 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    productPill: { backgroundColor: '#1A1A2E', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginBottom: 4 },
    productPillSelected: { backgroundColor: Colors.menstrual || '#C81D25' },
    productPillText: { color: 'white', fontSize: 13, fontWeight: '600' },
    counterSection: { marginTop: 15, backgroundColor: '#1A1A2E', padding: 12, borderRadius: 12 },
    counterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    counterUnitText: { color: 'white', fontSize: 18, fontWeight: '700', paddingLeft: 5 },
    counterControls: { flexDirection: 'row', gap: 5 },
    counterBtn: { width: 40, height: 40, backgroundColor: '#0D0D1E', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    counterBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    conditionalSection: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#2E2E42', paddingTop: 5 },
    colorRow: { flexDirection: 'row', justifyContent: 'flex-start', gap: 25, marginTop: 5 },
    colorItemContainer: { alignItems: 'center' },
    colorCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
    colorCircleSelected: { borderColor: 'white' },
    colorCircleLabel: { color: '#AAA', fontSize: 11, marginTop: 6, fontWeight: '500' },
    clotsRow: { flexDirection: 'row', gap: 12, marginTop: 5 },
    clotButton: { flex: 1, backgroundColor: '#1A1A2E', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    clotButtonNoSelected: { backgroundColor: '#2E2E42' },
    clotButtonYesSelected: { backgroundColor: Colors.menstrual || '#C81D25' },
    clotButtonText: { color: 'white', fontSize: 15, fontWeight: '700' },
    sectionTitleGlobal: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 10, marginTop: 25 },
    textArea: { backgroundColor: '#1A1A2E', color: 'white', borderRadius: 12, padding: 15, fontSize: 16, textAlignVertical: 'top', height: 80 },
    saveButton: { backgroundColor: 'white', borderRadius: 25, paddingVertical: 15, alignItems: 'center', marginTop: 30 },
    saveButtonText: { color: Colors.fondo, fontSize: 16, fontWeight: '800' },
});