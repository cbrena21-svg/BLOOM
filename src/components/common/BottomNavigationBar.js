import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BottomNavigation() {
    return (
    <View style={styles.container}>
        <TouchableOpacity>
            <Ionicons name='moon' size={28} color='#C8B8D8' />
        </TouchableOpacity>

        <TouchableOpacity>
            <Ionicons name='calendar' size={28} color='#C8B8D8' />
        </TouchableOpacity>

        <TouchableOpacity style={styles.plusButton}>
            <Ionicons name='add' size={28} color='#1A1A2F' />
        </TouchableOpacity>

        <TouchableOpacity>
            <Ionicons name='person-outline' size={28} color='#C8B8D8' />
        </TouchableOpacity>

        <TouchableOpacity>
            <Ionicons name='book-outline' size={28} color='#C8B8D8' />
        </TouchableOpacity>
    </View>
    );
}

const styles = StyleSheet.create({
    container: {
    position: 'absolute',
    bottom: 30,
    width: '90%',
    height: 75,
    borderRadius: 40,
    backgroundColor: '#252542',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    alignSelf: 'center',
    },
    plusButton: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#C8B8D8',
    alignItems: 'center',
    justifyContent: 'center',
    },
});
