import { Platform } from 'react-native';
import type { 
  AnalyticsEvent,
  OTPGeneratedEventParams,
  OTPValidationSuccessEventParams, 
  OTPValidationFailureEventParams,
  LogoutEventParams
} from '../types';

// Analytics interface for dependency injection
interface IAnalyticsService {
  initAnalytics(): Promise<void>;
  logEvent(event: AnalyticsEvent): Promise<void>;
}

// No-op implementation for fallback
class NoOpAnalyticsService implements IAnalyticsService {
  async initAnalytics(): Promise<void> {
    // Analytics initialization (no-op)
  }
  
  async logEvent(event: AnalyticsEvent): Promise<void> {
    // Log event (no-op - could be replaced with console.log in development)
  }
}

// Firebase implementation (when available)
class FirebaseAnalyticsService implements IAnalyticsService {
  private analytics: any = null;
  private isInitialized: boolean = false;
  
  constructor(firebaseAnalytics: any) {
    this.analytics = firebaseAnalytics;
  }
  
  async initAnalytics(): Promise<void> {
    try {
      await this.analytics().setAnalyticsCollectionEnabled(true);
      this.isInitialized = true;
    } catch (error) {
      console.warn('📊 Failed to initialize Firebase Analytics:', error);
      this.isInitialized = false;
    }
  }
  
  async logEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.isInitialized) {
      return;
    }
    
    try {
      await this.analytics().logEvent(event.eventName, {
        ...event.parameters,
        app_version: '1.0.0',
        platform: Platform.OS,
        timestamp: event.timestamp,
      });
    } catch (error) {
      console.warn('📊 Failed to log analytics event:', error);
    }
  }
}

// Service factory with Firebase detection
function createAnalyticsService(): IAnalyticsService {
  try {
    // Try to import Firebase Analytics
    const analytics = require('@react-native-firebase/analytics');
    if (analytics && analytics.default) {
      return new FirebaseAnalyticsService(analytics.default);
    }
  } catch (error) {
    // Firebase not installed, use no-op service
  }
  
  return new NoOpAnalyticsService();
}

// Singleton instance
const analyticsService = createAnalyticsService();

// Public API - never throws errors
export async function initAnalytics(): Promise<void> {
  try {
    await analyticsService.initAnalytics();
  } catch (error) {
    console.warn('📊 Analytics initialization failed:', error);
    // Never throw - analytics failures should not crash the app
  }
}

export async function logEvent(event: AnalyticsEvent): Promise<void> {
  try {
    await analyticsService.logEvent(event);
  } catch (error) {
    console.warn('📊 Analytics event logging failed:', error);
    // Never throw - analytics failures should not crash the app
  }
}

// Helper functions for specific events
export async function logOTPGenerated(params: OTPGeneratedEventParams): Promise<void> {
  await logEvent({
    eventName: 'otp_generated',
    parameters: params,
    timestamp: Date.now(),
  });
}

export function logOTPValidationSuccess(params: OTPValidationSuccessEventParams): Promise<void> {
  return logEvent({
    eventName: 'otp_validation_success', 
    parameters: params,
    timestamp: Date.now(),
  });
}

export function logOTPValidationFailure(params: OTPValidationFailureEventParams): Promise<void> {
  return logEvent({
    eventName: 'otp_validation_failure',
    parameters: params,
    timestamp: Date.now(),
  });
}

export function logLogout(params: LogoutEventParams): Promise<void> {
  return logEvent({
    eventName: 'logout',
    parameters: params,
    timestamp: Date.now(),
  });
}
