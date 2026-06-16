"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Clock, Users, Star, ArrowRight, BookmarkPlus } from "lucide-react";
import LearningRoadmapApi from "@/api/learning-roadmap";
import { CourseItemDto, LearningPathDto } from "@/types/learning-roadmap";
import { NextStepBanner } from "./NextStepBanner";

interface LearningRoadmapProps {
  selectedSkillFromDB?: string;
}

type RoadmapLevel = "All" | "Beginner" | "Intermediate" | "Advanced";

const levelOptions: Array<{ value: RoadmapLevel; label: string }> = [
  { value: "All", label: "Tất cả" },
  { value: "Beginner", label: "Cơ bản" },
  { value: "Intermediate", label: "Trung cấp" },
  { value: "Advanced", label: "Nâng cao" },
];

function useDebouncedValue<T>(value: T, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const getLevelLabel = (level: string) =>
  levelOptions.find((option) => option.value === level)?.label || level;

export function LearningRoadmap({ selectedSkillFromDB }: LearningRoadmapProps) {
  // Quản lý dữ liệu trả về từ API Backend
  const [learningPaths, setLearningPaths] = useState<LearningPathDto[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<CourseItemDto[]>(
    [],
  );

  const [pathsLoading, setPathsLoading] = useState<boolean>(true);
  const [recommendationsLoading, setRecommendationsLoading] =
    useState<boolean>(true);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  // Trạng thái các bộ lọc trực tiếp
  const [selectedLevel, setSelectedLevel] = useState<RoadmapLevel>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 500);

  useEffect(() => {
    setPathsLoading(true);

    const filters = {
      skill: selectedSkillFromDB || undefined,
      limit: 50,
    };

    LearningRoadmapApi.getRoadmap(filters)
      .then((res) => {
        if (!res) {
          setLearningPaths([]);
          setPathsLoading(false);
          return;
        }

        const rawPaths: LearningPathDto[] = res?.learning_paths || [];

        // Cập nhật lại state cho UI render
        setLearningPaths(rawPaths);

        if (rawPaths.length > 0) {
          setExpandedPath(rawPaths[0].id);
        }

        setPathsLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch dữ liệu roadmap từ API:", err);
        setLearningPaths([]);
        setPathsLoading(false);
      });
  }, [selectedSkillFromDB]);

  useEffect(() => {
    setRecommendationsLoading(true);

    LearningRoadmapApi.getRecommendedCourses({
      skill: selectedSkillFromDB || undefined,
      level: selectedLevel,
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
  }, [selectedSkillFromDB, selectedLevel]);

  const displayLearningPaths = useMemo(() => {
    const lowerQuery = debouncedSearchQuery.toLowerCase();

    let displayPaths = [...learningPaths];

    if (selectedLevel !== "All") {
      displayPaths = displayPaths.filter(
        (path) => path.difficulty === selectedLevel,
      );
    }

    if (lowerQuery) {
      displayPaths = displayPaths.filter(
        (path) =>
          path.title.toLowerCase().includes(lowerQuery) ||
          path.description.toLowerCase().includes(lowerQuery) ||
          path.skill_key.toLowerCase().includes(lowerQuery) ||
          path.courses.some(
            (course) =>
              course.title.toLowerCase().includes(lowerQuery) ||
              course.skills.some((skill) =>
                skill.toLowerCase().includes(lowerQuery),
              ),
          ),
      );
    } else {
      displayPaths = displayPaths.slice(0, 6);
    }

    return displayPaths;
  }, [debouncedSearchQuery, learningPaths, selectedLevel]);

  // 2. Hàm xử lý Bookmark (Lưu / Hủy lưu khóa học)
  const handleToggleSave = async (courseId: string) => {
    try {
      const res = await LearningRoadmapApi.toggleSaveCourse({
        course_id: courseId,
      });
      if (res) {
        const isSavedNewStatus = res.is_saved;

        // Cập nhật trực tiếp trạng thái trên UI để không cần phải load lại toàn bộ trang
        const updateCourseStatus = (courses: CourseItemDto[]) =>
          courses.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  is_saved: isSavedNewStatus,
                  progress: isSavedNewStatus ? 100 : 0,
                }
              : c,
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

  if (pathsLoading && recommendationsLoading) {
    return (
      <div className="p-6 text-slate-600 dark:text-slate-400">
        Đang tải dữ liệu khóa học và lộ trình...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {selectedSkillFromDB && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900">
              Lộ trình cho “{selectedSkillFromDB}”
            </p>
            <p className="text-xs text-blue-700">
              Gợi ý khóa học vì đây là kỹ năng bạn còn thiếu so với thị trường.
            </p>
          </div>
        </div>
      )}

      {/* Lộ trình học */}
      <div className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {debouncedSearchQuery
            ? `Kết quả tìm kiếm "${debouncedSearchQuery}" (${displayLearningPaths.length})`
            : "Lộ trình học"}
        </h2>
        <div className="w-full">
          <input
            type="text"
            placeholder="Tìm kỹ năng hoặc khóa học cụ thể, ví dụ: Python, Docker, React..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-violet-400"
          />
        </div>
        {pathsLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
            Đang tải lộ trình học...
          </p>
        ) : displayLearningPaths.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
            Không tìm thấy lộ trình học phù hợp.
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-1 xl:grid-cols-2 w-full">
            {displayLearningPaths.map((path) => (
              <div
                key={path.id}
                className="cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 w-full min-w-0"
                onClick={() =>
                  setExpandedPath(expandedPath === path.id ? null : path.id)
                }
              >
                {/* Header */}
                <div
                  className={`bg-gradient-to-r ${path.color} p-6 text-white`}
                >
                  <div className="flex items-start justify-between gap-4 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 text-4xl">{path.icon}</div>
                      <h3 className="text-xl font-bold truncate">
                        {path.title}
                      </h3>
                      <p className="mt-1 text-sm opacity-90 line-clamp-2">
                        {path.description}
                      </p>
                    </div>
                    <span className="inline-block flex-shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                      {getLevelLabel(path.difficulty)}
                    </span>
                  </div>
                </div>

                <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                  <div className="grid gap-4 grid-cols-2 text-center">
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {path.courses.length}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Khóa học
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {path.duration}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Thời lượng
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="px-6 py-4">
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-600"
                      style={{ width: `${path.progress}%` }}
                    />
                  </div>
                </div>

                {/* Courses List */}
                <div
                  className="border-t border-slate-200 dark:border-slate-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  {expandedPath === path.id ? (
                    <div className="space-y-3 p-6">
                      {path.courses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-start gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50 w-full min-w-0"
                        >
                          <div className="flex-shrink-0 text-2xl">
                            {course.image}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                                  {course.title}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                  {course.provider} • {course.duration}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {course.skills.slice(0, 2).map((skill) => (
                                    <span
                                      key={skill}
                                      className="inline-block bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700 rounded dark:bg-violet-900/30 dark:text-violet-300"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 flex-shrink-0">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {course.rating}
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="h-1.5 flex-1 bg-slate-200 rounded-full dark:bg-slate-700 overflow-hidden mr-3 min-w-0">
                                <div
                                  className="h-full bg-green-500"
                                  style={{ width: `${course.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                {course.progress}%
                              </span>
                            </div>
                            <div className="mt-3 flex items-center gap-4">
                              {course.source_url && (
                                <button
                                  onClick={() =>
                                    window.open(course.source_url, "_blank")
                                  }
                                  className="text-xs text-violet-600 hover:underline font-medium"
                                >
                                  Mở trang khóa học →
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleSave(course.id)} // Giữ nguyên hàm cũ của bạn
                                className={`px-3 py-2 border rounded-lg transition-all ${course.is_saved ? "border-amber-500 text-amber-500 bg-amber-50" : "border-slate-300 text-slate-600"}`} // Sửa class màu trái tim (đỏ) thành màu của Job (hổ phách)
                                title={
                                  course.is_saved
                                    ? "Bỏ lưu"
                                    : "Lưu khóa học"
                                }
                              >
                                <BookmarkPlus
                                  className={`w-4 h-4 ${course.is_saved ? "fill-amber-500 text-amber-500" : ""}`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="px-6 py-4 flex items-center justify-between"
                      onClick={() => setExpandedPath(path.id)}
                    >
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Gồm {path.courses.length} khóa học
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Khóa học gợi ý */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Gợi ý dành cho bạn
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Lọc theo cấp độ:
            </span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as RoadmapLevel)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:border-slate-500"
            >
              {levelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {recommendationsLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
            Đang tải khóa học gợi ý...
          </p>
        ) : recommendedCourses.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
            Không tìm thấy khóa học gợi ý phù hợp.
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
            {recommendedCourses.map((course) => (
              <div
                key={course.id}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 w-full min-w-0"
              >
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-6 text-center text-4xl dark:from-slate-800 dark:to-slate-700">
                  {course.image}
                </div>
                <div className="p-4 space-y-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate">
                      {course.provider}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {course.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {course.rating}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                    <Users className="h-3 w-3" />
                    <span>
                      {(course.learners / 1000).toFixed(0)}K người học
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {course.skills.slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className="inline-block bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 rounded dark:bg-slate-800 dark:text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        course.source_url &&
                        window.open(course.source_url, "_blank")
                      }
                      className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 dark:hover:bg-violet-500"
                    >
                      Bắt đầu học •{" "}
                      {course.price > 0 ? `$${course.price}` : "Miễn phí"}
                    </button>
                    <button
                      onClick={() => handleToggleSave(course.id)}
                      className={`px-3 py-2 border rounded-lg transition-all ${course.is_saved ? "border-amber-500 text-amber-500 bg-amber-50" : "border-slate-300 text-slate-600"}`}
                      title={course.is_saved ? "Bỏ lưu" : "Lưu khóa học"}
                    >
                      <BookmarkPlus
                        className={`w-4 h-4 ${course.is_saved ? "fill-amber-500 text-amber-500" : ""}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NextStepBanner
        href="/jobs"
        title="Sẵn sàng ứng tuyển?"
        desc="Khám phá các việc làm phù hợp nhất với hồ sơ và kỹ năng của bạn."
        cta="Tìm việc phù hợp"
      />
    </div>
  );
}
