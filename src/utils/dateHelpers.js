import dayjs from 'dayjs';

/**
 * CALC_01 a CALC_04: Motor de Predicción Matemática Definitivo de Bloom
 * Ahora acepta una duración de ciclo dinámica (dynamicCycleLength)
 */
export const getPhaseForDay = (cycleDay, userProfile, dynamicCycleLength = null) => {
    if (!userProfile) return null;

    const M = Number(userProfile.inp_period_length) || 5;
    const totalLength = dynamicCycleLength !== null ? dynamicCycleLength : (Number(userProfile.inp_cycle_length) || 28);
    const age = Number(userProfile.inp_age) || 25;
    const profile = userProfile.user_profile || 'NATURAL';
    const esIrregular = userProfile.flag_regularidad === 'IRREGULAR';

    if (profile === 'ARTIFICIAL') {
        if (cycleDay <= M) return 'menstrual';
        return null;
    }

    let duracionMenstrual = M;
    let duracionFolicular = 0;
    let diaOvulacion = 0;
    let duracionLutea = 0;

    if (profile === 'NATURAL' && age < 40) {
        duracionLutea = 14;
        diaOvulacion = totalLength - 14;
        duracionFolicular = diaOvulacion - duracionMenstrual;
    }
    else if (profile === 'NATURAL' && age >= 40 && age <= 44) {
        duracionFolicular = 10.4;
        diaOvulacion = duracionMenstrual + duracionFolicular;
        duracionLutea = totalLength - duracionMenstrual - duracionFolicular;
    }
    else if (profile === 'TRANSITION' || age >= 45) {
        duracionFolicular = 8.3;
        diaOvulacion = duracionMenstrual + duracionFolicular;
        duracionLutea = totalLength - duracionMenstrual - duracionFolicular;
    }

    const ovDayInt = Math.round(diaOvulacion);
    const rangoVentana = esIrregular ? 3 : 1;
    const ovStart = ovDayInt - rangoVentana;
    const ovEnd = ovDayInt + (esIrregular ? 2 : 1);

    if (cycleDay <= duracionMenstrual) return 'menstrual';
    if (cycleDay < ovStart) return 'folicular';
    if (cycleDay >= ovStart && cycleDay <= ovEnd) return 'ovulatoria';
    return 'lutea';
};

export const getCycleDayForDate = (date, lastPeriodDate, cycleLength = 28) => {
    if (!lastPeriodDate) return 1;

    let fechaLmpNormalizada = lastPeriodDate;
    if (typeof lastPeriodDate.toDate === 'function') {
        fechaLmpNormalizada = lastPeriodDate.toDate();
    } else if (lastPeriodDate.seconds) {
        fechaLmpNormalizada = new Date(lastPeriodDate.seconds * 1000);
    }

    const last = dayjs(fechaLmpNormalizada).startOf('day');
    const target = dayjs(date).startOf('day');

    if (!last.isValid()) return 1;

    const diffDays = target.diff(last, 'day');
    return ((((diffDays % cycleLength) + cycleLength) % cycleLength) + 1);
};

/**
 * 🌟 REGLA DEL HISTORIAL VS PREDICCIÓN GLOBAL
 */
export const getMonthWithPhases = (date, userProfile) => {
    if (!userProfile) return [];

    const baseLmp = userProfile.inp_lmp_date;
    const defaultCycleLength = userProfile.inp_cycle_length || 28;
    const M = Number(userProfile.inp_period_length) || 5;
    const age = Number(userProfile.inp_age) || 25;
    const profile = userProfile.user_profile || 'NATURAL';
    const history = userProfile.periods_history || [];

    const daysInMonth = dayjs(date).daysInMonth();
    let firstDay = dayjs(date).startOf('month').day();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];

    for (let i = 0; i < firstDay; i++) {
        days.push({ day: null, phase: null, isToday: false, isOvulationDay: false });
    }

    const inicioMes = dayjs(date).startOf('month');
    const sortedHistory = [...history].sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)));

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const currentDate = inicioMes.date(dayNum).startOf('day');
        const isToday = currentDate.isSame(dayjs(), 'day');

        let assignedPhase = null;
        let calculatedCycleDay = 1;
        let insideHistoryRange = false;
        let isPrediction = true;
        let currentCycleLength = userProfile.avg_cycle_length || defaultCycleLength;

        // Verificar si el día actual es parte de un registro REAL
        for (const record of sortedHistory) {
            const startRange = dayjs(record.startDate).startOf('day');
            const endRange = dayjs(record.endDate).startOf('day');

            if ((currentDate.isAfter(startRange) || currentDate.isSame(startRange)) &&
                (currentDate.isBefore(endRange) || currentDate.isSame(endRange))) {
                insideHistoryRange = true;
                assignedPhase = 'menstrual';
                calculatedCycleDay = currentDate.diff(startRange, 'day') + 1;
                isPrediction = false;
                break;
            }
        }

        // 🔮 REGLA 2: Si no hay registro real para este día, calculamos predicciones
        if (!insideHistoryRange) {
            let anchorStartDate = null;

            const pastRecords = sortedHistory.filter(r =>
                dayjs(r.startDate).startOf('day').isBefore(currentDate) ||
                dayjs(r.startDate).startOf('day').isSame(currentDate)
            );

            const futureRecords = sortedHistory.filter(r =>
                dayjs(r.startDate).startOf('day').isAfter(currentDate)
            );

            if (pastRecords.length > 0) {
                anchorStartDate = pastRecords[pastRecords.length - 1].startDate;

                if (futureRecords.length > 0) {
                    const nextStartDate = futureRecords[0].startDate;
                    currentCycleLength = dayjs(nextStartDate).diff(dayjs(anchorStartDate), 'day');
                } else {
                    currentCycleLength = defaultCycleLength;
                }
            } else if (sortedHistory.length > 0) {
                anchorStartDate = sortedHistory[0].startDate;
                currentCycleLength = defaultCycleLength;
            } else {
                anchorStartDate = baseLmp;
                currentCycleLength = defaultCycleLength;
            }

            calculatedCycleDay = getCycleDayForDate(currentDate, anchorStartDate, currentCycleLength);
            assignedPhase = getPhaseForDay(calculatedCycleDay, userProfile, currentCycleLength);
        }

        // ⚡ Ahora esta lectura es 100% segura y no arrojará ReferenceError
        let diaOvulacionExacto = currentCycleLength - 14;
        if (profile === 'NATURAL' && age >= 40 && age <= 44) diaOvulacionExacto = M + 10.4;
        else if (profile === 'TRANSITION' || age >= 45) diaOvulacionExacto = M + 8.3;
        const ovDayInt = Math.round(diaOvulacionExacto);

        const isOvulationDay = profile !== 'ARTIFICIAL' && calculatedCycleDay === ovDayInt && assignedPhase === 'ovulatoria';

        days.push({
            day: dayNum,
            date: currentDate,
            cycleDay: calculatedCycleDay,
            phase: assignedPhase,
            isToday: isToday,
            isOvulationDay: isOvulationDay,
            isPrediction: isPrediction,
        });
    }
    return days;
};

export const getMonthName = (date) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[dayjs(date).month()];
};
export const getYear = (date) => dayjs(date).year();
export const getTodayDay = () => dayjs().date();