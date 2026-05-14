import { Colors } from '../styles/colors';

export const phases = {
    menstrual: {
    title: 'Fase Menstrual',
    message: 'Escucha tu cuerpo, hoy necesita calma.',
    color: Colors.menstrual,
    energy: 0.25,
    days: [1, 5],
    moon: 'crescent',
    },

    folicular: {
    title: 'Fase Folicular',
    message: 'Cuida tu energía y sé amable contigo.',
    color: Colors.folicular,
    energy: 0.5,
    days: [6, 13],
    moon: 'half',
    },

    ovulacion: {
    title: 'Fase Ovulatoria',
    message: 'Tu energía está en su punto más alto.',
    color: Colors.ovulacion,
    energy: 0.9,
    days: [14, 16],
    moon: 'full',
    },

    lutea: {
    title: 'Fase Lútea',
    message: 'Reduce el ritmo y prioriza tu bienestar.',
    color: Colors.lutea,
    energy: 0.65,
    days: [17, 28],
    moon: 'waning',
    },
};
