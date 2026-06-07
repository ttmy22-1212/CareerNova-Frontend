import { IBaseResponse } from "./apis";

export interface AnalyzeCvDto {
  cv_id: string;
  search_group: string;
}

export interface CheckHistoryResponseDto {
  has_history: boolean;
  latest_match_id: string | null;
}

export interface CvJobMatchResultDto {
  match_id: string;
  cv_id: string;
  match_type: string;
  search_group: string | null;
  match_score: number | null;
  radar_data: MatchedSkillDetail[];
  gap_report: GapReportStructure;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface MatchedSkillDetail {
  skill_id: number;
  skill_name: string;
  weight: number;
  similarity: number;
  contribution: number;
}

export interface PartialSkillDetail extends MatchedSkillDetail {
  gap: number;
  matched_via: string;
}

export interface MissingSkillDetail {
  skill_id: number;
  skill_name: string;
  weight: number;
  similarity: number;
  gap: number;
}

export interface GapReportStructure {
  partially_matched_skills: PartialSkillDetail[];
  missing_skills: MissingSkillDetail[];
}

export type GetJobGroupsResponse = IBaseResponse<string[]>;

export type CheckHistoryResponse = IBaseResponse<CheckHistoryResponseDto>;

export type AnalyzeCvResponse = IBaseResponse<CvJobMatchResultDto>;

export type GetMatchDetailResponse = IBaseResponse<CvJobMatchResultDto>;

export type GetAllMatchesResponse = IBaseResponse<CvJobMatchResultDto[]>;

export interface MatchCategoryResponse {
  category: string;
  is_matched: boolean;
}

export interface GetMatchCategoriesApiResponse {
  data: MatchCategoryResponse[];
}

export interface GetRadarCategoryQuery {
  category: string;
}

export interface MatchedSkillDetail {
  skill_id: number;
  skill_name: string;
  weight: number;
  similarity: number;
  contribution: number;
}

export interface MissingSkill {
  skill_id: number;
  skill_name: string;
  weight: number;
  similarity: number;
  gap: number;
}

export interface PartiallyMatchedSkill {
  skill_id: number;
  skill_name: string;
  weight: number;
  similarity: number;
  gap: number;
  matched_via: string;
  contribution: number;
}

export interface GapReport {
  missing_skills: MissingSkill[];
  partially_matched_skills: PartiallyMatchedSkill[];
}

export interface GetRadarByCategoryApiResponse {
  data: {
    radar_data: MatchedSkillDetail[];
    gap_report: GapReport;
  };
}
