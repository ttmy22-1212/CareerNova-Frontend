import { apiGet } from "@/utils/api-request";
import { IBaseResponse } from "@/types/apis";
import { RecommendedJob, SavedReportItem } from "@/types/recommendation";

export default class RecommendationApi {
  /**
   * Lấy danh sách 5 việc làm gợi ý hàng đầu trong vòng 1 tháng trở lại đây
   * GET /recommendation/top-jobs
   */
  static async getTopJobs(): Promise<IBaseResponse<RecommendedJob[]>> {
    return await apiGet("/recommendation/top-jobs");
  }

  /**
   * Lấy toàn bộ danh sách lịch sử các báo cáo so khớp (CV Match / Skill Gap Report) đã lưu
   * GET /recommendation/saved-reports
   */
  static async getSavedReports(): Promise<IBaseResponse<SavedReportItem[]>> {
    return await apiGet("/recommendation/saved-reports");
  }
}
