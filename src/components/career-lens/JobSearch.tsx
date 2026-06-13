"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
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
import { JobListItem } from "@/types/job-insight";
import ProfileApi from "@/api/profile";
import PersonalDashboardApi from "@/api/personal-dashboard";

type DisplayJobItem = JobListItem & { salary_text?: string };

const jobTypes = [
  { label: "Tất cả", value: "" },
  { label: "Toàn thời gian", value: "Full-time" },
  { label: "Làm việc từ xa", value: "Remote" },
  { label: "Linh hoạt", value: "Hybrid" },
  { label: "Bán thời gian", value: "Part-time" },
];

const experienceLevels = [
  { label: "Mọi cấp độ", value: "Any Level" },
  { label: "Junior", value: "Junior" },
  { label: "Cấp độ Trung bình", value: "Mid" },
  { label: "Senior", value: "Senior" },
];

const typeColors: Record<string, string> = {
  "Full-time": "bg-blue-100 text-blue-700",
  Remote: "bg-emerald-100 text-emerald-700",
  Hybrid: "bg-violet-100 text-violet-700",
  "Part-time": "bg-amber-100 text-amber-700",
  "Toàn thời gian": "bg-blue-100 text-blue-700",
  "Làm việc từ xa": "bg-emerald-100 text-emerald-700",
  "Linh hoạt": "bg-violet-100 text-violet-700",
  "Bán thời gian": "bg-amber-100 text-amber-700",
};

const workTypeLabels: Record<string, string> = {
  "Full-time": "Toàn thời gian",
  Remote: "Làm việc từ xa",
  Hybrid: "Linh hoạt",
  "Part-time": "Bán thời gian",
};

const VIEWED_JOB_IDS_STORAGE_KEY = "viewed_job_ids";

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
  if (!min && !max) return "Thỏa thuận";
  const toK = (val: number | string) => {
    const num = Number(val);
    return num >= 1000000
      ? Math.round(num / 1000000) + "M"
      : Math.round(num / 1000) + "K";
  };
  if (min && max) return `${toK(min)}–${toK(max)}`;
  return min ? `Từ ${toK(min)}` : `Đến ${toK(max!)}`;
};

export function JobSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedExp, setSelectedExp] = useState("Mọi cấp độ");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("match_score");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [minMatch, setMinMatch] = useState<number | undefined>(undefined);

  const [jobs, setJobs] = useState<DisplayJobItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);
  const [isRecommendedMode, setIsRecommendedMode] = useState(sortBy === "match_score");

  const loadJobs = useCallback(async () => {
    setLoading(true);

    // ── Chế độ "Phù hợp nhất": lấy từ API recommended-jobs (giống Jobs gợi ý ở dashboard) ──
    if (sortBy === "match_score") {
      setIsRecommendedMode(true);
      try {
        const [res, savedJobsRes] = await Promise.all([
          PersonalDashboardApi.getRecommendedJobs(),
          ProfileApi.getSavedJobs().catch(() => ({ data: [] })),
        ]);
        const savedJobIds = new Set(
          (savedJobsRes?.data || [])
            .map((item) => String(item.job?.job_id || ""))
            .filter(Boolean),
        );

        if (res?.data) {
          const mapped: DisplayJobItem[] = res.data.map((r) => {
            const rateNum = parseInt(r.match_rate ?? "", 10);
            return {
              job_id: r.job_id,
              title: r.title,
              company: { company_id: "", name: r.company_name, url: undefined },
              location: r.location,
              salary: null,
              salary_text: r.salary_text,
              skills: [],
              match_score: Number.isFinite(rateNum) ? rateNum : null,
              is_saved: savedJobIds.has(String(r.job_id)),
              // Job base fields
              company_id: null,
              skills_desc: null,
              description: null,
              formatted_experience_level: null,
              work_type: null,
              is_remote: false,
              listed_time: null,
              expiry_time: null,
              job_posting_url: null,
              scraped_at: null,
              applies: null,
              views: null,
              fingerprint: null,
              job_category: null,
              search_group: null,
              source_name: null,
              source_id: null,
            };
          });
          setJobs(mapped);
          setTotal(mapped.length);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Failed to load recommended jobs:", error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── Chế độ thông thường: gọi JobApi.findAll ──
    setIsRecommendedMode(false);
    try {
      let activeCvId: string | undefined = undefined;
      try {
        const profileRes = await ProfileApi.getMe();
        activeCvId =
          profileRes?.data?.default_cv?.cv_id ||
          profileRes?.data?.latest_cv?.cv_id ||
          profileRes?.data?.all_cvs?.[0]?.cv_id;
      } catch (cvErr) {
        console.error("Không lấy được CV mặc định:", cvErr);
      }

      const query: GetJobsQueryDto = {
        page: currentPage,
        limit: 10,
        sortBy: sortBy,
        sortOrder: "desc",
        ...(searchTerm && { q: searchTerm }),
        ...(selectedType && { work_type: selectedType }),
        ...(selectedExp !== "Mọi cấp độ" && { experience_level: selectedExp }),
        ...(activeCvId && { cv_id: activeCvId }),
        ...(minMatch !== undefined && { min_match: minMatch }),
      };

      const res = await JobApi.findAll(query);
      if (res && res.data) {
        const rawJobs = Array.isArray(res.data) ? res.data : res.data.data || [];
        setJobs(rawJobs);
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
        prevJobs.map((job: DisplayJobItem) =>
          job.job_id === jobId ? { ...job, is_saved: !currentIsSaved } : job,
        ),
      );
    } catch (error) {
      console.error("Lỗi thay đổi trạng thái lưu công việc:", error);
    } finally {
      setProcessingJobId(null);
    }
  };

  const trackViewedJob = useCallback((jobId: string) => {
    if (typeof window === "undefined") return;

    try {
      const rawValue = window.localStorage.getItem(
        VIEWED_JOB_IDS_STORAGE_KEY,
      );
      const parsedValue = rawValue ? JSON.parse(rawValue) : [];
      const viewedJobIds = Array.isArray(parsedValue)
        ? parsedValue.map(String)
        : [];
      const nextViewedJobIds = [
        jobId,
        ...viewedJobIds.filter((storedJobId) => storedJobId !== jobId),
      ];

      window.localStorage.setItem(
        VIEWED_JOB_IDS_STORAGE_KEY,
        JSON.stringify(nextViewedJobIds),
      );
    } catch (error) {
      console.error("Không thể lưu job đã xem:", error);
      window.localStorage.setItem(
        VIEWED_JOB_IDS_STORAGE_KEY,
        JSON.stringify([jobId]),
      );
    }
  }, []);

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
              placeholder="Tìm theo chức danh, công ty, kỹ năng hoặc vị trí..."
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
            Bộ lọc
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {jobTypes.map((t) => (
            <button
              key={t.value || "all"}
              onClick={() => setSelectedType(t.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedType === t.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
          <div className="w-px bg-slate-200 mx-1 h-4" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="match_score">Phù hợp nhất</option>
            <option value="salary_med">Lương cao nhất</option>
            <option value="listed_time">Gần đây nhất</option>
          </select>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Cấp độ kinh nghiệm
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
                  Điểm phù hợp tối thiểu
                </label>
                <div className="space-y-1">
                  {[
                    { label: "Bất kỳ phù hợp", value: undefined },
                    { label: "80%+ Phù hợp", value: 80 },
                    { label: "70%+ Phù hợp", value: 70 },
                    { label: "60%+ Phù hợp", value: 60 },
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
                  Lương (Tham khảo)
                </label>
                <div className="space-y-1">
                  {["Bất kỳ mức lương", "Mức thị trường"].map((r, idx) => (
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

      {isRecommendedMode && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-xs text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
          <span className="text-base">✨</span>
          <span>
            <strong>Công việc gợi ý từ phân tích CV của bạn</strong> — Chỉ hiển thị
            công việc có độ phù hợp ≥70% với CV mặc định.{" "}
            {total === 0 && !loading && (
              <span className="text-blue-500">
                Chưa có dữ liệu — hãy tải CV và chạy so khớp CV trước.
              </span>
            )}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {isRecommendedMode ? (
            <>
              <span className="font-bold text-slate-900">{total}</span> công
              việc phù hợp từ CV của bạn
            </>
          ) : (
            <>
              Tìm thấy <span className="font-bold text-slate-900">{total}</span>{" "}
              vị trí
              {searchTerm && (
                <>
                  {" "}
                  cho{" "}
                  <span className="font-semibold text-blue-600">
                    "{searchTerm}"
                  </span>
                </>
              )}
            </>
          )}
        </p>
        <p className="text-xs text-slate-400">
          Sắp xếp theo:{" "}
          <span className="text-slate-600 font-medium">
            {sortBy === "match_score"
              ? "Phù hợp nhất"
              : sortBy === "salary_med"
                ? "Lương cao nhất"
                : "Gần đây nhất"}
          </span>
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p className="text-sm">Đang tìm các cơ hội tốt nhất...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">
            Không tìm thấy công việc
          </h3>
          <p className="text-sm text-slate-500">
            Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedType("");
              setSelectedExp("Mọi cấp độ");
              setMinMatch(undefined);
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link
              key={job.job_id}
              href={`/jobs/${job.job_id}`}
              onClick={() => trackViewedJob(job.job_id)}
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
                        {job.work_type && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColors[job.work_type] || "bg-slate-100 text-slate-600"}`}
                          >
                            {workTypeLabels[job.work_type] || job.work_type}
                          </span>
                        )}
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
                          {(job as DisplayJobItem).salary_text
                            ? (job as DisplayJobItem).salary_text
                            : formatSalaryRange(
                                job.salary?.min_salary!,
                                job.salary?.max_salary!,
                              )}
                        </span>
                        {job.listed_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(job.listed_time).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${matchColor(job.match_score)}`}
                      >
                        {job.match_score !== null
                          ? `${job.match_score}% Phù hợp`
                          : "Chưa phân tích"}
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

                  {job.skills.length > 0 && (
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
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 mt-1 shrink-0 hidden md:block transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !isRecommendedMode && totalPages > 1 && (
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
