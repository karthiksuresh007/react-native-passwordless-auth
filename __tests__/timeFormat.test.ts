/**
 * Unit tests for Time Format utilities
 * Tests deterministic time formatting functions
 */

import {
  formatDurationMmSs,
  formatTime,
  getCurrentTimestamp,
} from '../src/utils/timeFormat';

describe('timeFormat utilities', () => {
  describe('formatDurationMmSs', () => {
    test('formats zero and small durations correctly', () => {
      expect(formatDurationMmSs(0)).toBe('00:00');
      expect(formatDurationMmSs(1000)).toBe('00:01'); // 1 second
      expect(formatDurationMmSs(30000)).toBe('00:30'); // 30 seconds
      expect(formatDurationMmSs(59000)).toBe('00:59'); // 59 seconds
    });

    test('handles minute transitions', () => {
      expect(formatDurationMmSs(60000)).toBe('01:00'); // 60 seconds = 1 minute
      expect(formatDurationMmSs(61000)).toBe('01:01'); // 61 seconds = 1:01
      expect(formatDurationMmSs(90000)).toBe('01:30'); // 90 seconds = 1:30
    });

    test('formats larger durations correctly', () => {
      expect(formatDurationMmSs(600000)).toBe('10:00'); // 10 minutes
      expect(formatDurationMmSs(3661000)).toBe('61:01'); // 61 minutes 1 second
    });

    test('handles fractional seconds by flooring', () => {
      expect(formatDurationMmSs(999)).toBe('00:00'); // Less than 1 second
      expect(formatDurationMmSs(1999)).toBe('00:01'); // 1.999 seconds floors to 1
      expect(formatDurationMmSs(59999)).toBe('00:59'); // 59.999 seconds
    });

    test('pads single digits with zeros', () => {
      expect(formatDurationMmSs(9000)).toBe('00:09'); // 9 seconds
      expect(formatDurationMmSs(420000)).toBe('07:00'); // 7 minutes
    });

    test('handles common session durations', () => {
      expect(formatDurationMmSs(15000)).toBe('00:15'); // 15 seconds
      expect(formatDurationMmSs(180000)).toBe('03:00'); // 3 minutes
      expect(formatDurationMmSs(300000)).toBe('05:00'); // 5 minutes
    });
  });

  describe('formatTime', () => {
    test('returns a string for any timestamp', () => {
      const timestamp = new Date('2024-01-15T14:30:45').getTime();
      const result = formatTime(timestamp);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toMatch(/:/); // Should contain colon for time
    });

    test('handles current timestamp', () => {
      const now = Date.now();
      const result = formatTime(now);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('handles epoch timestamp', () => {
      const result = formatTime(0);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getCurrentTimestamp', () => {
    test('returns a valid positive number', () => {
      const timestamp = getCurrentTimestamp();
      
      expect(typeof timestamp).toBe('number');
      expect(timestamp).toBeGreaterThan(0);
      expect(Number.isInteger(timestamp)).toBe(true);
    });

    test('returns approximately current time', () => {
      const before = Date.now();
      const timestamp = getCurrentTimestamp();
      const after = Date.now();
      
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    test('matches Date.now() behavior closely', () => {
      const dateNow = Date.now();
      const currentTime = getCurrentTimestamp();
      
      const difference = Math.abs(currentTime - dateNow);
      expect(difference).toBeLessThan(10); // Within 10ms
    });
  });
});