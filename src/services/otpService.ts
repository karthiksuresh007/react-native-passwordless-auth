import type { 
  OTPState, 
  OTPValidationResult, 
  OTPGenerationResult 
} from '../types';

/**
 * Generates a random 6-digit OTP code
 * Range: 000000 - 999999
 */
export function generateOTP(): string {
  const code = Math.floor(Math.random() * 1000000);
  return code.toString().padStart(6, '0');
}

/**
 * Builds initial OTP state with generated code and timestamps
 */
export function buildOTPState(email: string): OTPState {
  const code = generateOTP();
  const generatedAt = Date.now();
  const expiresAt = generatedAt + (60 * 1000); // 60 seconds
  
  return {
    code,
    email,
    generatedAt,
    expiresAt,
    attemptsRemaining: 3,
    isValid: true,
  };
}

/**
 * Validates OTP code against current state
 * Enforces 3 attempts limit and 60-second expiry
 */
export function validateOTP(
  inputCode: string, 
  otpState: OTPState
): OTPValidationResult {
  const currentTime = Date.now();
  
  // Check if OTP is expired
  if (otpState.expiresAt && currentTime > otpState.expiresAt) {
    return {
      isValid: false,
      isExpired: true,
      attemptsRemaining: otpState.attemptsRemaining,
      errorMessage: 'OTP has expired. Please request a new one.',
    };
  }
  
  // Check if no attempts remaining
  if (otpState.attemptsRemaining <= 0) {
    return {
      isValid: false,
      isExpired: false,
      attemptsRemaining: 0,
      errorMessage: 'Maximum attempts exceeded. Please request a new OTP.',
    };
  }
  
  // Check if OTP is invalid
  if (!otpState.isValid || !otpState.code) {
    return {
      isValid: false,
      isExpired: false,
      attemptsRemaining: otpState.attemptsRemaining,
      errorMessage: 'Invalid OTP state. Please request a new OTP.',
    };
  }
  
  // Validate code match
  const isCodeValid = inputCode === otpState.code;
  const newAttemptsRemaining = isCodeValid 
    ? otpState.attemptsRemaining 
    : otpState.attemptsRemaining - 1;
  
  if (isCodeValid) {
    return {
      isValid: true,
      isExpired: false,
      attemptsRemaining: newAttemptsRemaining,
      errorMessage: null,
    };
  }
  
  const errorMessage = newAttemptsRemaining > 0
    ? `Incorrect OTP. ${newAttemptsRemaining} attempt${newAttemptsRemaining === 1 ? '' : 's'} remaining.`
    : 'Incorrect OTP. Maximum attempts exceeded. Please request a new OTP.';
  
  return {
    isValid: false,
    isExpired: false,
    attemptsRemaining: newAttemptsRemaining,
    errorMessage,
  };
}

/**
 * Resets OTP state for resend functionality
 * Invalidates previous OTP and resets attempts
 */
export function resetOTPState(currentState: OTPState, email: string): OTPState {
  return buildOTPState(email);
}

/**
 * Updates OTP state after validation attempt
 */
export function updateOTPStateAfterValidation(
  otpState: OTPState,
  validationResult: OTPValidationResult
): OTPState {
  return {
    ...otpState,
    attemptsRemaining: validationResult.attemptsRemaining,
    isValid: validationResult.isValid || otpState.attemptsRemaining > 0,
  };
}
