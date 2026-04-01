import {
  parseSalary,
  stringSimilarity,
  locationMatches,
  roleMatches,
  calculateFitScore,
  getDefaultPreferences,
} from '../services/fitScoring';
import type { Job, UserPreferences } from '../types';

describe('parseSalary', () => {
  it('should return null for empty or undefined input', () => {
    expect(parseSalary(undefined)).toBeNull();
    expect(parseSalary('')).toBeNull();
  });

  it('should parse simple salary amounts', () => {
    expect(parseSalary('$50000')).toEqual({ min: 50000, max: 50000 });
    expect(parseSalary('$50,000')).toEqual({ min: 50000, max: 50000 });
  });

  it('should parse salary ranges', () => {
    const result = parseSalary('$50,000 - $70,000');
    expect(result).toEqual({ min: 50000, max: 70000 });
  });

  it('should parse k format', () => {
    expect(parseSalary('50k')).toEqual({ min: 50000, max: 50000 });
    expect(parseSalary('50k - 70k')).toEqual({ min: 50000, max: 70000 });
  });

  it('should convert hourly to annual', () => {
    const result = parseSalary('$50/hr');
    expect(result).toEqual({ min: 104000, max: 104000 }); // 50 * 2080
  });

  it('should handle per hour format', () => {
    const result = parseSalary('$25 per hour');
    expect(result).toEqual({ min: 52000, max: 52000 }); // 25 * 2080
  });
});

describe('stringSimilarity', () => {
  it('should return 1 for identical strings', () => {
    expect(stringSimilarity('hello', 'hello')).toBe(1);
    expect(stringSimilarity('HELLO', 'hello')).toBe(1);
  });

  it('should return 0 for empty strings', () => {
    expect(stringSimilarity('', 'hello')).toBe(0);
    expect(stringSimilarity('hello', '')).toBe(0);
  });

  it('should return 0.8 when one contains the other', () => {
    expect(stringSimilarity('hello', 'hello world')).toBe(0.8);
  });

  it('should return high similarity for similar strings', () => {
    const similarity = stringSimilarity('frontend developer', 'frontend develope');
    expect(similarity).toBeGreaterThan(0.9);
  });

  it('should return low similarity for different strings', () => {
    const similarity = stringSimilarity('frontend developer', 'backend engineer');
    expect(similarity).toBeLessThan(0.5);
  });
});

describe('locationMatches', () => {
  it('should return 0.5 for missing data', () => {
    expect(locationMatches(undefined, ['New York'])).toBe(0.5);
    expect(locationMatches('New York', [])).toBe(0.5);
  });

  it('should return 1 for exact match', () => {
    expect(locationMatches('New York', ['New York'])).toBe(1);
    expect(locationMatches('new york', ['New York'])).toBe(1);
  });

  it('should return 1 for remote when user wants remote', () => {
    expect(locationMatches('Remote', ['Remote'])).toBe(1);
    expect(locationMatches('Remote - US', ['Remote'])).toBe(1);
  });

  it('should return 0 for no match', () => {
    expect(locationMatches('Chicago', ['New York', 'San Francisco'])).toBe(0);
  });

  it('should handle partial matches', () => {
    expect(locationMatches('New York, NY', ['New York'])).toBe(1);
  });
});

describe('roleMatches', () => {
  it('should return 0.5 for no preferences', () => {
    expect(roleMatches('Frontend Developer', [])).toBe(0.5);
  });

  it('should return 1 for exact match', () => {
    expect(roleMatches('Frontend Developer', ['Frontend Developer'])).toBe(1);
  });

  it('should return 0.9 for contains match', () => {
    expect(roleMatches('Senior Frontend Developer', ['Frontend Developer'])).toBe(0.9);
  });

  it('should handle word overlap', () => {
    const score = roleMatches('Software Engineer', ['Engineer', 'Developer']);
    expect(score).toBeGreaterThan(0.5);
  });

  it('should return 0 for no match', () => {
    expect(roleMatches('Marketing Manager', ['Frontend Developer'])).toBe(0);
  });
});

describe('calculateFitScore', () => {
  const createJob = (overrides: Partial<Job> = {}): Job => ({
    id: '1',
    companyName: 'Test Company',
    position: 'Frontend Developer',
    platform: 'linkedin',
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  const createPreferences = (overrides: Partial<UserPreferences> = {}): UserPreferences => ({
    ...getDefaultPreferences(),
    ...overrides,
  });

  it('should return neutral score with no preferences', () => {
    const job = createJob();
    const prefs = createPreferences();
    const result = calculateFitScore(job, prefs);
    
    // All scores should be at neutral (50%)
    expect(result.score).toBe(50); // 12.5 + 12.5 + 12.5 + 7.5 + 5 = 50
  });

  it('should return high score for perfect match', () => {
    const job = createJob({
      location: 'Remote',
      salary: '$100,000',
      position: 'Frontend Developer',
      platform: 'linkedin',
    });
    
    const prefs = createPreferences({
      preferredLocations: ['Remote'],
      preferredRoles: ['Frontend Developer'],
      minSalary: 80000,
      preferredPlatforms: ['linkedin'],
      keywords: ['frontend'],
    });
    
    const result = calculateFitScore(job, prefs);
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  it('should add warning for excluded company', () => {
    const job = createJob({ companyName: 'Bad Company Inc' });
    const prefs = createPreferences({
      excludeCompanies: ['Bad Company'],
    });
    
    const result = calculateFitScore(job, prefs);
    expect(result.warnings).toContain('Company is in your exclude list');
  });

  it('should penalize excluded companies', () => {
    const job = createJob({ companyName: 'Bad Company' });
    const prefs = createPreferences({
      excludeCompanies: ['Bad Company'],
    });
    
    const result = calculateFitScore(job, prefs);
    expect(result.score).toBeLessThan(50);
  });

  it('should add recommendation for low salary', () => {
    const job = createJob({ salary: '$40,000' });
    const prefs = createPreferences({
      minSalary: 60000,
    });
    
    const result = calculateFitScore(job, prefs);
    expect(result.recommendations).toContain('Salary below your minimum ($60,000)');
    expect(result.breakdown.salaryMatch).toBe(0);
  });

  it('should give full salary score when above minimum', () => {
    const job = createJob({ salary: '$80,000' });
    const prefs = createPreferences({
      minSalary: 60000,
    });
    
    const result = calculateFitScore(job, prefs);
    expect(result.breakdown.salaryMatch).toBe(25);
  });

  it('should score keywords correctly', () => {
    const job = createJob({
      position: 'React Developer',
      notes: 'Looking for TypeScript experience',
    });
    
    const prefs = createPreferences({
      keywords: ['react', 'typescript', 'node'],
    });
    
    const result = calculateFitScore(job, prefs);
    // 2 out of 3 keywords match
    expect(result.breakdown.keywordMatch).toBeCloseTo(6.67, 0);
  });

  it('should provide score breakdown', () => {
    const job = createJob();
    const prefs = createPreferences();
    const result = calculateFitScore(job, prefs);
    
    expect(result.breakdown).toHaveProperty('locationMatch');
    expect(result.breakdown).toHaveProperty('roleMatch');
    expect(result.breakdown).toHaveProperty('salaryMatch');
    expect(result.breakdown).toHaveProperty('platformMatch');
    expect(result.breakdown).toHaveProperty('keywordMatch');
  });
});

describe('getDefaultPreferences', () => {
  it('should return empty preferences', () => {
    const prefs = getDefaultPreferences();
    
    expect(prefs.preferredLocations).toEqual([]);
    expect(prefs.preferredRoles).toEqual([]);
    expect(prefs.minSalary).toBeUndefined();
    expect(prefs.maxSalary).toBeUndefined();
    expect(prefs.preferredPlatforms).toEqual([]);
    expect(prefs.excludeCompanies).toEqual([]);
    expect(prefs.keywords).toEqual([]);
  });
});
