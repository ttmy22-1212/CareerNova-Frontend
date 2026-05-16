import { apiGet } from "@/utils/api-request";
import { IBaseResponse } from "@/types/apis";
import { JobListItem, JobDetailResponse } from "@/types/job-insight";
import { GetSkillsResponse } from "@/types/skill";

export interface GetJobsQueryDto {
  page?: number;
  limit?: number;
  q?: string;
  work_type?: string;
  location?: string;
  experience_level?: string;
  cv_id?: string;
  min_match?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetJobsResponse {
  data: JobListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default class JobApi {
  static async findAll(
    query: GetJobsQueryDto,
  ): Promise<IBaseResponse<GetJobsResponse>> {
    return await apiGet("/jobs", query);
  }

  /**
   * Lấy chi tiết một công việc và phân tích kỹ năng (Gap Report)
   * GET /jobs/:id
   * @param id ID của công việc (string)
   * @param cvId ID của CV để tính toán match_breakdown (optional)
   */
  static async findOne(
    id: string,
    cvId?: string,
  ): Promise<IBaseResponse<JobDetailResponse>> {
    const params = cvId ? { cv_id: cvId } : {};
    return await apiGet(`/jobs/${id}`, params);
  }

  static async getSkills(query?: {
    q?: string;
  }): Promise<IBaseResponse<GetSkillsResponse>> {
    return await apiGet("/jobs/skills", query);
  }
}
