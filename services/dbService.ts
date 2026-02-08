import { UserProfile, AssessmentResult } from '../types';
import { rtdb, auth } from './firebase';
import { ref, get, set, child } from "firebase/database";

const IS_MOCK_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

export const dbService = {
    async getUserData(): Promise<{ profile: UserProfile | null, assessment: AssessmentResult | null }> {
        // 1. Try LocalStorage first (fastest)
        const localProfile = localStorage.getItem('enhance_ai_profile');
        const localAssessment = localStorage.getItem('enhance_ai_assessment');

        let profile = localProfile ? JSON.parse(localProfile) : null;
        let assessment = localAssessment ? JSON.parse(localAssessment) : null;

        if (IS_MOCK_MODE) {
            return { profile, assessment };
        }

        const user = auth.currentUser;
        if (!user) return { profile, assessment };

        // 2. Try Firebase Realtime Database
        try {
            const dbRef = ref(rtdb);
            const snapshot = await get(child(dbRef, `users/${user.uid}`));

            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.profile) {
                    profile = data.profile;
                    localStorage.setItem('enhance_ai_profile', JSON.stringify(data.profile));
                }
                if (data.assessment) {
                    assessment = data.assessment;
                    localStorage.setItem('enhance_ai_assessment', JSON.stringify(data.assessment));
                }
            }
        } catch (error) {
            console.warn('Firebase sync failed, using local data:', error);
        }

        return { profile, assessment };
    },

    async saveProfile(data: UserProfile): Promise<void> {
        // Always save to local storage immediately
        localStorage.setItem('enhance_ai_profile', JSON.stringify(data));

        if (IS_MOCK_MODE) return;

        const user = auth.currentUser;
        if (!user) return;

        try {
            await set(ref(rtdb, `users/${user.uid}/profile`), data);
        } catch (err) {
            console.error('Firebase save failed:', err);
        }
    },

    async saveAssessment(data: AssessmentResult): Promise<void> {
        // Always save to local storage immediately
        localStorage.setItem('enhance_ai_assessment', JSON.stringify(data));

        if (IS_MOCK_MODE) return;

        const user = auth.currentUser;
        if (!user) return;

        try {
            await set(ref(rtdb, `users/${user.uid}/assessment`), data);
        } catch (err) {
            console.error('Firebase save failed:', err);
        }
    }
};
