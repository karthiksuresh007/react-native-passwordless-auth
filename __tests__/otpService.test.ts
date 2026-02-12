/**
 * Unit tests for OTP Service business logic
 * Tests deterministic functions only - no UI components
 */

import {
  generateOTP,
  buildOTPState,
  validateOTP,
  resetOTPState,
} from '../src/services/otpService';
import type { OTPState } from '../src/types';

describe('otpService', () => {
  describe('generateOTP', () => {
    test('returns exactly 6 digits', () => {
      const otp = generateOTP();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    test('returns different codes on successive calls', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      const otp3 = generateOTP();
      // Very unlikely all three are the same
      const unique = new Set([otp1, otp2, otp3]);
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  describe('buildOTPState', () => {
    test('creates valid OTP state with 60-second expiry', () => {
      const email = 'test@example.com';
      const state = buildOTPState(email);

      expect(state.email).toBe(email);
      expect(state.code).toHaveLength(6);
      expect(state.attemptsRemaining).toBe(3);
      expect(state.isValid).toBe(true);
      expect(state.expiresAt).toBe(state.generatedAt! + 60000);
    });
  });

  describe('validateOTP', () => {
    test('rejects expired codes', () => {
      const expiredState: OTPState = {
        code: '123456',
        email: 'test@example.com',
        generatedAt: Date.now() - 70000,
        expiresAt: Date.now() - 10000, // Expired 10 seconds ago
        attemptsRemaining: 3,
        isValid: true,
      };

      const result = validateOTP('123456', expiredState);

      expect(result.isValid).toBe(false);
      expect(result.isExpired).toBe(true);
      expect(result.errorMessage).toContain('expired');
    });

    test('accepts valid code within time limit', () => {
      const validState: OTPState = {
        code: '123456',
        email: 'test@example.com',
        generatedAt: Date.now(),
        expiresAt: Date.now() + 60000,
        attemptsRemaining: 3,
        isValid: true,
      };

      const result = validateOTP('123456', validState);

      expect(result.isValid).toBe(true);
      expect(result.isExpired).toBe(false);
      expect(result.errorMessage).toBeNull();
    });

    test('enforces max attempts limit', () => {
      const noAttemptsState: OTPState = {
        code: '123456',
        email: 'test@example.com',
        generatedAt: Date.now(),
        expiresAt: Date.now() + 60000,
        attemptsRemaining: 0,
        isValid: true,
      };

      const result = validateOTP('123456', noAttemptsState);

      expect(result.isValid).toBe(false);
      expect(result.attemptsRemaining).toBe(0);
      expect(result.errorMessage).toContain('Maximum attempts exceeded');
    });

    test('decrements attempts on wrong code', () => {
      const state: OTPState = {
        code: '123456',
        email: 'test@example.com',
        generatedAt: Date.now(),
        expiresAt: Date.now() + 60000,
        attemptsRemaining: 2,
        isValid: true,
      };

      const result = validateOTP('654321', state);

      expect(result.isValid).toBe(false);
      expect(result.attemptsRemaining).toBe(1);
      expect(result.errorMessage).toContain('1 attempt remaining');
    });
  });

  describe('resetOTPState', () => {
    test('creates new OTP state', () => {
      const oldState: OTPState = {
        code: '123456',
        email: 'test@example.com',
        generatedAt: Date.now() - 30000,
        expiresAt: Date.now() + 30000,
        attemptsRemaining: 1,
        isValid: true,
      };

      const newState = resetOTPState(oldState, 'test@example.com');

      expect(newState.code).not.toBe(oldState.code);
      expect(newState.attemptsRemaining).toBe(3);
      expect(newState.isValid).toBe(true);
      expect(newState.email).toBe('test@example.com');
    });
  });
});