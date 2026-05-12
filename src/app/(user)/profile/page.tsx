"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  GraduationCap,
  Compass,
  FileText,
  Target,
  Sparkles,
  Pencil,
  CheckCircle2,
  Circle,
  Trash2,
  RefreshCw,
  LogOut,
  Mail,
  MapPin,
  Briefcase,
  Bookmark,
  Send,
  Award,
  Calendar,
  Camera,
  Sun,
  Moon,
  Download,
  Shield,
  ChevronRight,
  Building2,
  TrendingUp,
  ExternalLink,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { useOnboarding } from "@/contexts/onboarding/onboarding-context";
import { useTheme } from "@/contexts/theme/theme-context";
import { useAuth, type AuthProvider } from "@/contexts/auth/auth-context";
import { jobsWithDetails } from "@/data/mockData";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const interestLabels: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Fullstack",
  mobile: "Mobile",
  data: "Data",
  ai_ml: "AI / ML",
  devops: "DevOps",
  cybersecurity: "Security",
  qa: "QA / Test",
};

const goalLabels: Record<string, string> = {
  internship: "Tìm thực tập",
  fulltime: "Tìm việc fulltime",
  switch: "Chuyển hướng",
  explore: "Đang khám phá",
};

const majorLabels: Record<string, string> = {
  CS: "Khoa học Máy tính",
  SE: "Kỹ thuật Phần mềm",
  IS: "Hệ thống Thông tin",
  IT: "Công nghệ Thông tin",
  AI: "Trí tuệ Nhân tạo",
  DA: "Phân tích Dữ liệu",
  Other: "Ngành khác",
};

const providerMeta: Record<AuthProvider, { label: string; tone: string }> = {
  password: { label: "Email & mật khẩu", tone: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  google: { label: "Google", tone: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300" },
  facebook: { label: "Facebook", tone: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300" },
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const { profile, isOnboarded, strength, checklist, reset, setProfile } = useOnboarding();
  const { theme, toggle: toggleTheme } = useTheme();
  const { user, logout, updateProfile, changePassword, deleteAccount } = useAuth();

  const initials = getInitials(user?.name || profile.major || "User");

  // Bookmarked / applied job objects
  const bookmarkedJobs = useMemo(() => {
    return jobsWithDetails
      .filter((j) => profile.bookmarkedJobIds.includes(String(j.job_id)))
      .slice(0, 5);
  }, [profile.bookmarkedJobIds]);
  const appliedJobs = useMemo(() => {
    return jobsWithDetails
      .filter((j) => profile.appliedJobIds.includes(String(j.job_id)))
      .slice(0, 5);
  }, [profile.appliedJobIds]);

  // Achievements (computed badges)
  const achievements = useMemo(() => {
    const list: { id: string; label: string; desc: string; got: boolean }[] = [
      { id: "quiz", label: "Career Explorer", desc: "Hoàn thành Career Quiz", got: profile.quizDone },
      { id: "cv", label: "CV Ready", desc: "Đã upload CV", got: profile.hasUploadedCV },
      { id: "skill5", label: "Skill Mapper", desc: "Khai báo ≥ 5 skill", got: profile.topSkills.length >= 5 },
      { id: "save5", label: "Job Hunter", desc: "Lưu ≥ 5 job", got: profile.bookmarkedJobIds.length >= 5 },
      { id: "apply3", label: "Action Taker", desc: "Apply ≥ 3 job", got: profile.appliedJobIds.length >= 3 },
      { id: "full", label: "Complete Profile", desc: "Hồ sơ 100%", got: strength === 100 },
    ];
    return list;
  }, [profile, strength]);

  if (!isOnboarded) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-2xl rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/40 p-10 text-center dark:border-blue-800 dark:bg-blue-950/20">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            Bạn chưa có hồ sơ
          </h1>
          <p className="mx-auto mb-5 max-w-md text-sm text-slate-600 dark:text-slate-400">
            Hoàn thành onboarding 5 bước (~5 phút) để tạo hồ sơ cá nhân — chúng tôi sẽ gợi ý
            job, lộ trình &amp; skill chính xác cho bạn.
          </p>
          <Link
            href="/onboarding/welcome"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Bắt đầu onboarding →
          </Link>
        </div>
      </div>
    );
  }

  const headline = [
    profile.major ? majorLabels[profile.major] : null,
    profile.year ? `Năm ${profile.year}` : null,
    profile.goal ? goalLabels[profile.goal] : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="pb-10">
      {/* COVER + HERO */}
      <div className="relative">
        <div className="h-40 w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 sm:h-48 md:h-56">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-violet-400/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="-mt-16 flex flex-col gap-4 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              {/* Avatar */}
              <div className="relative">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-28 w-28 rounded-2xl border-4 border-white object-cover shadow-lg dark:border-slate-900 sm:h-32 sm:w-32"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-violet-500 to-purple-600 text-3xl font-bold text-white shadow-lg dark:border-slate-900 sm:h-32 sm:w-32">
                    {initials}
                  </div>
                )}
                <EditAvatarDialog
                  currentUrl={user?.avatarUrl}
                  onSave={(url) => updateProfile({ avatarUrl: url })}
                />
              </div>

              <div className="min-w-0 sm:pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">
                    {user?.name ?? "Sinh viên IT"}
                  </h1>
                  {user?.provider && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${providerMeta[user.provider].tone}`}
                    >
                      <Shield className="h-2.5 w-2.5" />
                      {providerMeta[user.provider].label}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                  {headline || "Chưa cập nhật ngành"}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {user?.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </span>
                  )}
                  {profile.university && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {profile.university}
                    </span>
                  )}
                  {user?.createdAt && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Tham gia {formatDate(user.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:pb-2">
              <EditNameDialog
                currentName={user?.name ?? ""}
                onSave={(name) => updateProfile({ name })}
              />
              <Link
                href="/onboarding/welcome?step=1"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                <Pencil className="h-3.5 w-3.5" />
                Chỉnh sửa hồ sơ
              </Link>
            </div>
          </div>

          {/* Quick stats strip */}
          <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-4 sm:gap-0 dark:border-slate-800 dark:bg-slate-900">
            <Stat
              icon={TrendingUp}
              label="Hoàn thiện"
              value={`${strength}%`}
              tone="text-blue-600"
            />
            <Stat
              icon={Target}
              label="Skills"
              value={profile.topSkills.length}
              tone="text-emerald-600"
            />
            <Stat
              icon={Bookmark}
              label="Đã lưu"
              value={profile.bookmarkedJobIds.length}
              tone="text-amber-600"
            />
            <Stat
              icon={Send}
              label="Đã apply"
              value={profile.appliedJobIds.length}
              tone="text-violet-600"
            />
          </div>

          {/* Profile strength banner if < 100 */}
          {strength < 100 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/30">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                    Hồ sơ {strength}% — còn {checklist.filter((c) => !c.done).length} bước nữa
                  </p>
                  <div className="mt-1 h-1.5 w-48 overflow-hidden rounded-full bg-amber-200 dark:bg-amber-900/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                </div>
              </div>
              {checklist.find((c) => !c.done) && (
                <Link
                  href={checklist.find((c) => !c.done)!.href}
                  className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  Tiếp tục
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="mx-auto mt-6 max-w-5xl px-4 md:px-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="skills">Skills &amp; CV</TabsTrigger>
            <TabsTrigger value="activity">Hoạt động</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-5 space-y-5">
            <div className="grid gap-5 md:grid-cols-3">
              <Card icon={Compass} title="Định hướng quan tâm" tone="blue">
                {profile.interests.length === 0 ? (
                  <Empty href="/onboarding/welcome?step=2" label="Chọn 1-3 mảng quan tâm" />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((i) => (
                      <span
                        key={i}
                        className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                      >
                        {interestLabels[i] ?? i}
                      </span>
                    ))}
                  </div>
                )}
                {profile.suggestedPaths.length > 0 && (
                  <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-500">Đề xuất từ Quiz:</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {profile.suggestedPaths.map((i) => (
                        <span
                          key={i}
                          className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300"
                        >
                          {interestLabels[i] ?? i}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              <Card icon={GraduationCap} title="Mục tiêu nghề nghiệp" tone="violet">
                {profile.goal ? (
                  <div className="space-y-2.5">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {goalLabels[profile.goal]}
                    </p>
                    {profile.targetSalaryUSD && (
                      <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/50">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Lương kỳ vọng
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                          ${profile.targetSalaryUSD.toLocaleString()}/năm
                        </p>
                        <p className="text-xs text-slate-500">
                          ~{Math.round((profile.targetSalaryUSD * 25000) / 12 / 1_000_000)}tr/tháng
                        </p>
                      </div>
                    )}
                    {profile.preferRemote && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <MapPin className="h-3 w-3" />
                        Ưu tiên Remote
                      </span>
                    )}
                  </div>
                ) : (
                  <Empty href="/onboarding/welcome?step=4" label="Đặt mục tiêu nghề nghiệp" />
                )}
              </Card>

              <Card icon={UserIcon} title="Hoàn thiện hồ sơ" tone="slate">
                <ul className="space-y-1.5">
                  {checklist.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={c.href}
                        className={`flex items-center gap-2 rounded px-1.5 py-1 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                          c.done ? "text-slate-400" : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {c.done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                        )}
                        <span className={`flex-1 ${c.done ? "line-through" : ""}`}>{c.label}</span>
                        {!c.done && (
                          <span className="shrink-0 rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            +{c.weight}%
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Achievements */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Thành tựu
                  </h2>
                </div>
                <span className="text-xs text-slate-500">
                  {achievements.filter((a) => a.got).length}/{achievements.length} đã đạt
                </span>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {achievements.map((a) => (
                  <div
                    key={a.id}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                      a.got
                        ? "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-900/60 dark:from-amber-950/30 dark:to-orange-950/20"
                        : "border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        a.got
                          ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-200 dark:shadow-amber-900/30"
                          : "bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                      }`}
                    >
                      <Award className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-bold ${
                          a.got
                            ? "text-amber-900 dark:text-amber-200"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {a.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* SKILLS & CV */}
          <TabsContent value="skills" className="mt-5 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-600" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Top Skills ({profile.topSkills.length})
                    </h2>
                  </div>
                  <Link
                    href="/onboarding/welcome?step=3"
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Chỉnh sửa →
                  </Link>
                </div>
                {profile.topSkills.length === 0 ? (
                  <Empty href="/onboarding/welcome?step=3" label="Khai báo skill mạnh nhất" />
                ) : (
                  <ul className="space-y-3">
                    {profile.topSkills.map((s) => (
                      <li key={s.name}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {s.name}
                          </span>
                          <span className="text-xs font-bold text-emerald-600">
                            {["Mới học", "Cơ bản", "Trung bình", "Khá", "Thành thạo"][s.level - 1] ??
                              `Level ${s.level}`}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                            style={{ width: `${(s.level / 5) * 100}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-600" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">CV</h2>
                  </div>
                  <Link
                    href="/cv-matching"
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Quản lý →
                  </Link>
                </div>
                {profile.hasUploadedCV && profile.cvFileName ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-3 dark:border-emerald-900/60 dark:from-emerald-950/30 dark:to-teal-950/20">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                          {profile.cvFileName}
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400">
                          ✓ Đã upload &amp; sẵn sàng so khớp
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/cv-matching"
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Phân tích CV với JD
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ) : (
                  <Empty href="/cv-matching" label="Upload CV (PDF/DOCX)" />
                )}

                {profile.lastAnalysisAt && (
                  <p className="mt-3 text-xs text-slate-500">
                    Phân tích gần nhất: {formatDate(profile.lastAnalysisAt)}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ACTIVITY */}
          <TabsContent value="activity" className="mt-5 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <ActivityList
                icon={Bookmark}
                tone="amber"
                title="Job đã lưu"
                count={profile.bookmarkedJobIds.length}
                href="/recommendations"
                jobs={bookmarkedJobs}
                emptyHref="/jobs"
                emptyLabel="Khám phá jobs để lưu"
              />
              <ActivityList
                icon={Send}
                tone="violet"
                title="Job đã apply"
                count={profile.appliedJobIds.length}
                href="/recommendations"
                jobs={appliedJobs}
                emptyHref="/recommendations"
                emptyLabel="Chuyển job từ 'Đã lưu' sang 'Đã apply'"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Trạng thái hành trình
                </h2>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                <Row label="Career Quiz" done={profile.quizDone} />
                <Row label="Onboarding 5 bước" done={isOnboarded} />
                <Row label="Upload CV" done={profile.hasUploadedCV} />
                <Row label="Khai báo ≥ 5 skill" done={profile.topSkills.length >= 5} />
                <Row label="Lưu ≥ 1 job" done={profile.bookmarkedJobIds.length >= 1} />
                <Row label="Apply ≥ 1 job" done={profile.appliedJobIds.length >= 1} />
              </ul>
            </div>
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings" className="mt-5 space-y-5">
            {/* Account */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-sm font-bold text-slate-900 dark:text-slate-100">
                Tài khoản
              </h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <Field label="Họ và tên" value={user?.name ?? "—"}>
                  <EditNameDialog
                    currentName={user?.name ?? ""}
                    onSave={(name) => updateProfile({ name })}
                  />
                </Field>
                <Field label="Email" value={user?.email ?? "—"}>
                  <span className="text-xs text-slate-400">Không thể đổi</span>
                </Field>
                <Field
                  label="Phương thức đăng nhập"
                  value={user ? providerMeta[user.provider].label : "—"}
                />
                <Field
                  label="Tham gia từ"
                  value={user ? formatDate(user.createdAt) : "—"}
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-sm font-bold text-slate-900 dark:text-slate-100">
                Tuỳ chọn
              </h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                      {theme === "dark" ? (
                        <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                      ) : (
                        <Sun className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Giao diện
                      </p>
                      <p className="text-xs text-slate-500">
                        Đang dùng: {theme === "dark" ? "Dark mode" : "Light mode"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Chuyển sang {theme === "dark" ? "Light" : "Dark"}
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                      <MapPin className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Ưu tiên Remote
                      </p>
                      <p className="text-xs text-slate-500">
                        Filter mặc định khi tìm job
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfile({ preferRemote: !profile.preferRemote })}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      profile.preferRemote ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                    aria-label="Toggle remote"
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        profile.preferRemote ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-sm font-bold text-slate-900 dark:text-slate-100">
                Bảo mật
              </h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                      <KeyRound className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Mật khẩu
                      </p>
                      <p className="text-xs text-slate-500">
                        {user?.provider === "password"
                          ? "Đổi mật khẩu đăng nhập định kỳ để bảo mật"
                          : `Đăng nhập qua ${providerMeta[user?.provider ?? "password"].label} — không có mật khẩu để đổi`}
                      </p>
                    </div>
                  </div>
                  {user?.provider === "password" ? (
                    <ChangePasswordDialog onSubmit={changePassword} />
                  ) : (
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      Không khả dụng
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                      <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Phiên đăng nhập
                      </p>
                      <p className="text-xs text-slate-500">
                        Lưu trong trình duyệt này (localStorage)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      router.replace("/auth/login");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>

            {/* Data & sessions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-sm font-bold text-slate-900 dark:text-slate-100">
                Dữ liệu &amp; phiên
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => exportData(profile, user)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  Xuất dữ liệu (JSON)
                </button>
                <Link
                  href="/onboarding/welcome"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Làm lại onboarding
                </Link>
                <button
                  onClick={() => {
                    logout();
                    router.replace("/auth/login");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Đăng xuất
                </button>
              </div>
            </div>

            {/* Danger zone */}
            <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 dark:border-red-900/60 dark:bg-red-950/10">
              <h2 className="mb-1 text-sm font-bold text-red-700 dark:text-red-300">
                Vùng nguy hiểm
              </h2>
              <p className="mb-4 text-xs text-red-600/80 dark:text-red-400/80">
                Các hành động dưới đây không thể hoàn tác.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (confirm("Xoá toàn bộ hồ sơ onboarding? Hành động này không thể hoàn tác.")) {
                      reset();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Xoá hồ sơ onboarding
                </button>
                <DeleteAccountDialog
                  requirePassword={user?.provider === "password"}
                  email={user?.email ?? ""}
                  onConfirm={async (pwd) => {
                    await deleteAccount(pwd);
                    reset();
                    router.replace("/auth/register");
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 sm:border-l sm:border-slate-100 sm:first:border-l-0 dark:sm:border-slate-800">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50`}>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="text-base font-bold text-slate-900 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tone: "blue" | "emerald" | "amber" | "violet" | "rose" | "slate";
  children: React.ReactNode;
}) {
  const toneMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300",
    violet: "bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${toneMap[tone]}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Empty({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 px-3 py-3 text-xs font-medium text-slate-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800/30 dark:hover:border-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
    >
      + {label}
    </Link>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-900 dark:text-slate-100">
          {value}
        </p>
      </div>
      {children}
    </div>
  );
}

function Row({ label, done }: { label: string; done: boolean }) {
  return (
    <li className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/30">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <Circle className="h-4 w-4 text-slate-300" />
      )}
      <span
        className={`text-sm ${
          done
            ? "font-medium text-slate-700 dark:text-slate-200"
            : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </li>
  );
}

function ActivityList({
  icon: Icon,
  tone,
  title,
  count,
  href,
  jobs,
  emptyHref,
  emptyLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "amber" | "violet";
  title: string;
  count: number;
  href: string;
  jobs: typeof jobsWithDetails;
  emptyHref: string;
  emptyLabel: string;
}) {
  const toneMap = {
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300",
    violet: "bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${toneMap[tone]}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {title} ({count})
          </h2>
        </div>
        {count > 0 && (
          <Link href={href} className="text-xs font-semibold text-blue-600 hover:underline">
            Xem tất cả →
          </Link>
        )}
      </div>
      {jobs.length === 0 ? (
        <Empty href={emptyHref} label={emptyLabel} />
      ) : (
        <ul className="space-y-2">
          {jobs.map((j) => (
            <li key={j.job_id}>
              <Link
                href={`/jobs/${j.job_id}`}
                className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5 transition-colors hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-bold text-slate-500 dark:from-slate-700 dark:to-slate-800 dark:text-slate-400">
                  {j.company.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {j.title}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    <Briefcase className="mr-1 inline h-3 w-3" />
                    {j.company.name}
                    {j.location ? ` · ${j.location}` : ""}
                  </p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- Edit dialogs ---------- */

function EditNameDialog({
  currentName,
  onSave,
}: {
  currentName: string;
  onSave: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Pencil className="h-3.5 w-3.5" />
          Đổi tên
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đổi tên hiển thị</DialogTitle>
          <DialogDescription>Tên này sẽ hiển thị trên hồ sơ và menu của bạn.</DialogDescription>
        </DialogHeader>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          placeholder="Nguyễn Văn A"
        />
        <DialogFooter>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Huỷ
          </button>
          <button
            disabled={!name.trim()}
            onClick={() => {
              onSave(name.trim());
              setOpen(false);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            Lưu
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditAvatarDialog({
  currentUrl,
  onSave,
}: {
  currentUrl?: string;
  onSave: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(currentUrl ?? "");

  // Curated dicebear avatar options
  const presets = useMemo(() => {
    const styles = ["initials", "thumbs", "bottts", "lorelei", "notionists"];
    const seeds = ["alpha", "beta", "gamma", "delta", "epsilon", "zeta"];
    return styles.flatMap((style) =>
      seeds.slice(0, 2).map(
        (seed) => `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`,
      ),
    );
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="Đổi ảnh đại diện"
          className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-md transition-transform hover:scale-105 dark:border-slate-900"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đổi ảnh đại diện</DialogTitle>
          <DialogDescription>
            Chọn avatar có sẵn hoặc dán URL ảnh của bạn.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setUrl(p)}
              className={`overflow-hidden rounded-lg border-2 p-1 transition-all ${
                url === p
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="avatar" className="h-12 w-12 rounded-md" />
            </button>
          ))}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Hoặc dán URL ảnh
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            placeholder="https://..."
          />
        </div>
        <DialogFooter>
          <button
            onClick={() => {
              onSave("");
              setOpen(false);
            }}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Bỏ avatar
          </button>
          <button
            onClick={() => {
              onSave(url);
              setOpen(false);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Lưu
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordDialog({
  onSubmit,
}: {
  onSubmit: (current: string, next: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength =
    next.length === 0
      ? 0
      : next.length < 6
        ? 25
        : next.length < 10
          ? 60
          : /[A-Z]/.test(next) && /[0-9]/.test(next)
            ? 100
            : 80;

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setShowCurrent(false);
    setShowNext(false);
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  const handleSubmit = async () => {
    setError(null);
    if (next !== confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(current, next);
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        reset();
      }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
          <KeyRound className="h-3.5 w-3.5" />
          Đổi mật khẩu
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
          <DialogDescription>
            Nhập mật khẩu hiện tại và mật khẩu mới (tối thiểu 6 ký tự).
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            Đổi mật khẩu thành công!
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  autoFocus
                  type={showCurrent ? "text" : "password"}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showNext ? "text" : "password"}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Tối thiểu 6 ký tự"
                />
                <button
                  type="button"
                  onClick={() => setShowNext((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNext ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              {next.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        strength < 50
                          ? "bg-red-500"
                          : strength < 100
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      strength < 50
                        ? "text-red-600"
                        : strength < 100
                          ? "text-amber-600"
                          : "text-emerald-600"
                    }`}
                  >
                    {strength < 50 ? "Yếu" : strength < 100 ? "Trung bình" : "Mạnh"}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Xác nhận mật khẩu mới
              </label>
              <input
                type={showNext ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <button
              onClick={() => {
                setOpen(false);
                reset();
              }}
              disabled={loading}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Huỷ
            </button>
            <button
              disabled={loading || !current || !next || !confirm}
              onClick={handleSubmit}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Đang lưu..." : "Đổi mật khẩu"}
            </button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountDialog({
  requirePassword,
  email,
  onConfirm,
}: {
  requirePassword: boolean;
  email: string;
  onConfirm: (password?: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setPassword("");
    setConfirmText("");
    setError(null);
    setLoading(false);
  };

  const handleSubmit = async () => {
    setError(null);
    if (confirmText !== "XOA") {
      setError('Vui lòng gõ chính xác "XOA" để xác nhận');
      return;
    }
    setLoading(true);
    try {
      await onConfirm(requirePassword ? password : undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50">
          <Trash2 className="h-3.5 w-3.5" />
          Xoá tài khoản
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
            Xoá tài khoản vĩnh viễn
          </DialogTitle>
          <DialogDescription>
            Hành động này sẽ xoá tài khoản <strong>{email}</strong> và toàn bộ dữ liệu hồ sơ.
            Không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {requirePassword && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="••••••••"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Gõ <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-[11px] text-red-700 dark:bg-red-950/40 dark:text-red-300">XOA</code> để xác nhận
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="XOA"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={() => {
              setOpen(false);
              reset();
            }}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Huỷ
          </button>
          <button
            disabled={loading || confirmText !== "XOA" || (requirePassword && !password)}
            onClick={handleSubmit}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Đang xoá..." : "Xoá vĩnh viễn"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Helpers ---------- */

function exportData(
  profile: ReturnType<typeof useOnboarding>["profile"],
  user: ReturnType<typeof useAuth>["user"],
) {
  const blob = new Blob(
    [JSON.stringify({ exportedAt: new Date().toISOString(), user, profile }, null, 2)],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `career-lens-profile-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
