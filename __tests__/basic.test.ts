/**
 * Simple test to verify Jest setup
 */

describe('Jest setup', () => {
  test('basic arithmetic works', () => {
    expect(2 + 2).toBe(4);
  });

  test('string concatenation works', () => {
    expect('hello' + ' world').toBe('hello world');
  });
});