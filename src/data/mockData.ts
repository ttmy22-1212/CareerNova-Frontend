import type {
  Company,
  Industry,
  Skill,
  Benefit,
  Job,
  Salary,
  JobWithDetails,
  UserProfile,
  UserSkill,
} from "../types/database";

// ==================== COMPANIES ====================
export const companies: Company[] = [
  {
    company_id: 1001,
    name: "TechCorp Solutions",
    description: "Leading provider of enterprise software solutions serving Fortune 500 companies globally.",
    company_size_min: 500,
    company_size_max: 1000,
    country: "United States",
    city: "San Francisco",
    address: "123 Market Street, San Francisco, CA 94103",
    url: "https://techcorp.io",
    industry: "Technology & SaaS",
    updated_at: new Date("2026-05-08"),
  },
  {
    company_id: 1002,
    name: "DataFlow Inc.",
    description: "Data analytics platform powering insights for modern businesses.",
    company_size_min: 200,
    company_size_max: 500,
    country: "United States",
    city: "Remote",
    address: null,
    url: "https://dataflow.com",
    industry: "Data & Analytics",
    updated_at: new Date("2026-05-08"),
  },
  {
    company_id: 1003,
    name: "StartupHub",
    description: "Fast-growing fintech startup revolutionizing digital payments.",
    company_size_min: 50,
    company_size_max: 100,
    country: "United States",
    city: "New York",
    address: "456 Broadway, New York, NY 10012",
    url: "https://startuphub.io",
    industry: "Finance & Fintech",
    updated_at: new Date("2026-05-08"),
  },
  {
    company_id: 1004,
    name: "CloudSystems Inc.",
    description: "Global cloud infrastructure and DevOps solutions provider.",
    company_size_min: 1000,
    company_size_max: 5000,
    country: "United States",
    city: "Austin",
    address: "789 Tech Blvd, Austin, TX 78701",
    url: "https://cloudsystems.com",
    industry: "Cloud & Infrastructure",
    updated_at: new Date("2026-05-08"),
  },
  {
    company_id: 1005,
    name: "DesignLab",
    description: "Award-winning digital design agency specializing in user experience.",
    company_size_min: 100,
    company_size_max: 200,
    country: "United States",
    city: "Seattle",
    address: "321 Pine Street, Seattle, WA 98101",
    url: "https://designlab.studio",
    industry: "Design & Digital Agency",
    updated_at: new Date("2026-05-08"),
  },
];

// ==================== INDUSTRIES ====================
export const industries: Industry[] = [
  { industry_id: 1, industry_name: "Technology & SaaS" },
  { industry_id: 2, industry_name: "Finance & Fintech" },
  { industry_id: 3, industry_name: "E-commerce & Retail" },
  { industry_id: 4, industry_name: "Healthcare IT" },
  { industry_id: 5, industry_name: "Data & Analytics" },
  { industry_id: 6, industry_name: "Cloud & Infrastructure" },
  { industry_id: 7, industry_name: "Design & Digital Agency" },
];

// ==================== SKILLS ====================
export const skills: Skill[] = [
  { skill_id: 1, skill_name: "JavaScript", category: "Programming Language", type: "Frontend", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 2, skill_name: "Python", category: "Programming Language", type: "Backend", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 3, skill_name: "React", category: "Framework/Library", type: "Frontend", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 4, skill_name: "TypeScript", category: "Programming Language", type: "Frontend", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 5, skill_name: "Node.js", category: "Runtime/Framework", type: "Backend", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 6, skill_name: "SQL", category: "Database", type: "Data", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 7, skill_name: "PostgreSQL", category: "Database", type: "Data", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 8, skill_name: "MongoDB", category: "Database", type: "Data", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 9, skill_name: "AWS", category: "Cloud Platform", type: "DevOps", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 10, skill_name: "Docker", category: "DevOps Tool", type: "DevOps", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 11, skill_name: "Kubernetes", category: "DevOps Tool", type: "DevOps", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 12, skill_name: "GraphQL", category: "API Technology", type: "Backend", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 13, skill_name: "REST API", category: "API Technology", type: "Backend", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 14, skill_name: "Django", category: "Framework/Library", type: "Backend", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 15, skill_name: "Express.js", category: "Framework/Library", type: "Backend", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 16, skill_name: "Redis", category: "Database", type: "Data", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 17, skill_name: "Git", category: "Version Control", type: "General", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 18, skill_name: "CI/CD", category: "DevOps Practice", type: "DevOps", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 19, skill_name: "Terraform", category: "DevOps Tool", type: "DevOps", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 20, skill_name: "Tailwind CSS", category: "Framework/Library", type: "Frontend", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 21, skill_name: "Next.js", category: "Framework/Library", type: "Frontend", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 22, skill_name: "React Native", category: "Framework/Library", type: "Mobile", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 23, skill_name: "TensorFlow", category: "Framework/Library", type: "Machine Learning", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 24, skill_name: "Apache Spark", category: "Data Processing", type: "Data", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
  { skill_id: 25, skill_name: "Kafka", category: "Data Processing", type: "Data", created_at: new Date("2024-01-01"), updated_at: new Date("2026-05-08") },
];

// ==================== BENEFITS ====================
export const benefits: Benefit[] = [
  { benefit_id: 1, benefit_name: "Health Insurance", category: "Insurance", created_at: new Date("2024-01-01") },
  { benefit_id: 2, benefit_name: "Dental Insurance", category: "Insurance", created_at: new Date("2024-01-01") },
  { benefit_id: 3, benefit_name: "Vision Insurance", category: "Insurance", created_at: new Date("2024-01-01") },
  { benefit_id: 4, benefit_name: "401(k) Matching", category: "Retirement", created_at: new Date("2024-01-01") },
  { benefit_id: 5, benefit_name: "Equity/Stock Options", category: "Compensation", created_at: new Date("2024-01-01") },
  { benefit_id: 6, benefit_name: "Remote Work", category: "Work Flexibility", created_at: new Date("2024-01-01") },
  { benefit_id: 7, benefit_name: "Flexible Hours", category: "Work Flexibility", created_at: new Date("2024-01-01") },
  { benefit_id: 8, benefit_name: "Professional Development Budget", category: "Learning & Development", created_at: new Date("2024-01-01") },
  { benefit_id: 9, benefit_name: "Unlimited PTO", category: "Time Off", created_at: new Date("2024-01-01") },
  { benefit_id: 10, benefit_name: "Home Office Stipend", category: "Equipment", created_at: new Date("2024-01-01") },
];

// ==================== JOBS ====================
export const jobs: Job[] = [
  {
    job_id: 5001,
    company_id: 1001,
    title: "Senior React Developer",
    skills_desc: "5+ years React, TypeScript, Node.js. Strong AWS experience preferred.",
    description: "We're looking for a Senior React Developer to join our growing engineering team. You'll be working on cutting-edge web applications that serve millions of users worldwide.",
    formatted_experience_level: "Senior (5+ years)",
    work_type: "Full-time",
    location: "San Francisco, CA",
    is_remote: false,
    listed_time: new Date("2026-04-26"),
    expiry_time: new Date("2026-05-26"),
    job_posting_url: "https://techcorp.io/careers/senior-react-dev",
    scraped_at: new Date("2026-04-26"),
    applies: 127,
    views: 1453,
    fingerprint: "a1b2c3d4e5f6",
    job_category: "engineering",
    search_group: "frontend_engineer",
    source_name: "linkedin",
    source_id: "ln-5001",
    updated_at: new Date("2026-05-08"),
  },
  {
    job_id: 5002,
    company_id: 1002,
    title: "Python Backend Engineer",
    skills_desc: "Python, Django/Flask, PostgreSQL, Docker. REST API experience required.",
    description: "Design scalable backend systems for our data analytics platform. Work with petabytes of data across distributed systems.",
    formatted_experience_level: "Mid-Level (3-5 years)",
    work_type: "Remote",
    location: "Remote",
    is_remote: true,
    listed_time: new Date("2026-04-21"),
    expiry_time: new Date("2026-05-21"),
    job_posting_url: "https://dataflow.com/jobs/python-backend",
    scraped_at: new Date("2026-04-21"),
    applies: 89,
    views: 976,
    fingerprint: "b2c3d4e5f6g7",
    job_category: "engineering",
    search_group: "backend_engineer",
    source_name: "linkedin",
    source_id: "ln-5002",
    updated_at: new Date("2026-05-08"),
  },
  {
    job_id: 5003,
    company_id: 1003,
    title: "Full Stack Developer",
    skills_desc: "JavaScript/TypeScript, React, Express.js, MongoDB. Startup experience a plus.",
    description: "Be an early engineer at a fast-growing fintech startup. Own full features from design to deployment.",
    formatted_experience_level: "Mid-Level (2-4 years)",
    work_type: "Hybrid",
    location: "New York, NY",
    is_remote: false,
    listed_time: new Date("2026-04-25"),
    expiry_time: new Date("2026-05-25"),
    job_posting_url: "https://startuphub.io/careers/fullstack",
    scraped_at: new Date("2026-04-25"),
    applies: 203,
    views: 1829,
    fingerprint: "c3d4e5f6g7h8",
    job_category: "engineering",
    search_group: "fullstack_engineer",
    source_name: "linkedin",
    source_id: "ln-5003",
    updated_at: new Date("2026-05-08"),
  },
  {
    job_id: 5004,
    company_id: 1004,
    title: "DevOps / Cloud Engineer",
    skills_desc: "Kubernetes, AWS/GCP, Terraform, CI/CD. Infrastructure as Code expertise required.",
    description: "Architect and maintain the cloud infrastructure supporting global SaaS products. Drive DevOps culture transformation.",
    formatted_experience_level: "Senior (5+ years)",
    work_type: "Remote",
    location: "Austin, TX",
    is_remote: true,
    listed_time: new Date("2026-04-23"),
    expiry_time: new Date("2026-05-23"),
    job_posting_url: "https://cloudsystems.com/careers/devops",
    scraped_at: new Date("2026-04-23"),
    applies: 64,
    views: 721,
    fingerprint: "d4e5f6g7h8i9",
    job_category: "infrastructure",
    search_group: "devops_engineer",
    source_name: "linkedin",
    source_id: "ln-5004",
    updated_at: new Date("2026-05-08"),
  },
  {
    job_id: 5005,
    company_id: 1005,
    title: "Frontend Developer",
    skills_desc: "React, CSS/Tailwind CSS, JavaScript. Design system experience preferred.",
    description: "Craft pixel-perfect user interfaces in close collaboration with our award-winning design team.",
    formatted_experience_level: "Junior to Mid-Level (1-3 years)",
    work_type: "Full-time",
    location: "Seattle, WA",
    is_remote: false,
    listed_time: new Date("2026-04-27"),
    expiry_time: new Date("2026-05-27"),
    job_posting_url: "https://designlab.studio/jobs/frontend-dev",
    scraped_at: new Date("2026-04-27"),
    applies: 156,
    views: 1102,
    fingerprint: "e5f6g7h8i9j0",
    job_category: "engineering",
    search_group: "frontend_engineer",
    source_name: "linkedin",
    source_id: "ln-5005",
    updated_at: new Date("2026-05-08"),
  },
];

// ==================== SALARIES ====================
export const salaries: Salary[] = [
  { salary_id: 1, job_id: 5001, min_salary: 90000, max_salary: 120000, med_salary: 105000, currency: "USD", pay_period: "yearly" },
  { salary_id: 2, job_id: 5002, min_salary: 85000, max_salary: 110000, med_salary: 97500, currency: "USD", pay_period: "yearly" },
  { salary_id: 3, job_id: 5003, min_salary: 75000, max_salary: 95000, med_salary: 85000, currency: "USD", pay_period: "yearly" },
  { salary_id: 4, job_id: 5004, min_salary: 95000, max_salary: 130000, med_salary: 112500, currency: "USD", pay_period: "yearly" },
  { salary_id: 5, job_id: 5005, min_salary: 70000, max_salary: 90000, med_salary: 80000, currency: "USD", pay_period: "yearly" },
];

// ==================== JOIN DATA ====================
// Map job_id to skill_ids with inferred flag
const jobSkillsMap: Record<number, { skill_id: number; is_inferred: boolean }[]> = {
  5001: [
    { skill_id: 3, is_inferred: false },  // React
    { skill_id: 4, is_inferred: false },  // TypeScript
    { skill_id: 5, is_inferred: false },  // Node.js
    { skill_id: 9, is_inferred: false },  // AWS
    { skill_id: 12, is_inferred: true },  // GraphQL
    { skill_id: 17, is_inferred: true },  // Git
  ],
  5002: [
    { skill_id: 2, is_inferred: false },  // Python
    { skill_id: 14, is_inferred: false }, // Django
    { skill_id: 7, is_inferred: false },  // PostgreSQL
    { skill_id: 10, is_inferred: false }, // Docker
    { skill_id: 13, is_inferred: false }, // REST API
  ],
  5003: [
    { skill_id: 1, is_inferred: false },  // JavaScript
    { skill_id: 3, is_inferred: false },  // React
    { skill_id: 15, is_inferred: false }, // Express.js
    { skill_id: 8, is_inferred: false },  // MongoDB
    { skill_id: 16, is_inferred: true },  // Redis
  ],
  5004: [
    { skill_id: 11, is_inferred: false }, // Kubernetes
    { skill_id: 9, is_inferred: false },  // AWS
    { skill_id: 19, is_inferred: false }, // Terraform
    { skill_id: 18, is_inferred: false }, // CI/CD
    { skill_id: 10, is_inferred: false }, // Docker
  ],
  5005: [
    { skill_id: 3, is_inferred: false },  // React
    { skill_id: 20, is_inferred: false }, // Tailwind CSS
    { skill_id: 1, is_inferred: false },  // JavaScript
    { skill_id: 4, is_inferred: true },   // TypeScript
  ],
};

const jobIndustriesMap: Record<number, number[]> = {
  5001: [1], // Technology & SaaS
  5002: [5], // Data & Analytics
  5003: [2], // Finance & Fintech
  5004: [6], // Cloud & Infrastructure
  5005: [7], // Design & Digital Agency
};

const jobBenefitsMap: Record<number, { benefit_id: number; is_inferred: boolean }[]> = {
  5001: [
    { benefit_id: 1, is_inferred: false },
    { benefit_id: 2, is_inferred: false },
    { benefit_id: 3, is_inferred: false },
    { benefit_id: 4, is_inferred: false },
    { benefit_id: 5, is_inferred: false },
    { benefit_id: 6, is_inferred: true },
    { benefit_id: 7, is_inferred: false },
    { benefit_id: 8, is_inferred: false },
    { benefit_id: 9, is_inferred: false },
    { benefit_id: 10, is_inferred: true },
  ],
  5002: [
    { benefit_id: 1, is_inferred: false },
    { benefit_id: 6, is_inferred: false },
    { benefit_id: 7, is_inferred: false },
    { benefit_id: 8, is_inferred: false },
  ],
  5003: [
    { benefit_id: 1, is_inferred: false },
    { benefit_id: 5, is_inferred: false },
    { benefit_id: 7, is_inferred: false },
  ],
  5004: [
    { benefit_id: 1, is_inferred: false },
    { benefit_id: 4, is_inferred: false },
    { benefit_id: 6, is_inferred: false },
    { benefit_id: 8, is_inferred: false },
  ],
  5005: [
    { benefit_id: 1, is_inferred: false },
    { benefit_id: 7, is_inferred: false },
    { benefit_id: 8, is_inferred: false },
    { benefit_id: 10, is_inferred: false },
  ],
};

// ==================== ENRICHED JOB DATA ====================
export const jobsWithDetails: JobWithDetails[] = jobs.map(job => {
  const company = companies.find(c => c.company_id === job.company_id)!;
  const salary = salaries.find(s => s.job_id === job.job_id);
  const jobSkills = jobSkillsMap[job.job_id] || [];
  const jobIndustries = jobIndustriesMap[job.job_id] || [];
  const jobBenefits = jobBenefitsMap[job.job_id] || [];

  return {
    ...job,
    company,
    salary,
    skills: jobSkills.map(js => ({
      ...skills.find(s => s.skill_id === js.skill_id)!,
      is_inferred: js.is_inferred,
    })),
    industries: jobIndustries.map(industryId => industries.find(i => i.industry_id === industryId)!),
    benefits: jobBenefits.map(jb => ({
      ...benefits.find(b => b.benefit_id === jb.benefit_id)!,
      is_inferred: jb.is_inferred,
    })),
  };
});

// ==================== USER PROFILE (Mock CV) ====================
export const userSkills: UserSkill[] = [
  { skill_id: 3, skill_name: "React", proficiency_level: 92, years_experience: 3 },
  { skill_id: 4, skill_name: "TypeScript", proficiency_level: 85, years_experience: 2 },
  { skill_id: 1, skill_name: "JavaScript", proficiency_level: 95, years_experience: 4 },
  { skill_id: 5, skill_name: "Node.js", proficiency_level: 70, years_experience: 1.5 },
  { skill_id: 9, skill_name: "AWS", proficiency_level: 40, years_experience: 0.5 },
  { skill_id: 17, skill_name: "Git", proficiency_level: 88, years_experience: 4 },
  { skill_id: 13, skill_name: "REST API", proficiency_level: 75, years_experience: 2 },
  { skill_id: 7, skill_name: "PostgreSQL", proficiency_level: 68, years_experience: 2 },
  { skill_id: 20, skill_name: "Tailwind CSS", proficiency_level: 80, years_experience: 1.5 },
];

export const userProfile: UserProfile = {
  skills: userSkills,
  experience_years: 4,
  education_level: "Bachelor's in Software Engineering",
  target_roles: ["Frontend Developer", "Full Stack Developer", "React Developer"],
};
