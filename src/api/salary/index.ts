import { apiGet } from "@/utils/api-request";
import { IBaseResponse } from "@/types/apis";
import {
  SalaryFilterDto,
  SalarySummaryDto,
  SalaryByRoleDto,
  SalaryByLocationDto,
  SalaryBySkillDto,
  SalaryTrendDto,
} from "@/types/salary";

export default class SalaryApi {
  /**
   * Lấy thống kê lương tổng quan (4 ô KPI)
   * GET /salary-insights/summary
   */
  static async getSummary(
    filters: SalaryFilterDto,
  ): Promise<IBaseResponse<SalarySummaryDto>> {
    return await apiGet("/salary-insights/summary", filters);
  }

  /**
   * Lấy lương theo vị trí/ngành (Biểu đồ cột)
   * GET /salary-insights/by-role
   */
  static async getByRole(
    filters: SalaryFilterDto,
  ): Promise<IBaseResponse<SalaryByRoleDto[]>> {
    return await apiGet("/salary-insights/by-role", filters);
  }

  /**
   * Lấy lương theo địa điểm (Biểu đồ ngang)
   * GET /salary-insights/by-location
   */
  static async getByLocation(
    filters: SalaryFilterDto,
  ): Promise<IBaseResponse<SalaryByLocationDto[]>> {
    return await apiGet("/salary-insights/by-location", filters);
  }

  /**
   * Lấy lương theo kỹ năng (Biểu đồ kỹ năng hot)
   * GET /salary-insights/by-skill
   */
  static async getBySkill(
    filters: SalaryFilterDto,
  ): Promise<IBaseResponse<SalaryBySkillDto[]>> {
    return await apiGet("/salary-insights/by-skill", filters);
  }

  /**
   * Lấy biến động lương 6 tháng (Biểu đồ đường)
   * GET /salary-insights/trend
   */
  static async getTrend(
    filters: SalaryFilterDto,
  ): Promise<IBaseResponse<SalaryTrendDto[]>> {
    return await apiGet("/salary-insights/trend", filters);
  }
}
