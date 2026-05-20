export const calcularPerfilClinico = (inputs) => {
    // 1. Determinar perfil de usuario según anticonceptivo
    const metodosArtificiales = ['Pastillas combinadas', 'Mini-píldora (Solo Progesterona)', 'DIU Hormonal (Mirena / Kyleena)', 'Implante subdérmico / Parche / Anillo'];
    let user_profile = 'NATURAL';

    if (metodosArtificiales.includes(inputs.inp_contraceptive)) {
        user_profile = 'ARTIFICIAL';
    } else if (inputs.inp_age >= 45) {
        user_profile = 'TRANSITION';
    }

    // 2. Regla FIGO: Regularidad (Diferencia entre el ciclo más largo y corto)
    const variabilidad = inputs.inp_cycle_longest - inputs.inp_cycle_shortest;
    const flag_regularidad = variabilidad >= 8 ? 'IRREGULAR' : 'REGULAR';

    // 3. Frecuencia del ciclo (Normal entre 24 y 38 días)
    const flag_frecuencia = (inputs.inp_cycle_length < 24 || inputs.inp_cycle_length > 38) ? 'FUERA_DE_RANGO' : 'NORMAL';

    // 4. Volumen de flujo (Menorragia si toallas/tampones >= 6)
    const flag_volumen = inputs.inp_pads_count >= 6 ? 'ALTO_RIESGO' : 'NORMAL';

    // 5. Extensión del sangrado (Normal entre 3 y 7 días)
    const flag_extension = (inputs.inp_period_length < 3 || inputs.inp_period_length > 7) ? 'FUERA_DE_RANGO_SANGRADO' : 'NORMAL';

    // Retornamos el objeto completo listo para meter a Firebase
    return {
        ...inputs,
        user_profile,
        flag_diu_cobre: inputs.inp_contraceptive === 'DIU de Cobre (No hormonal)',
        flag_regularidad,
        flag_frecuencia,
        flag_volumen,
        flag_extension,
        flag_pathology_miomas: inputs.inp_diagnoses.includes('Miomas uterinos'),
        flag_pathology_endo: inputs.inp_diagnoses.includes('Endometriosis'),
        flag_pathology_pmos: inputs.inp_diagnoses.includes('SOP (Síndrome de Ovario Poliquístico)'),
        flag_symptom_pain: inputs.inp_chronic_symptoms.includes('Cólicos incapacitantes (que requieren pastillas)'),
        flag_symptom_bloat: inputs.inp_chronic_symptoms.includes('Hinchazón corporal severa / Retención de líquidos'),
        flag_symptom_acne: inputs.inp_chronic_symptoms.includes('Acné hormonal (en mandíbula/mejillas)'),
        flag_symptom_breast: inputs.inp_chronic_symptoms.includes('Sensibilidad o dolor en los pechos'),
    };
};