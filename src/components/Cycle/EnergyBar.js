import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../styles/colors';


export default function EnergyBar({ progress, color }) {
    return (
    <View style={styles.container}>
        <View
        style={[
            styles.fill,
            {
            width: `${progress * 100}%`,
            backgroundColor: color,
            },
        ]}
        />
    </View>
    );
}

const styles = StyleSheet.create({
    container: {
    width: 280,
    height: 76,
    borderRadius: 30,
    backgroundColor: Colors.tarjetas,
    overflow: 'hidden',
    marginTop: 25,
    },

    fill: {
    height: '100%',
    borderRadius: 30,
    },
});