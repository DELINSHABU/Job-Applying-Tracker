import type { ScrapingSettings } from '../types';

export interface ScrapingStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  jobsFound: number;
  error?: string;
}

export interface ScrapingMissionState {
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  steps: ScrapingStep[];
  totalJobsFound: number;
  errors: string[];
  startedAt: string | null;
  finishedAt: string | null;
  settings: ScrapingSettings | null;
  runIds: string[];
}

const STORAGE_KEY = 'jt_scraping_mission';
const BROADCAST_CHANNEL = 'jt_scraping_progress';

const defaultState: ScrapingMissionState = {
  status: 'idle',
  progress: 0,
  currentStep: '',
  steps: [],
  totalJobsFound: 0,
  errors: [],
  startedAt: null,
  finishedAt: null,
  settings: null,
  runIds: [],
};

let channel: BroadcastChannel | null = null;
let listeners: Set<(state: ScrapingMissionState) => void> = new Set();

function getChannel(): BroadcastChannel {
  if (!channel) {
    channel = new BroadcastChannel(BROADCAST_CHANNEL);
    channel.onmessage = (event: MessageEvent<ScrapingMissionState>) => {
      const state = event.data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      listeners.forEach(fn => fn(state));
    };
  }
  return channel;
}

function broadcast(state: ScrapingMissionState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  try {
    getChannel().postMessage(state);
  } catch {
    // BroadcastChannel not supported
  }
  listeners.forEach(fn => fn(state));
}

export function getMissionState(): ScrapingMissionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as ScrapingMissionState;
    }
  } catch {
    // corrupted data
  }
  return { ...defaultState };
}

export function subscribeToMission(fn: (state: ScrapingMissionState) => void): () => void {
  listeners.add(fn);
  fn(getMissionState());
  return () => {
    listeners.delete(fn);
  };
}

export function startMission(settings: ScrapingSettings): void {
  const now = new Date().toISOString();
  const state: ScrapingMissionState = {
    status: 'running',
    progress: 0,
    currentStep: 'Initializing...',
    steps: [],
    totalJobsFound: 0,
    errors: [],
    startedAt: now,
    finishedAt: null,
    settings,
    runIds: [],
  };
  broadcast(state);
}

export function setMissionSteps(steps: ScrapingStep[]): void {
  const state = getMissionState();
  if (state.status !== 'running') return;
  state.steps = steps;
  broadcast(state);
}

export function updateStepStatus(
  stepId: string,
  status: ScrapingStep['status'],
  extra?: { jobsFound?: number; error?: string }
): void {
  const state = getMissionState();
  if (state.status !== 'running') return;
  const step = state.steps.find(s => s.id === stepId);
  if (!step) return;
  step.status = status;
  if (extra?.jobsFound !== undefined) step.jobsFound = extra.jobsFound;
  if (extra?.error) step.error = extra.error;
  broadcast(state);
}

export function updateMissionProgress(progress: number, currentStep: string): void {
  const state = getMissionState();
  if (state.status !== 'running') return;
  state.progress = Math.min(100, Math.max(0, progress));
  state.currentStep = currentStep;
  broadcast(state);
}

export function addMissionRunId(runId: string): void {
  const state = getMissionState();
  if (state.status !== 'running') return;
  state.runIds.push(runId);
  broadcast(state);
}

export function stopMission(): void {
  const state = getMissionState();
  if (state.status !== 'running') return;
  state.status = 'failed';
  state.progress = 0;
  state.currentStep = 'Mission stopped by user';
  state.finishedAt = new Date().toISOString();
  broadcast(state);
}

export function completeMission(jobsFound: number): void {
  const state = getMissionState();
  if (state.status !== 'running') return;
  state.status = 'completed';
  state.progress = 100;
  state.currentStep = `Completed! Found ${jobsFound} new jobs`;
  state.totalJobsFound = jobsFound;
  state.finishedAt = new Date().toISOString();
  broadcast(state);
}

export function failMission(error: string): void {
  const state = getMissionState();
  if (state.status !== 'running') return;
  state.status = 'failed';
  state.progress = 0;
  state.currentStep = `Failed: ${error}`;
  state.errors.push(error);
  state.finishedAt = new Date().toISOString();
  broadcast(state);
}

export function clearMission(): void {
  localStorage.removeItem(STORAGE_KEY);
  const state = { ...defaultState };
  broadcast(state);
}
