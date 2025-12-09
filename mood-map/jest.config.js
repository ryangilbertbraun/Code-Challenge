module.exports = {
  projects: [
    {
      preset: "jest-expo/node",
      displayName: "node",
      testEnvironment: "node",
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
      testMatch: [
        "**/__tests__/**/*.test.[jt]s?(x)",
        "**/?(*.)+(spec|test).[jt]s?(x)",
      ],
      testPathIgnorePatterns: ["/node_modules/", "/__tests__/integration/"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      transformIgnorePatterns: [
        "node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-native-picker|@supabase|react-native-url-polyfill)",
      ],
      moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    },
  ],
};
