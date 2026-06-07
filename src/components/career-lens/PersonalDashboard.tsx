"use client";
import { useState, useEffect } from "react";
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
  Clock,
  Building2,
  Zap,
  CheckCircle2,
  Circle,
  Upload,
  BarChart3,
  AlertCircle,
  Award,
  Flame,
  XCircle,
  Eye,
  ExternalLink,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import PersonalDashboardApi from "@/api/personal-dashboard";
import ProfileApi from "@/api/profile";
import JobApi from "@/api/job";
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

import {
  jobsWithDetails,
  userProfile,
  skills as allSkills,
} from "@/data/mockData";
import { analyzeSkillGaps } from "@/utils/matching";
const rawGaps = analyzeSkillGaps(jobsWithDetails, userProfile);
const gapAnalysisMock = Array.isArray(rawGaps)
  ? rawGaps.filter((s) => !s.user_has)
  : [];

const typeColors: Record<string, string> = {
  "Full-time": "bg-blue-100 text-blue-700",
  Remote: "bg-emerald-100 text-emerald-700",
  Hybrid: "bg-violet-100 text-violet-700",
  "Part-time": "bg-amber-100 text-amber-700",
};

function DefaultCvManager({
  profile,
  banner,
  onRefreshProfile,
}: {
  profile: UserProfileResponse | null;
  banner: DashboardBannerDto | null;
  onRefreshProfile: () => Promise<void>;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewingCvUrl, setViewingCvUrl] = useState<string | null>(null);
  const [viewingCvName, setViewingCvName] = useState<string>("");

  const defaultCv = profile?.default_cv;
  const allCvs = profile?.all_cvs || [];
  const defaultMatch = profile?.default_match;

  const handleSetDefaultCv = async (cvId: string) => {
    if (!cvId) return;
    try {
      setIsUpdating(true);
      await ProfileApi.setDefaultCv(cvId);
      await onRefreshProfile(); // Gọi hàm reload dữ liệu ở component cha
    } catch (err) {
      console.error("Lỗi cập nhật CV mặc định:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
      {/* CỘT TRÁI: THÔNG TIN CV MẶC ĐỊNH & DROPDOWN CẤU HÌNH */}
      <div className="flex flex-col justify-between space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            CV đã tải lên
          </label>

          {defaultCv ? (
            <div className="flex items-center justify-between gap-3 p-3.5 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 border border-emerald-100 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-800">
                    CV MẶC ĐỊNH
                  </p>
                  <p
                    className="text-sm font-semibold text-slate-900 truncate"
                    title={defaultCv.file_name}
                  >
                    {defaultCv.file_name}
                  </p>
                </div>
              </div>

              {/* Nút View kế thừa tính năng từ CV Matching qua */}
              {defaultCv.file_url && (
                <button
                  type="button"
                  onClick={() => {
                    setViewingCvUrl(defaultCv.file_url);
                    setViewingCvName(defaultCv.file_name);
                  }}
                  className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl shadow-sm transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold"
                >
                  <Eye className="w-3.5 h-3.5" /> Xem
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 border border-dashed border-slate-200 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
              <AlertCircle className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              Chưa thiết lập CV mặc định hoạt động.
            </div>
          )}
        </div>

        {/* Tuyến Dropdown cấu hình CV Mặc định nằm ở phía dưới */}
        {allCvs.length > 0 && (
          <div className="pt-2 border-t border-slate-50 space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-500">
              Thay đổi CV mặc định:
            </label>
            <div className="flex items-center gap-2">
              <select
                disabled={isUpdating}
                value={defaultCv?.cv_id || ""}
                onChange={(e) => handleSetDefaultCv(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-semibold h-[36px] shadow-sm cursor-pointer disabled:opacity-60"
              >
                <option value="" disabled>
                  -- Chọn CV hệ thống --
                </option>
                {allCvs.map((cv: any) => (
                  <option key={cv.cv_id} value={cv.cv_id}>
                    {cv.file_name} {cv.cv_id === defaultCv?.cv_id ? " ⭐" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* CỘT PHẢI: CHI TIẾT ĐỐI SÁNH MẶC ĐỊNH (DEFAULT MATCH) */}
      <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Cấu hình so khớp mặc định ứng với CV này
          </label>

          {defaultMatch ? (
            <div className="space-y-3">
              {/* Type hiển thị dạng Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Hình thức đối sánh:
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    defaultMatch.match_type === "url"
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  }`}
                >
                  {defaultMatch.match_type === "url"
                    ? "Quét theo Job URL"
                    : "Vị trí Benchmark"}
                </span>
              </div>

              {/* Hiện value tương ứng tùy theo match_type */}
              <div className="bg-white border border-slate-200/60 rounded-xl p-3 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  {defaultMatch.match_type === "url"
                    ? "Đường dẫn nguồn tuyển dụng"
                    : "Vị trí tuyển chọn"}
                </p>
                {defaultMatch.match_type === "url" ? (
                  <a
                    href={defaultMatch.job_posting_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 break-all"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    {defaultMatch.job_posting_url || "N/A"}
                  </a>
                ) : (
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    {defaultMatch.search_group || "N/A"}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 italic">
              Không tìm thấy cấu hình đối sánh mặc định cho CV này
            </div>
          )}
        </div>

        {/* Điểm match điểm xuyết nhẹ ở góc chân */}
        {defaultMatch && (
          <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center text-xs">
            <span className="text-slate-500">Điểm số phân tích hiện tại:</span>
            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {defaultMatch.match_score
                ? `${defaultMatch.match_score * 100}%`
                : `${banner?.match_score || 0}%`}
            </span>
          </div>
        )}
      </div>

      {/* MODAL XEM CHI TIẾT FILE CV (Kế thừa từ CVMatching) */}
      {viewingCvUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <h3 className="text-sm font-bold text-slate-800 truncate">
                  Chi tiết tài liệu: {viewingCvName}
                </h3>
              </div>
              <button
                onClick={() => {
                  setViewingCvUrl(null);
                  setViewingCvName("");
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 p-4 flex justify-center items-center overflow-auto">
              {viewingCvUrl.toLowerCase().includes(".pdf") ? (
                <iframe
                  src={`${viewingCvUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-full rounded-lg bg-white border border-slate-200"
                  title="PDF Preview"
                />
              ) : (
                <div className="max-w-full max-h-full overflow-auto flex justify-center">
                  <img
                    src={viewingCvUrl}
                    alt="CV Preview"
                    className="max-w-full h-auto object-contain rounded-lg shadow-md bg-white"
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

const CustomRadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-xs font-medium">
        <p className="text-slate-900 font-semibold mb-1 flex items-center gap-1">
          <span>{data.subject}</span>
          {data.matchedVia && (
            <span className="text-violet-500 font-normal text-[10px] bg-violet-50 px-1.5 py-0.5 rounded">
              (khớp qua {data.matchedVia})
            </span>
          )}
        </p>
        <p className="text-blue-600">Bạn có: {data.you}%</p>
        <p className="text-emerald-600">
          Yêu cầu thị trường: {data.market || 100}%
        </p>
      </div>
    );
  }
  return null;
};

// ── Component ────────────────────────────────────────────────────
export function PersonalDashboard() {
  const [activeTab, setActiveTab] = useState<"jobs" | "skills" | "progress">(
    "jobs",
  );
  const [categories, setCategories] = useState<MatchCategoryResponse[]>([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState<boolean>(false);
  const [skillCategory, setSkillCategory] = useState<string>("");

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
          }
        }
      }
      if (bannerRes.data) setBanner(bannerRes.data);
      if (statsRes.data) setStatistics(statsRes.data);
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

  // Ánh xạ dữ liệu động từ API phục vụ các logic hiển thị hoặc cảnh báo
  const strength = statistics?.profile_completion_percentage ?? 0;
  const hasCV = !!(profile?.all_cvs && profile.all_cvs.length > 0);
  const userName = profile?.user?.full_name?.split(" ").pop() ?? "bạn";
  const personalMatchedCount = recommendedJobs.length;
  const avgMatchScore = banner?.match_score ?? 0;

  // Khớp nối cấu trúc checklist cũ từ API mới để giữ nguyên UI lặp
  const currentChecklist = progress?.checklist ?? [];
  const incompleteTasks = currentChecklist.filter((c) => !c.is_completed);

  const radarData = radarSkills.map((s: any) => {
    let youScore = Math.round((s.similarity || 0) * 100);
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
      href: "/roadmap",
      icon: BookOpen,
      title: "Tiếp tục lộ trình học",
      desc: "Node.js · 60% hoàn thành",
      color: "from-blue-500 to-blue-600",
      badge: "In progress",
    },
    {
      href: "/jobs",
      icon: Briefcase,
      title: `${personalMatchedCount} jobs phù hợp với bạn`,
      desc: `Match cao nhất · Cập nhật hôm nay`,
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
                  href="#"
                  className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors"
                >
                  <Circle className="h-3 w-3" />
                  {task.step_name}
                  <span className="rounded-md bg-violet-500 px-1.5 py-0.5 text-[10px] font-bold">
                    +15%
                  </span>
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
                    {personalMatchedCount} jobs
                  </span>{" "}
                  (match ≥ 70%). Điểm match trung bình:{" "}
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

      <DefaultCvManager
        profile={profile}
        banner={banner}
        onRefreshProfile={fetchDashboardData}
      />

      {/* ── No CV Warning ── */}
      {!hasCV && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              Chưa có CV — Gợi ý chưa được cá nhân hóa
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Tải CV (PDF/DOCX) để hệ thống tính toán điểm match chính xác với
              từng job.
            </p>
          </div>
          <Link
            href="/cv-matching"
            className="shrink-0 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors"
          >
            Tải CV
          </Link>
        </div>
      )}

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: Briefcase,
            label: "Jobs Phù Hợp",
            value: personalMatchedCount.toString(),
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
        {actionItems.map((action) => (
          <Link
            key={action.href}
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
            {recommendedJobs.map((job) => (
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
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${typeColors["Full-time"]}`}
                    >
                      Full-time
                    </span>
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
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Vừa cập nhật
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium">
                      Docker
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium">
                      Kubernetes
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right flex flex-col items-end gap-1">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700`}
                  >
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
                Xem tất cả {personalMatchedCount} jobs phù hợp{" "}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Tab: Skills */}
        {activeTab === "skills" && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar */}
            <div className="bg-white rounded-xl p-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Kỹ năng của bạn so với thị trường
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Theo từng nhóm kỹ năng
                </p>
              </div>

              {/* Thanh Dropdown thông minh tích hợp thanh tìm kiếm và kiểm soát trạng thái is_matched */}
              <div className="pt-1">
                <RadarCategoryDropdown
                  categories={categories}
                  selected={skillCategory}
                  onSelect={(cat) => setSkillCategory(cat)}
                  isLoading={isCategoryLoading}
                />
              </div>

              {/* Khu vực vẽ Chart */}
              {radarData.length === 0 ? (
                <div className="h-[240px] flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-xs text-slate-400">
                  Không có dữ liệu phân tích kỹ năng cho danh mục này
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart
                    data={radarData}
                    margin={{ top: 10, right: 25, bottom: 10, left: 25 }}
                  >
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
                    />
                    <PolarRadiusAxis
                      tick={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Radar
                      name="Bạn"
                      dataKey="you"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.35}
                    />
                    <Radar
                      name="Thị trường"
                      dataKey="required"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.15}
                    />
                    <Tooltip content={<CustomRadarTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              )}

              {/* Chú thích màu sắc */}
              <div className="flex gap-4 justify-center border-t border-slate-50 pt-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span className="w-3.5 h-0.5 bg-blue-500 inline-block rounded-full" />
                  Bạn
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span className="w-3.5 h-0.5 bg-emerald-500 inline-block rounded-full" />
                  Yêu cầu thị trường
                </div>
              </div>
            </div>

            {/* Critical Gaps */}
            {/* Critical Gaps */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Kỹ năng cần cải thiện
                  </h4>
                  <p className="text-xs text-slate-500">
                    Ảnh hưởng lớn đến match score của nhóm này
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {radarSkills.length === 0 ? (
                  <div className="h-[116px] flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-xs text-slate-400">
                    Không có dữ liệu đánh giá cho danh mục này
                  </div>
                ) : /* CHỐT CHẶN CẤP 2: Có dữ liệu gốc nhưng không có kỹ năng nào bị thiếu điểm */
                radarSkills.filter((s: any) => {
                    const currentScore =
                      typeof s.similarity === "number"
                        ? Math.round(s.similarity * 100)
                        : (s.user_score ?? 0);
                    const targetScore =
                      typeof s.similarity === "number"
                        ? 100
                        : (s.market_score ?? 100);
                    return currentScore < targetScore;
                  }).length === 0 ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                    🎉 Tuyệt vời! Bạn đã đáp ứng tốt các kỹ năng trong nhóm này.
                  </div>
                ) : (
                  /* Duyệt qua các kỹ năng có điểm số thấp hơn yêu cầu thị trường */
                  radarSkills
                    .filter((s: any) => {
                      const currentScore =
                        typeof s.similarity === "number"
                          ? Math.round(s.similarity * 100)
                          : (s.user_score ?? 0);
                      const targetScore =
                        typeof s.similarity === "number"
                          ? 100
                          : (s.market_score ?? 100);
                      return currentScore < targetScore;
                    })
                    .map((item: any, idx) => {
                      // Tính toán phần trăm khoảng cách thiếu hụt dựa theo nguồn API tương ứng
                      const userScore =
                        typeof item.similarity === "number"
                          ? Math.round(item.similarity * 100)
                          : (item.user_score ?? 0);
                      const marketScore =
                        typeof item.similarity === "number"
                          ? 100
                          : (item.market_score ?? 100);
                      const gapScore = marketScore - userScore;

                      return (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-slate-900">
                              {item.skill_name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                              {userScore === 0
                                ? "Chưa có"
                                : `Thiếu ${gapScore}% (Hiện tại: ${userScore}%)`}
                            </span>
                          </div>
                          <div className="relative h-2 bg-white border border-slate-200 rounded-full overflow-hidden">
                            <div
                              className="absolute h-full rounded-full bg-amber-500 transition-all"
                              /* Thanh progress bar thể hiện tỷ lệ sở hữu kỹ năng hiện tại */
                              style={{ width: `${userScore}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

              <Link
                href="/skill-gap"
                className="mt-3 flex items-center justify-center gap-2 py-2.5 w-full bg-violet-50 text-violet-700 rounded-xl text-sm font-semibold hover:bg-violet-100 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Xem full Phân tích kỹ năng
              </Link>
            </div>
          </div>
        )}

        {/* Tab: Progress */}
        {activeTab === "progress" && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      href="#"
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
                      {!c.is_completed && (
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold">
                          +15%
                        </span>
                      )}
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
                  <h4 className="text-sm font-semibold text-slate-900">
                    Lộ trình đề xuất
                  </h4>
                  <Link
                    href="/roadmap"
                    className="text-xs text-blue-600 font-semibold flex items-center gap-0.5 hover:text-blue-700"
                  >
                    Xem tất cả <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {gapAnalysisMock.slice(0, 3).map((path, idx) => (
                  <div key={idx} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">
                        {/* SỬA TỪ path.name THÀNH path.skill_name */}
                        {path.skill_name}
                      </span>
                      <span className="text-xs text-emerald-600 font-semibold">
                        +{path.demand_percentage || 20}% jobs
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${path.user_proficiency || 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {path.user_proficiency || 0}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Độ ưu tiên {idx + 1} — Nhóm: {path.category || "General"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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
