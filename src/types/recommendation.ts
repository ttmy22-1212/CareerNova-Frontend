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

// Cấu trúc phản hồi bọc qua lớp IBaseResponse quen thuộc
export interface GetTopJobsResponse {
  data: RecommendedJob[];
}

export interface GetSavedReportsResponse {
  data: SavedReportItem[];
}
