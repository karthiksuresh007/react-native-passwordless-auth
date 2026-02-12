/**
 * Unit tests for Email Service business logic  
 * Tests email validation, sanitization, and domain extraction
 */

import {
  sanitizeEmail,
  getEmailDomain,
  validateEmailFormat,
} from '../src/services/emailService';

describe('emailService', () => {
  describe('sanitizeEmail', () => {
    test('trims whitespace and converts to lowercase', () => {
      expect(sanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
      expect(sanitizeEmail('User@Domain.Com')).toBe('user@domain.com');
      expect(sanitizeEmail('')).toBe('');
    });
  });

  describe('getEmailDomain', () => {
    test('extracts domain from valid email', () => {
      expect(getEmailDomain('user@example.com')).toBe('example.com');
      expect(getEmailDomain('test@domain.co.uk')).toBe('domain.co.uk');
    });

    test('handles invalid email formats', () => {
      expect(getEmailDomain('invalid-email')).toBe('');
      expect(getEmailDomain('')).toBe('');
      expect(getEmailDomain('@')).toBe('');
    });
  });

  describe('validateEmailFormat', () => {
    test('accepts valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
        'a@b.co',
      ];

      validEmails.forEach(email => {
        const result = validateEmailFormat(email);
        expect(result.isValid).toBe(true);
        expect(result.errorMessage).toBeNull();
        expect(result.sanitizedEmail).toBe(email.toLowerCase());
      });
    });

    test('rejects invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..double@example.com',
        '',
        'user@exam ple.com',
      ];

      invalidEmails.forEach(email => {
        const result = validateEmailFormat(email);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeTruthy();
      });
    });

    test('handles required field validation', () => {
      const result = validateEmailFormat('');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Email address is required');
    });

    test('handles too long emails', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = validateEmailFormat(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Email address is too long');
    });
  });
});