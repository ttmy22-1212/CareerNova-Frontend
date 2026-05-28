import { IBaseResponse } from "./apis";

export interface SkillGapStatisticsDto {
  match_score: number;
  core_gaps_count: number;
  priority_gaps_count: number;
}

export interface CategoryGapDto {
  category: string;
  gap_score: number;
}

export interface RadarSkillPointDto {
  skill_name: string;
  market_score: number;
  user_score: number;
}

export interface SkillBreakdownItemDto {
  skill_id: number;
  skill_name: string;
  user_rate: number;
  market_rate: number;
  status: "Proficient" | "Missing";
}

export interface CategoryBreakdownDto {
  category_name: string;
  gap_label: string;
  user_rate_avg: number;
  market_rate_avg: number;
  skills: SkillBreakdownItemDto[];
}

export interface SkillsRadarFilterDto {
  category: string;
}
