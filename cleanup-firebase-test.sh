#!/bin/bash
# Firebase Test Cleanup Script
# Run this after confirming analytics work in Firebase Console

echo "🧹 Cleaning up Firebase test code..."

# Remove test import and test event from App.tsx
echo "Removing test analytics import from App.tsx..."

# Create a temporary file with the cleaned App.tsx
cat > temp_app.tsx << 'EOF'
import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, useColorScheme } from 'react-native';
import { LoginScreen, SessionScreen } from './src/screens';
import { useSession } from './src/hooks';
import { initAnalytics } from './src/services';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  
  // Navigation state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  
  // Session management
  const { sessionState, startSession, stopSession, formattedStartTime, formattedDuration } = useSession();
  
  // Initialize analytics on app launch
  useEffect(() => {
    initAnalytics();
  }, []);
  
  // Handle successful login
  const handleLoginSuccess = useCallback((email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    startSession(email);
  }, [startSession]);
  
  // Handle logout
  const handleLogout = useCallback(() => {
    stopSession();
    setIsAuthenticated(false);
    setUserEmail('');
  }, [stopSession]);
  
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {isAuthenticated ? (
        <SessionScreen 
          email={userEmail}
          startTime={formattedStartTime}
          duration={formattedDuration}
          onLogout={handleLogout}
        />
      ) : (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
    </SafeAreaProvider>
  );
}

export default App;
EOF

# Replace App.tsx with cleaned version
mv temp_app.tsx App.tsx

echo "✅ Cleaned up test code from App.tsx"
echo "🔍 Verify TypeScript still compiles..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
    echo "🚀 Ready for Phase 7 - Edge Cases & Validation"
else 
    echo "❌ TypeScript compilation failed - check for issues"
fi