# Contributing to React Native Passwordless Authentication

Thank you for your interest in contributing to this educational project! This repository demonstrates clean architecture patterns in React Native.

## 🎯 Project Purpose

This is an **educational demonstration** of:
- Offline passwordless authentication patterns
- Clean React Native architecture (Services → Hooks → Screens → Utils)
- TypeScript best practices
- Comprehensive testing strategies
- Firebase Analytics integration patterns

## 🏗️ Development Setup

### Prerequisites
- Node.js 22.11.0 or higher
- React Native development environment  
- Android device/emulator for testing
- Firebase project (for analytics features)

### Getting Started
```bash
# 1. Clone and install
git clone https://github.com/karthiksuresh007/react-native-passwordless-auth.git
cd react-native-passwordless-auth  
npm install

# 2. Set up Firebase (optional)
# 1. Copy android/app/google-services.json.template to google-services.json
# 2. Replace with your Firebase project configuration

# 3. Run the app
npm start          # Start Metro bundler
npm run android    # Deploy to Android device/emulator
```

## 📐 Architecture Guidelines

### Code Organization
- **Services** (`src/services/`): Pure business logic, no UI dependencies
- **Hooks** (`src/hooks/`): State orchestration, React lifecycle management  
- **Screens** (`src/screens/`): UI components only, no business logic
- **Utils** (`src/utils/`): Helper functions for formatting/validation

### Key Principles
1. **Single Source of Truth**: Business logic lives only in services
2. **Testability**: Services are pure functions with predictable I/O
3. **Clean Dependencies**: Unidirectional data flow (Services → Hooks → Screens)
4. **No Logic Duplication**: Each concern has exactly one implementation

## 🧪 Testing Strategy

We focus on **deterministic business logic testing**:

```bash
npm test                    # Run all tests
npm test otpService        # Test specific service
npm run test:watch         # Watch mode for development
```

**What We Test:**
- ✅ Services: OTP generation, validation, expiry logic
- ✅ Utils: Email validation, time formatting, edge cases  
- ❌ UI Components: Too dependent on external factors

## 🔧 Code Quality Standards

### TypeScript
- Strict type checking enabled
- All interfaces explicitly defined
- No `any` types allowed

### Formatting  
```bash
npx tsc --noEmit          # Type checking
npm run lint              # ESLint (if configured)
```

### Architecture Enforcement
- Business logic must live in `src/services/`
- UI components cannot contain validation logic
- Hooks only orchestrate, never implement business rules

## 🐛 Issue Reporting

When reporting issues:
1. **Architecture Questions**: Focus on clean architecture patterns
2. **OTP Logic Issues**: Check `src/services/otpService.ts` first
3. **Firebase Setup**: Verify `google-services.json` configuration
4. **Testing Questions**: Reference existing test cases in `__tests__/`

## 📝 Pull Request Guidelines

For educational contributions:
1. **Follow Architecture**: Maintain Services → Hooks → Screens separation
2. **Add Tests**: Cover business logic changes with deterministic tests
3. **Document Decisions**: Explain architectural choices in commit messages
4. **Performance**: Use `useMemo`/`useCallback` for expensive operations

## 📚 Learning Resources

- **Clean Architecture**: Services contain all business rules
- **React Native Patterns**: Hooks for state, components for presentation
- **TypeScript Best Practices**: Interface-driven development
- **Testing Philosophy**: Test business logic, not UI interactions

---

**Educational Note**: This project prioritizes architectural clarity and educational value over feature completeness. Contributions should maintain the clean separation of concerns and comprehensive documentation standards.