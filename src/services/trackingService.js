import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const TRACKING_LOCAL_KEY = '@bloom_tracking_daily';

const getDateKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const saveTrackingLocally = async (uid, dateKey, payload) => {
    const storageKey = `${TRACKING_LOCAL_KEY}_${uid}`;
    const raw = await AsyncStorage.getItem(storageKey);

    let parsed = {};
    if (raw) {
        try {
            parsed = JSON.parse(raw);
        } catch (error) {
            parsed = {};
        }
    }

    const nextValue = {
        ...parsed,
        [dateKey]: {
            ...payload,
            _savedOffline: true,
            _savedAt: new Date().toISOString(),
        },
    };

    await AsyncStorage.setItem(storageKey, JSON.stringify(nextValue));
};

export const guardarTrackingDiario = async (payload) => {
    try {
        const user = auth.currentUser;
        if (!user?.uid) {
            return { success: false, error: 'No hay usuario autenticado' };
        }

        const uid = user.uid;
        const dateKey = getDateKey();

        const trackingDocRef = doc(db, 'users', uid, 'tracking_diario', dateKey);

        await setDoc(
            trackingDocRef,
            {
                ...payload,
                fecha_registro: dateKey,
                created_at: serverTimestamp(),
            },
            { merge: true },
        );

        return { success: true };
    } catch (error) {
        try {
            const uid = auth.currentUser?.uid;
            if (uid) {
                await saveTrackingLocally(uid, getDateKey(), payload);
                return {
                    success: true,
                    offline: true,
                    error: error?.message || 'Guardado en modo local',
                };
            }
        } catch (localError) {
            return {
                success: false,
                error: localError?.message || 'No se pudo guardar localmente',
            };
        }

        return { success: false, error: error?.message || 'No se pudo guardar tracking' };
    }
};
