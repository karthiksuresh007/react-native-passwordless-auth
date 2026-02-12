import { useReducer, useCallback, useRef, useEffect, useMemo } from 'react';
import type { OTPState, OTPValidationResult } from '../types';
import {
  buildOTPState,
  validateOTP,
  resetOTPState,
  updateOTPStateAfterValidation,
  getOTPState,
  setOTPState,
  clearOTPState,
  getEmailDomain,
  logOTPGenerated,
  logOTPValidationSuccess,
  logOTPValidationFailure,
} from '../services';

// OTP reducer action types
type OTPAction =
  | { type: 'INIT'; payload: { email: string } }
  | { type: 'GENERATE'; payload: { email: string } }
  | { type: 'VALIDATE'; payload: { code: string } }
  | { type: 'RESET'; payload: { email: string } }
  | { type: 'CLEAR' };

// Enhanced OTP state to store validation result
interface EnhancedOTPState extends OTPState {
  lastValidationResult?: OTPValidationResult;
}

// Initial state
const initialState: EnhancedOTPState = {
  code: null,
  email: '',
  generatedAt: null,
  expiresAt: null,
  attemptsRemaining: 3,
  isValid: false,
};

// OTP reducer
function otpReducer(state: EnhancedOTPState, action: OTPAction): EnhancedOTPState {
  switch (action.type) {
    case 'INIT': {
      const { email } = action.payload;
      const existingState = getOTPState(email);
      return existingState || { ...initialState, email };
    }
    
    case 'GENERATE': {
      const { email } = action.payload;
      const newState = buildOTPState(email);
      setOTPState(email, newState);
      
      // Development logging - show generated OTP
      if (__DEV__ && newState.code) {
        console.log(`[DEV] OTP generated for ${email}: ${newState.code}`);
      }
      
      return newState;
    }
    
    case 'VALIDATE': {
      const { code } = action.payload;
      // Get current state and perform validation with current state
      const validationResult = validateOTP(code, state);
      const updatedState = updateOTPStateAfterValidation(state, validationResult);
      setOTPState(state.email, updatedState);
      return { ...updatedState, lastValidationResult: validationResult };
    }
    
    case 'RESET': {
      const { email } = action.payload;
      const newState = resetOTPState(state, email);
      setOTPState(email, newState);
      return newState;
    }
    
    case 'CLEAR': {
      if (state.email) {
        clearOTPState(state.email);
      }
      return initialState;
    }
    
    default:
      return state;
  }
}

export interface UseOTPReturn {
  otpState: OTPState;
  requestOTP: (email: string) => void;
  submitOTP: (code: string) => OTPValidationResult;
  resetOTP: () => void;
  clearOTP: () => void;
  isExpired: boolean;
  isLocked: boolean;
}

/**
 * Custom hook for OTP state management
 * Handles generation, validation, and state transitions
 */
export function useOTP(): UseOTPReturn {
  const [otpState, dispatch] = useReducer(otpReducer, initialState);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValidationRef = useRef<OTPValidationResult | null>(null);
  const currentEmailRef = useRef<string>('');
  const validationInProgressRef = useRef<boolean>(false);
  
  // Initialize OTP state for email
  const initOTPState = useCallback((email: string) => {
    dispatch({ type: 'INIT', payload: { email } });
  }, []);
  
  // Request new OTP for email
  const requestOTP = useCallback((email: string) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    dispatch({ type: 'GENERATE', payload: { email } });
    
    // Log analytics event
    const emailDomain = getEmailDomain(email);
    logOTPGenerated({
      email_domain: emailDomain,
      timestamp: Date.now(),
    });
    
    // Set timeout for expiry handling
    timeoutRef.current = setTimeout(() => {
      // Force re-render to update isExpired state
      dispatch({ type: 'INIT', payload: { email } });
    }, 60000); // 60 seconds
  }, []);
  
  // Submit OTP for validation  
  const submitOTP = useCallback((code: string): OTPValidationResult => {
    // Prevent race conditions from multiple rapid calls
    if (validationInProgressRef.current) {
      return {
        isValid: false,
        isExpired: false,
        attemptsRemaining: 3, // Safe fallback
        errorMessage: 'Validation in progress. Please wait.',
      };
    }
    
    // Mark validation as in progress
    validationInProgressRef.current = true;
    
    // Get current state from store to avoid stale closures
    const currentEmail = currentEmailRef.current;
    const currentState = getOTPState(currentEmail);
    
    if (!currentState) {
      validationInProgressRef.current = false;
      return {
        isValid: false,
        isExpired: false,
        attemptsRemaining: 0,
        errorMessage: 'No active OTP session',
      };
    }
    
    // Dispatch validation action
    dispatch({
      type: 'VALIDATE',
      payload: { code },
    });
    
    // Validate against current state from store
    const validationResult = validateOTP(code, currentState);
    
    // Log analytics event
    const emailDomain = getEmailDomain(currentEmail);
    if (validationResult.isValid) {
      const attemptsUsed = 3 - validationResult.attemptsRemaining + 1;
      logOTPValidationSuccess({
        email_domain: emailDomain,
        attempts_used: attemptsUsed,
      });
    } else {
      let failureReason = 'incorrect_code';
      if (validationResult.isExpired) {
        failureReason = 'expired';
      } else if (validationResult.attemptsRemaining <= 0) {
        failureReason = 'max_attempts_exceeded';
      }
      
      logOTPValidationFailure({
        email_domain: emailDomain,
        failure_reason: failureReason,
      });
    }
    
    // Handle timer cleanup
    if (validationResult.isValid && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Reset validation progress flag
    validationInProgressRef.current = false;
    
    return validationResult;
  }, []);
  
  // Reset OTP (for resend)
  const resetOTP = useCallback(() => {
    const currentEmail = currentEmailRef.current;
    if (currentEmail) {
      dispatch({ type: 'RESET', payload: { email: currentEmail } });
      
      // Clear existing timeout and set new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        dispatch({ type: 'INIT', payload: { email: currentEmail } });
      }, 60000);
    }
  }, []);
  
  // Clear OTP state completely
  const clearOTP = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    dispatch({ type: 'CLEAR' });
  }, []);
  
  // Memoized computed states to prevent unnecessary Date.now() calls
  const isExpired = useMemo(() => 
    otpState.expiresAt ? Date.now() > otpState.expiresAt : false,
    [otpState.expiresAt]
  );
  const isLocked = useMemo(() =>
    otpState.attemptsRemaining <= 0,
    [otpState.attemptsRemaining]
  );
  
  // Update refs when state changes
  useEffect(() => {
    currentEmailRef.current = otpState.email;
    
    if (otpState.lastValidationResult) {
      latestValidationRef.current = otpState.lastValidationResult;
      
      // Clear timeout if validation successful
      if (otpState.lastValidationResult.isValid && timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [otpState.email, otpState.lastValidationResult]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    otpState,
    requestOTP,
    submitOTP,
    resetOTP,
    clearOTP,
    isExpired,
    isLocked,
  };
}
