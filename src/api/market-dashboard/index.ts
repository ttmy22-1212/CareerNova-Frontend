import { apiGet } from "@/utils/api-request";
import { IBaseResponse } from "@/types/apis";
import {
  DashboardFilterDto,
  DashboardFiltersOptionsResponseDto,
  StatsCardResponseDto,
  JobPostingTrendsResponseDto,
  IndustryBreakdownResponseDto,
  HotJobsResponseDto,
  SalaryRangesResponseDto,
  InDemandSkillsResponseDto,
  RisingSkillsResponseDto,
} from "@/types/market-dashboard";

export default class MarketDashboardApi {
  /**
   * GET /dashboard/filters
   * Lấy danh sách các tùy chọn dữ liệu động cho bộ lọc (Dropdown Options)
   */
  static async getDashboardFiltersOptions(): Promise<
    IBaseResponse<DashboardFiltersOptionsResponseDto>
  > {
    return await apiGet("/dashboard/filters");
  }

  /**
   * GET /dashboard/stats
   * Thống kê số liệu tổng quan (4 Stats Cards) theo bộ lọc
   */
  static async getStats(
    filters: DashboardFilterDto,
  ): Promise<IBaseResponse<StatsCardResponseDto>> {
    return await apiGet("/dashboard/stats", filters);
  }

  /**
   * GET /dashboard/trends
   * Phân tích xu hướng tuyển dụng & làm việc từ xa (Job Posting Trends)
   */
  static async getTrends(
    filters: DashboardFilterDto,
  ): Promise<IBaseResponse<JobPostingTrendsResponseDto>> {
    return await apiGet("/dashboard/trends", filters);
  }

  /**
   * GET /dashboard/industries
   * Cơ cấu tỷ lệ tuyển dụng theo ngành nghề (Industry Breakdown)
   */
  static async getIndustryBreakdown(
    filters: DashboardFilterDto,
  ): Promise<IBaseResponse<IndustryBreakdownResponseDto>> {
    return await apiGet("/dashboard/industries", filters);
  }

  /**
   * GET /dashboard/hot-jobs
   * Danh sách Top 5 vị trí công việc hot nhất tuần (Top 5 Hot Jobs)
   */
  static async getHotJobs(
    filters: DashboardFilterDto,
  ): Promise<IBaseResponse<HotJobsResponseDto>> {
    return await apiGet("/dashboard/hot-jobs", filters);
  }

  /**
   * GET /dashboard/salary-ranges
   * Dải phân bố lương Min-Max theo vị trí công việc gộp All Levels (Salary Ranges)
   */
  static async getSalaryRanges(
    filters: DashboardFilterDto,
  ): Promise<IBaseResponse<SalaryRangesResponseDto>> {
    return await apiGet("/dashboard/salary-ranges", filters);
  }

  /**
   * GET /dashboard/skills/in-demand
   * Top 10 kỹ năng được nhà tuyển dụng săn đón nhiều nhất (Top 10 In-Demand Skills)
   */
  static async getInDemandSkills(
    filters: DashboardFilterDto,
  ): Promise<IBaseResponse<InDemandSkillsResponseDto>> {
    return await apiGet("/dashboard/skills/in-demand", filters);
  }

  /**
   * GET /dashboard/skills/rising
   * Top kỹ năng bứt phá có tốc độ tăng trưởng đột biến (Rising Skills)
   */
  static async getRisingSkills(
    filters: DashboardFilterDto,
  ): Promise<IBaseResponse<RisingSkillsResponseDto>> {
    return await apiGet("/dashboard/skills/rising", filters);
  }
}
