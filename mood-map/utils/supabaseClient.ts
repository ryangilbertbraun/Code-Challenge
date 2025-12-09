import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { config } from "@/constants/config";
import "react-native-url-polyfill/auto";

/**
 * Custom storage adapter for Supabase using Expo SecureStore
 * This ensures session persistence works properly in React Native
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error("Error getting item from SecureStore:", error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("Error setting item in SecureStore:", error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("Error removing item from SecureStore:", error);
    }
  },
};

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      config.supabase.url,
      config.supabase.anonKey,
      {
        auth: {
          storage: ExpoSecureStoreAdapter,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          // Refresh token 5 minutes before expiry (default is 10 seconds)
          // This gives more time for the refresh to complete
          flowType: "pkce",
        },
      }
    );
  }
  return supabaseInstance;
}

export const supabase = getSupabaseClient();
