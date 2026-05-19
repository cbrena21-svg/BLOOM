import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Image,
    Dimensions
} from 'react-native';
import { Colors } from '../../styles/colors';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
    // ---- 1. ESTADOS DEL MOTOR ----
    const [paginaActual, setPaginaActual] = useState(1);
    const [isCalculating, setIsCalculating] = useState(false);
    const [textoCarga, setTextoCarga] = useState('Analizando tus respuestas...');

    // ---- 2. ESTADO DE LOS INPUTS (Esquema de Notion) ----
    const [onboardingData, setOnboardingData] = useState({
        inp_age: 18, // Edad inicial por defecto que se muestra centrada
        inp_contraceptive: 'ninguno',
        inp_lmp_date: '',
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

    // Generar el rango de edades de 10 a 60 años dinámicamente
    const rangoEdades = Array.from({ length: 51 }, (_, i) => i + 10);

    // Auto-scroll inicial para posicionar la edad seleccionada visible al cargar
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

    // ---- 3. SIMULADOR DE PREDICCIONES (Efecto para el profesor) ----
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

    // ---- 5. COMPONENTES VISUALES DE LAS PREGUNTAS ----
    const renderPregunta = () => {
        switch (paginaActual) {
            case 1:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>¿Cuál es tu edad?</Text>
                        <Text style={styles.questionSubtitle}>Esto nos ayuda a personalizar tu experiencia.</Text>

                        {/* Selector Horizontal de Edad (Estilo Figma Row-Picker) */}
                        <View style={styles.pickerContainer}>
                            <ScrollView
                                ref={ageScrollViewRef}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.ageScrollContent}
                                snapToInterval={68} // Ancho del item + margen
                                decelerationRate="fast"
                            >
                                {rangoEdades.map((age) => {
                                    const esSeleccionado = age === onboardingData.inp_age;
                                    return (
                                        <TouchableOpacity
                                            key={age}
                                            style={[
                                                styles.ageItem,
                                                esSeleccionado && styles.ageItemActive
                                            ]}
                                            activeOpacity={0.8}
                                            onPress={() => setOnboardingData(prev => ({ ...prev, inp_age: age }))}
                                        >
                                            <Text style={[
                                                styles.ageText,
                                                esSeleccionado && styles.ageTextActive
                                            ]}>
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
                        <Text style={styles.questionTitle}>¿Utilizas algún método anticonceptivo?</Text>
                        <Text style={styles.questionSubtitle}>Selecciona tu alternativa actual de seguimiento.</Text>
                        <Text style={{ color: '#fff', marginVertical: 30, textAlign: 'center' }}>Manejador de inputs aquí...</Text>
                    </View>
                );
            default:
                return (
                    <View style={styles.questionWrapper}>
                        <Text style={styles.questionTitle}>Pregunta {paginaActual}</Text>
                        <Text style={styles.questionSubtitle}>Configuración en proceso.</Text>
                    </View>
                );
        }
    };

    // ---- 6. RENDERIZADO CONDICIONAL DE PANTALLAS ----

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
            {/* Logo de la App arriba (Igual que en el Login) */}
            <Image
                source={require('../../../assets/icons/Group_35.png')} // Reutiliza el mismo asset de tu Login
                style={styles.logoTop}
                resizeMode="contain"
            />

            {/* Tarjeta Contenedora Principal (Estilo de la imagen de Figma) */}
            <View style={styles.mainCard}>

                {/* Cabecera interna: Indicador de avance */}
                <Text style={styles.progressText}>{paginaActual} de {totalPaginas}</Text>

                {/* Barra de progreso integrada en el Card */}
                <View style={styles.progressTrack}>
                    <View style={[styles.progressBar, { width: `${(paginaActual / totalPaginas) * 100}%` }]} />
                </View>

                {/* Render de las preguntas dinámicas */}
                <View style={styles.contentBody}>
                    {renderPregunta()}
                </View>

                {/* Botón Continuar integrado al fondo de la Tarjeta */}
                <TouchableOpacity style={styles.continueButton} onPress={handleSiguiente}>
                    <Text style={styles.continueButtonText}>
                        {paginaActual === totalPaginas ? 'FINALIZAR' : 'Continuar'}
                    </Text>
                </TouchableOpacity>

                {/* Botón opcional de retorno si el usuario desea cambiar una respuesta anterior */}
                {paginaActual > 1 && (
                    <TouchableOpacity style={styles.backLink} onPress={handleAtras}>
                        <Text style={styles.backLinkText}>Atrás</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

// ---- 7. HOJA O ESTILOS BASE TOTALMENTE PULIDOS ----
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.fondo || '#12111A', // Fondo oscuro unificado de Bloom
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    logoTop: {
        width: 240,
        height: 80,
        marginBottom: 30,
        marginTop: 20,
    },
    mainCard: {
        backgroundColor: Colors.tarjetas || '#1F1E29', // Gris/Lavanda oscuro de la tarjeta de figma
        borderRadius: 28,
        width: '100%',
        paddingVertical: 30,
        paddingHorizontal: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    progressText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        opacity: 0.8,
    },
    progressTrack: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        width: '100%',
        marginBottom: 35,
    },
    progressBar: {
        height: '100%',
        backgroundColor: Colors.botones || '#6A5ACD', // Color lavanda de tu paleta
        borderRadius: 10,
    },
    contentBody: {
        width: '100%',
        minHeight: 220,
        justifyContent: 'center',
    },
    questionWrapper: {
        alignItems: 'center',
        width: '100%',
    },
    questionTitle: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 14,
    },
    questionSubtitle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
        marginBottom: 30,
    },
    pickerContainer: {
        width: '100%',
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    ageScrollContent: {
        paddingHorizontal: width / 2 - 58, // Centra el contenido inicial perfectamente
        alignItems: 'center',
    },
    ageItem: {
        width: 54,
        height: 54,
        borderRadius: 14,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 7,
    },
    ageItemActive: {
        backgroundColor: Colors.botones || '#6A5ACD', // Color activo lavanda vibrante de Figma
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
    continueButton: {
        backgroundColor: Colors.botones || '#6A5ACD',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backLink: {
        marginTop: 15,
        paddingVertical: 5,
    },
    backLinkText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 13,
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
        fontSize: 16,
        marginTop: 20,
        textAlign: 'center',
        paddingHorizontal: 40,
    }
});