import { apiGet } from "@/utils/api-request";
import { IBaseResponse } from "@/types/apis";
import {
  CareerPathRecommendation,
  PrioritySkill,
  SavedReportItem,
} from "@/types/recommendation";

export default class RecommendationApi {
  /**
   * Lấy kỹ năng thiếu/khớp một phần cần ưu tiên phát triển
   * GET /recommendation/priority-skills
   */
  static async getPrioritySkills(
    limit = 4,
  ): Promise<IBaseResponse<PrioritySkill[]>> {
    return await apiGet("/recommendation/priority-skills", { limit });
  }

  /**
   * Lấy hướng nghề đề xuất dựa trên CV mặc định và lịch sử so khớp
   * GET /recommendation/career-paths
   */
  static async getCareerPaths(
    limit = 3,
  ): Promise<IBaseResponse<CareerPathRecommendation[]>> {
    return await apiGet("/recommendation/career-paths", { limit });
  }

  /**
   * Lấy toàn bộ danh sách lịch sử các báo cáo so khớp (CV Match / Skill Gap Report) đã lưu
   * GET /recommendation/saved-reports
   */
  static async getSavedReports(): Promise<IBaseResponse<SavedReportItem[]>> {
    return await apiGet("/recommendation/saved-reports");
  }
}
