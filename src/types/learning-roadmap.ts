export interface LearningRoadmapFilterDto {
  skill?: string;
  level?: "All" | "Beginner" | "Intermediate" | "Advanced";
  limit?: string | number; // Thêm trường này để FE truyền limit lên khi cần bung/nén mảng
}

export interface SavedCourseActionDto {
  course_id: string;
}

export interface CourseItemDto {
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

export interface LearningPathDto {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  difficulty: string;
  icon: string;
  color: string;
  skill_key: string;
  courses: CourseItemDto[];
}

export interface LearningRoadmapResponseDto {
  learning_paths: LearningPathDto[];
  recommended_courses: CourseItemDto[];
}

export interface ToggleSaveCourseResponseDto {
  message: string;
  is_saved: boolean;
}
