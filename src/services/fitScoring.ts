import type { Job, UserPreferences, FitScore } from '../types';

/**
 * Parse salary string to extract numeric value
 * Handles formats like: "$50,000", "$50k", "$50,000 - $70,000", "$50/hr"
 */
export function parseSalary(salaryStr: string | undefined): { min: number; max: number } | null {
  if (!salaryStr) return null;
  
  const normalized = salaryStr.toLowerCase().replace(/,/g, '');
  
  // Extract all numbers from the string
  const numbers = normalized.match(/[\d.]+/g);
  if (!numbers || numbers.length === 0) return null;
  
  // Check if it's hourly
  const isHourly = /\/(hr|hour)|per\s*hour/i.test(salaryStr);
  const multiplier = isHourly ? 2080 : 1; // 40hrs * 52 weeks
  
  // Check if it's in 'k' format (e.g., 50k)
  const hasK = /\d+k/i.test(normalized);
  const kMultiplier = hasK ? 1000 : 1;
  
  const values = numbers.map(n => parseFloat(n) * multiplier * kMultiplier);
  
  if (values.length === 1) {
    return { min: values[0]!, max: values[0]! };
  }
  
  return { 
    min: Math.min(...values), 
    max: Math.max(...values) 
  };
}

/**
 * Calculate string similarity using Levenshtein distance
 */
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  // Check if one contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.8;
  }
  
  // Calculate Levenshtein distance
  const matrix: number[][] = [];
  
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= s2.length; j++) {
    matrix[0]![j] = j;
  }
  
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,      // deletion
        matrix[i]![j - 1]! + 1,      // insertion
        matrix[i - 1]![j - 1]! + cost // substitution
      );
    }
  }
  
  const distance = matrix[s1.length]![s2.length]!;
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - (distance / maxLength);
}

/**
 * Check if a location matches user preferences
 */
export function locationMatches(jobLocation: string | undefined, preferredLocations: string[]): number {
  if (!jobLocation || preferredLocations.length === 0) return 0.5; // Neutral score if no data
  
  const normalizedJob = jobLocation.toLowerCase().trim();
  
  // Special handling for remote
  if (normalizedJob.includes('remote')) {
    const wantsRemote = preferredLocations.some(loc => 
      loc.toLowerCase().includes('remote')
    );
    if (wantsRemote) return 1;
  }
  
  // Check for exact or partial matches
  for (const preferred of preferredLocations) {
    const normalizedPref = preferred.toLowerCase().trim();
    
    if (normalizedJob.includes(normalizedPref) || normalizedPref.includes(normalizedJob)) {
      return 1;
    }
    
    // Check for city/state matches
    const similarity = stringSimilarity(normalizedJob, normalizedPref);
    if (similarity > 0.7) return similarity;
  }
  
  return 0;
}

/**
 * Check if a job role matches user preferences
 */
export function roleMatches(jobPosition: string, preferredRoles: string[]): number {
  if (preferredRoles.length === 0) return 0.5; // Neutral score if no preferences
  
  const normalizedPosition = jobPosition.toLowerCase().trim();
  let bestMatch = 0;
  
  for (const preferred of preferredRoles) {
    const normalizedPref = preferred.toLowerCase().trim();
    
    // Exact match
    if (normalizedPosition === normalizedPref) return 1;
    
    // Contains match
    if (normalizedPosition.includes(normalizedPref) || normalizedPref.includes(normalizedPosition)) {
      bestMatch = Math.max(bestMatch, 0.9);
      continue;
    }
    
    // Word overlap
    const posWords = normalizedPosition.split(/\s+/);
    const prefWords = normalizedPref.split(/\s+/);
    const commonWords = posWords.filter(w => prefWords.includes(w));
    const wordOverlap = commonWords.length / Math.max(posWords.length, prefWords.length);
    
    if (wordOverlap > 0.5) {
      bestMatch = Math.max(bestMatch, wordOverlap);
    }
  }
  
  return bestMatch;
}

/**
 * Calculate fit score for a job based on user preferences
 */
export function calculateFitScore(job: Job, preferences: UserPreferences): FitScore {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Check if company is in exclude list
  const isExcluded = preferences.excludeCompanies.some(company => 
    job.companyName.toLowerCase().includes(company.toLowerCase())
  );
  if (isExcluded) {
    warnings.push('Company is in your exclude list');
  }
  
  // Location match (0-25 points)
  const locationScore = locationMatches(job.location, preferences.preferredLocations) * 25;
  
  // Role match (0-25 points)
  const roleScore = roleMatches(job.position, preferences.preferredRoles) * 25;
  
  // Salary match (0-25 points)
  let salaryScore = 12.5; // Default to neutral
  const parsedSalary = parseSalary(job.salary);
  if (parsedSalary && preferences.minSalary) {
    if (parsedSalary.max < preferences.minSalary) {
      salaryScore = 0;
      recommendations.push(`Salary below your minimum ($${preferences.minSalary.toLocaleString()})`);
    } else if (parsedSalary.min >= preferences.minSalary) {
      salaryScore = 25;
    } else {
      // Partial match - salary range overlaps
      salaryScore = 15;
    }
  }
  
  // Platform match (0-15 points)
  let platformScore = 7.5; // Default to neutral
  if (preferences.preferredPlatforms.length > 0) {
    const isPlatformPreferred = preferences.preferredPlatforms.some(p => 
      p.toLowerCase() === job.platform.toLowerCase()
    );
    platformScore = isPlatformPreferred ? 15 : 5;
  }
  
  // Keyword match (0-10 points)
  let keywordScore = 5; // Default to neutral
  if (preferences.keywords.length > 0) {
    const searchText = `${job.position} ${job.notes || ''} ${job.companyName}`.toLowerCase();
    const matchedKeywords = preferences.keywords.filter(kw => 
      searchText.includes(kw.toLowerCase())
    );
    keywordScore = (matchedKeywords.length / preferences.keywords.length) * 10;
  }
  
  // Calculate total score
  let totalScore = locationScore + roleScore + salaryScore + platformScore + keywordScore;
  
  // Apply penalty for excluded companies
  if (isExcluded) {
    totalScore = Math.max(0, totalScore - 50);
  }
  
  return {
    score: Math.round(totalScore),
    breakdown: {
      locationMatch: Math.round(locationScore),
      roleMatch: Math.round(roleScore),
      salaryMatch: Math.round(salaryScore),
      platformMatch: Math.round(platformScore),
      keywordMatch: Math.round(keywordScore),
    },
    warnings,
    recommendations,
  };
}

/**
 * Get default user preferences
 */
export function getDefaultPreferences(): UserPreferences {
  return {
    preferredLocations: [],
    preferredRoles: [],
    minSalary: undefined,
    maxSalary: undefined,
    preferredPlatforms: [],
    excludeCompanies: [],
    keywords: [],
  };
}
