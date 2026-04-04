# Apify Scraping Integration — Predefined Options Implementation Guide

> Step-by-step guide to replace free-text inputs with curated, developer-controlled predefined lists for job scraping.  
> This gives better results, consistent queries, and a cleaner UX.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Step 1: Create Predefined Options Constants](#step-1-create-predefined-options-constants)
3. [Step 2: Update TypeScript Types](#step-2-update-typescript-types)
4. [Step 3: Create Reusable ChipSelector Component](#step-3-create-reusable-chipselector-component)
5. [Step 4: Update Scraping Service (Apify Integration)](#step-4-update-scraping-service)
6. [Step 5: Update ScrapingSettingsPage UI](#step-5-update-scrapingsettingspage-ui)
7. [Step 6: Update Firebase Defaults](#step-6-update-firebase-defaults)
8. [How Apify Actors Are Called](#how-apify-actors-are-called)
9. [Predefined Lists Reference](#predefined-lists-reference)
10. [Tips for Better Results](#tips-for-better-results)

---

## 1. Architecture Overview

```
User selects from predefined lists (UI)
        ↓
ScrapingSettings saved to Firestore
        ↓
scraping.ts reads settings
        ↓
Builds platform-specific Apify inputs:
  • LinkedIn → search URLs with filter params (f_E, f_JT, f_WT, f_TPR)
  • Indeed → structured input (postedDays, remoteFilter, jobType)
        ↓
Calls Apify REST API → Runs Actor → Polls for completion → Gets dataset
        ↓
Transforms raw data → SuggestedJob[] → Saved to Firestore
```

**Key principle:** Users ONLY select from predefined lists. The developer controls what options exist. Each option's `value` maps directly to Apify actor parameters.

**Apify connection method:** REST API via `fetch()` from the browser. No npm package needed.  
- Base URL: `https://api.apify.com/v2`
- Auth: `Authorization: Bearer <APIFY_TOKEN>` header
- Run actor: `POST /acts/{actorId}/runs`
- Poll status: `GET /actor-runs/{runId}`
- Get results: `GET /datasets/{datasetId}/items`

---

## Step 1: Create Predefined Options Constants

Create `src/constants/scrapingOptions.ts` — this is the single source of truth for all selectable options.

```typescript
// src/constants/scrapingOptions.ts

// ============================================
// TYPES
// ============================================

export interface ScrapingOption {
  value: string;
  label: string;
  category?: string;
}

// ============================================
// JOB ROLES — What position is the user looking for?
// ============================================

export const JOB_ROLES: ScrapingOption[] = [
  // Software Engineering
  { value: 'frontend-developer', label: 'Frontend Developer', category: 'Engineering' },
  { value: 'backend-developer', label: 'Backend Developer', category: 'Engineering' },
  { value: 'full-stack-developer', label: 'Full Stack Developer', category: 'Engineering' },
  { value: 'software-engineer', label: 'Software Engineer', category: 'Engineering' },
  { value: 'software-developer', label: 'Software Developer', category: 'Engineering' },
  { value: 'mobile-developer', label: 'Mobile Developer', category: 'Engineering' },
  { value: 'android-developer', label: 'Android Developer', category: 'Engineering' },
  { value: 'ios-developer', label: 'iOS Developer', category: 'Engineering' },
  { value: 'embedded-engineer', label: 'Embedded Software Engineer', category: 'Engineering' },
  { value: 'qa-engineer', label: 'QA / Test Engineer', category: 'Engineering' },
  { value: 'test-automation-engineer', label: 'Test Automation Engineer', category: 'Engineering' },
  { value: 'game-developer', label: 'Game Developer', category: 'Engineering' },
  { value: 'blockchain-developer', label: 'Blockchain Developer', category: 'Engineering' },

  // DevOps & Infrastructure
  { value: 'devops-engineer', label: 'DevOps Engineer', category: 'DevOps & Cloud' },
  { value: 'cloud-engineer', label: 'Cloud Engineer', category: 'DevOps & Cloud' },
  { value: 'site-reliability-engineer', label: 'Site Reliability Engineer (SRE)', category: 'DevOps & Cloud' },
  { value: 'cloud-architect', label: 'Cloud Architect', category: 'DevOps & Cloud' },
  { value: 'solutions-architect', label: 'Solutions Architect', category: 'DevOps & Cloud' },
  { value: 'system-administrator', label: 'System Administrator', category: 'DevOps & Cloud' },
  { value: 'network-engineer', label: 'Network Engineer', category: 'DevOps & Cloud' },
  { value: 'database-administrator', label: 'Database Administrator', category: 'DevOps & Cloud' },
  { value: 'platform-engineer', label: 'Platform Engineer', category: 'DevOps & Cloud' },

  // Data & AI
  { value: 'data-scientist', label: 'Data Scientist', category: 'Data & AI' },
  { value: 'data-analyst', label: 'Data Analyst', category: 'Data & AI' },
  { value: 'data-engineer', label: 'Data Engineer', category: 'Data & AI' },
  { value: 'machine-learning-engineer', label: 'Machine Learning Engineer', category: 'Data & AI' },
  { value: 'ai-engineer', label: 'AI Engineer', category: 'Data & AI' },
  { value: 'nlp-engineer', label: 'NLP Engineer', category: 'Data & AI' },
  { value: 'computer-vision-engineer', label: 'Computer Vision Engineer', category: 'Data & AI' },
  { value: 'bi-analyst', label: 'Business Intelligence Analyst', category: 'Data & AI' },
  { value: 'ai-researcher', label: 'AI/ML Researcher', category: 'Data & AI' },

  // Design
  { value: 'ui-ux-designer', label: 'UI/UX Designer', category: 'Design' },
  { value: 'product-designer', label: 'Product Designer', category: 'Design' },
  { value: 'graphic-designer', label: 'Graphic Designer', category: 'Design' },
  { value: 'visual-designer', label: 'Visual Designer', category: 'Design' },
  { value: 'ux-researcher', label: 'UX Researcher', category: 'Design' },
  { value: 'interaction-designer', label: 'Interaction Designer', category: 'Design' },
  { value: 'motion-designer', label: 'Motion Designer', category: 'Design' },

  // Product & Management
  { value: 'product-manager', label: 'Product Manager', category: 'Product & Management' },
  { value: 'technical-program-manager', label: 'Technical Program Manager', category: 'Product & Management' },
  { value: 'engineering-manager', label: 'Engineering Manager', category: 'Product & Management' },
  { value: 'scrum-master', label: 'Scrum Master', category: 'Product & Management' },
  { value: 'project-manager', label: 'Project Manager', category: 'Product & Management' },
  { value: 'technical-lead', label: 'Technical Lead', category: 'Product & Management' },
  { value: 'cto', label: 'CTO / VP Engineering', category: 'Product & Management' },

  // Cybersecurity
  { value: 'security-engineer', label: 'Security Engineer', category: 'Cybersecurity' },
  { value: 'security-analyst', label: 'Security Analyst', category: 'Cybersecurity' },
  { value: 'penetration-tester', label: 'Penetration Tester', category: 'Cybersecurity' },
  { value: 'soc-analyst', label: 'SOC Analyst', category: 'Cybersecurity' },

  // Other
  { value: 'technical-writer', label: 'Technical Writer', category: 'Other' },
  { value: 'developer-advocate', label: 'Developer Advocate / DevRel', category: 'Other' },
  { value: 'it-support', label: 'IT Support / Help Desk', category: 'Other' },
  { value: 'business-analyst', label: 'Business Analyst', category: 'Other' },
  { value: 'salesforce-developer', label: 'Salesforce Developer', category: 'Other' },
  { value: 'sap-consultant', label: 'SAP Consultant', category: 'Other' },
];

// ============================================
// TECH STACK / SKILL KEYWORDS
// ============================================

export const TECH_KEYWORDS: ScrapingOption[] = [
  // Languages
  { value: 'javascript', label: 'JavaScript', category: 'Languages' },
  { value: 'typescript', label: 'TypeScript', category: 'Languages' },
  { value: 'python', label: 'Python', category: 'Languages' },
  { value: 'java', label: 'Java', category: 'Languages' },
  { value: 'csharp', label: 'C#', category: 'Languages' },
  { value: 'cpp', label: 'C++', category: 'Languages' },
  { value: 'golang', label: 'Go', category: 'Languages' },
  { value: 'rust', label: 'Rust', category: 'Languages' },
  { value: 'ruby', label: 'Ruby', category: 'Languages' },
  { value: 'php', label: 'PHP', category: 'Languages' },
  { value: 'swift', label: 'Swift', category: 'Languages' },
  { value: 'kotlin', label: 'Kotlin', category: 'Languages' },
  { value: 'scala', label: 'Scala', category: 'Languages' },
  { value: 'r-lang', label: 'R', category: 'Languages' },
  { value: 'dart', label: 'Dart', category: 'Languages' },

  // Frontend
  { value: 'react', label: 'React', category: 'Frontend' },
  { value: 'angular', label: 'Angular', category: 'Frontend' },
  { value: 'vuejs', label: 'Vue.js', category: 'Frontend' },
  { value: 'nextjs', label: 'Next.js', category: 'Frontend' },
  { value: 'svelte', label: 'Svelte', category: 'Frontend' },
  { value: 'tailwind', label: 'Tailwind CSS', category: 'Frontend' },
  { value: 'html-css', label: 'HTML/CSS', category: 'Frontend' },
  { value: 'sass', label: 'SASS/SCSS', category: 'Frontend' },
  { value: 'webgl-threejs', label: 'WebGL / Three.js', category: 'Frontend' },

  // Backend
  { value: 'nodejs', label: 'Node.js', category: 'Backend' },
  { value: 'expressjs', label: 'Express.js', category: 'Backend' },
  { value: 'django', label: 'Django', category: 'Backend' },
  { value: 'flask', label: 'Flask', category: 'Backend' },
  { value: 'fastapi', label: 'FastAPI', category: 'Backend' },
  { value: 'spring-boot', label: 'Spring Boot', category: 'Backend' },
  { value: 'dotnet', label: '.NET', category: 'Backend' },
  { value: 'laravel', label: 'Laravel', category: 'Backend' },
  { value: 'rails', label: 'Ruby on Rails', category: 'Backend' },
  { value: 'graphql', label: 'GraphQL', category: 'Backend' },
  { value: 'rest-api', label: 'REST API', category: 'Backend' },
  { value: 'nestjs', label: 'NestJS', category: 'Backend' },

  // Mobile
  { value: 'react-native', label: 'React Native', category: 'Mobile' },
  { value: 'flutter', label: 'Flutter', category: 'Mobile' },
  { value: 'swiftui', label: 'SwiftUI', category: 'Mobile' },
  { value: 'jetpack-compose', label: 'Jetpack Compose', category: 'Mobile' },

  // Database
  { value: 'postgresql', label: 'PostgreSQL', category: 'Database' },
  { value: 'mysql', label: 'MySQL', category: 'Database' },
  { value: 'mongodb', label: 'MongoDB', category: 'Database' },
  { value: 'redis', label: 'Redis', category: 'Database' },
  { value: 'elasticsearch', label: 'Elasticsearch', category: 'Database' },
  { value: 'dynamodb', label: 'DynamoDB', category: 'Database' },
  { value: 'firebase-db', label: 'Firebase / Firestore', category: 'Database' },
  { value: 'supabase', label: 'Supabase', category: 'Database' },
  { value: 'sqlite', label: 'SQLite', category: 'Database' },

  // Cloud & DevOps
  { value: 'aws', label: 'AWS', category: 'Cloud & DevOps' },
  { value: 'azure', label: 'Azure', category: 'Cloud & DevOps' },
  { value: 'gcp', label: 'Google Cloud', category: 'Cloud & DevOps' },
  { value: 'docker', label: 'Docker', category: 'Cloud & DevOps' },
  { value: 'kubernetes', label: 'Kubernetes', category: 'Cloud & DevOps' },
  { value: 'terraform', label: 'Terraform', category: 'Cloud & DevOps' },
  { value: 'cicd', label: 'CI/CD', category: 'Cloud & DevOps' },
  { value: 'github-actions', label: 'GitHub Actions', category: 'Cloud & DevOps' },
  { value: 'jenkins', label: 'Jenkins', category: 'Cloud & DevOps' },
  { value: 'ansible', label: 'Ansible', category: 'Cloud & DevOps' },
  { value: 'linux', label: 'Linux', category: 'Cloud & DevOps' },

  // AI / ML
  { value: 'tensorflow', label: 'TensorFlow', category: 'AI & ML' },
  { value: 'pytorch', label: 'PyTorch', category: 'AI & ML' },
  { value: 'scikit-learn', label: 'Scikit-learn', category: 'AI & ML' },
  { value: 'openai-api', label: 'OpenAI API', category: 'AI & ML' },
  { value: 'langchain', label: 'LangChain', category: 'AI & ML' },
  { value: 'huggingface', label: 'Hugging Face', category: 'AI & ML' },
  { value: 'llm', label: 'LLM / GenAI', category: 'AI & ML' },

  // Data Tools
  { value: 'spark', label: 'Apache Spark', category: 'Data Tools' },
  { value: 'kafka', label: 'Kafka', category: 'Data Tools' },
  { value: 'airflow', label: 'Airflow', category: 'Data Tools' },
  { value: 'dbt', label: 'dbt', category: 'Data Tools' },
  { value: 'tableau', label: 'Tableau', category: 'Data Tools' },
  { value: 'power-bi', label: 'Power BI', category: 'Data Tools' },
  { value: 'snowflake', label: 'Snowflake', category: 'Data Tools' },
  { value: 'bigquery', label: 'BigQuery', category: 'Data Tools' },
];

// ============================================
// LOCATIONS
// ============================================

export const LOCATIONS: ScrapingOption[] = [
  // Global Remote
  { value: 'remote-worldwide', label: 'Remote (Worldwide)', category: 'Global' },
  { value: 'remote-anywhere', label: 'Remote (Anywhere)', category: 'Global' },

  // United States
  { value: 'remote-us', label: 'Remote (US)', category: 'United States' },
  { value: 'new-york', label: 'New York, NY', category: 'United States' },
  { value: 'san-francisco', label: 'San Francisco, CA', category: 'United States' },
  { value: 'san-jose', label: 'San Jose, CA', category: 'United States' },
  { value: 'los-angeles', label: 'Los Angeles, CA', category: 'United States' },
  { value: 'seattle', label: 'Seattle, WA', category: 'United States' },
  { value: 'austin', label: 'Austin, TX', category: 'United States' },
  { value: 'dallas', label: 'Dallas, TX', category: 'United States' },
  { value: 'boston', label: 'Boston, MA', category: 'United States' },
  { value: 'chicago', label: 'Chicago, IL', category: 'United States' },
  { value: 'denver', label: 'Denver, CO', category: 'United States' },
  { value: 'atlanta', label: 'Atlanta, GA', category: 'United States' },
  { value: 'washington-dc', label: 'Washington, DC', category: 'United States' },
  { value: 'raleigh', label: 'Raleigh, NC', category: 'United States' },
  { value: 'miami', label: 'Miami, FL', category: 'United States' },
  { value: 'portland', label: 'Portland, OR', category: 'United States' },
  { value: 'phoenix', label: 'Phoenix, AZ', category: 'United States' },
  { value: 'minneapolis', label: 'Minneapolis, MN', category: 'United States' },

  // India
  { value: 'remote-india', label: 'Remote (India)', category: 'India' },
  { value: 'bangalore', label: 'Bangalore', category: 'India' },
  { value: 'hyderabad', label: 'Hyderabad', category: 'India' },
  { value: 'mumbai', label: 'Mumbai', category: 'India' },
  { value: 'pune', label: 'Pune', category: 'India' },
  { value: 'chennai', label: 'Chennai', category: 'India' },
  { value: 'delhi-ncr', label: 'Delhi / NCR', category: 'India' },
  { value: 'gurgaon', label: 'Gurgaon', category: 'India' },
  { value: 'noida', label: 'Noida', category: 'India' },
  { value: 'kolkata', label: 'Kolkata', category: 'India' },
  { value: 'ahmedabad', label: 'Ahmedabad', category: 'India' },
  { value: 'kochi', label: 'Kochi', category: 'India' },
  { value: 'jaipur', label: 'Jaipur', category: 'India' },
  { value: 'chandigarh', label: 'Chandigarh', category: 'India' },
  { value: 'coimbatore', label: 'Coimbatore', category: 'India' },
  { value: 'indore', label: 'Indore', category: 'India' },

  // United Kingdom
  { value: 'remote-uk', label: 'Remote (UK)', category: 'United Kingdom' },
  { value: 'london', label: 'London', category: 'United Kingdom' },
  { value: 'manchester', label: 'Manchester', category: 'United Kingdom' },
  { value: 'birmingham', label: 'Birmingham', category: 'United Kingdom' },
  { value: 'edinburgh', label: 'Edinburgh', category: 'United Kingdom' },
  { value: 'bristol', label: 'Bristol', category: 'United Kingdom' },
  { value: 'cambridge', label: 'Cambridge', category: 'United Kingdom' },
  { value: 'leeds', label: 'Leeds', category: 'United Kingdom' },

  // Europe
  { value: 'remote-europe', label: 'Remote (Europe)', category: 'Europe' },
  { value: 'berlin', label: 'Berlin', category: 'Europe' },
  { value: 'amsterdam', label: 'Amsterdam', category: 'Europe' },
  { value: 'dublin', label: 'Dublin', category: 'Europe' },
  { value: 'paris', label: 'Paris', category: 'Europe' },
  { value: 'munich', label: 'Munich', category: 'Europe' },
  { value: 'stockholm', label: 'Stockholm', category: 'Europe' },
  { value: 'zurich', label: 'Zurich', category: 'Europe' },
  { value: 'barcelona', label: 'Barcelona', category: 'Europe' },
  { value: 'lisbon', label: 'Lisbon', category: 'Europe' },

  // Canada
  { value: 'remote-canada', label: 'Remote (Canada)', category: 'Canada' },
  { value: 'toronto', label: 'Toronto', category: 'Canada' },
  { value: 'vancouver', label: 'Vancouver', category: 'Canada' },
  { value: 'montreal', label: 'Montreal', category: 'Canada' },
  { value: 'ottawa', label: 'Ottawa', category: 'Canada' },

  // Middle East
  { value: 'remote-middle-east', label: 'Remote (Middle East)', category: 'Middle East' },
  { value: 'dubai', label: 'Dubai', category: 'Middle East' },
  { value: 'abu-dhabi', label: 'Abu Dhabi', category: 'Middle East' },
  { value: 'riyadh', label: 'Riyadh', category: 'Middle East' },
  { value: 'doha', label: 'Doha', category: 'Middle East' },

  // Asia Pacific
  { value: 'remote-apac', label: 'Remote (APAC)', category: 'Asia Pacific' },
  { value: 'singapore', label: 'Singapore', category: 'Asia Pacific' },
  { value: 'tokyo', label: 'Tokyo', category: 'Asia Pacific' },
  { value: 'sydney', label: 'Sydney', category: 'Asia Pacific' },
  { value: 'melbourne', label: 'Melbourne', category: 'Asia Pacific' },
  { value: 'hong-kong', label: 'Hong Kong', category: 'Asia Pacific' },
];

// ============================================
// EXPERIENCE LEVELS
// ============================================

export const EXPERIENCE_LEVELS: ScrapingOption[] = [
  { value: 'internship', label: 'Internship / Trainee' },
  { value: 'entry', label: 'Entry Level (0-1 years)' },
  { value: 'junior', label: 'Junior (1-3 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior (5-8 years)' },
  { value: 'lead', label: 'Lead / Staff (8-12 years)' },
  { value: 'principal', label: 'Principal / Architect (12+ years)' },
];

// ============================================
// JOB TYPES
// ============================================

export const JOB_TYPES: ScrapingOption[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance / Consulting' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' },
];

// ============================================
// WORK ARRANGEMENT
// ============================================

export const WORK_ARRANGEMENTS: ScrapingOption[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

// ============================================
// POSTED WITHIN (time filter)
// ============================================

export const POSTED_WITHIN: ScrapingOption[] = [
  { value: '1', label: 'Last 24 hours' },
  { value: '3', label: 'Last 3 days' },
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: 'any', label: 'Any time' },
];

// ============================================
// MAPPING: Our values → LinkedIn URL filter params
// ============================================

// LinkedIn experience level: f_E param
export const LINKEDIN_EXPERIENCE_MAP: Record<string, string> = {
  'internship': '1',
  'entry': '2',
  'junior': '3',   // Associate
  'mid': '4',       // Mid-Senior level
  'senior': '4',    // Mid-Senior level
  'lead': '5',      // Director
  'principal': '6', // Executive
};

// LinkedIn job type: f_JT param
export const LINKEDIN_JOB_TYPE_MAP: Record<string, string> = {
  'full-time': 'F',
  'part-time': 'P',
  'contract': 'C',
  'internship': 'I',
  'temporary': 'T',
  'freelance': 'O', // Other
};

// LinkedIn work arrangement: f_WT param
export const LINKEDIN_WORK_TYPE_MAP: Record<string, string> = {
  'onsite': '1',
  'remote': '2',
  'hybrid': '3',
};

// LinkedIn posted within: f_TPR param (seconds)
export const LINKEDIN_POSTED_MAP: Record<string, string> = {
  '1': 'r86400',      // 24 hours
  '3': 'r259200',     // 3 days
  '7': 'r604800',     // 7 days
  '14': 'r1209600',   // 14 days
};

// Indeed posted within: postedDays param
export const INDEED_POSTED_MAP: Record<string, number> = {
  '1': 1,
  '3': 3,
  '7': 7,
  '14': 14,
};

// Indeed job type: jobType param
export const INDEED_JOB_TYPE_MAP: Record<string, string> = {
  'full-time': 'fulltime',
  'part-time': 'parttime',
  'contract': 'contract',
  'internship': 'internship',
  'temporary': 'temporary',
};

// ============================================
// HELPER: Get label by value from any list
// ============================================

export function getOptionLabel(options: ScrapingOption[], value: string): string {
  return options.find(o => o.value === value)?.label ?? value;
}

// HELPER: Get display-friendly location string from value
export function getLocationDisplayName(value: string): string {
  return getOptionLabel(LOCATIONS, value);
}

// HELPER: Get search-friendly keyword from role value
export function getRoleSearchTerm(value: string): string {
  return getOptionLabel(JOB_ROLES, value);
}

// HELPER: Get search-friendly keyword from tech value
export function getTechSearchTerm(value: string): string {
  return getOptionLabel(TECH_KEYWORDS, value);
}

// HELPER: Group options by category
export function groupByCategory(options: ScrapingOption[]): Record<string, ScrapingOption[]> {
  return options.reduce((acc, option) => {
    const category = option.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(option);
    return acc;
  }, {} as Record<string, ScrapingOption[]>);
}
```

---

## Step 2: Update TypeScript Types

Edit `src/types/index.ts` — update the `ScrapingSettings` interface:

```typescript
// In src/types/index.ts — REPLACE the existing ScrapingSettings interface

export interface ScrapingSettings {
  id: string;
  userId: string;

  // Target platforms (selected from predefined list)
  platforms: string[];

  // Search parameters (from predefined lists)
  keywords: string[];     // Selected role values from JOB_ROLES
  techKeywords: string[]; // Selected values from TECH_KEYWORDS (NEW)
  locations: string[];    // Selected values from LOCATIONS

  // Filters (NEW — all from predefined lists)
  experienceLevels: string[];   // Multi-select from EXPERIENCE_LEVELS
  jobTypes: string[];           // Multi-select from JOB_TYPES
  workArrangements: string[];   // Multi-select from WORK_ARRANGEMENTS
  postedWithin: string;         // Single-select from POSTED_WITHIN ('any' default)

  // Legacy — keep for backward compat
  remoteOnly?: boolean;

  // Salary range (optional)
  minSalary?: number;
  maxSalary?: number;

  // Authentication
  loginSessions?: {
    linkedin?: string;
    naukri?: string;
    naukrigulf?: string;
    [key: string]: string | undefined;
  };

  // Refresh settings
  lastRefreshAt?: string;
  autoRefresh: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

---

## Step 3: Create Reusable ChipSelector Component

Create `src/components/ui/chip-selector.tsx`:

```tsx
// src/components/ui/chip-selector.tsx

import { useState, useMemo } from 'react';
import { Badge } from './badge';
import { Input } from './input';
import type { ScrapingOption } from '../../constants/scrapingOptions';
import { groupByCategory } from '../../constants/scrapingOptions';

interface ChipSelectorProps {
  options: ScrapingOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
  description?: string;
  maxVisible?: number;      // How many chips to show before "Show more"
  searchable?: boolean;     // Enable search/filter
  grouped?: boolean;        // Group by category
  singleSelect?: boolean;   // Only allow one selection
  disabled?: boolean;
  showCustomInput?: boolean; // Allow adding custom values
  onAddCustom?: (value: string) => void;
}

export function ChipSelector({
  options,
  selected,
  onChange,
  label,
  description,
  maxVisible = 20,
  searchable = false,
  grouped = false,
  singleSelect = false,
  disabled = false,
  showCustomInput = false,
  onAddCustom,
}: ChipSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(
      o => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [options, searchQuery]);

  // Determine visible options
  const visibleOptions = expanded ? filteredOptions : filteredOptions.slice(0, maxVisible);
  const hasMore = filteredOptions.length > maxVisible;

  const toggleOption = (value: string) => {
    if (disabled) return;
    if (singleSelect) {
      onChange(selected.includes(value) ? [] : [value]);
    } else {
      onChange(
        selected.includes(value)
          ? selected.filter(v => v !== value)
          : [...selected, value]
      );
    }
  };

  const handleAddCustom = () => {
    const trimmed = customValue.trim();
    if (!trimmed || selected.includes(trimmed)) return;
    onAddCustom?.(trimmed);
    setCustomValue('');
  };

  // Render chips (grouped or flat)
  const renderChips = () => {
    if (grouped) {
      const groups = groupByCategory(visibleOptions);
      return Object.entries(groups).map(([category, items]) => (
        <div key={category} className="mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            {category}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {items.map(option => (
              <Badge
                key={option.value}
                variant={selected.includes(option.value) ? 'default' : 'outline'}
                className={`cursor-pointer px-2.5 py-1 text-xs transition-all ${
                  selected.includes(option.value)
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => toggleOption(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
      ));
    }

    return (
      <div className="flex flex-wrap gap-1.5">
        {visibleOptions.map(option => (
          <Badge
            key={option.value}
            variant={selected.includes(option.value) ? 'default' : 'outline'}
            className={`cursor-pointer px-2.5 py-1 text-xs transition-all ${
              selected.includes(option.value)
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => toggleOption(option.value)}
          >
            {option.label}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Search bar */}
      {searchable && (
        <div className="mb-3">
          <Input
            placeholder="Search options..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="text-sm"
          />
        </div>
      )}

      {/* Selected count */}
      {selected.length > 0 && (
        <p className="text-xs text-primary font-medium mb-2">
          {selected.length} selected
        </p>
      )}

      {/* Chips */}
      {renderChips()}

      {/* Show more / less */}
      {hasMore && !searchQuery && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-primary hover:underline"
        >
          {expanded ? 'Show less' : `Show all ${filteredOptions.length} options`}
        </button>
      )}

      {/* Custom input toggle (for power users) */}
      {showCustomInput && (
        <div className="mt-3">
          {!showCustom ? (
            <button
              onClick={() => setShowCustom(true)}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              + Add custom value
            </button>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Custom value..."
                value={customValue}
                onChange={e => setCustomValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
                className="text-sm flex-1"
              />
              <Badge
                variant="outline"
                className="cursor-pointer px-3 py-1"
                onClick={handleAddCustom}
              >
                Add
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Step 4: Update Scraping Service

Edit `src/services/scraping.ts` — the most critical change. This maps your predefined options to actual Apify actor inputs.

### 4a. Add imports and helper functions

Add these at the top of `src/services/scraping.ts`:

```typescript
// Add to the top of src/services/scraping.ts

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
```

### 4b. Add LinkedIn URL builder

This function builds LinkedIn search URLs with all filters embedded as URL parameters. This is how we pass experience level, job type, work arrangement, and posted-within filters to the LinkedIn actor:

```typescript
// Add this function to src/services/scraping.ts

/**
 * Builds LinkedIn Jobs search URL with filters encoded as query parameters.
 * The openclaw/linkedin-jobs-scraper actor accepts these URLs as startUrls.
 *
 * LinkedIn URL filter parameters:
 *   f_E   = experience level (1-6, comma-separated)
 *   f_JT  = job type (F, P, C, I, T, O — comma-separated)
 *   f_WT  = work type (1=On-site, 2=Remote, 3=Hybrid — comma-separated)
 *   f_TPR = time posted range (r86400, r604800, etc.)
 */
function buildLinkedInSearchUrl(
  keywords: string[],
  location: string | undefined,
  settings: ScrapingSettings
): string {
  const params = new URLSearchParams();

  // Keywords
  if (keywords.length > 0) {
    params.set('keywords', keywords.join(' '));
  }

  // Location
  if (location) {
    params.set('location', location);
  }

  // Experience level filter
  if (settings.experienceLevels && settings.experienceLevels.length > 0) {
    const linkedinValues = settings.experienceLevels
      .map(level => LINKEDIN_EXPERIENCE_MAP[level])
      .filter(Boolean);
    if (linkedinValues.length > 0) {
      params.set('f_E', [...new Set(linkedinValues)].join(','));
    }
  }

  // Job type filter
  if (settings.jobTypes && settings.jobTypes.length > 0) {
    const linkedinValues = settings.jobTypes
      .map(type => LINKEDIN_JOB_TYPE_MAP[type])
      .filter(Boolean);
    if (linkedinValues.length > 0) {
      params.set('f_JT', linkedinValues.join(','));
    }
  }

  // Work arrangement filter
  if (settings.workArrangements && settings.workArrangements.length > 0) {
    const linkedinValues = settings.workArrangements
      .map(arr => LINKEDIN_WORK_TYPE_MAP[arr])
      .filter(Boolean);
    if (linkedinValues.length > 0) {
      params.set('f_WT', linkedinValues.join(','));
    }
  }

  // Posted within filter
  if (settings.postedWithin && settings.postedWithin !== 'any') {
    const tpr = LINKEDIN_POSTED_MAP[settings.postedWithin];
    if (tpr) {
      params.set('f_TPR', tpr);
    }
  }

  return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
}
```

### 4c. Update the APIFY_ACTORS config

Replace the existing `APIFY_ACTORS` object to use the new filter-aware input builders:

```typescript
// REPLACE the existing APIFY_ACTORS in src/services/scraping.ts

const APIFY_ACTORS: Record<string, PlatformScraperConfig> = {
  linkedin: {
    actorId: 'openclaw~linkedin-jobs-scraper',
    buildInput: (keywords, location, limit, settings) => {
      // Build a LinkedIn search URL with all filters baked in
      const searchUrl = buildLinkedInSearchUrl(keywords, location, settings);
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

      // Location
      if (location) {
        input.location = location;
      }

      // Posted within
      if (settings?.postedWithin && settings.postedWithin !== 'any') {
        const days = INDEED_POSTED_MAP[settings.postedWithin];
        if (days) input.postedDays = days;
      }

      // Remote filter
      if (settings?.workArrangements?.includes('remote')) {
        input.remoteFilter = 'remote';
      }

      // Job type (Indeed only supports single jobType, take first)
      if (settings?.jobTypes && settings.jobTypes.length > 0) {
        const indeedType = INDEED_JOB_TYPE_MAP[settings.jobTypes[0]];
        if (indeedType) input.jobType = indeedType;
      }

      return input;
    },
  },
};
```

### 4d. Update PlatformScraperConfig type

Update the interface to accept `settings`:

```typescript
// Update this interface in src/services/scraping.ts

interface PlatformScraperConfig {
  actorId: string;
  buildInput: (
    keywords: string[],
    location: string | undefined,
    limit: number,
    settings?: ScrapingSettings
  ) => Record<string, unknown>;
}
```

### 4e. Update `runApifyScraper` to pass settings

```typescript
// Update the function signature and body in src/services/scraping.ts

export async function runApifyScraper(
  userId: string,
  platform: string,
  keywords: string[],
  location?: string,
  limit: number = 20,
  settings?: ScrapingSettings // ADD this parameter
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

  // Pass settings to buildInput so it can use filters
  const response = await fetch(`${APIFY_BASE_URL}/acts/${platformConfig.actorId}/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(platformConfig.buildInput(keywords, location, limit, settings)),
  });

  // ... rest of the function stays the same (polling, dataset fetch, transform)
}
```

### 4f. Update `scrapeAllPlatforms` to build smart keywords

```typescript
// REPLACE scrapeAllPlatforms in src/services/scraping.ts

export async function scrapeAllPlatforms(
  userId: string,
  settings: ScrapingSettings
): Promise<SuggestedJob[]> {
  const allJobs: SuggestedJob[] = [];
  const errors: string[] = [];

  // Build search keywords from: selected roles + tech keywords
  // Convert predefined values back to display names for search
  const roleKeywords = (settings.keywords || []).map(getRoleSearchTerm);
  const techKeywords = (settings.techKeywords || []).map(getTechSearchTerm);

  // Combine: role keywords are primary, tech keywords are secondary
  // Example: ["Frontend Developer", "React", "TypeScript"]
  const searchKeywords = [...roleKeywords, ...techKeywords];

  if (searchKeywords.length === 0) {
    throw new Error('Select at least one job role or tech skill before starting.');
  }

  // Convert location values to display names
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
          settings  // Pass full settings for filter access
        );
        allJobs.push(...jobs);
      } catch (error) {
        errors.push(
          `${platform} (${location || 'any'}): ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  if (allJobs.length === 0 && errors.length > 0) {
    throw new Error(`Scraping failed for all platforms and locations: ${errors.join('; ')}`);
  }

  return allJobs;
}
```

### 4f. Update `refreshSuggestedJobs` remote filtering

```typescript
// Update the remote filtering in refreshSuggestedJobs in src/services/scraping.ts

// Replace the remoteOnly line:
// OLD: const filteredByRemote = settings.remoteOnly ? newJobs.filter(isLikelyRemoteJob) : newJobs;
// NEW: Derive remote filter from workArrangements
const isRemoteOnlyFilter = settings.workArrangements?.length === 1 
  && settings.workArrangements[0] === 'remote';
const filteredByRemote = (settings.remoteOnly || isRemoteOnlyFilter) 
  ? newJobs.filter(isLikelyRemoteJob) 
  : newJobs;
```

---

## Step 5: Update ScrapingSettingsPage UI

Replace the keywords and location sections in `src/components/pages/ScrapingSettingsPage.tsx` with ChipSelector components.

Here's the updated page (key sections shown — replace the corresponding sections):

### 5a. Add imports

```tsx
// Add at the top of ScrapingSettingsPage.tsx

import { ChipSelector } from '../ui/chip-selector';
import {
  JOB_ROLES,
  TECH_KEYWORDS,
  LOCATIONS,
  EXPERIENCE_LEVELS,
  JOB_TYPES,
  WORK_ARRANGEMENTS,
  POSTED_WITHIN,
} from '../../constants/scrapingOptions';
```

### 5b. Replace the Keywords section

Replace the entire `{/* Keywords */}` section (lines ~318-369) with:

```tsx
{/* Job Roles */}
<section className="mb-8">
  <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">
    Job Roles
  </h3>
  <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
    <p className="text-sm text-slate-600 dark:text-light-grey mb-3">
      Select the job roles you're looking for
    </p>
    <ChipSelector
      options={JOB_ROLES}
      selected={settings?.keywords || []}
      onChange={async (selected) => {
        try {
          setIsSaving(true);
          await updateSettings({ keywords: selected });
        } catch {
          toast.error('Failed to update roles');
        } finally {
          setIsSaving(false);
        }
      }}
      searchable
      grouped
      maxVisible={15}
      disabled={isSaving}
    />
  </div>
</section>

{/* Tech Stack */}
<section className="mb-8">
  <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">
    Tech Stack
  </h3>
  <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
    <p className="text-sm text-slate-600 dark:text-light-grey mb-3">
      Select technologies and skills to filter by
    </p>
    <ChipSelector
      options={TECH_KEYWORDS}
      selected={settings?.techKeywords || []}
      onChange={async (selected) => {
        try {
          setIsSaving(true);
          await updateSettings({ techKeywords: selected });
        } catch {
          toast.error('Failed to update tech stack');
        } finally {
          setIsSaving(false);
        }
      }}
      searchable
      grouped
      maxVisible={15}
      disabled={isSaving}
    />
  </div>
</section>
```

### 5c. Replace the Locations section

Replace the entire `{/* Locations */}` section (lines ~372-406) with:

```tsx
{/* Locations */}
<section className="mb-8">
  <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">
    Search Locations
  </h3>
  <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
    <p className="text-sm text-slate-600 dark:text-light-grey mb-3">
      Select target locations for job search
    </p>
    <ChipSelector
      options={LOCATIONS}
      selected={settings?.locations || []}
      onChange={async (selected) => {
        try {
          setIsSaving(true);
          await updateSettings({ locations: selected });
        } catch {
          toast.error('Failed to update locations');
        } finally {
          setIsSaving(false);
        }
      }}
      searchable
      grouped
      maxVisible={10}
      disabled={isSaving}
    />
  </div>
</section>
```

### 5d. Replace the Remote Only toggle with new filter sections

Replace the entire `{/* Remote Only Toggle */}` section and add new sections after Locations:

```tsx
{/* Experience Level */}
<section className="mb-8">
  <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">
    Experience Level
  </h3>
  <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
    <p className="text-sm text-slate-600 dark:text-light-grey mb-3">
      Filter by experience level
    </p>
    <ChipSelector
      options={EXPERIENCE_LEVELS}
      selected={settings?.experienceLevels || []}
      onChange={async (selected) => {
        try {
          setIsSaving(true);
          await updateSettings({ experienceLevels: selected });
        } catch {
          toast.error('Failed to update experience levels');
        } finally {
          setIsSaving(false);
        }
      }}
      disabled={isSaving}
    />
  </div>
</section>

{/* Job Type */}
<section className="mb-8">
  <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">
    Job Type
  </h3>
  <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
    <ChipSelector
      options={JOB_TYPES}
      selected={settings?.jobTypes || []}
      onChange={async (selected) => {
        try {
          setIsSaving(true);
          await updateSettings({ jobTypes: selected });
        } catch {
          toast.error('Failed to update job types');
        } finally {
          setIsSaving(false);
        }
      }}
      disabled={isSaving}
    />
  </div>
</section>

{/* Work Arrangement */}
<section className="mb-8">
  <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">
    Work Arrangement
  </h3>
  <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
    <ChipSelector
      options={WORK_ARRANGEMENTS}
      selected={settings?.workArrangements || []}
      onChange={async (selected) => {
        try {
          setIsSaving(true);
          await updateSettings({ workArrangements: selected });
        } catch {
          toast.error('Failed to update work arrangement');
        } finally {
          setIsSaving(false);
        }
      }}
      disabled={isSaving}
    />
  </div>
</section>

{/* Posted Within */}
<section className="mb-8">
  <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">
    Posted Within
  </h3>
  <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
    <ChipSelector
      options={POSTED_WITHIN}
      selected={settings?.postedWithin ? [settings.postedWithin] : ['any']}
      onChange={async (selected) => {
        try {
          setIsSaving(true);
          await updateSettings({ postedWithin: selected[0] || 'any' });
        } catch {
          toast.error('Failed to update time filter');
        } finally {
          setIsSaving(false);
        }
      }}
      singleSelect
      disabled={isSaving}
    />
  </div>
</section>
```

### 5e. Update the handleRefreshJobs function

Update the merged keywords logic since we now have role + tech keywords:

```tsx
// In ScrapingSettingsPage.tsx — update handleRefreshJobs

const handleRefreshJobs = async () => {
  if (!tokenSaved || refreshing) {
    if (!tokenSaved) toast.error('Please save your Apify token first');
    return;
  }
  if (!settings) {
    toast.error('Settings not loaded yet, please wait a moment.');
    return;
  }
  try {
    const profileSkills = profile?.skills || [];
    const selectedRoles = settings.keywords || [];
    const selectedTech = settings.techKeywords || [];
    const selectedPlatforms = (settings.platforms || []).filter(
      platform => supportedPlatformIds.has(platform)
    );

    if (selectedPlatforms.length === 0) {
      toast.error('Select at least one platform before starting.');
      return;
    }

    // Merge: predefined roles + tech + profile skills (no duplicates)
    const mergedKeywords = Array.from(
      new Set([...selectedRoles, ...selectedTech, ...profileSkills])
    );

    if (mergedKeywords.length === 0) {
      toast.error('Select at least one job role, tech skill, or add profile skills.');
      return;
    }

    const settingsForScraping = {
      ...settings,
      platforms: selectedPlatforms,
      keywords: mergedKeywords,
    };

    await refreshJobs(settingsForScraping);
    toast.success('Search completed! Check Suggested Jobs.');
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Failed to refresh jobs');
  }
};
```

---

## Step 6: Update Firebase Defaults

Edit `src/services/firebase.ts` — update the `createDefaultSettings` function:

```typescript
// In src/services/firebase.ts — update createDefaultSettings

createDefaultSettings: async (userId: string): Promise<ScrapingSettings> => {
  const now = new Date().toISOString();
  const defaultSettings: ScrapingSettings = {
    id: 'default',
    userId,
    platforms: ['linkedin', 'indeed'],
    keywords: [],         // Predefined role selections
    techKeywords: [],     // Predefined tech selections
    locations: [],
    experienceLevels: [], // NEW
    jobTypes: [],         // NEW
    workArrangements: [], // NEW
    postedWithin: 'any',  // NEW
    remoteOnly: false,    // Legacy
    autoRefresh: false,
    createdAt: now,
    updatedAt: now,
  };

  await scrapingSettingsService.saveScrapingSettings(userId, defaultSettings);
  return defaultSettings;
},
```

Also update the merge defaults in `useScrapingSettings.ts`:

```typescript
// In useScrapingSettings.ts — update the merged defaults in updateSettings

const merged: ScrapingSettings = {
  id: 'default',
  userId,
  platforms: [],
  keywords: [],
  techKeywords: [],       // NEW
  locations: [],
  experienceLevels: [],   // NEW
  jobTypes: [],           // NEW
  workArrangements: [],   // NEW
  postedWithin: 'any',    // NEW
  remoteOnly: false,
  autoRefresh: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...(settings || {}),
  ...updates,
};
```

---

## How Apify Actors Are Called

Here's the complete flow of a scraping request:

### 1. User clicks "Start Job Discovery"

```
ScrapingSettingsPage → handleRefreshJobs()
  → useSuggestedJobs.refreshJobs(settings)
    → scraping.refreshSuggestedJobs(userId, settings, existingJobs)
      → scraping.scrapeAllPlatforms(userId, settings)
        → For each platform + location combo:
          → scraping.runApifyScraper(userId, platform, keywords, location, limit, settings)
```

### 2. Inside `runApifyScraper` (the Apify REST API call)

```
Step 1: POST https://api.apify.com/v2/acts/{actorId}/runs
  Headers: { Authorization: Bearer {token}, Content-Type: application/json }
  Body: (built by buildInput — contains all our filters)

Step 2: Poll GET https://api.apify.com/v2/actor-runs/{runId}
  Every 2 seconds, up to 60 attempts (2 minutes max)
  Wait until status = SUCCEEDED | FAILED | ABORTED | TIMED-OUT

Step 3: GET https://api.apify.com/v2/datasets/{datasetId}/items
  Returns array of raw job objects

Step 4: Transform raw data → SuggestedJob[] using transformJobToSuggestedJob()
```

### 3. What gets sent to LinkedIn actor (example)

If user selected: Frontend Developer + React + Remote + Senior + Full-time + Last 7 days + San Francisco:

```json
{
  "startUrls": [{
    "url": "https://www.linkedin.com/jobs/search/?keywords=Frontend+Developer+React&location=San+Francisco%2C+CA&f_E=4&f_JT=F&f_WT=2&f_TPR=r604800"
  }],
  "maxItems": 20,
  "scrapeCompany": true,
  "scrapeJobDetails": true
}
```

### 4. What gets sent to Indeed actor (example)

```json
{
  "query": ["Frontend Developer", "React"],
  "location": "San Francisco, CA",
  "maxResults": 20,
  "maxPages": 2,
  "includeDetails": true,
  "postedDays": 7,
  "remoteFilter": "remote",
  "jobType": "fulltime",
  "compact": false,
  "includeCompanyProfile": false,
  "incrementalMode": false,
  "emitUnchanged": false,
  "emitExpired": false
}
```

---

## Predefined Lists Reference

Quick reference of all predefined options and their counts:

| Category | Count | File Constant |
|----------|-------|---------------|
| Job Roles | ~55 | `JOB_ROLES` |
| Tech Keywords | ~80 | `TECH_KEYWORDS` |
| Locations | ~70 | `LOCATIONS` |
| Experience Levels | 7 | `EXPERIENCE_LEVELS` |
| Job Types | 6 | `JOB_TYPES` |
| Work Arrangements | 3 | `WORK_ARRANGEMENTS` |
| Posted Within | 5 | `POSTED_WITHIN` |

All lists can be easily extended by adding entries to `src/constants/scrapingOptions.ts`.

---

## Tips for Better Results

1. **Combine role + tech**: Selecting "Frontend Developer" + "React" produces the search query `"Frontend Developer React"` which is much more targeted than either alone.

2. **Use fewer locations**: Each location multiplies API calls. 3 platforms × 5 locations = 15 separate Apify actor runs. Keep locations to 2-3 max for speed.

3. **Posted within 7 days** is the sweet spot — fresh enough to be relevant, broad enough to get results.

4. **Experience level matters**: Setting "Senior" on LinkedIn uses `f_E=4` which filters at the API level, so you get 20 relevant senior jobs instead of 20 mixed-level jobs that you then have to filter client-side.

5. **Start with LinkedIn + Indeed**: These two platforms cover ~80% of job listings. Adding more platforms mainly adds API cost and run time.

6. **To add a new platform**: 
   - Add its Apify actor ID to `APIFY_ACTORS` in `scraping.ts`
   - Add a `buildInput` function that maps your settings to the actor's input schema
   - Add it to `getSupportedPlatforms()`
   - The rest (polling, dataset fetch, transform) works automatically

---

## Files Changed Summary

| File | Action | What Changed |
|------|--------|-------------|
| `src/constants/scrapingOptions.ts` | **NEW** | All predefined lists + mapping constants |
| `src/types/index.ts` | EDIT | Added `techKeywords`, `experienceLevels`, `jobTypes`, `workArrangements`, `postedWithin` to ScrapingSettings |
| `src/components/ui/chip-selector.tsx` | **NEW** | Reusable multi-select chip component |
| `src/services/scraping.ts` | EDIT | Added `buildLinkedInSearchUrl`, updated `buildInput` for both actors, passes settings to `runApifyScraper` |
| `src/components/pages/ScrapingSettingsPage.tsx` | EDIT | Replaced free-text with ChipSelector, added new filter sections |
| `src/services/firebase.ts` | EDIT | Updated default settings with new fields |
| `src/hooks/useScrapingSettings.ts` | EDIT | Updated merge defaults with new fields |
