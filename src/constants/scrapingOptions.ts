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
  'junior': '3',
  'mid': '4',
  'senior': '4',
  'lead': '5',
  'principal': '6',
};

// LinkedIn job type: f_JT param
export const LINKEDIN_JOB_TYPE_MAP: Record<string, string> = {
  'full-time': 'F',
  'part-time': 'P',
  'contract': 'C',
  'internship': 'I',
  'temporary': 'T',
  'freelance': 'O',
};

// LinkedIn work arrangement: f_WT param
export const LINKEDIN_WORK_TYPE_MAP: Record<string, string> = {
  'onsite': '1',
  'remote': '2',
  'hybrid': '3',
};

// LinkedIn posted within: f_TPR param (seconds)
export const LINKEDIN_POSTED_MAP: Record<string, string> = {
  '1': 'r86400',
  '3': 'r259200',
  '7': 'r604800',
  '14': 'r1209600',
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
