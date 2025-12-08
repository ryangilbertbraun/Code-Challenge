/**
 * Environment configuration
 *
 * Add these to your .env file:
 * EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
 * EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
 * EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
 * EXPO_PUBLIC_HUME_API_KEY=your_hume_api_key
 */

export const config = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  },
  openai: {
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || "",
  },
  hume: {
    apiKey: process.env.EXPO_PUBLIC_HUME_API_KEY || "",
  },
};
