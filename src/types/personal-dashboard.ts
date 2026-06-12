import { IBaseResponse } from "./apis";

export interface DashboardBannerDto {
  match_score: number;
  suitable_jobs_count: number;
}

export interface DashboardStatisticsDto {
  match_score: number;
  missing_skills_count: number;
  profile_completion_percentage: number;
}

export interface RadarSkillPointDto {
  skill_name: string;
  user_score: number;
  market_score: number;
}

export interface CategoryGapDto {
  category: string;
  gap_score: number;
}

export interface RecommendedJobDto {
  job_id: string;
  title: string;
  company_name: string;
  location: string;
  match_rate: string;
  salary_text: string;
}

export interface ProfileStepDto {
  step_name: string;
  is_completed: boolean;
}

export interface RecentActivityDto {
  activity_name: string;
  recorded_at: string | null;
}

export interface DashboardProgressDto {
  profile_completion_percentage: number;
  checklist: ProfileStepDto[];
  recent_activities: RecentActivityDto[];
}

export interface JourneyStageDto {
  id: "explore" | "analyze" | "plan" | "apply";
  label: string;
  desc: string;
  progress: number;
  done: boolean;
  href: string;
}

export interface JourneyProgressDto {
  stages: JourneyStageDto[];
  overall: number;
}

export interface SkillsRadarFilterDto {
  category: string;
}
