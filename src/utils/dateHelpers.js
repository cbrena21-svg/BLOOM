import dayjs from 'dayjs';

// Obtener el día actual del ciclo basado en la fecha del último período
export const getCurrentCycleDay = (lastPeriodDate, cycleLength = 28) => {
    const last = dayjs(lastPeriodDate);
    const today = dayjs();
    const diffDays = today.diff(last, 'day');
    return (diffDays % cycleLength) + 1;
};

// Obtener la fase de un día específico del ciclo
export const getPhaseForDay = (day) => {
    if (day >= 1 && day <= 5) return 'menstrual';
    if (day >= 6 && day <= 13) return 'follicular';
    if (day >= 14 && day <= 16) return 'ovulacion';
    return 'lutea';
};

// Obtener el número de días en un mes
export const getDaysInMonth = (date) => {
    return dayjs(date).daysInMonth();
};

// Obtener el primer día de la semana del mes (0=domingo, 1=lunes, etc)
export const getFirstDayOfMonth = (date) => {
    return dayjs(date).startOf('month').day();
};

// Obtener nombre del mes en español
export const getMonthName = (date) => {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[dayjs(date).month()];
};

// Obtener el año
export const getYear = (date) => {
    return dayjs(date).year();
};

// Obtener la fecha actual formateada
export const getTodayFormatted = () => {
    return dayjs().format('YYYY-MM-DD');
};

// Obtener el día del mes actual
export const getTodayDay = () => {
    return dayjs().date();
};

// Obtener los días del mes con información de fase
export const getMonthWithPhases = (date, lastPeriodDate, cycleLength = 28) => {
    const month = dayjs(date).month();
    const year = dayjs(date).year();
    const daysInMonth = dayjs(date).daysInMonth();
    const firstDay = dayjs(date).startOf('month').day();
    
    const days = [];
    
    // Agregar celdas vacías para los días anteriores del mes
    for (let i = 0; i < firstDay; i++) {
        days.push({ day: null, phase: null, isToday: false });
    }
    
    // Agregar los días del mes
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const currentDate = dayjs().year(year).month(month).date(dayNum);
        const cycleDay = getCycleDayForDate(currentDate, lastPeriodDate, cycleLength);
        const phase = getPhaseForDay(cycleDay);
        const isToday = currentDate.isSame(dayjs(), 'day');
        
        days.push({
            day: dayNum,
            date: currentDate,
            cycleDay: cycleDay,
            phase: phase,
            isToday: isToday,
        });
    }
    
    return days;
};

// Calcular el día del ciclo para una fecha específica
export const getCycleDayForDate = (date, lastPeriodDate, cycleLength = 28) => {
    const last = dayjs(lastPeriodDate);
    const target = dayjs(date);
    const diffDays = target.diff(last, 'day');
    return (diffDays % cycleLength) + 1;
};
