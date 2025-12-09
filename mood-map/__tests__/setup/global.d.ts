/**
 * Global type definitions for test environment
 */

declare global {
  var testConfig: {
    supabaseUrl: string;
    supabaseAnonKey: string;
    supabaseServiceRoleKey: string;
    openaiApiKey?: string;
    humeApiKey?: string;
    timeout: number;
  };
}

export {};
