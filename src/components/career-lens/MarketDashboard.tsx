"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  TrendingUp,
  Building2,
  Flame,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Sparkles,
  Globe,
  BarChart3,
  ChevronRight,
  Eye,
  Users,
} from "lucide-react";


const formatCompact = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${value}`;
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Treemap,
} from "recharts";

import MarketDashboardApi from "@/api/market-dashboard";
import PersonalDashboardApi from "@/api/personal-dashboard";
import {
  DashboardFilterDto,
  FilterOptionDto,
  StatsCardData,
  TrendDataPointDto,
  IndustryItemDto,
  HotJobItemDto,
  InDemandSkillItemDto,
  RisingSkillItemDto,
} from "@/types/market-dashboard";

import { useOnboarding } from "@/contexts/onboarding/onboarding-context";

import { CATEGORY_COLORS, categoryColor, BRAND_BAR } from "./chart-palette";
import { toTitleCase } from "@/utils/text";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-slate-900 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}:{" "}
            <span className="font-medium">{p.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ── Treemap "Phân bổ thị trường" ──────────────────────────────────
// Diện tích mỗi ô tỉ lệ thuận với số tin tuyển dụng của nhóm kỹ năng,
// giúp người dùng quét nhanh nhóm nào đang lớn (cảm hứng: karpathy.ai/jobs).
const IndustryTreemapCell = (props: any) => {
  const { x, y, width, height, name, percentage, fill, index } = props;
  if (!(width > 0) || !(height > 0)) return null;
  const color = fill || categoryColor(index);
  const showLabel = width > 56 && height > 30;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        ry={6}
        style={{ fill: color, stroke: "#fff", strokeWidth: 2 }}
      />
      {showLabel && (
        <>
          <text
            x={x + 8}
            y={y + 18}
            fill="#fff"
            fontSize={11}
            fontWeight={600}
            style={{ pointerEvents: "none" }}
          >
            {String(name).length > 16
              ? `${String(name).slice(0, 15)}…`
              : name}
          </text>
          <text
            x={x + 8}
            y={y + 33}
            fill="rgba(255,255,255,0.85)"
            fontSize={11}
            style={{ pointerEvents: "none" }}
          >
            {percentage}%
          </text>
        </>
      )}
    </g>
  );
};

const TreemapTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-slate-900 mb-0.5">{d.name}</p>
        <p className="text-slate-600">
          <span className="font-medium">{d.count?.toLocaleString()}</span> công
          việc · {d.percentage}%
        </p>
      </div>
    );
  }
  return null;
};

export function MarketDashboard({
  isLoggedIn = false,
}: {
  isLoggedIn?: boolean;
}) {
  // ── States quản lý giá trị bộ lọc hiện tại ────────────────────────
  const [region, setRegion] = useState("");
  const [timePeriod, setTimePeriod] =
    useState<DashboardFilterDto["time_range"]>("30days");
  const [jobType, setJobType] = useState<DashboardFilterDto["work_type"] | "">(
    "",
  );

  // ── States quản lý dữ liệu động lấy từ API Options ────────────────
  const [filterOptions, setFilterOptions] = useState<{
    locations: FilterOptionDto[];
    timeRanges: FilterOptionDto[];
    workTypes: FilterOptionDto[];
  } | null>(null);

  // ── States quản lý dữ liệu của các Widget ─────────────────────────
  const [stats, setStats] = useState<StatsCardData | null>(null);
  const [trends, setTrends] = useState<{
    scale: string;
    data: TrendDataPointDto[];
  }>({ scale: "ngày", data: [] });
  const [industriesData, setIndustriesData] = useState<IndustryItemDto[]>([]);
  const [hotJobsData, setHotJobsData] = useState<HotJobItemDto[]>([]);
  const [inDemandSkillsData, setInDemandSkillsData] = useState<
    InDemandSkillItemDto[]
  >([]);
  const [risingSkillsData, setRisingSkillsData] = useState<
    RisingSkillItemDto[]
  >([]);
  const [personalInsight, setPersonalInsight] = useState<{
    highMatchCount: number;
    missingSkills: number;
    profileCompletion: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { strength } = useOnboarding();

  useEffect(() => {
    async function initFilterOptions() {
      try {
        const res = await MarketDashboardApi.getDashboardFiltersOptions();
        if (res?.data) {
          const rawOptions = res.data as any;
          setFilterOptions({
            locations: rawOptions.locations || [],
            timeRanges: rawOptions.time_ranges || [],
            workTypes: rawOptions.work_types || [],
          });
        }
      } catch (err) {
        console.error("Lỗi khi load danh sách bộ lọc:", err);
      }
    }
    initFilterOptions();
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      const payload: DashboardFilterDto = {
        time_range: timePeriod,
      };

      if (region) {
        payload.location = region;
      }

      if (jobType) {
        payload.work_type = jobType;
      }

      try {
        const [
          resStats,
          resTrends,
          resIndustries,
          resHotJobs,
          resInDemand,
          resRising,
        ] = await Promise.all([
          MarketDashboardApi.getStats(payload),
          MarketDashboardApi.getTrends(payload),
          MarketDashboardApi.getIndustryBreakdown(payload),
          MarketDashboardApi.getHotJobs(payload),
          MarketDashboardApi.getInDemandSkills(payload),
          MarketDashboardApi.getRisingSkills(payload),
        ]);

        if (resStats?.data) {
          const statsData = (resStats.data as any).data || resStats.data;
          setStats(statsData);
        }
        if (resTrends?.data) {
          const trendsData = (resTrends.data as any).data || resTrends.data;

          setTrends({
            scale: trendsData.x_axis_scale || "day",
            data: Array.isArray(trendsData.data) ? trendsData.data : trendsData,
          });
        }
        if (resIndustries?.data) {
          const rawData = resIndustries.data as any;

          const actualData = Array.isArray(rawData) ? rawData : rawData.data;

          if (actualData) {
            setIndustriesData(actualData);
          }
        }
        if (resHotJobs?.data) {
          const hotJobs = (resHotJobs.data as any).data || resHotJobs.data;
          setHotJobsData(hotJobs);
        }
        if (resInDemand?.data) {
          const inDemandSkills =
            (resInDemand.data as any).data || resInDemand.data;
          setInDemandSkillsData(inDemandSkills);
        }
        if (resRising?.data) {
          const risingSkills = (resRising.data as any).data || resRising.data;
          setRisingSkillsData(risingSkills);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu phân tích Dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [region, timePeriod, jobType]);

  useEffect(() => {
    if (!isLoggedIn) {
      setPersonalInsight(null);
      return;
    }

    async function fetchPersonalInsight() {
      try {
        const [bannerRes, statsRes] = await Promise.all([
          PersonalDashboardApi.getBanner(),
          PersonalDashboardApi.getStatistics(),
        ]);

        setPersonalInsight({
          highMatchCount: bannerRes?.data?.suitable_jobs_count ?? 0,
          missingSkills: statsRes?.data?.missing_skills_count ?? 0,
          profileCompletion:
            statsRes?.data?.profile_completion_percentage ?? strength,
        });
      } catch (err) {
        console.error("Lỗi khi tải insight cá nhân:", err);
        setPersonalInsight(null);
      }
    }

    fetchPersonalInsight();
  }, [isLoggedIn, strength]);

  const highMatchCount = personalInsight?.highMatchCount ?? 0;
  const missingSkills = personalInsight?.missingSkills ?? 0;
  const profileCompletion = personalInsight?.profileCompletion ?? strength;

  // Chuẩn hoá dữ liệu cho Treemap "Phân bổ thị trường" (gắn sẵn màu theo nghĩa)
  const industryTreemapData = industriesData.map((item, i) => ({
    name: toTitleCase(item.category_name || item.industry_name || "Khác"),
    count: item.count,
    percentage: item.percentage,
    fill: categoryColor(i),
  }));

  return (
    <div className="p-6 space-y-6">
      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 w-48 h-48 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-xs font-semibold uppercase tracking-widest">
                Thông tin thị trường
              </span>
            </div>
            <h1 className="text-white text-2xl font-bold mb-1">
              Thông tin thị trường việc làm IT
            </h1>
            <p className="text-slate-300 text-sm max-w-lg">
              Cập nhật xu hướng tuyển dụng và kỹ năng được săn đón nhất theo dữ
              liệu tin tuyển dụng IT. Không cần đăng nhập.
            </p>
          </div>
          {!isLoggedIn && (
            <div className="flex flex-col gap-2 shrink-0">
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-900/40"
              >
                <Sparkles className="w-4 h-4" />
                Xem insight cá nhân
              </Link>
              <p className="text-xs text-slate-400 text-center">
                Đăng nhập để thấy công việc phù hợp với bạn
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Personal Insight Banner ── */}
      {isLoggedIn && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-blue-800 dark:text-blue-200 uppercase tracking-wider">
              Dành cho bạn
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/cv-matching"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5" />
              {highMatchCount} công việc khớp CV của bạn
              <ArrowRight className="w-3 h-3" />
            </Link>
            {missingSkills > 0 && (
              <Link
                href="/skill-gap"
                className="flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100 transition-colors dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Còn {missingSkills} kỹ năng cần ưu tiên
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            {profileCompletion < 50 && (
              <Link
                href="/onboarding/welcome"
                className="flex items-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Hoàn thiện hồ sơ ({profileCompletion}%) để xem insight đầy đủ
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Tầng giao diện Bộ lọc Filters động từ DB ── */}
      <div className="sticky top-0 z-20 -mx-2 flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-white/90 px-3 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Filter className="w-4 h-4" />
          Lọc:
        </div>

        {/* Dropdown 1: Locations */}
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {filterOptions?.locations.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Dropdown 2: Time Ranges */}
        <select
          value={timePeriod}
          onChange={(e) =>
            setTimePeriod(e.target.value as DashboardFilterDto["time_range"])
          }
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {filterOptions?.timeRanges.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Dropdown 3: Work Types */}
        <select
          value={jobType}
          onChange={(e) =>
            setJobType(e.target.value as DashboardFilterDto["work_type"] | "")
          }
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {filterOptions?.workTypes.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {isLoading && (
          <span className="text-xs text-blue-600 font-medium animate-pulse ml-2">
            Đang đồng bộ dữ liệu thị trường...
          </span>
        )}

        <span className="ml-auto hidden text-[11px] text-slate-400 sm:inline">
          Nguồn: tin tuyển dụng IT thu thập tự động · cập nhật định kỳ
        </span>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Briefcase,
            label: "Tin tuyển dụng đang mở",
            sub: "Vị trí IT đang mở tuyển",
            value: stats?.active_jobs?.count?.toLocaleString() ?? "0",
            badge:
              stats?.active_jobs?.growth_percentage !== undefined
                ? {
                    text: `${stats.active_jobs.growth_percentage >= 0 ? "+" : ""}${stats.active_jobs.growth_percentage}%`,
                    tone:
                      stats.active_jobs.growth_percentage >= 0
                        ? "positive"
                        : "negative",
                  }
                : { text: "--", tone: "neutral" },
          },
          {
            icon: Building2,
            label: "Công ty đang tuyển",
            sub: "Nhà tuyển dụng đang hoạt động",
            value: stats?.companies_hiring?.count?.toString() ?? "0",
            badge: { text: "Đang tuyển", tone: "neutral" },
          },
          {
            icon: Sparkles,
            label: "Vị trí thực tập",
            sub: "Cơ hội thực tập đang mở",
            value: stats?.internship_jobs?.count?.toLocaleString() ?? "0",
            badge: { text: "Phù hợp SV", tone: "neutral" },
          },
        ].map((card) => {
          // Màu badge bám ngữ nghĩa: tăng=đạt, giảm=cảnh báo, nhãn=trung tính.
          const badgeClass =
            card.badge.tone === "positive"
              ? "bg-emerald-50 text-emerald-700"
              : card.badge.tone === "negative"
                ? "bg-red-50 text-red-700"
                : "bg-slate-100 text-slate-500";
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between mb-4">
                {/* Icon-chip thống nhất 1 tông thương hiệu — màu không mã hoá
                    trạng thái nên không tô khác nhau giữa các thẻ cùng vai trò */}
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <card.icon className="w-5 h-5 text-blue-600" />
                </div>
                <span
                  className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${badgeClass}`}
                >
                  {card.badge.tone === "positive" && (
                    <ArrowUpRight className="w-3 h-3" />
                  )}
                  {card.badge.tone === "negative" && (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {card.badge.text}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-0.5">
                {card.value}
              </p>
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Dòng tin cậy: minh bạch quy mô dữ liệu ── */}
      {stats?.active_jobs?.count ? (
        <p className="-mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <BarChart3 className="h-3.5 w-3.5" />
          Đang phân tích{" "}
          <span className="font-semibold text-slate-500">
            {stats.active_jobs.count.toLocaleString()}
          </span>{" "}
          tin tuyển dụng IT đang mở · dữ liệu thu thập tự động, cập nhật định kỳ
        </p>
      ) : null}

      {/* ── Trend Chart + Industry ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900">
                Xu hướng tin tuyển dụng
              </h3>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
              {{
                "7days": "7 ngày qua",
                "14days": "14 ngày qua",
                "30days": "30 ngày qua",
              }[timePeriod] ?? "Theo bộ lọc"}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={trends.data}
              margin={{ top: 5, right: 10, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="gradPost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRemote" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="total_postings"
                name="Tổng tin tuyển dụng"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#gradPost)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="remote_jobs"
                name="Việc từ xa"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#gradRemote)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3 justify-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-6 h-0.5 bg-blue-500 rounded-full inline-block" />
              Tổng tin
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-6 h-0.5 bg-emerald-500 rounded-full inline-block" />
              Việc từ xa
            </div>
          </div>
        </div>

        {/* Industry Breakdown */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-0.5">
            Phân bổ thị trường
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Phân bổ công việc theo nhóm kỹ năng
          </p>
          {industryTreemapData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <Treemap
                data={industryTreemapData}
                dataKey="count"
                nameKey="name"
                stroke="#fff"
                isAnimationActive={false}
                content={<IndustryTreemapCell />}
              >
                <Tooltip content={<TreemapTooltip />} />
              </Treemap>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-sm text-slate-400">
              Chưa có dữ liệu phân bổ cho bộ lọc này
            </div>
          )}
          <div
            className="mt-2 space-y-1.5 max-h-[100px]"
            style={{ overflow: "scroll" }}
          >
            {industriesData?.map((item, i) => (
              <div
                key={item.category_name || item.industry_name || i}
                className="flex items-center justify-between text-xs gap-2 whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: categoryColor(i),
                    }}
                  />
                  <span className="text-slate-600">
                    {toTitleCase(item.category_name || item.industry_name)}
                  </span>
                </div>
                <span className="font-semibold text-slate-900 shrink-0">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top 5 Hot Jobs This Week ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="font-semibold text-slate-900">
                Top 5 vị trí được tuyển nhiều nhất tuần này
              </h3>
              <p className="text-xs text-slate-500">
                Các vị trí có nhiều tin tuyển dụng nhất trong 7 ngày gần đây
              </p>
            </div>
          </div>
          <Link
            href="/jobs"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {hotJobsData.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">
              Chưa có tin tuyển dụng nào trong 7 ngày gần đây
            </div>
          ) : (
            hotJobsData.map((job, i) => (
              <Link
                key={job.title}
                href={(() => {
                  const params = new URLSearchParams();
                  params.set("search_group", job.title);
                  params.set("listed_within_days", "7");
                  if (jobType) params.set("work_type", jobType);
                  if (region) params.set("location", region);
                  return `/jobs?${params.toString()}`;
                })()}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
              >
                <span
                  className={`text-lg font-black w-7 shrink-0 ${i === 0 ? "text-orange-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-600" : "text-slate-300"}`}
                >
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {toTitleCase(job.title)}
                    </span>
                    {i < 2 && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold">
                        <Flame className="w-2.5 h-2.5" />
                        Nổi bật
                      </span>
                    )}
                    {job.remote_count > 0 && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold">
                        <Globe className="w-2.5 h-2.5" />
                        {job.remote_count} remote
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <Briefcase className="w-3 h-3" />
                      {job.job_count} tin tuyển
                    </span>
                    {job.company_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {job.company_count} công ty
                      </span>
                    )}
                    {job.total_applies > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {formatCompact(job.total_applies)} ứng tuyển
                      </span>
                    )}
                    {job.total_views > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatCompact(job.total_views)} lượt xem
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
              </Link>
            ))
          )}
        </div>
      </div>

      {/* ── Top 10 Skills + Rising Skills ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 10 Skills */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Top 10 Kỹ Năng Được Yêu Cầu
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Số công việc yêu cầu kỹ năng này trên sàn
              </p>
            </div>
            <span className="px-3 py-1 bg-violet-50 text-violet-700 text-xs font-semibold rounded-full">
              Động theo bộ lọc
            </span>
          </div>
          <div className="space-y-2.5">
            {inDemandSkillsData?.map((item, i) => (
              <div key={item.skill_id} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-bold w-4 shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">
                      {item.skill_name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {item.job_count} công việc
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${inDemandSkillsData[0] ? (item.job_count / inDemandSkillsData[0].job_count) * 100 : 0}%`,
                        backgroundColor: BRAND_BAR,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {inDemandSkillsData && inDemandSkillsData.length > 0 && (
            <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
              <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                <b>{inDemandSkillsData[0].skill_name}</b> đang được yêu cầu nhiều
                nhất — ưu tiên thành thạo kỹ năng này để khớp nhiều việc hơn.
              </span>
            </p>
          )}
        </div>

        {/* Kỹ năng tăng trưởng nhanh */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="font-semibold text-slate-900">
                Kỹ năng tăng trưởng nhanh
              </h3>
              <p className="text-xs text-slate-500">
                Kỹ năng có nhu cầu tuyển dụng tăng mạnh nhất theo bộ lọc
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {risingSkillsData && risingSkillsData.length > 0 ? (
              risingSkillsData.map((s) => (
                <div
                  key={s.skill_id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors hover:shadow-sm ${s.growth_percentage >= 50 ? "border-orange-100 bg-orange-50" : "border-slate-100 bg-slate-50"}`}
                >
                  <div className="flex items-center gap-2.5">
                    {s.growth_percentage >= 50 && (
                      <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {s.skill_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {s.job_count_current.toLocaleString()} công việc
                      </p>
                    </div>
                  </div>
                  <span
                    className={`flex items-center gap-0.5 text-sm font-bold ${s.growth_percentage >= 50 ? "text-orange-600" : "text-emerald-600"}`}
                  >
                    <ArrowUpRight className="w-4 h-4" />+{s.growth_percentage}%
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-500">
                Chưa có đủ dữ liệu kỹ năng tăng trưởng cho bộ lọc này.
              </p>
            )}
          </div>
          {risingSkillsData && risingSkillsData.length > 0 && (
            <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700">
              <Flame className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                <b>{risingSkillsData[0].skill_name}</b> đang tăng nhanh nhất (+
                {risingSkillsData[0].growth_percentage}%) — học sớm để đón đầu
                xu hướng.
              </span>
            </p>
          )}
        </div>
      </div>

      {/* ── CTA for non-logged-in ── */}
      {!isLoggedIn && (
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 overflow-hidden text-center">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative">
            <Sparkles className="w-8 h-8 text-yellow-300 mx-auto mb-3" />
            <h3 className="text-white text-xl font-bold mb-2">
              Xem insight cá nhân của bạn
            </h3>
            <p className="text-blue-200 text-sm mb-4 max-w-md mx-auto">
              Đăng nhập và Tải CV để biết chính xác bao nhiêu job phù hợp với
              bạn, kỹ năng nào đang thiếu, và lộ trình phát triển cụ thể.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/auth/register"
                className="px-6 py-2.5 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-lg"
              >
                Đăng ký miễn phí
              </Link>
              <Link
                href="/auth/login"
                className="px-6 py-2.5 bg-blue-500/40 text-white border border-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-500/60 transition-colors"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
