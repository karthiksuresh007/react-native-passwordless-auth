export type AnalyticsEventName = 
  | 'otp_generated'
  | 'otp_validation_success'
  | 'otp_validation_failure'
  | 'logout';

export interface AnalyticsEvent {
  eventName: AnalyticsEventName;
  parameters: Record<string, string | number | boolean>;
  timestamp: number;
}

export interface OTPGeneratedEventParams extends Record<string, string | number | boolean> {
  email_domain: string;
  timestamp: number;
}

export interface OTPValidationSuccessEventParams extends Record<string, string | number | boolean> {
  email_domain: string;
  attempts_used: number;
}

export interface OTPValidationFailureEventParams extends Record<string, string | number | boolean> {
  email_domain: string;
  failure_reason: string;
}

export interface LogoutEventParams extends Record<string, string | number | boolean> {
  session_duration: number;
}
