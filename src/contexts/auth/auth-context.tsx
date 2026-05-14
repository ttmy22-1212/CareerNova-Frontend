"use client";

import AuthApi from "@/api/auth";
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

const USERS_KEY = "career-lens.users";
const SESSION_KEY = "career-lens.session";

const AuthContext = createContext<AuthState | null>(null);

// --- CÁC HELPER GIỮ NGUYÊN ĐỂ TRANH LỖI ---
function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSession(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_KEY);
}

function writeSession(userId: string | null) {
  if (userId) window.localStorage.setItem(SESSION_KEY, userId);
  else window.localStorage.removeItem(SESSION_KEY);
}

function toPublic(u: StoredUser): AuthUser {
  const { passwordHash: _ph, ...rest } = u;
  void _ph;
  return rest;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = CookieHelper.getItem("token");

    if (token) {
      setUser({
        id: "authenticated-user",
        email: "",
        name: "",
        provider: "password",
        createdAt: Date.now(),
      });
    }
    setReady(true);
  }, []);

  // --- UPDATE: HÀM LOGIN GỌI AUTHAPI ---
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

  // --- UPDATE: HÀM REGISTER GỌI AUTHAPI ---
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await AuthApi.register({
        full_name: name, // Map đúng field full_name của NestJS DTO
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data) {
        // Sau khi đăng ký thành công, tự động đăng nhập
        await login(email, password);
      } else {
        throw new Error(res.message || "Đăng ký thất bại");
      }
    },
    [login],
  );

  // --- UPDATE: HÀM LOGIN VỚI PROVIDER GỌI AUTHAPI ---
  const loginWithProvider = useCallback(
    async (provider: "google" | "facebook") => {
      if (provider === "google") {
        const res = await AuthApi.getGoogleUrl();
        if (res.data?.url) {
          window.location.href = res.data.url; // Chuyển hướng sang Google Auth
        }
      } else {
        // Hiện tại NestJS của bạn chưa bật Facebook, có thể để thông báo
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
    (patch: Partial<Pick<AuthUser, "name" | "avatarUrl">>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        const users = readUsers();
        const idx = users.findIndex((x) => x.id === prev.id);
        if (idx >= 0) {
          users[idx] = { ...users[idx], ...patch };
          writeUsers(users);
        }
        return next;
      });
    },
    [],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!user) throw new Error("Bạn chưa đăng nhập");
      const users = readUsers();
      const idx = users.findIndex((x) => x.id === user.id);
      if (idx < 0) throw new Error("Không tìm thấy tài khoản");
      const u = users[idx];
      if (u.provider !== "password")
        throw new Error(
          `Tài khoản này đăng nhập bằng ${u.provider === "google" ? "Google" : "Facebook"} — không có mật khẩu để đổi.`,
        );
      if (u.passwordHash !== hash(currentPassword))
        throw new Error("Mật khẩu hiện tại không đúng");
      if (newPassword.length < 6)
        throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
      if (newPassword === currentPassword)
        throw new Error("Mật khẩu mới phải khác mật khẩu hiện tại");
      users[idx] = { ...u, passwordHash: hash(newPassword) };
      writeUsers(users);
    },
    [user],
  );

  const deleteAccount = useCallback(
    async (password?: string) => {
      if (!user) throw new Error("Bạn chưa đăng nhập");
      const users = readUsers();
      const u = users.find((x) => x.id === user.id);
      if (!u) throw new Error("Không tìm thấy tài khoản");
      if (u.provider === "password") {
        if (!password) throw new Error("Vui lòng nhập mật khẩu để xác nhận");
        if (u.passwordHash !== hash(password))
          throw new Error("Mật khẩu không đúng");
      }
      const remaining = users.filter((x) => x.id !== user.id);
      writeUsers(remaining);
      writeSession(null);
      setUser(null);
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
