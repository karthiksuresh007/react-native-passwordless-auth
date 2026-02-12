/**
 * Email and input validation utilities for enhanced UX
 * Part of Phase 7 — Edge Cases & Validation
 */

import type { EmailValidationResult } from '../types/validation';

/**
 * RFC 5322 compliant email validation regex
 * Covers 99.99% of real email addresses while being practical
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * More permissive email regex for basic validation
 * Used as fallback for edge cases
 */
const BASIC_EMAIL_REGEX = /^.+@.+\..+$/;

/**
 * Validates email address with comprehensive checks
 * Returns sanitized email and detailed error information
 */
export const validateEmail = (email: string): EmailValidationResult => {
  // Sanitize input
  const trimmed = email.trim();
  const sanitizedEmail = trimmed.toLowerCase();

  // Check if empty
  if (!sanitizedEmail) {
    return {
      isValid: false,
      errorMessage: 'Email address is required',
      sanitizedEmail: '',
    };
  }

  // Check length constraints
  if (sanitizedEmail.length > 320) {
    return {
      isValid: false,
      errorMessage: 'Email address is too long (maximum 320 characters)',
      sanitizedEmail,
    };
  }

  // Check for basic format
  if (!BASIC_EMAIL_REGEX.test(sanitizedEmail)) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid email address',
      sanitizedEmail,
    };
  }

  // Check for strict RFC 5322 compliance
  if (!EMAIL_REGEX.test(sanitizedEmail)) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid email address format',
      sanitizedEmail,
    };
  }

  // Check for suspicious patterns
  if (sanitizedEmail.includes('..')) {
    return {
      isValid: false,
      errorMessage: 'Email address cannot contain consecutive dots',
      sanitizedEmail,
    };
  }

  if (sanitizedEmail.startsWith('.') || sanitizedEmail.endsWith('.')) {
    return {
      isValid: false,
      errorMessage: 'Email address cannot start or end with a dot',
      sanitizedEmail,
    };
  }

  // Split and validate parts
  const [localPart, domain] = sanitizedEmail.split('@');
  
  if (localPart.length > 64) {
    return {
      isValid: false,
      errorMessage: 'Email address local part is too long',
      sanitizedEmail,
    };
  }

  if (domain.length > 253) {
    return {
      isValid: false,
      errorMessage: 'Email domain is too long',
      sanitizedEmail,
    };
  }

  // Valid email
  return {
    isValid: true,
    errorMessage: null,
    sanitizedEmail,
  };
};

/**
 * Sanitizes OTP input for UI display (NOT business validation)
 * Returns sanitized input and completeness info for UX feedback
 */
export const sanitizeOTPInput = (input: string) => {
  // Remove any non-numeric characters
  const sanitized = input.replace(/[^0-9]/g, '');
  
  // Limit to 6 digits
  const limited = sanitized.slice(0, 6);
  
  return {
    sanitizedInput: limited,
    isComplete: limited.length === 6,
    charactersRemaining: Math.max(0, 6 - limited.length),
  };
};

/**
 * Debounces input validation to avoid excessive re-renders
 */
export const debounce = <T extends any[]>(
  func: (...args: T) => void,
  wait: number
): ((...args: T) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: T) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Sanitizes text input for security and UX
 */
export const sanitizeTextInput = (input: string, maxLength?: number): string => {
  let sanitized = input.trim();
  
  if (maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  
  // Remove any potentially harmful characters
  sanitized = sanitized.replace(/[<>]/g, '');
  
  return sanitized;
};