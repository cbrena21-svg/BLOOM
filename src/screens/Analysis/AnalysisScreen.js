import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../styles/colors';
import { FONT_REGULAR, FONT_BOLD } from '../../styles/typography';
import BottomNavigation from '../../components/common/BottomNavigationBar';

export default function NotificationSettingsScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Análisis</Text>
                <Text style={styles.message}>Aquí puedes configurar el análisis de datos.</Text>
            </View>

            <BottomNavigation />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.fondo,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    title: {
        color: 'white',
        fontSize: 36,
        fontWeight: '800',
        fontFamily: FONT_BOLD,
        marginBottom: 12,
    },
    message: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        opacity: 0.85,
        fontFamily: FONT_REGULAR,
    },
});
