"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  SlidersHorizontal,
  Building2,
  ChevronRight,
  BookmarkPlus,
  X,
} from "lucide-react";
import { jobsWithDetails, userProfile } from "@/data/mockData";
import { getMatchedJobs, formatSalary, formatRelativeTime } from "@/utils/matching";

const matchedJobs = getMatchedJobs(jobsWithDetails, userProfile);

const allJobs = matchedJobs.map(m => ({
  id: m.job.job_id,
  title: m.job.title,
  company: m.job.company.name,
  location: m.job.location || "Remote",
  type: m.job.work_type || "Full-time",
  salary: formatSalary(m.job.salary?.min_salary, m.job.salary?.max_salary),
  salaryNum: m.job.salary?.med_salary || 0,
  posted: formatRelativeTime(m.job.listed_time),
  skills: m.job.skills.filter(s => !s.is_inferred).map(s => s.skill_name),
  match: m.overall_score,
  description: m.job.description || "No description available",
}));

const jobTypes = ["All", "Full-time", "Remote", "Hybrid", "Part-time"];
const experienceLevels = ["Any Level", "Entry Level", "Mid Level", "Senior Level"];

const typeColors: Record<string, string> = {
  "Full-time": "bg-blue-100 text-blue-700",
  Remote: "bg-emerald-100 text-emerald-700",
  Hybrid: "bg-violet-100 text-violet-700",
  "Part-time": "bg-amber-100 text-amber-700",
};

const matchColor = (m: number) =>
  m >= 80 ? "bg-emerald-100 text-emerald-700" : m >= 70 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700";

export function JobSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedExp, setSelectedExp] = useState("Any Level");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"match" | "recent" | "salary">("match");
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());

  const filtered = allJobs
    .filter((job) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q)) ||
        job.location.toLowerCase().includes(q);
      const matchesType = selectedType === "All" || job.type === selectedType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "match") return b.match - a.match;
      if (sortBy === "salary") return b.salaryNum - a.salaryNum;
      return 0;
    });

  const toggleSave = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    setSavedJobs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="p-6 space-y-5">
      {/* ── Search Bar ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, company, skill, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              showFilters ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filter Row */}
        <div className="mt-3 flex flex-wrap gap-2">
          {jobTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedType === t
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
          <div className="w-px bg-slate-200 mx-1" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="match">Best Match</option>
            <option value="salary">Highest Salary</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Experience Level</label>
                <div className="space-y-1">
                  {experienceLevels.map((l) => (
                    <button
                      key={l}
                      onClick={() => setSelectedExp(l)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedExp === l ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Salary Range</label>
                <div className="space-y-1">
                  {["Any", "$50K–$80K", "$80K–$110K", "$110K+"].map((r) => (
                    <button key={r} className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Match Score</label>
                <div className="space-y-1">
                  {["Any Match", "80%+ Match", "70%+ Match", "60%+ Match"].map((r) => (
                    <button key={r} className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Posted Within</label>
                <div className="space-y-1">
                  {["Any Time", "Past 24h", "Past Week", "Past Month"].map((r) => (
                    <button key={r} className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Results Summary ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Found{" "}
          <span className="font-bold text-slate-900">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "position" : "positions"}
          {searchTerm && <> for <span className="font-semibold text-blue-600">"{searchTerm}"</span></>}
        </p>
        <p className="text-xs text-slate-400">Sorted by: <span className="text-slate-600 font-medium capitalize">{sortBy === "match" ? "Best Match" : sortBy}</span></p>
      </div>

      {/* ── Job Cards ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">No jobs found</h3>
          <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
          <button onClick={() => { setSearchTerm(""); setSelectedType("All"); }} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group block bg-white rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all p-5"
            >
              <div className="flex items-start gap-4">
                {/* Company Logo Placeholder */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 border border-slate-200">
                  <Building2 className="w-6 h-6 text-slate-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {job.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColors[job.type] || "bg-slate-100 text-slate-600"}`}>
                          {job.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Building2 className="w-3.5 h-3.5" />{job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />{job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />{job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />{job.posted}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 hidden sm:block">{job.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${matchColor(job.match)}`}>
                        {job.match}% Match
                      </span>
                      <button
                        onClick={(e) => toggleSave(job.id, e)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          savedJobs.has(job.id)
                            ? "bg-blue-50 border-blue-200 text-blue-600"
                            : "border-slate-200 text-slate-400 hover:border-blue-200 hover:text-blue-500"
                        }`}
                      >
                        <BookmarkPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Skill Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 mt-1 shrink-0 hidden md:block transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
