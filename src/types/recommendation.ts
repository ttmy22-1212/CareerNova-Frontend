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
