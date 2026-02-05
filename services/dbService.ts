
import { UserProfile, AssessmentResult } from '../types';

const IS_MOCK_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const dbService = {
    async saveProfile(profile: UserProfile): Promise<void> {
        if (IS_MOCK_MODE) {
            console.log('MOCK DB: Saving profile', profile);
            localStorage.setItem('enhance_ai_profile', JSON.stringify(profile));
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/profile/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile })
            });

            if (!response.ok) {
                throw new Error('Failed to save profile');
            }
        } catch (err) {
            console.error('Backend save failed (falling back to local):', err);
            localStorage.setItem('enhance_ai_profile', JSON.stringify(profile));
        }
    },

    async saveAssessment(assessment: AssessmentResult): Promise<void> {
        if (IS_MOCK_MODE) {
            console.log('MOCK DB: Saving assessment', assessment);
            localStorage.setItem('enhance_ai_assessment', JSON.stringify(assessment));
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/profile/save-assessment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assessment })
            });

            if (!response.ok) {
                throw new Error('Failed to save assessment');
            }
        } catch (err) {
            console.error('Error saving assessment:', err);
            throw err;
        }
    },

    async getUserData(): Promise<{ profile: UserProfile | null, assessment: AssessmentResult | null }> {
        if (IS_MOCK_MODE) {
            console.log('MOCK DB: Fetching user data');
            const p = localStorage.getItem('enhance_ai_profile');
            const a = localStorage.getItem('enhance_ai_assessment');
            return {
                profile: p ? JSON.parse(p) : null,
                assessment: a ? JSON.parse(a) : null
            };
        }

        try {
            const response = await fetch(`${BACKEND_URL}/profile/data`);
            
            if (!response.ok) {
                return { profile: null, assessment: null };
            }

            const result = await response.json();
            return {
                profile: result.data?.profile || null,
                assessment: result.data?.assessment || null
            };
        } catch (error) {
            console.error('Error fetching data:', error);
            return { profile: null, assessment: null };
        }
    }
};
