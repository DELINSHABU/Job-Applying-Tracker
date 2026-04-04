import { useState, useEffect, useCallback, useMemo } from 'react';
import { suggestedJobsService } from '../services/firebase';
import { refreshSuggestedJobs } from '../services/scraping';
import { getMissionState } from '../services/scrapingProgress';
import type { SuggestedJob, ScrapingSettings } from '../types';

interface SuggestedJobsState {
  suggestedJobs: SuggestedJob[];
  activeJobs: SuggestedJob[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  dismissCount: number;
  appliedCount: number;
  totalCount: number;
  lastRefreshTime: string | null;
}

interface SuggestedJobsActions {
  loadSuggestedJobs: () => Promise<void>;
  refreshJobs: (settings: ScrapingSettings) => Promise<void>;
  dismissJob: (jobId: string) => Promise<void>;
  removeJob: (jobId: string) => Promise<void>;
  convertToApplied: (jobId: string, appliedJobId: string) => Promise<void>;
  clearError: () => void;
}

export function useSuggestedJobs(userId: string | null): SuggestedJobsState & SuggestedJobsActions {
  const [suggestedJobs, setSuggestedJobs] = useState<SuggestedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestedJobs = useCallback(async () => {
    if (!userId) {
      setSuggestedJobs([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const jobs = await suggestedJobsService.getSuggestedJobs(userId);
      setSuggestedJobs(jobs);
    } catch (err) {
      console.error('Error loading suggested jobs:', err);
      setError('Failed to load suggested jobs.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSuggestedJobs();
  }, [loadSuggestedJobs]);

  const refreshJobs = useCallback(async (settings: ScrapingSettings) => {
    if (!userId) {
      setError('Please sign in to refresh jobs.');
      return;
    }

    try {
      setRefreshing(true);
      setError(null);
      
      const newJobs = await refreshSuggestedJobs(userId, settings, suggestedJobs);
      
      const jobsWithIds = newJobs.map(job => ({
        ...job,
        id: `suggested_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }));
      
      await suggestedJobsService.saveSuggestedJobs(userId, jobsWithIds);
      
      setSuggestedJobs(prev => [...jobsWithIds, ...prev]);
    } catch (err) {
      console.error('Error refreshing jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh jobs.');
      throw err;
    } finally {
      setRefreshing(false);
    }
  }, [userId, suggestedJobs]);

  const dismissJob = useCallback(async (jobId: string) => {
    if (!userId) return;

    try {
      await suggestedJobsService.dismissSuggestedJob(userId, jobId);
      setSuggestedJobs(prev => 
        prev.map(job => 
          job.id === jobId ? { ...job, dismissed: true } : job
        )
      );
    } catch (err) {
      console.error('Error dismissing job:', err);
      setError('Failed to dismiss job.');
      throw err;
    }
  }, [userId]);

  const removeJob = useCallback(async (jobId: string) => {
    if (!userId) return;

    try {
      await suggestedJobsService.deleteSuggestedJob(userId, jobId);
      setSuggestedJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Error removing job:', err);
      setError('Failed to remove job.');
      throw err;
    }
  }, [userId]);

  const convertToApplied = useCallback(async (jobId: string, appliedJobId: string) => {
    if (!userId) return;

    try {
      await suggestedJobsService.markAsApplied(userId, jobId, appliedJobId);
      setSuggestedJobs(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, applied: true, appliedJobId, dismissed: true } 
            : job
        )
      );
    } catch (err) {
      console.error('Error converting job to applied:', err);
      setError('Failed to mark job as applied.');
      throw err;
    }
  }, [userId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const activeJobs = useMemo(() => 
    suggestedJobs.filter(job => !job.dismissed && !job.applied),
    [suggestedJobs]
  );

  const dismissedCount = useMemo(() =>
    suggestedJobs.filter(job => job.dismissed).length,
    [suggestedJobs]
  );

  const appliedCount = useMemo(() =>
    suggestedJobs.filter(job => job.applied).length,
    [suggestedJobs]
  );

  const totalCount = useMemo(() => suggestedJobs.length, [suggestedJobs]);

  const lastRefreshTime = useMemo(() => {
    const mission = getMissionState();
    if (mission.finishedAt) return mission.finishedAt;
    if (suggestedJobs.length === 0) return null;
    const sorted = [...suggestedJobs].sort((a, b) => 
      new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime()
    );
    return sorted[0]?.fetchedAt || null;
  }, [suggestedJobs]);

  return {
    suggestedJobs,
    activeJobs,
    loading,
    refreshing,
    error,
    dismissCount: dismissedCount,
    appliedCount,
    totalCount,
    lastRefreshTime,
    loadSuggestedJobs,
    refreshJobs,
    dismissJob,
    removeJob,
    convertToApplied,
    clearError,
  };
}
