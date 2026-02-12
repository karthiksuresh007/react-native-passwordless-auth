export interface EmailValidationResult {
  isValid: boolean;
  errorMessage: string | null;
  sanitizedEmail: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}
