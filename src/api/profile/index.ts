import { apiGet, apiPatch, apiPost, apiDelete } from "@/utils/api-request";
import { IBaseResponse } from "@/types/apis";
import {
  OnboardingStatusResponse,
  UpdateOnboardingProgressPayload,
  UpdateOnboardingProgressResponse,
  OnboardingCompleteResponse,
  UserProfileResponse,
  UpdateProfilePayload,
  ChangePasswordPayload,
  GetSavedJobsResponse,
  SaveJobPayload,
  SaveJobResponse,
  DeleteSavedJobResponse,
  GetSavedCoursesResponse,
} from "@/types/profile";

export default class ProfileApi {
  /**
   * GET /profile/me
   * Lấy thông tin cá nhân hiện tại để đổ lên trang Profile
   */
  static async getMe(): Promise<IBaseResponse<UserProfileResponse>> {
    return await apiGet("/profile/me");
  }

  /**
   * GET /profile/onboarding-status
   * Kiểm tra trạng thái tiến độ khảo sát
   */
  static async getOnboardingStatus(): Promise<
    IBaseResponse<OnboardingStatusResponse>
  > {
    return await apiGet("/profile/onboarding-status");
  }

  /**
   * PATCH /profile/onboarding
   * Cập nhật cuốn chiếu dữ liệu onboarding qua từng bước
   */
  static async updateOnboardingProgress(
    payload: UpdateOnboardingProgressPayload,
  ): Promise<IBaseResponse<UpdateOnboardingProgressResponse>> {
    return await apiPatch("/profile/onboarding", payload);
  }

  /**
   * POST /profile/onboarding-complete
   * Khóa luồng và hoàn thành bài khảo sát
   */
  static async completeOnboarding(): Promise<
    IBaseResponse<OnboardingCompleteResponse>
  > {
    return await apiPost("/profile/onboarding-complete", {});
  }

  /**
   * PATCH /profile/me
   * Cập nhật thông tin cơ bản (Đổi tên hiển thị, Avatar...) từ trang cài đặt
   */
  static async updateProfile(
    payload: UpdateProfilePayload,
  ): Promise<IBaseResponse<any>> {
    return await apiPatch("/profile/me", payload);
  }

  /**
   * POST /profile/change-password
   * Đổi mật khẩu đăng nhập định kỳ
   */
  static async changePassword(
    payload: ChangePasswordPayload,
  ): Promise<IBaseResponse<any>> {
    return await apiPost("/profile/change-password", payload);
  }

  /**
   * GET /profile/activity
   * Lấy lịch sử danh sách Job đã lưu, đã apply
   */
  static async getActivity(): Promise<IBaseResponse<any>> {
    return await apiGet("/profile/activity");
  }

  /**
   * DELETE /profile/me
   * Xóa tài khoản vĩnh viễn (Hard delete)
   */
  static async deleteAccount(): Promise<IBaseResponse<any>> {
    return await apiDelete("/profile/me", {});
  }

  static async getSavedJobs(): Promise<IBaseResponse<GetSavedJobsResponse[]>> {
    return await apiGet("/profile/saved-jobs");
  }

  /**
   * POST /profile/saved-jobs
   * Lưu công việc vào danh sách
   */
  static async saveJob(
    payload: SaveJobPayload,
  ): Promise<IBaseResponse<SaveJobResponse>> {
    return await apiPost("/profile/saved-jobs", payload);
  }

  /**
   * DELETE /profile/saved-jobs/:jobId
   * Hủy lưu công việc khỏi danh sách dựa trên jobId
   */
  static async deleteSavedJob(
    jobId: string,
  ): Promise<IBaseResponse<DeleteSavedJobResponse>> {
    return await apiDelete(`/profile/saved-jobs/${jobId}`, {});
  }

  static async setDefaultCv(
    cv_id: string,
  ): Promise<IBaseResponse<{ message: string; default_cv_id: string }>> {
    return await apiPatch("/profile/default-cv", { cv_id });
  }

  /**
   * PATCH /profile/default-matching
   * Thiết lập một kết quả đối sánh làm mặc định hiển thị trên Dashboard
   */
  static async setDefaultMatching(
    match_id: string,
  ): Promise<IBaseResponse<{ message: string; default_match_id: string }>> {
    return await apiPatch("/profile/default-matching", { match_id });
  }

  /**
   * GET /profile/saved-courses
   * Lấy danh sách khóa học đã lưu
   */
  static async getSavedCourses(): Promise<
    IBaseResponse<GetSavedCoursesResponse[]>
  > {
    return await apiGet("/profile/saved-courses");
  }

  /**
   * PATCH /profile/me
   * Cập nhật trạng thái cho phép tự động đối sánh CV mặc định
   */
  static async updateCvMatchingPermission(
    allow: boolean,
  ): Promise<IBaseResponse<any>> {
    return await apiPatch("/profile/me", { allow_default_cv_matching: allow });
  }

  static async uploadAvatar(
    file: File,
  ): Promise<IBaseResponse<{ message: string; url: string }>> {
    const formData = new FormData();
    formData.append("file", file);
    return await apiPost("/profile/avatar", formData);
  }
}
