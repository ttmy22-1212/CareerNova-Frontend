export interface RegisterDto {
  full_name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user_id: string;
  email: string | null;
}

// --- Login ---
export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: string;
  email: string | null;
  access_token: string;
  refresh_token: string;
}

// --- Forgot & Reset Password ---
export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

export interface RefreshTokenResponseDto {
  access_token: string;
  refresh_token: string;
}
