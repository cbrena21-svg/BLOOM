import { doc, setDoc, collection, getDocs, query, where, documentId, getDoc } from 'firebase/firestore';
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
        // Nota: Agregué { merge: true } para que realmente fusione los datos y no sobrescriba lo anterior
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

/**
 * Trae los logs de todo un mes para pintarlos en el calendario
 * @param {string} mesAnoStr - Formato 'YYYY-MM'
 */
export const obtenerTrackingMensual = async (mesAnoStr) => {
    try {
        const usuarioActivo = auth.currentUser;
        if (!usuarioActivo) return { success: false, data: {} };

        const logsRef = collection(db, 'users', usuarioActivo.uid, 'daily_logs');

        // Buscamos los documentos de ese mes específico comparando el ID del documento (la fecha)
        const q = query(
            logsRef,
            where(documentId(), '>=', `${mesAnoStr}-01`),
            where(documentId(), '<=', `${mesAnoStr}-31`)
        );

        const querySnapshot = await getDocs(q);
        const datosMes = {};

        querySnapshot.forEach((documento) => {
            // Guardamos usando la fecha como clave: datosMes['2026-05-25']
            datosMes[documento.id] = documento.data();
        });

        return { success: true, data: datosMes };
    } catch (error) {
        console.error("Error obteniendo el tracking mensual:", error);
        return { success: false, error: error.message, data: {} };
    }
};

/**
 * Obtiene el registro de síntomas de hoy para la usuaria activa.
 */
export const obtenerTrackingDiarioHoy = async () => {
    try {
        const usuarioActivo = auth.currentUser;
        if (!usuarioActivo) return { success: false, error: "Usuario no autenticado." };

        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        const fechaID = `${anio}-${mes}-${dia}`;

        const logRef = doc(db, 'users', usuarioActivo.uid, 'daily_logs', fechaID);
        const docSnap = await getDoc(logRef);

        if (docSnap.exists()) {
            return { success: true, data: docSnap.data() };
        } else {
            return { success: true, data: null }; // No hay registro hoy todavía
        }
    } catch (error) {
        console.error("Error obteniendo el tracking diario:", error);
        return { success: false, error: error.message };
    }
};