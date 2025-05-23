
import { useState, useEffect, useCallback } from 'react';

export interface SessionTimeoutHook {
  isSessionExpired: boolean;
  resetSession: () => void;
  extendSession: () => void;
}

const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const WARNING_DURATION = 2 * 60 * 1000; // 2 minutes warning before timeout

export const useSessionTimeout = (): SessionTimeoutHook => {
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Reset session and activity tracking
  const resetSession = useCallback(() => {
    setIsSessionExpired(false);
    setLastActivity(Date.now());
  }, []);

  // Extend session by updating last activity
  const extendSession = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      if (!isSessionExpired) {
        setLastActivity(Date.now());
      }
    };

    // Events to track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [isSessionExpired]);

  // Check for session timeout
  useEffect(() => {
    const checkTimeout = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity >= TIMEOUT_DURATION && !isSessionExpired) {
        setIsSessionExpired(true);
      }
    };

    const interval = setInterval(checkTimeout, 1000); // Check every second

    return () => clearInterval(interval);
  }, [lastActivity, isSessionExpired]);

  return {
    isSessionExpired,
    resetSession,
    extendSession
  };
};
