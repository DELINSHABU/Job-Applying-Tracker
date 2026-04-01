import {
  normalizeString,
  normalizeUrl,
  companiesMatch,
  positionsMatch,
  locationsMatch,
  jobListingsMatch,
  detectDuplicate,
  findAllDuplicates,
} from '../services/duplicateDetection';
import type { Job } from '../types';

describe('normalizeString', () => {
  it('should lowercase and trim', () => {
    expect(normalizeString('  Hello World  ')).toBe('hello world');
  });

  it('should remove extra whitespace', () => {
    expect(normalizeString('Hello    World')).toBe('hello world');
  });

  it('should remove common company suffixes', () => {
    expect(normalizeString('Google Inc')).toBe('google');
    expect(normalizeString('Google, Inc.')).toBe('google');
    expect(normalizeString('Apple LLC')).toBe('apple');
    expect(normalizeString('Microsoft Corporation')).toBe('microsoft');
    expect(normalizeString('Amazon Corp')).toBe('amazon');
    expect(normalizeString('Test Ltd')).toBe('test');
    expect(normalizeString('Example Company')).toBe('example');
  });

  it('should handle punctuation', () => {
    expect(normalizeString('Hello, World.')).toBe('hello world');
  });
});

describe('normalizeUrl', () => {
  it('should return null for empty input', () => {
    expect(normalizeUrl(undefined)).toBeNull();
    expect(normalizeUrl('')).toBeNull();
  });

  it('should remove protocol and www', () => {
    expect(normalizeUrl('https://www.example.com')).toBe('example.com');
    expect(normalizeUrl('http://example.com')).toBe('example.com');
  });

  it('should remove trailing slashes', () => {
    expect(normalizeUrl('https://example.com/')).toBe('example.com');
    expect(normalizeUrl('https://example.com/path/')).toBe('example.com/path');
  });

  it('should handle paths', () => {
    expect(normalizeUrl('https://linkedin.com/jobs/123')).toBe('linkedin.com/jobs/123');
  });

  it('should remove query parameters', () => {
    expect(normalizeUrl('https://example.com/job?id=123&ref=email')).toBe('example.com/job');
  });
});

describe('companiesMatch', () => {
  it('should match identical companies', () => {
    expect(companiesMatch('Google', 'Google')).toBe(true);
    expect(companiesMatch('google', 'GOOGLE')).toBe(true);
  });

  it('should match companies with different suffixes', () => {
    expect(companiesMatch('Google', 'Google Inc')).toBe(true);
    expect(companiesMatch('Apple LLC', 'Apple')).toBe(true);
    expect(companiesMatch('Microsoft Corporation', 'Microsoft Corp')).toBe(true);
  });

  it('should match when one contains the other', () => {
    expect(companiesMatch('Facebook', 'Facebook Meta')).toBe(true);
  });

  it('should not match different companies', () => {
    expect(companiesMatch('Google', 'Apple')).toBe(false);
    expect(companiesMatch('Microsoft', 'Amazon')).toBe(false);
  });

  it('should handle typos with high similarity', () => {
    expect(companiesMatch('Google', 'Gogle')).toBe(true);
    expect(companiesMatch('Microsoft', 'Microsft')).toBe(true);
  });
});

describe('positionsMatch', () => {
  it('should match identical positions', () => {
    expect(positionsMatch('Frontend Developer', 'Frontend Developer')).toBe(true);
  });

  it('should match positions with abbreviations', () => {
    expect(positionsMatch('Sr. Engineer', 'Senior Engineer')).toBe(true);
    expect(positionsMatch('Jr Developer', 'Junior Developer')).toBe(true);
  });

  it('should match similar positions', () => {
    expect(positionsMatch('Frontend Developer', 'Front-end Developer')).toBe(true);
    expect(positionsMatch('Software Engineer', 'Software Eng')).toBe(true);
  });

  it('should not match different positions', () => {
    expect(positionsMatch('Frontend Developer', 'Backend Developer')).toBe(false);
    expect(positionsMatch('Product Manager', 'Software Engineer')).toBe(false);
  });

  it('should handle UI/UX abbreviations', () => {
    expect(positionsMatch('UI Developer', 'User Interface Developer')).toBe(true);
  });
});

describe('locationsMatch', () => {
  it('should return false for missing locations', () => {
    expect(locationsMatch(undefined, 'New York')).toBe(false);
    expect(locationsMatch('New York', undefined)).toBe(false);
  });

  it('should match identical locations', () => {
    expect(locationsMatch('New York', 'New York')).toBe(true);
    expect(locationsMatch('new york', 'NEW YORK')).toBe(true);
  });

  it('should match remote locations', () => {
    expect(locationsMatch('Remote', 'Remote - US')).toBe(true);
    expect(locationsMatch('Remote, USA', 'Remote')).toBe(true);
  });

  it('should not match different locations', () => {
    expect(locationsMatch('New York', 'San Francisco')).toBe(false);
    expect(locationsMatch('Chicago', 'Boston')).toBe(false);
  });
});

describe('jobListingsMatch', () => {
  it('should return false for missing URLs', () => {
    expect(jobListingsMatch(undefined, 'https://example.com')).toBe(false);
    expect(jobListingsMatch('https://example.com', undefined)).toBe(false);
  });

  it('should match identical URLs', () => {
    expect(jobListingsMatch(
      'https://linkedin.com/jobs/123',
      'https://linkedin.com/jobs/123'
    )).toBe(true);
  });

  it('should match URLs with different protocols', () => {
    expect(jobListingsMatch(
      'http://example.com/job',
      'https://example.com/job'
    )).toBe(true);
  });

  it('should match URLs with www differences', () => {
    expect(jobListingsMatch(
      'https://www.example.com/job',
      'https://example.com/job'
    )).toBe(true);
  });

  it('should not match different URLs', () => {
    expect(jobListingsMatch(
      'https://linkedin.com/jobs/123',
      'https://linkedin.com/jobs/456'
    )).toBe(false);
  });
});

describe('detectDuplicate', () => {
  const createJob = (overrides: Partial<Job> = {}): Job => ({
    id: '1',
    companyName: 'Test Company',
    position: 'Frontend Developer',
    platform: 'linkedin',
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  it('should return not duplicate for missing required fields', () => {
    const result = detectDuplicate({}, [createJob()]);
    expect(result.isDuplicate).toBe(false);
    expect(result.confidence).toBe(0);
  });

  it('should detect duplicate by job listing URL', () => {
    const existing = createJob({ 
      id: 'existing',
      jobListing: 'https://linkedin.com/jobs/123' 
    });
    const newJob = { 
      companyName: 'Different Name',
      position: 'Different Position',
      jobListing: 'https://linkedin.com/jobs/123' 
    };
    
    const result = detectDuplicate(newJob, [existing]);
    expect(result.isDuplicate).toBe(true);
    expect(result.confidence).toBe(1);
    expect(result.reason).toBe('Same job listing URL');
  });

  it('should detect duplicate by company and position', () => {
    const existing = createJob({ 
      id: 'existing',
      companyName: 'Google Inc',
      position: 'Frontend Developer',
    });
    const newJob = { 
      companyName: 'Google',
      position: 'Front-end Developer',
    };
    
    const result = detectDuplicate(newJob, [existing]);
    expect(result.isDuplicate).toBe(true);
    expect(result.confidence).toBe(0.85);
  });

  it('should have higher confidence with location match', () => {
    const existing = createJob({ 
      id: 'existing',
      companyName: 'Google',
      position: 'Frontend Developer',
      location: 'Remote',
    });
    const newJob = { 
      companyName: 'Google',
      position: 'Frontend Developer',
      location: 'Remote - US',
    };
    
    const result = detectDuplicate(newJob, [existing]);
    expect(result.isDuplicate).toBe(true);
    expect(result.confidence).toBe(0.95);
  });

  it('should not flag different jobs as duplicates', () => {
    const existing = createJob({ 
      id: 'existing',
      companyName: 'Google',
      position: 'Frontend Developer',
    });
    const newJob = { 
      companyName: 'Apple',
      position: 'Backend Engineer',
    };
    
    const result = detectDuplicate(newJob, [existing]);
    expect(result.isDuplicate).toBe(false);
    expect(result.confidence).toBe(0);
  });

  it('should warn about possible duplicates', () => {
    const existing = createJob({ 
      id: 'existing',
      companyName: 'Google',
      position: 'Senior Frontend Developer',
      location: 'New York',
    });
    const newJob = { 
      companyName: 'Google',
      position: 'Frontend Engineer', // Similar but not exact
      location: 'New York',
    };
    
    const result = detectDuplicate(newJob, [existing]);
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.reason).toContain('possible duplicate');
  });
});

describe('findAllDuplicates', () => {
  const createJob = (id: string, overrides: Partial<Job> = {}): Job => ({
    id,
    companyName: 'Test Company',
    position: 'Frontend Developer',
    platform: 'linkedin',
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  it('should return empty map for no duplicates', () => {
    const jobs = [
      createJob('1', { companyName: 'Google', position: 'Frontend Developer' }),
      createJob('2', { companyName: 'Apple', position: 'Backend Engineer' }),
      createJob('3', { companyName: 'Microsoft', position: 'Product Manager' }),
    ];
    
    const result = findAllDuplicates(jobs);
    expect(result.size).toBe(0);
  });

  it('should find duplicate groups', () => {
    const jobs = [
      createJob('1', { companyName: 'Google', position: 'Frontend Developer' }),
      createJob('2', { companyName: 'Google Inc', position: 'Frontend Developer' }),
      createJob('3', { companyName: 'Apple', position: 'Backend Engineer' }),
    ];
    
    const result = findAllDuplicates(jobs);
    expect(result.size).toBe(1);
    expect(result.get('1')).toContain('1');
    expect(result.get('1')).toContain('2');
  });

  it('should handle multiple duplicate groups', () => {
    const jobs = [
      createJob('1', { companyName: 'Google', position: 'Frontend Developer' }),
      createJob('2', { companyName: 'Google', position: 'Frontend Developer' }),
      createJob('3', { companyName: 'Apple', position: 'Backend Engineer' }),
      createJob('4', { companyName: 'Apple Inc', position: 'Backend Engineer' }),
    ];
    
    const result = findAllDuplicates(jobs);
    expect(result.size).toBe(2);
  });

  it('should return empty map for single job', () => {
    const jobs = [createJob('1')];
    const result = findAllDuplicates(jobs);
    expect(result.size).toBe(0);
  });

  it('should return empty map for empty array', () => {
    const result = findAllDuplicates([]);
    expect(result.size).toBe(0);
  });
});
