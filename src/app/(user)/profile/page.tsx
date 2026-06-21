"use client";

import { useMemo, useState, useEffect } from "react";
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
  Calendar,
  Camera,
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
  Clock,
  Star,
  XCircle,
} from "lucide-react";
import {
  CareerInterest,
  Goal,
  StudentMajor,
  StudentYear,
  useOnboarding,
} from "@/contexts/onboarding/onboarding-context";
import { useAuth, type AuthProvider } from "@/contexts/auth/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GetSavedJobsResponse, GetSavedCoursesResponse } from "@/types/profile";
import ProfileApi from "@/api/profile";
import LearningRoadmapApi from "@/api/learning-roadmap";
import CvApi from "@/api/cv";
import { CvItemDto } from "@/types/cv";
import { toTitleCase } from "@/utils/text";

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
  product: "Product / PM",
  engineering_manager: "Quản lý Kỹ thuật",
  it_support: "IT Support",
  devrel: "DevRel / Đào tạo",
  business_analyst: "Business Analyst",
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
  password: {
    label: "Email & mật khẩu",
    tone: "bg-slate-100 text-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:text-slate-300",
  },
  google: {
    label: "Google",
    tone: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
  },
  facebook: {
    label: "Facebook",
    tone: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
  },
};

type ProfileEditForm = {
  fullName: string;
  school: string;
  major: StudentMajor | "";
  year: StudentYear | "";
  interests: CareerInterest[];
  goal: Goal | "";
  targetSalary: string;
  preferRemote: boolean;
};

const EMPTY_EDIT_FORM: ProfileEditForm = {
  fullName: "",
  school: "",
  major: "",
  year: "",
  interests: [],
  goal: "",
  targetSalary: "",
  preferRemote: false,
};

const studentYears: StudentYear[] = [1, 2, 3, 4, 5];
const majorOptions = Object.entries(majorLabels) as [StudentMajor, string][];
const interestOptions = Object.entries(interestLabels) as [
  CareerInterest,
  string,
][];
const goalOptions = Object.entries(goalLabels) as [Goal, string][];

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
  const { profile, isOnboarded, strength, checklist, reset, setProfile } =
    useOnboarding();
  const { user, logout, updateProfile, changePassword, deleteAccount } =
    useAuth();

  const initials = getInitials(user?.full_name || profile.major || "User");
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [savedJobs, setSavedJobs] = useState<GetSavedJobsResponse[]>([]);
  const [loadingSavedJobs, setLoadingSavedJobs] = useState<boolean>(false);
  const [savedCourses, setSavedCourses] = useState<GetSavedCoursesResponse[]>(
    [],
  );
  const [loadingSavedCourses, setLoadingSavedCourses] =
    useState<boolean>(false);
  const [allCvs, setAllCvs] = useState<CvItemDto[]>([]);
  const [isLoadingCvs, setIsLoadingCvs] = useState(false);
  const [updatingCvId, setUpdatingCvId] = useState<string | null>(null);
  const [viewingCvUrl, setViewingCvUrl] = useState<string | null>(null);
  const [viewingCvName, setViewingCvName] = useState<string>("");
  const [allowMatching, setAllowMatching] = useState<boolean>(false);
  const [togglingMatching, setTogglingMatching] = useState<boolean>(false);
  const [defaultCvId, setDefaultCvId] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState("overview");
  const [editForm, setEditForm] =
    useState<ProfileEditForm>(EMPTY_EDIT_FORM);
  const [savingProfile, setSavingProfile] = useState(false);
  const [resettingOnboarding, setResettingOnboarding] = useState(false);
  const [exportingProfilePdf, setExportingProfilePdf] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await ProfileApi.getMe();
        if (res.data) {
          const rawData = res.data;
          const userData = rawData.user;
          const orientationRaw = userData.orientation || "";
          const [selectedPart, quizPart] = orientationRaw.split("|");

          const apiInterests = selectedPart
            ? (selectedPart.split(",") as CareerInterest[])
            : [];
          const apiSuggestedPaths = quizPart
            ? (quizPart.split(",") as CareerInterest[])
            : [];

          const apiSkills = Array.isArray(rawData.cv_skills_summary)
            ? rawData.cv_skills_summary.map((skillName: string) => ({
                name: skillName,
                level: 1,
              }))
            : [];

          setAllowMatching(!!userData.allow_default_cv_matching);
          setDefaultCvId(rawData.default_cv?.cv_id || null);

          setProfile({
            major: userData.major ? (userData.major as StudentMajor) : null,
            university: userData.school || "",
            year:
              userData.current_year && Number(userData.current_year) > 0
                ? (Number(userData.current_year) as StudentYear)
                : null,
            interests: apiInterests,
            suggestedPaths: apiSuggestedPaths,
            topSkills: apiSkills,
            goal: userData.objective ? (userData.objective as Goal) : null,
            targetSalaryUSD: userData.target_salary || null,
            preferRemote: !!userData.prefer_remote,
            quizDone: apiSuggestedPaths.length > 0,
            hasUploadedCV: !!rawData.latest_cv,
            cvFileName: rawData.latest_cv?.file_name || null,
            completedAt: userData.onboarding_completed
              ? new Date().toISOString()
              : null,
          });
          fetchSavedJobs();
          fetchSavedCourses();
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin profile từ API thực tế:", err);
      }
    };

    fetchProfileData();
  }, []);

  const fetchAllCvs = async () => {
    try {
      setIsLoadingCvs(true);
      const res = await CvApi.getMyCvs();
      if (Array.isArray(res)) {
        setAllCvs(res);
      } else if (res && Array.isArray((res as any).data)) {
        setAllCvs((res as any).data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách CV:", error);
    } finally {
      setIsLoadingCvs(false);
    }
  };

  useEffect(() => {
    fetchAllCvs();
  }, []);

  const sortedCvs = useMemo(() => {
    if (!allCvs || allCvs.length === 0) return [];
    return [...allCvs].sort((a, b) => {
      const aIsDefault = a.cv_id === defaultCvId;
      const bIsDefault = b.cv_id === defaultCvId;
      if (aIsDefault && !bIsDefault) return -1;
      if (!aIsDefault && bIsDefault) return 1;
      return 0;
    });
  }, [allCvs, defaultCvId]);

  useEffect(() => {
    if (!openEditDialog) return;
    setEditError(null);
    setEditForm({
      fullName: user?.full_name || "",
      school: profile.university || "",
      major: profile.major || "",
      year: profile.year || "",
      interests: profile.interests || [],
      goal: profile.goal || "",
      targetSalary: profile.targetSalaryUSD
        ? String(profile.targetSalaryUSD)
        : "",
      preferRemote: profile.preferRemote,
    });
  }, [openEditDialog, profile, user]);

  const toggleEditInterest = (interest: CareerInterest) => {
    setEditForm((prev) => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return {
          ...prev,
          interests: prev.interests.filter((item) => item !== interest),
        };
      }

      return {
        ...prev,
        interests: [...prev.interests, interest].slice(0, 3),
      };
    });
  };

  const handleSaveProfileDialog = async () => {
    const trimmedName = editForm.fullName.trim();
    const trimmedSchool = editForm.school.trim();
    const salaryValue =
      editForm.targetSalary.trim() === ""
        ? null
        : Number(editForm.targetSalary);

    if (!trimmedName) {
      setEditError("Họ và tên không được để trống.");
      return;
    }

    if (
      salaryValue !== null &&
      (!Number.isFinite(salaryValue) || salaryValue < 0)
    ) {
      setEditError("Mức lương mục tiêu phải là số không âm.");
      return;
    }

    const selectedOrientation = editForm.interests.join(",");
    const quizOrientation = profile.suggestedPaths.join(",");
    const orientation =
      selectedOrientation || quizOrientation
        ? `${selectedOrientation}${quizOrientation ? `|${quizOrientation}` : ""}`
        : null;

    try {
      setSavingProfile(true);
      setEditError(null);
      await updateProfile({
        full_name: trimmedName,
        school: trimmedSchool || null,
        major: editForm.major || null,
        current_year: editForm.year ? Number(editForm.year) : null,
        orientation,
        objective: editForm.goal || null,
        target_salary: salaryValue,
        prefer_remote: editForm.preferRemote,
      });

      setProfile({
        major: editForm.major || null,
        university: trimmedSchool,
        year: editForm.year || null,
        interests: editForm.interests,
        goal: editForm.goal || null,
        targetSalaryUSD: salaryValue,
        preferRemote: editForm.preferRemote,
      });
      setOpenEditDialog(false);
    } catch (err) {
      console.error("Lỗi khi cập nhật hồ sơ:", err);
      setEditError(
        err instanceof Error ? err.message : "Không thể cập nhật hồ sơ.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResetOnboarding = async () => {
    const ok = confirm(
      "Xoá dữ liệu onboarding trên hệ thống và làm lại từ đầu? CV upload thật vẫn được giữ lại.",
    );
    if (!ok) return;

    try {
      setResettingOnboarding(true);
      setEditError(null);
      await ProfileApi.resetOnboarding();
      reset();
      setOpenEditDialog(false);
      router.replace("/onboarding/welcome");
    } catch (err) {
      console.error("Xoá onboarding thất bại:", err);
      setEditError(
        err instanceof Error ? err.message : "Không thể xoá onboarding.",
      );
    } finally {
      setResettingOnboarding(false);
    }
  };

  const handleExportProfilePdf = async () => {
    try {
      setExportingProfilePdf(true);
      setEditError(null);
      const blob = await ProfileApi.exportProfilePdf();
      downloadBlob(blob, `ho-so-careernova-${Date.now()}.pdf`);
    } catch (err) {
      console.error("Xuất PDF hồ sơ thất bại:", err);
      setEditError(err instanceof Error ? err.message : "Không thể xuất PDF hồ sơ.");
    } finally {
      setExportingProfilePdf(false);
    }
  };

  const handleSetDefault = async (cvId: string) => {
    try {
      setUpdatingCvId(cvId);
      await ProfileApi.setDefaultCv(cvId);
      setDefaultCvId(cvId);
      await fetchAllCvs();
    } catch (error) {
      console.error("Đặt CV mặc định thất bại:", error);
    } finally {
      setUpdatingCvId(null);
    }
  };

  const fetchSavedCourses = async () => {
    try {
      setLoadingSavedCourses(true);

      const res = await ProfileApi.getSavedCourses();

      if (res.data) {
        setSavedCourses(res.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khóa học đã lưu:", error);
    } finally {
      setLoadingSavedCourses(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      setLoadingSavedJobs(true);
      const res = await ProfileApi.getSavedJobs();
      if (res.data) {
        setSavedJobs(res.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách job đã lưu:", error);
    } finally {
      setLoadingSavedJobs(false);
    }
  };

  const handleUnsaveCourse = async (courseId: string) => {
    try {
      const res = await LearningRoadmapApi.toggleSaveCourse({
        course_id: courseId,
      });

      if (res) {
        setSavedCourses((prev) =>
          prev.filter(
            (item) => String(item.course?.course_id) !== String(courseId),
          ),
        );
      }
    } catch (error) {
      console.error("Lỗi khi hủy lưu khóa học:", error);
    }
  };

  // Hàm hủy lưu công việc
  const handleUnsaveJob = async (jobId: string) => {
    try {
      const res = await ProfileApi.deleteSavedJob(jobId);

      if (res) {
        setSavedJobs((prev) =>
          prev.filter((item) => String(item.job?.job_id) !== String(jobId)),
        );
      }
    } catch (error) {
      console.error("Lỗi khi hủy lưu công việc:", error);
    }
  };

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
      <div className="relative w-full overflow-hidden">
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
                    alt={user.full_name}
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
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white dark:text-slate-100 md:text-3xl">
                    {user?.full_name ?? "Sinh viên IT"}
                  </h1>
                  {user?.provider && providerMeta[user.provider] && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${providerMeta[user.provider]?.tone ?? providerMeta["password"].tone}`}
                    >
                      <Shield className="h-2.5 w-2.5" />
                      {providerMeta[user.provider]?.label ?? "Tài khoản"}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300 dark:text-slate-400">
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
              <button
                onClick={() => setOpenEditDialog(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
              >
                <Pencil className="h-3.5 w-3.5" />
                Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white p-3 shadow-sm sm:grid-cols-4 sm:gap-0 dark:border-slate-800 dark:bg-slate-900">
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
              label="Công việc đã lưu"
              value={savedJobs.length}
              tone="text-amber-600"
            />
            <Stat
              icon={Bookmark}
              label="Khóa học đã lưu"
              value={savedCourses.length}
              tone="text-amber-600"
            />
          </div>

          {/* Độ hoàn thiện hồ sơ banner if < 100 */}
          {strength < 100 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/30">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                    Hồ sơ {strength}% — còn{" "}
                    {checklist.filter((c) => !c.done).length} bước nữa
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

      <div className="mx-auto mt-6 max-w-5xl px-4 md:px-6">
        <Tabs
          value={profileTab}
          onValueChange={setProfileTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="skills">Skills &amp; CV</TabsTrigger>
            <TabsTrigger value="activity">Hoạt động</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-5 space-y-5">
            {/* CV đang dùng để so khớp — xương sống của toàn app */}
            {(() => {
              const defaultCv = sortedCvs.find(
                (c: any) => c.cv_id === defaultCvId,
              );
              return (
                <div
                  className={`flex flex-wrap items-center gap-3 rounded-2xl border p-4 ${
                    defaultCv
                      ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/20"
                      : "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      defaultCv
                        ? "bg-emerald-500 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {defaultCv ? (
                      <>
                        <p className="text-sm font-bold text-slate-900 dark:text-white dark:text-slate-100">
                          CV đang dùng để so khớp:{" "}
                          <span className="text-emerald-700 dark:text-emerald-400">
                            {defaultCv.file_name}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Mọi gợi ý việc làm & độ phù hợp đều dựa trên CV này.
                          {allowMatching
                            ? " Đang bật so khớp tự động."
                            : " So khớp tự động đang tắt."}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                          Chưa có CV để so khớp
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                          Tải CV để mở khóa gợi ý việc làm & phân tích kỹ năng cá
                          nhân hóa.
                        </p>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => setProfileTab("skills")}
                    className="shrink-0 rounded-lg bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700"
                  >
                    {defaultCv ? "Đổi CV" : "Quản lý CV"}
                  </button>
                </div>
              );
            })()}

            {/* Hồ sơ hướng nghiệp RIASEC */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white dark:text-slate-100">
                    Hồ sơ hướng nghiệp (RIASEC)
                  </h3>
                  {profile.riasec?.code && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                      {profile.riasec.code}
                    </span>
                  )}
                </div>
                <Link
                  href="/onboarding/welcome?step=2"
                  className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  {profile.riasec ? "Làm lại bài test" : "Làm bài test"}
                </Link>
              </div>

              {profile.riasec && profile.riasec.top.length > 0 ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {profile.riasec.top.map((d) => (
                      <div
                        key={d.dim}
                        className="rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-800/50 p-3 dark:border-slate-800 dark:bg-slate-800/40"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200">
                            {d.label}
                          </span>
                          <span className="text-xs font-bold text-violet-600 dark:text-violet-300">
                            {d.percent}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                            style={{ width: `${d.percent}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                          {d.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] text-slate-400">
                    Dựa trên mô hình RIASEC (Holland) & O*NET Interest Profiler.
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bạn chưa làm bài trắc nghiệm hướng nghiệp. Hoàn thành để biết
                  nhóm sở thích nghề nghiệp và các hướng IT phù hợp.
                </p>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <Card icon={Compass} title="Định hướng quan tâm" tone="blue">
                {profile.interests.length === 0 ? (
                  <Empty
                    href="/onboarding/welcome?step=2"
                    label="Chọn 1-3 mảng quan tâm"
                  />
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
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Đề xuất từ Quiz:
                    </p>
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

              <Card
                icon={GraduationCap}
                title="Mục tiêu nghề nghiệp"
                tone="violet"
              >
                {profile.goal ? (
                  <div className="space-y-2.5">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200">
                      {goalLabels[profile.goal]}
                    </p>
                    {profile.targetSalaryUSD && (
                      <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/50">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Lương kỳ vọng
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white dark:text-slate-100">
                          ${profile.targetSalaryUSD.toLocaleString()}/năm
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          ~
                          {Math.round(
                            (profile.targetSalaryUSD * 25000) / 12 / 1_000_000,
                          )}
                          tr/tháng
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
                  <Empty
                    href="/onboarding/welcome?step=4"
                    label="Đặt mục tiêu nghề nghiệp"
                  />
                )}
              </Card>

              <Card icon={UserIcon} title="Hoàn thiện hồ sơ" tone="slate">
                <ul className="space-y-1.5">
                  {checklist.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={c.href}
                        className={`flex items-center gap-2 rounded px-1.5 py-1 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                          c.done
                            ? "text-slate-400"
                            : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {c.done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                        )}
                        <span
                          className={`flex-1 ${c.done ? "line-through" : ""}`}
                        >
                          {c.label}
                        </span>
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
          </TabsContent>

          {/* SKILLS & CV - Đã loại bỏ hoàn toàn Level & Progress bar rườm rà */}
          <TabsContent value="skills" className="mt-5 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-600" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white dark:text-slate-100">
                      Kỹ năng chủ lực ({profile.topSkills.length})
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
                  <Empty
                    href="/onboarding/welcome?step=3"
                    label="Khai báo skill mạnh nhất"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.topSkills.map((s) => (
                      <span
                        key={s.name}
                        className="px-3 py-1.5 text-sm font-medium bg-slate-100 text-slate-800 dark:text-slate-100 dark:bg-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-600" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white dark:text-slate-100">
                      Hồ sơ CV của bạn ({sortedCvs.length})
                    </h2>
                  </div>
                  <Link
                    href="/cv-matching"
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Quản lý →
                  </Link>
                </div>

                {/* Nội dung danh sách CV */}
                {isLoadingCvs ? (
                  <div className="p-8 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex justify-center items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                ) : sortedCvs.length === 0 ? (
                  <Empty href="/cv-matching" label="Tải CV (PDF/DOCX)" />
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                      {sortedCvs.map((cv) => {
                        const isCurrentDefault = cv.cv_id === defaultCvId;

                        return (
                          <div
                            key={cv.cv_id}
                            className={`p-3 border rounded-xl flex items-center justify-between gap-3 transition-all ${
                              isCurrentDefault
                                ? "border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 dark:border-emerald-900/60 dark:from-emerald-950/20 dark:to-teal-950/10 shadow-sm"
                                : "bg-white border-slate-100 hover:border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
                            }`}
                          >
                            {/* Info CV */}
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`p-2 rounded-lg shrink-0 ${
                                  isCurrentDefault
                                    ? "bg-emerald-500 text-white"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                }`}
                              >
                                <FileText className="h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p
                                  className="truncate text-xs font-bold text-slate-900 dark:text-white dark:text-slate-100"
                                  title={cv.file_name}
                                >
                                  {cv.file_name}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {isCurrentDefault
                                    ? "✓ Đang chọn mặc định"
                                    : "Hồ sơ lưu trữ"}
                                </p>
                              </div>
                            </div>

                            {/* Nút tác vụ */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Nút đặt Default */}
                              <button
                                type="button"
                                disabled={
                                  isCurrentDefault || updatingCvId === cv.cv_id
                                }
                                onClick={async () => {
                                  await handleSetDefault(cv.cv_id);
                                  // Cập nhật lại UI text của profile instant mà không cần f5
                                  if (profile)
                                    profile.cvFileName = cv.file_name;
                                }}
                                className={`px-2 py-1 border font-semibold rounded-lg text-[9px] transition-all ${
                                  isCurrentDefault
                                    ? "bg-emerald-600 border-emerald-600 text-white"
                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
                                }`}
                              >
                                {updatingCvId === cv.cv_id
                                  ? "..."
                                  : isCurrentDefault
                                    ? "Mặc định ⭐"
                                    : "Chọn"}
                              </button>
                              {/* Nút Xem CV (Thay đổi thành mở Popup tại đây) */}
                              {cv.file_url && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setViewingCvUrl(cv.file_url);
                                    setViewingCvName(cv.file_name);
                                  }}
                                  className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg shadow-sm transition-colors dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400"
                                  title="Xem nội dung CV"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Nút điều hướng */}
                    <Link
                      href="/cv-matching"
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                      Phân tích CV với JD
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}

                {profile?.lastAnalysisAt && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Phân tích gần nhất: {formatDate(profile.lastAnalysisAt)}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CỘT 1: CÔNG VIỆC ĐÃ LƯU */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Công việc đã lưu ({savedJobs.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Xem lại các cơ hội việc làm bạn đã đánh dấu quan tâm.
                  </p>
                </div>

                <div className="mt-4 space-y-4">
                  {loadingSavedJobs ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin text-slate-500 dark:text-slate-400" />
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                        Đang tải danh sách...
                      </span>
                    </div>
                  ) : savedJobs.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 dark:border-slate-800 rounded-xl">
                      <Bookmark className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Bạn chưa lưu công việc nào.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedJobs.map((item) => {
                        const job = item.job;
                        if (!job) return null;

                        return (
                          <div
                            key={item.saved_job_id}
                            className="relative flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  {job.company?.url ? (
                                    <img
                                      src={job.company.url}
                                      alt={job.company.name}
                                      className="h-10 w-10 rounded-lg object-cover border border-slate-100 dark:border-slate-800"
                                    />
                                  ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                      <Building2 className="h-5 w-5" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">
                                      {toTitleCase(job.title)}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                      {job.company?.name}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleUnsaveJob(job.job_id)}
                                  className="rounded-full p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition shrink-0"
                                  title="Hủy lưu công việc"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                {job.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />{" "}
                                    {job.location}
                                  </span>
                                )}
                                {job.salary && (
                                  <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                                    {job.salary}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-2 dark:border-slate-800 text-[11px] text-slate-400">
                              <span>
                                Đã lưu:{" "}
                                {new Date(item.created_at).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </span>
                              <Link
                                href={`/jobs/${job.job_id}`}
                                className="flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400"
                              >
                                Chi tiết <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* CỘT 2: KHÓA HỌC ĐÃ LƯU */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Khóa học đã lưu ({savedCourses.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Theo dõi lộ trình học tập và các kiến thức nâng cao kỹ năng.
                  </p>
                </div>

                <div className="mt-4 space-y-4">
                  {loadingSavedCourses ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin text-slate-500 dark:text-slate-400" />
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                        Đang tải danh sách...
                      </span>
                    </div>
                  ) : savedCourses.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 dark:border-slate-800 rounded-xl">
                      <GraduationCap className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Bạn chưa lưu khóa học nào.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedCourses.map((item) => {
                        const course = item.course;
                        if (!course) return null;

                        return (
                          <div
                            key={item.course_id}
                            className="relative flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  {course.thumbnail_icon ? (
                                    <img
                                      src={course.thumbnail_icon}
                                      alt={course.course_title}
                                      className="h-10 w-10 rounded-lg object-cover border border-slate-100 dark:border-slate-800"
                                    />
                                  ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                      <GraduationCap className="h-5 w-5" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <h4
                                      className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1"
                                      title={course.course_title}
                                    >
                                      {course.course_title}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                      {course.provider_name}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={() =>
                                    handleUnsaveCourse(course.course_id)
                                  }
                                  className="rounded-full p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition shrink-0"
                                  title="Hủy lưu khóa học"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                {course.duration_hours && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />{" "}
                                    {course.duration_hours} giờ
                                  </span>
                                )}
                                {course.rating > 0 && (
                                  <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                                    <Star className="h-3 w-3 fill-current" />{" "}
                                    {course.rating}
                                  </span>
                                )}
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                  {course.price === 0
                                    ? "Miễn phí"
                                    : `${course.price.toLocaleString()} ${course.currency || "đ"}`}
                                </span>
                              </div>

                              {course.skills_tags &&
                                course.skills_tags.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {course.skills_tags
                                      .slice(0, 3)
                                      .map((tag, idx) => (
                                        <span
                                          key={idx}
                                          className="bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                  </div>
                                )}
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-2 dark:border-slate-800 text-[11px] text-slate-400">
                              <span>
                                Đã lưu:{" "}
                                {new Date(
                                  item.saved_at || Date.now(),
                                ).toLocaleDateString("vi-VN")}
                              </span>
                              <a
                                href={course.source_url!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400"
                              >
                                Xem bài học
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* DIALOG CHỈNH SỬA HỒ SƠ TỔNG HỢP - CHUYỂN TỪ TAB CÀI ĐẶT CŨ SANG */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        {/* Thay thế class của DialogContent để ép chiều rộng lớn hơn */}
        <DialogContent className="p-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 w-full max-w-2xl h-[85vh] flex flex-col">
          {/* HEADER: Giữ cố định trên cùng, không bị cuộn */}
          <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white dark:text-slate-100">
              Cấu hình thông tin tài khoản
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
              Quản lý toàn bộ thông tin cá nhân, bảo mật mật khẩu và tùy chọn hệ
              thống.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pl-6 pr-6 py-4 space-y-4 divide-y divide-slate-100 dark:divide-slate-800 min-h-0">
            {editError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {editError}
              </div>
            )}

            <div className="space-y-3 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Thông tin cơ bản
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        fullName: event.target.value,
                      }))
                    }
                    placeholder="Nhập họ tên..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
                    Trường Đại học
                  </label>
                  <input
                    type="text"
                    value={editForm.school}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        school: event.target.value,
                      }))
                    }
                    placeholder="Nhập tên trường học..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Địa chỉ Email: <strong>{user?.email ?? "—"}</strong>
                </span>
              </div>
            </div>

            <div className="space-y-3 py-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Onboarding & định hướng
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
                    Ngành học
                  </label>
                  <select
                    value={editForm.major}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        major: event.target.value as StudentMajor | "",
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white dark:text-slate-100"
                  >
                    <option value="">Chưa chọn</option>
                    {majorOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
                    Năm học
                  </label>
                  <select
                    value={editForm.year}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        year: event.target.value
                          ? (Number(event.target.value) as StudentYear)
                          : "",
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white dark:text-slate-100"
                  >
                    <option value="">Chưa chọn</option>
                    {studentYears.map((year) => (
                      <option key={year} value={year}>
                        Năm {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
                    Định hướng quan tâm
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {editForm.interests.length}/3
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map(([value, label]) => {
                    const selected = editForm.interests.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleEditInterest(value)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          selected
                            ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-300"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
                    Mục tiêu nghề nghiệp
                  </label>
                  <select
                    value={editForm.goal}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        goal: event.target.value as Goal | "",
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white dark:text-slate-100"
                  >
                    <option value="">Chưa chọn</option>
                    {goalOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
                    Lương mục tiêu / năm
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.targetSalary}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        targetSalary: event.target.value,
                      }))
                    }
                    placeholder="Ví dụ: 12000"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white dark:text-slate-100">
                    Ưu tiên làm việc Từ xa
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bộ lọc mặc định khi tìm kiếm việc làm
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditForm((prev) => ({
                      ...prev,
                      preferRemote: !prev.preferRemote,
                    }))
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${
                    editForm.preferRemote
                      ? "bg-blue-600"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      editForm.preferRemote
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 3. Phần bảo mật tài khoản */}
            <div className="space-y-3 py-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                An toàn bảo mật
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white dark:text-slate-100">
                    Mật khẩu đăng nhập
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.provider === "password"
                      ? "Thay đổi mật khẩu tài khoản định kỳ"
                      : `Đăng nhập qua liên kết ${providerMeta[user?.provider ?? "password"]?.label} — Không có mật khẩu`}
                  </p>
                </div>
                {user?.provider === "password" ? (
                  <ChangePasswordDialog onSubmit={changePassword} />
                ) : (
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-400 dark:bg-slate-800">
                    Không khả dụng
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white dark:text-slate-100">
                    Phương thức:{" "}
                    <span className="font-bold text-blue-600">
                      {user?.provider
                        ? (providerMeta[user.provider]?.label ?? "Liên kết")
                        : "—"}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tham gia hệ thống vào ngày:{" "}
                    {user ? formatDate(user.createdAt) : "—"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    router.replace("/auth/login");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <LogOut className="h-3.5 w-3.5" /> Đăng xuất
                </button>
              </div>
            </div>

            {/* 3b. Cấu hình tự động đối sánh CV */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex-1 pr-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-white dark:text-slate-100">
                  Tự động đối sánh CV mặc định
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cho phép hệ thống tự động phân tích CV và gợi ý việc làm phù
                  hợp trên Dashboard, Phân tích kỹ năng và Khuyến nghị
                </p>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  🔒 CV chỉ dùng để phân tích cho riêng bạn — không chia sẻ với
                  bên thứ ba. Bạn có thể tắt hoặc xóa CV bất cứ lúc nào.
                </p>
              </div>
              <button
                role="switch"
                aria-checked={allowMatching}
                disabled={togglingMatching}
                onClick={async () => {
                  try {
                    setTogglingMatching(true);
                    await ProfileApi.updateCvMatchingPermission(!allowMatching);
                    setAllowMatching((v) => !v);
                  } catch (err) {
                    console.error("Cập nhật quyền đối sánh thất bại:", err);
                  } finally {
                    setTogglingMatching(false);
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                  allowMatching
                    ? "bg-blue-600"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    allowMatching ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* 4. Vùng nguy hiểm */}
            <div className="pt-4 pb-2 flex flex-wrap gap-2">
              <button
                onClick={handleResetOnboarding}
                disabled={resettingOnboarding}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
              >
                {resettingOnboarding ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Xoá Onboarding
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
              <button
                onClick={handleExportProfilePdf}
                disabled={exportingProfilePdf}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {exportingProfilePdf ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                {exportingProfilePdf ? "Đang xuất PDF..." : "Xuất PDF hồ sơ"}
              </button>
            </div>
          </div>

          {/* FOOTER: Cố định dưới chân Dialog, không bị cuộn lấp mất nút */}
          <DialogFooter className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/50 dark:bg-slate-900/50 flex items-center justify-end gap-2">
            <button
              onClick={() => setOpenEditDialog(false)}
              disabled={savingProfile}
              className="rounded-lg border border-slate-200 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSaveProfileDialog}
              disabled={savingProfile}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm disabled:opacity-60"
            >
              {savingProfile && <RefreshCw className="h-4 w-4 animate-spin" />}
              Xác nhận lưu
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {viewingCvUrl && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden scale-in duration-200">
            {/* Header Popup */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50 dark:bg-slate-900/80 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white dark:text-slate-100 text-sm truncate">
                  {viewingCvName}
                </h3>
              </div>
              <button
                onClick={() => {
                  setViewingCvUrl(null);
                  setViewingCvName("");
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 dark:hover:text-slate-200 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung file hiển thị */}
            <div className="flex-1 bg-slate-100/50 dark:bg-slate-800/50 dark:bg-slate-950 p-4 flex justify-center items-center overflow-auto">
              {viewingCvUrl.toLowerCase().includes(".pdf") ? (
                <iframe
                  src={`${viewingCvUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:border-slate-800"
                  title="CV Preview"
                />
              ) : (
                <div className="max-w-full max-h-full overflow-auto flex justify-center">
                  <img
                    src={viewingCvUrl}
                    alt="CV Preview"
                    className="max-w-full h-auto object-contain rounded-lg shadow-md bg-white dark:bg-slate-900 dark:bg-slate-800"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50">
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="text-base font-bold text-slate-900 dark:text-white dark:text-slate-100">
          {value}
        </p>
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
    emerald:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300",
    amber:
      "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300",
    violet:
      "bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${toneMap[tone]}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="text-sm font-bold text-slate-900 dark:text-white dark:text-slate-100">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

function Empty({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 px-3 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800/30 dark:hover:border-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
    >
      + {label}
    </Link>
  );
}

function Row({ label, done }: { label: string; done: boolean }) {
  return (
    <li className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 dark:bg-slate-800/50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/30">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <Circle className="h-4 w-4 text-slate-300" />
      )}
      <span
        className={`text-sm ${done ? "font-medium text-slate-700 dark:text-slate-200" : "text-slate-500"}`}
      >
        {label}
      </span>
    </li>
  );
}


/* ---------- Edit dialogs ---------- */

function EditAvatarDialog({
  currentUrl,
  onSave,
}: {
  currentUrl?: string;
  onSave: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(currentUrl ?? "");
  const [uploading, setUploading] = useState(false);

  // State quản lý link preview tạm thời dưới máy client
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // State lưu trữ file thực tế để đợi khi bấm "Lưu" mới tiến hành upload (hoặc upload trước tùy bạn, ở đây tối ưu upload trước)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const presets = useMemo(() => {
    const styles = ["initials", "thumbs", "bottts", "lorelei", "notionists"];
    const seeds = ["alpha", "beta", "gamma", "delta", "epsilon", "zeta"];
    return styles.flatMap((style) =>
      seeds
        .slice(0, 2)
        .map(
          (seed) => `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`,
        ),
    );
  }, []);

  useEffect(() => {
    if (!open) {
      // Thu hồi bộ nhớ của ObjectURL cũ để tránh rò rỉ bộ nhớ
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setSelectedFile(null);
    } else {
      // Chỉ set ban đầu khi MỞ POPUP lên để đảm bảo bốc đúng ảnh hiện tại
      setUrl(currentUrl ?? "");
    }
  }, [open]);

  // 1. Xử lý hiển thị Preview ngay khi vừa chọn file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    // Tạo đường dẫn tạm blob:http://... để hiển thị preview ngay lập tức
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setSelectedFile(file);

    // Kích hoạt upload lên Cloudinary ngay để lấy link xịn
    try {
      setUploading(true);
      const res = await ProfileApi.uploadAvatar(file);
      const legacyResponse = res as typeof res & {
        avatar_url?: string;
        url?: string;
      };
      const uploadedAvatarUrl =
        res.data?.url ||
        res.data?.avatar_url ||
        legacyResponse.url ||
        legacyResponse.avatar_url;

      if (!uploadedAvatarUrl) {
        throw new Error("API upload avatar không trả về URL hợp lệ");
      }

      // 1. Lưu link Cloudinary thực tế vào state ẩn của dialog để làm preview/mẫu
      setUrl(uploadedAvatarUrl);

      // 2. ĐỒNG BỘ NGAY: Đẩy URL mới này ra ngoài để cập nhật State Auth của user liền lập tức
      onSave(uploadedAvatarUrl);
    } catch (error) {
      console.error("Lỗi khi upload ảnh đại diện:", error);
      alert("Tải ảnh lên Cloudinary thất bại, vui lòng thử lại!");
    } finally {
      setUploading(false);
    }
  };

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đổi ảnh đại diện</DialogTitle>
          <DialogDescription>
            Tải ảnh lên từ thiết bị, chọn avatar có sẵn hoặc dán URL ảnh của
            bạn.
          </DialogDescription>
        </DialogHeader>

        {/* Khu vực Tải file trực tiếp & Hiển thị PREVIEW to rõ ràng */}
        <div className="space-y-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
            Tải ảnh lên từ thiết bị
          </label>
          <div className="flex items-center gap-4">
            <label
              className={`flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/50 ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <Camera className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              {uploading ? "Đang xử lý ảnh..." : "Chọn tệp ảnh"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>

            {/* Vùng hiển thị ảnh Preview hoành tráng */}
            {(previewUrl || url) && (
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-1.5 pr-4 dark:border-slate-800 dark:bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl || url}
                  alt="Avatar Preview"
                  className={`h-12 w-12 rounded-lg object-cover ring-2 ring-blue-500/20 ${uploading ? "animate-pulse opacity-50" : ""}`}
                />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300">
                    {previewUrl ? "Ảnh xem trước" : "Ảnh hiện tại"}
                  </span>
                  <span className="text-[10px] text-slate-400 max-w-[120px] truncate">
                    {uploading
                      ? "Đang đồng bộ Cloudinary..."
                      : "Sẵn sàng áp dụng"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Khu vực Chọn từ danh sách ảnh mẫu (Presets) */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
            Hoặc chọn nhanh avatar mẫu
          </label>
          <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1 border border-slate-100 rounded-lg dark:border-slate-800">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPreviewUrl(null); // Xóa bộ nhớ preview local nếu chuyển sang chọn mẫu có sẵn
                  setUrl(p);
                }}
                disabled={uploading}
                className={`overflow-hidden rounded-lg border-2 p-1 transition-all ${
                  url === p && !previewUrl
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt="avatar" className="h-12 w-12 rounded-md" />
              </button>
            ))}
          </div>
        </div>

        {/* Khu vực Dán link ảnh thủ công */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
            Hoặc dán trực tiếp URL ảnh bất kỳ
          </label>
          <input
            value={previewUrl ? "" : url}
            onChange={(e) => {
              setPreviewUrl(null);
              setUrl(e.target.value);
            }}
            disabled={uploading}
            className="w-full rounded-lg border border-slate-200 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 disabled:opacity-60"
            placeholder="https://..."
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <button
            onClick={() => {
              onSave("");
              setUrl("");
              setOpen(false);
            }}
            disabled={uploading}
            className="rounded-lg border border-slate-200 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 disabled:opacity-50"
          >
            Bỏ avatar
          </button>
          <button
            onClick={() => {
              // Thực thi truyền URL mới ra ngoài component cha để lưu vào context của useAuth()
              onSave(url);
              setOpen(false);
            }}
            disabled={uploading || (!url && !previewUrl)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
          >
            Lưu thay đổi
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

  const pwdStrength =
    next.length === 0
      ? 0
      : next.length < 6
        ? 25
        : next.length < 10
          ? 60
          : /[A-Z]/.test(next) && /[0-9]/.test(next)
            ? 100
            : 80;

  const resetDialog = () => {
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
        resetDialog();
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
        if (!v) resetDialog();
      }}
    >
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
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
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  autoFocus
                  type={showCurrent ? "text" : "password"}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white dark:bg-slate-900 px-3 py-2 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 dark:hover:text-slate-200"
                >
                  {showCurrent ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showNext ? "text" : "password"}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white dark:bg-slate-900 px-3 py-2 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Tối thiểu 6 ký tự"
                />
                <button
                  type="button"
                  onClick={() => setShowNext((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 dark:hover:text-slate-200"
                >
                  {showNext ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              {next.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pwdStrength < 50
                          ? "bg-red-500"
                          : pwdStrength < 100
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{ width: `${pwdStrength}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      pwdStrength < 50
                        ? "text-red-600"
                        : pwdStrength < 100
                          ? "text-amber-600"
                          : "text-emerald-600"
                    }`}
                  >
                    {pwdStrength < 50
                      ? "Yếu"
                      : pwdStrength < 100
                        ? "Trung bình"
                        : "Mạnh"}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
                Xác nhận mật khẩu mới
              </label>
              <input
                type={showNext ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
                resetDialog();
              }}
              disabled={loading}
              className="rounded-lg border border-slate-200 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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

  const resetDelDialog = () => {
    setPassword("");
    setConfirmText("");
    setError(null);
    loading && setLoading(false);
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
        if (!v) resetDelDialog();
      }}
    >
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50">
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
            Hành động này sẽ xoá tài khoản <strong>{email}</strong> và toàn bộ
            dữ liệu hồ sơ. Không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {requirePassword && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="••••••••"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
              Gõ{" "}
              <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-[11px] text-red-700 dark:bg-red-950/40 dark:text-red-300">
                XOA
              </code>{" "}
              để xác nhận
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
              resetDelDialog();
            }}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Huỷ
          </button>
          <button
            disabled={
              loading || confirmText !== "XOA" || (requirePassword && !password)
            }
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

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
