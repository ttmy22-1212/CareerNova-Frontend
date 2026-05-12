import { apiGet, removeUndefinedKeys } from "@/utils/api-request";

export interface PositionStats {
  position: string;
  count: number;
}

export interface CompanyJobStats {
  name: string;
  job_count: number;
  average_salary: number;
  average_it_count: number;
}

export interface ExperienceLevelStats {
  label: string;
  value: number;
}

export interface SkillDemandStats {
  name: string;
  recruitment_demand: number;
  applicant_percentage: number;
}

export type JobPostingsStatsRequest = {
  date_from?: Date;
  date_to?: Date;
  region?: string;
};

export class JobPostingsApi {
  static async getPositionStats(
    request: JobPostingsStatsRequest,
  ): Promise<PositionStats[]> {
    return await apiGet(
      "/job-postings/position-stats",
      removeUndefinedKeys(request),
    );
  }

  static async getTopCompaniesByJobPostings(
    request: JobPostingsStatsRequest,
  ): Promise<CompanyJobStats[]> {
    return await apiGet("/job-postings/company", removeUndefinedKeys(request));
  }

  static async getJobPostingsByExperienceLevel(
    request: JobPostingsStatsRequest,
  ): Promise<ExperienceLevelStats[]> {
    return await apiGet(
      "/job-postings/experience-stats",
      removeUndefinedKeys(request),
    );
  }

  static async getTopSkillsDemandStats(
    request: JobPostingsStatsRequest,
  ): Promise<SkillDemandStats[]> {
    return await apiGet(
      "/job-postings/skills-demand-stats",
      removeUndefinedKeys(request),
    );
  }

  static async getJobPostingsHeatmap(
    request: JobPostingsStatsRequest,
  ): Promise<number[][]> {
    return await apiGet("/job-postings/heatmap", removeUndefinedKeys(request));
  }
}
