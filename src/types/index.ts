// Job application status
export type JobStatus = 'pending' | 'callback' | 'replied' | 'rejected' | 'interviewing' | 'offer';

// Platform where job was found
export type Platform = 
  | 'indeed' 
  | 'linkedin' 
  | 'glassdoor' 
  | 'ziprecruiter' 
  | 'monster' 
  | 'whatsapp' 
  | 'email' 
  | 'direct' 
  | 'referral'
  | string; // Allow custom platforms

// Job application interface
export interface Job {
  id: string;
  companyName: string;
  position: string;
  website?: string;
  jobListing?: string;
  salary?: string;
  location?: string;
  email?: string;
  phone?: string;
  contactName?: string; // HR/recruiter name
  jobPostDate?: string;
  appliedDate?: string;
  platform: Platform;
  status: JobStatus;
  notes?: string;
  tags?: string[]; // Custom labels (e.g., "dream job", "backup")
  createdAt: string;
  updatedAt?: string; // Last modification timestamp
  fitScore?: number; // 0-100 score based on user preferences
  followUpDate?: string; // When follow-up was marked done
  interviewDate?: string; // Scheduled interview date
  interviewNotes?: string; // Interview preparation/notes
}

// Job form data (for creating/editing)
export interface JobFormData {
  companyName: string;
  position: string;
  website?: string;
  jobListing?: string;
  salary?: string;
  location?: string;
  email?: string;
  phone?: string;
  contactName?: string;
  jobPostDate?: string;
  appliedDate?: string;
  platform: Platform;
  status: JobStatus;
  notes?: string;
  tags?: string[];
  interviewDate?: string;
  interviewNotes?: string;
}

// Authenticated user
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// User preferences for fit scoring
export interface UserPreferences {
  preferredLocations: string[]; // e.g., ['Remote', 'New York', 'San Francisco']
  preferredRoles: string[]; // e.g., ['Frontend Developer', 'Full Stack Engineer']
  minSalary?: number; // Minimum acceptable salary
  maxSalary?: number; // Maximum expected salary (for realistic expectations)
  preferredPlatforms: Platform[]; // Platforms user trusts more
  excludeCompanies: string[]; // Companies to avoid
  keywords: string[]; // Important keywords to look for in position/notes
}

// Fit score result
export interface FitScore {
  score: number; // 0-100
  breakdown: {
    locationMatch: number; // 0-25
    roleMatch: number; // 0-25
    salaryMatch: number; // 0-25
    platformMatch: number; // 0-15
    keywordMatch: number; // 0-10
  };
  warnings: string[]; // e.g., ['Company is in exclude list']
  recommendations: string[]; // e.g., ['Salary below your minimum']
}

// Duplicate detection result
export interface DuplicateResult {
  isDuplicate: boolean;
  confidence: number; // 0-1
  matchedJobId?: string;
  matchedFields: {
    company: boolean;
    position: boolean;
    location: boolean;
    jobListing: boolean;
  };
  reason?: string;
}

// Stats for dashboard
export interface JobStats {
  total: number;
  pending: number;
  callback: number;
  interviewing: number;
  rejected: number;
  offer: number;
}

// Filter options
export interface FilterOptions {
  search: string;
  status: JobStatus | 'all';
  platform: Platform | 'all';
}

// Navigation tabs
export type NavTab = 'dashboard' | 'jobs' | 'insights' | 'settings' | 'details' | 'profile' | 'mission' | 'scraping-settings' | 'suggested-details';

// AI Provider options
export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'grok';

// User profile (stored at users/{userId}/profile)
export interface UserProfile {
  // Basic info
  name: string;
  email: string;
  phone?: string;
  location?: string;
  
  // Professional info
  profession?: string; // e.g., "Software Engineer", "Data Analyst"
  skills: string[];
  experienceSummary?: string;
  cvUrl?: string; // Base64 or URL to uploaded CV
  cvText?: string; // Extracted text from CV for parsing
  portfolioUrl?: string;
  githubUrl?: string;
  
  // Job preferences
  targetSalaryMin?: number;
  targetSalaryMax?: number;
  preferredLocations: string[];
  
  // Scraping configuration
  scrapingKeywords?: string[]; // Separate from skills for search
  preferredPlatforms?: string[]; // Platforms to scrape from
  
  // AI configuration
  aiProvider: AIProvider;
  
  // App state
  onboardingComplete: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Default profile for new users
export const DEFAULT_PROFILE: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
  name: '',
  email: '',
  phone: '',
  location: '',
  profession: '',
  skills: [],
  experienceSummary: '',
  cvUrl: '',
  cvText: '',
  portfolioUrl: '',
  githubUrl: '',
  targetSalaryMin: undefined,
  targetSalaryMax: undefined,
  preferredLocations: [],
  scrapingKeywords: [],
  preferredPlatforms: [],
  aiProvider: 'gemini',
  onboardingComplete: false,
};

// Daily goal and streak tracking
export interface DailyGoal {
  id: string;
  userId: string;
  targetApplications: number;
  currentApplications: number;
  date: string; // YYYY-MM-DD format
  completed: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD format
}

export interface GoalHistory {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  targetApplications: number;
  actualApplications: number;
  completed: boolean;
  streakAtCompletion: number;
}

// Suggested job from scraping
export interface SuggestedJob {
  id: string;
  // Basic info
  companyName: string;
  position: string;
  jobListing: string; // URL to original listing
  description?: string;
  salary?: string;
  location?: string;
  
  // Source info
  platform: Platform;
  jobPostDate?: string;
  fetchedAt: string; // When we scraped it
  
  // Matching info
  skills?: string[];
  fitScore?: number;
  
  // User actions
  dismissed: boolean;
  applied: boolean; // If user marked as applied
  appliedJobId?: string; // Link to actual applied job if converted
  
  // Raw data for reference
  rawData?: Record<string, unknown>;
}

// Scraping settings per user
export interface ScrapingSettings {
  id: string;
  userId: string;
  
  // Target platforms
  platforms: string[];
  
  // Search parameters
  keywords: string[]; // Combined from profile + manual additions
  locations: string[]; // Support multiple locations
  remoteOnly?: boolean;
  
  // Filters
  minSalary?: number;
  maxSalary?: number;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'all';
  
  // Authentication (stored separately for security)
  // Cookie tokens stored encrypted in localStorage
  loginSessions?: {
    linkedin?: string;
    naukri?: string;
    naukrigulf?: string;
    [key: string]: string | undefined;
  };
  
  // Refresh settings
  lastRefreshAt?: string;
  autoRefresh: boolean;
  
  // Created/updated
  createdAt: string;
  updatedAt: string;
}
