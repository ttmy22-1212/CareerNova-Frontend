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
  Filter,
  Sparkles,
  Globe,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import MarketDashboardApi from "@/api/market-dashboard";
import {
  FilterOptionDto,
  StatsCardData,
  TrendDataPointDto,
  IndustryItemDto,
  HotJobItemDto,
  SalaryRangeItemDto,
  InDemandSkillItemDto,
  RisingSkillItemDto,
} from "@/types/market-dashboard";

import { userProfile } from "@/data/mockData";
import { getMatchedJobs, analyzeSkillGaps } from "@/utils/matching";
import { useOnboarding } from "@/contexts/onboarding/onboarding-context";

const SKILL_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
];

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

export function MarketDashboard({
  isLoggedIn = false,
}: {
  isLoggedIn?: boolean;
}) {
  // ── States quản lý giá trị bộ lọc hiện tại ────────────────────────
  const [region, setRegion] = useState("");
  const [timePeriod, setTimePeriod] = useState("30days");
  const [jobType, setJobType] = useState("");

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
  }>({ scale: "day", data: [] });
  const [industriesData, setIndustriesData] = useState<IndustryItemDto[]>([]);
  const [hotJobsData, setHotJobsData] = useState<HotJobItemDto[]>([]);
  const [salaryRangesData, setSalaryRangesData] = useState<
    SalaryRangeItemDto[]
  >([]);
  const [inDemandSkillsData, setInDemandSkillsData] = useState<
    InDemandSkillItemDto[]
  >([]);
  const [risingSkillsData, setRisingSkillsData] = useState<
    RisingSkillItemDto[]
  >([]);
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
      const payload: any = {
        time_range: timePeriod,
      };

      if (region && region !== "All Regions") {
        payload.location = region;
      }

      if (jobType && jobType !== "All Types") {
        payload.work_type = jobType;
      }

      try {
        const [
          resStats,
          resTrends,
          resIndustries,
          resHotJobs,
          resSalary,
          resInDemand,
          resRising,
        ] = await Promise.all([
          MarketDashboardApi.getStats(payload),
          MarketDashboardApi.getTrends(payload),
          MarketDashboardApi.getIndustryBreakdown(payload),
          MarketDashboardApi.getHotJobs(payload),
          MarketDashboardApi.getSalaryRanges(payload),
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
        if (resSalary?.data) {
          const salaryRanges = (resSalary.data as any).data || resSalary.data;
          setSalaryRangesData(salaryRanges);
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

  // Kiểu dữ liệu Insight cá nhân (Dành cho user đã đăng nhập)
  const personalMatched = isLoggedIn ? getMatchedJobs([], userProfile) : [];
  const highMatchCount = personalMatched.filter(
    (m) => m.overall_score >= 70,
  ).length;
  const personalGaps = isLoggedIn ? analyzeSkillGaps([], userProfile) : [];
  const missingSkills = personalGaps.filter((g) => !g.user_has).length;
  const topMissingSkill = personalGaps.find((g) => !g.user_has)?.skill_name;

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
              IT Job Thông tin Thị trường
            </h1>
            <p className="text-slate-300 text-sm max-w-lg">
              Cập nhật thời gian thực về xu hướng tuyển dụng, mức lương và kỹ
              năng được săn đón nhất. Không cần đăng nhập.
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
                Thiếu {missingSkills} kỹ năng — bắt đầu với {topMissingSkill}
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            {strength < 50 && (
              <Link
                href="/onboarding/welcome"
                className="flex items-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Hoàn thiện hồ sơ ({strength}%) để xem insight đầy đủ
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Tầng giao diện Bộ lọc Filters động từ DB ── */}
      <div className="flex flex-wrap items-center gap-3">
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
          onChange={(e) => setTimePeriod(e.target.value)}
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
          onChange={(e) => setJobType(e.target.value)}
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
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Briefcase,
            label: "Active Job Postings",
            sub: "IT roles đang mở tuyển",
            value: stats?.active_jobs?.count?.toLocaleString() ?? "0",
            change:
              stats?.active_jobs?.growth_percentage !== undefined
                ? `${stats.active_jobs.growth_percentage >= 0 ? "+" : ""}${stats.active_jobs.growth_percentage}%`
                : "--",
            color: "from-blue-500 to-blue-600",
            light: "bg-blue-50 text-blue-700",
          },
          {
            icon: TrendingUp,
            label: "Avg. IT Salary",
            sub: `~$${Math.round((stats?.avg_it_salary?.min ?? 0) / 1000)}K – $${Math.round((stats?.avg_it_salary?.max ?? 0) / 1000)}K / năm`,
            value: `$${Math.round((stats?.avg_it_salary?.average ?? 0) / 1000)}K`,
            change: "USD",
            color: "from-emerald-500 to-emerald-600",
            light: "bg-emerald-50 text-emerald-700",
          },
          {
            icon: Building2,
            label: "Companies Hiring",
            sub: "Nhà tuyển dụng đang active",
            value: stats?.companies_hiring?.count?.toString() ?? "0",
            change: "Active",
            color: "from-violet-500 to-violet-600",
            light: "bg-violet-50 text-violet-700",
          },
          {
            icon: BarChart3,
            label: "Market Growth",
            sub: "So với cùng kỳ năm ngoái",
            value:
              stats?.market_growth?.yoy_percentage !== undefined
                ? `${stats.market_growth.yoy_percentage >= 0 ? "+" : ""}${stats.market_growth.yoy_percentage}%`
                : "--",
            change: "YoY",
            color: "from-orange-500 to-orange-600",
            light: "bg-orange-50 text-orange-700",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-100 shadow-sm p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}
              >
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.light}`}
              >
                {card.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-0.5">
              {card.value}
            </p>
            <p className="text-xs font-medium text-slate-500">{card.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Trend Chart + Industry ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900">
                Xu hướng tin tuyển dụng
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổng tin tuyển dụng vs. vị trí remote
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full uppercase">
              Quy mô: {trends.scale}
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
                name="Total Postings"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#gradPost)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="remote_jobs"
                name="Remote Jobs"
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
              Việc remote
            </div>
          </div>
        </div>

        {/* Industry Breakdown */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-0.5">
            Phân bổ thị trường
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Phân bổ công việc theo ngành nghề
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={industriesData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="count"
              >
                {industriesData?.map((entry, i) => (
                  <Cell key={i} fill={SKILL_COLORS[i % SKILL_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v} Jobs`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5 overflow-y-auto max-h-[100px]">
            {industriesData?.map((item, i) => (
              <div
                key={item.industry_name}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: SKILL_COLORS[i % SKILL_COLORS.length],
                    }}
                  />
                  <span className="text-slate-600 truncate max-w-[140px]">
                    {item.industry_name}
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
                Top 5 Công Việc Hot Tuần Này
              </h3>
              <p className="text-xs text-slate-500">
                Được xem và apply nhiều nhất tuần này
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
          {hotJobsData?.map((job, i) => (
            <Link
              key={job.job_category}
              href={`/jobs?category=${encodeURIComponent(job.job_category)}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
            >
              <span
                className={`text-lg font-black w-7 shrink-0 ${i === 0 ? "text-orange-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-600" : "text-slate-300"}`}
              >
                #{i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {job.job_category}
                  </span>
                  {i < 2 && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold">
                      <Flame className="w-2.5 h-2.5" />
                      HOT
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    Tổng nhu cầu: {job.job_count} bài đăng tuyển dụng trong kỳ
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-slate-900">
                  ${Math.round(job.avg_salary / 1000)}K/yr
                </p>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors ml-auto mt-1" />
              </div>
            </Link>
          ))}
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
                        backgroundColor: SKILL_COLORS[i % SKILL_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rising Skills */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="font-semibold text-slate-900">Rising Skills</h3>
              <p className="text-xs text-slate-500">
                Kỹ năng đột phá có tốc độ tăng trưởng cao nhất
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {risingSkillsData?.map((s) => (
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
                      {s.job_count_current.toLocaleString()} công việc · ~$
                      {Math.round(s.avg_salary / 1000)}K/yr
                    </p>
                  </div>
                </div>
                <span
                  className={`flex items-center gap-0.5 text-sm font-bold ${s.growth_percentage >= 50 ? "text-orange-600" : "text-emerald-600"}`}
                >
                  <ArrowUpRight className="w-4 h-4" />+{s.growth_percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Salary by Role (⚠️ Đã xóa nhãn phụ Mid-level theo đặc tả mới của BA) ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-slate-900">
              Mức Lương theo Vị Trí
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống phân bố lương (USD/năm) gộp All Levels
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={salaryRangesData}
            margin={{ top: 5, right: 20, bottom: 5, left: -10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="role"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              unit="K"
            />
            <Tooltip
              formatter={(v: any) => [`$${Math.round(v / 1000)}K`, ""]}
            />
            <Bar
              dataKey="min_salary"
              name="Mức Lương Tối Thiểu"
              fill="#bfdbfe"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="max_salary"
              name="Mức Lương Tối Đa"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-5 justify-center mt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 rounded bg-blue-200 inline-block" />
            Mức Lương Tối Thiểu
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
            Mức Lương Tối Đa
          </div>
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
