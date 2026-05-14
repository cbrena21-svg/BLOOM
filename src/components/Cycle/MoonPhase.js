import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function MoonPhase({ phase }) {
    const getMoonStyle = () => {
        switch (phase) {
            case 'crescent':
                return styles.crescent;

            case 'half':
                return styles.half;

            case 'full':
                return styles.full;

            case 'waning':
                return styles.waning;

            default:
                return styles.full;
        }
    };

    return <View style={[styles.moon, getMoonStyle()]} />;
}

const styles = StyleSheet.create({
    moon: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#D9D9D9',
        shadowColor: '#FFF',
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
    },

    crescent: {
        transform: [{ scaleX: 0.6 }],
    },

    half: {
        transform: [{ scaleX: 0.8 }],
    },

    full: {
        transform: [{ scaleX: 1 }],
    },

    waning: {
        transform: [{ scaleX: 0.7 }],
    },
});
