# Testing Guide

## Running Tests

### Unit Tests (Default)

Run unit tests for services, stores, and utilities:

```bash
npm test
```

This will run all tests EXCEPT integration tests, including:

- Service tests (authService, entryService)
- Store tests (authStore, entryStore, filterStore)
- Utility tests (filterPipeline, retry)
- Navigation tests (AuthGuard)

### Integration Tests (Disabled by Default)

⚠️ **WARNING: Integration tests are currently disabled and require setup before use.**

Integration tests validate the complete flow with a real Supabase database. They are located in `__tests__/integration/` but are excluded from the default test run.

**Why are they disabled?**

- They require a separate test database (DO NOT use production!)
- They will DELETE ALL DATA during cleanup
- Missing environment variables will cause them to fail

**To enable integration tests:**

1. **Create a separate Supabase project for testing:**

   - Go to https://app.supabase.com
   - Create a new project (e.g., "mood-map-test")
   - Run your database migrations on this test project

2. **Create `.env.test` file:**

   ```bash
   TEST_SUPABASE_URL=your_test_project_url
   TEST_SUPABASE_ANON_KEY=your_test_anon_key
   TEST_SUPABASE_SERVICE_ROLE_KEY=your_test_service_role_key
   TEST_OPENAI_API_KEY=your_openai_key (optional)
   TEST_HUME_API_KEY=your_hume_key (optional)
   ```

3. **Create integration test config:**

   ```bash
   # jest.config.integration.js
   module.exports = {
     ...require('./jest.config.js'),
     testPathIgnorePatterns: ['/node_modules/'],
     setupFilesAfterEnv: ['<rootDir>/__tests__/setup/setupTests.ts'],
   };
   ```

4. **Run integration tests:**
   ```bash
   npm run test:integration
   ```

## Test Structure

```
__tests__/
├── integration/          # Integration tests (disabled by default)
│   ├── auth.integration.test.ts
│   ├── entries.integration.test.ts
│   └── rls.integration.test.ts
├── setup/               # Test setup and configuration
│   └── setupTests.ts
└── utils/               # Test utilities and fixtures
    ├── testHelpers.ts
    ├── fixtures.ts
    └── mockServices.ts

services/__tests__/      # Service unit tests
stores/__tests__/        # Store unit tests
navigation/__tests__/    # Navigation unit tests
utils/__tests__/         # Utility unit tests
```

## Best Practices

1. **Always use unit tests for development** - They're fast and don't require external services
2. **Only run integration tests when necessary** - They're slow and require a test database
3. **Never run integration tests against production** - They will delete all data
4. **Keep test data isolated** - Each test should clean up after itself
