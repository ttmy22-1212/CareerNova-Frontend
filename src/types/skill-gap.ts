import { IBaseResponse } from "./apis";

export interface SkillGapStatisticsDto {
  match_score: number;
  core_gaps_count: number;
  priority_gaps_count: number;
}

export interface CategoryGapDto {
  category: string;
  gap_score: number;
  gap_label: string;
  user_rate_avg: number;
  market_rate_avg: number;
  skills: CategoryGapSkillDto[];
}

export interface CategoryGapSkillDto {
  skill_id: number;
  skill_name: string;
  weight: number;
  user_rate: number;
  market_rate: number;
  similarity: number;
  gap_score: number;
  status: "Matched" | "Partial" | "Missing";
  matched_via?: string;
}

export interface RadarSkillPointDto {
  skill_name: string;
  market_score: number;
  user_score: number;
}

export interface SkillGapLearningCourseDto {
  id: string;
  title: string;
  provider: string;
  duration: string;
  level: string;
  rating: number;
  learners: number;
  progress: number;
  is_saved: boolean;
  skills: string[];
  price: number;
  image: string;
  source_url?: string;
}

export interface SkillGapLearningPathDetailDto {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  icon: string;
  courses: SkillGapLearningCourseDto[];
}

export interface SkillGapLearningRecommendationDto {
  id: string;
  skill_name: string;
  category?: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "Missing" | "Partial";
  weight: number;
  user_rate: number;
  estimated_time: string;
  impact: string;
  jobs_requiring: string;
  started: boolean;
  courses: SkillGapLearningCourseDto[];
  paths: SkillGapLearningPathDetailDto[];
  steps: string[];
}

export interface SkillsRadarFilterDto {
  category: string;
}
