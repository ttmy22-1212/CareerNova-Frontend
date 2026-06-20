"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { NextStepBanner } from "./NextStepBanner";
import { SkillRadar } from "./SkillRadar";
import { InfoTooltip, GLOSSARY } from "./InfoTooltip";
import { buildCategoryOverview } from "@/utils/category-overview";
import {
  Target,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Clock,
  Zap,
  CheckCircle2,
  Circle,
} from "lucide-react";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";

// ── IMPORT API & TYPES THỰC TẾ ──────────────────────────────────
import SkillGapApi from "@/api/skill-gap";
import MatchingApi from "@/api/matching";
import ProfileApi from "@/api/profile";
import {
  SkillGapStatisticsDto,
  CategoryGapDto,
  SkillGapLearningRecommendationDto,
} from "@/types/skill-gap";
import { MatchCategoryResponse } from "@/types/matching";
import { UserProfileResponse } from "@/types/profile";

const statusConfig: Record<
  string,
  { label: string; barColor: string; badgeBg: string; badgeText: string }
> = {
  Matched: {
    label: "Đã khớp",
    barColor: "bg-emerald-500",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
  },
  Partial: {
    label: "Khớp một phần",
    barColor: "bg-amber-400",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
  },
  Missing: {
    label: "Thiếu",
    barColor: "bg-red-500",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
  },
  Proficient: {
    label: "Thành thạo",
    barColor: "bg-emerald-500",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
  },
};

const priorityConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  critical: { label: "Rất ưu tiên", color: "text-red-700", bg: "bg-red-100" },
  high: {
    label: "Ưu tiên cao",
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  medium: { label: "Ưu tiên", color: "text-amber-700", bg: "bg-amber-100" },
  low: { label: "Bổ sung", color: "text-blue-700", bg: "bg-blue-100" },
};

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
    <div className="relative z-10 w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-100"
      >
        <span className="truncate">
          {selected === "All" ? "Tất cả nhóm kỹ năng" : selected}
        </span>
        {isLoading ? (
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
        ) : (
          <svg
            className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
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
        <div className="animate-in fade-in slide-in-from-top-1 absolute left-0 z-20 mt-1 flex max-h-48 w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg duration-150">
          <div className="border-b border-slate-100 bg-slate-50/50 p-2">
            <input
              type="text"
              placeholder="Tìm kiếm nhóm kỹ năng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 divide-y divide-slate-50 overflow-y-auto">
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
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-all
                  ${
                    selected === cat.category
                      ? "bg-blue-50 font-bold text-blue-600"
                      : "text-slate-700"
                  }
                  ${
                    !cat.is_matched
                      ? "cursor-not-allowed bg-slate-50/50 opacity-30"
                      : "hover:bg-slate-50"
                  }
                `}
              >
                <span className="truncate">{cat.category}</span>
                {!cat.is_matched && (
                  <span className="shrink-0 text-[10px] text-slate-400">
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

export function SkillGapAnalysis() {
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [matchSkillCategory, setMatchSkillCategory] = useState<string>("");
  const [matchCategories, setMatchCategories] = useState<
    MatchCategoryResponse[]
  >([]);
  const [isMatchCategoryLoading, setIsMatchCategoryLoading] = useState(false);

  // States quản lý dữ liệu động từ API
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [statistics, setStatistics] = useState<SkillGapStatisticsDto | null>(
    null,
  );
  const [categoryGaps, setCategoryGaps] = useState<CategoryGapDto[]>([]);
  const [matchRadarSkills, setMatchRadarSkills] = useState<any[]>([]);
  const [categoryOverview, setCategoryOverview] = useState<any[]>([]);
  const [learningRecommendations, setLearningRecommendations] = useState<
    SkillGapLearningRecommendationDto[]
  >([]);
  const [isLearningLoading, setIsLearningLoading] = useState(false);

  // 1. Tải toàn bộ cấu trúc dữ liệu ban đầu khi mount trang
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLearningLoading(true);
        const [profileRes, statsRes, gapsRes, learningRes] = await Promise.all([
          ProfileApi.getMe(),
          SkillGapApi.getStatistics(),
          SkillGapApi.getCategoryGaps(10),
          SkillGapApi.getLearningPaths(3),
        ]);

        if (profileRes.data) {
          setProfile(profileRes.data);

          const defaultMatchId = profileRes.data.default_match?.match_id;
          if (defaultMatchId) {
            const catRes = await MatchingApi.getMatchCategories(defaultMatchId);
            if (catRes?.data) {
              setMatchCategories(catRes.data);
              setMatchSkillCategory("All");
              buildCategoryOverview(defaultMatchId, catRes.data)
                .then(setCategoryOverview)
                .catch(() => {});
            }
          }
        }
        if (statsRes.data) setStatistics(statsRes.data);
        if (gapsRes.data) {
          setCategoryGaps(gapsRes.data);
          if (gapsRes.data.length > 0) {
            setExpandedCat(gapsRes.data[0].category);
          }
        }
        if (learningRes.data) setLearningRecommendations(learningRes.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu Skill Gap:", err);
      } finally {
        setIsLearningLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const defaultMatchId = profile?.default_match?.match_id;
    if (!defaultMatchId || !matchSkillCategory) return;

    const fetchMatchRadarData = async () => {
      try {
        setIsMatchCategoryLoading(true);

        if (matchSkillCategory === "All") {
          const rawRadar = profile?.default_match?.radar_data || [];
          const rawGapReport = profile?.default_match?.gap_report || {};
          const allSkillsForRadar = [
            ...rawRadar,
            ...((rawGapReport as any).partially_matched_skills || []),
            ...((rawGapReport as any).missing_skills || []),
          ];

          const formattedAll = allSkillsForRadar.map((s: any) => {
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

          setMatchRadarSkills(formattedAll);
          return;
        }

        const res = await MatchingApi.getRadarByCategory(
          defaultMatchId,
          matchSkillCategory,
        );
        if (res?.data) {
          const rawRadar = res.data.radar_data || [];
          const rawGapReport = (res.data.gap_report as any) || {};
          setMatchRadarSkills([
            ...rawRadar,
            ...(rawGapReport.partially_matched_skills || []),
            ...(rawGapReport.missing_skills || []),
          ]);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu Radar theo matching:", err);
      } finally {
        setIsMatchCategoryLoading(false);
      }
    };

    fetchMatchRadarData();
  }, [matchSkillCategory, profile?.default_match?.match_id]);

  const matchRadarData = matchRadarSkills.map((s: any) => {
    let youScore = normalizePercent(s.similarity);
    if (youScore === 0) youScore = 0.1;

    return {
      subject: s.skill_name || "",
      you: youScore,
      required: 100,
      matchedVia: s.matched_via || null,
    };
  });

  const formatCategoryGapScore = (value: number) => {
    const roundedValue = Number(value.toFixed(1));
    return `${roundedValue > 0 ? "+" : ""}${roundedValue}pt`;
  };

  const clampPercent = (value: number) => Math.min(Math.max(value, 0), 100);

  const renderCategoryGapLabel = (props: any) => {
    const { x = 0, y = 0, width = 0, height = 0, value = 0 } = props;
    const numericValue = Number(value);
    const labelX =
      numericValue >= 0 ? Number(x) + Number(width) + 6 : Number(x) - 6;
    const labelY = Number(y) + Number(height) / 2 + 4;

    return (
      <text
        x={labelX}
        y={labelY}
        textAnchor={numericValue >= 0 ? "start" : "end"}
        fill="#64748b"
        fontSize={11}
        fontWeight={600}
      >
        {formatCategoryGapScore(numericValue)}
      </text>
    );
  };

  // Định dạng dữ liệu cho biểu đồ thanh ngang độ khớp danh mục (âm: thiếu, dương: khớp)
  const chartData = categoryGaps.map((c) => {
    const score = Number(c.gap_score || 0);
    const roundedScore = Number(score.toFixed(1));

    return {
      name: c.category.replace(" Development", "").replace(" & Data", ""),
      gap: roundedScore,
      color:
        roundedScore < 0 ? "#ef4444" : roundedScore > 0 ? "#10b981" : "#94a3b8",
    };
  });

  return (
    <div className="p-6 space-y-5">
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        {[
          {
            icon: Target,
            label: "Mức độ phù hợp với thị trường",
            value: `${statistics?.match_score ?? 0}%`,
            sub: "Trên tất cả danh mục",
            iconBg: "bg-blue-50 text-blue-600",
            change: "Phù hợp",
            changeColor: "text-blue-500",
          },
          {
            icon: Zap,
            label: "Khoảng trống nghiêm trọng",
            value: `${statistics?.core_gaps_count ?? 0}`,
            sub: "Kỹ năng cần ưu tiên",
            iconBg: "bg-red-50 text-red-600",
            change: "Cốt lõi",
            changeColor: "text-red-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-100 shadow-sm p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-semibold ${stat.changeColor}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-0.5">
              {stat.value}
            </p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar with Category Combo Box */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-900">Chi tiết kỹ năng</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Chọn danh mục để xem phân tích kỹ năng chi tiết
          </p>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="mb-3">
              <h4 className="flex items-center gap-1 text-sm font-bold text-slate-900">
                Kỹ năng của bạn so với thị trường
                <InfoTooltip text={GLOSSARY.similarity} />
              </h4>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Theo kết quả so khớp CV mặc định
              </p>
            </div>

            {profile?.default_match ? (
              <>
                <RadarCategoryDropdown
                  categories={matchCategories}
                  selected={matchSkillCategory}
                  onSelect={(cat) => setMatchSkillCategory(cat)}
                  isLoading={isMatchCategoryLoading}
                />

                {(() => {
                  const isOverview =
                    matchSkillCategory === "All" &&
                    categoryOverview.length >= 2;
                  if (!isOverview && matchRadarData.length === 0) {
                    return (
                      <div className="mt-4 flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/70 text-xs text-slate-400">
                        Không có dữ liệu phân tích kỹ năng cho danh mục này
                      </div>
                    );
                  }
                  return (
                    <div className="mt-4">
                      {isOverview ? (
                        <p className="mb-2 text-[11px] text-slate-500">
                          Điểm trung bình theo nhóm — bấm vào tên nhóm để xem
                          chi tiết
                        </p>
                      ) : (
                        matchSkillCategory !== "All" && (
                          <button
                            onClick={() => setMatchSkillCategory("All")}
                            className="mb-2 text-xs text-blue-600 hover:underline"
                          >
                            ← Quay lại tổng quan
                          </button>
                        )
                      )}
                      <SkillRadar
                        data={isOverview ? categoryOverview : matchRadarData}
                        requiredLabel="Yêu cầu thị trường"
                        clickableLabels={isOverview}
                        onLabelClick={(cat) => setMatchSkillCategory(cat)}
                      />
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  Chưa có dữ liệu khoảng trống kỹ năng
                </p>
                <p className="text-xs text-slate-500 max-w-xs">
                  Tải CV và chạy đối soát để xem bạn còn thiếu kỹ năng nào so
                  với thị trường.
                </p>
                <Link
                  href="/cv-matching"
                  className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Bắt đầu đối soát CV
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Gap Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-0.5">
            Độ khớp theo danh mục
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Điểm khớp theo trọng số kỹ năng từ so khớp mặc định
          </p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 10, right: 30 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[
                    (dataMin: number) => Math.min(dataMin - 10, 0),
                    (dataMax: number) => Math.max(dataMax + 10, 0),
                  ]}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <ReferenceLine x={0} stroke="#cbd5e1" strokeDasharray="3 3" />
                <Tooltip
                  formatter={(v: any) => [
                    formatCategoryGapScore(Number(v)),
                    "Điểm khớp",
                  ]}
                />
                <Bar
                  dataKey="gap"
                  radius={[6, 6, 6, 6]}
                  label={renderCategoryGapLabel}
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm text-slate-400">
              Không có dữ liệu độ khớp
            </div>
          )}
        </div>
      </div>

      {/* ── Detailed Breakdown ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">
            Phân tích kỹ năng chi tiết
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mở rộng từng danh mục để xem các kỹ năng
          </p>
        </div>
        <div className="divide-y divide-slate-50">
          {categoryGaps.length === 0 ? (
            <div className="flex items-center justify-center px-5 py-12 text-sm text-slate-400">
              Không có dữ liệu kỹ năng chi tiết
            </div>
          ) : (
            categoryGaps.map((cat) => {
              const isExpanded = expandedCat === cat.category;
              const gapColor =
                cat.gap_score > 0
                  ? "bg-emerald-100 text-emerald-700"
                  : cat.gap_score < 0
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-600";
              const barFillColor =
                cat.gap_score > 0
                  ? "#10b981"
                  : cat.gap_score < 0
                    ? "#ef4444"
                    : "#94a3b8";
              const categoryUserRate = clampPercent(cat.user_rate_avg);

              return (
                <div key={cat.category}>
                  <button
                    onClick={() =>
                      setExpandedCat(isExpanded ? null : cat.category)
                    }
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <span className="text-xl">🛠️</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="font-semibold text-slate-900 text-sm">
                          {cat.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${gapColor}`}
                        >
                          {cat.gap_label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${categoryUserRate}%`,
                              backgroundColor: barFillColor,
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">
                          Bạn:{" "}
                          <span className="font-semibold text-slate-700">
                            {cat.user_rate_avg}%
                          </span>
                          {" · "}Thị trường:{" "}
                          <span className="font-semibold text-slate-700">
                            {cat.market_rate_avg}%
                          </span>
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-4 space-y-3">
                      {cat.skills.map((skill) => {
                        const sc =
                          statusConfig[skill.status] || statusConfig["Missing"];
                        const skillUserRate = clampPercent(skill.user_rate);
                        const skillMarketRate = clampPercent(skill.market_rate);

                        return (
                          <div
                            key={skill.skill_id}
                            className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-slate-900">
                                  {skill.skill_name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-slate-500">
                                    {skill.user_rate}% / {skill.market_rate}%
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sc.badgeBg} ${sc.badgeText}`}
                                  >
                                    {sc.label}
                                  </span>
                                </div>
                              </div>
                              <div className="relative h-2 bg-white border border-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`absolute h-full rounded-full transition-all ${sc.barColor}`}
                                  style={{ width: `${skillUserRate}%` }}
                                />
                                <div
                                  className="absolute top-0 bottom-0 w-0.5 bg-slate-400 rounded-full"
                                  style={{ left: `${skillMarketRate}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[10px] text-slate-400">
                                  Bạn: {skill.user_rate}% · Thị trường:{" "}
                                  {skill.market_rate}%
                                </span>
                                <Link
                                  href={`/roadmap?skill=${encodeURIComponent(skill.skill_name)}`}
                                  className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5 shrink-0"
                                >
                                  Học ngay
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Learning Paths ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Lộ trình học đề xuất</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ưu tiên để tối đa hóa điểm phù hợp công việc
            </p>
          </div>
          <Link
            href="/roadmap"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Xem lộ trình <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {isLearningLoading ? (
            <div className="space-y-3 px-5 py-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 rounded-xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : learningRecommendations.length === 0 ? (
            <div className="flex items-center justify-center px-5 py-12 text-sm text-slate-400">
              Không có lộ trình học đề xuất
            </div>
          ) : (
            learningRecommendations.map((path) => {
              const isExpanded = expandedPath === path.id;
              const pc = priorityConfig[path.priority];
              const firstCourse = path.courses[0];
              const actionHref = firstCourse?.source_url || "/roadmap";

              return (
                <div key={path.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-slate-900 text-sm">
                          {path.skill_name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pc.bg} ${pc.color}`}
                        >
                          {pc.label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            path.status === "Missing"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {path.status === "Missing"
                            ? "Thiếu"
                            : "Khớp một phần"}
                        </span>
                        {path.started && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100">
                            Trong tiến trình
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        {path.category || "General"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3 h-3" />
                          {path.estimated_time}
                        </span>
                        <span className="text-emerald-600 font-semibold">
                          {path.impact}
                        </span>
                        <span className="text-slate-500">
                          {path.jobs_requiring}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPath(isExpanded ? null : path.id)
                        }
                        className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-1"
                      >
                        {isExpanded ? "Thu gọn" : "Chi tiết"}
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                      <Link
                        href={actionHref}
                        target={firstCourse?.source_url ? "_blank" : undefined}
                        rel={
                          firstCourse?.source_url
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          path.started
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                      >
                        {path.started ? "Tiếp tục" : "Bắt đầu"}
                      </Link>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                          Khóa học gợi ý
                        </p>
                        <div className="space-y-2">
                          {path.courses.map((course) => (
                            <Link
                              key={course.id}
                              href={course.source_url || "/roadmap"}
                              target={course.source_url ? "_blank" : undefined}
                              rel={
                                course.source_url
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors group"
                            >
                              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-base">
                                {course.image || (
                                  <BookOpen className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-900 truncate">
                                  {course.title}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {course.provider} · {course.duration}
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                {course.rating > 0 && (
                                  <p className="text-[10px] font-bold text-amber-600">
                                    ★ {course.rating.toFixed(1)}
                                  </p>
                                )}
                                <p className="text-[10px] text-slate-400">
                                  {course.price > 0
                                    ? `$${course.price}`
                                    : "Free"}
                                </p>
                              </div>
                            </Link>
                          ))}
                          {path.paths.map((learningPath) => (
                            <div
                              key={learningPath.id}
                              className="flex items-start gap-3 rounded-lg bg-slate-50 p-2.5"
                            >
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 text-base">
                                {learningPath.icon}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-900">
                                  {learningPath.title}
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
                                  {learningPath.description}
                                </p>
                                <p className="mt-1 text-[10px] font-semibold text-emerald-600">
                                  {learningPath.difficulty} ·{" "}
                                  {learningPath.duration}
                                </p>
                              </div>
                            </div>
                          ))}
                          {path.courses.length === 0 &&
                            path.paths.length === 0 && (
                              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-400">
                                Chưa có khóa học phù hợp cho kỹ năng này
                              </div>
                            )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                          Các bước học
                        </p>
                        <div className="space-y-2">
                          {path.steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                  path.started && i === 0
                                    ? "bg-blue-600"
                                    : "bg-slate-200"
                                }`}
                              >
                                {path.started && i === 0 ? (
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                ) : (
                                  <Circle className="w-3 h-3 text-slate-400" />
                                )}
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed">
                                {step}
                              </p>
                            </div>
                          ))}
                          <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                              <Award className="h-3.5 w-3.5 text-blue-600" />
                              Chi tiết matching
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500">
                              Hiện tại: {path.user_rate}% · Mức độ ưu tiên theo{" "}
                              {path.jobs_requiring.toLowerCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <NextStepBanner
        href="/roadmap"
        title="Đã thấy khoảng trống — giờ lấp đầy nó"
        desc="Xem lộ trình học & khóa học gợi ý cho những kỹ năng bạn còn thiếu."
        cta="Tới Lộ trình học"
      />
    </div>
  );
}
