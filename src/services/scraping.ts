/**
 * Job scraping service using Apify
 * Supports multiple job platforms with authentication
 */

import type { SuggestedJob, ScrapingSettings, Platform } from '../types';
import { encrypt, decrypt, isCryptoAvailable } from '../lib/encryption';
import {
  LINKEDIN_EXPERIENCE_MAP,
  LINKEDIN_JOB_TYPE_MAP,
  LINKEDIN_WORK_TYPE_MAP,
  LINKEDIN_POSTED_MAP,
  INDEED_POSTED_MAP,
  INDEED_JOB_TYPE_MAP,
  getRoleSearchTerm,
  getTechSearchTerm,
  getLocationDisplayName,
} from '../constants/scrapingOptions';

const APIFY_BASE_URL = 'https://api.apify.com/v2';
const STORAGE_KEY_PREFIX = 'jt_scraping_';

interface PlatformScraperConfig {
  actorId: string;
  buildInput: (keywords: string[], location: string | undefined, limit: number, settings?: ScrapingSettings) => Record<string, unknown>;
}

function buildLinkedInSearchUrl(
  keywords: string[],
  location: string | undefined,
  settings: ScrapingSettings
): string {
  const params = new URLSearchParams();

  if (keywords.length > 0) {
    params.set('keywords', keywords.join(' '));
  }

  if (location) {
    params.set('location', location);
  }

  if (settings.experienceLevels && settings.experienceLevels.length > 0) {
    const linkedinValues = settings.experienceLevels
      .map(level => LINKEDIN_EXPERIENCE_MAP[level])
      .filter(Boolean);
    if (linkedinValues.length > 0) {
      params.set('f_E', [...new Set(linkedinValues)].join(','));
    }
  }

  if (settings.jobTypes && settings.jobTypes.length > 0) {
    const linkedinValues = settings.jobTypes
      .map(type => LINKEDIN_JOB_TYPE_MAP[type])
      .filter(Boolean);
    if (linkedinValues.length > 0) {
      params.set('f_JT', linkedinValues.join(','));
    }
  }

  if (settings.workArrangements && settings.workArrangements.length > 0) {
    const linkedinValues = settings.workArrangements
      .map(arr => LINKEDIN_WORK_TYPE_MAP[arr])
      .filter(Boolean);
    if (linkedinValues.length > 0) {
      params.set('f_WT', linkedinValues.join(','));
    }
  }

  if (settings.postedWithin && settings.postedWithin !== 'any') {
    const tpr = LINKEDIN_POSTED_MAP[settings.postedWithin];
    if (tpr) {
      params.set('f_TPR', tpr);
    }
  }

  return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
}

const APIFY_ACTORS: Record<string, PlatformScraperConfig> = {
  linkedin: {
    actorId: 'openclaw~linkedin-jobs-scraper',
    buildInput: (keywords, location, limit, settings) => {
      const searchUrl = buildLinkedInSearchUrl(keywords, location, settings || {} as ScrapingSettings);
      return {
        startUrls: [{ url: searchUrl }],
        maxItems: limit,
        scrapeCompany: true,
        scrapeJobDetails: true,
      };
    },
  },
  indeed: {
    actorId: 'blackfalcondata~indeed-job-scraper',
    buildInput: (keywords, location, limit, settings) => {
      const input: Record<string, unknown> = {
        query: keywords.length === 1 ? keywords[0] : keywords,
        maxResults: limit,
        maxPages: Math.max(1, Math.ceil(limit / 15)),
        includeDetails: true,
        compact: false,
        includeCompanyProfile: false,
        incrementalMode: false,
        emitUnchanged: false,
        emitExpired: false,
      };

      if (location) {
        input.location = location;
      }

      if (settings?.postedWithin && settings.postedWithin !== 'any') {
        const days = INDEED_POSTED_MAP[settings.postedWithin];
        if (days) input.postedDays = days;
      }

      if (settings?.workArrangements?.includes('remote')) {
        input.remoteFilter = 'remote';
      }

      if (settings?.jobTypes && settings.jobTypes.length > 0) {
        const firstJobType = settings.jobTypes[0];
        if (firstJobType) {
          const indeedType = INDEED_JOB_TYPE_MAP[firstJobType];
          if (indeedType) input.jobType = indeedType;
        }
      }

      return input;
    },
  },
};

interface ApifyRunResponse {
  data: {
    id: string;
    status: string;
    defaultDatasetId: string;
  };
}

type RawApifyJob = {
  title?: string;
  position?: string;
  jobTitle?: string;
  company?: string;
  companyName?: string;
  companyNameRaw?: string;
  employer?: string;
  location?: string;
  jobLocation?: string;
  place?: string;
  salary?: string;
  salaryText?: string;
  salaryInfo?: string[];
  compensation?: string;
  description?: string;
  descriptionText?: string;
  jobDescription?: string;
  fullDescription?: string;
  url?: string;
  link?: string;
  canonicalUrl?: string;
  sourceUrl?: string;
  jobUrl?: string;
  jobListing?: string;
  applyUrl?: string;
  postedAt?: string;
  postedDate?: string;
  jobPostDate?: string;
  datePosted?: string;
  createdAt?: string;
  listedAt?: string;
  skills?: string[];
  isRemote?: boolean;
  remote?: boolean;
  employmentType?: string;
  [key: string]: unknown;
};

function getLoginStorageKey(userId: string, platform: string): string {
  return `${STORAGE_KEY_PREFIX}login_${userId}_${platform}`;
}

export async function saveLoginSession(
  userId: string,
  platform: string,
  sessionData: string
): Promise<void> {
  if (!isCryptoAvailable()) {
    localStorage.setItem(getLoginStorageKey(userId, platform), btoa(sessionData));
    return;
  }
  const encrypted = await encrypt(sessionData, userId);
  localStorage.setItem(getLoginStorageKey(userId, platform), encrypted);
}

export async function getLoginSession(
  userId: string,
  platform: string
): Promise<string | null> {
  const stored = localStorage.getItem(getLoginStorageKey(userId, platform));
  if (!stored) return null;

  if (!isCryptoAvailable()) {
    try {
      return atob(stored);
    } catch {
      return null;
    }
  }

  try {
    return await decrypt(stored, userId);
  } catch {
    return null;
  }
}

export async function removeLoginSession(
  userId: string,
  platform: string
): Promise<void> {
  localStorage.removeItem(getLoginStorageKey(userId, platform));
}

export async function saveApifyToken(
  userId: string,
  token: string
): Promise<void> {
  if (!isCryptoAvailable()) {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}token_${userId}`, btoa(token));
    return;
  }
  const encrypted = await encrypt(token, userId);
  localStorage.setItem(`${STORAGE_KEY_PREFIX}token_${userId}`, encrypted);
}

export async function getApifyToken(userId: string): Promise<string | null> {
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}token_${userId}`);
  if (!stored) return null;

  if (!isCryptoAvailable()) {
    try {
      return atob(stored);
    } catch {
      return null;
    }
  }

  try {
    return await decrypt(stored, userId);
  } catch {
    return null;
  }
}

export async function removeApifyToken(userId: string): Promise<void> {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}token_${userId}`);
}

export function getActorId(platform: string): string | null {
  return APIFY_ACTORS[platform]?.actorId ?? null;
}

export function buildActorInput(
  platform: string,
  keywords: string[],
  location: string | undefined,
  limit: number,
  settings?: ScrapingSettings
): Record<string, unknown> | null {
  const config = APIFY_ACTORS[platform];
  if (!config) return null;
  return config.buildInput(keywords, location, limit, settings);
}

export async function startApifyRun(
  userId: string,
  platform: string,
  input: Record<string, unknown>
): Promise<{ runId: string; datasetId: string } | null> {
  const token = await getApifyToken(userId);
  if (!token) throw new Error('Apify token not configured');

  const actorId = APIFY_ACTORS[platform]?.actorId;
  if (!actorId) throw new Error(`Unknown platform: ${platform}`);

  const response = await fetch(`${APIFY_BASE_URL}/acts/${actorId}/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to start ${platform} scraper: ${text}`);
  }

  const data: ApifyRunResponse = await response.json();
  return { runId: data.data.id, datasetId: data.data.defaultDatasetId };
}

export async function stopApifyRun(userId: string, runId: string): Promise<boolean> {
  const token = await getApifyToken(userId);
  if (!token) return false;

  const response = await fetch(`${APIFY_BASE_URL}/actor-runs/${runId}/abort`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.ok;
}

export async function getApifyRunStatus(userId: string, runId: string): Promise<{ status: string; datasetId: string } | null> {
  const token = await getApifyToken(userId);
  if (!token) return null;

  const response = await fetch(`${APIFY_BASE_URL}/actor-runs/${runId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return null;

  const data: ApifyRunResponse = await response.json();
  return { status: data.data.status, datasetId: data.data.defaultDatasetId };
}

export async function fetchApifyRunResults(userId: string, datasetId: string): Promise<RawApifyJob[]> {
  const token = await getApifyToken(userId);
  if (!token) return [];

  const response = await fetch(
    `${APIFY_BASE_URL}/datasets/${datasetId}/items`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) return [];

  return await response.json();
}

function extractSalary(raw: RawApifyJob): string | undefined {
  if (Array.isArray(raw.salaryInfo)) {
    const filtered = raw.salaryInfo.filter(Boolean);
    if (filtered.length > 0) return filtered.join(' - ');
  }
  return raw.salaryText || raw.salary || raw.compensation;
}

function extractUrl(raw: RawApifyJob): string {
  return raw.link || raw.canonicalUrl || raw.sourceUrl || raw.url || raw.jobUrl || raw.jobListing || raw.applyUrl || '';
}

function extractDate(raw: RawApifyJob): string | undefined {
  return raw.postedDate || raw.postedAt || raw.jobPostDate || raw.datePosted || raw.createdAt || raw.listedAt;
}

function extractCompanyName(raw: RawApifyJob): string {
  return raw.companyName || raw.company || raw.companyNameRaw || raw.employer || 'Unknown Company';
}

function extractPosition(raw: RawApifyJob): string {
  return raw.title || raw.position || raw.jobTitle || 'Unknown Position';
}

function extractLocation(raw: RawApifyJob): string | undefined {
  return raw.location || raw.jobLocation || raw.place;
}

function extractDescription(raw: RawApifyJob): string {
  return raw.descriptionText || raw.description || raw.jobDescription || raw.fullDescription || '';
}

function extractIsRemote(raw: RawApifyJob): boolean {
  if (typeof raw.isRemote === 'boolean') return raw.isRemote;
  if (typeof raw.remote === 'boolean') return raw.remote;
  return false;
}

function transformJobToSuggestedJob(
  raw: RawApifyJob,
  platform: string,
  fetchedAt: string
): SuggestedJob {
  const isRemote = extractIsRemote(raw);
  const salary = extractSalary(raw);

  return {
    id: `scrape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    companyName: extractCompanyName(raw),
    position: extractPosition(raw),
    jobListing: extractUrl(raw),
    description: extractDescription(raw),
    salary,
    location: extractLocation(raw),
    platform: platform as Platform,
    jobPostDate: extractDate(raw),
    fetchedAt,
    skills: raw.skills,
    fitScore: undefined,
    dismissed: false,
    applied: false,
    rawData: { ...raw, _isRemote: isRemote },
  };
}

async function getResponseErrorMessage(response: Response, fallbackPrefix: string): Promise<string> {
  let errorMessage = await response.text();

  try {
    const parsed = JSON.parse(errorMessage) as { error?: { message?: string } };
    errorMessage = parsed.error?.message || errorMessage;
  } catch {
    // Keep original text response.
  }

  return `${fallbackPrefix}: ${errorMessage}`;
}

export async function runApifyScraper(
  userId: string,
  platform: string,
  keywords: string[],
  location?: string,
  limit: number = 20,
  settings?: ScrapingSettings
): Promise<SuggestedJob[]> {
  const token = await getApifyToken(userId);
  if (!token) {
    throw new Error('Apify token not configured. Please add your Apify token in settings.');
  }

  const platformConfig = APIFY_ACTORS[platform];
  if (!platformConfig) {
    throw new Error(`Platform "${platform}" is not supported for job discovery yet.`);
  }

  if (keywords.length === 0) {
    throw new Error('Add at least one keyword or profile skill before starting job discovery.');
  }

  const response = await fetch(`${APIFY_BASE_URL}/acts/${platformConfig.actorId}/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(platformConfig.buildInput(keywords, location, limit, settings)),
  });

  if (!response.ok) {
    throw new Error(await getResponseErrorMessage(response, `Failed to start ${platform} scraper`));
  }

  const runResponse: ApifyRunResponse = await response.json();
  const runId = runResponse.data.id;

  let status = runResponse.data.status;
  const maxAttempts = 60;
  let attempts = 0;

  while (!['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(status) && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const statusResponse = await fetch(`${APIFY_BASE_URL}/actor-runs/${runId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!statusResponse.ok) {
      throw new Error(await getResponseErrorMessage(statusResponse, `Failed to check ${platform} scraper status`));
    }

    const statusJson: ApifyRunResponse = await statusResponse.json();
    status = statusJson.data.status;
    attempts++;
  }

  if (attempts >= maxAttempts && !['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
    throw new Error(`${platform} scraper timed out while waiting for results.`);
  }

  if (status !== 'SUCCEEDED') {
    throw new Error(`${platform} scraper ended with status ${status}.`);
  }

  const datasetResponse = await fetch(
    `${APIFY_BASE_URL}/datasets/${runResponse.data.defaultDatasetId}/items`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!datasetResponse.ok) {
    throw new Error(await getResponseErrorMessage(datasetResponse, `Failed to fetch ${platform} results`));
  }

  const items: RawApifyJob[] = await datasetResponse.json();
  const fetchedAt = new Date().toISOString();

  return items.map(item => transformJobToSuggestedJob(item, platform, fetchedAt));
}

export async function scrapeAllPlatforms(
  userId: string,
  settings: ScrapingSettings
): Promise<SuggestedJob[]> {
  const allJobs: SuggestedJob[] = [];
  const errors: string[] = [];

  const roleKeywords = (settings.keywords || []).map(getRoleSearchTerm);
  const techKeywords = (settings.techKeywords || []).map(getTechSearchTerm);
  const searchKeywords = [...roleKeywords, ...techKeywords];

  if (searchKeywords.length === 0) {
    throw new Error('Select at least one job role or tech skill before starting.');
  }

  const locations: (string | undefined)[] =
    settings.locations && settings.locations.length > 0
      ? settings.locations.map(getLocationDisplayName)
      : [undefined];

  for (const platform of settings.platforms) {
    for (const location of locations) {
      try {
        const jobs = await runApifyScraper(
          userId,
          platform,
          searchKeywords,
          location,
          20,
          settings
        );
        allJobs.push(...jobs);
      } catch (error) {
        errors.push(`${platform} (${location || 'any'}): ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  if (allJobs.length === 0 && errors.length > 0) {
    throw new Error(`Scraping failed for all platforms and locations: ${errors.join('; ')}`);
  }

  return allJobs;
}

function isLikelyRemoteJob(job: SuggestedJob): boolean {
  const rawIsRemote = job.rawData?.['_isRemote'] ?? job.rawData?.['isRemote'];
  if (typeof rawIsRemote === 'boolean') {
    return rawIsRemote;
  }

  const searchableText = [job.location, job.position, job.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchableText.includes('remote') || searchableText.includes('work from home');
}

export async function refreshSuggestedJobs(
  userId: string,
  settings: ScrapingSettings,
  existingJobs: SuggestedJob[]
): Promise<SuggestedJob[]> {
  const newJobs = await scrapeAllPlatforms(userId, settings);
  const isRemoteOnlyFilter = settings.workArrangements?.length === 1 
    && settings.workArrangements[0] === 'remote';
  const filteredByRemote = (settings.remoteOnly || isRemoteOnlyFilter) ? newJobs.filter(isLikelyRemoteJob) : newJobs;

  const existingUrls = new Set(
    existingJobs
      .filter(j => j.jobListing)
      .map(j => j.jobListing)
  );

  const existingAppliedUrls = new Set(
    existingJobs
      .filter(j => j.applied && j.jobListing)
      .map(j => j.jobListing)
  );

  const existingDismissedUrls = new Set(
    existingJobs
      .filter(j => j.dismissed && j.jobListing)
      .map(j => j.jobListing)
  );

  const uniqueNewJobs = filteredByRemote.filter(job => {
    if (!job.jobListing) return true;
    if (existingUrls.has(job.jobListing)) return false;
    if (existingAppliedUrls.has(job.jobListing)) return false;
    if (existingDismissedUrls.has(job.jobListing)) return false;
    return true;
  });

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const freshJobs = uniqueNewJobs.filter(job => {
    if (!job.jobPostDate) return true;
    const postDate = new Date(job.jobPostDate);
    return postDate >= fourteenDaysAgo;
  });

  return freshJobs;
}

export function getSupportedPlatforms(): { id: string; name: string }[] {
  return [
    { id: 'linkedin', name: 'LinkedIn Jobs' },
    { id: 'indeed', name: 'Indeed' },
  ];
}

export async function processMissionResults(
  rawJobs: RawApifyJob[],
  platform: string,
  existingJobs: SuggestedJob[]
): Promise<SuggestedJob[]> {
  const fetchedAt = new Date().toISOString();
  const newJobs = rawJobs.map(item => transformJobToSuggestedJob(item, platform, fetchedAt));

  const existingUrls = new Set(
    existingJobs
      .filter(j => j.jobListing)
      .map(j => j.jobListing)
  );

  const existingAppliedUrls = new Set(
    existingJobs
      .filter(j => j.applied && j.jobListing)
      .map(j => j.jobListing)
  );

  const existingDismissedUrls = new Set(
    existingJobs
      .filter(j => j.dismissed && j.jobListing)
      .map(j => j.jobListing)
  );

  const uniqueNewJobs = newJobs.filter(job => {
    if (!job.jobListing) return true;
    if (existingUrls.has(job.jobListing)) return false;
    if (existingAppliedUrls.has(job.jobListing)) return false;
    if (existingDismissedUrls.has(job.jobListing)) return false;
    return true;
  });

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const freshJobs = uniqueNewJobs.filter(job => {
    if (!job.jobPostDate) return true;
    const postDate = new Date(job.jobPostDate);
    return postDate >= fourteenDaysAgo;
  });

  return freshJobs;
}
