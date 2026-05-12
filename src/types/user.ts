import * as Yup from "yup";
import { Skill } from "./skill";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  photo_url?: string;
  role: string;
  year?: number;
  school?: string;
  address?: string;
  bio?: string;
  quote?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    other?: string;
  };
  created_at?: string;
  updated_at?: string;
  skills: string[];
  onboarding_completed: boolean;
}

export interface UserOnboarding {
  full_name: string;
  date_of_birth: Date;
  gender: "male" | "female" | "other" | null;
  education_level: string | null;
  major: string | null;
  school: string | null;
  current_goal: string | null;
  skills_have: Skill[];
  experience?: {
    job_title: string;
    field: string;
    years: number;
  }[];
}

export enum UserTopicStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

export interface UserTopicProgress {
  user_id: string;
  topic_id: string;
  title?: string;
  status: UserTopicStatus;
  started_at?: Date;
  completed_at?: Date;
  notes?: string;
  rating?: number;
}

export const initialValuesOnboarding: UserOnboarding = {
  full_name: "",
  date_of_birth: new Date(),
  gender: null,
  education_level: null,
  major: null,
  school: null,
  current_goal: null,
  skills_have: [],
  experience: [{ job_title: "", field: "", years: 0 }],
};

export const validationSchema = [
  // Step 1: Personal Info
  Yup.object({
    full_name: Yup.string().required("Vui lòng nhập họ tên"),
    date_of_birth: Yup.date().required("Vui lòng chọn ngày sinh"),
    gender: Yup.string().nullable(),
  }),
  // Step 2: Education
  Yup.object({
    education_level: Yup.string().nullable(),
    major: Yup.string().nullable(),
    school: Yup.string().nullable(),
  }),
  // Step 3: Career Goals
  Yup.object({
    current_goal: Yup.string().nullable(),
  }),
  // Step 4: Skills
  Yup.object({
    skills_have: Yup.array().of(
      Yup.object({
        id: Yup.string().required("Vui lòng chọn kỹ năng"),
        name: Yup.string().required("Vui lòng nhập tên kỹ năng"),
      }),
    ),
  }),
  // Step 5: Experience
  Yup.object({
    experience: Yup.array().of(
      Yup.object({
        job_title: Yup.string(),
        field: Yup.string(),
        years: Yup.number().min(0, "Số năm không thể âm"),
      }),
    ),
  }),
];
