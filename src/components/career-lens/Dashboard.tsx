"use client";
import Link from "next/link";
import {
  Briefcase,
  TrendingUp,
  Building2,
  Target,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Clock,
  Flame,
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
  Legend,
} from "recharts";
import { jobsWithDetails, industries, skills, companies, userProfile } from "@/data/mockData";
import { getMatchedJobs, formatSalary, formatRelativeTime } from "@/utils/matching";
import { useOnboarding, type CareerInterest } from "@/contexts/onboarding/onboarding-context";
import {
  Tooltip as ShadTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, FileText } from "lucide-react";

// Calculate real statistics from data
const matchedJobs = getMatchedJobs(jobsWithDetails, userProfile);
const totalJobs = jobsWithDetails.length;
const totalCompanies = new Set(jobsWithDetails.map(j => j.company_id)).size;
const jobsWithMin = jobsWithDetails.filter(j => j.salary?.min_salary);
const jobsWithMax = jobsWithDetails.filter(j => j.salary?.max_salary);
const avgMinSalary = jobsWithMin.length
  ? Math.round(jobsWithMin.reduce((sum, j) => sum + (j.salary!.min_salary || 0), 0) / jobsWithMin.length)
  : 0;
const avgMaxSalary = jobsWithMax.length
  ? Math.round(jobsWithMax.reduce((sum, j) => sum + (j.salary!.max_salary || 0), 0) / jobsWithMax.length)
  : 0;
const avgMatchScore = Math.round(
  matchedJobs.reduce((sum, m) => sum + m.overall_score, 0) / matchedJobs.length
);

// Count skill frequency from real job data
const skillFreq = new Map<number, number>();
jobsWithDetails.forEach(job => {
  job.skills.forEach(skill => {
    skillFreq.set(skill.skill_id, (skillFreq.get(skill.skill_id) || 0) + 1);
  });
});

const topSkills = Array.from(skillFreq.entries())
  .map(([skillId, count]) => ({
    skill: skills.find(s => s.skill_id === skillId)?.skill_name || "Unknown",
    jobs: count,
    fill: ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#6366f1", "#ec4899"][skillId % 7],
  }))
  .sort((a, b) => b.jobs - a.jobs)
  .slice(0, 7);

// Count industry distribution from real job data
const industryFreq = new Map<number, number>();
jobsWithDetails.forEach(job => {
  job.industries.forEach(ind => {
    industryFreq.set(ind.industry_id, (industryFreq.get(ind.industry_id) || 0) + 1);
  });
});

const industryData = Array.from(industryFreq.entries())
  .map(([indId, count]) => ({
    name: industries.find(i => i.industry_id === indId)?.industry_name || "Other",
    value: Math.round((count / totalJobs) * 100),
    color: ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#6366f1"][indId % 7],
  }))
  .sort((a, b) => b.value - a.value);

const stats = [
  {
    label: "Active Job Postings",
    sublabel: "Tổng job IT đang tuyển",
    value: totalJobs.toLocaleString(),
    change: "+12.4%",
    info: "Tổng số job IT đang mở (tất cả level, location & remote/onsite). Cập nhật từ database job_postings.",
    icon: Briefcase,
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    textColor: "text-blue-600",
    positive: true,
  },
  {
    label: "Avg. IT Salary (USD/year)",
    sublabel: "Mid-level, US-based · ~"
      + (Math.round(((avgMinSalary + avgMaxSalary) / 2) * 25000 / 12 / 1_000_000))
      + "tr VND/tháng",
    value: `$${Math.round(avgMinSalary / 1000)}K – $${Math.round(avgMaxSalary / 1000)}K`,
    change: "+8.1%",
    info: "Khoảng lương trung bình (USD/năm) trên các job có khai báo salary. Tỷ giá tham khảo 25 000 VND/USD.",
    icon: TrendingUp,
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    textColor: "text-emerald-600",
    positive: true,
  },
  {
    label: "Companies Hiring",
    sublabel: "Số nhà tuyển dụng đang mở job",
    value: totalCompanies.toString(),
    change: "+5.3%",
    info: "Số lượng công ty unique đang đăng tin trong tháng.",
    icon: Building2,
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
    textColor: "text-violet-600",
    positive: true,
  },
  {
    label: "Your Match Score",
    sublabel: "Trung bình match top jobs",
    value: `${avgMatchScore}%`,
    change: "+3.2%",
    icon: Target,
    color: "from-orange-500 to-orange-600",
    bg: "bg-orange-50",
    textColor: "text-orange-600",
    positive: true,
    info: "Tỷ lệ phù hợp trung bình giữa skill profile của bạn và yêu cầu của top jobs.",
  },
];

const trendData = [
  { month: "Oct", postings: 1820, hired: 720 },
  { month: "Nov", postings: 2150, hired: 840 },
  { month: "Dec", postings: 1980, hired: 790 },
  { month: "Jan", postings: 2400, hired: 950 },
  { month: "Feb", postings: 2650, hired: 1020 },
  { month: "Mar", postings: 2570, hired: 1100 },
  { month: "Apr", postings: totalJobs, hired: 1180 },
];

const recentJobs = matchedJobs.slice(0, 4).map(m => ({
  id: m.job.job_id,
  title: m.job.title,
  company: m.job.company.name,
  location: m.job.location || "Remote",
  type: m.job.work_type || "Full-time",
  salary: formatSalary(m.job.salary?.min_salary, m.job.salary?.max_salary),
  posted: formatRelativeTime(m.job.listed_time),
  match: m.overall_score,
}));

const trendingSkills = [
  { name: "AI/LLM Integration", growth: "+142%", hot: true, jobs: 1240, avgSalaryK: 145 },
  { name: "Kubernetes", growth: "+68%", hot: true, jobs: 980, avgSalaryK: 130 },
  { name: "GraphQL", growth: "+54%", hot: false, jobs: 620, avgSalaryK: 110 },
  { name: "TypeScript", growth: "+48%", hot: false, jobs: 1820, avgSalaryK: 105 },
  { name: "Docker", growth: "+45%", hot: false, jobs: 1450, avgSalaryK: 100 },
];

const typeColors: Record<string, string> = {
  "Full-time": "bg-blue-100 text-blue-700",
  Remote: "bg-emerald-100 text-emerald-700",
  Hybrid: "bg-violet-100 text-violet-700",
  "Part-time": "bg-amber-100 text-amber-700",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
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

export function Dashboard() {
  const { profile, isOnboarded } = useOnboarding();
  const personalMatchedCount = matchedJobs.filter(m => m.overall_score >= 70).length;
  const greetingName = profile.major
    ? `${profile.major}${profile.year ? ` năm ${profile.year}` : ""}`
    : "Bạn";

  // Peer comparison (mock — would come from API)
  const peerPercentile = Math.min(95, 40 + profile.topSkills.length * 5 + (profile.hasUploadedCV ? 15 : 0));
  const peerSampleSize = 1247;
  const peerFocus: { id: CareerInterest; label: string; pct: number }[] = [
    { id: "frontend", label: "Web / Frontend", pct: 32 },
    { id: "ai_ml", label: "AI / Machine Learning", pct: 25 },
    { id: "mobile", label: "Mobile Development", pct: 18 },
    { id: "backend", label: "Backend / Cloud", pct: 14 },
    { id: "data", label: "Data Engineering", pct: 8 },
    { id: "cybersecurity", label: "Security", pct: 3 },
  ];

  // Suggest next skill to learn (highest-trending skill user doesn't have)
  const userSkillNames = new Set(profile.topSkills.map((s) => s.name.toLowerCase()));
  const trendingPool = [
    { name: "Docker", weeks: 3 },
    { name: "Kubernetes", weeks: 6 },
    { name: "AWS", weeks: 8 },
    { name: "TypeScript", weeks: 4 },
    { name: "Next.js", weeks: 3 },
    { name: "PostgreSQL", weeks: 4 },
  ];
  const nextSkillToLearn =
    trendingPool.find((s) => !userSkillNames.has(s.name.toLowerCase())) ?? trendingPool[0];

  return (
    <TooltipProvider delayDuration={200}>
    <div className="p-6 space-y-6">
      {/* ── Welcome Banner ── */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-64 h-64 bg-white rounded-full" />
          <div className="absolute -bottom-12 right-32 w-40 h-40 bg-white rounded-full" />
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">
              {isOnboarded ? "Chào mừng quay lại 👋" : "Xin chào 👋"}
            </p>
            <h2 className="text-white text-xl font-bold mb-2">
              {isOnboarded ? `Hôm nay có gì mới, ${greetingName}?` : "Hoàn tất hồ sơ để gợi ý cá nhân"}
            </h2>
            <p className="text-blue-200 text-sm max-w-md">
              {isOnboarded ? (
                <>
                  Có <span className="text-white font-semibold">{personalMatchedCount} jobs</span>{" "}
                  phù hợp với bạn (match ≥ 70%) trong tổng {totalJobs} job đang mở.
                  {profile.suggestedPaths.length > 0 && (
                    <>
                      {" "}Định hướng đề xuất:{" "}
                      <span className="text-white font-semibold">
                        {profile.suggestedPaths.slice(0, 3).join(", ")}
                      </span>
                      .
                    </>
                  )}
                </>
              ) : (
                <>
                  Thị trường đang có <span className="text-white font-semibold">{totalJobs} jobs</span>{" "}
                  IT đang tuyển. Hoàn thành onboarding (5 phút) để xem chính xác có bao nhiêu job phù hợp với bạn.
                </>
              )}
            </p>
          </div>
          <div className="hidden lg:flex gap-3">
            {!isOnboarded ? (
              <Link
                href="/onboarding/welcome"
                className="px-5 py-2.5 bg-white text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors shadow"
              >
                Bắt đầu onboarding →
              </Link>
            ) : !profile.hasUploadedCV ? (
              <Link
                href="/cv-matching"
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors shadow"
              >
                <FileText className="w-4 h-4" />
                Upload CV (PDF/DOCX) — phân tích trong 30s
              </Link>
            ) : (
              <Link
                href="/cv-matching"
                className="px-5 py-2.5 bg-white text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors shadow"
              >
                Phân tích CV ({profile.cvFileName?.slice(0, 18) ?? "CV của bạn"})
              </Link>
            )}
            <Link
              href="/jobs"
              className="px-5 py-2.5 bg-blue-500/40 text-white border border-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-500/60 transition-colors"
            >
              Xem jobs
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat Cards (6:3:1 color rule — only Match Score uses brand color) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const isPrimary = stat.label === "Your Match Score";
          return (
          <div
            key={stat.label}
            className={`rounded-xl p-5 border transition-shadow ${
              isPrimary
                ? "bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/40"
                : "bg-white border-slate-100 shadow-sm hover:shadow-md dark:bg-slate-900 dark:border-slate-800"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isPrimary
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-semibold ${
                  isPrimary
                    ? "text-emerald-200"
                    : stat.positive
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                {stat.change}
              </span>
            </div>
            <p
              className={`text-xl lg:text-2xl font-bold mb-0.5 leading-tight ${
                isPrimary ? "text-white" : "text-slate-900 dark:text-slate-100"
              }`}
            >
              {stat.value}
            </p>
            <div className="flex items-center gap-1">
              <p
                className={`text-xs ${
                  isPrimary ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {stat.label}
              </p>
              {stat.info && (
                <ShadTooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={
                        isPrimary
                          ? "text-blue-200 hover:text-white"
                          : "text-slate-300 hover:text-slate-500"
                      }
                      aria-label="Giải thích"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[260px] text-xs leading-relaxed">
                    {stat.info}
                  </TooltipContent>
                </ShadTooltip>
              )}
            </div>
            {stat.sublabel && (
              <p
                className={`mt-1 text-xs ${
                  isPrimary ? "text-blue-200/90" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {stat.sublabel}
              </p>
            )}
            {isPrimary && (
              <div className="mt-3 space-y-1.5 border-t border-white/15 pt-3">
                <p className="text-xs text-emerald-200">
                  ↑ Cao hơn <span className="font-bold text-white">{peerPercentile}%</span>{" "}
                  sinh viên cùng năm
                </p>
                <p className="text-xs text-blue-100">
                  💡 Học <span className="font-bold text-white">{nextSkillToLearn.name}</span>{" "}
                  (~{nextSkillToLearn.weeks} tuần) → tăng lên ~{Math.min(99, parseInt(stat.value) + 7)}%
                </p>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Job Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900">Job Posting Trends</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly postings vs. hires</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">Last 7 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="colorPostings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="postings" name="Postings" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorPostings)" dot={false} />
              <Area type="monotone" dataKey="hired" name="Hired" stroke="#10b981" strokeWidth={2.5} fill="url(#colorHired)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3 justify-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-6 h-0.5 bg-blue-500 rounded-full inline-block" />
              Postings
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-6 h-0.5 bg-emerald-500 rounded-full inline-block" />
              Hired
            </div>
          </div>
        </div>

        {/* Industry Pie */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">Industry Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Where IT jobs are</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={industryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {industryData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {industryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Skills + Table Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Skills Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900">Top In-Demand Skills</h3>
              <p className="text-xs text-slate-500 mt-0.5">Job postings by skill</p>
            </div>
          </div>
          <div className="space-y-3">
            {topSkills.map((item) => (
              <div key={item.skill}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-700">{item.skill}</span>
                  <span className="text-xs text-slate-500">{item.jobs.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(item.jobs / 1240) * 100}%`,
                      backgroundColor: item.fill,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900">Recent Job Postings</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest opportunities for you</p>
            </div>
            <Link href="/jobs" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">{job.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${typeColors[job.type] || "bg-slate-100 text-slate-600"}`}>
                      {job.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />{job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{job.posted}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-slate-900">{job.salary}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    job.match >= 80 ? "bg-emerald-100 text-emerald-700" :
                    job.match >= 70 ? "bg-blue-100 text-blue-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {job.match}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Trending Skills ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Trending This Month</h3>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            Bấm vào skill để xem job, lương & lộ trình học
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {trendingSkills.map((s) => (
            <Link
              key={s.name}
              href={`/skill-gap?focus=${encodeURIComponent(s.name)}`}
              className={`p-3 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 group ${
                s.hot
                  ? "border-orange-200 bg-orange-50 dark:border-orange-900/60 dark:bg-orange-950/30"
                  : "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-1 mb-1.5">
                {s.hot && <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                <span className="text-xs font-semibold text-slate-900 truncate dark:text-slate-100">
                  {s.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${s.hot ? "text-orange-600" : "text-emerald-600"}`}>
                  {s.growth}
                </span>
                <ArrowRight className="h-3 w-3 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-blue-500" />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                {s.jobs.toLocaleString()} jobs · ~${s.avgSalaryK}K
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Peer Comparison ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 dark:bg-slate-900 dark:border-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Sinh viên {profile.major ?? "IT"} năm {profile.year ?? "3-4"} đang focus vào
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Dữ liệu anonymized từ {peerSampleSize.toLocaleString()} sinh viên cùng trường/cùng năm
            </p>
          </div>
          <span className="hidden rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 sm:inline dark:bg-violet-950/40 dark:text-violet-300">
            Anonymous
          </span>
        </div>
        <div className="space-y-2.5">
          {peerFocus.map((p) => {
            const isMine = profile.interests.includes(p.id) || profile.suggestedPaths.includes(p.id);
            return (
              <div key={p.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span
                    className={`font-medium ${
                      isMine
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {p.label}
                    {isMine && (
                      <span className="ml-2 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        Bạn
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">{p.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      isMine
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
