import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { suggestedJobsService } from '../services/firebase';
import {
  getMissionState,
  updateMissionProgress,
  updateStepStatus,
  completeMission,
  stopMission,
} from '../services/scrapingProgress';
import {
  buildActorInput,
  startApifyRun,
  getApifyRunStatus,
  fetchApifyRunResults,
  processMissionResults,
  stopApifyRun,
} from '../services/scraping';
import type { ScrapingSettings, SuggestedJob } from '../types';

export function useScrapingPoller(userId: string | null) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userIdRef = useRef(userId);
  const [isStopping, setIsStopping] = useState(false);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const clearPoller = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopScraping = useCallback(async () => {
    const uid = userIdRef.current;
    const mission = getMissionState();
    if (mission.status !== 'running') return;

    try {
      setIsStopping(true);
      clearPoller();
      
      const runIds = mission.runIds;
      if (runIds.length > 0 && uid) {
        await Promise.all(runIds.map(id => stopApifyRun(uid, id).catch(() => false)));
      }
      
      stopMission();
      toast.info('Scraping stopped by user');
    } catch (err) {
      console.error('Failed to stop scraping:', err);
      toast.error('Failed to stop all scraper runs');
    } finally {
      setIsStopping(false);
    }
  }, [clearPoller]);

  const startPolling = useCallback(() => {
    clearPoller();
    intervalRef.current = setInterval(() => pollMission(userIdRef.current), 5000);
    pollMission(userIdRef.current);
  }, [clearPoller]);

  useEffect(() => {
    return clearPoller;
  }, [clearPoller]);

  return { startPolling, clearPoller, stopScraping, isStopping };
}

async function pollMission(userId: string | null) {
  if (!userId) return;

  const mission = getMissionState();
  if (mission.status !== 'running') return;

  const runIds = mission.runIds;
  if (runIds.length === 0) return;

  let allCompleted = true;
  let totalNewJobs = 0;
  let existingJobs: SuggestedJob[] = [];

  try {
    existingJobs = await suggestedJobsService.getSuggestedJobs(userId);
  } catch {
    existingJobs = [];
  }

  for (let i = 0; i < runIds.length; i++) {
    const runId = runIds[i];
    if (!runId) continue;
    const step = mission.steps[i];
    if (!step || step.status === 'completed' || step.status === 'failed') continue;

    try {
      const statusInfo = await getApifyRunStatus(userId, runId);
      if (!statusInfo) continue;

      const { status, datasetId } = statusInfo;

      if (status === 'RUNNING' || status === 'READY') {
        allCompleted = false;
        const stepProgress = Math.min(90, 10 + Math.floor(Math.random() * 60));
        updateStepStatus(step.id, 'running');
        const fakeProgress = Math.floor(((i + stepProgress / 100) / runIds.length) * 100);
        updateMissionProgress(fakeProgress, step.label);
      } else if (status === 'SUCCEEDED') {
        const rawJobs = await fetchApifyRunResults(userId, datasetId);
        const platform = step.id.split(':')[0];
        if (!platform) continue;
        const newJobs = await processMissionResults(rawJobs, platform, existingJobs);

        if (newJobs.length > 0) {
          const jobsWithIds = newJobs.map(job => ({
            ...job,
            id: `suggested_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          }));
          await suggestedJobsService.saveSuggestedJobs(userId, jobsWithIds);
        }

        totalNewJobs += newJobs.length;
        updateStepStatus(step.id, 'completed', { jobsFound: newJobs.length });

        const progress = Math.floor(((i + 1) / runIds.length) * 95);
        updateMissionProgress(progress, `Completed ${step.label} — Found ${newJobs.length} jobs`);
      } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        updateStepStatus(step.id, 'failed', { error: `Status: ${status}` });
      }
    } catch (err) {
      allCompleted = false;
      updateStepStatus(step.id, 'failed', { error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  if (allCompleted) {
    completeMission(totalNewJobs);
    if (totalNewJobs > 0) {
      toast.success(`Job discovery complete! Found ${totalNewJobs} new jobs.`, { duration: 8000 });
    } else {
      toast.info('Job discovery complete. No new jobs found matching your criteria.', { duration: 5000 });
    }
  }
}

export async function startMission(userId: string, settings: ScrapingSettings): Promise<void> {
  const {
    startMission: start,
    setMissionSteps,
    updateMissionProgress: updateProgress,
    addMissionRunId: addRunId,
    failMission: fail,
  } = await import('../services/scrapingProgress');

  start(settings);
  updateProgress(2, 'Initializing...');

  const { getRoleSearchTerm, getTechSearchTerm, getLocationDisplayName } =
    await import('../constants/scrapingOptions');

  const roleKeywords = (settings.keywords || []).map(getRoleSearchTerm);
  const techKeywords = (settings.techKeywords || []).map(getTechSearchTerm);
  const searchKeywords = [...roleKeywords, ...techKeywords];

  if (searchKeywords.length === 0) {
    fail('Select at least one job role or tech skill before starting.');
    return;
  }

  const locations: (string | undefined)[] =
    settings.locations && settings.locations.length > 0
      ? settings.locations.map(getLocationDisplayName)
      : [undefined];

  const steps: Array<{ id: string; label: string; status: 'pending' | 'running' | 'completed' | 'failed'; jobsFound: number }> = [];
  const tasks: Array<{ platform: string; location: string | undefined; keywords: string[] }> = [];

  for (const platform of settings.platforms) {
    for (const location of locations) {
      const locLabel = location || 'Global';
      const id = `${platform}:${locLabel}`;
      const label = `Scraping ${platform === 'linkedin' ? 'LinkedIn' : 'Indeed'} for ${locLabel}`;
      steps.push({ id, label, status: 'pending', jobsFound: 0 });
      tasks.push({ platform, location, keywords: searchKeywords });
    }
  }

  setMissionSteps(steps);
  updateProgress(5, 'Starting scrapers...');

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]!;
    const step = steps[i]!;

    try {
      updateProgress(5 + Math.floor((i / tasks.length) * 10), step.label);
      updateStepStatus(step.id, 'running');

      const input = buildActorInput(task.platform, task.keywords, task.location, 20, settings);
      if (!input) {
        updateStepStatus(step.id, 'failed', { error: 'Unsupported platform' });
        continue;
      }

      const runResult = await startApifyRun(userId, task.platform, input);
      if (!runResult) {
        updateStepStatus(step.id, 'failed', { error: 'Failed to start scraper' });
        continue;
      }

      addRunId(runResult.runId);
    } catch (err) {
      updateStepStatus(step.id, 'failed', { error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }
}
