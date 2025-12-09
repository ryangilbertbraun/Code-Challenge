/**
 * Infrastructure test to verify test setup is working
 */
describe("Test Infrastructure", () => {
  it("should run integration tests", () => {
    expect(true).toBe(true);
  });

  it("should have access to fast-check", () => {
    const fc = require("fast-check");
    expect(fc).toBeDefined();
    expect(typeof fc.assert).toBe("function");
  });
});
