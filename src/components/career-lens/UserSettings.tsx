"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  Download,
  Loader2,
  Lock,
  Save,
  Settings,
  Trash2,
} from "lucide-react";

import ProfileApi from "@/api/profile";
import { UpdateProfilePayload, UserProfileResponse } from "@/types/profile";

type SettingsTab = "profile" | "security" | "data";

type ProfileFormState = {
  full_name: string;
  email: string;
  major: string;
  school: string;
  current_year: string;
  orientation: string;
  objective: string;
  target_salary: string;
  prefer_remote: boolean;
  allow_default_cv_matching: boolean;
};

const emptyProfileForm: ProfileFormState = {
  full_name: "",
  email: "",
  major: "",
  school: "",
  current_year: "",
  orientation: "",
  objective: "",
  target_salary: "",
  prefer_remote: false,
  allow_default_cv_matching: true,
};

const tabs: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
  { id: "profile", label: "Hồ sơ", icon: Settings },
  { id: "security", label: "Bảo mật", icon: Lock },
  { id: "data", label: "Dữ liệu", icon: Download },
];

const toProfileForm = (profile: UserProfileResponse): ProfileFormState => ({
  full_name: profile.user.full_name || "",
  email: profile.user.email || "",
  major: profile.user.major || "",
  school: profile.user.school || "",
  current_year: profile.user.current_year
    ? String(profile.user.current_year)
    : "",
  orientation: profile.user.orientation || "",
  objective: profile.user.objective || "",
  target_salary: profile.user.target_salary
    ? String(profile.user.target_salary)
    : "",
  prefer_remote: profile.user.prefer_remote,
  allow_default_cv_matching: profile.user.allow_default_cv_matching,
});

const toNullableText = (value: string) => {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
};

export function UserSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [formData, setFormData] =
    useState<ProfileFormState>(emptyProfileForm);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const res = await ProfileApi.getMe();
        if (cancelled) return;

        if (res.data) {
          setProfile(res.data);
          setFormData(toProfileForm(res.data));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Không thể tải dữ liệu cài đặt hồ sơ:", error);
          setErrorMessage("Không thể tải dữ liệu hồ sơ.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleInputChange = (
    field: keyof ProfileFormState,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setStatusMessage(null);
      setErrorMessage(null);

      const payload: UpdateProfilePayload = {
        full_name: toNullableText(formData.full_name),
        major: toNullableText(formData.major),
        school: toNullableText(formData.school),
        orientation: toNullableText(formData.orientation),
        objective: toNullableText(formData.objective),
        current_year: formData.current_year
          ? Number(formData.current_year)
          : null,
        target_salary: formData.target_salary
          ? Number(formData.target_salary)
          : null,
        prefer_remote: formData.prefer_remote,
        allow_default_cv_matching: formData.allow_default_cv_matching,
      };

      await ProfileApi.updateProfile(payload);
      const refreshedProfile = await ProfileApi.getMe();
      if (refreshedProfile.data) {
        setProfile(refreshedProfile.data);
        setFormData(toProfileForm(refreshedProfile.data));
      }
      setStatusMessage("Đã lưu thay đổi hồ sơ.");
    } catch (error) {
      console.error("Không thể lưu cài đặt hồ sơ:", error);
      setErrorMessage("Không thể lưu thay đổi hồ sơ.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setErrorMessage("Mật khẩu mới không khớp.");
      return;
    }

    try {
      setIsSaving(true);
      setStatusMessage(null);
      setErrorMessage(null);
      await ProfileApi.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setStatusMessage("Đã đổi mật khẩu.");
    } catch (error) {
      console.error("Không thể đổi mật khẩu:", error);
      setErrorMessage("Không thể đổi mật khẩu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportProfile = async () => {
    try {
      setIsExporting(true);
      setStatusMessage(null);
      setErrorMessage(null);
      const blob = await ProfileApi.exportProfilePdf();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "career-nova-profile.pdf";
      anchor.click();
      window.URL.revokeObjectURL(url);
      setStatusMessage("Đã tải hồ sơ PDF.");
    } catch (error) {
      console.error("Không thể xuất hồ sơ PDF:", error);
      setErrorMessage("Không thể xuất hồ sơ PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const currentYearNumber = Number(formData.current_year);
  const targetSalaryNumber = Number(formData.target_salary);
  const hasInvalidNumber =
    (!!formData.current_year &&
      (!Number.isFinite(currentYearNumber) || currentYearNumber < 1)) ||
    (!!formData.target_salary &&
      (!Number.isFinite(targetSalaryNumber) || targetSalaryNumber < 0));

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Cài đặt
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Quản lý thông tin hồ sơ và dữ liệu tài khoản từ backend hiện có.
        </p>
      </div>

      <div className="overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setStatusMessage(null);
                  setErrorMessage(null);
                }}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-700 dark:text-blue-400"
                    : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <Check className="h-4 w-4" />
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div>
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
                  Thông tin hồ sơ
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Họ và tên
                    </span>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) =>
                        handleInputChange("full_name", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email
                    </span>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Ngành học
                    </span>
                    <input
                      type="text"
                      value={formData.major}
                      onChange={(e) =>
                        handleInputChange("major", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Trường
                    </span>
                    <input
                      type="text"
                      value={formData.school}
                      onChange={(e) =>
                        handleInputChange("school", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Năm học
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={formData.current_year}
                      onChange={(e) =>
                        handleInputChange("current_year", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Lương mục tiêu
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={formData.target_salary}
                      onChange={(e) =>
                        handleInputChange("target_salary", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Định hướng nghề nghiệp
                    </span>
                    <input
                      type="text"
                      value={formData.orientation}
                      onChange={(e) =>
                        handleInputChange("orientation", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Mục tiêu
                    </span>
                    <textarea
                      value={formData.objective}
                      onChange={(e) =>
                        handleInputChange("objective", e.target.value)
                      }
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </label>
                </div>

                <div className="mt-5 space-y-3">
                  <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
                    <span>
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                        Ưu tiên job remote
                      </span>
                      <span className="text-xs text-slate-500">
                        Dùng cho gợi ý việc làm và matching cá nhân hóa.
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.prefer_remote}
                      onChange={(e) =>
                        handleInputChange("prefer_remote", e.target.checked)
                      }
                      className="h-5 w-5"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
                    <span>
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                        Cho phép matching CV mặc định
                      </span>
                      <span className="text-xs text-slate-500">
                        Backend dùng CV mặc định để tính job gợi ý trên
                        dashboard.
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.allow_default_cv_matching}
                      onChange={(e) =>
                        handleInputChange(
                          "allow_default_cv_matching",
                          e.target.checked,
                        )
                      }
                      className="h-5 w-5"
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving || hasInvalidNumber}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Lưu thay đổi
              </button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
                  Đổi mật khẩu
                </h2>

                <div className="grid gap-4">
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        current_password: e.target.value,
                      }))
                    }
                    placeholder="Mật khẩu hiện tại"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        new_password: e.target.value,
                      }))
                    }
                    placeholder="Mật khẩu mới"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                  <input
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirm_password: e.target.value,
                      }))
                    }
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleChangePassword}
                disabled={
                  isSaving ||
                  !passwordForm.current_password ||
                  !passwordForm.new_password ||
                  !passwordForm.confirm_password
                }
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Đổi mật khẩu
              </button>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                  Dữ liệu tài khoản
                </h2>
                <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">
                  Tải hồ sơ PDF từ backend hoặc chuyển tới luồng xóa tài khoản.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleExportProfile}
                    disabled={isExporting}
                    className="flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Xuất hồ sơ PDF
                  </button>

                  <Link
                    href="/delete-account"
                    className="flex w-full items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa tài khoản
                  </Link>
                </div>
              </div>

              {profile?.auth_providers?.length ? (
                <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                    Phương thức đăng nhập
                  </h3>
                  <div className="space-y-2">
                    {profile.auth_providers.map((provider) => (
                      <div
                        key={`${provider.provider}-${provider.last_login_at || ""}`}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <span>{provider.provider}</span>
                        <span className="text-xs text-slate-400">
                          {provider.last_login_at
                            ? new Date(provider.last_login_at).toLocaleString(
                                "vi-VN",
                              )
                            : "Chưa có lần đăng nhập gần nhất"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
