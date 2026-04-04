import { useState, useEffect, useCallback } from 'react';
import { db, scrapingSettingsService } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { 
  saveApifyToken, 
  getApifyToken, 
  removeApifyToken,
  saveLoginSession,
  getLoginSession,
  removeLoginSession,
} from '../services/scraping';
import type { ScrapingSettings } from '../types';

interface ScrapingSettingsState {
  settings: ScrapingSettings | null;
  loading: boolean;
  error: string | null;
}

interface ScrapingSettingsActions {
  updateSettings: (updates: Partial<ScrapingSettings>) => Promise<void>;
  saveApifyToken: (token: string) => Promise<void>;
  getApifyToken: () => Promise<string | null>;
  removeApifyToken: () => Promise<void>;
  saveLoginSession: (platform: string, sessionData: string) => Promise<void>;
  getLoginSession: (platform: string) => Promise<string | null>;
  removeLoginSession: (platform: string) => Promise<void>;
  clearError: () => void;
}

function getScrapingSettingsErrorMessage(err: unknown, fallback: string): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code?: unknown }).code)
      : '';

  if (code === 'permission-denied') {
    return 'Firestore rules are blocking scraping settings. Deploy the updated Firestore rules and reload the app.';
  }

  return fallback;
}

export function useScrapingSettings(userId: string | null): ScrapingSettingsState & ScrapingSettingsActions {
  const [settings, setSettings] = useState<ScrapingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const settingsRef = doc(db, 'users', userId, 'scrapingSettings', 'config');

    const unsubscribe = onSnapshot(settingsRef, async (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as ScrapingSettings);
        setLoading(false);
      } else {
        // Create default settings if they don't exist
        try {
          const defaults = await scrapingSettingsService.createDefaultSettings(userId);
          setSettings(defaults);
        } catch (err) {
          console.error('Error creating default settings:', err);
          setError(getScrapingSettingsErrorMessage(err, 'Failed to initialize settings.'));
        } finally {
          setLoading(false);
        }
      }
    }, (err) => {
      console.error('Error listening to scraping settings:', err);
      setError(getScrapingSettingsErrorMessage(err, 'Failed to load settings.'));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const updateSettings = useCallback(async (updates: Partial<ScrapingSettings>) => {
    if (!userId) {
      const message = 'Please sign in to update settings.';
      setError(message);
      throw new Error(message);
    }

    try {
      setError(null);
      // Merge current settings with updates so we always save a complete document
      const merged: ScrapingSettings = {
        id: 'default',
        userId,
        platforms: [],
        keywords: [],
        techKeywords: [],
        locations: [],
        experienceLevels: [],
        jobTypes: [],
        workArrangements: [],
        postedWithin: 'any',
        remoteOnly: false,
        autoRefresh: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(settings || {}),
        ...updates,
      };
      await scrapingSettingsService.saveScrapingSettings(userId, merged);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(getScrapingSettingsErrorMessage(err, 'Failed to update settings. Please try again.'));
      throw err;
    }
  }, [userId, settings]);

  const saveApifyTokenAction = useCallback(async (token: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    await saveApifyToken(userId, token);
  }, [userId]);

  const getApifyTokenAction = useCallback(async (): Promise<string | null> => {
    if (!userId) return null;
    return getApifyToken(userId);
  }, [userId]);

  const removeApifyTokenAction = useCallback(async () => {
    if (!userId) return;
    await removeApifyToken(userId);
  }, [userId]);

  const saveLoginSessionAction = useCallback(async (platform: string, sessionData: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    await saveLoginSession(userId, platform, sessionData);
  }, [userId]);

  const getLoginSessionAction = useCallback(async (platform: string): Promise<string | null> => {
    if (!userId) return null;
    return getLoginSession(userId, platform);
  }, [userId]);

  const removeLoginSessionAction = useCallback(async (platform: string) => {
    if (!userId) return;
    await removeLoginSession(userId, platform);
  }, [userId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    saveApifyToken: saveApifyTokenAction,
    getApifyToken: getApifyTokenAction,
    removeApifyToken: removeApifyTokenAction,
    saveLoginSession: saveLoginSessionAction,
    getLoginSession: getLoginSessionAction,
    removeLoginSession: removeLoginSessionAction,
    clearError,
  };
}
