"use client";

import { usePathname } from "next/navigation";
import AuthApi from "@/api/auth";
import ProfileApi from "@/api/profile";
import CookieHelper from "@/utils/cookie-helper";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { RegisterResponse } from "@/types/auth";

export type AuthProvider = "password" | "google" | "facebook";

type AuthUser = {
  id: string;
  full_name: string;
  school: string;
  email: string;
  avatarUrl?: string;
  provider: AuthProvider;
  createdAt: number;
  target_salary: number;
  prefer_remote: boolean;
};

type AuthState = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<RegisterResponse>;
  loginWithProvider: (provider: "google" | "facebook") => Promise<void>;
  logout: () => void;
  updateProfile: (
    patch: Partial<
      Pick<
        AuthUser,
        "full_name" | "avatarUrl" | "target_salary" | "prefer_remote" | "school"
      >
    >,
  ) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  // Hàm logout dùng chung để dọn dẹp bộ nhớ và cookie
  const logout = useCallback(() => {
    CookieHelper.removeItem("token");
    CookieHelper.removeItem("refresh_token");
    setUser(null);
  }, []);

  // Hàm phụ trợ để chuẩn hóa dữ liệu User từ API sang Frontend
  const mapRawToUser = useCallback((rawData: any): AuthUser => {
    const userData = rawData.user;
    const rawProvider = rawData.auth_providers?.[0]?.provider;
    const primaryProvider =
      (rawProvider as string) === "local"
        ? "password"
        : (rawProvider as AuthProvider) || "password";

    return {
      id: userData.user_id,
      email: userData.email,
      full_name: userData.full_name || "Thành viên",
      avatarUrl: userData.avatar_url || undefined,
      provider: primaryProvider,
      createdAt: rawData.created_at,
      target_salary: userData.target_salary ?? 0,
      prefer_remote: !!userData.prefer_remote,
      school: userData.school || "",
    };
  }, []);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const isPublicPage =
        pathname?.includes("/auth") || pathname?.includes("/email-verified");

      const token = await CookieHelper.getItem("token");
      const refreshToken = await CookieHelper.getItem("refresh_token");

      if (token) {
        try {
          // Thử lấy thông tin cá nhân bằng Access Token hiện tại
          const profileRes = await ProfileApi.getMe();
          if (profileRes.data) {
            setUser(mapRawToUser(profileRes.data));
          }
        } catch (err) {
          console.warn(
            "Access token có thể đã hết hạn, thử dùng Refresh Token...",
            err,
          );

          if (refreshToken && typeof refreshToken === "string") {
            try {
              const res = await AuthApi.refreshToken({
                refresh_token: refreshToken,
              });

              if (res.data) {
                const { access_token, refresh_token: newRefreshToken } =
                  res.data;

                await CookieHelper.setItem("token", access_token);
                await CookieHelper.setItem(
                  "refresh_token",
                  newRefreshToken || refreshToken,
                );

                // Lấy lại profile sau khi đã gia hạn thành công
                const profileRes = await ProfileApi.getMe();
                if (profileRes.data) {
                  setUser(mapRawToUser(profileRes.data));
                }
              }
            } catch (refreshErr) {
              console.error(
                "Refresh token cũng đã hết hạn (quá 7 ngày):",
                refreshErr,
              );
              // Nếu tạch token trên trang private mới ép logout, trang public thì bỏ qua
              if (!isPublicPage) logout();
            }
          } else {
            if (!isPublicPage) logout();
          }
        }
      } else if (refreshToken && typeof refreshToken === "string") {
        // Trường hợp không có Access Token nhưng vẫn còn Refresh Token
        try {
          const res = await AuthApi.refreshToken({
            refresh_token: refreshToken,
          });
          if (res.data) {
            const { access_token, refresh_token: newRefreshToken } = res.data;
            await CookieHelper.setItem("token", access_token);
            await CookieHelper.setItem(
              "refresh_token",
              newRefreshToken || refreshToken,
            );

            const profileRes = await ProfileApi.getMe();
            if (profileRes.data) {
              setUser(mapRawToUser(profileRes.data));
            }
          }
        } catch (error) {
          if (!isPublicPage) logout();
        }
      } else {
        // Trường hợp không có bất kỳ token nào và không ở trang public -> clear dữ liệu cũ
        if (!isPublicPage) logout();
      }

      // Đánh dấu đã kiểm tra xong trạng thái Auth, cho phép render giao diện
      setReady(true);
    };

    bootstrapAuth();
  }, [pathname, logout, mapRawToUser]); // Nhớ bổ sung thêm pathname vào mảng dependency nhé bạn!

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await AuthApi.login({ email, password });

      if (res.data) {
        const { access_token, refresh_token } = res.data;

        await CookieHelper.setItem("token", access_token);
        await CookieHelper.setItem("refresh_token", refresh_token);

        try {
          const profileRes = await ProfileApi.getMe();
          if (profileRes.data) {
            setUser(mapRawToUser(profileRes.data));
          }
        } catch (profileErr) {
          console.error(
            "Đăng nhập thành công nhưng không lấy được profile:",
            profileErr,
          );
          setUser({
            id: res.data.user_id,
            email: res.data.email || email,
            full_name: "Thành viên",
            provider: "password",
            createdAt: Date.now(),
            target_salary: 0,
            prefer_remote: false,
            school: "",
          });
        }
      } else {
        throw new Error(res.message || "Đăng nhập thất bại");
      }
    },
    [mapRawToUser],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await AuthApi.register({
        full_name: name,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data) {
        return res.data;
      } else {
        throw new Error(res.message || "Đăng ký thất bại");
      }
    },
    [login],
  );

  const loginWithProvider = useCallback(
    async (provider: "google" | "facebook") => {
      if (provider === "google") {
        const res = await AuthApi.getGoogleUrl();
        if (res.data?.url) {
          window.location.href = res.data.url;
        }
      } else {
        console.warn("Facebook login is not implemented yet on Backend");
      }
    },
    [],
  );

  const updateProfile = useCallback(
    async (
      patch: Partial<
        Pick<
          AuthUser,
          | "full_name"
          | "avatarUrl"
          | "target_salary"
          | "prefer_remote"
          | "school"
        >
      >,
    ) => {
      if (!user) return;

      const ProfileApiInstance = (await import("@/api/profile")).default;

      const res = await ProfileApiInstance.updateProfile({
        full_name: patch.full_name,
        avatar_url: patch.avatarUrl,
        school: patch.school,
        target_salary: patch.target_salary,
        prefer_remote: patch.prefer_remote,
      });

      if (res.data) {
        setUser((prev) => (prev ? { ...prev, ...patch } : null));
      }
    },
    [user],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!user) throw new Error("Bạn chưa đăng nhập");

      const res = await ProfileApi.changePassword({
        current: currentPassword,
        next: newPassword,
      });

      if (!res.data) {
        throw new Error(res.message || "Đổi mật khẩu thất bại");
      }
    },
    [user],
  );

  const deleteAccount = useCallback(
    async (password?: string) => {
      if (!user) throw new Error("Bạn chưa đăng nhập");

      const res = await ProfileApi.deleteAccount();

      if (res.data) {
        await CookieHelper.removeItem("token");
        await CookieHelper.removeItem("refresh_token");
        setUser(null);
      } else {
        throw new Error(res.message || "Xóa tài khoản thất bại");
      }
    },
    [user],
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      ready,
      login,
      register,
      loginWithProvider,
      logout,
      updateProfile,
      changePassword,
      deleteAccount,
    }),
    [
      user,
      ready,
      login,
      register,
      loginWithProvider,
      logout,
      updateProfile,
      changePassword,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
