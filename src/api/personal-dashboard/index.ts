import { apiGet } from "@/utils/api-request";
import { IBaseResponse } from "@/types/apis";
import {
  DashboardBannerDto,
  DashboardStatisticsDto,
  RecommendedJobDto,
  SkillsRadarFilterDto,
  RadarSkillPointDto,
  CategoryGapDto,
  DashboardProgressDto,
  JourneyProgressDto,
} from "@/types/personal-dashboard";

export default class PersonalDashboardApi {
  /**
   * Lấy thông tin banner chào mừng
   * GET /personal-dashboard/banner
   */
  static async getBanner(): Promise<IBaseResponse<DashboardBannerDto>> {
    return await apiGet("/personal-dashboard/banner");
  }

  /**
   * Lấy dữ liệu các thẻ thống kê tổng quan (3 ô Card)
   * GET /personal-dashboard/statistics
   */
  static async getStatistics(): Promise<IBaseResponse<DashboardStatisticsDto>> {
    return await apiGet("/personal-dashboard/statistics");
  }

  /**
   * Lấy danh sách việc làm gợi ý (Tab Jobs Gợi Ý)
   * GET /personal-dashboard/recommended-jobs
   */
  static async getRecommendedJobs(): Promise<
    IBaseResponse<RecommendedJobDto[]>
  > {
    return await apiGet("/personal-dashboard/recommended-jobs");
  }

  /**
   * Lấy dữ liệu biểu đồ so sánh kỹ năng theo danh mục (Tab Kỹ năng - Bên phải)
   * GET /personal-dashboard/skills-chart
   */
  static async getSkillsChart(): Promise<IBaseResponse<CategoryGapDto[]>> {
    return await apiGet("/personal-dashboard/skills-chart");
  }

  /**
   * Lấy dữ liệu checklist và hoạt động gần đây (Tab Tiến độ)
   * GET /personal-dashboard/progress
   */
  static async getProgress(): Promise<IBaseResponse<DashboardProgressDto>> {
    return await apiGet("/personal-dashboard/progress");
  }

  /**
   * Lấy trạng thái hành trình sự nghiệp 4 bước từ dữ liệu thực trên server
   * GET /personal-dashboard/journey
   */
  static async getJourney(): Promise<IBaseResponse<JourneyProgressDto>> {
    return await apiGet("/personal-dashboard/journey");
  }
}
