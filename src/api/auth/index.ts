import { apiGet, apiPost } from "@/utils/api-request";
import { IBaseResponse } from "@/types/apis";
import {
  LoginDto,
  LoginResponse,
  RegisterDto,
  RegisterResponse,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from "@/types/auth";

export default class AuthApi {
  /**
   * Đăng ký tài khoản local
   * POST /auth/register
   */
  static async register(
    payload: RegisterDto,
  ): Promise<IBaseResponse<RegisterResponse>> {
    return await apiPost("/auth/register", payload);
  }

  /**
   * Đăng nhập hệ thống
   * POST /auth/login
   */
  static async login(payload: LoginDto): Promise<IBaseResponse<LoginResponse>> {
    return await apiPost("/auth/login", payload);
  }

  /**
   * Yêu cầu đặt lại mật khẩu (Gửi email)
   * POST /auth/forgot-password
   */
  static async forgotPassword(
    payload: ForgotPasswordDto,
  ): Promise<IBaseResponse<void>> {
    return await apiPost("/auth/forgot-password", payload);
  }

  /**
   * Thiết lập mật khẩu mới sau khi có token từ email
   * POST /auth/reset-password
   */
  static async resetPassword(
    payload: ResetPasswordDto,
  ): Promise<IBaseResponse<void>> {
    return await apiPost("/auth/reset-password", payload);
  }

  /**
   * Xác thực email người dùng
   * GET /auth/verify-email?token=...
   */
  static async verifyEmail(token: string): Promise<IBaseResponse<void>> {
    return await apiGet("/auth/verify-email", { token });
  }

  /**
   * Lấy URL đăng nhập bằng Google
   * GET /auth/google
   */
  static async getGoogleUrl(): Promise<IBaseResponse<{ url: string }>> {
    return await apiGet("/auth/google");
  }

  /**
   * Xử lý callback từ Google (nếu cần gọi từ phía FE)
   * GET /auth/google/callback?code=...
   */
  static async googleCallback(
    code: string,
  ): Promise<IBaseResponse<LoginResponse>> {
    return await apiGet("/auth/google/callback", { code });
  }

  /**
   * CẤP LẠI ACCESS TOKEN MỚI
   * POST /auth/refresh
   */
  static async refreshToken(
    payload: RefreshTokenDto,
  ): Promise<IBaseResponse<RefreshTokenResponseDto>> {
    return await apiPost("/auth/refresh", payload);
  }

  /**
   * Yêu cầu xoá tài khoản (guest flow — gửi email xác nhận)
   * POST /auth/request-delete-account
   */
  static async requestDeleteAccount(
    email: string,
  ): Promise<IBaseResponse<void>> {
    return await apiPost("/auth/request-delete-account", { email });
  }
}
