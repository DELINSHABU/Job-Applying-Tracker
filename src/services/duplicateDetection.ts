import type { Job, DuplicateResult } from '../types';
import { stringSimilarity } from './fitScoring';

/**
 * Normalize a string for comparison
 * - Lowercase
 * - Remove extra whitespace
 * - Remove common suffixes (Inc, LLC, Corp, etc.)
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,]/g, '')
    .replace(/\s*(inc|llc|corp|corporation|ltd|limited|co|company)\.?\s*$/i, '')
    .trim();
}

/**
 * Normalize a URL for comparison
 * - Remove protocol (http/https)
 * - Remove www prefix
 * - Remove trailing slashes
 * - Remove query parameters
 */
export function normalizeUrl(url: string | undefined): string | null {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '') + parsed.pathname.replace(/\/$/, '');
  } catch {
    // If not a valid URL, just normalize as string
    return url
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .split('?')[0] || null;
  }
}

/**
 * Check if two companies are likely the same
 */
export function companiesMatch(company1: string, company2: string): boolean {
  const norm1 = normalizeString(company1);
  const norm2 = normalizeString(company2);
  
  // Exact match after normalization
  if (norm1 === norm2) return true;
  
  // One contains the other (handles "Google" vs "Google Inc")
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
  
  // High similarity score
  const similarity = stringSimilarity(norm1, norm2);
  return similarity > 0.85;
}

/**
 * Check if two positions are likely the same
 */
export function positionsMatch(position1: string, position2: string): boolean {
  const norm1 = normalizeString(position1);
  const norm2 = normalizeString(position2);
  
  // Exact match after normalization
  if (norm1 === norm2) return true;
  
  // Handle common variations
  const variations = [
    [/\bsr\b/g, 'senior'],
    [/\bjr\b/g, 'junior'],
    [/\beng\b/g, 'engineer'],
    [/\bdev\b/g, 'developer'],
    [/\bmgr\b/g, 'manager'],
    [/\bui\b/g, 'user interface'],
    [/\bux\b/g, 'user experience'],
  ];
  
  let expanded1 = norm1;
  let expanded2 = norm2;
  
  for (const [pattern, replacement] of variations) {
    expanded1 = expanded1.replace(pattern as RegExp, replacement as string);
    expanded2 = expanded2.replace(pattern as RegExp, replacement as string);
  }
  
  if (expanded1 === expanded2) return true;
  
  // High similarity score
  const similarity = stringSimilarity(expanded1, expanded2);
  return similarity > 0.8;
}

/**
 * Check if two locations are likely the same
 */
export function locationsMatch(location1: string | undefined, location2: string | undefined): boolean {
  if (!location1 || !location2) return false;
  
  const norm1 = normalizeString(location1);
  const norm2 = normalizeString(location2);
  
  // Exact match
  if (norm1 === norm2) return true;
  
  // Both are remote
  if (norm1.includes('remote') && norm2.includes('remote')) return true;
  
  // Check similarity
  return stringSimilarity(norm1, norm2) > 0.8;
}

/**
 * Check if two job listing URLs are the same
 */
export function jobListingsMatch(url1: string | undefined, url2: string | undefined): boolean {
  const norm1 = normalizeUrl(url1);
  const norm2 = normalizeUrl(url2);
  
  if (!norm1 || !norm2) return false;
  
  return norm1 === norm2;
}

/**
 * Detect if a new job might be a duplicate of an existing job
 */
export function detectDuplicate(newJob: Partial<Job>, existingJobs: Job[]): DuplicateResult {
  if (!newJob.companyName || !newJob.position) {
    return {
      isDuplicate: false,
      confidence: 0,
      matchedFields: {
        company: false,
        position: false,
        location: false,
        jobListing: false,
      },
    };
  }
  
  for (const existing of existingJobs) {
    const companyMatch = companiesMatch(newJob.companyName, existing.companyName);
    const positionMatch = positionsMatch(newJob.position, existing.position);
    const locationMatch = locationsMatch(newJob.location, existing.location);
    const listingMatch = jobListingsMatch(newJob.jobListing, existing.jobListing);
    
    // Same job listing URL is a strong indicator
    if (listingMatch) {
      return {
        isDuplicate: true,
        confidence: 1,
        matchedJobId: existing.id,
        matchedFields: {
          company: companyMatch,
          position: positionMatch,
          location: locationMatch,
          jobListing: true,
        },
        reason: 'Same job listing URL',
      };
    }
    
    // Company + Position match is a strong indicator
    if (companyMatch && positionMatch) {
      const confidence = locationMatch ? 0.95 : 0.85;
      return {
        isDuplicate: true,
        confidence,
        matchedJobId: existing.id,
        matchedFields: {
          company: true,
          position: true,
          location: locationMatch,
          jobListing: false,
        },
        reason: locationMatch 
          ? 'Same company, position, and location'
          : 'Same company and position',
      };
    }
    
    // Company + Location with similar position might be a duplicate
    if (companyMatch && locationMatch) {
      const posSimilarity = stringSimilarity(
        normalizeString(newJob.position),
        normalizeString(existing.position)
      );
      
      if (posSimilarity > 0.6) {
        return {
          isDuplicate: false,
          confidence: 0.6,
          matchedJobId: existing.id,
          matchedFields: {
            company: true,
            position: false,
            location: true,
            jobListing: false,
          },
          reason: 'Same company and location with similar position - possible duplicate',
        };
      }
    }
  }
  
  return {
    isDuplicate: false,
    confidence: 0,
    matchedFields: {
      company: false,
      position: false,
      location: false,
      jobListing: false,
    },
  };
}

/**
 * Find all potential duplicates in a list of jobs
 */
export function findAllDuplicates(jobs: Job[]): Map<string, string[]> {
  const duplicateGroups = new Map<string, string[]>();
  const processed = new Set<string>();
  
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i]!;
    if (processed.has(job.id)) continue;
    
    const duplicates: string[] = [job.id];
    
    for (let j = i + 1; j < jobs.length; j++) {
      const otherJob = jobs[j]!;
      if (processed.has(otherJob.id)) continue;
      
      const result = detectDuplicate(job, [otherJob]);
      if (result.isDuplicate || result.confidence > 0.6) {
        duplicates.push(otherJob.id);
        processed.add(otherJob.id);
      }
    }
    
    if (duplicates.length > 1) {
      duplicateGroups.set(job.id, duplicates);
    }
    processed.add(job.id);
  }
  
  return duplicateGroups;
}
