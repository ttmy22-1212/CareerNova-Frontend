import { apiGet, apiPost } from "@/utils/api-request";
import { IBaseResponse } from "@/types/apis";
import {
  AnalyzeCvDto,
  CheckHistoryResponseDto,
  CvJobMatchResultDto,
  GetAllMatchesResponse,
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

  static async getAllMatches(): Promise<GetAllMatchesResponse> {
    return await apiGet("/matching/history");
  }

  static async getMatchDetail(
    matchId: string,
  ): Promise<IBaseResponse<CvJobMatchResultDto>> {
    return await apiGet(`/matching/history/${matchId}`);
  }
}
