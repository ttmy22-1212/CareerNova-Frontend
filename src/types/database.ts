// Database schema types matching the actual PostgreSQL schema

export interface Company {
  company_id: number;
  name: string;
  description: string | null;
  company_size_min: number | null;
  company_size_max: number | null;
  country: string | null;
  city: string | null;
  address: string | null;
  url: string | null;
  industry: string | null;
  updated_at: Date | null;
}

export interface Industry {
  industry_id: number;
  industry_name: string;
}

export interface Skill {
  skill_id: number;
  skill_name: string;
  category: string | null;
  type: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface Benefit {
  benefit_id: number;
  benefit_name: string;
  category: string | null;
  created_at: Date | null;
}

export interface Job {
  job_id: number;
  company_id: number | null;
  title: string;
  skills_desc: string | null;
  description: string | null;
  formatted_experience_level: string | null;
  work_type: string | null;
  location: string | null;
  is_remote: boolean;
  listed_time: Date | null;
  expiry_time: Date | null;
  job_posting_url: string | null;
  scraped_at: Date | null;
  applies: number | null;
  views: number | null;
  fingerprint: string | null;
  job_category: string | null;
  search_group: string | null;
  source_name: string | null;
  source_id: string | null;
  updated_at: Date | null;
}

export interface Salary {
  salary_id: number;
  job_id: number | null;
  min_salary: number | null;
  max_salary: number | null;
  med_salary: number | null;
  currency: string | null;
  pay_period: string | null;
}

export interface CompanyIndustry {
  company_id: number;
  industry_id: number;
}

export interface JobSkill {
  job_id: number;
  skill_id: number;
  is_inferred: boolean;
}

export interface JobBenefit {
  job_id: number;
  benefit_id: number;
  is_inferred: boolean;
}

export interface JobGroupSkillWeight {
  search_group: string;
  skill_id: number;
  weight_wi: number;
}

export interface User {
  user_id: number;
  full_name: string | null;
  email: string | null;
  password_hash: string | null;
  avatar_url: string | null;
  role: "student" | "admin";
  created_at: Date | null;
  updated_at: Date | null;
  allow_default_cv_matching: boolean;
}

export interface UserAuthProvider {
  auth_provider_id: number;
  user_id: number;
  provider: "local" | "google" | "facebook";
  provider_user_id: string;
  provider_email: string | null;
  provider_name: string | null;
  provider_avatar_url: string | null;
  created_at: Date | null;
  last_login_at: Date | null;
}

export interface UserCV {
  cv_id: number;
  user_id: number;
  file_name: string | null;
  file_url: string | null;
  extracted_text: string | null;
  uploaded_at: Date | null;
  updated_at: Date | null;
}

export interface UserCVSkill {
  cv_id: number;
  skill_id: number;
  created_at: Date | null;
}

export interface CVJobMatch {
  match_id: number;
  cv_id: number;
  match_type: "search_group" | "existing_job" | "url_job";
  search_group: string | null;
  job_id: number | null;
  match_score: number | null;
  radar_data: Record<string, unknown> | null;
  gap_report: Record<string, unknown> | null;
  model_version: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// Enhanced types for UI with joined data
export interface JobWithDetails extends Job {
  company: Company;
  salary?: Salary;
  skills: (Skill & { is_inferred: boolean })[];
  industries: Industry[];
  benefits: (Benefit & { is_inferred: boolean })[];
}

export interface SkillWithWeight extends Skill {
  weight_wi: number;
}

// User CV/Profile types
export interface UserSkill {
  skill_id: number;
  skill_name: string;
  proficiency_level: number; // 0-100
  years_experience: number;
}

export interface UserProfile {
  skills: UserSkill[];
  experience_years: number;
  education_level: string;
  target_roles: string[];
}
