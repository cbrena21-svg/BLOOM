import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

const LAST_PERIOD_KEY = '@bloom_last_period';
const CYCLE_LENGTH_KEY = '@bloom_cycle_length';
const ONBOARDING_PROFILE_KEY = '@bloom_onboarding_profile';

const getScopedKey = (baseKey, userId) => {
    return userId ? `${baseKey}_${userId}` : baseKey;
};

const resolveUserId = (userId) => userId || auth.currentUser?.uid || null;

const readRemoteProfile = async (userId) => {
    const resolvedUserId = resolveUserId(userId);
    if (!resolvedUserId) return null;

    const docRef = doc(db, 'users', resolvedUserId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    return docSnap.data();
};

const writeRemoteProfile = async (profile, userId) => {
    const resolvedUserId = resolveUserId(userId);
    if (!resolvedUserId) return;

    const docRef = doc(db, 'users', resolvedUserId);
    await setDoc(docRef, profile, { merge: true });
};

const readOnboardingProfile = async (userId) => {
    const rawProfile = await AsyncStorage.getItem(getScopedKey(ONBOARDING_PROFILE_KEY, userId));
    if (!rawProfile) {
        return null;
    }

    try {
        return JSON.parse(rawProfile);
    } catch (error) {
        return null;
    }
};

const writeOnboardingProfile = async (profile, userId) => {
    await AsyncStorage.setItem(
        getScopedKey(ONBOARDING_PROFILE_KEY, userId),
        JSON.stringify(profile),
    );
};

export const saveOnboardingProfile = async (profile, userId) => {
    try {
        const remoteProfile = await readRemoteProfile(userId);
        const currentProfile = await readOnboardingProfile(userId);
        const mergedProfile = {
            ...(currentProfile || {}),
            ...(remoteProfile || {}),
            ...profile,
        };

        await writeOnboardingProfile(mergedProfile, userId);
        await writeRemoteProfile(mergedProfile, userId);

        if (mergedProfile.lastPeriodDate) {
            await AsyncStorage.setItem(
                getScopedKey(LAST_PERIOD_KEY, userId),
                mergedProfile.lastPeriodDate,
            );
        }

        if (typeof mergedProfile.cycleLength === 'number') {
            await AsyncStorage.setItem(
                getScopedKey(CYCLE_LENGTH_KEY, userId),
                mergedProfile.cycleLength.toString(),
            );
        }

        return { success: true, data: mergedProfile };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getOnboardingProfile = async (userId) => {
    try {
        const remoteProfile = await readRemoteProfile(userId);
        if (remoteProfile) {
            const localProfile = await readOnboardingProfile(userId);
            const mergedProfile = {
                ...(localProfile || {}),
                ...remoteProfile,
            };

            await writeOnboardingProfile(mergedProfile, userId);
            return { success: true, data: mergedProfile };
        }

        const profile = await readOnboardingProfile(userId);
        if (profile) {
            return { success: true, data: profile };
        }

        return { success: false, data: null };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const saveLastPeriodDate = async (date, userId) => {
    try {
        const normalizedDate = date.toISOString ? date.toISOString() : date.toString();
        const dateObject = new Date(normalizedDate);
        const normalizedDay = Number.isNaN(dateObject.getTime())
            ? null
            : dateObject.toISOString().slice(0, 10);

        await AsyncStorage.setItem(getScopedKey(LAST_PERIOD_KEY, userId), normalizedDate);
        const currentProfile = await readOnboardingProfile(userId);
        const nextProfile = {
            ...(currentProfile || {}),
            lastPeriodDate: normalizedDate,
            ...(normalizedDay ? { inp_lmp_date: normalizedDay } : {}),
        };

        await writeOnboardingProfile(nextProfile, userId);
        await writeRemoteProfile(nextProfile, userId);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getLastPeriodDate = async (userId) => {
    try {
        const remoteProfile = await readRemoteProfile(userId);
        if (remoteProfile?.inp_lmp_date) {
            return { success: true, data: new Date(remoteProfile.inp_lmp_date) };
        }
        if (remoteProfile?.lastPeriodDate) {
            return { success: true, data: new Date(remoteProfile.lastPeriodDate) };
        }

        const date = await AsyncStorage.getItem(getScopedKey(LAST_PERIOD_KEY, userId));
        if (date) {
            return { success: true, data: new Date(date) };
        }

        const profile = await readOnboardingProfile(userId);
        if (profile?.lastPeriodDate) {
            return { success: true, data: new Date(profile.lastPeriodDate) };
        }

        return { success: false, data: null };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const saveCycleLength = async (length, userId) => {
    try {
        await AsyncStorage.setItem(getScopedKey(CYCLE_LENGTH_KEY, userId), length.toString());
        const currentProfile = await readOnboardingProfile(userId);
        const nextProfile = {
            ...(currentProfile || {}),
            cycleLength: length,
            inp_cycle_length: length,
        };

        await writeOnboardingProfile(nextProfile, userId);
        await writeRemoteProfile(nextProfile, userId);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getCycleLength = async (userId) => {
    try {
        const remoteProfile = await readRemoteProfile(userId);
        if (typeof remoteProfile?.inp_cycle_length === 'number') {
            return { success: true, data: remoteProfile.inp_cycle_length };
        }
        if (typeof remoteProfile?.cycleLength === 'number') {
            return { success: true, data: remoteProfile.cycleLength };
        }

        const length = await AsyncStorage.getItem(getScopedKey(CYCLE_LENGTH_KEY, userId));
        if (length) {
            return { success: true, data: parseInt(length, 10) };
        }

        const profile = await readOnboardingProfile(userId);
        if (typeof profile?.cycleLength === 'number') {
            return { success: true, data: profile.cycleLength };
        }

        return { success: true, data: 28 }; // Valor por defecto
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const clearCycleData = async (userId) => {
    try {
        await AsyncStorage.multiRemove([
            getScopedKey(LAST_PERIOD_KEY, userId),
            getScopedKey(CYCLE_LENGTH_KEY, userId),
            getScopedKey(ONBOARDING_PROFILE_KEY, userId),
        ]);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
