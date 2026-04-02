import { useState, useEffect, useCallback } from 'react';
import { authService, getAuthErrorMessage } from '../services/firebase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to auth state changes and handle redirect results
  useEffect(() => {
    // Check for redirect results first
    authService.handleRedirectResult().catch((err) => {
      const errorCode = (err as { code?: string }).code || '';
      if (errorCode && errorCode !== 'auth/popup-closed-by-user') {
        setError(getAuthErrorMessage(errorCode));
      }
    });

    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await authService.signIn(email, password);
    } catch (err) {
      const errorCode = (err as { code?: string }).code || '';
      setError(getAuthErrorMessage(errorCode));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await authService.signUp(email, password);
    } catch (err) {
      const errorCode = (err as { code?: string }).code || '';
      setError(getAuthErrorMessage(errorCode));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await authService.signInWithGoogle();
    } catch (err) {
      const errorCode = (err as { code?: string }).code || '';
      // Don't show error for user-cancelled popups
      if (errorCode !== 'auth/popup-closed-by-user' && errorCode !== 'auth/cancelled-popup-request') {
        setError(getAuthErrorMessage(errorCode));
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      await authService.signOut();
    } catch (err) {
      setError('Failed to sign out. Please try again.');
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    clearError,
  };
}
