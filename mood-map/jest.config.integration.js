module.exports = {
  testMatch: ["**/__tests__/integration/**/*.test.[jt]s?(x)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@supabase|react-native-url-polyfill)/)",
  ],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup/setupTests.ts"],
  testTimeout: 30000,
  maxWorkers: 1, // Run serially to avoid conflicts
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
