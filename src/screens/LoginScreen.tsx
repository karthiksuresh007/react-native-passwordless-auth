import React, { useState, useCallback, memo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  AccessibilityInfo,
  ActivityIndicator,
} from 'react-native';
import { useOTP } from '../hooks';
import { validateEmailFormat } from '../services';
import { validateEmail, sanitizeOTPInput, debounce } from '../utils';
import type { EmailValidationResult, OTPValidationResult } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (email: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = memo(({ onLoginSuccess }) => {
  // Local UI state
  const [email, setEmail] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  
  // Phase 7: Enhanced loading states for better UX
  const [isSendingOTP, setIsSendingOTP] = useState<boolean>(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState<boolean>(false);
  
  // Phase 7: Enhanced validation states
  const [emailValidationResult, setEmailValidationResult] = useState<EmailValidationResult | null>(null);
  
  // OTP hook
  const { otpState, requestOTP, submitOTP, resetOTP, isExpired, isLocked } = useOTP();

  // Phase 7: Debounced email validation for better UX
  const debouncedEmailValidation = useCallback(
    debounce((emailInput: string) => {
      if (emailInput.trim()) {
        const validation = validateEmail(emailInput);
        setEmailValidationResult(validation);
        if (validation.isValid) {
          setEmailError(null);
        }
      } else {
        setEmailValidationResult(null);
        setEmailError(null);
      }
    }, 300),
    []
  );

  // Phase 7: Enhanced email validation and OTP request with loading states
  const handleSendOTP = useCallback(async () => {
    try {
      // Clear previous errors
      setEmailError(null);
      setIsSendingOTP(true);
      
      // Enhanced email validation using Phase 7 utility
      const emailValidation = validateEmail(email);
      setEmailValidationResult(emailValidation);
      
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.errorMessage || 'Please enter a valid email address');
        return;
      }

      // Announce to screen readers
      AccessibilityInfo.announceForAccessibility('Sending verification code');

      // Request OTP with the sanitized email
      requestOTP(emailValidation.sanitizedEmail);
      setEmail(emailValidation.sanitizedEmail);
      setIsOtpSent(true);
      setOtpCode('');
      setOtpError(null);
      
      // Announce success to screen readers
      AccessibilityInfo.announceForAccessibility('Verification code sent to your email');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setEmailError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSendingOTP(false);
    }
  }, [email, requestOTP, debouncedEmailValidation]);

  // Phase 7: Enhanced OTP validation with loading states and better error handling
  const handleVerifyOTP = useCallback(async () => {
    try {
      // Clear previous errors
      setOtpError(null);
      setIsVerifyingOTP(true);
      
      // Announce to screen readers
      AccessibilityInfo.announceForAccessibility('Verifying code');

      // Delegate ALL validation to business layer - no UI pre-validation
      const validationResult: OTPValidationResult = submitOTP(otpCode);
      
      if (validationResult.isValid) {
        // Announce success to screen readers
        AccessibilityInfo.announceForAccessibility('Login successful');
        onLoginSuccess(email);
      } else {
        // Enhanced error messages based on attempts remaining
        let errorMessage = validationResult.errorMessage || 'Invalid verification code';
        
        if (otpState.attemptsRemaining <= 1) {
          errorMessage += '. One attempt remaining before the code expires.';
        } else if (otpState.attemptsRemaining <= 3) {
          errorMessage += `. ${otpState.attemptsRemaining} attempts remaining.`;
        }
        
        setOtpError(errorMessage);
        
        // Announce error to screen readers
        AccessibilityInfo.announceForAccessibility(errorMessage);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setOtpError(errorMessage);
      AccessibilityInfo.announceForAccessibility(errorMessage);
    } finally {
      setIsVerifyingOTP(false);
    }
  }, [otpCode, submitOTP, onLoginSuccess, email, otpState.attemptsRemaining]);

  // Phase 7: Enhanced resend OTP with loading state and error clearing
  const handleResendOTP = useCallback(async () => {
    try {
      // Clear all OTP-related states
      resetOTP();
      setOtpCode('');
      setOtpError(null);
      
      // Announce to screen readers
      AccessibilityInfo.announceForAccessibility('Requesting new verification code');
      
      await handleSendOTP();
    } catch (error) {
      console.error('Error resending OTP:', error);
      setEmailError('Failed to resend verification code. Please try again.');
    }
  }, [resetOTP, handleSendOTP]);

  // Phase 7: Enhanced email input change with real-time validation
  const handleEmailChange = useCallback((text: string) => {
    const sanitizedText = text.trim();
    setEmail(sanitizedText);
    setEmailError(null);
    setEmailValidationResult(null);
    
    // Trigger debounced validation for better UX
    if (sanitizedText.length > 0) {
      debouncedEmailValidation(sanitizedText);
    }
  }, [debouncedEmailValidation]);

  // Phase 7: Enhanced OTP input change with sanitization only (NO validation)
  const handleOtpChange = useCallback((text: string) => {
    // Use Phase 7 sanitization utility for input hygiene only
    const sanitized = sanitizeOTPInput(text);
    setOtpCode(sanitized.sanitizedInput);
    setOtpError(null);
    
    // Provide UX feedback for input progress (not validation)
    if (sanitized.sanitizedInput.length === 3) {
      AccessibilityInfo.announceForAccessibility('Half way through entering code');
    }
  }, []);

  // Phase 7: Enhanced computed states with loading considerations
  const canSendOTP = email.trim().length > 0 && !isOtpSent && !isSendingOTP;
  const canVerifyOTP = isOtpSent && otpCode.length === 6 && !isExpired && !isLocked && !isVerifyingOTP;
  const shouldShowResend = isOtpSent && (isExpired || isLocked) && !isSendingOTP;
  const isEmailValid = emailValidationResult?.isValid ?? false;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Passwordless Login</Text>
        
        {/* Phase 7: Enhanced Email Input Section with accessibility */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[
              styles.input, 
              emailError ? styles.inputError : null,
              isEmailValid && email.trim().length > 0 ? styles.inputValid : null
            ]}
            value={email}
            onChangeText={handleEmailChange}
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            editable={!isOtpSent && !isSendingOTP}
            accessibilityLabel="Email address input"
            accessibilityHint="Enter your email address to receive a verification code"
            accessibilityValue={{
              text: email.length > 0 ? `${email.length} characters entered` : 'No email entered'
            }}
          />
          {/* Phase 7: Enhanced email validation feedback */}
          {emailError && (
            <Text 
              style={styles.errorText}
              accessibilityRole="alert"
            >
              {emailError}
            </Text>
          )}
          {isEmailValid && email.trim().length > 0 && (
            <Text 
              style={styles.validText}
            >
              ✓ Valid email address
            </Text>
          )}
        </View>

        {/* Phase 7: Enhanced Send OTP Button with loading state */}
        {!isOtpSent && (
          <TouchableOpacity
            style={[
              styles.button, 
              canSendOTP ? styles.buttonEnabled : styles.buttonDisabled,
              isSendingOTP ? styles.buttonLoading : null
            ]}
            onPress={handleSendOTP}
            disabled={!canSendOTP || isSendingOTP}
            accessibilityLabel="Send verification code button"
            accessibilityHint="Tap to send a verification code to your email"
            accessibilityState={{
              disabled: !canSendOTP || isSendingOTP,
              busy: isSendingOTP
            }}
          >
            {isSendingOTP ? (
              <View style={styles.buttonLoadingContainer}>
                <ActivityIndicator 
                  size="small" 
                  color="#ffffff" 
                  accessibilityLabel="Sending verification code"
                />
                <Text style={[styles.buttonText, styles.buttonTextEnabled]}>
                  Sending...
                </Text>
              </View>
            ) : (
              <Text style={[
                styles.buttonText, 
                canSendOTP ? styles.buttonTextEnabled : styles.buttonTextDisabled
              ]}>
                Send Verification Code
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Phase 7: Enhanced OTP Input Section with accessibility */}
        {isOtpSent && (
          <View style={styles.inputSection}>
            <Text style={styles.label}>
              Verification Code
              {otpState.attemptsRemaining > 0 && (
                <Text style={styles.attemptsText}>
                  {' '}({otpState.attemptsRemaining} attempts remaining)
                </Text>
              )}
            </Text>
            <TextInput
              style={[
                styles.input, 
                styles.otpInput, 
                otpError ? styles.inputError : null,
                otpCode.length === 6 ? styles.inputComplete : null
              ]}
              value={otpCode}
              onChangeText={handleOtpChange}
              placeholder="Enter 6-digit code"
              keyboardType="numeric"
              maxLength={6}
              editable={!isExpired && !isLocked && !isVerifyingOTP}
              autoFocus={true}
              accessibilityLabel="Verification code input"
              accessibilityHint="Enter the 6-digit code sent to your email"
              accessibilityValue={{
                text: `${otpCode.length} of 6 digits entered`
              }}
              accessibilityState={{
                disabled: isExpired || isLocked || isVerifyingOTP
              }}
            />
            
            {/* Phase 7: Enhanced progress indicator for OTP entry */}
            {otpCode.length > 0 && otpCode.length < 6 && !otpError && (
              <Text style={styles.progressText}>
                {6 - otpCode.length} more digits needed
              </Text>
            )}
            
            {/* Phase 7: Enhanced error messaging */}
            {otpError && (
              <Text 
                style={styles.errorText}
                accessibilityRole="alert"
              >
                {otpError}
              </Text>
            )}
            
            {/* Phase 7: Enhanced status messages */}
            {isExpired && (
              <Text 
                style={styles.warningText}
                accessibilityRole="alert"
              >
                ⏰ Verification code has expired. Please request a new one below.
              </Text>
            )}
            
            {isLocked && (
              <Text 
                style={styles.warningText}
                accessibilityRole="alert"
              >
                🔒 Too many incorrect attempts. Please request a new verification code below.
              </Text>
            )}
          </View>
        )}

        {/* Phase 7: Enhanced Verify OTP Button with loading state */}
        {isOtpSent && !shouldShowResend && (
          <TouchableOpacity
            style={[
              styles.button, 
              canVerifyOTP ? styles.buttonEnabled : styles.buttonDisabled,
              isVerifyingOTP ? styles.buttonLoading : null
            ]}
            onPress={handleVerifyOTP}
            disabled={!canVerifyOTP || isVerifyingOTP}
            accessibilityLabel="Verify code button"
            accessibilityHint="Tap to verify the entered code and complete login"
            accessibilityState={{
              disabled: !canVerifyOTP || isVerifyingOTP,
              busy: isVerifyingOTP
            }}
          >
            {isVerifyingOTP ? (
              <View style={styles.buttonLoadingContainer}>
                <ActivityIndicator 
                  size="small" 
                  color="#ffffff" 
                  accessibilityLabel="Verifying code"
                />
                <Text style={[styles.buttonText, styles.buttonTextEnabled]}>
                  Verifying...
                </Text>
              </View>
            ) : (
              <Text style={[
                styles.buttonText, 
                canVerifyOTP ? styles.buttonTextEnabled : styles.buttonTextDisabled
              ]}>
                Verify Code
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Phase 7: Enhanced Resend OTP Button with loading state */}
        {shouldShowResend && (
          <TouchableOpacity
            style={[
              styles.button, 
              styles.buttonSecondary,
              isSendingOTP ? styles.buttonLoading : null
            ]}
            onPress={handleResendOTP}
            disabled={isSendingOTP}
            accessibilityLabel="Request new verification code button"
            accessibilityHint="Tap to request a new verification code to your email"
            accessibilityState={{
              disabled: isSendingOTP,
              busy: isSendingOTP
            }}
          >
            {isSendingOTP ? (
              <View style={styles.buttonLoadingContainer}>
                <ActivityIndicator 
                  size="small" 
                  color="#ffffff" 
                  accessibilityLabel="Requesting new code"
                />
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                  Sending...
                </Text>
              </View>
            ) : (
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                Request New Code
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  otpInput: {
    textAlign: 'center',
    letterSpacing: 4,
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 4,
  },
  warningText: {
    color: '#ff8c00',
    fontSize: 14,
    marginTop: 4,
  },
  attemptsText: {
    color: '#666666',
    fontSize: 13,
    fontWeight: 'normal',
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonEnabled: {
    backgroundColor: '#007bff',
  },
  buttonDisabled: {
    backgroundColor: '#e9ecef',
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextEnabled: {
    color: '#ffffff',
  },
  buttonTextDisabled: {
    color: '#adb5bd',
  },
  buttonTextSecondary: {
    color: '#ffffff',
  },
  // Phase 7: Enhanced styles for better UX and accessibility
  inputValid: {
    borderColor: '#28a745',
  },
  inputComplete: {
    borderColor: '#007bff',
    borderWidth: 2,
  },
  validText: {
    color: '#28a745',
    fontSize: 14,
    marginTop: 4,
  },
  progressText: {
    color: '#6c757d',
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonLoading: {
    opacity: 0.8,
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});

LoginScreen.displayName = 'LoginScreen';

export { LoginScreen };
