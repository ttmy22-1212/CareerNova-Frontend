export interface UpdateOnboardingProgressPayload {
  current_step: number;
  major?: string;
  school?: string;
  current_year?: number;
  orientation?: string;
  objective?: string;
  target_salary?: number;
  prefer_remote?: boolean;
}

export interface UpdateOnboardingProgressResponse {
  message: string;
  current_step: number;
}

export interface OnboardingStatusResponse {
  onboarding_completed: boolean;
  current_step: number;
}

export interface OnboardingCompleteResponse {
  message: string;
  onboarding_completed: boolean;
}

export interface UpdateProfilePayload {
  full_name?: string;
  avatar_url?: string;
  allow_default_cv_matching?: boolean;
  major?: string;
  school?: string;
  current_year?: number | null;
  orientation?: string;
  objective?: string;
  target_salary?: number;
  prefer_remote?: boolean;
}

export interface ChangePasswordPayload {
  current: string;
  next: string;
}

export interface AuthProviderInfo {
  provider: "password" | "google" | "facebook";
  last_login_at?: string | null;
}

export interface UserProfileResponse {
  user: {
    user_id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    role: string;
    major: string | null;
    school: string | null;
    current_year: number | null;
    orientation: string | null;
    objective: string | null;
    current_step: number;
    target_salary: number | null;
    prefer_remote: boolean;
    onboarding_completed: boolean;
    allow_default_cv_matching: boolean;
  };
  auth_providers: AuthProviderInfo[];
  created_at: number;
  all_cvs: {
    cv_id: string;
    file_name: string;
    file_url: string | null;
    uploaded_at: string;
    skills: string[];
  }[];

  default_cv: {
    cv_id: string;
    file_name: string;
    file_url: string | null;
    uploaded_at: string;
    skills: string[];
  } | null;

  default_match: {
    match_id: string;
    cv_id: string;
    job_id: string | null;
    job_posting_url: string | null;
    match_type: string;
    search_group: string | null;
    match_score: number | null;
    radar_data: Record<string, any>[] | null;
    gap_report: Record<string, any> | null;
    model_version: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  latest_cv: {
    cv_id: string;
    file_name: string;
    uploaded_at: string;
  } | null;
  cv_skills_summary: string[];
  latest_match_summary: {
    match_id: string;
    cv_id: string;
    job_id: string;
    score?: number;
    job?: {
      job_id: string;
      company_id: string;
      title: string;
      company: { name: string };
    } | null;
  } | null;
}

export interface CompanyInJob {
  name: string;
  url: string | null;
}

export interface SavedJobItem {
  job_id: string;
  company_id: string;
  title: string;
  description?: string;
  location?: string;
  salary?: string;
  company: CompanyInJob;
}

export interface GetSavedJobsResponse {
  saved_job_id: string | number;
  created_at: string | Date;
  job: SavedJobItem | null;
}

export interface SaveJobPayload {
  job_id: string;
}

export interface SaveJobResponse {
  message: "JOB_SAVED_SUCCESSFULLY";
  saved_job_id: string | number;
  job_id: string;
}

export interface DeleteSavedJobResponse {
  message: "SAVED_JOB_REMOVED_SUCCESSFULLY";
}

export interface LearningPathItem {
  path_id: string;
  path_title: string;
  path_level: string;
  skill_key: string;
}

export interface SavedCourseItem {
  course_id: string;
  course_title: string;
  provider_name: string;
  source_url: string | null;
  thumbnail_icon: string | null;
  duration_hours: number;
  rating: number;
  total_learners: string;
  price: number;
  currency: string;
  skills_tags: string[];
  is_recommended: boolean;
  learning_paths: LearningPathItem[];
}

export interface GetSavedCoursesResponse {
  course_id: string;
  saved_at: string;
  status: string;
  course: SavedCourseItem;
}
