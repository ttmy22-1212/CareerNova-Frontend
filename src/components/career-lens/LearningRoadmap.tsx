"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Clock,
  Users,
  Star,
  ArrowRight,
  BookmarkPlus,
  Search,
  GraduationCap,
  Layers,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import LearningRoadmapApi from "@/api/learning-roadmap";
import SkillGapApi from "@/api/skill-gap";
import { CourseItemDto, LearningPathDto } from "@/types/learning-roadmap";
import { CategoryGapDto } from "@/types/skill-gap";
import { NextStepBanner } from "./NextStepBanner";
import { EmptyState } from "./EmptyState";
import { categoryColor } from "./chart-palette";

interface LearningRoadmapProps {
  selectedSkillFromDB?: string;
}

const PATHS_PREVIEW_COUNT = 6;

function useDebouncedValue<T>(value: T, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const formatLearners = (n: number): string | null => {
  if (!n || n <= 0) return null;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `${n}`;
};

export function LearningRoadmap({ selectedSkillFromDB }: LearningRoadmapProps) {
  const [learningPaths, setLearningPaths] = useState<LearningPathDto[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<CourseItemDto[]>(
    [],
  );

  const [pathsLoading, setPathsLoading] = useState<boolean>(true);
  const [recommendationsLoading, setRecommendationsLoading] =
    useState<boolean>(true);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [showAllPaths, setShowAllPaths] = useState(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 500);

  // Kỹ năng đang lọc (chip). Khởi tạo từ ?skill, đổi khi bấm chip "Kỹ năng cần học".
  const [gapSkills, setGapSkills] = useState<string[]>([]);
  const [activeSkill, setActiveSkill] = useState<string | null>(
    selectedSkillFromDB ?? null,
  );

  // Đồng bộ khi URL ?skill đổi
  useEffect(() => {
    setActiveSkill(selectedSkillFromDB ?? null);
  }, [selectedSkillFromDB]);

  // Lấy danh sách kỹ năng còn thiếu / khớp một phần để làm chip lọc nhanh
  useEffect(() => {
    SkillGapApi.getCategoryGaps(10)
      .then((res) => {
        const cats = ((res?.data as any)?.data ||
          res?.data ||
          []) as CategoryGapDto[];
        const names = cats
          .flatMap((c) => c.skills || [])
          .filter((s) => s.status !== "Matched")
          .sort((a, b) => (b.gap_score || 0) - (a.gap_score || 0))
          .map((s) => s.skill_name);
        setGapSkills([...new Set(names)].slice(0, 8));
      })
      .catch(() => setGapSkills([]));
  }, []);

  useEffect(() => {
    setPathsLoading(true);
    LearningRoadmapApi.getRoadmap({
      skill: activeSkill || undefined,
      limit: 50,
    })
      .then((res) => {
        const rawPaths: LearningPathDto[] = res?.learning_paths || [];
        setLearningPaths(rawPaths);
        if (rawPaths.length > 0) setExpandedPath(rawPaths[0].id);
        setPathsLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch dữ liệu roadmap từ API:", err);
        setLearningPaths([]);
        setPathsLoading(false);
      });
  }, [activeSkill]);

  useEffect(() => {
    setRecommendationsLoading(true);
    // KHÔNG gửi level: khóa học không có dữ liệu cấp độ thật (backend hardcode
    // 'Intermediate') → lọc theo level sẽ ra rỗng. Chỉ lọc theo kỹ năng.
    LearningRoadmapApi.getRecommendedCourses({
      skill: activeSkill || undefined,
      limit: 6,
    })
      .then((res) => {
        const rawData = (res?.data as any)?.data || res?.data || [];
        setRecommendedCourses(Array.isArray(rawData) ? rawData : []);
      })
      .catch((err) => {
        console.error("Lỗi fetch khóa học gợi ý từ API:", err);
        setRecommendedCourses([]);
      })
      .finally(() => setRecommendationsLoading(false));
  }, [activeSkill]);

  const filteredPaths = useMemo(() => {
    const q = debouncedSearchQuery.toLowerCase();
    let paths = [...learningPaths];
    if (q) {
      paths = paths.filter(
        (path) =>
          path.title.toLowerCase().includes(q) ||
          path.description.toLowerCase().includes(q) ||
          path.skill_key.toLowerCase().includes(q) ||
          path.courses.some(
            (course) =>
              course.title.toLowerCase().includes(q) ||
              course.skills.some((s) => s.toLowerCase().includes(q)),
          ),
      );
    }
    return paths;
  }, [debouncedSearchQuery, learningPaths]);

  // Khi không tìm kiếm: chỉ hiện một số lộ trình, kèm nút "Xem thêm"
  const displayLearningPaths = useMemo(() => {
    if (debouncedSearchQuery || showAllPaths) return filteredPaths;
    return filteredPaths.slice(0, PATHS_PREVIEW_COUNT);
  }, [filteredPaths, debouncedSearchQuery, showAllPaths]);

  // Search cũng áp cho khóa học lẻ để hành vi nhất quán với lộ trình
  const displayCourses = useMemo(() => {
    const q = debouncedSearchQuery.toLowerCase();
    if (!q) return recommendedCourses;
    return recommendedCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.provider.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q)),
    );
  }, [recommendedCourses, debouncedSearchQuery]);

  const handleToggleSave = async (courseId: string) => {
    try {
      const res = await LearningRoadmapApi.toggleSaveCourse({
        course_id: courseId,
      });
      if (res) {
        const isSavedNewStatus = res.is_saved;
        // Lưu CHỈ đổi trạng thái đã lưu — không đụng tới "tiến độ"
        const updateCourseStatus = (courses: CourseItemDto[]) =>
          courses.map((c) =>
            c.id === courseId ? { ...c, is_saved: isSavedNewStatus } : c,
          );
        setLearningPaths((prev) =>
          prev.map((path) => ({
            ...path,
            courses: updateCourseStatus(path.courses),
          })),
        );
        setRecommendedCourses((prev) => updateCourseStatus(prev));
      }
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái lưu khóa học:", err);
    }
  };

  const hasActiveFilter = !!debouncedSearchQuery;
  const clearFilters = () => setSearchQuery("");

  return (
    <div className="p-6 space-y-6">
      {/* ── Header mục đích: nhìn vào hiểu trang để làm gì ── */}
      <header className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 dark:border-blue-900/40 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            {activeSkill
              ? `Học để lấp kỹ năng “${activeSkill}”`
              : "Học để lấp khoảng trống kỹ năng"}
          </h1>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
            {activeSkill
              ? "Lộ trình và khóa học gợi ý cho kỹ năng bạn còn thiếu so với thị trường."
              : "Chọn 1 trong 2 cách: theo một lộ trình bài bản, hoặc học lẻ từng kỹ năng còn thiếu."}
          </p>
        </div>
      </header>

      {/* ── Chip kỹ năng cần học: bấm để lọc cả lộ trình lẫn khóa học ── */}
      {gapSkills.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Kỹ năng cần học:
          </span>
          <button
            onClick={() => setActiveSkill(null)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              !activeSkill
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            Tất cả
          </button>
          {gapSkills.map((skill) => (
            <button
              key={skill}
              onClick={() =>
                setActiveSkill(activeSkill === skill ? null : skill)
              }
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                activeSkill === skill
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      )}

      {/* ── Ô tìm kiếm chung (áp cho cả 2 mục) ── */}
      <div className="sticky top-0 z-20 -mx-1 rounded-xl border border-slate-100 bg-white/90 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kỹ năng hoặc khóa học, ví dụ: Python, Docker, React..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* ── Mục 1: Lộ trình theo chủ đề ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
            <Layers className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {debouncedSearchQuery
                ? `Lộ trình khớp “${debouncedSearchQuery}” (${filteredPaths.length})`
                : "Lộ trình theo chủ đề"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Học bài bản từ gốc đến nâng cao — phù hợp khi đi theo một hướng
              nghề.
            </p>
          </div>
        </div>

        {pathsLoading ? (
          <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
              >
                <div className="h-20 animate-pulse bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-2 p-5">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : displayLearningPaths.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="Chưa có lộ trình phù hợp"
            description={
              hasActiveFilter
                ? "Thử bỏ bớt bộ lọc hoặc từ khóa tìm kiếm."
                : "Hãy đối soát CV để hệ thống gợi ý lộ trình theo kỹ năng bạn còn thiếu."
            }
            ctaLabel={hasActiveFilter ? "Xoá bộ lọc" : "Đối soát CV"}
            ctaHref={hasActiveFilter ? undefined : "/cv-matching"}
            onCta={hasActiveFilter ? clearFilters : undefined}
          />
        ) : (
          <>
            <div className="grid items-start gap-4 grid-cols-1 xl:grid-cols-2 w-full">
              {displayLearningPaths.map((path, idx) => {
                const isExpanded = expandedPath === path.id;
                return (
                  <div
                    key={path.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 w-full min-w-0"
                    style={{ borderLeft: `4px solid ${categoryColor(idx)}` }}
                  >
                    {/* Header lộ trình — nhẹ, chỉ chấm màu nhận diện */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedPath(isExpanded ? null : path.id)
                      }
                      aria-expanded={isExpanded}
                      className="flex w-full items-start gap-3 p-5 text-left"
                    >
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl"
                        style={{ backgroundColor: `${categoryColor(idx)}1a` }}
                      >
                        {path.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-bold leading-snug text-slate-900 dark:text-white line-clamp-2">
                          {path.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2 dark:text-slate-400">
                          {path.description}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {path.courses.length} khóa học
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {path.duration}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Danh sách khóa học (mở/đóng) */}
                    {isExpanded && (
                      <div className="space-y-3 border-t border-slate-100 p-5 dark:border-slate-800">
                        {path.courses.map((course) => (
                          <div
                            key={course.id}
                            className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50 w-full min-w-0"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-sm font-bold leading-snug text-slate-900 dark:text-white line-clamp-2">
                                  {course.title}
                                </h4>
                                <span className="flex shrink-0 items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  {course.rating}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {course.provider} • {course.duration}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {course.skills.slice(0, 3).map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-3 flex items-center gap-2">
                                {course.source_url && (
                                  <button
                                    onClick={() =>
                                      window.open(course.source_url, "_blank")
                                    }
                                    className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                                  >
                                    Đi tới khóa học
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleToggleSave(course.id)}
                                  className={`rounded-lg border px-2.5 py-1.5 transition-all ${
                                    course.is_saved
                                      ? "border-amber-500 bg-amber-50 text-amber-500"
                                      : "border-slate-300 text-slate-500 hover:border-slate-400"
                                  }`}
                                  title={
                                    course.is_saved ? "Bỏ lưu" : "Lưu khóa học"
                                  }
                                >
                                  <BookmarkPlus
                                    className={`h-4 w-4 ${course.is_saved ? "fill-amber-500" : ""}`}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!debouncedSearchQuery &&
              filteredPaths.length > PATHS_PREVIEW_COUNT && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAllPaths((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {showAllPaths
                      ? "Thu gọn"
                      : `Xem thêm ${filteredPaths.length - PATHS_PREVIEW_COUNT} lộ trình`}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
          </>
        )}
      </section>

      {/* ── Mục 2: Khóa học lẻ ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/40">
            <BookOpen className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Khóa học lẻ gợi ý
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bổ sung nhanh một kỹ năng cụ thể bạn còn thiếu.
            </p>
          </div>
        </div>

        {recommendationsLoading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
              >
                <div className="h-24 animate-pulse bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : displayCourses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Chưa có khóa học gợi ý"
            description={
              debouncedSearchQuery
                ? "Không có khóa học khớp từ khóa — thử bỏ tìm kiếm."
                : "Đối soát CV để nhận khóa học cho từng kỹ năng bạn còn thiếu."
            }
            ctaLabel={debouncedSearchQuery ? "Xoá tìm kiếm" : "Đối soát CV"}
            ctaHref={debouncedSearchQuery ? undefined : "/cv-matching"}
            onCta={debouncedSearchQuery ? () => setSearchQuery("") : undefined}
          />
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
            {displayCourses.map((course) => {
              const learners = formatLearners(course.learners);
              const isFree = !course.price || course.price <= 0;
              return (
                <div
                  key={course.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 w-full min-w-0"
                >
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold leading-snug text-slate-900 dark:text-white line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                          {course.provider}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          isFree
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {isFree ? "Miễn phí" : `$${course.price}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {course.rating}
                      </span>
                      {learners && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {learners}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {course.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto flex gap-2 pt-1">
                      <button
                        onClick={() =>
                          course.source_url &&
                          window.open(course.source_url, "_blank")
                        }
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                      >
                        Đi tới khóa học
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleSave(course.id)}
                        className={`rounded-lg border px-3 py-2 transition-all ${
                          course.is_saved
                            ? "border-amber-500 bg-amber-50 text-amber-500"
                            : "border-slate-300 text-slate-500 hover:border-slate-400"
                        }`}
                        title={course.is_saved ? "Bỏ lưu" : "Lưu khóa học"}
                      >
                        <BookmarkPlus
                          className={`h-4 w-4 ${course.is_saved ? "fill-amber-500" : ""}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <NextStepBanner
        href="/jobs"
        title="Sẵn sàng ứng tuyển?"
        desc="Khám phá các việc làm phù hợp nhất với hồ sơ và kỹ năng của bạn."
        cta="Tìm việc phù hợp"
      />
    </div>
  );
}
