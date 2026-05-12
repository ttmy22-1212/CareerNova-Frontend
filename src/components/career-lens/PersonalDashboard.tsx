"use client";
import { useState } from "react";
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
import { jobsWithDetails, userProfile, skills as allSkills } from "@/data/mockData";
import { getMatchedJobs, analyzeSkillGaps, formatSalary, formatRelativeTime } from "@/utils/matching";
import { useOnboarding } from "@/contexts/onboarding/onboarding-context";
import { useAuth } from "@/contexts/auth/auth-context";

// ── Data ──────────────────────────────────────────────────────────
const matchedJobs = getMatchedJobs(jobsWithDetails, userProfile);
const gapAnalysis = analyzeSkillGaps(jobsWithDetails, userProfile);

const personalMatchedCount = matchedJobs.filter((m) => m.overall_score >= 70).length;
const avgMatchScore = Math.round(
  matchedJobs.reduce((s, m) => s + m.overall_score, 0) / matchedJobs.length
);

const topRecommended = matchedJobs.slice(0, 5).map((m) => ({
  id: m.job.job_id,
  title: m.job.title,
  company: m.job.company.name,
  location: m.job.location ?? "Remote",
  type: m.job.work_type ?? "Full-time",
  salary: formatSalary(m.job.salary?.min_salary, m.job.salary?.max_salary),
  posted: formatRelativeTime(m.job.listed_time),
  match: m.overall_score,
  skills: m.job.skills.slice(0, 3).map((s) => s.skill_name),
}));

// Skill radar data: group by type
const typeMap = new Map<string, { has: number; total: number }>();
gapAnalysis.forEach((g) => {
  const t = g.type ?? "General";
  const cur = typeMap.get(t) ?? { has: 0, total: 0 };
  typeMap.set(t, {
    has: cur.has + (g.user_proficiency ?? 0),
    total: cur.total + 1,
  });
});
const radarData = Array.from(typeMap.entries())
  .slice(0, 6)
  .map(([type, { has, total }]) => ({
    subject: type,
    you: Math.round(has / total),
    market: 75,
  }));

// Top skill gaps
const criticalGaps = gapAnalysis
  .filter((g) => !g.user_has || (g.user_proficiency ?? 0) < 50)
  .slice(0, 4);

// Recent activity mock
const recentActivity = [
  { icon: FileText, text: "CV uploaded & analyzed", time: "2 hours ago", color: "text-blue-600 bg-blue-50" },
  { icon: Target, text: "Skill Gap Analysis completed", time: "Yesterday", color: "text-violet-600 bg-violet-50" },
  { icon: BookOpen, text: "Started Node.js learning path", time: "3 days ago", color: "text-emerald-600 bg-emerald-50" },
];

const typeColors: Record<string, string> = {
  "Full-time": "bg-blue-100 text-blue-700",
  Remote: "bg-emerald-100 text-emerald-700",
  Hybrid: "bg-violet-100 text-violet-700",
  "Part-time": "bg-amber-100 text-amber-700",
};

const actionItems = [
  { href: "/skill-gap", icon: Target, title: "Xem Skill Gap Analysis", desc: "3 kỹ năng cần cải thiện khẩn", color: "from-violet-500 to-violet-600", badge: "Khẩn" },
  { href: "/roadmap", icon: BookOpen, title: "Tiếp tục lộ trình học", desc: "Node.js · 60% hoàn thành", color: "from-blue-500 to-blue-600", badge: "In progress" },
  { href: "/jobs", icon: Briefcase, title: `${personalMatchedCount} jobs phù hợp với bạn`, desc: "Match ≥ 70% · Cập nhật hôm nay", color: "from-emerald-500 to-emerald-600", badge: "Mới" },
];

// ── Component ────────────────────────────────────────────────────
export function PersonalDashboard() {
  const { profile, isOnboarded, strength, checklist } = useOnboarding();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"jobs" | "skills" | "progress">("jobs");

  const hasCV = profile.hasUploadedCV;
  const userName = user?.name?.split(" ").pop() ?? "bạn";
  const incompleteTasks = checklist.filter((c) => !c.done);

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
              Hồ sơ hiện tại: <span className="font-bold">{strength}%</span> — Cần ít nhất 50% để mở khóa insight cá nhân hóa.
            </p>
            <div className="flex flex-wrap gap-2">
              {incompleteTasks.slice(0, 3).map((task) => (
                <Link
                  key={task.id}
                  href={task.href}
                  className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors"
                >
                  <Circle className="h-3 w-3" />
                  {task.label}
                  <span className="rounded-md bg-violet-500 px-1.5 py-0.5 text-[10px] font-bold">+{task.weight}%</span>
                </Link>
              ))}
              {incompleteTasks.length > 3 && (
                <Link
                  href="/onboarding/welcome"
                  className="flex items-center gap-1 rounded-lg border border-violet-300 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 transition-colors dark:bg-violet-950/40 dark:text-violet-300"
                >
                  +{incompleteTasks.length - 3} bước nữa <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right hidden sm:block">
            <div className="relative h-14 w-14">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#e9d5ff" strokeWidth="4" />
                <circle
                  cx="24" cy="24" r="20" fill="none"
                  stroke="#7c3aed" strokeWidth="4"
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
      <div data-tour="welcome-banner" className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 overflow-hidden">
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
                  <span className="text-white font-bold">{personalMatchedCount} jobs</span> (match ≥ 70%).
                  Điểm match trung bình: <span className="text-white font-bold">{avgMatchScore}%</span>.
                </>
              ) : (
                <>
                  Upload CV để hệ thống phân tích và gợi ý <span className="text-white font-bold">job phù hợp chính xác</span> với hồ sơ của bạn.
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
                Upload CV ngay
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

      {/* ── No CV Warning ── */}
      {!hasCV && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Chưa có CV — Gợi ý chưa được cá nhân hóa</p>
            <p className="text-xs text-amber-700 mt-0.5">Upload CV (PDF/DOCX) để hệ thống tính toán điểm match chính xác với từng job.</p>
          </div>
          <Link href="/cv-matching" className="shrink-0 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors">
            Upload CV
          </Link>
        </div>
      )}

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Target,
            label: "Match Score TB",
            value: `${avgMatchScore}%`,
            sub: `Top ${100 - avgMatchScore}% ứng viên`,
            color: "from-blue-600 to-indigo-700",
            text: "text-white",
            subText: "text-blue-200",
            iconBg: "bg-white/20",
          },
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
            label: "Skill Gaps",
            value: criticalGaps.length.toString(),
            sub: "Kỹ năng cần cải thiện",
            color: "from-orange-500 to-orange-600",
            text: "text-white",
            subText: "text-orange-100",
            iconBg: "bg-white/20",
          },
          {
            icon: Award,
            label: "Profile Strength",
            value: `${strength}%`,
            sub: incompleteTasks.length > 0 ? `${incompleteTasks.length} bước còn thiếu` : "Hồ sơ hoàn chỉnh!",
            color: "from-violet-500 to-violet-600",
            text: "text-white",
            subText: "text-violet-100",
            iconBg: "bg-white/20",
          },
        ].map((card) => (
          <div key={card.label} className={`rounded-xl p-5 bg-gradient-to-br ${card.color} shadow-sm`}>
            <div className={`w-9 h-9 ${card.iconBg} rounded-lg flex items-center justify-center mb-3`}>
              <card.icon className={`w-4.5 h-4.5 ${card.text}`} />
            </div>
            <p className={`text-2xl font-bold ${card.text} mb-0.5`}>{card.value}</p>
            <p className={`text-xs font-semibold ${card.text} opacity-90`}>{card.label}</p>
            <p className={`text-xs ${card.subText} mt-0.5`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Next Actions ── */}
      <div data-tour="next-actions" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actionItems.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-sm shrink-0`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-slate-900 truncate">{action.title}</p>
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
            const labels = { jobs: "Jobs Gợi Ý", skills: "Kỹ Năng Của Bạn", progress: "Tiến Độ" };
            const icons = { jobs: Briefcase, skills: BarChart3, progress: TrendingUp };
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
            {topRecommended.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{job.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${typeColors[job.type] ?? "bg-slate-100 text-slate-600"}`}>
                      {job.type}
                    </span>
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
                <div className="shrink-0 text-right flex flex-col items-end gap-1">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    job.match >= 80 ? "bg-emerald-100 text-emerald-700" :
                    job.match >= 70 ? "bg-blue-100 text-blue-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {job.match}% match
                  </span>
                  <p className="text-xs font-semibold text-slate-900">{job.salary}</p>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
            ))}
            <div className="px-5 py-3">
              <Link href="/jobs" className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Xem tất cả {personalMatchedCount} jobs phù hợp <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Tab: Skills */}
        {activeTab === "skills" && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Kỹ năng của bạn vs. Thị trường</h4>
              <p className="text-xs text-slate-500 mb-3">Theo từng nhóm kỹ năng</p>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  <Radar name="Bạn" dataKey="you" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.35} />
                  <Radar name="Thị trường" dataKey="market" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                  <Tooltip formatter={(v: number) => [`${v}%`]} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex gap-5 justify-center mt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-4 h-0.5 bg-blue-500 inline-block rounded-full" />Bạn
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-4 h-0.5 bg-emerald-500 inline-block rounded-full" />Thị trường
                </div>
              </div>
            </div>

            {/* Critical Gaps */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Kỹ năng cần cải thiện</h4>
                  <p className="text-xs text-slate-500">Ảnh hưởng lớn đến match score</p>
                </div>
                <Link href="/skill-gap" className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-0.5">
                  Xem đầy đủ <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {criticalGaps.map((gap) => {
                  const pct = gap.user_proficiency ?? 0;
                  return (
                    <div key={gap.skill_name} className="p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-900">{gap.skill_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pct === 0 ? "bg-red-100 text-red-700" : pct < 50 ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {pct === 0 ? "Chưa có" : `${pct}%`}
                        </span>
                      </div>
                      <div className="relative h-2 bg-white border border-slate-200 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                        <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-500" style={{ left: "75%" }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>Hiện tại: {pct}%</span>
                        <span>Mục tiêu: 75%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/skill-gap"
                className="mt-3 flex items-center justify-center gap-2 py-2.5 w-full bg-violet-50 text-violet-700 rounded-xl text-sm font-semibold hover:bg-violet-100 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Xem full Skill Gap Analysis
              </Link>
            </div>
          </div>
        )}

        {/* Tab: Progress */}
        {activeTab === "progress" && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Checklist */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Hoàn thiện hồ sơ</h4>
              <p className="text-xs text-slate-500 mb-3">Hồ sơ đầy đủ → gợi ý chính xác hơn</p>
              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-xl">
                <div className="flex-1 h-2.5 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                    style={{ width: `${strength}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-blue-700 shrink-0">{strength}%</span>
              </div>
              <ul className="space-y-2">
                {checklist.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={c.href}
                      className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                        c.done ? "text-slate-400" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {c.done
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        : <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                      }
                      <span className={`flex-1 text-sm ${c.done ? "line-through" : ""}`}>{c.label}</span>
                      {!c.done && (
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold">+{c.weight}%</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Activity + Learning */}
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Hoạt động gần đây</h4>
                <div className="space-y-2">
                  {recentActivity.map((act, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className={`w-8 h-8 rounded-lg ${act.color} flex items-center justify-center shrink-0`}>
                        <act.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{act.text}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-900">Lộ trình đề xuất</h4>
                  <Link href="/roadmap" className="text-xs text-blue-600 font-semibold flex items-center gap-0.5 hover:text-blue-700">
                    Xem tất cả <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                {[
                  { name: "AWS Cloud Fundamentals", pct: 0, time: "3–4 tháng", impact: "+32% jobs" },
                  { name: "Advanced Node.js & APIs", pct: 60, time: "2–3 tháng", impact: "+25% jobs" },
                  { name: "Docker & Containers", pct: 15, time: "2 tháng", impact: "+18% jobs" },
                ].map((path) => (
                  <div key={path.name} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">{path.name}</span>
                      <span className="text-xs text-emerald-600 font-semibold">{path.impact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${path.pct}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{path.pct}%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{path.time}</p>
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
            <p className="text-sm font-semibold text-slate-900">Xem tổng quan thị trường IT</p>
            <p className="text-xs text-slate-500">Top jobs hot, top skills, xu hướng lương — không cần đăng nhập</p>
          </div>
        </div>
        <Link href="/dashboard" className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
          Market Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
