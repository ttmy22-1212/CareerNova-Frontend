"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target,
  TrendingUp,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";

// ── IMPORT API & TYPES THỰC TẾ ──────────────────────────────────
import SkillGapApi from "@/api/skill-gap";
import JobApi from "@/api/job";
import {
  SkillGapStatisticsDto,
  CategoryGapDto,
  RadarSkillPointDto,
  CategoryBreakdownDto,
} from "@/types/skill-gap";

const statusConfig: Record<
  string,
  { label: string; barColor: string; badgeBg: string; badgeText: string }
> = {
  Proficient: {
    label: "Proficient",
    barColor: "bg-emerald-500",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
  },
  Missing: {
    label: "Needs Work",
    barColor: "bg-amber-400",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
  },
};

const priorityConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  critical: { label: "Critical", color: "text-red-700", bg: "bg-red-100" },
  high: {
    label: "High Priority",
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  medium: { label: "Medium", color: "text-amber-700", bg: "bg-amber-100" },
  low: { label: "Low", color: "text-blue-700", bg: "bg-blue-100" },
};

const learningPaths = [
  {
    id: 1,
    skill: "AWS Cloud Fundamentals",
    category: "DevOps & Cloud",
    priority: "critical",
    estimatedTime: "3–4 months",
    impact: "+32% job matches",
    jobsRequiring: "78%",
    resources: [
      {
        name: "AWS Certified Developer – Associate",
        type: "Certification",
        duration: "3 mo",
        cost: "$150",
      },
      {
        name: "A Cloud Guru — AWS Path",
        type: "Course",
        duration: "6 weeks",
        cost: "$49/mo",
      },
      {
        name: "AWS Free Tier Projects",
        type: "Practice",
        duration: "Ongoing",
        cost: "Free",
      },
    ],
    steps: [
      "Create AWS Free Tier account",
      "Complete IAM & EC2 module",
      "Deploy a Node.js app to Elastic Beanstalk",
      "Pass AWS Cloud Practitioner exam",
    ],
    started: false,
  },
  {
    id: 2,
    skill: "Advanced Node.js & APIs",
    category: "Backend Development",
    priority: "high",
    estimatedTime: "2–3 months",
    impact: "+25% job matches",
    jobsRequiring: "65%",
    resources: [
      {
        name: "Node.js Design Patterns",
        type: "Book",
        duration: "4 weeks",
        cost: "$35",
      },
      {
        name: "Build REST APIs with Express",
        type: "Course",
        duration: "2 weeks",
        cost: "Free",
      },
      {
        name: "Build a microservices project",
        type: "Project",
        duration: "4 weeks",
        cost: "Free",
      },
    ],
    steps: [
      "Learn Express.js middleware chain",
      "Implement JWT authentication",
      "Design a RESTful API",
      "Add rate-limiting and caching",
    ],
    started: true,
  },
  {
    id: 3,
    skill: "Docker & Containerization",
    category: "DevOps & Cloud",
    priority: "medium",
    estimatedTime: "2 months",
    impact: "+18% job matches",
    jobsRequiring: "55%",
    resources: [
      {
        name: "Docker Deep Dive (Nigel Poulton)",
        type: "Book",
        duration: "2 weeks",
        cost: "$25",
      },
      {
        name: "Play with Docker Labs",
        type: "Practice",
        duration: "Ongoing",
        cost: "Free",
      },
    ],
    steps: [
      "Understand containers vs VMs",
      "Write your first Dockerfile",
      "Use Docker Compose for multi-service apps",
      "Push images to Docker Hub",
    ],
    started: false,
  },
  {
    id: 4,
    skill: "GraphQL API Development",
    category: "Backend Development",
    priority: "medium",
    estimatedTime: "1–2 months",
    impact: "+14% job matches",
    jobsRequiring: "42%",
    resources: [
      {
        name: "GraphQL — The Full Course",
        type: "Course",
        duration: "3 weeks",
        cost: "$29",
      },
      {
        name: "Build a GraphQL API with Apollo",
        type: "Project",
        duration: "2 weeks",
        cost: "Free",
      },
    ],
    steps: [
      "Learn GraphQL schema definition",
      "Set up Apollo Server",
      "Write queries, mutations, and subscriptions",
      "Integrate with a React frontend",
    ],
    started: false,
  },
];

export function SkillGapAnalysis() {
  const [expandedPath, setExpandedPath] = useState<number | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // States quản lý dữ liệu động từ API
  const [statistics, setStatistics] = useState<SkillGapStatisticsDto | null>(
    null,
  );
  const [categoryGaps, setCategoryGaps] = useState<CategoryGapDto[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [radarSkills, setRadarSkills] = useState<RadarSkillPointDto[]>([]);
  const [skillsBreakdown, setSkillsBreakdown] = useState<
    CategoryBreakdownDto[]
  >([]);

  // 1. Tải toàn bộ cấu trúc dữ liệu ban đầu khi mount trang
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [statsRes, gapsRes, categoriesRes, breakdownRes] =
          await Promise.all([
            SkillGapApi.getStatistics(),
            SkillGapApi.getCategoryGaps(),
            JobApi.getCategories(),
            SkillGapApi.getSkillsBreakdown(),
          ]);

        if (statsRes.data) setStatistics(statsRes.data);
        if (gapsRes.data) setCategoryGaps(gapsRes.data);
        if (breakdownRes.data) {
          setSkillsBreakdown(breakdownRes.data);
          // Mặc định expand danh mục đầu tiên trong bảng breakdown nếu có dữ liệu
          if (breakdownRes.data.length > 0) {
            setExpandedCat(breakdownRes.data[0].category_name);
          }
        }
        if (categoriesRes && categoriesRes.length > 0) {
          setCategories(categoriesRes);
          setSelectedCategoryId(categoriesRes[0]);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu Skill Gap:", err);
      }
    };

    fetchInitialData();
  }, []);

  // 2. Tải dữ liệu biểu đồ Radar mỗi khi thay đổi ô Combo Box chọn ngành nghề
  useEffect(() => {
    if (!selectedCategoryId) return;
    const fetchRadarData = async () => {
      try {
        const res = await SkillGapApi.getSkillsRadar({
          category: selectedCategoryId,
        });
        if (res.data) setRadarSkills(res.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu Radar chi tiết:", err);
      }
    };

    fetchRadarData();
  }, [selectedCategoryId]);

  // Map dữ liệu Radar cho Recharts
  const categoryRadarData = radarSkills.map((s) => ({
    subject: s.skill_name,
    you: s.user_score,
    market: s.market_score,
  }));

  // Định dạng lại dữ liệu cho biểu đồ thanh ngang khoảng cách danh mục (Gap Bar Chart)
  // Đảm bảo lấy giá trị trị tuyệt đối (Math.abs) vì gap_score từ BE có thể mang dấu âm (-) biểu thị sự thiếu hụt
  const chartData = categoryGaps.map((c) => {
    let barColor = "#10b981"; // emerald
    const absGap = Math.abs(c.gap_score);
    if (absGap > 25)
      barColor = "#ef4444"; // red
    else if (absGap > 15)
      barColor = "#f59e0b"; // amber
    else if (absGap > 5) barColor = "#3b82f6"; // blue

    return {
      name: c.category.replace(" Development", "").replace(" & Data", ""),
      gap: absGap,
      color: barColor,
    };
  });

  return (
    <div className="p-6 space-y-5">
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        {[
          {
            icon: Target,
            label: "Avg. Market Alignment",
            value: `${statistics?.match_score ?? 0}%`,
            sub: "Across all categories",
            iconBg: "from-blue-500 to-blue-600",
            change: "Alignment",
            changeColor: "text-blue-500",
          },
          {
            icon: Zap,
            label: "Critical Gaps",
            value: `${statistics?.core_gaps_count ?? 0}`,
            sub: "Skills needing urgent focus",
            iconBg: "from-red-500 to-orange-500",
            change: "Core",
            changeColor: "text-red-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-100 shadow-sm p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 bg-gradient-to-br ${stat.iconBg} rounded-xl flex items-center justify-center shadow-sm`}
              >
                <stat.icon className="w-5 h-5 text-white" />
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
            <h3 className="font-bold text-slate-900">Skills Detail</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Select a category to see detailed skill breakdown
          </p>

          {/* Combo Box */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full mb-4 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                🛠️ {cat}
              </option>
            ))}
          </select>

          {/* Category Radar */}
          {categoryRadarData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart
                  data={categoryRadarData}
                  margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
                >
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                  />
                  <PolarRadiusAxis
                    tick={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Radar
                    name="You"
                    dataKey="you"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.35}
                  />
                  <Radar
                    name="Market"
                    dataKey="market"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.15}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex gap-5 justify-center mt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-4 h-0.5 bg-blue-500 inline-block rounded-full" />
                  You
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-4 h-0.5 bg-emerald-500 inline-block rounded-full" />
                  Market
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm text-slate-400">
              No data for this category
            </div>
          )}
        </div>

        {/* Gap Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-0.5">Gap by Category</h3>
          <p className="text-xs text-slate-500 mb-4">
            Points behind market average
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
                  domain={[0, "dataMax + 10"]}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip formatter={(v: any) => [`${v} pts gap`, "Gap"]} />
                <Bar
                  dataKey="gap"
                  radius={[0, 6, 6, 0]}
                  label={{
                    position: "right",
                    fontSize: 11,
                    fill: "#64748b",
                    formatter: (v: any) => `${v}pts`,
                  }}
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm text-slate-400">
              No gap data found
            </div>
          )}
        </div>
      </div>

      {/* ── Detailed Breakdown ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Detailed Skill Breakdown</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Expand each category to review individual skills
          </p>
        </div>
        <div className="divide-y divide-slate-50">
          {skillsBreakdown.map((cat) => {
            const isExpanded = expandedCat === cat.category_name;
            const absGap = Math.abs(cat.user_rate_avg - cat.market_rate_avg);
            const gapColor =
              absGap <= 10
                ? "bg-emerald-100 text-emerald-700"
                : absGap <= 20
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700";
            const barFillColor =
              absGap <= 10 ? "#10b981" : absGap <= 20 ? "#f59e0b" : "#ef4444";

            return (
              <div key={cat.category_name}>
                <button
                  onClick={() =>
                    setExpandedCat(isExpanded ? null : cat.category_name)
                  }
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <span className="text-xl">🛠️</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="font-semibold text-slate-900 text-sm">
                        {cat.category_name}
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
                            width: `${cat.user_rate_avg}%`,
                            backgroundColor: barFillColor,
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">
                        You:{" "}
                        <span className="font-semibold text-slate-700">
                          {cat.user_rate_avg}%
                        </span>
                        {" · "}Market:{" "}
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
                                style={{ width: `${skill.user_rate}%` }}
                              />
                              {/* Target marker */}
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-slate-400 rounded-full"
                                style={{ left: `${skill.market_rate}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] text-slate-400">
                                Your level
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Target: {skill.market_rate}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Learning Paths ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              Recommended Learning Paths
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Prioritized to maximize your job match score
            </p>
          </div>
          <Link
            href="/recommendations"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {learningPaths.map((path) => {
            const isExpanded = expandedPath === path.id;
            const pc = priorityConfig[path.priority];
            return (
              <div key={path.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-900 text-sm">
                        {path.skill}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pc.bg} ${pc.color}`}
                      >
                        {pc.label}
                      </span>
                      {path.started && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      {path.category}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3 h-3" />
                        {path.estimatedTime}
                      </span>
                      <span className="text-emerald-600 font-semibold">
                        {path.impact}
                      </span>
                      <span className="text-slate-500">
                        Required by {path.jobsRequiring} of target jobs
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() =>
                        setExpandedPath(isExpanded ? null : path.id)
                      }
                      className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-1"
                    >
                      {isExpanded ? "Less" : "Details"}
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        path.started
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      {path.started ? "Continue" : "Start"}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Resources */}
                    <div>
                      <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                        Resources
                      </p>
                      <div className="space-y-2">
                        {path.resources.map((r, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg"
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-900">
                                {r.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {r.type} · {r.duration}
                              </p>
                            </div>
                            <span className="text-xs font-semibold text-blue-700 shrink-0 ml-2">
                              {r.cost}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Steps */}
                    <div>
                      <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                        Learning Steps
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
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
