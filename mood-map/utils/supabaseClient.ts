import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "@/constants/config";
import "react-native-url-polyfill/auto";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      config.supabase.url,
      config.supabase.anonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      }
    );
  }
  return supabaseInstance;
}

export const supabase = getSupabaseClient();
