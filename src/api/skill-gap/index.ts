import { apiGet } from "@/utils/api-request";
import { IBaseResponse } from "@/types/apis";
import {
  SkillGapStatisticsDto,
  CategoryGapDto,
  SkillsRadarFilterDto,
  RadarSkillPointDto,
  CategoryBreakdownDto,
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
   * Lấy dữ liệu biểu đồ so sánh số lượng hoặc tỷ lệ kỹ năng thiếu theo danh mục
   * GET /skill-gap/category-gaps
   */
  static async getCategoryGaps(): Promise<IBaseResponse<CategoryGapDto[]>> {
    return await apiGet("/skill-gap/category-gaps");
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
   * Lấy danh sách toàn bộ kỹ năng trải phẳng dạng phân cấp (Detailed Breakdown) để vẽ bảng mở rộng
   * GET /skill-gap/skills-breakdown
   */
  static async getSkillsBreakdown(): Promise<
    IBaseResponse<CategoryBreakdownDto[]>
  > {
    return await apiGet("/skill-gap/skills-breakdown");
  }
}
