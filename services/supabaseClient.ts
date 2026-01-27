/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Check .env.local');
}

// Fallback to dummy values to prevent crash during module import
// if credentials are missing (handled gracefully in dbService check)
const safeUrl = supabaseUrl && supabaseUrl.length > 5 ? supabaseUrl : 'https://placeholder.supabase.co';
const safeKey = supabaseAnonKey && supabaseAnonKey.length > 5 ? supabaseAnonKey : 'placeholder-key';

export const supabase = createClient(safeUrl, safeKey);
