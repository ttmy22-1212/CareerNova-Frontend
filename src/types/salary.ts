import { IBaseResponse } from "./apis";

export interface SalaryFilterDto {
  role?: string;
  location?: string;
  skill_id?: string | number;
  level?: string;
}

export interface SalarySummaryDto {
  average_salary: number;
  median_salary: number;
  percentile_75: number;
  open_jobs_count: number;
  salary_growth_percentage: number;
}

export interface SalaryByRoleDto {
  role: string;
  min_salary: number;
  avg_salary: number;
  max_salary: number;
  sample_count: number;
}

export interface SalaryByLocationDto {
  location: string;
  avg_salary: number;
  job_count: number;
}

export interface SalaryBySkillDto {
  skill_id: number;
  skill_name: string;
  avg_salary: number;
  job_count: number;
}

export interface SalaryTrendDto {
  month: string;
  level: string;
  avg_salary: number;
}
