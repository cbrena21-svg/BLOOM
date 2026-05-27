import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../styles/colors';

export default function BottomNavigation() {
    const navigation = useNavigation();
    const activeRouteName = useNavigationState((state) => state.routes[state.index]?.name);

    const getIconColor = (routeName) => {
        return activeRouteName === routeName ? '#B5A8C2' : Colors.botones;
    };

    const renderNavItem = (routeName, iconName, size = 28, isPrimary = false) => {
        const isSelected = activeRouteName === routeName;

        return (
            <TouchableOpacity
                onPress={() => navigation.navigate(routeName)}
                style={[
                    styles.navItem,
                    isSelected && styles.navItemSelected,
                    isPrimary && styles.primaryNavItem,
                ]}
            >
                {isSelected && isPrimary && <View style={styles.primarySelectedRing} />}
                {isSelected && !isPrimary && <View style={styles.selectedBox} />}
                <Ionicons
                    name={iconName}
                    size={size}
                    color={isPrimary ? Colors.textoPrincipal : getIconColor(routeName)}
                    style={styles.navIcon}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.glassOverlay} />

            {renderNavItem('Home', 'moon')}
            {renderNavItem('Calendar', 'calendar')}
            {renderNavItem('Tracking', 'add', 45, true)}
            {renderNavItem('Analysis', 'book')}
            {renderNavItem('Profile', 'person')}
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
        backgroundColor: 'rgba(40, 42, 57, 0.84)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        alignSelf: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.16)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.24,
        shadowRadius: 16,
        elevation: 12,
    },
    navItem: {
        width: 60,
        height: 55,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
    },
    primaryNavItem: {
        width: 55,
        height: 55,
        borderRadius: 28,
        backgroundColor: 'rgba(181, 168, 194, 0.92)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    primarySelectedRing: {
        position: 'absolute',
        width: 67,
        height: 67,
        borderRadius: 33.5,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.16)',
    },
    navItemSelected: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.18)',
    },
    selectedBox: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    navIcon: {
        zIndex: 1,
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.14)',
    },
});