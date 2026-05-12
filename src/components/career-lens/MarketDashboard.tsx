"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  TrendingUp,
  Building2,
  Flame,
  ArrowRight,
  MapPin,
  Clock,
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
import { jobsWithDetails, industries, skills, userProfile } from "@/data/mockData";
import { formatSalary, formatRelativeTime, getMatchedJobs, analyzeSkillGaps } from "@/utils/matching";
import { useOnboarding } from "@/contexts/onboarding/onboarding-context";

// ── Data derivation ────────────────────────────────────────────────
const totalJobs = jobsWithDetails.length;
const totalCompanies = new Set(jobsWithDetails.map((j) => j.company_id)).size;
const jobsWithMin = jobsWithDetails.filter((j) => j.salary?.min_salary);
const jobsWithMax = jobsWithDetails.filter((j) => j.salary?.max_salary);
const avgMinSalary = jobsWithMin.length
  ? Math.round(jobsWithMin.reduce((s, j) => s + (j.salary!.min_salary || 0), 0) / jobsWithMin.length)
  : 0;
const avgMaxSalary = jobsWithMax.length
  ? Math.round(jobsWithMax.reduce((s, j) => s + (j.salary!.max_salary || 0), 0) / jobsWithMax.length)
  : 0;

// Top 10 skills by job posting frequency
const skillFreq = new Map<number, number>();
jobsWithDetails.forEach((job) => {
  job.skills.forEach((sk) => {
    skillFreq.set(sk.skill_id, (skillFreq.get(sk.skill_id) || 0) + 1);
  });
});
const SKILL_COLORS = ["#3b82f6","#8b5cf6","#06b6d4","#10b981","#f59e0b","#6366f1","#ec4899","#14b8a6","#f97316","#84cc16"];
const topSkills = Array.from(skillFreq.entries())
  .map(([id, count], i) => ({
    skill: skills.find((s) => s.skill_id === id)?.skill_name ?? "Unknown",
    jobs: count,
    fill: SKILL_COLORS[i % SKILL_COLORS.length],
  }))
  .sort((a, b) => b.jobs - a.jobs)
  .slice(0, 10);

// Industry distribution
const industryFreq = new Map<number, number>();
jobsWithDetails.forEach((job) => {
  job.industries.forEach((ind) => {
    industryFreq.set(ind.industry_id, (industryFreq.get(ind.industry_id) || 0) + 1);
  });
});
const industryData = Array.from(industryFreq.entries())
  .map(([id, count]) => ({
    name: industries.find((i) => i.industry_id === id)?.industry_name ?? "Other",
    value: Math.round((count / totalJobs) * 100),
    color: SKILL_COLORS[id % SKILL_COLORS.length],
  }))
  .sort((a, b) => b.value - a.value);

// Trend data (mock monthly)
const trendData = [
  { month: "Oct", postings: 1820, remote: 620 },
  { month: "Nov", postings: 2150, remote: 780 },
  { month: "Dec", postings: 1980, remote: 750 },
  { month: "Jan", postings: 2400, remote: 910 },
  { month: "Feb", postings: 2650, remote: 1020 },
  { month: "Mar", postings: 2570, remote: 1100 },
  { month: "Apr", postings: totalJobs + 200, remote: 1180 },
];

// Top 5 hot jobs this week
const hotJobs = jobsWithDetails
  .slice(0, 5)
  .map((j) => ({
    id: j.job_id,
    title: j.title,
    company: j.company.name,
    location: j.location ?? "Remote",
    type: j.work_type ?? "Full-time",
    salary: formatSalary(j.salary?.min_salary, j.salary?.max_salary),
    posted: formatRelativeTime(j.listed_time),
    skills: j.skills.slice(0, 3).map((s) => s.skill_name),
    hot: true,
  }));

// Rising skills
const risingSkills = [
  { name: "AI/LLM Integration", growth: "+142%", jobs: 1240, avgSalaryK: 145, hot: true, color: "orange" },
  { name: "Kubernetes", growth: "+68%", jobs: 980, avgSalaryK: 130, hot: true, color: "blue" },
  { name: "GraphQL", growth: "+54%", jobs: 620, avgSalaryK: 110, hot: false, color: "purple" },
  { name: "TypeScript", growth: "+48%", jobs: 1820, avgSalaryK: 105, hot: false, color: "blue" },
  { name: "Docker", growth: "+45%", jobs: 1450, avgSalaryK: 100, hot: false, color: "cyan" },
  { name: "Rust", growth: "+41%", jobs: 340, avgSalaryK: 138, hot: false, color: "orange" },
];

const regions = ["All Regions", "San Francisco", "New York", "Austin", "Seattle", "Remote"];
const timeFilters = ["Last 7 days", "Last 30 days", "Last 3 months", "Last 6 months"];
const jobTypes = ["All Types", "Full-time", "Remote", "Hybrid", "Part-time", "Contract"];

const typeColors: Record<string, string> = {
  "Full-time": "bg-blue-100 text-blue-700",
  Remote: "bg-emerald-100 text-emerald-700",
  Hybrid: "bg-violet-100 text-violet-700",
  "Part-time": "bg-amber-100 text-amber-700",
  Contract: "bg-orange-100 text-orange-700",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-slate-900 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: <span className="font-medium">{p.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function MarketDashboard({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [region, setRegion] = useState("All Regions");
  const [timePeriod, setTimePeriod] = useState("Last 30 days");
  const [jobType, setJobType] = useState("All Types");
  const { strength } = useOnboarding();

  // Personal insight data (only computed when user is logged in)
  const personalMatched = isLoggedIn ? getMatchedJobs(jobsWithDetails, userProfile) : [];
  const highMatchCount = personalMatched.filter((m) => m.overall_score >= 70).length;
  const personalGaps = isLoggedIn ? analyzeSkillGaps(jobsWithDetails, userProfile) : [];
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
              <span className="text-blue-300 text-xs font-semibold uppercase tracking-widest">Market Intelligence</span>
            </div>
            <h1 className="text-white text-2xl font-bold mb-1">IT Job Market Dashboard</h1>
            <p className="text-slate-300 text-sm max-w-lg">
              Cập nhật thời gian thực về xu hướng tuyển dụng, mức lương và kỹ năng được săn đón nhất. Không cần đăng nhập.
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
              <p className="text-xs text-slate-400 text-center">Đăng nhập để thấy job phù hợp với bạn</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Personal Insight Banner (logged in users only) ── */}
      {isLoggedIn && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-blue-800 dark:text-blue-200 uppercase tracking-wider">Dành cho bạn</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/cv-matching" className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
              <Briefcase className="w-3.5 h-3.5" />
              {highMatchCount} jobs khớp CV của bạn
              <ArrowRight className="w-3 h-3" />
            </Link>
            {missingSkills > 0 && (
              <Link href="/skill-gap" className="flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100 transition-colors dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800">
                <TrendingUp className="w-3.5 h-3.5" />
                Thiếu {missingSkills} skill — bắt đầu với {topMissingSkill}
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            {strength < 50 && (
              <Link href="/onboarding/welcome" className="flex items-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800">
                <BarChart3 className="w-3.5 h-3.5" />
                Hoàn thiện hồ sơ ({strength}%) để xem insight đầy đủ
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Filter className="w-4 h-4" />
          Lọc:
        </div>
        {/* Region */}
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {regions.map((r) => <option key={r}>{r}</option>)}
        </select>
        {/* Time */}
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {timeFilters.map((t) => <option key={t}>{t}</option>)}
        </select>
        {/* Job Type */}
        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {jobTypes.map((t) => <option key={t}>{t}</option>)}
        </select>
        <span className="ml-auto text-xs text-slate-400">Cập nhật: hôm nay 08:00 ICT</span>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Briefcase,
            label: "Active Job Postings",
            sub: "IT roles đang mở tuyển",
            value: totalJobs.toLocaleString(),
            change: "+12.4%",
            color: "from-blue-500 to-blue-600",
            light: "bg-blue-50 text-blue-700",
          },
          {
            icon: TrendingUp,
            label: "Avg. IT Salary",
            sub: `~$${Math.round(avgMinSalary / 1000)}K – $${Math.round(avgMaxSalary / 1000)}K / năm`,
            value: `$${Math.round((avgMinSalary + avgMaxSalary) / 2 / 1000)}K`,
            change: "+8.1%",
            color: "from-emerald-500 to-emerald-600",
            light: "bg-emerald-50 text-emerald-700",
          },
          {
            icon: Building2,
            label: "Companies Hiring",
            sub: "Nhà tuyển dụng đang active",
            value: totalCompanies.toString(),
            change: "+5.3%",
            color: "from-violet-500 to-violet-600",
            light: "bg-violet-50 text-violet-700",
          },
          {
            icon: BarChart3,
            label: "Market Growth",
            sub: "So với cùng kỳ năm ngoái",
            value: "+18.7%",
            change: "YoY",
            color: "from-orange-500 to-orange-600",
            light: "bg-orange-50 text-orange-700",
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.light}`}>
                {card.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-0.5">{card.value}</p>
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
              <h3 className="font-semibold text-slate-900">Job Posting Trends</h3>
              <p className="text-xs text-slate-500 mt-0.5">Total postings vs. remote positions</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
              {timePeriod}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
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
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="postings" name="Total Postings" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradPost)" dot={false} />
              <Area type="monotone" dataKey="remote" name="Remote Jobs" stroke="#10b981" strokeWidth={2.5} fill="url(#gradRemote)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3 justify-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-6 h-0.5 bg-blue-500 rounded-full inline-block" />Total Postings
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-6 h-0.5 bg-emerald-500 rounded-full inline-block" />Remote Jobs
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-0.5">Industry Breakdown</h3>
          <p className="text-xs text-slate-500 mb-3">Phân bổ job theo ngành</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={industryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {industryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {industryData.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate max-w-[140px]">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900 shrink-0">{item.value}%</span>
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
              <h3 className="font-semibold text-slate-900">Top 5 Hot Jobs This Week</h3>
              <p className="text-xs text-slate-500">Được xem và apply nhiều nhất tuần này</p>
            </div>
          </div>
          <Link href="/jobs" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {hotJobs.map((job, i) => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
              <span className={`text-lg font-black w-7 shrink-0 ${i === 0 ? "text-orange-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-600" : "text-slate-300"}`}>
                #{i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{job.title}</span>
                  {i < 2 && <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold"><Flame className="w-2.5 h-2.5" />HOT</span>}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeColors[job.type] ?? "bg-slate-100 text-slate-600"}`}>{job.type}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-1.5">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{job.company}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.posted}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {job.skills.map((sk) => (
                    <span key={sk} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium">{sk}</span>
                  ))}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-slate-900">{job.salary}</p>
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
              <h3 className="font-semibold text-slate-900">Top 10 In-Demand Skills</h3>
              <p className="text-xs text-slate-500 mt-0.5">Số job yêu cầu kỹ năng này</p>
            </div>
            <span className="px-3 py-1 bg-violet-50 text-violet-700 text-xs font-semibold rounded-full">
              {region}
            </span>
          </div>
          <div className="space-y-2.5">
            {topSkills.map((item, i) => (
              <div key={item.skill} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-bold w-4 shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">{item.skill}</span>
                    <span className="text-xs text-slate-500">{item.jobs} jobs</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(item.jobs / topSkills[0].jobs) * 100}%`, backgroundColor: item.fill }}
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
              <p className="text-xs text-slate-500">Tốc độ tăng trưởng so với 6 tháng trước</p>
            </div>
          </div>
          <div className="space-y-3">
            {risingSkills.map((s) => (
              <div key={s.name} className={`flex items-center justify-between p-3 rounded-xl border transition-colors hover:shadow-sm ${s.hot ? "border-orange-100 bg-orange-50" : "border-slate-100 bg-slate-50"}`}>
                <div className="flex items-center gap-2.5">
                  {s.hot && <Flame className="w-4 h-4 text-orange-500 shrink-0" />}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.jobs.toLocaleString()} jobs · ~${s.avgSalaryK}K/yr</p>
                  </div>
                </div>
                <span className={`flex items-center gap-0.5 text-sm font-bold ${s.hot ? "text-orange-600" : "text-emerald-600"}`}>
                  <ArrowUpRight className="w-4 h-4" />{s.growth}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Salary by Role (bar chart) ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-slate-900">Salary Ranges by Role</h3>
            <p className="text-xs text-slate-500 mt-0.5">USD/năm · Mid-level · {region}</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={[
              { role: "Frontend Dev", min: 85, max: 130 },
              { role: "Full Stack", min: 95, max: 145 },
              { role: "Backend Dev", min: 90, max: 140 },
              { role: "DevOps", min: 100, max: 155 },
              { role: "Data Engineer", min: 105, max: 150 },
              { role: "ML Engineer", min: 115, max: 175 },
            ]}
            margin={{ top: 5, right: 20, bottom: 5, left: -10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="role" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="K" />
            <Tooltip formatter={(v: any) => [`$${v}K`, ""]} />
            <Bar dataKey="min" name="Min Salary" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
            <Bar dataKey="max" name="Max Salary" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-5 justify-center mt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 rounded bg-blue-200 inline-block" />Min Salary
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" />Max Salary
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
            <h3 className="text-white text-xl font-bold mb-2">Xem insight cá nhân của bạn</h3>
            <p className="text-blue-200 text-sm mb-4 max-w-md mx-auto">
              Đăng nhập và upload CV để biết chính xác bao nhiêu job phù hợp với bạn, kỹ năng nào đang thiếu, và lộ trình phát triển cụ thể.
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
