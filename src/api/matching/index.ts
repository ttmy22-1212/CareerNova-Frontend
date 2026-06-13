import { apiGet, apiPost } from "@/utils/api-request";
import { IBaseResponse } from "@/types/apis";
import {
  AnalyzeCvDto,
  CheckHistoryResponseDto,
  CvJobMatchResultDto,
  GetAllMatchesResponse,
  GetMatchCategoriesApiResponse,
  GetRadarByCategoryApiResponse,
} from "@/types/matching";

export default class MatchingApi {
  static async getJobGroups(): Promise<IBaseResponse<string[]>> {
    return await apiGet("/matching/job-groups");
  }

  static async checkHistory(): Promise<IBaseResponse<CheckHistoryResponseDto>> {
    return await apiGet("/matching/check-history");
  }

  static async analyzeCv(
    dto: AnalyzeCvDto,
  ): Promise<IBaseResponse<CvJobMatchResultDto>> {
    return await apiPost("/matching/analyze", dto);
  }

  static async getAllMatches(cvId?: string): Promise<GetAllMatchesResponse> {
    return await apiGet("/matching/history", cvId ? { cv_id: cvId } : undefined);
  }

  static async getMatchDetail(
    matchId: string,
  ): Promise<IBaseResponse<CvJobMatchResultDto>> {
    return await apiGet(`/matching/history/${matchId}`);
  }

  static async getMatchCategories(
    matchId: string,
  ): Promise<GetMatchCategoriesApiResponse> {
    return await apiGet(`/matching/history/${matchId}/categories`);
  }

  static async getRadarByCategory(
    matchId: string,
    category: string,
  ): Promise<GetRadarByCategoryApiResponse> {
    return await apiGet(
      `/matching/history/${matchId}/radar?category=${encodeURIComponent(
        category,
      )}`,
    );
  }
}
