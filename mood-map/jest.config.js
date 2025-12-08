module.exports = {
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testEnvironment: "node",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(expo|expo-secure-store|@supabase|react-native|@react-native|react-native-url-polyfill)/)",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
