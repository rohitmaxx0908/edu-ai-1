
import { supabase } from './supabaseClient';
import { UserProfile, AssessmentResult } from '../types';

// For this MVP, we use a fixed demo user ID.
// In a real app, this would come from the Auth session.
const DEMO_USER_ID = 'demo-user-001';

// Check for explicit demo mode boolean or fallback to missing credentials
const IS_MOCK_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' ||
    (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('PASTE_YOUR'));

export const dbService = {
    async saveProfile(profile: UserProfile): Promise<void> {
        if (IS_MOCK_MODE) {
            console.log('MOCK DB: Saving profile', profile);
            localStorage.setItem('enhance_ai_profile', JSON.stringify(profile));
            return;
        }

        try {
            const { error } = await supabase
                .from('user_data')
                .upsert(
                    {
                        user_id: DEMO_USER_ID,
                        profile: profile,
                        updated_at: new Date().toISOString()
                    },
                    { onConflict: 'user_id' }
                );

            if (error) throw error;
        } catch (err) {
            console.error('Supabase save failed (falling back to local):', err);
            // Fallback to local storage so user doesn't lose data
            localStorage.setItem('enhance_ai_profile', JSON.stringify(profile));
        }
    },

    async saveAssessment(assessment: AssessmentResult): Promise<void> {
        if (IS_MOCK_MODE) {
            console.log('MOCK DB: Saving assessment', assessment);
            localStorage.setItem('enhance_ai_assessment', JSON.stringify(assessment));
            return;
        }

        // We assume the row exists from profile creation, but upsert is safer
        const { error } = await supabase
            .from('user_data')
            .upsert(
                {
                    user_id: DEMO_USER_ID,
                    assessment: assessment,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'user_id' }
            );

        if (error) {
            console.error('Error saving assessment to Supabase:', error);
            throw error;
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

        const { data, error } = await supabase
            .from('user_data')
            .select('profile, assessment')
            .eq('user_id', DEMO_USER_ID)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" which is fine for new users
            console.error('Error fetching data from Supabase:', error);
            return { profile: null, assessment: null };
        }

        return {
            profile: data?.profile || null,
            assessment: data?.assessment || null
        };
    }
};
