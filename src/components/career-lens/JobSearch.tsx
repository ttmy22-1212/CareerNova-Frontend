"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  ChevronLeft,
} from "lucide-react";
import JobApi, { GetJobsQueryDto } from "@/api/job";
import CvApi from "@/api/cv";
import { JobListItem } from "@/types/job-insight";
import ProfileApi from "@/api/profile";

const jobTypes = ["All", "Full-time", "Remote", "Hybrid", "Part-time"];

const experienceLevels = [
  { label: "Any Level", value: "Any Level" },
  { label: "Junior", value: "Junior" },
  { label: "Mid Level", value: "Mid" },
  { label: "Senior", value: "Senior" },
];

const typeColors: Record<string, string> = {
  "Full-time": "bg-blue-100 text-blue-700",
  Remote: "bg-emerald-100 text-emerald-700",
  Hybrid: "bg-violet-100 text-violet-700",
  "Part-time": "bg-amber-100 text-amber-700",
};

const matchColor = (m: number | null) => {
  if (m === null) return "bg-slate-100 text-slate-500";
  return m >= 80
    ? "bg-emerald-100 text-emerald-700"
    : m >= 70
      ? "bg-blue-100 text-blue-700"
      : "bg-amber-100 text-amber-700";
};

const formatSalaryRange = (
  min: number | string | null,
  max: number | string | null,
) => {
  if (!min && !max) return "Negotiable";
  const toK = (val: number | string) => {
    const num = Number(val);
    return num >= 1000000
      ? Math.round(num / 1000000) + "M"
      : Math.round(num / 1000) + "K";
  };
  if (min && max) return `${toK(min)}–${toK(max)}`;
  return min ? `${toK(min)}+` : `Up to ${toK(max!)}`;
};

export function JobSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedExp, setSelectedExp] = useState("Any Level");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("match_score");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [minMatch, setMinMatch] = useState<number | undefined>(undefined);

  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      let activeCvId: string | undefined = undefined;
      try {
        const cvRes = await CvApi.getMyCvs();
        if (cvRes?.data && cvRes.data.length > 0) {
          activeCvId = cvRes.data[0].cv_id;
        }
      } catch (cvErr) {
        console.error("Không lấy được danh sách CV:", cvErr);
      }

      const query: GetJobsQueryDto = {
        page: currentPage,
        limit: 10,
        sortBy: sortBy,
        sortOrder: "desc",

        ...(searchTerm && { q: searchTerm }),
        ...(selectedType !== "All" && { work_type: selectedType }),
        ...(selectedExp !== "Any Level" && { experience_level: selectedExp }),
        ...(activeCvId && { cv_id: activeCvId }),
        ...(minMatch !== undefined && { min_match: minMatch }),
      };

      const res = await JobApi.findAll(query);
      if (res && res.data) {
        const rawJobs = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];

        setJobs(rawJobs);

        // Nhận thông tin phân trang từ meta do Back-End phản hồi
        const meta = res.data.meta || res.meta;
        setTotal(meta?.total ?? rawJobs.length);
        setTotalPages(meta?.totalPages ?? 1);
      }
    } catch (error) {
      console.error("Failed to load jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedType, selectedExp, sortBy, currentPage, minMatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedExp, sortBy, minMatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadJobs();
    }, 500);
    return () => clearTimeout(timer);
  }, [loadJobs]);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSaveJobInList = async (
    jobId: string,
    currentIsSaved: boolean,
  ) => {
    if (processingJobId) return;
    try {
      setProcessingJobId(jobId);
      if (currentIsSaved) {
        await ProfileApi.deleteSavedJob(jobId);
      } else {
        await ProfileApi.saveJob({ job_id: jobId });
      }
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.job_id === jobId ? { ...job, is_saved: !currentIsSaved } : job,
        ),
      );
    } catch (error) {
      console.error("Lỗi thay đổi trạng thái lưu công việc:", error);
    } finally {
      setProcessingJobId(null);
    }
  };

  const getPaginationRange = () => {
    const current = currentPage;
    const total = totalPages;

    const siblings = 1;

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const showLeftDot = current - siblings > 2;
    const showRightDot = current + siblings < total - 1;

    if (!showLeftDot && showRightDot) {
      const leftItemCount = 3 + 2 * siblings;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "...", total];
    }

    if (showLeftDot && !showRightDot) {
      const rightItemCount = 3 + 2 * siblings;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => total - rightItemCount + i + 1,
      );
      return [1, "...", ...rightRange];
    }

    if (showLeftDot && showRightDot) {
      const middleRange = Array.from(
        { length: current + siblings - (current - siblings) + 1 },
        (_, i) => current - siblings + i,
      );
      return [1, "...", ...middleRange, "...", total];
    }

    return [];
  };

  return (
    <div className="p-6 space-y-5">
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, company, skill, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              showFilters
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
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
          <div className="w-px bg-slate-200 mx-1 h-4" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="match_score">Best Match</option>
            <option value="salary_med">Highest Salary</option>
            <option value="listed_time">Most Recent</option>
          </select>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Experience Level
                </label>
                <div className="space-y-1">
                  {experienceLevels.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setSelectedExp(l.value)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedExp === l.value
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Minimum Match Score
                </label>
                <div className="space-y-1">
                  {[
                    { label: "Any Match", value: undefined },
                    { label: "80%+ Match", value: 80 },
                    { label: "70%+ Match", value: 70 },
                    { label: "60%+ Match", value: 60 },
                  ].map((r) => (
                    <button
                      key={r.label}
                      onClick={() => setMinMatch(r.value)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        minMatch === r.value
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Salary (Static Reference)
                </label>
                <div className="space-y-1">
                  {["Any Amount", "Market Rate"].map((r, idx) => (
                    <button
                      key={r}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 transition-colors ${idx === 0 ? "bg-slate-50 font-semibold" : ""}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Found <span className="font-bold text-slate-900">{total}</span>{" "}
          {total === 1 ? "position" : "positions"}
          {searchTerm && (
            <>
              {" "}
              for{" "}
              <span className="font-semibold text-blue-600">
                "{searchTerm}"
              </span>
            </>
          )}
        </p>
        <p className="text-xs text-slate-400">
          Sorted by:{" "}
          <span className="text-slate-600 font-medium capitalize">
            {sortBy === "match_score"
              ? "Best Match"
              : sortBy === "salary_med"
                ? "Highest Salary"
                : "Most Recent"}
          </span>
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p className="text-sm">Fetching best opportunities...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">No jobs found</h3>
          <p className="text-sm text-slate-500">
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedType("All");
              setSelectedExp("Any Level");
              setMinMatch(undefined);
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link
              key={job.job_id}
              href={`/jobs/${job.job_id}`}
              className="group block bg-white rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 border border-slate-200">
                  <Building2 className="w-6 h-6 text-slate-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {job.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColors[job.work_type || ""] || "bg-slate-100 text-slate-600"}`}
                        >
                          {job.work_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Building2 className="w-3.5 h-3.5" />
                          {job.company.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location || "N/A"}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {formatSalaryRange(
                            job.salary?.min_salary!,
                            job.salary?.max_salary!,
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {job.listed_time
                            ? new Date(job.listed_time).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${matchColor(job.match_score)}`}
                      >
                        {job.match_score !== null
                          ? `${job.match_score}% Match`
                          : "Not Analyzed"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const isJobSaved = !!(job as any).is_saved;
                          handleToggleSaveJobInList(job.job_id, isJobSaved);
                        }}
                        disabled={processingJobId === job.job_id}
                        className={`p-2 border rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                          (job as any).is_saved
                            ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900"
                            : "border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:border-slate-800"
                        }`}
                      >
                        <BookmarkPlus
                          className={`w-4 h-4 ${
                            (job as any).is_saved
                              ? "fill-amber-500 text-amber-500"
                              : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill.skill_id}
                        className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        {skill.skill_name}
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

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-100">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {getPaginationRange().map((pageNumber, index) => {
              if (pageNumber === "...") {
                return (
                  <span
                    key={`dots-${index}`}
                    className="w-9 h-9 flex items-center justify-center text-xs font-semibold text-slate-400 select-none"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={`page-${pageNumber}`}
                  onClick={() => setCurrentPage(Number(pageNumber))}
                  className={`w-9 h-9 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    currentPage === pageNumber
                      ? "bg-blue-600 text-white shadow-sm font-bold"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
