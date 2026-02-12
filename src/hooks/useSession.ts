import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import type { SessionState } from '../types';
import { formatDurationMmSs, formatTime, getCurrentTimestamp } from '../utils';
import { logLogout } from '../services';

export interface UseSessionReturn {
  sessionState: SessionState;
  startSession: (email: string) => void;
  stopSession: () => void;
  formattedStartTime: string;
  formattedDuration: string;
}

/**
 * Custom hook for session management with accurate timing
 * Handles background/foreground transitions and cleanup
 */
export function useSession(): UseSessionReturn {
  // Session state
  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: false,
    startTime: null,
    duration: 0,
    email: '',
  });

  // Timer management refs
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const backgroundTimeRef = useRef<number | null>(null);

  // Start session
  const startSession = useCallback((email: string) => {
    const startTime = getCurrentTimestamp();
    
    setSessionState({
      isActive: true,
      startTime,
      duration: 0,
      email,
    });

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start timer to update duration every second
    timerRef.current = setInterval(() => {
      setSessionState(prevState => {
        if (!prevState.isActive || !prevState.startTime) {
          return prevState;
        }
        
        const currentTime = getCurrentTimestamp();
        const newDuration = currentTime - prevState.startTime;
        
        return {
          ...prevState,
          duration: newDuration,
        };
      });
    }, 1000);
  }, []);

  // Stop session
  const stopSession = useCallback(() => {
    // Log analytics event before clearing state
    if (sessionState.isActive) {
      logLogout({
        session_duration: sessionState.duration,
      });
    }
    
    // Clear timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reset state
    setSessionState({
      isActive: false,
      startTime: null,
      duration: 0,
      email: '',
    });

    // Clear background time tracking
    backgroundTimeRef.current = null;
  }, [sessionState.isActive, sessionState.duration]);

  // Handle app state changes for background/foreground accuracy
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const currentAppState = appStateRef.current;
      
      if (sessionState.isActive && sessionState.startTime) {
        // App going to background
        if (currentAppState.match(/active|foreground/) && nextAppState === 'background') {
          backgroundTimeRef.current = getCurrentTimestamp();
          
          // Pause the interval timer when app goes to background
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
        
        // App coming back to foreground
        if (currentAppState === 'background' && nextAppState === 'active') {
          const currentTime = getCurrentTimestamp();
          const backgroundTime = backgroundTimeRef.current;
          
          // Update duration based on actual elapsed time
          setSessionState(prevState => {
            if (!prevState.isActive || !prevState.startTime) {
              return prevState;
            }
            
            const actualDuration = currentTime - prevState.startTime;
            return {
              ...prevState,
              duration: actualDuration,
            };
          });
          
          // Restart the timer
          if (!timerRef.current) {
            timerRef.current = setInterval(() => {
              setSessionState(prevState => {
                if (!prevState.isActive || !prevState.startTime) {
                  return prevState;
                }
                
                const currentTime = getCurrentTimestamp();
                const newDuration = currentTime - prevState.startTime;
                
                return {
                  ...prevState,
                  duration: newDuration,
                };
              });
            }, 1000);
          }
          
          backgroundTimeRef.current = null;
        }
      }
      
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [sessionState.isActive, sessionState.startTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Memoized formatted values to prevent unnecessary recomputation
  const formattedStartTime = useMemo(() => 
    sessionState.startTime ? formatTime(sessionState.startTime) : '',
    [sessionState.startTime]
  );
  const formattedDuration = useMemo(() =>
    formatDurationMmSs(sessionState.duration),
    [sessionState.duration]
  );

  return {
    sessionState,
    startSession,
    stopSession,
    formattedStartTime,
    formattedDuration,
  };
}
