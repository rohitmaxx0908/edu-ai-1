
import { UserProfile, AssessmentResult } from '../types';

const IS_MOCK_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

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

        // 2. Try Backend Sync (to get fresher data)
        try {
            const response = await fetch(`${BACKEND_URL}/profile/data`);
            if (response.ok) {
                const result = await response.json();
                const remoteProfile = result.data?.profile;
                const remoteAssessment = result.data?.assessment;

                // If backend has data, prefer it over local (or merge)
                if (remoteProfile) {
                    profile = remoteProfile;
                    // Update local cache
                    localStorage.setItem('enhance_ai_profile', JSON.stringify(remoteProfile));
                }
                if (remoteAssessment) {
                    assessment = remoteAssessment;
                    // Update local cache
                    localStorage.setItem('enhance_ai_assessment', JSON.stringify(remoteAssessment));
                }
            }
        } catch (error) {
            console.warn('Backend sync failed, using local data:', error);
        }

        return { profile, assessment };
    },

    async saveProfile(data: UserProfile): Promise<void> {
        // Always save to local storage immediately
        localStorage.setItem('enhance_ai_profile', JSON.stringify(data));

        if (IS_MOCK_MODE) return;

        try {
            await fetch(`${BACKEND_URL}/profile/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile: data })
            });
        } catch (err) {
            console.error('Background save failed:', err);
        }
    },

    async saveAssessment(data: AssessmentResult): Promise<void> {
        // Always save to local storage immediately
        localStorage.setItem('enhance_ai_assessment', JSON.stringify(data));

        if (IS_MOCK_MODE) return;

        try {
            await fetch(`${BACKEND_URL}/profile/save-assessment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assessment: data })
            });
        } catch (err) {
            console.error('Background save failed:', err);
        }
    }
};
