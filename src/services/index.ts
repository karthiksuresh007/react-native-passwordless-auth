// Email service exports
export {
  sanitizeEmail,
  getEmailDomain,
  validateEmailFormat,
} from './emailService';

// OTP service exports
export {
  generateOTP,
  buildOTPState,
  validateOTP,
  resetOTPState,
  updateOTPStateAfterValidation,
} from './otpService';

// OTP store service exports
export {
  type OTPStateByEmail,
  getOTPState,
  setOTPState,
  clearOTPState,
  hasActiveOTP,
  clearAllOTPStates,
  getActiveOTPEmails,
} from './otpStoreService';

// Analytics service exports
export {
  initAnalytics,
  logEvent,
  logOTPGenerated,
  logOTPValidationSuccess,
  logOTPValidationFailure,
  logLogout,
} from './analyticsService';
