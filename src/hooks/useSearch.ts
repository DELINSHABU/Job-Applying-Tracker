import { useState, useMemo, useCallback } from 'react';
import type { Job, FilterOptions, JobStatus, Platform } from '../types';

export function useSearch(jobs: Job[]) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    platform: 'all',
  });

  // Filter jobs based on current filters
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(job =>
        job.companyName.toLowerCase().includes(searchLower) ||
        job.position.toLowerCase().includes(searchLower) ||
        job.platform.toLowerCase().includes(searchLower) ||
        (job.location?.toLowerCase().includes(searchLower) ?? false) ||
        (job.notes?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(job => job.status === filters.status);
    }

    // Platform filter
    if (filters.platform !== 'all') {
      result = result.filter(job => job.platform === filters.platform);
    }

    return result;
  }, [jobs, filters]);

  // Get unique platforms from jobs
  const platforms = useMemo(() => {
    const platformSet = new Set<Platform>();
    jobs.forEach(job => platformSet.add(job.platform));
    return Array.from(platformSet).sort();
  }, [jobs]);

  // Update search query
  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  // Update status filter
  const setStatusFilter = useCallback((status: JobStatus | 'all') => {
    setFilters(prev => ({ ...prev, status }));
  }, []);

  // Update platform filter
  const setPlatformFilter = useCallback((platform: Platform | 'all') => {
    setFilters(prev => ({ ...prev, platform }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      platform: 'all',
    });
  }, []);

  return {
    filters,
    filteredJobs,
    platforms,
    setSearch,
    setStatusFilter,
    setPlatformFilter,
    resetFilters,
  };
}
