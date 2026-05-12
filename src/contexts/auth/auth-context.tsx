"use client";

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
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
};

const USERS_KEY = "career-lens.users";
const SESSION_KEY = "career-lens.session";

const AuthContext = createContext<AuthState | null>(null);

// Lightweight non-cryptographic hash. NOT real security — this is a frontend
// mock so the password isn't stored in plain text in localStorage. Replace
// with a real backend call before going to production.
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
    const sid = readSession();
    if (sid) {
      const u = readUsers().find((x) => x.id === sid);
      if (u) setUser(toPublic(u));
      else writeSession(null);
    }
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const e = email.trim().toLowerCase();
    if (!e || !password) throw new Error("Vui lòng nhập email và mật khẩu");
    const u = readUsers().find((x) => x.email === e);
    if (!u) throw new Error("Email chưa được đăng ký");
    if (u.passwordHash !== hash(password)) throw new Error("Mật khẩu không đúng");
    writeSession(u.id);
    setUser(toPublic(u));
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const n = name.trim();
      const e = email.trim().toLowerCase();
      if (!n) throw new Error("Vui lòng nhập họ tên");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
        throw new Error("Email không hợp lệ");
      if (password.length < 6)
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
      const users = readUsers();
      if (users.some((x) => x.email === e))
        throw new Error("Email đã được đăng ký");
      const newUser: StoredUser = {
        id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        name: n,
        email: e,
        provider: "password",
        createdAt: Date.now(),
        passwordHash: hash(password),
      };
      users.push(newUser);
      writeUsers(users);
      writeSession(newUser.id);
      setUser(toPublic(newUser));
    },
    [],
  );

  const loginWithProvider = useCallback(
    async (provider: "google" | "facebook") => {
      // FRONTEND MOCK: simulate the OAuth round-trip with a short delay and a
      // random demo profile. Replace with real OAuth (NextAuth / Firebase /
      // backend OIDC) before production.
      await new Promise((r) => setTimeout(r, 700));
      const demoNames = [
        "Minh Nguyễn",
        "Linh Trần",
        "Khoa Phạm",
        "An Lê",
        "Mai Hoàng",
      ];
      const name = demoNames[Math.floor(Math.random() * demoNames.length)];
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
      const domain = provider === "google" ? "gmail.com" : "facebook.com";
      const email = `${slug}.${Math.floor(Math.random() * 9000 + 1000)}@${domain}`;
      const users = readUsers();
      let u = users.find((x) => x.email === email);
      if (!u) {
        u = {
          id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
          name,
          email,
          provider,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=${provider === "google" ? "ea4335" : "1877f2"}`,
          createdAt: Date.now(),
        };
        users.push(u);
        writeUsers(users);
      }
      writeSession(u.id);
      setUser(toPublic(u));
    },
    [],
  );

  const logout = useCallback(() => {
    writeSession(null);
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
    () => ({ user, ready, login, register, loginWithProvider, logout, updateProfile, changePassword, deleteAccount }),
    [user, ready, login, register, loginWithProvider, logout, updateProfile, changePassword, deleteAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
