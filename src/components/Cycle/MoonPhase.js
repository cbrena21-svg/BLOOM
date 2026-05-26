import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

export default function MoonPhase({ phase }) {
    const transition = useRef(new Animated.Value(1)).current;
    const [displayPhase, setDisplayPhase] = useState(phase || 'full');
    const [previousPhase, setPreviousPhase] = useState(phase || 'full');

    const phaseMap = {
        new_moon: {
            shadowStyle: styles.shadowFull,
        },
        crescent: {
            shadowStyle: styles.shadowCrescentWaxing,
        },
        half: {
            shadowStyle: styles.shadowQuarterWaxing,
        },
        quarter: {
            shadowStyle: styles.shadowQuarterWaxing,
        },
        waxing: {
            shadowStyle: styles.shadowWaxingGibbous,
        },
        full: {
            shadowStyle: styles.shadowNone,
        },
        waning: {
            shadowStyle: styles.shadowWaningGibbous,
        },
        waxing_crescent: {
            shadowStyle: styles.shadowCrescentWaxing,
        },
        waning_crescent: {
            shadowStyle: styles.shadowCrescentWaning,
        },
        waxing_gibbous: {
            shadowStyle: styles.shadowWaxingGibbous,
        },
        waning_gibbous: {
            shadowStyle: styles.shadowWaningGibbous,
        },
    };

    useEffect(() => {
        const nextPhase = phase || 'full';

        if (nextPhase === displayPhase) {
            return;
        }

        transition.stopAnimation();
        setPreviousPhase(displayPhase);
        setDisplayPhase(nextPhase);
        transition.setValue(0);

        Animated.timing(transition, {
            toValue: 1,
            duration: 520,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                setPreviousPhase(nextPhase);
            }
        });
    }, [phase, displayPhase, transition]);

    const renderedCurrentPhase = phaseMap[displayPhase] || phaseMap.full;
    const renderedPreviousPhase = phaseMap[previousPhase] || phaseMap.full;

    const currentOpacity = transition;
    const previousOpacity = transition.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    });
    const moonScale = transition.interpolate({
        inputRange: [0, 1],
        outputRange: [0.985, 1],
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
                        { opacity: previousOpacity },
                    ]}
                />
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.shadowLayer,
                        renderedCurrentPhase.shadowStyle,
                        { opacity: currentOpacity },
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
        borderRadius: 90,
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
        borderRadius: 90,
        backgroundColor: '#0D0D1E',
    },
    shadowCrescentWaxing: {
        position: 'absolute',
        width: 130,
        height: 180,
        left: -4,
        borderRadius: 90,
        backgroundColor: '#0D0D1E',
    },
    shadowQuarterWaxing: {
        position: 'absolute',
        width: 92,
        height: 180,
        left: 0,
        borderRadius: 90,
        backgroundColor: '#0D0D1E',
    },
    shadowWaxingGibbous: {
        position: 'absolute',
        width: 136,
        height: 180,
        left: -14,
        borderRadius: 90,
        backgroundColor: '#0D0D1E',
    },
    shadowWaningGibbous: {
        position: 'absolute',
        width: 136,
        height: 180,
        right: -14,
        borderRadius: 90,
        backgroundColor: '#0D0D1E',
    },
    shadowCrescentWaning: {
        position: 'absolute',
        width: 130,
        height: 180,
        right: -4,
        borderRadius: 90,
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
