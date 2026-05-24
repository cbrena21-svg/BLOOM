import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';

/**
 * Guarda o actualiza el registro diario de síntomas de la usuaria activa.
 * Usa la fecha local actual (AAAA-MM-DD) como ID único del documento.
 * * @param {Object} datosTracking Objeto con los síntomas, estados de ánimo, etc.
 */
export const guardarTrackingDiario = async (datosTracking) => {
    try {
        const usuarioActivo = auth.currentUser;
        if (!usuarioActivo) {
            console.error("No se pudo guardar el tracking: No hay sesión activa.");
            return { success: false, error: "Usuario no autenticado." };
        }

        // Obtener la fecha de hoy local en formato limpio AAAA-MM-DD
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        const fechaID = `${anio}-${mes}-${dia}`;

        // Referencia exacta: users / [uid] / daily_logs / [fecha]
        const logRef = doc(db, 'users', usuarioActivo.uid, 'daily_logs', fechaID);

        // Guardamos los datos fusionando por si ya registró algo antes en el mismo día
        await setDoc(logRef, {
            ...datosTracking,
            ultima_actualizacion: hoy.toISOString(),
        }, { merge: true });

        console.log(`[Firebase] Tracking diario guardado con éxito para: ${fechaID}`);
        return { success: true };
    } catch (error) {
        console.error("Error crítico en guardarTrackingDiario:", error);
        return { success: false, error: error.message };
    }
};