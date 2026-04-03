import { useState, useEffect, useCallback, useMemo } from 'react';
import { jobsService } from '../services/firebase';
import { detectDuplicate } from '../services/duplicateDetection';
import type { Job, JobFormData, JobStats, DuplicateResult } from '../types';

interface JobsState {
  jobs: Job[];
  loading: boolean;
  initialized: boolean;
  error: string | null;
  stats: JobStats;
}

interface JobsActions {
  loadJobs: () => Promise<void>;
  addJob: (data: JobFormData, skipDuplicateCheck?: boolean) => Promise<DuplicateResult | null>;
  updateJob: (id: string, data: JobFormData) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  checkDuplicate: (data: Partial<JobFormData>) => DuplicateResult;
  clearError: () => void;
}

export function useJobs(userId: string | null): JobsState & JobsActions {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate stats - single pass with useMemo for O(n) performance
  const stats: JobStats = useMemo(() => {
    const counts = {
      total: jobs.length,
      pending: 0,
      callback: 0,
      interviewing: 0,
      rejected: 0,
      offer: 0,
    };
    for (const job of jobs) {
      if (job.status === 'pending') counts.pending++;
      else if (job.status === 'callback') counts.callback++;
      else if (job.status === 'interviewing') counts.interviewing++;
      else if (job.status === 'rejected') counts.rejected++;
      else if (job.status === 'offer') counts.offer++;
    }
    return counts;
  }, [jobs]);

  // Load jobs when userId changes
  const loadJobs = useCallback(async () => {
    if (!userId) {
      setJobs([]);
      setInitialized(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const loadedJobs = await jobsService.getJobs(userId);
      setJobs(loadedJobs);
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [userId]);

  // Load jobs on mount and when userId changes
  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Check for duplicate
  const checkDuplicate = useCallback((data: Partial<JobFormData>): DuplicateResult => {
    return detectDuplicate(data as Partial<Job>, jobs);
  }, [jobs]);

  // Add a new job
  const addJob = useCallback(async (data: JobFormData, skipDuplicateCheck = false): Promise<DuplicateResult | null> => {
    if (!userId) {
      setError('Please sign in to add jobs.');
      return null;
    }

    // Check for duplicates first (skip if adding anyway)
    if (!skipDuplicateCheck) {
      const duplicate = checkDuplicate(data);
      if (duplicate.isDuplicate) {
        return duplicate;
      }
    }

    const now = new Date().toISOString();
    const newJob: Job = {
      ...data,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };

    try {
      setError(null);
      await jobsService.saveJob(userId, newJob);
      setJobs(prev => [newJob, ...prev]);
      return null;
    } catch (err) {
      console.error('Error adding job:', err);
      setError('Failed to add job. Please try again.');
      throw err;
    }
  }, [userId, checkDuplicate]);

  // Update an existing job
  const updateJob = useCallback(async (id: string, data: JobFormData) => {
    if (!userId) {
      setError('Please sign in to update jobs.');
      return;
    }

    const existingJob = jobs.find(j => j.id === id);
    if (!existingJob) {
      setError('Job not found.');
      return;
    }

    const updatedJob: Job = {
      ...existingJob,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    try {
      setError(null);
      await jobsService.saveJob(userId, updatedJob);
      setJobs(prev => prev.map(j => j.id === id ? updatedJob : j));
    } catch (err) {
      console.error('Error updating job:', err);
      setError('Failed to update job. Please try again.');
      throw err;
    }
  }, [userId, jobs]);

  // Delete a job
  const deleteJob = useCallback(async (id: string) => {
    if (!userId) {
      setError('Please sign in to delete jobs.');
      return;
    }

    try {
      setError(null);
      await jobsService.deleteJob(userId, id);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete job. Please try again.');
      throw err;
    }
  }, [userId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    jobs,
    loading,
    initialized,
    error,
    stats,
    loadJobs,
    addJob,
    updateJob,
    deleteJob,
    checkDuplicate,
    clearError,
  };
}
