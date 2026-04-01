import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/firebase';
import { saveApiKey, getApiKey, removeApiKey } from '../lib/apiKeyStorage';
import type { UserProfile, AIProvider } from '../types';

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface ProfileActions {
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setAIProvider: (provider: AIProvider) => Promise<void>;
  saveAIApiKey: (provider: AIProvider, apiKey: string) => Promise<void>;
  getAIApiKey: (provider: AIProvider) => Promise<string | null>;
  removeAIApiKey: (provider: AIProvider) => void;
  clearError: () => void;
}

export function useProfile(userId: string | null, userEmail: string | null, displayName: string | null): ProfileState & ProfileActions {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load profile when userId changes
  const loadProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let loadedProfile = await profileService.getProfile(userId);
      
      // If no profile exists, create one
      if (!loadedProfile && userEmail) {
        loadedProfile = await profileService.createInitialProfile(userId, userEmail, displayName);
      }
      
      setProfile(loadedProfile);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId, userEmail, displayName]);

  // Load profile on mount and when userId changes
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userId || !profile) {
      setError('Please sign in to update profile.');
      return;
    }

    try {
      setError(null);
      const updatedProfile: UserProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      await profileService.saveProfile(userId, updatedProfile);
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      throw err;
    }
  }, [userId, profile]);

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    if (!userId) {
      setError('Please sign in first.');
      return;
    }

    try {
      setError(null);
      await profileService.completeOnboarding(userId);
      setProfile(prev => prev ? { ...prev, onboardingComplete: true } : null);
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError('Failed to complete onboarding. Please try again.');
      throw err;
    }
  }, [userId]);

  // Set AI provider
  const setAIProvider = useCallback(async (provider: AIProvider) => {
    await updateProfile({ aiProvider: provider });
  }, [updateProfile]);

  // Save API key (encrypted in localStorage)
  const saveAIApiKey = useCallback(async (provider: AIProvider, apiKey: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    await saveApiKey(provider, apiKey, userId);
  }, [userId]);

  // Get API key
  const getAIApiKey = useCallback(async (provider: AIProvider): Promise<string | null> => {
    if (!userId) return null;
    return getApiKey(provider, userId);
  }, [userId]);

  // Remove API key
  const removeAIApiKey = useCallback((provider: AIProvider) => {
    removeApiKey(provider);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    profile,
    loading,
    error,
    loadProfile,
    updateProfile,
    completeOnboarding,
    setAIProvider,
    saveAIApiKey,
    getAIApiKey,
    removeAIApiKey,
    clearError,
  };
}
