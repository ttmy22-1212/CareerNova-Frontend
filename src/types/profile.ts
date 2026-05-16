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
  name?: string;
  avatarUrl?: string;
}

export interface ChangePasswordPayload {
  current: string;
  next: string;
}

export interface UserProfileResponse {
  user: {
    user_id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    provider: "password" | "google" | "facebook";
    major?: string;
    school?: string;
    current_year?: number;
    orientation?: string;
    objective?: string;
    target_salary?: number;
    prefer_remote?: boolean;
    createdAt: number;
  };
  latest_cv?: {
    cv_id: string;
    file_name: string;
  } | null;
  cv_skills_summary?: string[];
}
