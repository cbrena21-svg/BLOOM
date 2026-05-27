import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

export default function MoonPhase({ phase, mirror = false, invertSilhouette = false, debug = false }) {
    const transition = useRef(new Animated.Value(1)).current;

    // Si no recibe nada, por defecto mostrará la luna llena
    const [displayPhase, setDisplayPhase] = useState(phase || 'ovulatory');
    const [previousPhase, setPreviousPhase] = useState(phase || 'ovulatory');

    // Mapeo inteligente: Conecta el estado del ciclo con la sombra lunar correspondiente
    const phaseMap = {
        menstrual: { shadowStyle: styles.shadowQuarterWaning },      // UPDATED: Media-luna que cierra hacia la derecha (iluminada a la derecha)
        follicular: { shadowStyle: styles.shadowWaxingGibbous },     // UPDATED: Giba Creciente (Más iluminada que Menstrual)
        ovulatory: { shadowStyle: styles.shadowNone },               // Luna Llena (Iluminada)
        luteal: { shadowStyle: styles.shadowCrescentWaning },        // Luna Menguante Delgado - Izq lit, derecha shadow

        new_moon: { shadowStyle: styles.shadowFull },
        crescent: { shadowStyle: styles.shadowCrescentWaxing },
        half: { shadowStyle: styles.shadowQuarterWaxing },
        quarter: { shadowStyle: styles.shadowQuarterWaxing },
        waxing: { shadowStyle: styles.shadowWaxingGibbous },
        full: { shadowStyle: styles.shadowNone },
        waning: { shadowStyle: styles.shadowWaningGibbous },
        waxing_crescent: { shadowStyle: styles.shadowCrescentWaxing },
        waning_crescent: { shadowStyle: styles.shadowCrescentWaning },
        waxing_gibbous: { shadowStyle: styles.shadowWaxingGibbous },
        waning_gibbous: { shadowStyle: styles.shadowWaningGibbous },
        quarter_waning: { shadowStyle: styles.shadowQuarterWaning },
    };

    useEffect(() => {
        // Asegurarnos de que nextPhase tenga un valor válido
        const nextPhase = phase ? phase.toLowerCase() : 'ovulatory';

        if (nextPhase === displayPhase) {
            return;
        }

        transition.stopAnimation();
        setPreviousPhase(displayPhase);
        setDisplayPhase(nextPhase);
        transition.setValue(0);

        Animated.timing(transition, {
            toValue: 1,
            duration: 1200, // Aumentado de 520ms a 1200ms para una transición más smooth
            easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Curva suave (inicia rápido, termina muy suave)
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                setPreviousPhase(nextPhase);
            }
        });
    }, [phase, displayPhase, transition]);

    const renderedCurrentPhase = phaseMap[displayPhase] || phaseMap.ovulatory;
    const renderedPreviousPhase = phaseMap[previousPhase] || phaseMap.ovulatory;

    const currentOpacity = transition;
    const previousOpacity = transition.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    });

    // Latido sutil al cambiar de fase
    const moonScale = transition.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0.98, 1], // Se contrae levemente a la mitad de la animación
    });

    const craters = [
        { style: styles.craterOne },
        { style: styles.craterTwo },
        { style: styles.craterThree },
        { style: styles.craterFour },
    ];

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.moonBody, { transform: [{ scale: moonScale }] }]}>
                <View style={styles.moonHighlight} />
                <View style={styles.moonShadeBase} />
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.shadowLayer,
                        renderedPreviousPhase.shadowStyle,
                        { opacity: previousOpacity, transform: [{ scaleX: (mirror !== invertSilhouette) ? -1 : 1 }], ...(debug ? { borderWidth: 2, borderColor: 'magenta' } : {}) },
                    ]}
                />
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.shadowLayer,
                        renderedCurrentPhase.shadowStyle,
                        { opacity: currentOpacity, transform: [{ scaleX: (mirror !== invertSilhouette) ? -1 : 1 }], ...(debug ? { borderWidth: 2, borderColor: 'magenta' } : {}) },
                    ]}
                />

                {craters.map((crater, index) => (
                    <View key={index} style={[styles.crater, crater.style]} />
                ))}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 180,
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
    },
    moonBody: {
        width: 180,
        height: 180,
        borderRadius: 100,
        backgroundColor: '#D8D3C8',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
    },
    shadowLayer: {
        position: 'absolute',
        // Quitamos top, left, right, bottom de aquí para evitar conflictos
        // Cada sombra individual dictará su propia posición
    },
    moonHighlight: {
        position: 'absolute',
        top: 20,
        left: 26,
        width: 132,
        height: 132,
        borderRadius: 66,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    moonShadeBase: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    shadowNone: {
        position: 'absolute',
        width: 0,
        height: 0,
    },
    shadowFull: {
        position: 'absolute',
        width: 180,
        height: 180,
        top: 0,
        left: 0,
        borderRadius: 90,
        backgroundColor: '#0D0D1E',
    },
    shadowCrescentWaxing: {
        position: 'absolute',
        width: 150,
        height: 150,
        top: 15,
        left: -10,
        borderRadius: 75,
        backgroundColor: '#0D0D1E',
    },
    // Folicular
    shadowQuarterWaxing: {
        position: 'absolute',
        width: 160,
        height: 160,
        top: 10,
        left: 55,
        borderRadius: 100,
        backgroundColor: '#0D0D1E',
    },
    // Menstrual
    shadowQuarterWaning: {
        position: 'absolute',
        width: 160,
        height: 160,
        top: 10,
        left: 40,
        borderRadius: 100,
        backgroundColor: '#0D0D1E',
    },
    // Follicular (Alternativa)
    shadowWaxingGibbous: {
        position: 'absolute',
        width: 160,
        height: 160,
        top: 10,
        left: -20,
        borderRadius: 80,
        backgroundColor: '#0D0D1E',
    },
    shadowWaningGibbous: {
        position: 'absolute',
        width: 160,
        height: 160,
        top: 10,
        left: 40, // Cambiado de right a left
        borderRadius: 80,
        backgroundColor: '#0D0D1E',
    },
    // Lútea
    shadowCrescentWaning: {
        position: 'absolute',
        width: 160,
        height: 160,
        top: 10,
        left: -50,
        borderRadius: 100,
        backgroundColor: '#0D0D1E',
    },
    crater: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(87, 75, 64, 0.12)',
    },
    craterOne: {
        width: 20,
        height: 20,
        top: 44,
        left: 66,
    },
    craterTwo: {
        width: 11,
        height: 11,
        top: 72,
        left: 106,
    },
    craterThree: {
        width: 15,
        height: 15,
        top: 110,
        left: 80,
    },
    craterFour: {
        width: 9,
        height: 9,
        top: 126,
        left: 112,
    },
});