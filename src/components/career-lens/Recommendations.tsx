"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  BookOpen,
  Briefcase,
  Users,
  Award,
  Clock,
  DollarSign,
  MapPin,
  ChevronRight,
  BookmarkCheck,
  ExternalLink,
  Star,
  Download,
  Calendar,
  Filter,
  BarChart3,
  FileText,
  Eye,
  Heart,
  GraduationCap,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { jobsWithDetails, userProfile } from "@/data/mockData";
import { getMatchedJobs, analyzeSkillGaps, formatSalary } from "@/utils/matching";
import { useOnboarding } from "@/contexts/onboarding/onboarding-context";

const matchedJobs = getMatchedJobs(jobsWithDetails, userProfile);
const gapAnalysis = analyzeSkillGaps(jobsWithDetails, userProfile);

const savedReports = [
  {
    id: 1,
    type: "cv-match",
    title: `CV Match — ${matchedJobs[0].job.title}`,
    subtitle: matchedJobs[0].job.company.name,
    score: matchedJobs[0].overall_score,
    date: "Apr 18, 2026",
    tags: matchedJobs[0].skill_matches.filter(sm => sm.match_level === "strong").slice(0, 3).map(sm => sm.skill_name),
    status: matchedJobs[0].overall_score >= 80 ? "strong" : "moderate",
  },
  {
    id: 2,
    type: "gap",
    title: "Skill Gap Report — Full Stack Path",
    subtitle: "Role Benchmark",
    score: 68,
    date: "Apr 15, 2026",
    tags: gapAnalysis.filter(g => g.priority === "critical" || g.priority === "high").slice(0, 3).map(g => g.skill_name),
    status: "moderate",
  },
];

const topJobMatches = matchedJobs.slice(0, 3).map((m, idx) => {
  const topSkills = m.skill_matches
    .filter(sm => sm.match_level === "strong")
    .slice(0, 2)
    .map(sm => sm.skill_name);

  const skillText = topSkills.length > 0
    ? `Strong match with your ${topSkills.join(" and ")} skills`
    : "Good overall alignment with your profile";

  return {
    id: m.job.job_id,
    title: m.job.title,
    company: m.job.company.name,
    match: m.overall_score,
    reason: skillText,
    salary: formatSalary(m.job.salary?.min_salary, m.job.salary?.max_salary),
    location: m.job.location || "Remote",
    type: m.job.work_type || "Full-time",
    hot: idx === 0 && m.overall_score >= 85,
  };
});

const skillsToDevelop = gapAnalysis
  .filter(g => g.priority === "critical" || g.priority === "high")
  .slice(0, 4)
  .map(gap => {
    const urgency = gap.priority === "critical" ? "critical" : gap.priority === "high" ? "high" : "medium";
    const impactMsg = gap.demand_percentage >= 60
      ? `+${Math.round((gap.demand_percentage / 100) * 50)}% more job opportunities`
      : "+15% salary potential";

    return {
      skill: gap.skill_name,
      urgency,
      reason: `Required in ${gap.demand_percentage}% of target jobs`,
      impact: impactMsg,
      timeframe: gap.user_proficiency && gap.user_proficiency > 40 ? "1–2 months" : "3–4 months",
      jobs: Math.round((gap.demand_percentage / 100) * jobsWithDetails.length * 50),
    };
  });

const careerPaths = [
  {
    title: "Senior Frontend Developer",
    emoji: "🖥️",
    currentMatch: 75,
    targetMatch: 90,
    timeToReady: "6–8 months",
    gaps: ["Advanced React patterns", "Performance optimization", "System design basics"],
    avgSalary: "$110K–$140K",
    openings: 234,
  },
  {
    title: "Full Stack Engineer",
    emoji: "⚙️",
    currentMatch: 65,
    targetMatch: 85,
    timeToReady: "8–12 months",
    gaps: ["Backend architecture", "AWS fundamentals", "Database optimization"],
    avgSalary: "$100K–$130K",
    openings: 412,
  },
  {
    title: "Tech Lead / Engineering Manager",
    emoji: "🚀",
    currentMatch: 50,
    targetMatch: 80,
    timeToReady: "12–18 months",
    gaps: ["Team leadership", "System architecture", "Mentoring & code review"],
    avgSalary: "$130K–$170K",
    openings: 98,
  },
];

const resources = [
  {
    title: "AWS Certified Developer – Associate",
    type: "Certification",
    provider: "Amazon Web Services",
    duration: "3–4 months",
    cost: "$150",
    rating: 4.8,
    url: "#",
  },
  {
    title: "Advanced React Patterns & Best Practices",
    type: "Course",
    provider: "Frontend Masters",
    duration: "4 weeks",
    cost: "$39/mo",
    rating: 4.9,
    url: "#",
  },
  {
    title: "System Design Interview Guide",
    type: "Course",
    provider: "Educative.io",
    duration: "6 weeks",
    cost: "$59",
    rating: 4.7,
    url: "#",
  },
  {
    title: "Docker and Kubernetes: The Complete Guide",
    type: "Course",
    provider: "Udemy",
    duration: "5 weeks",
    cost: "$19.99",
    rating: 4.8,
    url: "#",
  },
];

const events = [
  { event: "React Conf 2026", date: "May 15–16, 2026", location: "Las Vegas, NV", type: "Conference" },
  { event: "Node.js Interactive", date: "Jun 4, 2026", location: "Online", type: "Virtual" },
  { event: "Local JS Meetup", date: "Every Thursday", location: "Your City", type: "Meetup" },
];

const urgencyConfig: Record<string, { label: string; bg: string; text: string }> = {
  critical: { label: "Critical", bg: "bg-red-100", text: "text-red-700" },
  high: { label: "High Priority", bg: "bg-orange-100", text: "text-orange-700" },
  medium: { label: "Medium", bg: "bg-amber-100", text: "text-amber-700" },
};

const typeColors: Record<string, string> = {
  "Full-time": "bg-blue-100 text-blue-700",
  Remote: "bg-emerald-100 text-emerald-700",
  Hybrid: "bg-violet-100 text-violet-700",
};

export function Recommendations() {
  const [activeTab, setActiveTab] = useState<"overview" | "saved" | "resources">("overview");
  const { profile, toggleBookmark } = useOnboarding();

  // Build kanban columns from job data + bookmarks
  const kanbanColumns = useMemo(() => {
    const bookmarkSet = new Set(profile.bookmarkedJobIds);
    const appliedSet = new Set(profile.appliedJobIds);
    const recent = matchedJobs.slice(0, 8);

    return {
      viewing: recent
        .filter((m) => !bookmarkSet.has(String(m.job.job_id)) && !appliedSet.has(String(m.job.job_id)))
        .slice(0, 3),
      bookmarked: recent.filter((m) => bookmarkSet.has(String(m.job.job_id))),
      learning: recent.slice(3, 5),
      applied: recent.filter((m) => appliedSet.has(String(m.job.job_id))),
    };
  }, [profile.bookmarkedJobIds, profile.appliedJobIds]);

  const kanbanStages = [
    {
      key: "viewing" as const,
      label: "Đang xem",
      Icon: Eye,
      color: "slate",
      desc: "Job bạn mới xem gần đây",
    },
    {
      key: "bookmarked" as const,
      label: "Quan tâm",
      Icon: Heart,
      color: "rose",
      desc: "Đã lưu để xem lại",
    },
    {
      key: "learning" as const,
      label: "Đang học skill",
      Icon: GraduationCap,
      color: "amber",
      desc: "Học skill để đủ điều kiện",
    },
    {
      key: "applied" as const,
      label: "Đã apply",
      Icon: CheckCircle2,
      color: "emerald",
      desc: "Đã gửi CV",
    },
  ];

  const colorMap: Record<string, { border: string; bg: string; text: string; icon: string }> = {
    slate: {
      border: "border-slate-200 dark:border-slate-700",
      bg: "bg-slate-50 dark:bg-slate-800/50",
      text: "text-slate-700 dark:text-slate-200",
      icon: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    },
    rose: {
      border: "border-rose-200 dark:border-rose-900/60",
      bg: "bg-rose-50 dark:bg-rose-950/20",
      text: "text-rose-700 dark:text-rose-300",
      icon: "bg-rose-200 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
    },
    amber: {
      border: "border-amber-200 dark:border-amber-900/60",
      bg: "bg-amber-50 dark:bg-amber-950/20",
      text: "text-amber-700 dark:text-amber-300",
      icon: "bg-amber-200 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
    },
    emerald: {
      border: "border-emerald-200 dark:border-emerald-900/60",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      text: "text-emerald-700 dark:text-emerald-300",
      icon: "bg-emerald-200 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
    },
  };

  const tabs = [
    { key: "overview" as const, label: "Career Overview", icon: Sparkles },
    { key: "saved" as const, label: "Saved Reports", icon: BookmarkCheck },
    { key: "resources" as const, label: "Resources", icon: BookOpen },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* ── Profile Snapshot ── */}
      <div className="relative bg-gradient-to-r from-violet-600 via-purple-700 to-indigo-700 rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-64 h-64 bg-white rounded-full" />
          <div className="absolute -bottom-12 left-32 w-40 h-40 bg-white rounded-full" />
        </div>
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-violet-300" />
              <p className="text-violet-200 text-sm font-semibold">Career Snapshot — AI Insight</p>
            </div>
            <p className="text-white font-bold text-lg mb-2 max-w-xl">
              You're well-positioned for Frontend & Full Stack roles.
              Focus on cloud technologies to unlock senior positions.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">85% Profile Strength</span>
              <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">234 Matching Jobs</span>
              <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">3 Saved Reports</span>
            </div>
          </div>
          <div className="hidden lg:block text-right">
            <p className="text-violet-200 text-xs mb-1">Top Career Match</p>
            <p className="text-white font-bold">Senior Frontend Dev</p>
            <p className="text-violet-200 text-sm">$110K–$140K avg.</p>
          </div>
        </div>
      </div>

      {/* ── Job Pipeline (Kanban) ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 dark:bg-slate-900 dark:border-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              📋 Job Pipeline của bạn
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Kéo thả (sap tới) — hoặc bấm bookmark/apply trực tiếp từ job card
            </p>
          </div>
          <Link
            href="/jobs"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Thêm job <Plus className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kanbanStages.map((stage) => {
            const items = kanbanColumns[stage.key];
            const c = colorMap[stage.color];
            return (
              <div
                key={stage.key}
                className={`rounded-xl border ${c.border} ${c.bg} p-3 min-h-[280px] flex flex-col`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${c.icon}`}>
                    <stage.Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold ${c.text}`}>{stage.label}</p>
                    <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                      {stage.desc}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2 flex-1">
                  {items.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-3 text-center text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-900/60">
                      Trống — bấm + Thêm job
                    </p>
                  ) : (
                    items.map((m) => (
                      <div
                        key={m.job.job_id}
                        className="rounded-lg bg-white border border-slate-200 p-2.5 shadow-sm dark:bg-slate-900 dark:border-slate-700"
                      >
                        <Link
                          href={`/jobs/${m.job.job_id}`}
                          className="block text-xs font-semibold text-slate-900 hover:text-blue-700 line-clamp-2 dark:text-slate-100"
                        >
                          {m.job.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-500 truncate">
                          {m.job.company.name}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                              m.overall_score >= 80
                                ? "bg-emerald-100 text-emerald-700"
                                : m.overall_score >= 70
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {m.overall_score}%
                          </span>
                          {stage.key !== "applied" && (
                            <button
                              onClick={() => toggleBookmark(String(m.job.job_id))}
                              className="text-xs font-medium text-blue-600 hover:underline"
                            >
                              {profile.bookmarkedJobIds.includes(String(m.job.job_id))
                                ? "✓ saved"
                                : "+ save"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          {/* Top Job Matches */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-slate-900">Top Job Matches For You</h2>
              </div>
              <Link href="/jobs" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Browse all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {topJobMatches.map((job) => (
                <div key={job.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      job.match >= 90 ? "bg-emerald-100 text-emerald-700" :
                      job.match >= 80 ? "bg-blue-100 text-blue-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {job.match}% Match
                    </span>
                    {job.hot && <span className="text-xs font-bold text-orange-600 flex items-center gap-0.5">🔥 Hot</span>}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-0.5">{job.title}</h3>
                  <p className="text-sm text-slate-500 mb-3">{job.company}</p>
                  <p className="text-xs text-slate-600 italic mb-3 bg-slate-50 rounded-lg p-2">"{job.reason}"</p>
                  <div className="space-y-1 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-900">{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />{job.location}
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColors[job.type] || "bg-slate-100 text-slate-600"}`}>
                      {job.type}
                    </span>
                  </div>
                  <Link href={`/jobs/${job.id}`} className="block w-full py-2 bg-blue-600 text-white text-center rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Skills */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <h2 className="font-bold text-slate-900">Priority Skills to Develop</h2>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-50">
              {skillsToDevelop.map((skill) => {
                const uc = urgencyConfig[skill.urgency];
                return (
                  <div key={skill.skill} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 text-sm">{skill.skill}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${uc.bg} ${uc.text}`}>
                            {uc.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{skill.reason}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-emerald-600">{skill.impact}</p>
                        <p className="text-[11px] text-slate-400">{skill.jobs} jobs need this</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />{skill.timeframe}
                      </span>
                      <Link href="/skill-gap" className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors">
                        Start Learning
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Career Paths */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-violet-600" />
              <h2 className="font-bold text-slate-900">Career Path Recommendations</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {careerPaths.map((path) => (
                <div key={path.title} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{path.emoji}</span>
                    <h3 className="font-bold text-slate-900 text-sm">{path.title}</h3>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500">Readiness</span>
                      <span className="font-bold text-slate-900">{path.currentMatch}% → {path.targetMatch}%</span>
                    </div>
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="absolute h-full bg-violet-500 rounded-full transition-all" style={{ width: `${path.currentMatch}%` }} />
                      <div className="absolute top-0 bottom-0 w-0.5 bg-violet-800 rounded-full" style={{ left: `${path.targetMatch}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] mt-1 text-slate-400">
                      <span>Now</span>
                      <span>Target</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-700 mb-1.5">Skills to develop:</p>
                    <div className="flex flex-wrap gap-1">
                      {path.gaps.map((gap) => (
                        <span key={gap} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">
                          {gap}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-slate-500"><Clock className="w-3 h-3" /> Time to ready</span>
                      <span className="font-semibold text-slate-900">{path.timeToReady}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-slate-500"><DollarSign className="w-3 h-3" /> Avg. Salary</span>
                      <span className="font-bold text-emerald-600">{path.avgSalary}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-slate-500"><Briefcase className="w-3 h-3" /> Open Roles</span>
                      <span className="font-semibold text-blue-700">{path.openings.toLocaleString()} jobs</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-slate-900">Networking Opportunities</h2>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                {events.map((event) => (
                  <div key={event.event} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{event.event}</p>
                      <p className="text-xs text-slate-500">{event.date} · {event.location}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full shrink-0">
                      {event.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <p className="text-blue-200 text-xs font-semibold mb-2">Next Step</p>
                <p className="text-white font-bold text-lg mb-2">Ready to analyze a new job?</p>
                <p className="text-blue-200 text-sm">Upload your CV and compare it against any job description in seconds.</p>
              </div>
              <Link
                href="/cv-matching"
                className="mt-4 flex items-center justify-center gap-2 py-2.5 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors"
              >
                Start CV Matching <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Saved Reports Tab ── */}
      {activeTab === "saved" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">{savedReports.length} saved reports</p>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="w-3.5 h-3.5" />Filter
            </button>
          </div>
          {savedReports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    report.type === "cv-match" ? "bg-blue-100" : "bg-violet-100"
                  }`}>
                    {report.type === "cv-match"
                      ? <FileText className={`w-5 h-5 ${report.type === "cv-match" ? "text-blue-600" : "text-violet-600"}`} />
                      : <BarChart3 className="w-5 h-5 text-violet-600" />
                    }
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-0.5">{report.title}</h3>
                    <p className="text-xs text-slate-500 mb-2">{report.subtitle}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    report.score >= 90 ? "bg-emerald-100 text-emerald-700" :
                    report.score >= 75 ? "bg-blue-100 text-blue-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {report.score}% Match
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3" />{report.date}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 border-t border-slate-50 pt-3">
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />View Report
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  <Download className="w-3.5 h-3.5" />Export PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Resources Tab ── */}
      {activeTab === "resources" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {resources.map((r) => (
              <div key={r.title} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.type === "Certification" ? "bg-violet-100 text-violet-700" :
                        r.type === "Course" ? "bg-blue-100 text-blue-700" :
                        "bg-emerald-100 text-emerald-700"
                      }`}>
                        {r.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{r.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{r.provider}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900 text-sm">{r.cost}</p>
                    <div className="flex items-center gap-0.5 text-amber-400 justify-end mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(r.rating) ? "fill-amber-400" : "fill-slate-200 text-slate-200"}`} />
                      ))}
                      <span className="text-[10px] text-slate-500 ml-0.5">{r.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />{r.duration}
                  </div>
                  <a
                    href={r.url}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-center">
            <p className="text-slate-300 text-xs mb-2">📚 Personalized for you</p>
            <p className="text-white font-bold text-lg mb-1">Want more resources?</p>
            <p className="text-slate-400 text-sm mb-4">Run a full gap analysis to get a tailored learning roadmap based on your current skills.</p>
            <Link
              href="/skill-gap"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              View Gap Analysis <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
