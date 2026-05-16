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
  name: string;
  email: string;
  avatarUrl?: string;
  provider: AuthProvider;
  createdAt: number;
};

type StoredUser = AuthUser & { passwordHash?: string };

type AuthState = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: "google" | "facebook") => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<AuthUser, "name" | "avatarUrl">>) => void;
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
              const userData = profileRes.data.user;
              setUser({
                id: userData.user_id,
                email: userData.email,
                name: userData.name,
                avatarUrl: userData.avatarUrl,
                provider: userData.provider as AuthProvider,
                createdAt: userData.createdAt,
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
      const {
        access_token,
        refresh_token,
        user_id,
        email: userEmail,
      } = res.data;

      CookieHelper.setItem("token", access_token);
      CookieHelper.setItem("refresh_token", refresh_token);

      setUser({
        id: user_id,
        email: userEmail || email,
        name: "",
        provider: "password",
        createdAt: Date.now(),
      });
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
    async (patch: Partial<Pick<AuthUser, "name" | "avatarUrl">>) => {
      if (!user) return;

      const ProfileApi = (await import("@/api/profile")).default;

      const res = await ProfileApi.updateProfile({
        name: patch.name,
        avatarUrl: patch.avatarUrl,
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
