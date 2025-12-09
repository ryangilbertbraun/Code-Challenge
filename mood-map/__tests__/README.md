# MoodMap Integration Testing Guide

## Overview

This directory contains integration tests for the MoodMap application's backend services. The tests validate critical end-to-end workflows involving Supabase (PostgreSQL, Auth, Storage) and external AI services (OpenAI, Hume), with emphasis on Row Level Security (RLS), authentication flows, and entry creation with AI analysis.

### What Are Integration Tests?

Integration tests validate interactions between multiple backend services without mocking. Unlike unit tests that test individual functions in isolation, integration tests verify that different components work together correctly in a real environment.

### Test Categories

1. **Row Level Security (RLS) Tests** - Validate that Supabase RLS policies correctly isolate user data
2. **Authentication Tests** - Verify signup, login, logout, and session management
3. **Entry Creation Tests** - Test complete entry creation workflow from creation to storage
4. **AI Analysis Tests** - Validate AI service integration with mock services
5. **Data Consistency Tests** - Verify referential integrity and cascade operations

## Directory Structure

```
__tests__/
├── integration/           # Integration test files
│   ├── rls.integration.test.ts
│   ├── auth.integration.test.ts
│   ├── entries.integration.test.ts
│   └── ai-analysis.integration.test.ts
├── utils/                 # Test utilities and helpers
│   ├── testHelpers.ts    # User management and data setup utilities
│   ├── mockServices.ts   # Mock AI services for testing
│   └── fixtures.ts       # Sample test data
├── setup/                 # Test configuration
│   └── setupTests.ts     # Global test setup
└── README.md             # This file
```

## Getting Started

### Prerequisites

1. **Node.js and npm** - Ensure you have Node.js installed
2. **Supabase Project** - You need a Supabase project for testing (preferably separate from production)
3. **Environment Variables** - Configure test environment variables (see below)

### Installation

All testing dependencies are already included in the project. If you need to reinstall:

```bash
cd mood-map
npm install
```

Key testing dependencies:

- `jest` - Test framework
- `@testing-library/react-native` - React Native testing utilities
- `fast-check` - Property-based testing library
- `@supabase/supabase-js` - Supabase client

## Environment Configuration

### Required Environment Variables

Create or update the `.env.test` file in the `mood-map/` directory with the following variables:

```bash
# Supabase Test Configuration
# IMPORTANT: Use a separate Supabase project for testing!
TEST_SUPABASE_URL=your_test_supabase_url
TEST_SUPABASE_ANON_KEY=your_test_anon_key
TEST_SUPABASE_SERVICE_ROLE_KEY=your_test_service_role_key

# OpenAI Test Configuration (for text mood analysis)
TEST_OPENAI_API_KEY=your_test_openai_api_key

# Hume AI Test Configuration (for video emotion analysis)
TEST_HUME_API_KEY=your_test_hume_api_key

# Test Configuration
TEST_TIMEOUT=30000
```

### Environment Variable Details

| Variable                         | Purpose                                              | Required     |
| -------------------------------- | ---------------------------------------------------- | ------------ |
| `TEST_SUPABASE_URL`              | URL of your test Supabase project                    | Yes          |
| `TEST_SUPABASE_ANON_KEY`         | Anonymous key for RLS-respecting operations          | Yes          |
| `TEST_SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations (bypasses RLS) | Yes          |
| `TEST_OPENAI_API_KEY`            | OpenAI API key for text analysis tests               | For AI tests |
| `TEST_HUME_API_KEY`              | Hume AI API key for video analysis tests             | For AI tests |
| `TEST_TIMEOUT`                   | Test timeout in milliseconds (default: 30000)        | No           |

### Security Notes

⚠️ **IMPORTANT SECURITY CONSIDERATIONS:**

1. **Never commit `.env.test` to version control** - It contains sensitive credentials
2. **Use a separate Supabase project for testing** - Never use production credentials
3. **Service role key bypasses RLS** - Only use in test helpers for assertions
4. **Rotate keys regularly** - Especially if they may have been exposed
5. **Limit API quotas** - Set reasonable limits on test API keys to prevent abuse

## Running Tests

### Run All Integration Tests

```bash
npm run test:integration
```

This runs all tests in the `__tests__/integration/` directory.

### Run Specific Test File

```bash
npm run test:integration -- rls.integration.test.ts
```

### Run Tests with Coverage

```bash
npm run test:integration -- --coverage
```

### Run Tests in Watch Mode

```bash
npm run test:integration -- --watch
```

### Run Tests with Verbose Output

```bash
npm run test:integration -- --verbose
```

### Common Test Commands

```bash
# Run only RLS tests
npm run test:integration -- rls.integration.test.ts

# Run only authentication tests
npm run test:integration -- auth.integration.test.ts

# Run only entry creation tests
npm run test:integration -- entries.integration.test.ts

# Run with specific test name pattern
npm run test:integration -- -t "should create text entry"

# Run tests and update snapshots
npm run test:integration -- -u
```

## Test Utilities

### Test Helpers (`testHelpers.ts`)

The test helpers provide utilities for common test operations:

#### Creating Test Users

```typescript
import { testHelpers } from "../utils/testHelpers";

// Create a test user with auto-generated email
const user = await testHelpers.createTestUser();

// Create a test user with specific email
const user = await testHelpers.createTestUser("specific@test.com");

// Returns: { id, email, password, accessToken, refreshToken }
```

#### Authentication

```typescript
// Authenticate as a specific user
await testHelpers.authenticateAs(user);

// Clear authentication
await testHelpers.clearAuth();
```

#### Creating Entries

```typescript
// Create entry for current authenticated user
const entry = await testHelpers.createTextEntry("My journal entry");

// Create entry for specific user (uses admin client)
const entry = await testHelpers.createTextEntry("Entry content", userId);
```

#### Admin Queries (Bypass RLS)

```typescript
// Query all entries (bypasses RLS for assertions)
const allEntries = await testHelpers.queryEntriesAsAdmin();

// Query entries for specific user
const userEntries = await testHelpers.queryEntriesAsAdmin(userId);
```

#### Cleanup

```typescript
// Delete a specific test user
await testHelpers.deleteTestUser(userId);

// Clean up all test data (users and entries)
await testHelpers.cleanupTestData();
```

### Mock Services (`mockServices.ts`)

Mock services allow testing AI integration without external API calls:

#### Using Mock AI Service

```typescript
import { getMockAIService } from "../utils/mockServices";

// Get singleton instance
const mockAI = getMockAIService();

// Configure mock response
mockAI.setMockResponse({
  happiness: 0.8,
  fear: 0.1,
  sadness: 0.2,
  anger: 0.1,
  sentiment: Sentiment.POSITIVE,
});

// Use in test
const result = await mockAI.analyzeMood("Happy text");
// Returns configured mock response

// Configure mock error
mockAI.setMockError(new Error("API rate limit exceeded"));

// Reset to default behavior
mockAI.reset();
```

### Test Fixtures (`fixtures.ts`)

Pre-defined test data for consistent testing:

```typescript
import { SAMPLE_ENTRIES, MOCK_MOOD_DATA, TEST_USERS } from "../utils/fixtures";

// Sample entry content
const happyEntry = SAMPLE_ENTRIES.happy;
const sadEntry = SAMPLE_ENTRIES.sad;
const neutralEntry = SAMPLE_ENTRIES.neutral;

// Mock mood metadata
const moodData = MOCK_MOOD_DATA;

// Test user credentials (for reference)
const aliceEmail = TEST_USERS.alice.email;
```

## Writing Integration Tests

### Test Structure

Integration tests follow this general structure:

```typescript
describe("Feature Name", () => {
  let user: TestUser;

  beforeEach(async () => {
    // Setup: Create test users and authenticate
    user = await testHelpers.createTestUser();
    await testHelpers.authenticateAs(user);
  });

  afterEach(async () => {
    // Cleanup: Remove all test data
    await testHelpers.cleanupTestData();
  });

  it("should perform expected behavior", async () => {
    // Arrange: Set up test data
    const entry = await testHelpers.createTextEntry("Test content");

    // Act: Perform the operation being tested
    const result = await someOperation(entry.id);

    // Assert: Verify expected outcomes
    expect(result).toBeDefined();
    expect(result.id).toBe(entry.id);
  });
});
```

### Best Practices

1. **Always clean up after tests** - Use `afterEach` to call `testHelpers.cleanupTestData()`
2. **Use descriptive test names** - Clearly state what is being tested
3. **Test one thing per test** - Keep tests focused and atomic
4. **Use admin queries for assertions** - Bypass RLS to verify actual database state
5. **Handle async operations** - Always use `async/await` for database operations
6. **Test both success and failure cases** - Verify error handling
7. **Isolate tests** - Each test should be independent and not rely on others

### Example: Testing RLS

```typescript
describe("Row Level Security", () => {
  let userA: TestUser;
  let userB: TestUser;

  beforeEach(async () => {
    // Create two separate users
    userA = await testHelpers.createTestUser();
    userB = await testHelpers.createTestUser();
  });

  afterEach(async () => {
    await testHelpers.cleanupTestData();
  });

  it("should prevent user B from accessing user A's entries", async () => {
    // User A creates an entry
    await testHelpers.authenticateAs(userA);
    const entryA = await testHelpers.createTextEntry("User A entry", userA.id);

    // User B tries to access it
    await testHelpers.authenticateAs(userB);
    const entries = await getEntries(); // Uses RLS

    // User B should not see User A's entry
    expect(entries).not.toContainEqual(
      expect.objectContaining({ id: entryA.id })
    );
  });
});
```

### Example: Testing Authentication

```typescript
describe("Authentication", () => {
  afterEach(async () => {
    await testHelpers.cleanupTestData();
  });

  it("should create user and return valid session on signup", async () => {
    const client = getTestClient();
    const email = `test-${Date.now()}@test.com`;
    const password = "TestPassword123!";

    const { data, error } = await client.auth.signUp({
      email,
      password,
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.session?.access_token).toBeDefined();
  });
});
```

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Set

**Error:** `TEST_SUPABASE_URL and TEST_SUPABASE_ANON_KEY must be set in .env.test`

**Solution:** Ensure `.env.test` file exists in `mood-map/` directory with all required variables.

#### 2. Tests Timing Out

**Error:** `Timeout - Async callback was not invoked within the 30000 ms timeout`

**Solution:**

- Check your network connection to Supabase
- Increase timeout in `jest.config.integration.js`
- Verify Supabase project is running and accessible

#### 3. RLS Policy Errors

**Error:** `new row violates row-level security policy`

**Solution:**

- Verify RLS policies are correctly configured in Supabase
- Ensure you're authenticated before creating entries
- Check that service role key is correct for admin operations

#### 4. Cleanup Failures

**Warning:** `Warning: Failed to delete user` or `Warning: Failed to delete entries`

**Solution:**

- These are warnings, not errors - tests will continue
- Check Supabase project permissions
- Verify service role key has admin privileges

#### 5. Duplicate Email Errors

**Error:** `User already registered`

**Solution:**

- Ensure `cleanupTestData()` is called in `afterEach`
- Use unique emails with timestamps: `test-${Date.now()}@test.com`
- Manually clean up test database if needed

### Debugging Tips

1. **Enable verbose logging:**

   ```bash
   npm run test:integration -- --verbose
   ```

2. **Run single test:**

   ```bash
   npm run test:integration -- -t "specific test name"
   ```

3. **Check Supabase logs:**

   - Go to your Supabase project dashboard
   - Navigate to Logs section
   - Filter by timestamp of test run

4. **Inspect test data:**

   ```typescript
   // Add console.log in tests
   const entries = await testHelpers.queryEntriesAsAdmin();
   console.log("Current entries:", entries);
   ```

5. **Verify environment:**
   ```typescript
   // Add to test file
   console.log("Supabase URL:", process.env.TEST_SUPABASE_URL);
   console.log("Has anon key:", !!process.env.TEST_SUPABASE_ANON_KEY);
   ```

## Test Configuration

### Jest Configuration (`jest.config.integration.js`)

```javascript
module.exports = {
  preset: "react-native",
  testMatch: ["**/__tests__/integration/**/*.test.ts"],
  setupFilesAfterEnv: ["./__tests__/setup/setupTests.ts"],
  testTimeout: 30000,
  maxWorkers: 1, // Run tests serially to avoid conflicts
};
```

### Key Configuration Options

- `testMatch` - Specifies which files to run as tests
- `setupFilesAfterEnv` - Runs setup file before tests
- `testTimeout` - Maximum time for each test (30 seconds)
- `maxWorkers: 1` - Runs tests serially to prevent database conflicts

## CI/CD Integration

### Running Tests in CI

```yaml
# Example GitHub Actions workflow
- name: Run Integration Tests
  env:
    TEST_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
    TEST_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
    TEST_SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}
  run: |
    cd mood-map
    npm run test:integration
```

### Best Practices for CI

1. Store credentials in CI secrets, never in code
2. Use a dedicated test Supabase project
3. Run cleanup before and after test suite
4. Set reasonable timeouts for CI environment
5. Consider running tests in parallel if database supports it

## Performance Considerations

### Test Execution Time

- Individual tests: 1-5 seconds
- Full test suite: 1-2 minutes
- Factors affecting speed:
  - Network latency to Supabase
  - Number of database operations
  - Cleanup operations

### Optimization Tips

1. **Minimize database operations** - Batch operations when possible
2. **Use fixtures** - Reuse predefined test data
3. **Parallel execution** - Consider if your database supports it (currently disabled)
4. **Selective testing** - Run only affected tests during development
5. **Cleanup efficiently** - Use cascade deletes where possible

## Additional Resources

### Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Fast-check Documentation](https://fast-check.dev/)

### Related Files

- `jest.config.integration.js` - Integration test configuration
- `jest.config.js` - Unit test configuration
- `.env.test` - Test environment variables
- `package.json` - Test scripts and dependencies

## Contributing

When adding new integration tests:

1. Follow the existing test structure and patterns
2. Add descriptive comments explaining complex test logic
3. Update this README if adding new utilities or patterns
4. Ensure all tests pass before committing
5. Clean up test data properly in `afterEach` hooks

## Support

If you encounter issues:

1. Check this README for troubleshooting tips
2. Review existing tests for examples
3. Verify environment configuration
4. Check Supabase project status and logs
5. Consult the team or create an issue

---

**Last Updated:** December 2024
**Maintained By:** MoodMap Development Team
