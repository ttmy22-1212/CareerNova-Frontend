"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Target,
  FileText,
  TrendingUp,
  Briefcase,
  BookOpen,
  Sparkles,
  ArrowRight,
  ChevronRight,
  MapPin,
  Building2,
  Zap,
  CheckCircle2,
  Circle,
  Upload,
  BarChart3,
  AlertCircle,
  Award,
  Flame,
  BookmarkCheck,
  Heart,
  Clock,
  DollarSign,
  ExternalLink,
  Star,
  Calendar,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { SkillRadar } from "./SkillRadar";
import { SEMANTIC } from "./chart-palette";
import { InfoTooltip, GLOSSARY } from "./InfoTooltip";
import { buildCategoryOverview } from "@/utils/category-overview";
import { toTitleCase } from "@/utils/text";

import CookieHelper from "@/utils/cookie-helper";
import PersonalDashboardApi from "@/api/personal-dashboard";
import ProfileApi from "@/api/profile";
import RecommendationApi from "@/api/recommendation";
import JobApi from "@/api/job";
import SkillGapApi from "@/api/skill-gap";
import {
  DashboardBannerDto,
  DashboardStatisticsDto,
  RecommendedJobDto,
  RadarSkillPointDto,
  CategoryGapDto,
  DashboardProgressDto,
} from "@/types/personal-dashboard";
import { UserProfileResponse } from "@/types/profile";
import MatchingApi from "@/api/matching";
import { MatchCategoryResponse } from "@/types/matching";
import LearningRoadmapApi from "@/api/learning-roadmap";
import { CourseItemDto } from "@/types/learning-roadmap";
import {
  CareerPathRecommendation,
  PrioritySkill,
  RecommendedJob as RecommendedJobRec,
  SavedReportItem,
} from "@/types/recommendation";
import { JobDetailResponse } from "@/types/job-insight";
import { SkillGapLearningRecommendationDto } from "@/types/skill-gap";
import { formatSalaryRange } from "@/utils/salary";
import { EmptyState } from "./EmptyState";

// ── Helpers cho tab Đề xuất ────────────────────────────────────────
const VIEWED_JOB_IDS_STORAGE_KEY = "viewed_job_ids";

const urgencyConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  critical: { label: "Rất quan trọng", bg: "bg-red-100", text: "text-red-700" },
  high: { label: "Ưu tiên cao", bg: "bg-orange-100", text: "text-orange-700" },
  medium: { label: "Trung bình", bg: "bg-amber-100", text: "text-amber-700" },
  low: { label: "Theo dõi", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-300" },
};

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
  } catch {
    return [];
  }
};

const formatCoursePrice = (price: number | null | undefined) => {
  if (!price || price <= 0) return "Miễn phí/không rõ";
  return `${price.toLocaleString("vi-VN")} đ`;
};

const recColorMap: Record<
  string,
  { border: string; bg: string; text: string; icon: string }
> = {
  rose: {
    border: "border-rose-200 dark:border-rose-900/60",
    bg: "bg-rose-50 dark:bg-rose-950/20",
    text: "text-rose-700 dark:text-rose-300",
    icon: "bg-rose-200 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
  },
};

const kanbanStages = [
  {
    key: "bookmarked" as const,
    label: "Quan tâm",
    Icon: Heart,
    color: "rose",
    desc: "Đã lưu để xem lại",
  },
];

const normalizePercent = (value: number | string | null | undefined) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return 0;
  }

  const percent = numericValue <= 1 ? numericValue * 100 : numericValue;
  return Math.min(Math.round(percent), 100);
};

function RadarCategoryDropdown({
  categories,
  selected,
  onSelect,
  isLoading,
}: {
  categories: MatchCategoryResponse[];
  selected: string;
  onSelect: (cat: string) => void;
  isLoading: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = categories.filter((c) =>
    (c.category || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative w-full z-10">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-2xs"
      >
        <span className="truncate">
          {selected === "All" ? "Tất cả nhóm kỹ năng" : selected}
        </span>
        {isLoading ? (
          <div className="w-3.5 h-3.5 border-2 border-slate-400 dark:border-slate-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-hidden flex flex-col z-20 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <input
              type="text"
              placeholder="Tìm kiếm nhóm kỹ năng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
            />
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
            {filtered.map((cat) => (
              <button
                key={cat.category}
                type="button"
                disabled={!cat.is_matched}
                onClick={() => {
                  onSelect(cat.category);
                  setIsOpen(false);
                  setSearch("");
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-all
                  ${selected === cat.category ? "text-blue-600 font-bold bg-blue-50" : "text-slate-700"}
                  ${!cat.is_matched ? "opacity-30 cursor-not-allowed bg-slate-50/50" : "hover:bg-slate-50"}
                `}
              >
                <span className="truncate">{cat.category}</span>
                {!cat.is_matched && (
                  <span className="text-[10px] text-slate-400 shrink-0">
                    (Không khớp)
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ── Component ────────────────────────────────────────────────────
export function PersonalDashboard() {
  const [activeTab, setActiveTab] = useState<"jobs" | "skills" | "progress" | "recommendations">(
    "jobs",
  );
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [categories, setCategories] = useState<MatchCategoryResponse[]>([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState<boolean>(false);
  const [skillCategory, setSkillCategory] = useState<string>("");
  const [categoryOverview, setCategoryOverview] = useState<any[]>([]);

  // States quản lý dữ liệu thực tế từ API
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [banner, setBanner] = useState<DashboardBannerDto | null>(null);
  const [statistics, setStatistics] = useState<DashboardStatisticsDto | null>(
    null,
  );
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJobDto[]>(
    [],
  );
  const [radarSkills, setRadarSkills] = useState<RadarSkillPointDto[]>([]);
  const [skillsChart, setSkillsChart] = useState<CategoryGapDto[]>([]);
  const [progress, setProgress] = useState<DashboardProgressDto | null>(null);
  const [roadmapCourses, setRoadmapCourses] = useState<CourseItemDto[]>([]);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);

  // States dành riêng cho tab Đề xuất
  const [recJobs, setRecJobs] = useState<RecommendedJobRec[]>([]);
  const [recReports, setRecReports] = useState<SavedReportItem[]>([]);
  const [prioritySkills, setPrioritySkills] = useState<PrioritySkill[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPathRecommendation[]>([]);
  const [learningRecs, setLearningRecs] = useState<SkillGapLearningRecommendationDto[]>([]);
  const [savedJobsFromProfile, setSavedJobsFromProfile] = useState<any[]>([]);
  const [viewedJobDetails, setViewedJobDetails] = useState<JobDetailResponse[]>([]);

  // Kích hoạt gọi API khi vào trang lần đầu

  const fetchDashboardData = async () => {
    try {
      const [profileRes, bannerRes, statsRes, jobsRes, chartRes, progressRes] =
        await Promise.all([
          ProfileApi.getMe(),
          PersonalDashboardApi.getBanner(),
          PersonalDashboardApi.getStatistics(),
          PersonalDashboardApi.getRecommendedJobs(),
          PersonalDashboardApi.getSkillsChart(),
          PersonalDashboardApi.getProgress(),
        ]);

      if (profileRes.data) {
        setProfile(profileRes.data);

        // Đồng bộ bốc danh sách categories tương ứng từ default_match nếu có
        const defaultMatchId = profileRes.data.default_match?.match_id;
        if (defaultMatchId) {
          const catRes = await MatchingApi.getMatchCategories(defaultMatchId);
          if (catRes?.data) {
            setCategories(catRes.data);
            if (catRes.data.length > 0 && !skillCategory) {
              setSkillCategory("All"); // Đồng bộ giá trị mặc định ban đầu là "All"
            }
            buildCategoryOverview(defaultMatchId, catRes.data)
              .then(setCategoryOverview)
              .catch(() => {});
          }
        }
      }
      if (bannerRes.data) setBanner(bannerRes.data);
      if (statsRes.data) setStatistics(statsRes.data);

      // Lịch sử match để vẽ tiến bộ theo thời gian
      try {
        const historyRes = await MatchingApi.getAllMatches();
        if (Array.isArray(historyRes?.data)) setMatchHistory(historyRes.data);
      } catch {
        /* không chặn dashboard nếu lỗi lịch sử */
      }
      if (jobsRes.data) setRecommendedJobs(jobsRes.data);
      if (chartRes.data) setSkillsChart(chartRes.data);
      if (progressRes.data) setProgress(progressRes.data);
    } catch (err) {
      // Khi đăng xuất, token bị xoá giữa lúc các request đang bay → 401 →
      // không còn refresh token. Đây là lỗi DỰ KIẾN, không log để khỏi gây nhiễu.
      if (!CookieHelper.getItem("token")) return;
      console.error("Lỗi khi tải dữ liệu Dashboard từ hệ thống:", err);
    }
  };

  useEffect(() => {
    // Chỉ tải dữ liệu khi còn phiên đăng nhập (tránh gọi API sau khi đăng xuất)
    if (CookieHelper.getItem("token")) fetchDashboardData();
  }, []);

  // Đồng bộ 100% luồng bốc data theo cơ chế của CVMatching
  useEffect(() => {
    const defaultMatchId = profile?.default_match?.match_id;
    if (!defaultMatchId || !skillCategory) return;

    const fetchRadarDataDynamic = async () => {
      try {
        setIsCategoryLoading(true);

        // TRƯỜNG HỢP "All": Map y chang hàm mapAndSetMatchResult bên CVMatching
        if (skillCategory === "All") {
          const rawRadar = profile?.default_match?.radar_data || [];
          const rawGapReport = profile?.default_match?.gap_report || {};

          const allSkillsForRadar = [
            ...rawRadar,
            ...(rawGapReport.partially_matched_skills || []),
            ...(rawGapReport.missing_skills || []),
          ];

          // Ép cấu trúc subject, you, required giống hệt CVMatching khi phân tích xong
          const formattedAll = allSkillsForRadar.map((s: any) => {
            // Đoán nhận điểm: nếu backend lưu 0-100 thì chia 100, nếu lưu 0-1 thì giữ nguyên
            const rawSim =
              s.similarity ?? (s.user_score ? s.user_score / 100 : 0);
            return {
              skill_name: s.skill_name,
              similarity: rawSim,
              matched_via: s.matched_via || null,
              user_score: s.user_score ?? 0,
              market_score: s.market_score ?? 0,
            };
          });

          setRadarSkills(formattedAll);
          return;
        }

        // TRƯỜNG HỢP CHỌN CATEGORY CỤ THỂ: Dùng endpoint trùng khớp bên CVMatching
        const res = await MatchingApi.getRadarByCategory(
          defaultMatchId,
          skillCategory,
        );
        if (res?.data) {
          const rawRadar = res.data.radar_data || [];
          const rawGapReport = (res.data.gap_report as any) || {};

          const combinedSkills = [
            ...rawRadar,
            ...(rawGapReport.partially_matched_skills || []),
            ...(rawGapReport.missing_skills || []),
          ];
          setRadarSkills(combinedSkills);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu biểu đồ Radar danh mục:", err);
      } finally {
        setIsCategoryLoading(false);
      }
    };

    fetchRadarDataDynamic();
  }, [skillCategory, profile?.default_match?.match_id]);

  // Top 7 kỹ năng cần cải thiện khẩn cấp nhất (từ gap_report của default match)
  const urgentGapSkills = useMemo(() => {
    const gapReport = profile?.default_match?.gap_report as any;
    if (!gapReport) return [];

    const missing: any[] = (gapReport.missing_skills || []).map((s: any) => ({
      skill_name: s.skill_name,
      weight: s.weight ?? 0,
      user_score: 0,
      type: "missing" as const,
    }));

    const partial: any[] = (gapReport.partially_matched_skills || []).map(
      (s: any) => ({
        skill_name: s.skill_name,
        weight: s.weight ?? 0,
        user_score: normalizePercent(s.similarity),
        type: "partial" as const,
      }),
    );

    // Ưu tiên = trọng số × mức còn thiếu (missing score 0 → ưu tiên cao nhất)
    const priority = (s: any) => s.weight * (1 - s.user_score / 100);
    return [...missing, ...partial]
      .sort((a, b) => priority(b) - priority(a))
      .slice(0, 7);
  }, [profile?.default_match?.gap_report]);

  // Tiến bộ điểm phù hợp theo thời gian (từ lịch sử match)
  const progressChart = useMemo(() => {
    const points = (matchHistory || [])
      .filter((m) => m.match_score != null && m.created_at)
      .map((m) => ({
        ts: new Date(m.created_at).getTime(),
        score: normalizePercent(m.match_score),
      }))
      .sort((a, b) => a.ts - b.ts)
      .map((p) => ({
        label: new Date(p.ts).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        score: p.score,
      }));
    return points;
  }, [matchHistory]);

  const progressDelta =
    progressChart.length >= 2
      ? progressChart[progressChart.length - 1].score - progressChart[0].score
      : 0;

  // Fetch khóa học gợi ý dựa trên skill thiếu hụt nặng nhất
  useEffect(() => {
    const topSkill = urgentGapSkills[0]?.skill_name;
    if (!topSkill) return;

    let cancelled = false;
    setIsLoadingRoadmap(true);

    LearningRoadmapApi.getRoadmap({ skill: topSkill, limit: 3 })
      .then((res) => {
        if (cancelled) return;
        const courses = res?.recommended_courses ?? [];
        setRoadmapCourses(courses.slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setRoadmapCourses([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRoadmap(false);
      });

    return () => {
      cancelled = true;
    };
  }, [urgentGapSkills]);

  // Fetch d\u1eef li\u1ec7u c\u1ee7a tab \u0110\u1ec1 xu\u1ea5t (lazy: ch\u1ec9 g\u1ecdi API khi user click v\u00e0o tab)
  useEffect(() => {
    if (activeTab !== "recommendations") return;
    const fetchRecData = async () => {
      try {
        const [
          jobsRes,
          reportsRes,
          prioritySkillsRes,
          careerPathsRes,
          learningPathsRes,
          savedJobsRes,
        ] = await Promise.all([
          PersonalDashboardApi.getRecommendedJobs(),
          RecommendationApi.getSavedReports(),
          RecommendationApi.getPrioritySkills(4),
          RecommendationApi.getCareerPaths(3),
          SkillGapApi.getLearningPaths(4),
          ProfileApi.getSavedJobs(),
        ]);
        if (jobsRes?.data) setRecJobs(jobsRes.data as RecommendedJobRec[]);
        if (reportsRes?.data) setRecReports(reportsRes.data);
        if (prioritySkillsRes?.data) setPrioritySkills(prioritySkillsRes.data);
        if (careerPathsRes?.data) setCareerPaths(careerPathsRes.data);
        if (learningPathsRes?.data) setLearningRecs(learningPathsRes.data);
        if (savedJobsRes?.data) setSavedJobsFromProfile(savedJobsRes.data);
      } catch (err) {
        console.error("Failed to fetch \u0110\u1ec1 xu\u1ea5t tab data:", err);
      }
    };
    fetchRecData();
  }, [activeTab]);

  // Viewed jobs t\u1eeb localStorage (gi\u1ed1ng Recommendations.tsx)
  const loadViewedJobsFromStorage = useCallback(async () => {
    const viewedJobIds = readViewedJobIds();
    if (viewedJobIds.length === 0) { setViewedJobDetails([]); return; }
    const results = await Promise.allSettled(
      viewedJobIds.map((jobId) => JobApi.findOne(jobId)),
    );
    const details = results
      .map((r) => {
        if (r.status !== "fulfilled") return null;
        const raw = r.value?.data as any;
        return (raw?.data || raw || null) as JobDetailResponse | null;
      })
      .filter((item): item is JobDetailResponse => !!item?.job?.job_id);
    setViewedJobDetails(details);
  }, []);

  useEffect(() => {
    if (activeTab !== "recommendations") return;
    loadViewedJobsFromStorage();
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === VIEWED_JOB_IDS_STORAGE_KEY) loadViewedJobsFromStorage();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", loadViewedJobsFromStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", loadViewedJobsFromStorage);
    };
  }, [activeTab, loadViewedJobsFromStorage]);

  // savedReports memo
  const savedReports = useMemo(() => {
    return recReports.map((report, idx) => ({
      id: idx + 1,
      type: report.match_type === "cv_job" ? "cv-match" : "gap",
      title: report.report_name,
      subtitle: report.match_type === "cv_job" ? "Ph\u00e2n t\u00edch theo c\u00f4ng vi\u1ec7c" : "So kh\u1edbp theo nh\u00f3m ngh\u1ec1",
      score: report.match_score,
      date: report.created_at
        ? new Date(report.created_at).toLocaleDateString("vi-VN")
        : "Ch\u01b0a r\u00f5 ng\u00e0y",
      tags: ["D\u1eef li\u1ec7u t\u1eeb h\u1ec7 th\u1ed1ng"],
      status: report.match_score >= 80 ? "strong" : "moderate",
      onViewReport: async () => {
        try {
          setIsRedirecting(true);
          if (report.cv_id) await ProfileApi.setDefaultCv(report.cv_id);
          await ProfileApi.setDefaultMatching(report.match_id);
          router.push("/skill-gap");
        } catch {
          setIsRedirecting(false);
        }
      },
    }));
  }, [recReports, router]);

  // kanbanColumns memo
  const kanbanColumns = useMemo(() => {
    const profileSavedJobIds = new Set(
      savedJobsFromProfile.map((item) => String(item.job?.job_id)),
    );
    const apiJobById = new Map(recJobs.map((j) => [String(j.job_id), j]));
    const viewedJobsFromStorage: PipelineJobItem[] = viewedJobDetails.map((detail) => {
      const jobId = String(detail.job.job_id);
      const suggestedJob = apiJobById.get(jobId);
      return {
        job: {
          job_id: jobId,
          title: detail.job.title,
          company: { name: (detail as any).company?.name || "N/A" },
          location: detail.job.location,
          work_type: detail.job.work_type,
          salary: {
            min_salary: suggestedJob?.salary_text || formatSalaryRange((detail as any).salary),
            max_salary: "",
          },
        },
        overall_score: suggestedJob ? parseMatchRate(suggestedJob.match_rate) : null,
      };
    });
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
            salary: { min_salary: suggestedJob?.salary_text || item.job!.salary || "", max_salary: "" },
          },
          overall_score: suggestedJob ? parseMatchRate(suggestedJob.match_rate) : null,
        };
      });
    return {
      viewing: viewedJobsFromStorage.filter((m) => !profileSavedJobIds.has(String(m.job.job_id))),
      bookmarked: bookmarkedItems,
      learning: [],
      applied: [],
    };
  }, [savedJobsFromProfile, recJobs, viewedJobDetails]);

  // Ánh xạ dữ liệu động từ API phục vụ các logic hiển thị hoặc cảnh báo
  const strength = statistics?.profile_completion_percentage ?? 0;
  const hasCV = !!(profile?.all_cvs && profile.all_cvs.length > 0);
  const userName = profile?.user?.full_name?.split(" ").pop() ?? "bạn";
  const personalMatchedCount = recommendedJobs.length;
  // suitable_jobs_count từ banner = tổng job ≥ 70% trong toàn bộ lịch sử
  const totalSuitableCount =
    banner?.suitable_jobs_count ?? personalMatchedCount;
  const avgMatchScore = banner?.match_score ?? 0;
  const hasMatched = avgMatchScore > 0 || !!profile?.default_match?.match_id;

  // ── Hành trình của bạn: nối các bước rời rạc thành 1 chuỗi giá trị ──
  const journeySteps = [
    {
      href: hasCV ? "/profile" : "/cv-matching",
      icon: FileText,
      label: "Hồ sơ & CV",
      meta: hasCV ? `Hoàn thiện ${strength}%` : "Chưa có CV",
      done: hasCV && strength >= 80,
    },
    {
      href: "/cv-matching",
      icon: Target,
      label: "Đối soát CV",
      meta: hasMatched ? `Match ${avgMatchScore}%` : "Chưa chạy",
      done: hasMatched,
    },
    {
      href: "/skill-gap",
      icon: AlertCircle,
      label: "Khoảng trống kỹ năng",
      meta: hasMatched
        ? `${statistics?.missing_skills_count ?? 0} kỹ năng thiếu`
        : "Cần đối soát trước",
      done: hasMatched,
    },
    {
      href: "/roadmap",
      icon: BookOpen,
      label: "Lộ trình học",
      meta: "Xem khóa học gợi ý",
      done: false,
    },
    {
      href: "/jobs",
      icon: Briefcase,
      label: "Tìm việc phù hợp",
      meta: `${totalSuitableCount} việc phù hợp`,
      done: totalSuitableCount > 0,
    },
  ];

  // Khớp nối cấu trúc checklist cũ từ API mới để giữ nguyên UI lặp
  const currentChecklist = progress?.checklist ?? [];
  const incompleteTasks = currentChecklist.filter((c) => !c.is_completed);

  const radarData = radarSkills.map((s: any) => {
    let youScore = normalizePercent(s.similarity);
    if (youScore === 0) {
      youScore = 0.1; // Chốt chặn cấp 2 của CVMatching để tránh mất nét chart
    }

    return {
      subject: s.skill_name || "",
      you: youScore,
      required: 100,
      matchedVia: s.matched_via || null,
    };
  });

  const actionItems = [
    {
      href: "/skill-gap",
      icon: Target,
      title: "Xem Phân tích kỹ năng",
      desc: `${statistics?.missing_skills_count ?? 0} kỹ năng cần cải thiện khẩn`,
      badge: "Khẩn",
    },
    {
      href: "/skill-gap",
      icon: BookOpen,
      title: "Tiếp tục lộ trình học",
      desc:
        urgentGapSkills.length > 0
          ? `${urgentGapSkills.length} kỹ năng cần bổ sung — Xem lộ trình`
          : "Khám phá lộ trình kỹ năng cá nhân hóa",
      badge: "Lộ trình",
    },
    {
      href: "/jobs",
      icon: Briefcase,
      title:
        totalSuitableCount > 0
          ? `${totalSuitableCount} jobs phù hợp với bạn`
          : "Tìm job phù hợp với CV",
      desc:
        totalSuitableCount > 0
          ? avgMatchScore > 0
            ? `${avgMatchScore}% match với CV mặc định`
            : "Dựa trên CV mặc định"
          : hasMatched
            ? "Chưa có job ≥ 70% — thử cập nhật CV hoặc nhóm nghề"
            : "Chạy đối soát CV để tìm job phù hợp",
      badge: totalSuitableCount > 0 ? "Mới" : "Gợi ý",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ── Profile Completion Prompt (shown when strength < 50%) ── */}
      {strength < 50 && (
        <div className="flex items-start gap-4 p-4 bg-violet-50 border border-violet-200 rounded-2xl dark:bg-violet-950/30 dark:border-violet-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 shadow-sm shadow-violet-300">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-violet-900 dark:text-violet-200">
              Hoàn thiện hồ sơ để nhận gợi ý chính xác hơn
            </p>
            <p className="text-xs text-violet-700 dark:text-violet-400 mt-0.5 mb-3">
              Hồ sơ hiện tại: <span className="font-bold">{strength}%</span> —
              Cần ít nhất 50% để mở khóa insight cá nhân hóa.
            </p>
            <div className="flex flex-wrap gap-2">
              {incompleteTasks.slice(0, 3).map((task, idx) => (
                <Link
                  key={idx}
                  href="/onboarding/welcome"
                  className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors"
                >
                  <Circle className="h-3 w-3" />
                  {task.step_name}
                </Link>
              ))}
              {incompleteTasks.length > 3 && (
                <Link
                  href="/onboarding/welcome"
                  className="flex items-center gap-1 rounded-lg border border-violet-300 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 transition-colors dark:bg-violet-950/40 dark:text-violet-300"
                >
                  +{incompleteTasks.length - 3} bước nữa{" "}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right hidden sm:block">
            <div className="relative h-14 w-14">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="#e9d5ff"
                  strokeWidth="4"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="4"
                  strokeDasharray={`${(strength / 100) * 125.6} 125.6`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-violet-700 dark:text-violet-300">
                {strength}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Welcome Banner ── */}
      <div
        data-tour="welcome-banner"
        className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-8 -right-8 w-64 h-64 bg-white dark:bg-slate-900 rounded-full" />
          <div className="absolute -bottom-12 right-32 w-40 h-40 bg-white dark:bg-slate-900 rounded-full" />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">
              Chào mừng quay lại 👋
            </p>
            <h2 className="text-white text-2xl font-bold mb-2">
              Xin chào, {userName}!
            </h2>
            <p className="text-blue-100 text-sm max-w-lg">
              {hasCV ? (
                <>
                  {totalSuitableCount > 0 ? (
                    <>
                      Hồ sơ của bạn khớp với{" "}
                      <span className="text-white font-bold">
                        {totalSuitableCount} jobs
                      </span>{" "}
                      (match ≥ 70%). Điểm match CV mặc định:{" "}
                      <span className="text-white font-bold">{avgMatchScore}%</span>
                      .
                    </>
                  ) : hasMatched ? (
                    <>
                      CV đã được phân tích (match{" "}
                      <span className="text-white font-bold">{avgMatchScore}%</span>
                      ), nhưng chưa có job nào đạt ngưỡng 70% — thử cập nhật CV
                      hoặc chọn nhóm nghề khác.
                    </>
                  ) : (
                    <>
                      Tải CV để hệ thống phân tích và gợi ý{" "}
                      <span className="text-white font-bold">
                        job phù hợp chính xác
                      </span>{" "}
                      với hồ sơ của bạn.
                    </>
                  )}
                </>
              ) : (
                <>
                  Tải CV để hệ thống phân tích và gợi ý{" "}
                  <span className="text-white font-bold">
                    job phù hợp chính xác
                  </span>{" "}
                  với hồ sơ của bạn.
                </>
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            {!hasCV ? (
              <Link
                href="/cv-matching"
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-lg"
              >
                <Upload className="w-4 h-4" />
                Tải CV ngay
              </Link>
            ) : (
              <Link
                href="/cv-matching"
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-lg"
              >
                <FileText className="w-4 h-4" />
                Phân tích lại CV
              </Link>
            )}
            {personalMatchedCount > 0 ? (
              <Link
                href="/jobs"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/40 text-white border border-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-500/60 transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                Xem jobs ({personalMatchedCount})
              </Link>
            ) : (
              <span
                title={hasMatched ? "Chưa có job nào đạt ≥ 70% — thử cập nhật CV hoặc chạy lại matching" : "Chạy phân tích CV để tìm job phù hợp"}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/20 text-blue-200/60 border border-blue-400/30 rounded-xl text-sm font-semibold cursor-not-allowed select-none"
              >
                <Briefcase className="w-4 h-4" />
                Xem jobs (0)
              </span>
            )}
          </div>
        </div>
      </div>


      {/* ── Hành trình của bạn ── */}
      <div
        data-tour="journey-strip"
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            Hành trình của bạn
          </h3>
          <span className="text-xs text-slate-400">
            Làm theo thứ tự để tận dụng tối đa
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {journeySteps.map((s, i) => (
            <div key={s.label} className="flex items-center shrink-0">
              <Link
                href={s.href}
                className="group flex flex-col gap-2 w-[150px] p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      s.done
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <s.icon className="w-4 h-4" />
                  </div>
                  {s.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">
                      {i + 1}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-blue-700">
                    {s.label}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{s.meta}</p>
                </div>
              </Link>
              {i < journeySteps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 mx-0.5 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Thẻ Bắt đầu cho user chưa có CV (tránh loạn thông tin) ── */}
      {!hasCV && (
        <div
          data-tour="start-3-steps"
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Bắt đầu trong 3 bước
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 mb-5">
            Tải CV để mở khóa toàn bộ insight cá nhân — chỉ mất vài phút.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {[
              {
                n: 1,
                icon: Upload,
                title: "Tải CV của bạn",
                desc: "Hệ thống tự trích xuất kỹ năng.",
              },
              {
                n: 2,
                icon: Target,
                title: "Xem khoảng trống",
                desc: "Đối soát với yêu cầu thị trường.",
              },
              {
                n: 3,
                icon: BookOpen,
                title: "Nhận lộ trình học",
                desc: "Gợi ý kỹ năng cần bổ sung.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                  <s.icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {s.n}. {s.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
          <Link
            href="/cv-matching"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all hover:-translate-y-0.5"
          >
            <Upload className="h-4 w-4" />
            Tải CV & bắt đầu
          </Link>
        </div>
      )}

      {/* Các khối dưới chỉ hiện khi đã có CV — tránh dồn thông tin rỗng cho user mới */}
      {hasCV && (
        <>
      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: Briefcase,
            label: "Jobs Phù Hợp",
            value: totalSuitableCount.toString(),
            sub:
              totalSuitableCount > 0
                ? "Match ≥ 70%"
                : hasMatched
                  ? "Chưa khớp — thử cập nhật CV"
                  : "Cần chạy matching trước",
            tone: totalSuitableCount > 0 ? "success" : "warning",
          },
          {
            icon: AlertCircle,
            label: "Thiếu hụt kỹ năng",
            value: (statistics?.missing_skills_count ?? 0).toString(),
            sub: "Kỹ năng cần cải thiện",
            tone: "warning", // cần chú ý
          },
          {
            icon: Award,
            label: "Độ hoàn thiện hồ sơ",
            value: `${strength}%`,
            sub:
              incompleteTasks.length > 0
                ? `${incompleteTasks.length} bước còn thiếu`
                : "Hồ sơ hoàn chỉnh!",
            tone: "primary", // trung tính / tiến độ
          },
        ].map((card) => {
          // Thẻ trắng + accent ngữ nghĩa nhẹ thay cho nền gradient bão hoà:
          // dễ đọc hơn (chữ tối / nền sáng) và màu mang đúng ý nghĩa.
          const accent =
            card.tone === "success"
              ? "bg-emerald-50 text-emerald-600"
              : card.tone === "warning"
                ? "bg-amber-50 text-amber-600"
                : "bg-blue-50 text-blue-600";
          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
            >
              <div
                className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}
              >
                <card.icon className="h-5 w-5" />
              </div>
              <p className="mb-0.5 text-2xl font-bold text-slate-900 dark:text-white">
                {card.value}
              </p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {card.label}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Next Actions ── */}
      <div
        data-tour="next-actions"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {actionItems.map((action, index) => (
          <Link
            key={`${action.href}-${index}`}
            href={action.href}
            className="group flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <action.icon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {action.title}
                </p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{action.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      {/* ── Main Content: Tabs ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          {(["jobs", "skills", "progress", "recommendations"] as const).map((tab) => {
            const labels = {
              jobs: "Jobs G\u1ee3i \u00dd",
              skills: "K\u1ef9 N\u0103ng C\u1ee7a B\u1ea1n",
              progress: "Ti\u1ebfn \u0110\u1ed9",
              recommendations: "\u0110\u1ec1 Xu\u1ea5t",
            };
            const icons = {
              jobs: Briefcase,
              skills: BarChart3,
              progress: TrendingUp,
              recommendations: BookmarkCheck,
            };
            const Icon = icons[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-700 bg-blue-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {labels[tab]}
                {tab === "jobs" && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      personalMatchedCount > 0
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {personalMatchedCount > 0 ? personalMatchedCount : "\u2013"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab: Jobs */}
        {activeTab === "jobs" && (
          <div className="divide-y divide-slate-50">
            {recommendedJobs.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Chưa có jobs gợi ý
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Tải CV hoặc chạy matching mặc định để hệ thống tính job phù
                  hợp với hồ sơ của bạn.
                </p>
                <Link
                  href="/cv-matching"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Phân tích CV <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              recommendedJobs.map((job) => (
                <Link
                  key={job.job_id}
                  href={`/jobs/${job.job_id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 transition-colors">
                        {toTitleCase(job.title)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
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
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {job.salary_text}
                    </p>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </Link>
              ))
            )}
            {recommendedJobs.length > 0 && (
              <div className="px-5 py-3">
                <Link
                  href="/jobs"
                  className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Xem tất cả {personalMatchedCount} jobs phù hợp{" "}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab: Skills */}
        {activeTab === "skills" && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* CỘT TRÁI: Radar chart theo danh mục */}
            <div className="flex flex-col bg-slate-50/60 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 gap-4">
              <div>
                <h4 className="flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white">
                  Kỹ năng của bạn so với thị trường
                  <InfoTooltip text={GLOSSARY.similarity} />
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Theo từng nhóm kỹ năng
                </p>
              </div>

              <div>
                <RadarCategoryDropdown
                  categories={categories}
                  selected={skillCategory}
                  onSelect={(cat) => setSkillCategory(cat)}
                  isLoading={isCategoryLoading}
                />
              </div>

              {(() => {
                const isOverview =
                  skillCategory === "All" && categoryOverview.length >= 2;
                if (!isOverview && radarData.length === 0) {
                  return (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-white/70 dark:bg-slate-900/70 px-4 text-center min-h-[200px]">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Target className="w-6 h-6 text-blue-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Chưa có dữ liệu phân tích kỹ năng
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                        Tải CV và chạy đối soát để xem radar kỹ năng cá nhân của
                        bạn.
                      </p>
                      <Link
                        href="/cv-matching"
                        className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                      >
                        Bắt đầu đối soát CV
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                }
                return (
                  <div className="flex-1">
                    {isOverview ? (
                      <p className="mb-2 text-[11px] text-slate-500 dark:text-slate-400">
                        Điểm trung bình theo nhóm — bấm vào tên nhóm để xem chi
                        tiết
                      </p>
                    ) : (
                      skillCategory !== "All" && (
                        <button
                          onClick={() => setSkillCategory("All")}
                          className="mb-2 text-xs text-blue-600 hover:underline"
                        >
                          ← Quay lại tổng quan
                        </button>
                      )
                    )}
                    <SkillRadar
                      data={isOverview ? categoryOverview : radarData}
                      requiredLabel="Yêu cầu thị trường"
                      clickableLabels={isOverview}
                      onLabelClick={(cat) => setSkillCategory(cat)}
                    />
                  </div>
                );
              })()}
            </div>

            {/* CỘT PHẢI: Top 7 kỹ năng cần cải thiện khẩn cấp nhất */}
            <div className="flex flex-col bg-slate-50/60 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    7 Kỹ năng cần cải thiện khẩn cấp
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Sắp xếp theo mức độ ảnh hưởng đến match score
                  </p>
                </div>
                {urgentGapSkills.length > 0 && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                    {urgentGapSkills.length} kỹ năng
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-2.5 overflow-y-auto">
                {urgentGapSkills.length === 0 ? (
                  <div className="flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-white/70 dark:bg-slate-900/70 text-xs text-slate-400 min-h-[160px]">
                    {profile?.default_match
                      ? "🎉 Tuyệt vời! Không có kỹ năng nào thiếu hụt."
                      : "Chưa có kết quả matching để phân tích"}
                  </div>
                ) : (
                  urgentGapSkills.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {toTitleCase(item.skill_name)}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.type === "missing"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.type === "missing"
                            ? "Chưa có"
                            : `${item.user_score}%`}
                        </span>
                      </div>
                      <div className="relative h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`absolute h-full rounded-full transition-all ${
                            item.type === "missing"
                              ? "bg-red-400"
                              : "bg-amber-400"
                          }`}
                          style={{
                            width: `${item.type === "missing" ? 4 : item.user_score}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-slate-400">
                          Trọng số:{" "}
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {Math.round((item.weight ?? 0) * 100)}%
                          </span>
                        </p>
                        <Link
                          href={`/roadmap?skill=${encodeURIComponent(item.skill_name)}`}
                          className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          Học ngay <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link
                href="/skill-gap"
                className="mt-4 flex items-center justify-center gap-2 py-2.5 w-full bg-violet-50 text-violet-700 rounded-xl text-sm font-semibold hover:bg-violet-100 transition-colors border border-violet-100"
              >
                <Zap className="w-4 h-4" />
                Xem full Phân tích kỹ năng
              </Link>
            </div>
          </div>
        )}

        {/* Tab: Progress */}
        {activeTab === "progress" && (
          <div className="p-5 space-y-6">
            {/* Tiến bộ điểm phù hợp theo thời gian */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Tiến bộ điểm phù hợp
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Điểm match qua các lần phân tích CV của bạn
                  </p>
                </div>
                {progressChart.length >= 2 && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      progressDelta >= 0
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {progressDelta >= 0 ? "+" : ""}
                    {progressDelta}% so với lần đầu
                  </span>
                )}
              </div>
              {progressChart.length >= 1 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart
                    data={progressChart}
                    margin={{ top: 8, right: 12, bottom: 0, left: -20 }}
                  >
                    <defs>
                      <linearGradient
                        id="progGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={SEMANTIC.primary}
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor={SEMANTIC.primary}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip formatter={(v: any) => [`${v}%`, "Điểm phù hợp"]} />
                    <Area
                      // Đoạn thẳng nối từng lần match thật (không nội suy cong) +
                      // chấm tròn mỗi mốc → thấy rõ từng "bước". Một lần match sẽ
                      // hiển thị thành một chấm duy nhất.
                      type="linear"
                      dataKey="score"
                      stroke={SEMANTIC.primary}
                      strokeWidth={2.5}
                      fill="url(#progGrad)"
                      dot={{
                        r: 4,
                        fill: SEMANTIC.primary,
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 text-center text-xs text-slate-400">
                  Chạy đối soát CV để bắt đầu theo dõi tiến bộ điểm phù hợp.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Checklist */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                Hoàn thiện hồ sơ
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Hồ sơ đầy đủ → gợi ý chính xác hơn
              </p>
              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-xl">
                <div className="flex-1 h-2.5 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${strength}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-blue-700 shrink-0">
                  {strength}%
                </span>
              </div>
              <ul className="space-y-2">
                {currentChecklist.map((c, idx) => (
                  <li key={idx}>
                    <Link
                      href="/onboarding/welcome"
                      className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                        c.is_completed
                          ? "text-slate-400"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {c.is_completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span
                        className={`flex-1 text-sm ${c.is_completed ? "line-through" : ""}`}
                      >
                        {c.step_name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Activity + Learning */}
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Hoạt động gần đây
                </h4>
                {/* Hoạt động gần đây */}
                <div className="space-y-2">
                  {progress?.recent_activities?.map((act, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg ${
                          act.activity_name === "CV uploaded"
                            ? "text-blue-600 bg-blue-50"
                            : "text-violet-600 bg-violet-50"
                        } flex items-center justify-center shrink-0`}
                      >
                        {act.activity_name === "CV uploaded" ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <Target className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {act.activity_name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {/* Kiểm tra chuỗi ngày tháng thực tế từ ISO string gửi về */}
                          {act.recorded_at
                            ? new Date(act.recorded_at).toLocaleDateString(
                                "vi-VN",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                },
                              )
                            : "Chưa ghi nhận"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Lộ trình đề xuất
                    </h4>
                    {urgentGapSkills[0] && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Gợi ý cho kỹ năng:{" "}
                        <span className="font-semibold text-blue-600">
                          {toTitleCase(urgentGapSkills[0].skill_name)}
                        </span>
                      </p>
                    )}
                  </div>
                  <Link
                    href="/roadmap"
                    className="text-xs text-blue-600 font-semibold flex items-center gap-0.5 hover:text-blue-700"
                  >
                    Xem lộ trình <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Loading skeleton */}
                {isLoadingRoadmap && (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                )}

                {/* Danh sách khóa học thực từ API */}
                {!isLoadingRoadmap && roadmapCourses.length > 0 && (
                  <div className="space-y-2">
                    {roadmapCourses.map((course) => (
                      <Link
                        key={course.id}
                        href={course.source_url || "/roadmap"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-colors group"
                      >
                        {/* Icon khóa học (thay thumbnail hay bị vỡ) */}
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {course.title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {course.provider}
                            {course.duration ? ` · ${course.duration}` : ""}
                          </p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          {course.rating > 0 && (
                            <span className="text-[10px] font-bold text-amber-600">
                              ★ {course.rating.toFixed(1)}
                            </span>
                          )}
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Fallback khi không có khóa học */}
                {!isLoadingRoadmap && roadmapCourses.length === 0 && (
                  <Link
                    href="/skill-gap"
                    className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-blue-800">
                        Khám phá lộ trình kỹ năng
                      </p>
                      <p className="text-[10px] text-blue-600">
                        Phân tích CV để nhận gợi ý khóa học cá nhân hóa
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600 shrink-0" />
                  </Link>
                )}
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Tab: \u0110\u1ec1 xu\u1ea5t */}
        {activeTab === "recommendations" && (
          <div className="p-5 space-y-5">
            {/* Job Pipeline / Kanban */}
            <div className="bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Lu\u1ed3ng c\u00f4ng vi\u1ec7c c\u1ee7a b\u1ea1n</h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">C\u00e1c c\u00f4ng vi\u1ec7c b\u1ea1n \u0111\u00e3 l\u01b0u \u0111\u1ec3 xem l\u1ea1i.</p>
                </div>
                <Link href="/jobs" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                  Th\u00eam job <Plus className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {kanbanStages.map((stage) => {
                  const items = kanbanColumns[stage.key];
                  const c = recColorMap[stage.color];
                  return (
                    <div key={stage.key} className={`rounded-xl border ${c.border} ${c.bg} p-3 min-h-[160px] flex flex-col`}>
                      <div className="mb-3 flex items-center gap-2">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${c.icon}`}>
                          <stage.Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold ${c.text}`}>{stage.label}</p>
                          <p className="text-xs text-slate-500 truncate dark:text-slate-400">{stage.desc}</p>
                        </div>
                        <span className="rounded-full bg-white dark:bg-slate-900 px-2 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                          {items.length}
                        </span>
                      </div>
                      <div className="space-y-2 flex-1">
                        {items.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-3 text-center text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-900/60">
                            Tr\u1ed1ng \u2014 b\u1ea5m + Th\u00eam job
                          </p>
                        ) : (
                          items.map((m: PipelineJobItem) => {
                            const score = m.overall_score;
                            return (
                              <div key={m.job.job_id} className="rounded-lg bg-white border border-slate-200 p-2.5 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                <Link href={`/jobs/${m.job.job_id}`} className="block text-xs font-semibold text-slate-900 dark:text-white hover:text-blue-700 line-clamp-2">
                                  {toTitleCase(m.job.title)}
                                </Link>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">{m.job.company.name}</p>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${score === null ? "bg-slate-100 text-slate-600" : score >= 80 ? "bg-emerald-100 text-emerald-700" : score >= 70 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                                    {score === null ? "\u0110\u00e3 xem" : `${score}%`}
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

            {/* Priority Skills */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">K\u1ef9 N\u0103ng \u01afu Ti\u00ean C\u1ea7n Ph\u00e1t Tri\u1ec3n</h3>
                </div>
                <Link href="/skill-gap" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Ph\u00e2n t\u00edch chi ti\u1ebft <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm divide-y divide-slate-50 dark:divide-slate-800">
                {prioritySkills.length === 0 ? (
                  <EmptyState icon={TrendingUp} title="Ch\u01b0a c\u00f3 k\u1ef9 n\u0103ng \u01b0u ti\u00ean" description="Ch\u1ea1y \u0111\u1ed1i so\u00e1t CV \u0111\u1ec3 h\u1ec7 th\u1ed1ng x\u00e1c \u0111\u1ecbnh k\u1ef9 n\u0103ng c\u00f2n thi\u1ebfu." ctaLabel="\u0110\u1ed1i so\u00e1t CV" ctaHref="/cv-matching" compact />
                ) : (
                  prioritySkills.map((skill) => {
                    const uc = urgencyConfig[skill.priority] || urgencyConfig.low;
                    return (
                      <div key={skill.skill_id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{toTitleCase(skill.skill_name)}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${uc.bg} ${uc.text}`}>{uc.label}</span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                                {skill.status === "Missing" ? "\u0110ang thi\u1ebfu" : "Kh\u1edbp m\u1ed9t ph\u1ea7n"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{skill.reason}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-emerald-600">{skill.impact}</p>
                            <p className="text-[11px] text-slate-400">{skill.job_count.toLocaleString("vi-VN")} c\u00f4ng vi\u1ec7c y\u00eau c\u1ea7u</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="w-3 h-3" /> {skill.timeframe}
                          </span>
                          <Link href="/skill-gap" className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors">
                            Xem g\u1ee3i \u00fd
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
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">L\u1ed9 tr\u00ecnh ngh\u1ec1 nghi\u1ec7p \u0111\u1ec1 xu\u1ea5t</h3>
                </div>
                <Link href="/cv-matching" className="hidden text-xs font-semibold text-violet-600 hover:text-violet-700 sm:inline-flex">
                  C\u1eadp nh\u1eadt ph\u00e2n t\u00edch
                </Link>
              </div>
              {careerPaths.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 text-center">
                  <Award className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Ch\u01b0a c\u00f3 l\u1ed9 tr\u00ecnh ngh\u1ec1 nghi\u1ec7p \u0111\u1ec1 xu\u1ea5t</p>
                  <p className="mx-auto mt-1 max-w-xl text-xs text-slate-500 dark:text-slate-400">H\u00e3y ch\u1ecdn CV m\u1eb7c \u0111\u1ecbnh v\u00e0 ch\u1ea1y so kh\u1edbp \u0111\u1ec3 h\u1ec7 th\u1ed1ng l\u1ea5y nh\u00f3m ngh\u1ec1, k\u1ef9 n\u0103ng c\u00f2n thi\u1ebfu v\u00e0 d\u1eef li\u1ec7u th\u1ecb tr\u01b0\u1eddng.</p>
                  <Link href="/cv-matching" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700">
                    Ph\u00e2n t\u00edch CV <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {careerPaths.map((path) => (
                    <div key={path.id} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">{path.readiness_label}</p>
                          <h4 className="mt-1 line-clamp-2 text-sm font-bold text-slate-900 dark:text-white">{path.title}</h4>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
                          <Award className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400">M\u1ee9c \u0111\u1ed9 s\u1eb5n s\u00e0ng</span>
                          <span className="font-bold text-slate-900 dark:text-white">{path.current_match}% \u2192 {path.target_match}%</span>
                        </div>
                        <div className="relative h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="absolute h-full rounded-full bg-violet-500 transition-all" style={{ width: `${Math.min(path.current_match, 100)}%` }} />
                          <div className="absolute bottom-0 top-0 w-0.5 rounded-full bg-violet-900 dark:bg-violet-200" style={{ left: `${Math.min(path.target_match, 100)}%` }} />
                        </div>
                      </div>
                      <div className="space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400"><Clock className="h-3 w-3" /> Th\u1eddi gian chu\u1ea9n b\u1ecb</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{path.time_to_ready}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400"><DollarSign className="h-3 w-3" /> Kho\u1ea3ng l\u01b0\u01a1ng</span>
                          <span className="text-right font-bold text-emerald-600">{path.salary_range}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400"><Briefcase className="h-3 w-3" /> C\u01a1 h\u1ed9i \u0111ang m\u1edf</span>
                          <span className="font-semibold text-blue-700 dark:text-blue-300">{path.openings_count.toLocaleString("vi-VN")} c\u00f4ng vi\u1ec7c</span>
                        </div>
                      </div>
                      <Link href={path.href} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900">
                        Xem g\u1ee3i \u00fd h\u00e0nh \u0111\u1ed9ng <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Reports */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">B\u00e1o c\u00e1o \u0111\u00e3 l\u01b0u</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">{savedReports.length} b\u00e1o c\u00e1o</span>
              </div>
              {savedReports.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center">
                  <FileText className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Ch\u01b0a c\u00f3 b\u00e1o c\u00e1o \u0111\u1ec1 xu\u1ea5t</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Ch\u1ea1y ph\u00e2n t\u00edch CV \u0111\u1ec3 h\u1ec7 th\u1ed1ng l\u01b0u l\u1ecbch s\u1eed \u0111\u1ec1 xu\u1ea5t.</p>
                  <Link href="/cv-matching" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">
                    Ph\u00e2n t\u00edch CV <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedReports.map((report) => (
                    <div key={report.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${report.type === "cv-match" ? "bg-blue-100" : "bg-violet-100"}`}>
                            {report.type === "cv-match" ? <FileText className="w-4 h-4 text-blue-600" /> : <BarChart3 className="w-4 h-4 text-violet-600" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">{report.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{report.subtitle}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${report.score >= 90 ? "bg-emerald-100 text-emerald-700" : report.score >= 75 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                            {report.score}% ph\u00f9 h\u1ee3p
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Calendar className="w-3 h-3" /> {report.date}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                        <button onClick={() => report.onViewReport()} disabled={isRedirecting} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors disabled:opacity-50">
                          <ExternalLink className="w-3.5 h-3.5" />
                          {isRedirecting ? "\u0110ang m\u1edf..." : "Xem b\u00e1o c\u00e1o"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Learning Resources */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">T\u00e0i nguy\u00ean h\u1ecdc t\u1eadp</h3>
                <Link href="/roadmap" className="flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                  T\u1edbi Roadmap <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {learningRecs.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState icon={BookOpen} title="Ch\u01b0a c\u00f3 t\u00e0i nguy\u00ean h\u1ecdc t\u1eadp \u0111\u1ec1 xu\u1ea5t" description="Ch\u1ea1y ph\u00e2n t\u00edch k\u1ef9 n\u0103ng \u0111\u1ec3 h\u1ec7 th\u1ed1ng \u0111\u1ec1 xu\u1ea5t kh\u00f3a h\u1ecdc ph\u00f9 h\u1ee3p." ctaLabel="Ph\u00e2n t\u00edch k\u1ef9 n\u0103ng" ctaHref="/skill-gap" compact />
                  </div>
                ) : (
                  learningRecs.map((rec) => {
                    const primaryCourse = rec.courses[0];
                    const primaryPath = rec.paths[0];
                    const resourceTitle = primaryCourse?.title || primaryPath?.title || `B\u1ed5 sung ${toTitleCase(rec.skill_name)}`;
                    const resourceProvider = primaryCourse?.provider || (primaryPath ? "L\u1ed9 tr\u00ecnh h\u1ecdc" : "Nova");
                    const resourceDuration = primaryCourse?.duration || primaryPath?.duration || rec.estimated_time;
                    const resourceRating = primaryCourse?.rating || 0;
                    const resourceUrl = primaryCourse?.source_url || `/roadmap?skill=${encodeURIComponent(rec.skill_name)}`;
                    const isExternal = resourceUrl.startsWith("http");
                    return (
                      <div key={rec.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rec.status === "Missing" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                                {rec.status === "Missing" ? "\u0110ang thi\u1ebfu" : "Kh\u1edbp m\u1ed9t ph\u1ea7n"}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">{toTitleCase(rec.skill_name)}</span>
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{resourceTitle}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{resourceProvider}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                              {primaryCourse ? formatCoursePrice(primaryCourse.price) : "L\u1ed9 tr\u00ecnh"}
                            </p>
                            {resourceRating > 0 && (
                              <div className="flex items-center gap-0.5 text-amber-400 justify-end mt-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < Math.floor(resourceRating) ? "fill-amber-400" : "fill-slate-200 text-slate-200"}`} />
                                ))}
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-0.5">{resourceRating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="w-3 h-3" /> {resourceDuration}
                          </div>
                          <a href={resourceUrl} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer" : undefined} className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors">
                            Xem <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
        </>
      )}

      {/* ── Market Teaser ── */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
        <div className="flex items-center gap-3">
          <Flame className="w-5 h-5 text-orange-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Xem tổng quan thị trường IT
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Top jobs hot, top skills, xu hướng lương — không cần đăng nhập
            </p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          Thông tin Thị trường <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
