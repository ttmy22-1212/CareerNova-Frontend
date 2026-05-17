"use client";

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

export type AuthProvider = "password" | "google" | "facebook";

export type AuthUser = {
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
  register: (name: string, email: string, password: string) => Promise<void>;
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

  useEffect(() => {
    const autoRefreshToken = async () => {
      const refreshToken = await CookieHelper.getItem("refresh_token");

      if (refreshToken && typeof refreshToken === "string") {
        try {
          const res = await AuthApi.refreshToken({
            refresh_token: refreshToken,
          });

          if (res.data) {
            const { access_token, refresh_token: newRefreshToken } = res.data;

            CookieHelper.setItem("token", access_token);
            CookieHelper.setItem(
              "refresh_token",
              newRefreshToken || refreshToken,
            );

            const profileRes = await ProfileApi.getMe();

            if (profileRes.data) {
              const rawData = profileRes.data;
              const userData = rawData.user;

              const rawProvider = rawData.auth_providers?.[0]?.provider;
              const primaryProvider =
                (rawProvider as string) === "local"
                  ? "password"
                  : (rawProvider as AuthProvider) || "password";
              setUser({
                id: userData.user_id,
                email: userData.email,
                full_name: userData.full_name || "Thành viên",
                avatarUrl: userData.avatar_url || undefined,
                provider: primaryProvider,
                createdAt: rawData.created_at,
                target_salary: userData.target_salary ?? 0,
                prefer_remote: !!userData.prefer_remote,
                school: userData.school || "",
              });
            }
          }
        } catch (err) {
          console.error("Phiên đăng nhập đã hết hạn hoặc không hợp lệ:", err);
          CookieHelper.removeItem("token");
          CookieHelper.removeItem("refresh_token");
          setUser(null);
        }
      }
      setReady(true);
    };

    autoRefreshToken();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await AuthApi.login({ email, password });

    if (res.data) {
      const { access_token, refresh_token } = res.data;

      CookieHelper.setItem("token", access_token);
      CookieHelper.setItem("refresh_token", refresh_token);

      try {
        const profileRes = await ProfileApi.getMe();

        if (profileRes.data) {
          const rawData = profileRes.data;
          const userData = rawData.user;
          const rawProvider = rawData.auth_providers?.[0]?.provider;
          const primaryProvider =
            (rawProvider as string) === "local"
              ? "password"
              : (rawProvider as AuthProvider) || "password";

          setUser({
            id: userData.user_id,
            email: userData.email,
            full_name: userData.full_name || "Thành viên",
            avatarUrl: userData.avatar_url || undefined,
            provider: primaryProvider,
            createdAt: rawData.created_at,
            target_salary: userData.target_salary ?? 0,
            prefer_remote: !!userData.prefer_remote,
            school: userData.school || "",
          });
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
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await AuthApi.register({
        full_name: name,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data) {
        await login(email, password);
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

  const logout = useCallback(() => {
    CookieHelper.removeItem("token");
    CookieHelper.removeItem("refresh_token");
    setUser(null);
  }, []);

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

      // Đồng bộ hóa ngược lại cấu trúc snake_case tương ứng dữ liệu thô đẩy lên API
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
        CookieHelper.removeItem("token");
        CookieHelper.removeItem("refresh_token");
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
