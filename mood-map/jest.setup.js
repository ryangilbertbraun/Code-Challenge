// Mock environment variables for tests
process.env.EXPO_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.EXPO_PUBLIC_OPENAI_API_KEY = "test-openai-key";
process.env.EXPO_PUBLIC_HUME_API_KEY = "test-hume-key";

// Mock Expo's winter runtime
global.__ExpoImportMetaRegistry = {
  register: jest.fn(),
  get: jest.fn(),
};

// Mock Expo modules before they're imported
jest.mock("expo-modules-core", () => ({
  requireNativeModule: jest.fn(),
  NativeModulesProxy: {},
  EventEmitter: class EventEmitter {},
}));

// Mock expo itself
jest.mock("expo", () => ({
  registerRootComponent: jest.fn(),
}));

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => [],
  usePathname: () => "/",
  useLocalSearchParams: () => ({}),
}));

// Mock expo-constants
jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {},
  },
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

// Mock react-native
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
    select: jest.fn((obj) => obj.ios),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  AppState: {
    currentState: "active",
    addEventListener: jest.fn(),
  },
  NativeModules: {
    BlobModule: {
      BLOB_URI_SCHEME: "blob",
      BLOB_URI_HOST: null,
      addNetworkingHandler: jest.fn(),
      addWebSocketHandler: jest.fn(),
      removeWebSocketHandler: jest.fn(),
      sendOverSocket: jest.fn(),
      createFromParts: jest.fn(),
      release: jest.fn(),
    },
  },
}));

// Mock react-native-url-polyfill
jest.mock("react-native-url-polyfill/auto", () => {});
