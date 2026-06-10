import { apiGet } from "@/utils/api-request";
import { IBaseResponse } from "@/types/apis";
import {
  SkillGapStatisticsDto,
  CategoryGapDto,
  SkillsRadarFilterDto,
  RadarSkillPointDto,
  SkillGapLearningRecommendationDto,
} from "@/types/skill-gap";

export default class SkillGapApi {
  /**
   * Lấy dữ liệu các thẻ thống kê tổng quan của trang Skill Gap (KPI Cards)
   * GET /skill-gap/statistics
   */
  static async getStatistics(): Promise<IBaseResponse<SkillGapStatisticsDto>> {
    return await apiGet("/skill-gap/statistics");
  }

  /**
   * Lấy dữ liệu độ khớp theo danh mục kèm danh sách skill chi tiết
   * GET /skill-gap/category-gaps?limit=...
   */
  static async getCategoryGaps(
    limit = 10,
  ): Promise<IBaseResponse<CategoryGapDto[]>> {
    return await apiGet("/skill-gap/category-gaps", { limit });
  }

  /**
   * Lấy dữ liệu biểu đồ Radar lọc cụ thể theo nhóm ngành nghề được chọn
   * GET /skill-gap/skills-radar?category=...
   */
  static async getSkillsRadar(
    filters: SkillsRadarFilterDto,
  ): Promise<IBaseResponse<RadarSkillPointDto[]>> {
    return await apiGet("/skill-gap/skills-radar", filters);
  }

  /**
   * Lấy lộ trình học đề xuất theo skill thiếu/khớp một phần từ default matching
   * GET /skill-gap/learning-paths?limit=...
   */
  static async getLearningPaths(
    limit = 3,
  ): Promise<IBaseResponse<SkillGapLearningRecommendationDto[]>> {
    return await apiGet("/skill-gap/learning-paths", { limit });
  }
}
