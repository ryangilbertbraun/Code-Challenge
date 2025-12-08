// Jest setup file

// Load environment variables from .env file
require("dotenv").config();

// Set up fallback environment variables for tests if not in .env
process.env.EXPO_PUBLIC_SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://test.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "test-anon-key";
process.env.EXPO_PUBLIC_OPENAI_API_KEY =
  process.env.EXPO_PUBLIC_OPENAI_API_KEY || "test-openai-key";
process.env.EXPO_PUBLIC_HUME_API_KEY =
  process.env.EXPO_PUBLIC_HUME_API_KEY || "test-hume-key";

// Mock expo-secure-store before any imports
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useSegments: jest.fn(),
  usePathname: jest.fn(),
  useLocalSearchParams: jest.fn(),
  Link: "Link",
  Redirect: "Redirect",
  Stack: "Stack",
}));

// Mock react-native-url-polyfill
jest.mock("react-native-url-polyfill/auto", () => {});

// Silence console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
