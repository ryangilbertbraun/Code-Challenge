/**
 * Test Setup Configuration
 *
 * This file is executed before all integration tests to:
 * - Validate required environment variables
 * - Configure test timeouts
 * - Set up global test utilities
 *
 * Requirements: 1.1
 */

// Load test environment variables from .env.test
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

// Validate required environment variables
const requiredEnvVars = [
  "TEST_SUPABASE_URL",
  "TEST_SUPABASE_ANON_KEY",
  "TEST_SUPABASE_SERVICE_ROLE_KEY",
];

const optionalEnvVars = ["TEST_OPENAI_API_KEY", "TEST_HUME_API_KEY"];

// Check for required environment variables
const missingVars: string[] = [];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables for integration tests:\n` +
      `${missingVars.map((v) => `  - ${v}`).join("\n")}\n\n` +
      `Please ensure your .env.test file is properly configured.`
  );
}

// Warn about optional environment variables
const missingOptionalVars: string[] = [];
optionalEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    missingOptionalVars.push(varName);
  }
});

if (missingOptionalVars.length > 0) {
  console.warn(
    `Warning: Optional environment variables not set:\n` +
      `${missingOptionalVars.map((v) => `  - ${v}`).join("\n")}\n` +
      `Some tests may be skipped or use mock services.`
  );
}

// Configure test timeout
const testTimeout = process.env.TEST_TIMEOUT
  ? parseInt(process.env.TEST_TIMEOUT, 10)
  : 30000;

jest.setTimeout(testTimeout);

// Global test utilities
global.testConfig = {
  supabaseUrl: process.env.TEST_SUPABASE_URL!,
  supabaseAnonKey: process.env.TEST_SUPABASE_ANON_KEY!,
  supabaseServiceRoleKey: process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!,
  openaiApiKey: process.env.TEST_OPENAI_API_KEY,
  humeApiKey: process.env.TEST_HUME_API_KEY,
  timeout: testTimeout,
};

// Log test configuration (without sensitive data)
console.log("Integration Test Configuration:");
console.log(`  Supabase URL: ${process.env.TEST_SUPABASE_URL}`);
console.log(`  Test Timeout: ${testTimeout}ms`);
console.log(
  `  OpenAI API: ${
    process.env.TEST_OPENAI_API_KEY ? "Configured" : "Not configured"
  }`
);
console.log(
  `  Hume API: ${
    process.env.TEST_HUME_API_KEY ? "Configured" : "Not configured"
  }`
);
console.log("");
