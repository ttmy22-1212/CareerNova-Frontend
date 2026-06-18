"use client";
import { useState, useEffect, useMemo } from "react";
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
import { InfoTooltip, GLOSSARY } from "./InfoTooltip";
import { buildCategoryOverview } from "@/utils/category-overview";

import PersonalDashboardApi from "@/api/personal-dashboard";
import ProfileApi from "@/api/profile";
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
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all shadow-2xs"
      >
        <span className="truncate">
          {selected === "All" ? "Tất cả nhóm kỹ năng" : selected}
        </span>
        {isLoading ? (
          <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
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
        <div className="absolute left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-hidden flex flex-col z-20 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <input
              type="text"
              placeholder="Tìm kiếm nhóm kỹ năng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 text-slate-700"
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
  const [activeTab, setActiveTab] = useState<"jobs" | "skills" | "progress">(
    "jobs",
  );
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
      console.error("Lỗi khi tải dữ liệu Dashboard từ hệ thống:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
      color: "from-violet-500 to-violet-600",
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
      color: "from-blue-500 to-blue-600",
      badge: "Lộ trình",
    },
    {
      href: "/jobs",
      icon: Briefcase,
      title: `${totalSuitableCount} jobs phù hợp với bạn`,
      desc:
        avgMatchScore > 0
          ? `${avgMatchScore}% match với CV mặc định`
          : "Dựa trên CV mặc định",
      color: "from-emerald-500 to-emerald-600",
      badge: "Mới",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ── Profile Completion Prompt (shown when strength < 50%) ── */}
      {strength < 50 && (
        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl dark:from-violet-950/30 dark:to-indigo-950/30 dark:border-violet-800">
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
                  className="flex items-center gap-1 rounded-lg border border-violet-300 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 transition-colors dark:bg-violet-950/40 dark:text-violet-300"
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
          <div className="absolute -top-8 -right-8 w-64 h-64 bg-white rounded-full" />
          <div className="absolute -bottom-12 right-32 w-40 h-40 bg-white rounded-full" />
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
                  Hồ sơ của bạn khớp với{" "}
                  <span className="text-white font-bold">
                    {totalSuitableCount} jobs
                  </span>{" "}
                  (match ≥ 70%). Điểm match CV mặc định:{" "}
                  <span className="text-white font-bold">{avgMatchScore}%</span>
                  .
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
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-lg"
              >
                <Upload className="w-4 h-4" />
                Tải CV ngay
              </Link>
            ) : (
              <Link
                href="/cv-matching"
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-lg"
              >
                <FileText className="w-4 h-4" />
                Phân tích lại CV
              </Link>
            )}
            <Link
              href="/jobs"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/40 text-white border border-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-500/60 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              Xem jobs ({personalMatchedCount})
            </Link>
          </div>
        </div>
      </div>


      {/* ── Hành trình của bạn ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
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
                className="group flex flex-col gap-2 w-[150px] p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
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
                  <p className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-blue-700">
                    {s.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.meta}</p>
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Bắt đầu trong 3 bước
          </h3>
          <p className="text-sm text-slate-500 mt-0.5 mb-5">
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
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                  <s.icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {s.n}. {s.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
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
            sub: "Match ≥ 70%",
            color: "from-emerald-500 to-emerald-600",
            text: "text-white",
            subText: "text-emerald-100",
            iconBg: "bg-white/20",
          },
          {
            icon: AlertCircle,
            label: "Thiếu hụt kỹ năng",
            value: (statistics?.missing_skills_count ?? 0).toString(),
            sub: "Kỹ năng cần cải thiện",
            color: "from-orange-500 to-orange-600",
            text: "text-white",
            subText: "text-orange-100",
            iconBg: "bg-white/20",
          },
          {
            icon: Award,
            label: "Độ hoàn thiện hồ sơ",
            value: `${strength}%`,
            sub:
              incompleteTasks.length > 0
                ? `${incompleteTasks.length} bước còn thiếu`
                : "Hồ sơ hoàn chỉnh!",
            color: "from-violet-500 to-violet-600",
            text: "text-white",
            subText: "text-violet-100",
            iconBg: "bg-white/20",
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-xl p-5 bg-gradient-to-br ${card.color} shadow-sm`}
          >
            <div
              className={`w-9 h-9 ${card.iconBg} rounded-lg flex items-center justify-center mb-3`}
            >
              <card.icon className={`w-4.5 h-4.5 ${card.text}`} />
            </div>
            <p className={`text-2xl font-bold ${card.text} mb-0.5`}>
              {card.value}
            </p>
            <p className={`text-xs font-semibold ${card.text} opacity-90`}>
              {card.label}
            </p>
            <p className={`text-xs ${card.subText} mt-0.5`}>{card.sub}</p>
          </div>
        ))}
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
            className="group flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-sm shrink-0`}
            >
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {action.title}
                </p>
              </div>
              <p className="text-xs text-slate-500 truncate">{action.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      {/* ── Main Content: Tabs ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-slate-100">
          {(["jobs", "skills", "progress"] as const).map((tab) => {
            const labels = {
              jobs: "Jobs Gợi Ý",
              skills: "Kỹ Năng Của Bạn",
              progress: "Tiến Độ",
            };
            const icons = {
              jobs: Briefcase,
              skills: BarChart3,
              progress: TrendingUp,
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
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                    {personalMatchedCount}
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
                <p className="text-sm font-semibold text-slate-700">
                  Chưa có jobs gợi ý
                </p>
                <p className="mt-1 text-xs text-slate-500">
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
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {job.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-1.5">
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
            <div className="flex flex-col bg-slate-50/60 border border-slate-100 rounded-2xl p-5 gap-4">
              <div>
                <h4 className="flex items-center gap-1 text-sm font-bold text-slate-900">
                  Kỹ năng của bạn so với thị trường
                  <InfoTooltip text={GLOSSARY.similarity} />
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
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
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 border border-dashed border-slate-200 rounded-xl bg-white/70 px-4 text-center min-h-[200px]">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Target className="w-6 h-6 text-blue-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        Chưa có dữ liệu phân tích kỹ năng
                      </p>
                      <p className="text-xs text-slate-500 max-w-xs">
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
                      <p className="mb-2 text-[11px] text-slate-500">
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
            <div className="flex flex-col bg-slate-50/60 border border-slate-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    7 Kỹ năng cần cải thiện khẩn cấp
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
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
                  <div className="flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-white/70 text-xs text-slate-400 min-h-[160px]">
                    {profile?.default_match
                      ? "🎉 Tuyệt vời! Không có kỹ năng nào thiếu hụt."
                      : "Chưa có kết quả matching để phân tích"}
                  </div>
                ) : (
                  urgentGapSkills.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-100 rounded-xl shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {item.skill_name}
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
                      <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
                          <span className="font-semibold text-slate-600">
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
                  <h4 className="text-sm font-semibold text-slate-900">
                    Tiến bộ điểm phù hợp
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
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
              {progressChart.length >= 2 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart
                    data={progressChart}
                    margin={{ top: 5, right: 10, bottom: 0, left: -20 }}
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
                          stopColor="#3b82f6"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
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
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fill="url(#progGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-xs text-slate-400">
                  Chạy đối soát CV ít nhất 2 lần để xem tiến bộ theo thời gian.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Checklist */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">
                Hoàn thiện hồ sơ
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Hồ sơ đầy đủ → gợi ý chính xác hơn
              </p>
              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-xl">
                <div className="flex-1 h-2.5 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
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
                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                  Hoạt động gần đây
                </h4>
                {/* Hoạt động gần đây */}
                <div className="space-y-2">
                  {progress?.recent_activities?.map((act, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl"
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
                        <p className="text-sm font-medium text-slate-900">
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
                    <h4 className="text-sm font-semibold text-slate-900">
                      Lộ trình đề xuất
                    </h4>
                    {urgentGapSkills[0] && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Gợi ý cho kỹ năng:{" "}
                        <span className="font-semibold text-blue-600">
                          {urgentGapSkills[0].skill_name}
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
                        className="h-14 bg-slate-100 rounded-xl animate-pulse"
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
                        className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-colors group"
                      >
                        {/* Icon khóa học (thay thumbnail hay bị vỡ) */}
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
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
      </div>
        </>
      )}

      {/* ── Market Teaser ── */}
      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-3">
          <Flame className="w-5 h-5 text-orange-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Xem tổng quan thị trường IT
            </p>
            <p className="text-xs text-slate-500">
              Top jobs hot, top skills, xu hướng lương — không cần đăng nhập
            </p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          Thông tin Thị trường <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
