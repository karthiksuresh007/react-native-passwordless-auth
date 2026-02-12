export interface OTPState {
  code: string | null;
  email: string;
  generatedAt: number | null;
  expiresAt: number | null;
  attemptsRemaining: number;
  isValid: boolean;
}

export interface OTPValidationResult {
  isValid: boolean;
  isExpired: boolean;
  attemptsRemaining: number;
  errorMessage: string | null;
}

export interface OTPGenerationResult {
  code: string;
  generatedAt: number;
  expiresAt: number;
}
