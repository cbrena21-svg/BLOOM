import { phases } from '../data/phases';

export const useCyclePhase = (day) => {
    if (day >= 1 && day <= 5) {
        return phases.menstrual;
    }

    if (day >= 6 && day <= 13) {
        return phases.folicular;
    }

    if (day >= 14 && day <= 16) {
        return phases.ovulacion;
    }

    return phases.lutea;
};