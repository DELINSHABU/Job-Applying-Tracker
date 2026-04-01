import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'job_tracker_custom_platforms';

export function useCustomPlatforms() {
  const [customPlatforms, setCustomPlatforms] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCustomPlatforms(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse custom platforms', e);
      }
    }
  }, []);

  // Save to localStorage whenever customPlatforms changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customPlatforms));
  }, [customPlatforms]);

  const addCustomPlatform = useCallback((platform: string) => {
    const normalized = platform.trim().toLowerCase();
    if (!normalized) return;
    
    setCustomPlatforms(prev => {
      if (prev.includes(normalized)) return prev;
      return [...prev, normalized];
    });
  }, []);

  const removeCustomPlatform = useCallback((platform: string) => {
    setCustomPlatforms(prev => prev.filter(p => p !== platform));
  }, []);

  return {
    customPlatforms,
    addCustomPlatform,
    removeCustomPlatform
  };
}
