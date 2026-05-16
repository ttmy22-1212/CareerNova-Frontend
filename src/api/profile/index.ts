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
}
