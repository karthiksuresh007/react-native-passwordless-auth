# Passwordless Authentication Mobile Application

## Product Summary

A React Native mobile application implementing secure passwordless authentication using email and OTP verification, coupled with real-time session tracking. The application operates entirely offline without backend dependencies, utilizing local state management and Firebase Analytics for event tracking.

## Objectives

- Deliver a production-ready passwordless authentication experience within a 6-7 hour development window
- Implement robust OTP generation and validation logic with proper state management
- Provide real-time session tracking with persistent timers
- Integrate comprehensive analytics tracking for user behavior insights
- Establish clean architectural patterns suitable for enterprise-grade mobile applications

## Non-Goals

- Backend API integration or server-side validation
- Persistent user data storage across app sessions
- Complex user profile management
- Multi-factor authentication beyond email + OTP
- Biometric authentication
- Social login integrations
- Advanced security features (encryption, token refresh)

## User Flow

### Primary Authentication Flow

1. User launches application
2. User enters email address
3. User taps "Send OTP" button
4. System generates 6-digit OTP locally
5. User enters received OTP
6. System validates OTP and attempts remaining
7. On successful validation, user proceeds to session screen
8. Session screen displays start time, live duration, and logout option

### Error Flow

1. Invalid email format -> Display validation error
2. Incorrect OTP -> Decrement attempts, show error
3. Expired OTP -> Show expiration message, allow resend
4. Maximum attempts exceeded -> Show lockout message, require new OTP generation

## Functional Requirements

### Email Validation

| Requirement | Description | Priority |
|-------------|-------------|-----------|
| Email Format | RFC 5322 compliant email validation | P0 |
| Input Sanitization | Trim whitespace, lowercase conversion | P0 |
| Visual Feedback | Real-time validation indicators | P1 |

### OTP Generation & Validation

| Requirement | Description | Priority |
|-------------|-------------|-----------|
| OTP Format | Exactly 6 numeric digits (000000-999999) | P0 |
| Expiration | 60-second expiration from generation timestamp | P0 |
| Attempt Limit | Maximum 3 validation attempts per OTP | P0 |
| State Reset | New OTP invalidates previous OTP and resets attempts | P0 |
| Email Scoping | OTP state maintained per email address | P0 |

### Session Management

| Requirement | Description | Priority |
|-------------|-------------|-----------|
| Session Timing | Track session start timestamp | P0 |
| Live Duration | Display mm:ss format timer updating every second | P0 |
| Timer Persistence | Timer continues across component re-renders | P0 |
| Background Handling | Timer accuracy maintained during app backgrounding | P1 |
| Cleanup | Timer cleanup on logout and component unmount | P0 |

### Analytics Integration

| Requirement | Description | Priority |
|-------------|-------------|-----------|
| Firebase Setup | Initialize Firebase Analytics on app launch | P0 |
| Event Logging | Log predefined events with structured parameters | P0 |
| Error Tracking | Capture validation failures with context | P0 |

## Non-Functional Requirements

### Performance

- OTP generation response time: < 100ms
- UI state updates: < 16ms (60 FPS)
- Memory usage: < 50MB baseline
- No memory leaks during session lifecycle

### Reliability

- 99.9% OTP generation success rate
- Zero timer drift over 24-hour sessions
- Graceful handling of app state transitions
- Recovery from unexpected termination

### Usability

- Intuitive flow completion within 30 seconds
- Clear error messaging with actionable guidance
- Accessible design following WCAG 2.1 AA standards
- Responsive layout across device sizes

## Technical Architecture

### Project Structure

```
src/
├── screens/           # Screen components (LoginScreen, SessionScreen)
├── hooks/            # Custom hooks (useOTP, useSession, useAnalytics)
├── services/         # Business logic (otpService, analyticsService)
├── types/           # TypeScript interface definitions
└── utils/           # Pure utility functions
```

### Folder Responsibilities

| Folder | Purpose | Guidelines |
|--------|---------|-----------|
| `screens/` | UI components representing full screens | No business logic, composition only |
| `hooks/` | Encapsulated stateful logic with React hooks | Single responsibility, testable |
| `services/` | Pure business logic and side effect management | Framework-agnostic, dependency-injectable |
| `types/` | TypeScript interfaces and type definitions | Shared contracts across modules |
| `utils/` | Pure functions for data transformation | No side effects, easily testable |

### Component Architecture

```typescript
// Clean separation of concerns
const LoginScreen = () => {
  const { otpState, generateOTP, validateOTP } = useOTP();
  const { logEvent } = useAnalytics();
  
  // UI logic only - no business logic in JSX
  return <View>{/* JSX */}</View>;
};
```

## Data Models

### OTP State Interface

```typescript
interface OTPState {
  code: string | null;
  email: string;
  generatedAt: number | null;
  expiresAt: number | null;
  attemptsRemaining: number;
  isValid: boolean;
}
```

### Session State Interface

```typescript
interface SessionState {
  isActive: boolean;
  startTime: number | null;
  duration: number;
  email: string;
}
```

### Analytics Event Interface

```typescript
interface AnalyticsEvent {
  eventName: string;
  parameters: Record<string, string | number | boolean>;
  timestamp: number;
}
```

## State Management Design

### Local State Strategy

- `useState` for component-local state
- `useReducer` for complex state transitions in OTP logic
- `useContext` for cross-component session state
- `useMemo` for expensive computations
- `useRef` for timer references and mutable values

### State Update Patterns

```typescript
// Atomic state updates
const [otpState, setOTPState] = useState<OTPState>(initialState);

// Immutable updates only
setOTPState(prev => ({
  ...prev,
  attemptsRemaining: prev.attemptsRemaining - 1
}));
```

### Memory Management

- Cleanup intervals in `useEffect` return functions
- Clear timeouts on component unmount
- Remove event listeners on cleanup
- Null out references to prevent leaks

## Analytics Design

### Firebase Analytics Integration

#### Initialization Strategy

```typescript
// App.tsx initialization
useEffect(() => {
  analytics().setAnalyticsCollectionEnabled(true);
}, []);
```

#### Event Naming Convention

| Event | Parameters | Trigger |
|-------|------------|---------|
| `otp_generated` | `email_domain: string, timestamp: number` | OTP creation |
| `otp_validation_success` | `email_domain: string, attempts_used: number` | Successful login |
| `otp_validation_failure` | `email_domain: string, failure_reason: string` | Failed validation |
| `logout` | `session_duration: number` | User logout |

#### Logging Architecture

```typescript
const logEvent = useCallback((event: AnalyticsEvent) => {
  analytics().logEvent(event.eventName, {
    ...event.parameters,
    app_version: '1.0.0',
    platform: Platform.OS
  });
}, []);
```

## Edge Case Handling

### OTP Expiration

- Check expiration on every validation attempt
- Display clear expiration message
- Automatically disable input after expiration
- Provide immediate resend option

### Attempt Exhaustion

- Lock OTP input after 3 failed attempts
- Display attempts remaining counter
- Force new OTP generation to reset state
- Log attempt exhaustion events

### App Backgrounding

- Persist timer state using app state listeners
- Calculate elapsed time on foreground return
- Maintain session accuracy across state transitions
- Handle iOS/Android backgrounding differences

### Network Interruption

- Firebase Analytics offline queueing
- Graceful degradation without analytics
- Event retry logic for connection recovery

## Risks & Mitigations

### Primary Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Timer drift during backgrounding | High | Medium | Use app state listeners + timestamp calculations |
| Memory leaks from interval timers | High | Low | Strict cleanup in useEffect dependencies |
| OTP state corruption | High | Low | Immutable state updates with validation |
| Firebase initialization failures | Medium | Low | Fallback analytics service with no-op methods |

### Technical Debt Risks

- Rushed implementation leading to architectural shortcuts
- Insufficient testing coverage within time constraints
- Hard-coded configuration values requiring future refactoring

## Acceptance Criteria

### Email + OTP Flow

- [ ] Valid email formats accepted, invalid formats rejected
- [ ] OTP generated within 100ms of button press
- [ ] 6-digit numeric OTP displayed in development logs
- [ ] OTP expires exactly 60 seconds after generation
- [ ] Maximum 3 validation attempts enforced per OTP
- [ ] New OTP invalidates previous OTP completely
- [ ] State maintained separately per email address

### Session Management

- [ ] Session start time captured at login completion
- [ ] Timer displays mm:ss format updating every second
- [ ] Timer persists across component re-renders
- [ ] Timer stops immediately on logout
- [ ] No timer leaks after component unmount

### Analytics Integration

- [ ] Firebase Analytics initializes without errors
- [ ] All required events logged with correct parameters
- [ ] Events include email domain (not full email) for privacy
- [ ] Analytics functions gracefully degrade if Firebase unavailable

## Definition of Done

### Code Quality

- [ ] All components use TypeScript with strict type checking
- [ ] Zero ESLint errors with recommended rules
- [ ] No business logic inside JSX render blocks
- [ ] All useEffect hooks have proper dependency arrays
- [ ] Memory leak testing completed for 10-minute sessions

### Testing

- [ ] Unit tests for OTP generation and validation logic
- [ ] Timer accuracy verified across app state transitions
- [ ] Analytics event emission verified in development
- [ ] Manual testing completed on iOS and Android devices

### Documentation

- [ ] README includes OTP logic explanation
- [ ] Data structure rationale documented
- [ ] Firebase Analytics setup instructions provided
- [ ] Clear separation of AI-assisted vs self-implemented code

### Deployment Readiness

- [ ] Production Firebase configuration ready
- [ ] Build succeeds on clean environment
- [ ] No development dependencies in production bundle
- [ ] App store submission requirements met

## Prohibited Implementations

### Architectural Violations

- Global mutable variables for state management
- setInterval without corresponding clearInterval
- Business logic embedded within JSX render blocks
- Direct DOM manipulation or imperative updates
- Copied boilerplate code without customization

### Anti-Patterns

```typescript
// FORBIDDEN: Logic in JSX
return (
  <View>
    {/* NEVER DO THIS */}
    {Date.now() - otpGeneratedAt > 60000 ? <ExpiredMessage /> : <ValidOTP />}
  </View>
);

// FORBIDDEN: Global state
let globalOTPState = {}; // Never use global variables

// FORBIDDEN: Memory leaks
useEffect(() => {
  const interval = setInterval(() => {}, 1000);
  // Missing cleanup causes memory leak
}, []);
```

## Future Enhancements

### High-Value Additions

| Enhancement | Effort | Value | Description |
|-------------|--------|-------|-------------|
| Visual Countdown Timer | 2h | High | Circular progress indicator for OTP expiration |
| Custom Hooks Library | 3h | Medium | Reusable hooks for OTP and session logic |
| Session Persistence | 4h | Medium | Maintain session across app restarts |
| Biometric Integration | 8h | High | Touch/Face ID for enhanced security |
| Offline Analytics Queue | 2h | Medium | Reliable event delivery without network |

### Advanced Features

- Multi-language support with i18n
- Advanced accessibility features
- Custom keyboard for OTP input
- Haptic feedback for user interactions
- Dark mode theme support
- Tablet-optimized layouts

### Technical Improvements

- Unit test coverage above 80%
- End-to-end testing with Detox
- Performance monitoring integration
- Crash reporting with detailed context
- A/B testing framework for UI variations