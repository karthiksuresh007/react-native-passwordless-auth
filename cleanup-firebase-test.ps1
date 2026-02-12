# Firebase Test Cleanup Script (PowerShell)
# Run this after confirming analytics work in Firebase Console

Write-Host "🧹 Cleaning up Firebase test code..." -ForegroundColor Green

# Remove test import and test event from App.tsx
Write-Host "Removing test analytics import from App.tsx..."

# Create cleaned App.tsx content
$cleanedAppTsx = @'
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
'@

# Write cleaned content to App.tsx
$cleanedAppTsx | Out-File -FilePath "App.tsx" -Encoding UTF8

Write-Host "✅ Cleaned up test code from App.tsx" -ForegroundColor Green
Write-Host "🔍 Verify TypeScript still compiles..." -ForegroundColor Yellow

# Check TypeScript compilation
$tscResult = npx tsc --noEmit 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript compilation successful" -ForegroundColor Green
    Write-Host "🚀 Ready for Phase 7 - Edge Cases & Validation" -ForegroundColor Cyan
} else {
    Write-Host "❌ TypeScript compilation failed - check for issues" -ForegroundColor Red
    Write-Host $tscResult
}