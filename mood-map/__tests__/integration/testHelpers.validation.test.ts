/**
 * Test Helper Validation
 * Validates that test helper utilities work correctly
 */

import { testHelpers } from "../utils/testHelpers";

describe("Test Helpers Validation", () => {
  let testUserId: string | null = null;

  afterEach(async () => {
    // Clean up after each test
    if (testUserId) {
      await testHelpers.deleteTestUser(testUserId);
      testUserId = null;
    }
    await testHelpers.clearAuth();
  });

  it("should create a test user", async () => {
    const user = await testHelpers.createTestUser();

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toContain("@test.com");
    expect(user.password).toBeDefined();
    expect(user.accessToken).toBeDefined();
    expect(user.refreshToken).toBeDefined();

    testUserId = user.id;
  });

  it("should authenticate as a user", async () => {
    const user = await testHelpers.createTestUser();
    testUserId = user.id;

    await expect(testHelpers.authenticateAs(user)).resolves.not.toThrow();
  });

  it("should clear authentication", async () => {
    const user = await testHelpers.createTestUser();
    testUserId = user.id;

    await testHelpers.authenticateAs(user);
    await expect(testHelpers.clearAuth()).resolves.not.toThrow();
  });

  it("should create a text entry for authenticated user", async () => {
    const user = await testHelpers.createTestUser();
    testUserId = user.id;

    await testHelpers.authenticateAs(user);

    const entry = await testHelpers.createTextEntry("Test content");

    expect(entry).toBeDefined();
    expect(entry.id).toBeDefined();
    expect(entry.userId).toBe(user.id);
    expect(entry.content).toBe("Test content");
    expect(entry.createdAt).toBeInstanceOf(Date);
  });

  it("should query entries as admin", async () => {
    const user = await testHelpers.createTestUser();
    testUserId = user.id;

    await testHelpers.authenticateAs(user);
    await testHelpers.createTextEntry("Entry 1");
    await testHelpers.createTextEntry("Entry 2");

    const entries = await testHelpers.queryEntriesAsAdmin(user.id);

    expect(entries).toBeDefined();
    expect(entries.length).toBeGreaterThanOrEqual(2);
  });

  it("should delete a test user", async () => {
    const user = await testHelpers.createTestUser();

    await expect(testHelpers.deleteTestUser(user.id)).resolves.not.toThrow();

    // User is already deleted, so we don't need to clean up
    testUserId = null;
  });
});
