/**
 * Job scraping service using Apify
 * Supports multiple job platforms with authentication
 */

import type { SuggestedJob, ScrapingSettings, Platform } from '../types';
import { encrypt, decrypt, isCryptoAvailable } from '../lib/encryption';

const APIFY_BASE_URL = 'https://api.apify.com/v2';
const STORAGE_KEY_PREFIX = 'jt_scraping_';

interface PlatformScraperConfig {
  actorId: string;
  buildInput: (keywords: string[], location: string | undefined, limit: number) => Record<string, unknown>;
}

const APIFY_ACTORS: Record<string, PlatformScraperConfig> = {
  linkedin: {
    actorId: 'openclaw~linkedin-jobs-scraper',
    buildInput: (keywords, location, limit) => ({
      searchKeywords: keywords,
      ...(location ? { searchLocation: location } : {}),
      maxItems: limit,
      scrapeCompany: true,
      scrapeJobDetails: true,
    }),
  },
  indeed: {
    actorId: 'blackfalcondata~indeed-job-scraper',
    buildInput: (keywords, location, limit) => ({
      query: keywords.length === 1 ? keywords[0] : keywords,
      ...(location ? { location } : {}),
      maxResults: limit,
      maxPages: Math.max(1, Math.ceil(limit / 15)),
      includeDetails: true,
      compact: false,
      includeCompanyProfile: false,
      incrementalMode: false,
      emitUnchanged: false,
      emitExpired: false,
    }),
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
  company?: string;
  companyName?: string;
  location?: string;
  salary?: string;
  salaryText?: string;
  salaryInfo?: string[];
  description?: string;
  descriptionText?: string;
  jobDescription?: string;
  url?: string;
  link?: string;
  canonicalUrl?: string;
  sourceUrl?: string;
  jobUrl?: string;
  jobListing?: string;
  postedAt?: string;
  postedDate?: string;
  jobPostDate?: string;
  skills?: string[];
  isRemote?: boolean;
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

function transformJobToSuggestedJob(
  raw: RawApifyJob,
  platform: string,
  fetchedAt: string
): SuggestedJob {
  const salary = Array.isArray(raw.salaryInfo)
    ? raw.salaryInfo.filter(Boolean).join(' - ')
    : raw.salaryText || raw.salary;

  return {
    id: `scrape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    companyName: raw.companyName || raw.company || 'Unknown Company',
    position: raw.title || raw.position || 'Unknown Position',
    jobListing: raw.link || raw.canonicalUrl || raw.sourceUrl || raw.url || raw.jobUrl || raw.jobListing || '',
    description: raw.descriptionText || raw.description || raw.jobDescription || '',
    salary,
    location: raw.location,
    platform: platform as Platform,
    jobPostDate: raw.postedDate || raw.postedAt || raw.jobPostDate,
    fetchedAt,
    skills: raw.skills,
    fitScore: undefined,
    dismissed: false,
    applied: false,
    rawData: raw,
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
  limit: number = 20
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
    body: JSON.stringify(platformConfig.buildInput(keywords, location, limit)),
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

  const locations: (string | undefined)[] =
    settings.locations && settings.locations.length > 0
      ? settings.locations
      : [undefined];

  for (const platform of settings.platforms) {
    for (const location of locations) {
      try {
        const jobs = await runApifyScraper(
          userId,
          platform,
          settings.keywords,
          location,
          20
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
  const rawIsRemote = job.rawData?.['isRemote'];
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
  const filteredByRemote = settings.remoteOnly ? newJobs.filter(isLikelyRemoteJob) : newJobs;

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
