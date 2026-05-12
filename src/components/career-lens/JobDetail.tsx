"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Building2,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  BookmarkPlus,
  Share2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { jobsWithDetails, userProfile } from "@/data/mockData";
import { calculateJobMatch, formatSalary, formatRelativeTime } from "@/utils/matching";

// Transform real jobs data into display format
const jobsData: Record<string, any> = {};

jobsWithDetails.forEach(job => {
  const matchResult = calculateJobMatch(job, userProfile);
  const requiredSkills = job.skills.filter(s => !s.is_inferred);
  const preferredSkills = job.skills.filter(s => s.is_inferred);

  const matchedSkills = matchResult.skill_matches.filter(sm => sm.match_level === "strong" && sm.required).map(sm => sm.skill_name);
  const partialSkills = matchResult.skill_matches.filter(sm => sm.match_level === "partial" && sm.required).map(sm => sm.skill_name);
  const missingSkills = matchResult.skill_matches.filter(sm => sm.match_level === "missing" && sm.required).map(sm => sm.skill_name);

  jobsData[job.job_id.toString()] = {
    id: job.job_id,
    title: job.title,
    company: job.company.name,
    companyLogo: null,
    location: job.location || "Remote",
    type: job.work_type || "Full-time",
    salary: formatSalary(job.salary?.min_salary, job.salary?.max_salary),
    posted: formatRelativeTime(job.listed_time),
    deadline: job.expiry_time ? new Date(job.expiry_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "May 31, 2026",
    match: matchResult.overall_score,
    description: job.description || "No detailed description available.",
    responsibilities: [
      `Design and develop solutions according to ${job.title} best practices`,
      "Collaborate with cross-functional teams to define, design, and ship new features",
      "Write clean, maintainable, well-tested, and documented code",
      "Participate in code reviews and contribute to team knowledge sharing",
      "Optimize applications for maximum speed, scalability, and security",
    ],
    requirements: [
      `${job.formatted_experience_level || "3+ years"} of professional experience`,
      ...(job.skills_desc ? [job.skills_desc] : []),
      "Strong problem-solving and communication skills",
      "Bachelor's degree in Computer Science or equivalent experience",
    ],
    niceToHave: preferredSkills.length > 0
      ? preferredSkills.map(s => `Experience with ${s.skill_name}`)
      : ["Contributions to open-source projects", "Experience in similar industry"],
    skills: {
      required: requiredSkills.map(s => s.skill_name),
      preferred: preferredSkills.map(s => s.skill_name),
    },
    mySkills: {
      matched: matchedSkills,
      partial: partialSkills,
      missing: missingSkills,
    },
    benefits: job.benefits.map(b => b.benefit_name),
    companyInfo: {
      size: job.company.company_size_min && job.company.company_size_max
        ? `${job.company.company_size_min}–${job.company.company_size_max} employees`
        : "Not specified",
      founded: "N/A",
      industry: job.industries.map(i => i.industry_name).join(", ") || "Technology",
      website: job.company.url || "N/A",
    },
    applies: job.applies || 0,
    views: job.views || 0,
  };
});

const typeColors: Record<string, string> = {
  "Full-time": "bg-blue-100 text-blue-700",
  Remote: "bg-emerald-100 text-emerald-700",
  Hybrid: "bg-violet-100 text-violet-700",
};

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const firstJobId = jobsWithDetails[0]?.job_id.toString() || "5001";
  const job = jobsData[id ?? firstJobId] ?? jobsData[firstJobId];

  return (
    <div className="p-6 max-w-6xl">
      {/* Back */}
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-700 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Job Search
      </Link>

      {/* ── Job Header Card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-5 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 mb-1">{job.title}</h1>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-slate-600 font-medium">{job.company}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <a href="#" className="text-blue-600 text-sm hover:underline flex items-center gap-0.5">
                    {job.companyInfo.website} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />{job.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-slate-400" />{job.type}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-slate-400" />{job.salary}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />Posted {job.posted}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${typeColors[job.type] || "bg-slate-100 text-slate-600"}`}>
                    {job.type}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className={`px-4 py-2 rounded-xl text-sm font-bold ${
                job.match >= 80 ? "bg-emerald-100 text-emerald-700" :
                job.match >= 70 ? "bg-blue-100 text-blue-700" :
                "bg-amber-100 text-amber-700"
              }`}>
                {job.match}% Match
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                  <BookmarkPlus className="w-4 h-4" />
                </button>
                <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Match Overview */}
        <div className="px-6 py-4 bg-slate-50 grid grid-cols-3 divide-x divide-slate-200">
          <div className="px-4 first:pl-0">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-semibold">Matched Skills</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {job.mySkills.matched.map((s: string) => (
                <span key={s} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[11px] font-medium rounded">{s}</span>
              ))}
            </div>
          </div>
          <div className="px-4">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Partial Match</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {job.mySkills.partial.map((s: string) => (
                <span key={s} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[11px] font-medium rounded">{s}</span>
              ))}
            </div>
          </div>
          <div className="px-4">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Missing Skills</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {job.mySkills.missing.map((s: string) => (
                <span key={s} className="px-2 py-0.5 bg-red-100 text-red-600 text-[11px] font-medium rounded">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-3">Job Description</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{job.description}</p>
          </div>

          {/* Responsibilities */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Responsibilities</h2>
            <ul className="space-y-2.5">
              {job.responsibilities.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Requirements</h2>
            <ul className="space-y-2.5">
              {job.requirements.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Nice to Have */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Nice to Have</h2>
            <ul className="space-y-2.5">
              {job.niceToHave.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Benefits & Perks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {job.benefits.map((b: string, i: number) => (
                <div key={i} className="flex items-center gap-2.5 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-sm text-slate-700">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Apply Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Apply by {job.deadline}</span>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-200 mb-3">
              Apply Now
            </button>
            <Link
              href="/cv-matching"
              className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-xl font-semibold text-sm hover:bg-violet-100 transition-colors"
            >
              Match My CV <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.required.map((skill: string) => (
                <span key={skill} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  job.mySkills.matched.includes(skill) ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                  job.mySkills.partial.includes(skill) ? "bg-amber-100 text-amber-700 border border-amber-200" :
                  "bg-red-50 text-red-600 border border-red-200"
                }`}>
                  {skill}
                </span>
              ))}
            </div>
            <h3 className="font-bold text-slate-900 mb-3">Preferred Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.preferred.map((skill: string) => (
                <span key={skill} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-600 font-medium"><span className="w-2 h-2 rounded-sm bg-emerald-300 inline-block" />You have</span>
              <span className="flex items-center gap-1 text-amber-600 font-medium"><span className="w-2 h-2 rounded-sm bg-amber-300 inline-block" />Partial</span>
              <span className="flex items-center gap-1 text-red-500 font-medium"><span className="w-2 h-2 rounded-sm bg-red-300 inline-block" />Missing</span>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-3">About the Company</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Company Size</p>
                  <p className="text-sm font-medium text-slate-900">{job.companyInfo.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Founded</p>
                  <p className="text-sm font-medium text-slate-900">{job.companyInfo.founded}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Industry</p>
                  <p className="text-sm font-medium text-slate-900">{job.companyInfo.industry}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Jobs Hint */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5">
            <p className="text-sm font-semibold text-blue-900 mb-1">Explore Similar Jobs</p>
            <p className="text-xs text-blue-700 mb-3">Found 8 roles matching your profile</p>
            <Link href="/jobs" className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors">
              Browse all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}