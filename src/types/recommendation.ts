export interface RecommendedJob {
  job_id: string;
  title: string;
  company_name: string;
  location: string;
  match_rate: string;
  salary_text: string;
}

export interface SavedReportItem {
  match_id: string;
  cv_id?: string;
  report_name: string;
  match_type: "cv_job" | "role_benchmark";
  match_score: number;
  created_at: string | null;
}

export interface PrioritySkill {
  skill_id: number;
  skill_name: string;
  category: string | null;
  status: "Missing" | "Partial";
  priority: "critical" | "high" | "medium" | "low";
  weight: number;
  similarity: number;
  job_count: number;
  reason: string;
  impact: string;
  timeframe: string;
}

export interface CareerPathSkillGap {
  skill_id: number;
  skill_name: string;
  category: string | null;
  priority: "critical" | "high" | "medium" | "low";
}

export interface CareerPathRecommendation {
  id: string;
  title: string;
  search_group: string;
  current_match: number;
  target_match: number;
  readiness_label: string;
  time_to_ready: string;
  skill_gaps: CareerPathSkillGap[];
  salary_range: string;
  openings_count: number;
  learning_path_title: string | null;
  learning_path_id: string | null;
  href: string;
}

// Cấu trúc phản hồi bọc qua lớp IBaseResponse quen thuộc
export interface GetTopJobsResponse {
  data: RecommendedJob[];
}

export interface GetSavedReportsResponse {
  data: SavedReportItem[];
}

export interface GetPrioritySkillsResponse {
  data: PrioritySkill[];
}

export interface GetCareerPathsResponse {
  data: CareerPathRecommendation[];
}
