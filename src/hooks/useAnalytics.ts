import { useCallback } from 'react';
import { 
  logEvent,
  logOTPGenerated,
  logOTPValidationSuccess,
  logOTPValidationFailure,
  logLogout,
} from '../services';
import type {
  AnalyticsEvent,
  OTPGeneratedEventParams,
  OTPValidationSuccessEventParams,
  OTPValidationFailureEventParams,
  LogoutEventParams,
} from '../types';

export interface UseAnalyticsReturn {
  logEvent: (event: AnalyticsEvent) => Promise<void>;
  logOTPGenerated: (params: OTPGeneratedEventParams) => Promise<void>;
  logOTPValidationSuccess: (params: OTPValidationSuccessEventParams) => Promise<void>;
  logOTPValidationFailure: (params: OTPValidationFailureEventParams) => Promise<void>;
  logLogout: (params: LogoutEventParams) => Promise<void>;
}

/**
 * Hook for analytics event logging with error handling
 * Never throws errors - analytics failures should not crash the app
 */
export function useAnalytics(): UseAnalyticsReturn {
  const handleLogEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      await logEvent(event);
    } catch (error) {
      // Silently handle analytics errors - never crash the app
      console.warn('📊 Analytics logging failed:', error);
    }
  }, []);
  
  const handleLogOTPGenerated = useCallback(async (params: OTPGeneratedEventParams) => {
    try {
      await logOTPGenerated(params);
    } catch (error) {
      console.warn('📊 Analytics logging failed:', error);
    }
  }, []);
  
  const handleLogOTPValidationSuccess = useCallback(async (params: OTPValidationSuccessEventParams) => {
    try {
      await logOTPValidationSuccess(params);
    } catch (error) {
      console.warn('📊 Analytics logging failed:', error);
    }
  }, []);
  
  const handleLogOTPValidationFailure = useCallback(async (params: OTPValidationFailureEventParams) => {
    try {
      await logOTPValidationFailure(params);
    } catch (error) {
      console.warn('📊 Analytics logging failed:', error);
    }
  }, []);
  
  const handleLogLogout = useCallback(async (params: LogoutEventParams) => {
    try {
      await logLogout(params);
    } catch (error) {
      console.warn('📊 Analytics logging failed:', error);
    }
  }, []);

  return {
    logEvent: handleLogEvent,
    logOTPGenerated: handleLogOTPGenerated,
    logOTPValidationSuccess: handleLogOTPValidationSuccess,
    logOTPValidationFailure: handleLogOTPValidationFailure,
    logLogout: handleLogLogout,
  };
}
