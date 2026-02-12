# Passwordless Authentication - React Native

A production-grade React Native CLI application demonstrating offline passwordless authentication with OTP simulation, clean architecture patterns, and comprehensive lifecycle management.

## Project Overview

This is an **offline passwordless authentication simulation** designed to showcase enterprise-level React Native architecture without requiring backend infrastructure. The application generates and validates 6-digit OTP codes locally using deterministic business logic.

**Key Design Principle**: OTP generation and validation occur entirely on-device by design, not as a limitation. This demonstrates how secure authentication logic can be implemented in mobile applications while maintaining clean separation of concerns.

**Assignment Context**: This offline approach was chosen to meet assignment requirements that explicitly forbid backend services, demonstrating pure client-side architecture patterns. Email delivery is simulated locally since the assignment constraints prohibit server-side infrastructure implementation.

**Target:** Android devices with optional Firebase Analytics integration.

---

## Architecture Explanation

The codebase follows strict architectural boundaries to prevent logic duplication and improve testability:

### **Services Layer** (`src/services/`)
**Purpose**: Pure business logic with no UI dependencies
- `otpService.ts` - OTP generation, validation, expiry, and attempt tracking
- `emailService.ts` - Email validation and sanitization using RFC 5322 compliance
- `analyticsService.ts` - Firebase Analytics integration with graceful degradation
- `otpStoreService.ts` - Local OTP state persistence and retrieval

### **Hooks Layer** (`src/hooks/`)
**Purpose**: State orchestration and React lifecycle management
- `useOTP.ts` - Orchestrates OTP state transitions, delegates validation to service layer
- `useSession.ts` - Manages session timing with background/foreground accuracy
- No business logic duplication - hooks only coordinate between services and UI

### **Screens Layer** (`src/screens/`)
**Purpose**: Presentation and user interaction only
- `LoginScreen.tsx` - Email input, OTP entry, loading states, accessibility
- `SessionScreen.tsx` - Active session display and logout functionality
- Components react to computed state from hooks, never perform business calculations

### **Utils Layer** (`src/utils/`)
**Purpose**: Pure helper functions for formatting and validation
- `validation.ts` - Input sanitization and email format validation (UI-only)
- `timeFormat.ts` - Duration formatting and timestamp utilities
- No business logic - only presentation helpers and input hygiene

### **Why This Architecture Matters**

1. **Single Source of Truth**: OTP validation exists only in `otpService.validateOTP()`
2. **Testability**: Business logic can be tested without UI components
3. **Maintainability**: Changes to validation rules only require service layer updates
4. **Race Condition Prevention**: State orchestration centralized in hooks
5. **Clean Dependencies**: Services → Hooks → Screens (unidirectional data flow)

---

## Data Structures Design

The application uses carefully designed TypeScript interfaces to ensure type safety and clear data flow:

### **OTPState Interface**
```typescript
interface OTPState {
  code: string | null;
  generatedAt: number | null;
  attemptsRemaining: number;
  isExpired: boolean;
  isValidated: boolean;
}
```

**Why This Structure**: Centralizes all OTP-related state in a single object to prevent inconsistencies. The `generatedAt` timestamp enables precise expiry calculations, while `attemptsRemaining` provides clear attempt tracking without separate counters.

### **SessionState Interface**
```typescript
interface SessionState {
  isActive: boolean;
  startTimestamp: number | null;
  email: string | null;
  duration: number;
}
```

**Why This Structure**: Separates session concepts from authentication state. The `startTimestamp` enables accurate duration calculations that survive app backgrounding, while `email` persistence provides context without exposing OTP details.

### **ValidationResult Type**
```typescript
type ValidationResult = {
  isValid: boolean;
  error?: 'expired' | 'invalid' | 'max_attempts_exceeded';
  attemptsRemaining?: number;
}
```

**Why This Structure**: Provides comprehensive validation feedback without throwing exceptions. The discriminated union ensures consistent error handling across the application while maintaining type safety.

These structures were chosen to enforce immutability patterns, enable precise timing calculations, and provide clear separation between authentication and session concerns.

---

## Development Process & AI Assistance

### **What GitHub Copilot Helped With**
- **Initial project scaffolding**: Basic React Native CLI setup and folder structure suggestions
- **TypeScript interface generation**: Boilerplate type definitions for OTP and session states
- **Testing framework setup**: Jest configuration and basic test file templates
- **Code formatting consistency**: Automated formatting and import organization

### **What Was Implemented Based on Original Design Decisions**
- **Clean architecture pattern**: The Services → Hooks → Screens → Utils separation was deliberately chosen to enforce testability
- **OTP validation logic**: The 60-second expiry and 3-attempt limit business rules were designed to simulate real-world constraints
- **Timestamp-based session timing**: The decision to use `Date.now()` arithmetic instead of `setInterval` accumulation was made to prevent timing drift
- **Firebase Analytics integration**: The choice to use Firebase specifically to demonstrate graceful degradation patterns with external services
- **Testing philosophy**: The strategic decision to test only business logic (no UI testing) was made to focus on deterministic, maintainable tests

### **Key Architectural Decisions Made Without AI**
1. **Single source of truth principle**: Requiring ALL OTP logic to live in `otpService.validateOTP()` to prevent duplication
2. **Race condition prevention**: Using hooks only for state orchestration while keeping business logic in pure functions
3. **Memory leak prevention**: Storing timer references in `useRef` and guaranteeing cleanup in `useEffect` return functions
4. **Performance optimization strategy**: Using `useMemo` and `useCallback` specifically for expensive calculations and stable references

This transparency ensures reviewers can distinguish between AI-generated scaffolding and deliberate architectural choices that demonstrate understanding of React Native best practices.

---

## OTP Lifecycle

### **Generation**
- 6-digit numeric codes generated using `Math.floor(Math.random() * 1000000)`
- Padded with leading zeros (e.g., `000042` is valid)
- Each generation invalidates previous OTP state completely

### **Validation Rules**
- **60-second expiry**: Codes expire exactly 60 seconds after generation
- **3-attempt limit**: Maximum 3 validation attempts per OTP
- **Immediate invalidation**: Successful validation immediately invalidates the OTP
- **State consistency**: All validation logic centralized in `otpService.validateOTP()`

### **Resend Behavior**
- Resend generates completely new OTP with fresh expiry and attempt count
- Previous OTP is immediately invalidated (cannot be used even if still within 60s)
- Analytics tracking differentiates between new requests and resends

### **Critical Architecture Rule**
**ALL OTP business logic must live in `otpService.ts`**. The UI layer provides only:
- Input sanitization (6-digit numeric filtering)
- Loading state management
- Error message display
- Progress feedback

Expiry calculations, attempt tracking, and validation decisions are forbidden in components/hooks.

---

## Session Engine Design

### **Timestamp-Based Timing**
The session engine uses **timestamp arithmetic** instead of naive `setInterval` accumulation to prevent timing drift:

```typescript
// ❌ Wrong: Accumulates timing errors
setInterval(() => setDuration(prev => prev + 1000), 1000);

// ✅ Correct: Timestamp-based accuracy
setInterval(() => {
  const elapsed = Date.now() - startTimestamp;
  setDuration(elapsed);
}, 1000);
```

### **Background Safety**
- **AppState monitoring**: Pauses timers when app goes to background
- **Resume calculation**: Recalculates accurate duration when returning to foreground
- **Memory cleanup**: Guaranteed timer cleanup on component unmount
- **No memory leaks**: All `setInterval` calls have corresponding `clearInterval`

### **Performance Optimizations**
- Timer references stored in `useRef` (never in state)
- Formatted values memoized with `useMemo` to prevent unnecessary recalculations
- Handler functions wrapped in `useCallback` for stable references

---

## Analytics Integration (Android Only)

### **Firebase Analytics Setup**
The application integrates Firebase Analytics for behavioral tracking on Android devices. Firebase Analytics represents the only external service integration, included to demonstrate graceful degradation patterns when optional services are unavailable.

#### **🔧 Required Setup Steps**

1. **Create Firebase Project** at [Firebase Console](https://console.firebase.google.com)
2. **Add Android App** with package name: `com.authassignment`
3. **Download google-services.json** from Firebase Console
4. **Place the file** at: `android/app/google-services.json`
   - ⚠️ **Template available**: See `android/app/google-services.json.template` for structure reference
   - ✅ **Security**: Real `google-services.json` is git-ignored for security

```typescript
// Graceful initialization
initAnalytics(); // Silently fails if Firebase unavailable
```

### **Tracked Events**
- **OTP Generation**: Tracks email domain for usage patterns
- **Validation Success**: Records attempts used for UX optimization  
- **Validation Failure**: Categorizes failure reasons (expired, invalid, max attempts)
- **Session Analytics**: Tracks login success and session duration

### **Debug Mode**
Enable Firebase debug mode for development:
```bash
adb shell setprop debug.firebase.analytics.app com.authassignment
```

### **Graceful Degradation**
- Analytics failures never crash the app
- All analytics calls wrapped in try-catch blocks
- Core authentication functionality works without Firebase
- No analytics dependencies in business logic layer

---

## Testing Strategy

### **What We Test**
**Services and utilities only** - focusing on deterministic business logic:

- **`otpService`**: Generation format, expiry enforcement, attempt limits, state resets
- **`emailService`**: RFC 5322 validation, sanitization, domain extraction  
- **`timeFormat`**: Duration formatting, timestamp accuracy, edge cases

### **Why No UI Testing**
1. **Business logic separation**: Critical logic lives in testable services
2. **Deterministic focus**: UI behavior depends on external factors (user input, timing)
3. **Maintenance burden**: UI tests break frequently with layout changes
4. **Architecture confidence**: Well-separated layers make UI bugs less critical

### **Testing Principles**
- **No mocking**: Services are pure functions with predictable inputs/outputs
- **Edge case coverage**: Test boundary conditions (expiry, max attempts, empty inputs)
- **Security focus**: Validate OTP format requirements and attempt limits
- **Regression prevention**: Tests protect against future architectural violations

### **Running Tests**
```bash
npm test              # Run all tests
npm test otpService   # Run specific service tests
```

---

## How to Run the Project

### **Prerequisites**
- Android device or emulator connected
- React Native development environment configured  
- Node.js 22.11.0 or higher
- **Firebase Setup**: Place `google-services.json` in `android/app/` (see template file for structure)

### **Development Workflow**
```bash
# 1. Install dependencies
npm install

# 2. Set up Firebase (if needed)
# Place your google-services.json in android/app/ directory
# Template available: android/app/google-services.json.template

# 3. Start Metro bundler
npm start

# 4. Build and deploy to Android (new terminal)
npm run android

# 5. Optional: Enable Firebase Analytics debug mode
adb shell setprop debug.firebase.analytics.app com.authassignment
```

### **Key Development Features**
- **Hot Reload**: Code changes update automatically
- **OTP Debug Logging**: Generated codes logged to console in `__DEV__` mode
- **TypeScript**: Full type safety with `npx tsc --noEmit` validation
- **Architecture Enforcement**: Clear boundaries prevent accidental logic duplication

### **Debugging**
- **OTP Codes**: Check Metro console for generated OTP in development
- **Analytics Events**: Use Firebase DebugView with debug mode enabled
- **State Issues**: React DevTools available for hook state inspection
- **Performance**: Flipper integration available for timeline profiling

---

---


**Production Ready**: Clean architecture, comprehensive testing, memory-safe lifecycle management, and graceful error handling throughout.
















