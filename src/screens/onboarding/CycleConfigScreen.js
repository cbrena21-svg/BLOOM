import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../../styles/colors';
import BottomNavigation from '../../components/common/BottomNavigationBar';

const moods = [
    'Feliz',
    'Neutral',
    'Triste',
    'Ansiosa',
    'Irritable',
];

const symptoms = [
    'Dolor',
    'Cólicos',
    'Manchado',
    'Acné',
    'Fatiga',
    'Hinchazón',
    'Migraña',
    'Antojos',
    'Estrés',
    'Sensibilidad',
];

export default function CycleConfigScreen() {
    const [selectedMood, setSelectedMood] =
        useState(null);

    const [selectedSymptoms, setSelectedSymptoms] =
        useState([]);

    const toggleSymptom = symptom => {
        if (selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms(
                selectedSymptoms.filter(
                    item => item !== symptom,
                ),
            );
        } else {
            setSelectedSymptoms([
                ...selectedSymptoms,
                symptom,
            ]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>
                    Configurar Ciclo
                </Text>

                <Text style={styles.sectionTitle}>
                    Estado de ánimo
                </Text>

                <View style={styles.row}>
                    {moods.map(mood => (
                        <TouchableOpacity
                            key={mood}
                            style={[
                                styles.option,
                                {
                                    backgroundColor:
                                        selectedMood === mood
                                            ? Colors.folicular
                                            : Colors.fondo,
                                },
                            ]}
                            onPress={() =>
                                setSelectedMood(mood)
                            }>
                            <Text style={styles.optionText}>
                                {mood}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>
                    Síntomas
                </Text>

                <View style={styles.row}>
                    {symptoms.map(symptom => (
                        <TouchableOpacity
                            key={symptom}
                            style={[
                                styles.option,
                                {
                                    backgroundColor:
                                        selectedSymptoms.includes(
                                            symptom,
                                        )
                                            ? Colors.menstrual
                                            : Colors.fondo,
                                },
                            ]}
                            onPress={() =>
                                toggleSymptom(symptom)
                            }>
                            <Text style={styles.optionText}>
                                {symptom}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <BottomNavigation />
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

    title: {
        color: 'white',
        fontSize: 34,
        fontWeight: '800',
        marginBottom: 20,
    },

    sectionTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 15,
        marginTop: 20,
    },

    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },

    option: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 20,
    },

    optionText: {
        color: 'white',
        fontWeight: '700',
    },
});