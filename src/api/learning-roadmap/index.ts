import { apiGet, apiPost } from "@/utils/api-request";
import { IBaseResponse } from "@/types/apis";
import {
  LearningRoadmapFilterDto,
  LearningRoadmapResponseDto,
  SavedCourseActionDto,
  ToggleSaveCourseResponseDto,
} from "@/types/learning-roadmap";

export default class LearningRoadmapApi {
  /**
   * Lấy danh sách lộ trình học tập và khóa học gợi ý dựa trên bộ lọc (skill, level, limit)
   * GET /learning-roadmap
   */
  static async getRoadmap(
    filters: LearningRoadmapFilterDto,
  ): Promise<LearningRoadmapResponseDto> {
    return await apiGet("/learning-roadmap", filters);
  }

  /**
   * Thực hiện Lưu hoặc Hủy lưu (Bookmark) một khóa học cụ thể
   * POST /learning-roadmap/toggle-save
   */
  static async toggleSaveCourse(
    data: SavedCourseActionDto,
  ): Promise<ToggleSaveCourseResponseDto> {
    return await apiPost("/learning-roadmap/toggle-save", data);
  }
}
