import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';

import { Colors } from '../../styles/colors';
import { auth } from '../../services/firebaseConfig';
import { saveOnboardingProfile } from '../../services/storageService';

const ageRange = { min: 10, max: 60 };
const periodRange = { min: 2, max: 10 };

const bleedingOptions = [
    { key: 'ligero', label: 'Ligero' },
    { key: 'moderado', label: 'Moderado' },
    { key: 'abundante', label: 'Abundante' },
];

const regularityOptions = [
    { key: 'regular', label: 'Regular', cycleLength: 28 },
    { key: 'algo_irregular', label: 'Algo irregular', cycleLength: 30 },
    { key: 'irregular', label: 'Irregular', cycleLength: 32 },
];

const steps = [
    {
        key: 'age',
        eyebrow: 'Paso 1 de 5',
        title: '¿Qué edad tienes?',
        subtitle: 'Nos ayuda a adaptar mejor la experiencia.',
    },
    {
        key: 'periodDuration',
        eyebrow: 'Paso 2 de 5',
        title: '¿Cuántos días dura tu periodo?',
        subtitle: 'Aproxímalo con el número que más se parezca.',
    },
    {
        key: 'bleeding',
        eyebrow: 'Paso 3 de 5',
        title: '¿Cómo es tu sangrado normalmente?',
        subtitle: 'Selecciona la opción que mejor te describa.',
    },
    {
        key: 'regularity',
        eyebrow: 'Paso 4 de 5',
        title: '¿Tu ciclo suele ser regular?',
        subtitle: 'Esto nos ayuda a calcular tu ciclo de forma más coherente.',
    },
    {
        key: 'lastPeriodDate',
        eyebrow: 'Paso 5 de 5',
        title: '¿Cuándo fue tu último periodo?',
        subtitle: 'Usaremos esta fecha para sincronizar Home y Calendario.',
    },
];

export default function LastPeriodScreen() {
    const navigation = useNavigation();
    const today = useMemo(() => dayjs(), []);

    const [stepIndex, setStepIndex] = useState(0);
    const [profile, setProfile] = useState({
        age: 24,
        periodDuration: 5,
        bleedingAmount: 'moderado',
        cycleRegularity: 'regular',
        lastPeriodDate: today,
    });

    const currentStep = steps[stepIndex];

    const updateProfile = patch => {
        setProfile(previous => ({
            ...previous,
            ...patch,
        }));
    };

    const handleDateChange = days => {
        const newDate = profile.lastPeriodDate.add(days, 'day');
        if (newDate.isAfter(today)) {
            Alert.alert('Fecha inválida', 'No puedes seleccionar una fecha futura');
            return;
        }
        updateProfile({ lastPeriodDate: newDate });
    };

    const handleSetToday = () => {
        updateProfile({ lastPeriodDate: today });
    };

    const handleSetLastMonth = () => {
        updateProfile({ lastPeriodDate: today.subtract(1, 'month') });
    };

    const handleAgeChange = delta => {
        const nextAge = profile.age + delta;
        if (nextAge < ageRange.min || nextAge > ageRange.max) {
            return;
        }

        updateProfile({ age: nextAge });
    };

    const handlePeriodDurationChange = delta => {
        const nextDuration = profile.periodDuration + delta;
        if (nextDuration < periodRange.min || nextDuration > periodRange.max) {
            return;
        }

        updateProfile({ periodDuration: nextDuration });
    };

    const handleSaveAndContinue = async () => {
        try {
            const userId = auth.currentUser?.uid;
            const selectedRegularity = regularityOptions.find(
                option => option.key === profile.cycleRegularity,
            );

            const payload = {
                age: profile.age,
                periodDuration: profile.periodDuration,
                bleedingAmount: profile.bleedingAmount,
                cycleRegularity: profile.cycleRegularity,
                cycleLength: selectedRegularity?.cycleLength || 28,
                lastPeriodDate: profile.lastPeriodDate.toISOString(),
            };

            const saveResult = await saveOnboardingProfile(payload, userId);
            if (!saveResult.success) {
                Alert.alert('Error', 'No se pudo guardar tu información');
                return;
            }

            Alert.alert('Guardado', 'Información de tu ciclo guardada correctamente');
            navigation.navigate('Home');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const formattedDate = profile.lastPeriodDate.format('DD/MM/YYYY');
    const daysAgo = today.diff(profile.lastPeriodDate, 'day');

    const renderStepContent = () => {
        switch (currentStep.key) {
            case 'age':
                return (
                    <View style={styles.numericCard}>
                        <Text style={styles.numericValue}>{profile.age}</Text>
                        <Text style={styles.numericLabel}>años</Text>

                        <View style={styles.stepControls}>
                            <TouchableOpacity style={styles.stepButton} onPress={() => handleAgeChange(-1)}>
                                <Text style={styles.stepButtonText}>-</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.stepButtonPrimary} onPress={() => handleAgeChange(1)}>
                                <Text style={styles.stepButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            case 'periodDuration':
                return (
                    <View style={styles.numericCard}>
                        <Text style={styles.numericValue}>{profile.periodDuration}</Text>
                        <Text style={styles.numericLabel}>días de periodo</Text>

                        <View style={styles.stepControls}>
                            <TouchableOpacity style={styles.stepButton} onPress={() => handlePeriodDurationChange(-1)}>
                                <Text style={styles.stepButtonText}>-</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.stepButtonPrimary} onPress={() => handlePeriodDurationChange(1)}>
                                <Text style={styles.stepButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            case 'bleeding':
                return (
                    <View style={styles.optionsGrid}>
                        {bleedingOptions.map(option => (
                            <TouchableOpacity
                                key={option.key}
                                style={[
                                    styles.optionCard,
                                    profile.bleedingAmount === option.key && styles.optionCardActive,
                                ]}
                                onPress={() => updateProfile({ bleedingAmount: option.key })}
                            >
                                <Text style={styles.optionText}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 'regularity':
                return (
                    <View style={styles.optionsGrid}>
                        {regularityOptions.map(option => (
                            <TouchableOpacity
                                key={option.key}
                                style={[
                                    styles.optionCard,
                                    profile.cycleRegularity === option.key && styles.optionCardActive,
                                ]}
                                onPress={() => updateProfile({ cycleRegularity: option.key })}
                            >
                                <Text style={styles.optionText}>{option.label}</Text>
                                <Text style={styles.optionSubtext}>{option.cycleLength} días aprox.</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 'lastPeriodDate':
                return (
                    <>
                        <View style={styles.dateCard}>
                            <Text style={styles.dateDisplay}>{formattedDate}</Text>
                            <Text style={styles.daysAgoText}>
                                {daysAgo === 0 ? 'Hoy' : `Hace ${daysAgo} días`}
                            </Text>
                        </View>

                        <View style={styles.controlsSection}>
                            <Text style={styles.sectionTitle}>Ajustar fecha</Text>

                            <View style={styles.dateControls}>
                                <View style={styles.controlGroup}>
                                    <TouchableOpacity style={styles.minusButton} onPress={() => handleDateChange(-7)}>
                                        <Text style={styles.buttonText}>← 1 sem</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.minusButton} onPress={() => handleDateChange(-1)}>
                                        <Text style={styles.buttonText}>← 1 día</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.plusButton} onPress={() => handleDateChange(1)}>
                                        <Text style={styles.buttonText}>1 día →</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.plusButton} onPress={() => handleDateChange(7)}>
                                        <Text style={styles.buttonText}>1 sem →</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.quickButtons}>
                                <TouchableOpacity style={styles.quickButton} onPress={handleSetToday}>
                                    <Text style={styles.quickButtonText}>Hoy</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.quickButton} onPress={handleSetLastMonth}>
                                    <Text style={styles.quickButtonText}>Hace 1 mes</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.eyebrow}>{currentStep.eyebrow}</Text>
                <Text style={styles.title}>{currentStep.title}</Text>
                <Text style={styles.subtitle}>{currentStep.subtitle}</Text>

                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${((stepIndex + 1) / steps.length) * 100}%` }]} />
                </View>

                {renderStepContent()}

                {/* Botón guardar */}
                <View style={styles.footerActions}>
                    <TouchableOpacity
                        style={[styles.navButton, stepIndex === 0 && styles.navButtonDisabled]}
                        onPress={() => setStepIndex(previous => Math.max(previous - 1, 0))}
                        disabled={stepIndex === 0}
                    >
                        <Text style={styles.navButtonText}>Atrás</Text>
                    </TouchableOpacity>

                    {stepIndex < steps.length - 1 ? (
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={() => setStepIndex(previous => previous + 1)}
                        >
                            <Text style={styles.saveButtonText}>Continuar</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSaveAndContinue}
                        >
                            <Text style={styles.saveButtonText}>Guardar y continuar</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.helpText}>
                    Puedes cambiar esto más tarde en tu perfil.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.fondo,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 130,
    },
    eyebrow: {
        color: Colors.follicular,
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
    },
    title: {
        color: 'white',
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 16,
        marginBottom: 20,
    },
    progressBar: {
        width: '100%',
        height: 8,
        borderRadius: 999,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginBottom: 24,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 999,
        backgroundColor: Colors.follicular,
    },

    dateCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 30,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    dateDisplay: {
        color: 'white',
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    daysAgoText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
    },

    numericCard: {
        minHeight: 220,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        padding: 24,
        marginBottom: 20,
    },
    numericValue: {
        color: 'white',
        fontSize: 56,
        fontWeight: '900',
    },
    numericLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 16,
        marginTop: 4,
    },
    stepControls: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 18,
    },
    stepButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    stepButtonPrimary: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.follicular,
    },
    stepButtonText: {
        color: 'white',
        fontSize: 28,
        fontWeight: '700',
        marginTop: -2,
    },
    optionsGrid: {
        gap: 12,
        marginBottom: 20,
    },
    optionCard: {
        borderRadius: 18,
        paddingVertical: 16,
        paddingHorizontal: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    optionCardActive: {
        backgroundColor: Colors.follicular,
        borderColor: Colors.follicular,
    },
    optionText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    optionSubtext: {
        color: 'rgba(255, 255, 255, 0.75)',
        fontSize: 12,
        marginTop: 4,
    },

    controlsSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },

    // Controles de fecha
    dateControls: {
        marginBottom: 16,
    },
    controlGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    minusButton: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    plusButton: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    buttonText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
    },

    // Botones rápidos
    quickButtons: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    quickButton: {
        flex: 1,
        backgroundColor: Colors.follicular,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    quickButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },

    footerActions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    navButton: {
        width: 92,
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    navButtonDisabled: {
        opacity: 0.35,
    },
    navButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    },
    saveButton: {
        flex: 1,
        backgroundColor: Colors.follicular,
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    helpText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 12,
    },
    dateControls: {
        marginBottom: 16,
    },
    controlGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    minusButton: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    plusButton: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    buttonText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
    },
});
