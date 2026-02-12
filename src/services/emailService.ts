import type { EmailValidationResult } from '../types';

/**
 * RFC 5322 compliant email validation regex
 * Simplified but production-ready pattern
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Sanitizes email input by trimming whitespace and converting to lowercase
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Extracts domain from email address
 */
export function getEmailDomain(email: string): string {
  const sanitized = sanitizeEmail(email);
  const atIndex = sanitized.indexOf('@');
  
  if (atIndex === -1) {
    return '';
  }
  
  return sanitized.substring(atIndex + 1);
}

/**
 * Validates email format using RFC 5322 compatible regex
 */
export function validateEmailFormat(email: string): EmailValidationResult {
  const sanitizedEmail = sanitizeEmail(email);
  
  if (!sanitizedEmail) {
    return {
      isValid: false,
      errorMessage: 'Email address is required',
      sanitizedEmail,
    };
  }
  
  if (sanitizedEmail.length > 254) {
    return {
      isValid: false,
      errorMessage: 'Email address is too long',
      sanitizedEmail,
    };
  }
  
  const isValid = EMAIL_REGEX.test(sanitizedEmail);
  
  return {
    isValid,
    errorMessage: isValid ? null : 'Please enter a valid email address',
    sanitizedEmail,
  };
}
