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
}

export interface Industry {
  industry_id: number;
  industry_name: string;
}

export interface JobSkill {
  skill_id: number;
  skill_name: string;
  category: string | null;
  type: string | null;
  created_at: Date | null;
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

export interface JobWithDetails extends Job {
  company: Company;
  salary?: Salary;
  skills: (JobSkill & { is_inferred: boolean })[];
  industries: Industry[];
  benefits: (Benefit & { is_inferred: boolean })[];
}

export interface UserSkill {
  skill_id: number;
  skill_name: string;
  proficiency_level: number;
  years_experience: number;
}

export interface UserProfile {
  skills: UserSkill[];
  experience_years: number;
  education_level: string;
  target_roles: string[];
}
