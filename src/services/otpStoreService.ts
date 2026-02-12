import type { OTPState } from '../types';

/**
 * Map type for storing OTP state by email address
 */
export type OTPStateByEmail = Map<string, OTPState>;

/**
 * In-memory store for OTP states per email
 * Note: This is local state, not global mutable state
 */
class OTPStore {
  private store: OTPStateByEmail = new Map();
  
  /**
   * Get OTP state for specific email
   */
  getState(email: string): OTPState | null {
    return this.store.get(email) || null;
  }
  
  /**
   * Set OTP state for specific email
   */
  setState(email: string, state: OTPState): void {
    this.store.set(email, state);
  }
  
  /**
   * Clear OTP state for specific email
   */
  clearState(email: string): void {
    this.store.delete(email);
  }
  
  /**
   * Clear all OTP states
   */
  clearAllStates(): void {
    this.store.clear();
  }
  
  /**
   * Check if email has active OTP state
   */
  hasState(email: string): boolean {
    return this.store.has(email);
  }
  
  /**
   * Get all active email addresses
   */
  getActiveEmails(): string[] {
    return Array.from(this.store.keys());
  }
}

/**
 * Singleton instance for OTP store
 * Each module that imports this gets the same instance
 */
const otpStoreInstance = new OTPStore();

/**
 * Get OTP state for email address
 */
export function getOTPState(email: string): OTPState | null {
  return otpStoreInstance.getState(email);
}

/**
 * Set OTP state for email address
 */
export function setOTPState(email: string, state: OTPState): void {
  otpStoreInstance.setState(email, state);
}

/**
 * Clear OTP state for email address
 */
export function clearOTPState(email: string): void {
  otpStoreInstance.clearState(email);
}

/**
 * Check if email has active OTP
 */
export function hasActiveOTP(email: string): boolean {
  return otpStoreInstance.hasState(email);
}

/**
 * Clear all OTP states (useful for testing/reset)
 */
export function clearAllOTPStates(): void {
  otpStoreInstance.clearAllStates();
}

/**
 * Get all emails with active OTPs
 */
export function getActiveOTPEmails(): string[] {
  return otpStoreInstance.getActiveEmails();
}
