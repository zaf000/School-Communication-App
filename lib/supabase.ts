import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// During SSR (Node.js), window is undefined — skip AsyncStorage to avoid crashes.
// Auth state is rehydrated on the client after hydration.
const storage = typeof window !== 'undefined' ? AsyncStorage : undefined;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: typeof window !== 'undefined',
    persistSession: typeof window !== 'undefined',
    detectSessionInUrl: false,
  },
});
