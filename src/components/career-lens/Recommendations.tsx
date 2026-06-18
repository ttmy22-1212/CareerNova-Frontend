"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  BookOpen,
  Briefcase,
  Building2,
  Award,
  Clock,
  DollarSign,
  MapPin,
  ChevronRight,
  BookmarkCheck,
  ExternalLink,
  Star,
  Calendar,
  BarChart3,
  FileText,
  Eye,
  Heart,
  Plus,
} from "lucide-react";
import { useOnboarding } from "@/contexts/onboarding/onboarding-context";
import { EmptyState } from "./EmptyState";
import RecommendationApi from "@/api/recommendation";
import ProfileApi from "@/api/profile";
import JobApi from "@/api/job";
import PersonalDashboardApi from "@/api/personal-dashboard";
import SkillGapApi from "@/api/skill-gap";
import {
  CareerPathRecommendation,
  PrioritySkill,
  RecommendedJob,
  SavedReportItem,
} from "@/types/recommendation";
import { JobDetailResponse } from "@/types/job-insight";
import { SkillGapLearningRecommendationDto } from "@/types/skill-gap";
import { formatSalaryRange } from "@/utils/salary";

type PipelineJobItem = {
  job: {
    job_id: string;
    title: string;
    company: { name: string };
    location: string | null;
    work_type: string | null;
    salary: { min_salary: string; max_salary: string };
  };
  overall_score: number | null;
};

const VIEWED_JOB_IDS_STORAGE_KEY = "viewed_job_ids";

const urgencyConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  critical: { label: "Rất quan trọng", bg: "bg-red-100", text: "text-red-700" },
  high: {
    label: "Ưu tiên cao",
    bg: "bg-orange-100",
    text: "text-orange-700",
  },
  medium: { label: "Trung bình", bg: "bg-amber-100", text: "text-amber-700" },
  low: { label: "Theo dõi", bg: "bg-slate-100", text: "text-slate-600" },
};

const parseMatchRate = (matchRate?: string | null) => {
  const parsedRate = Number.parseInt(String(matchRate || ""), 10);
  return Number.isFinite(parsedRate) ? parsedRate : null;
};

const readViewedJobIds = () => {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(VIEWED_JOB_IDS_STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    if (!Array.isArray(parsedValue)) return [];

    return parsedValue.map(String).filter(Boolean);
  } catch (error) {
    console.error("Không thể đọc danh sách job đã xem:", error);
    return [];
  }
};

const formatPipelineSalary = (
  salary: JobDetailResponse["salary"] | null | undefined,
) => {
  return formatSalaryRange(salary);
};

const formatCoursePrice = (price: number | null | undefined) => {
  if (!price || price <= 0) {
    return "Miễn phí/không rõ";
  }

  return `${price.toLocaleString("vi-VN")} đ`;
};

export function Recommendations() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "saved" | "resources"
  >("overview");
  const { profile } = useOnboarding();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // ── HOOKS GỌI API THỰC TẾ TRUYỀN DỮ LIỆU ĐỘNG ──
  const [apiJobs, setApiJobs] = useState<RecommendedJob[]>([]);
  const [apiReports, setApiReports] = useState<SavedReportItem[]>([]);
  const [prioritySkills, setPrioritySkills] = useState<PrioritySkill[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPathRecommendation[]>(
    [],
  );
  const [learningRecommendations, setLearningRecommendations] = useState<
    SkillGapLearningRecommendationDto[]
  >([]);
  const [savedJobsFromProfile, setSavedJobsFromProfile] = useState<any[]>([]);
  const [viewedJobDetails, setViewedJobDetails] = useState<
    JobDetailResponse[]
  >([]);
  const [bannerStats, setBannerStats] = useState<{
    profileCompletion: number;
    suitableJobs: number;
    matchScore: number;
  } | null>(null);

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const [
          jobsRes,
          reportsRes,
          prioritySkillsRes,
          careerPathsRes,
          learningPathsRes,
          bannerRes,
          statsRes,
        ] = await Promise.all([
          PersonalDashboardApi.getRecommendedJobs(),
          RecommendationApi.getSavedReports(),
          RecommendationApi.getPrioritySkills(4),
          RecommendationApi.getCareerPaths(3),
          SkillGapApi.getLearningPaths(4),
          PersonalDashboardApi.getBanner(),
          PersonalDashboardApi.getStatistics(),
        ]);
        if (jobsRes?.data) setApiJobs(jobsRes.data as RecommendedJob[]);
        if (reportsRes?.data) setApiReports(reportsRes.data);
        if (prioritySkillsRes?.data) setPrioritySkills(prioritySkillsRes.data);
        if (careerPathsRes?.data) setCareerPaths(careerPathsRes.data);
        if (learningPathsRes?.data) {
          setLearningRecommendations(learningPathsRes.data);
        }
        if (bannerRes?.data || statsRes?.data) {
          setBannerStats({
            profileCompletion:
              statsRes?.data?.profile_completion_percentage ?? 0,
            suitableJobs: bannerRes?.data?.suitable_jobs_count ?? 0,
            matchScore:
              bannerRes?.data?.match_score ?? statsRes?.data?.match_score ?? 0,
          });
        }
      } catch (error) {
        console.error("Failed to sync Đề xuất api:", error);
      }
    };

    const fetchSavedJobsFromProfile = async () => {
      try {
        const res = await ProfileApi.getSavedJobs();
        if (res.data) {
          setSavedJobsFromProfile(res.data);
        }
      } catch (error) {
        console.error(
          "Lỗi khi đồng bộ danh sách job đã lưu từ Profile:",
          error,
        );
      }
    };
    fetchApiData();
    fetchSavedJobsFromProfile();
  }, []);

  const loadViewedJobsFromStorage = useCallback(async () => {
    const viewedJobIds = readViewedJobIds();

    if (viewedJobIds.length === 0) {
      setViewedJobDetails([]);
      return;
    }

    const results = await Promise.allSettled(
      viewedJobIds.map((jobId) => JobApi.findOne(jobId)),
    );

    const nextViewedJobDetails = results
      .map((result) => {
        if (result.status !== "fulfilled") return null;
        const rawData = result.value?.data as any;
        return (rawData?.data || rawData || null) as JobDetailResponse | null;
      })
      .filter((item): item is JobDetailResponse => !!item?.job?.job_id);

    setViewedJobDetails(nextViewedJobDetails);
  }, []);

  useEffect(() => {
    loadViewedJobsFromStorage();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === VIEWED_JOB_IDS_STORAGE_KEY) {
        loadViewedJobsFromStorage();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", loadViewedJobsFromStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", loadViewedJobsFromStorage);
    };
  }, [loadViewedJobsFromStorage]);

  const savedReports = useMemo(() => {
    return apiReports.map((report, idx) => ({
      id: idx + 1,
      type: report.match_type === "cv_job" ? "cv-match" : "gap",
      title: report.report_name,
      subtitle:
        report.match_type === "cv_job"
          ? "Phân tích theo công việc"
          : "So khớp theo nhóm nghề",
      score: report.match_score,
      date: report.created_at
        ? new Date(report.created_at).toLocaleDateString("vi-VN")
        : "Chưa rõ ngày",
      tags: ["Dữ liệu từ hệ thống"],
      status: report.match_score >= 80 ? "strong" : "moderate",

      onViewReport: async () => {
        try {
          setIsRedirecting(true);

          if (report.cv_id) {
            await ProfileApi.setDefaultCv(report.cv_id);
          }
          await ProfileApi.setDefaultMatching(report.match_id);
          router.push("/skill-gap");
        } catch (err) {
          console.error("Lỗi khi thiết lập báo cáo mặc định:", err);
          setIsRedirecting(false);
        }
      },
    }));
  }, [apiReports, router]);

  // Build kanban columns from job data + bookmarks (Giữ nguyên gốc)
  // Tái cấu trúc Kanban Column: Lấy dữ liệu động đối chiếu trực tiếp với API Profile đã lưu
  // Tái cấu trúc Kanban Column: Lấy dữ liệu động từ API và bọc đúng Schema cấu trúc để UI không bị crash
  const kanbanColumns = useMemo(() => {
    // 1. Gom tất cả ID của những công việc mà user đã bấm lưu thực tế trong DB từ Profile
    const profileSavedJobIds = new Set(
      savedJobsFromProfile.map((item) => String(item.job?.job_id)),
    );

    // 2. Chuyển đổi mảng apiJobs phẳng thành cấu trúc lồng nhau m.job.... chuẩn theo UI gốc yêu cầu
    const apiJobById = new Map(apiJobs.map((job) => [String(job.job_id), job]));

    const viewedJobsFromStorage: PipelineJobItem[] = viewedJobDetails.map(
      (detail) => {
        const jobId = String(detail.job.job_id);
        const suggestedJob = apiJobById.get(jobId);

        return {
          job: {
            job_id: jobId,
            title: detail.job.title,
            company: { name: detail.company?.name || "N/A" },
            location: detail.job.location,
            work_type: detail.job.work_type,
            salary: {
              min_salary:
                suggestedJob?.salary_text || formatPipelineSalary(detail.salary),
              max_salary: "",
            },
          },
          overall_score: suggestedJob
            ? parseMatchRate(suggestedJob.match_rate)
            : null,
        };
      },
    );

    // Cột Quan tâm: Lấy trực tiếp từ tất cả job đã lưu trong DB
    const bookmarkedItems: PipelineJobItem[] = savedJobsFromProfile
      .filter((item) => item.job)
      .map((item) => {
        const jobId = String(item.job!.job_id);
        const suggestedJob = apiJobById.get(jobId);
        return {
          job: {
            job_id: jobId,
            title: item.job!.title,
            company: { name: item.job!.company?.name || "N/A" },
            location: item.job!.location || null,
            work_type: null,
            salary: {
              min_salary: suggestedJob?.salary_text || item.job!.salary || "",
              max_salary: "",
            },
          },
          overall_score: suggestedJob ? parseMatchRate(suggestedJob.match_rate) : null,
        };
      });

    return {
      // Cột Đang xem: Lấy từ localStorage khi user đã bấm mở job ở trang tìm kiếm
      viewing: viewedJobsFromStorage.filter(
        (m) => !profileSavedJobIds.has(String(m.job.job_id)),
      ),

      // Cột Quan tâm: Tất cả job user đã lưu từ DB
      bookmarked: bookmarkedItems,

      learning: [],
      applied: [],
    };
  }, [savedJobsFromProfile, apiJobs, viewedJobDetails]);

  const kanbanStages = [
    {
      key: "viewing" as const,
      label: "Đang xem",
      Icon: Eye,
      color: "slate",
      desc: "Job bạn mới xem gần đây",
    },
    {
      key: "bookmarked" as const,
      label: "Quan tâm",
      Icon: Heart,
      color: "rose",
      desc: "Đã lưu để xem lại",
    },
  ];

  const colorMap: Record<
    string,
    { border: string; bg: string; text: string; icon: string }
  > = {
    slate: {
      border: "border-slate-200 dark:border-slate-700",
      bg: "bg-slate-50 dark:bg-slate-800/50",
      text: "text-slate-700 dark:text-slate-200",
      icon: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    },
    rose: {
      border: "border-rose-200 dark:border-rose-900/60",
      bg: "bg-rose-50 dark:bg-rose-950/20",
      text: "text-rose-700 dark:text-rose-300",
      icon: "bg-rose-200 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
    },
    amber: {
      border: "border-amber-200 dark:border-amber-900/60",
      bg: "bg-amber-50 dark:bg-amber-950/20",
      text: "text-amber-700 dark:text-amber-300",
      icon: "bg-amber-200 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
    },
    emerald: {
      border: "border-emerald-200 dark:border-emerald-900/60",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      text: "text-emerald-700 dark:text-emerald-300",
      icon: "bg-emerald-200 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
    },
  };

  // ── Computed banner data từ real API ──
  const topJob = apiJobs[0] ?? null;
  const topSkill = prioritySkills[0] ?? null;

  const bannerDesc = (() => {
    if (!topJob && !topSkill && !profile.major) {
      return "Hoàn thiện hồ sơ và tải CV để nhận đề xuất cá nhân hóa.";
    }
    const parts: string[] = [];
    if (topJob) {
      const rate = topJob.match_rate ? ` (khớp ${topJob.match_rate})` : "";
      parts.push(`Vị trí phù hợp nhất với bạn: ${topJob.title}${rate}.`);
    } else if (profile.major) {
      parts.push(`Chuyên ngành: ${profile.major}.`);
    }
    if (topSkill) {
      parts.push(
        `Kỹ năng nên ưu tiên phát triển: ${topSkill.skill_name}.`,
      );
    }
    return (
      parts.join(" ") ||
      "Tải CV và hoàn thiện hồ sơ để nhận đề xuất chính xác hơn."
    );
  })();

  const tabs = [
    { key: "overview" as const, label: "Đề xuất cho bạn", icon: Sparkles },
    { key: "saved" as const, label: "Báo cáo đã lưu", icon: BookmarkCheck },
    { key: "resources" as const, label: "Tài nguyên học", icon: BookOpen },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* ── Profile Snapshot ── */}
      <div className="relative bg-gradient-to-r from-violet-600 via-purple-700 to-indigo-700 rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-64 h-64 bg-white rounded-full" />
          <div className="absolute -bottom-12 left-32 w-40 h-40 bg-white rounded-full" />
        </div>
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-violet-300 shrink-0" />
              <p className="text-violet-200 text-sm font-semibold">
                Tóm tắt từ hồ sơ của bạn
              </p>
            </div>
            <p className="text-white font-bold text-lg mb-3 max-w-xl leading-snug">
              {bannerDesc}
            </p>
            <div className="flex flex-wrap gap-2">
              {bannerStats ? (
                <>
                  <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">
                    {bannerStats.profileCompletion}% Độ hoàn thiện hồ sơ
                  </span>
                  {bannerStats.suitableJobs > 0 && (
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">
                      {bannerStats.suitableJobs} Công việc phù hợp
                    </span>
                  )}
                  {apiJobs.length > 0 && (
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">
                      {apiJobs.length} Đề xuất hàng đầu
                    </span>
                  )}
                  {bannerStats.matchScore > 0 && (
                    <span className="px-3 py-1 bg-emerald-400/30 text-emerald-100 text-xs font-semibold rounded-full">
                      {bannerStats.matchScore}% Điểm phù hợp
                    </span>
                  )}
                </>
              ) : (
                <span className="px-3 py-1 bg-white/20 text-white/60 text-xs font-semibold rounded-full animate-pulse">
                  Đang tải dữ liệu…
                </span>
              )}
            </div>
          </div>
          {topJob && (
            <div className="hidden lg:block text-right shrink-0">
              <p className="text-violet-200 text-xs mb-1">Phù Hợp Hàng Đầu</p>
              <p className="text-white font-bold text-sm leading-tight max-w-[160px] text-right">
                {topJob.title}
              </p>
              <p className="text-violet-200 text-xs mt-0.5">{topJob.salary_text || "Thỏa thuận"}</p>
              <p className="text-emerald-300 text-xs font-bold mt-1">{topJob.match_rate} phù hợp</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Job Pipeline (Kanban) ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 dark:bg-slate-900 dark:border-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Luồng công việc của bạn
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Theo dõi các công việc bạn đã xem gần đây và các công việc đã lưu.
            </p>
          </div>
          <Link
            href="/jobs"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Thêm job <Plus className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {kanbanStages.map((stage) => {
            const items = kanbanColumns[stage.key];
            const c = colorMap[stage.color];
            return (
              <div
                key={stage.key}
                className={`rounded-xl border ${c.border} ${c.bg} p-3 min-h-[280px] flex flex-col`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${c.icon}`}
                  >
                    <stage.Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold ${c.text}`}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                      {stage.desc}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2 flex-1">
                  {items.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-3 text-center text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-900/60">
                      Trống — bấm + Thêm job
                    </p>
                  ) : (
                    items.map((m: PipelineJobItem) => {
                      const score = m.overall_score;

                      return (
                        <div
                          key={m.job.job_id}
                          className="rounded-lg bg-white border border-slate-200 p-2.5 shadow-sm dark:bg-slate-900 dark:border-slate-700"
                        >
                          <Link
                            href={`/jobs/${m.job.job_id}`}
                            className="block text-xs font-semibold text-slate-900 hover:text-blue-700 line-clamp-2 dark:text-slate-100"
                          >
                            {m.job.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-slate-500 truncate">
                            {m.job.company.name}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                                score === null
                                  ? "bg-slate-100 text-slate-600"
                                  : score >= 80
                                    ? "bg-emerald-100 text-emerald-700"
                                    : score >= 70
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {score === null ? "Đã xem" : `${score}%`}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Thẻ Tổng Quan ── */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <p className="rounded-lg bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
            Đây là trang tổng hợp nhanh. Bấm{" "}
            <span className="font-semibold text-slate-700">“chi tiết”</span> ở
            mỗi mục để tới trang chuyên sâu (Tìm việc, Phân tích kỹ năng,
            Roadmap).
          </p>
          {/* Những công việc phù hợp với bạn */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-slate-900">
                  Những công việc phù hợp với bạn
                </h2>
              </div>
              <Link
                href="/jobs"
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
              {apiJobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="Chưa có công việc phù hợp"
                  description="Chạy đối soát CV để hệ thống gợi ý việc làm khớp với hồ sơ của bạn."
                  ctaLabel="Đối soát CV"
                  ctaHref="/cv-matching"
                  compact
                />
              ) : (
                <div className="divide-y divide-slate-50">
                  {apiJobs.map((job) => (
                    <Link
                      key={job.job_id}
                      href={`/jobs/${job.job_id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {job.title}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {job.company_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right flex flex-col items-end gap-1">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          {job.match_rate}
                        </span>
                        <p className="text-xs font-semibold text-slate-900">
                          {job.salary_text}
                        </p>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </Link>
                  ))}
                  <div className="px-5 py-3">
                    <Link
                      href="/jobs"
                      className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Xem tất cả {apiJobs.length} công việc phù hợp{" "}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Priority Skills */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h2 className="font-bold text-slate-900">
                  Kỹ Năng Ưu Tiên Cần Phát Triển
                </h2>
              </div>
              <Link
                href="/skill-gap"
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Phân tích chi tiết <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-50">
              {prioritySkills.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="Chưa có kỹ năng ưu tiên"
                  description="Chạy đối soát CV để hệ thống xác định kỹ năng còn thiếu hoặc mới khớp một phần."
                  ctaLabel="Đối soát CV"
                  ctaHref="/cv-matching"
                  compact
                />
              ) : (
                prioritySkills.map((skill) => {
                  const uc = urgencyConfig[skill.priority];

                  return (
                    <div key={skill.skill_id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-sm">
                              {skill.skill_name}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${uc.bg} ${uc.text}`}
                            >
                              {uc.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                              {skill.status === "Missing"
                                ? "Đang thiếu"
                                : "Khớp một phần"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {skill.reason}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-emerald-600">
                            {skill.impact}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {skill.job_count.toLocaleString("vi-VN")} công việc
                            yêu cầu kỹ năng này
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {skill.timeframe}
                        </span>
                        <Link
                          href="/skill-gap"
                          className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          Xem gợi ý
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Career Paths */}
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-violet-600" />
                <h2 className="font-bold text-slate-900 dark:text-slate-100">
                  Lộ trình nghề nghiệp đề xuất
                </h2>
              </div>
              <Link
                href="/cv-matching"
                className="hidden text-xs font-semibold text-violet-600 hover:text-violet-700 sm:inline-flex"
              >
                Cập nhật phân tích
              </Link>
            </div>
            {careerPaths.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900">
                <Award className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Chưa có lộ trình nghề nghiệp đề xuất
                </p>
                <p className="mx-auto mt-1 max-w-xl text-xs text-slate-500 dark:text-slate-400">
                  Hãy chọn CV mặc định và chạy so khớp để hệ thống lấy nhóm nghề,
                  kỹ năng còn thiếu và dữ liệu thị trường phù hợp với bạn.
                </p>
                <Link
                  href="/cv-matching"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-violet-700"
                >
                  Phân tích CV <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {careerPaths.map((path) => (
                  <div
                    key={path.id}
                    className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
                          {path.readiness_label}
                        </p>
                        <h3 className="mt-1 line-clamp-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                          {path.title}
                        </h3>
                      </div>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
                        <Award className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Mức độ sẵn sàng</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {path.current_match}% → {path.target_match}%
                        </span>
                      </div>
                      <div className="relative h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="absolute h-full rounded-full bg-violet-500 transition-all"
                          style={{
                            width: `${Math.min(path.current_match, 100)}%`,
                          }}
                        />
                        <div
                          className="absolute bottom-0 top-0 w-0.5 rounded-full bg-violet-900 dark:bg-violet-200"
                          style={{
                            left: `${Math.min(path.target_match, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                        <span>Hiện tại</span>
                        <span>Mục tiêu</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Kỹ năng nên bổ sung:
                      </p>
                      {path.skill_gaps.length === 0 ? (
                        <span className="inline-flex rounded bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                          Chưa có khoảng cách nổi bật
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {path.skill_gaps.map((gap) => {
                            const tone = urgencyConfig[gap.priority];
                            return (
                              <span
                                key={`${path.id}-${gap.skill_id}`}
                                className={`rounded px-2 py-0.5 text-[10px] font-medium ${tone.bg} ${tone.text}`}
                              >
                                {gap.skill_name}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="h-3 w-3" /> Thời gian chuẩn bị
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {path.time_to_ready}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="flex items-center gap-1 text-slate-500">
                          <DollarSign className="h-3 w-3" /> Khoảng lương
                        </span>
                        <span className="text-right font-bold text-emerald-600">
                          {path.salary_range}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Briefcase className="h-3 w-3" /> Cơ hội đang mở
                        </span>
                        <span className="font-semibold text-blue-700 dark:text-blue-300">
                          {path.openings_count.toLocaleString("vi-VN")} công việc
                        </span>
                      </div>
                      {path.learning_path_title && (
                        <p className="line-clamp-1 text-xs text-slate-500">
                          Lộ trình liên quan:{" "}
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {path.learning_path_title}
                          </span>
                        </p>
                      )}
                    </div>

                    <Link
                      href={path.href}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                    >
                      Xem gợi ý hành động <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <p className="text-blue-200 text-xs font-semibold mb-2">
                  Bước tiếp theo
                </p>
                <p className="text-white font-bold text-lg mb-2">
                  Sẵn sàng phân tích một công việc mới?
                </p>
                <p className="text-blue-200 text-sm">
                  Đăng tải CV của bạn để nhận báo cáo phân tích chi tiết về mức
                  độ phù hợp với công việc mơ ước và lộ trình phát triển kỹ năng
                  cá nhân hóa.
                </p>
              </div>
              <Link
                href="/cv-matching"
                className="mt-4 flex items-center justify-center gap-2 py-2.5 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors"
              >
                Bắt đầu <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Đề xuất Tab ── */}
      {activeTab === "saved" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {savedReports.length} Đề xuất
            </p>
          </div>
          {savedReports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <FileText className="mx-auto mb-3 h-9 w-9 text-slate-300" />
              <p className="text-sm font-bold text-slate-900">
                Chưa có báo cáo đề xuất
              </p>
              <p className="mx-auto mt-1 max-w-lg text-xs text-slate-500">
                Chạy phân tích CV hoặc mở một báo cáo matching để hệ thống lưu
                lịch sử đề xuất thật cho hồ sơ của bạn.
              </p>
              <Link
                href="/cv-matching"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                Phân tích CV <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            savedReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      report.type === "cv-match"
                        ? "bg-blue-100"
                        : "bg-violet-100"
                    }`}
                  >
                    {report.type === "cv-match" ? (
                      <FileText
                        className={`w-5 h-5 ${report.type === "cv-match" ? "text-blue-600" : "text-violet-600"}`}
                      />
                    ) : (
                      <BarChart3 className="w-5 h-5 text-violet-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-0.5">
                      {report.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">
                      {report.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      report.score >= 90
                        ? "bg-emerald-100 text-emerald-700"
                        : report.score >= 75
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {report.score}% phù hợp
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {report.date}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 border-t border-slate-50 pt-3">
                <button
                  onClick={() => report.onViewReport()}
                  disabled={isRedirecting}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {isRedirecting ? "Đang mở..." : "Xem báo cáo"}
                </button>
              </div>
            </div>
            ))
          )}
        </div>
      )}

      {/* ── Resources Tab ── */}
      {activeTab === "resources" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Gợi ý nhanh dựa trên kỹ năng còn thiếu — xem đầy đủ khóa học & lộ
              trình ở trang Roadmap.
            </p>
            <Link
              href="/roadmap"
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Tới Roadmap <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {learningRecommendations.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon={BookOpen}
                  title="Chưa có tài nguyên học tập đề xuất"
                  description="Chạy phân tích khoảng cách kỹ năng để hệ thống đề xuất khóa học phù hợp."
                  ctaLabel="Phân tích kỹ năng"
                  ctaHref="/skill-gap"
                  compact
                />
              </div>
            ) : (
              learningRecommendations.map((recommendation) => {
                const primaryCourse = recommendation.courses[0];
                const primaryPath = recommendation.paths[0];
                const resourceTitle =
                  primaryCourse?.title ||
                  primaryPath?.title ||
                  `Bổ sung ${recommendation.skill_name}`;
                const resourceProvider =
                  primaryCourse?.provider ||
                  (primaryPath ? "Lộ trình học" : "Nova");
                const resourceDuration =
                  primaryCourse?.duration ||
                  primaryPath?.duration ||
                  recommendation.estimated_time;
                const resourceRating = primaryCourse?.rating || 0;
                const resourceUrl =
                  primaryCourse?.source_url ||
                  `/roadmap?skill=${encodeURIComponent(
                    recommendation.skill_name,
                  )}`;
                const isExternal = resourceUrl.startsWith("http");

                return (
                  <div
                    key={recommendation.id}
                    className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              recommendation.status === "Missing"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {recommendation.status === "Missing"
                              ? "Đang thiếu"
                              : "Khớp một phần"}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                            {recommendation.skill_name}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {resourceTitle}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {resourceProvider}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-900 text-sm">
                          {primaryCourse
                            ? formatCoursePrice(primaryCourse.price)
                            : "Lộ trình"}
                        </p>
                        {resourceRating > 0 && (
                          <div className="flex items-center gap-0.5 text-amber-400 justify-end mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(resourceRating)
                                    ? "fill-amber-400"
                                    : "fill-slate-200 text-slate-200"
                                }`}
                              />
                            ))}
                            <span className="text-[10px] text-slate-500 ml-0.5">
                              {resourceRating}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="mb-3 line-clamp-2 text-xs text-slate-500">
                      {recommendation.impact}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {resourceDuration}
                      </div>
                      <a
                        href={resourceUrl}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noreferrer" : undefined}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
                      >
                        Xem <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-center">
            <p className="text-slate-300 text-xs mb-2">
              📚 Cá nhân hóa dành cho bạn
            </p>
            <p className="text-white font-bold text-lg mb-1">
              Muốn thêm tài nguyên?
            </p>
            <p className="text-slate-400 text-sm mb-4">
              Thực hiện phân tích khoảng cách đầy đủ để nhận lộ trình học tập
              phù hợp dựa trên kỹ năng hiện tại của bạn.
            </p>
            <Link
              href="/skill-gap"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              Xem Phân tích Khoảng cách <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
