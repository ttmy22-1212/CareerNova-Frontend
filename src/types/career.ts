import { Skill } from "./skill";
import { Topic } from "./topic";

export interface Career {
  id: string;
  name: string;
  description: string;
  average_salary: number;
  growth_rate: number;
  topic_id: Topic | null | string;
  skills: Skill[];
  topics: Topic[];
}

export interface CareerList extends Career {
  topic_count: number;
  skill_match_percentage: number;
}

export interface CareerAnalytics {
  salary_prediction: {
    min_salary: number;
    max_salary: number;
    avg_salary: number;
    trend: "stable" | "increasing" | "decreasing";
    confidence: number;
  };
  job_postings_prediction: {
    trend: "stable" | "increasing" | "decreasing";
    total_openings: number;
    confidence: number;
    average_openings_per_posting: number;
  };
  prediction_date: Date;
  id: string;
}
