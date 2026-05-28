"use client";

import React, { useState, useEffect } from "react";
import { Clock, Users, Star, ArrowRight, BookmarkPlus } from "lucide-react";
import LearningRoadmapApi from "@/api/learning-roadmap";
import { CourseItemDto, LearningPathDto } from "@/types/learning-roadmap";

interface LearningRoadmapProps {
  selectedSkillFromDB?: string;
}

export function LearningRoadmap({ selectedSkillFromDB }: LearningRoadmapProps) {
  // Quản lý dữ liệu trả về từ API Backend
  const [learningPaths, setLearningPaths] = useState<LearningPathDto[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<CourseItemDto[]>(
    [],
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  // Trạng thái các bộ lọc trực tiếp
  const [selectedLevel, setSelectedLevel] = useState<
    "All" | "Beginner" | "Intermediate" | "Advanced"
  >("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setLoading(true);

    const filters = {
      skill: selectedSkillFromDB || undefined,
      level: selectedLevel !== "All" ? selectedLevel : undefined,
    };

    LearningRoadmapApi.getRoadmap(filters)
      .then((res) => {
        console.log("ROADMAP RESPONSE:", res);

        if (!res) {
          setLearningPaths([]);
          setRecommendedCourses([]);
          setLoading(false);
          return;
        }

        const rawPaths: LearningPathDto[] = res?.learning_paths || [];
        const rawRecs: CourseItemDto[] = res?.recommended_courses || [];

        let displayPaths = [...rawPaths];
        let displayRecs = [...rawRecs];

        // Logic xử lý Search cục bộ giữ nguyên
        if (searchQuery.trim() !== "") {
          const lowerQuery = searchQuery.toLowerCase();

          displayPaths = displayPaths.filter(
            (path) =>
              path.title.toLowerCase().includes(lowerQuery) ||
              path.courses.some((c) =>
                c.skills.some((s) => s.toLowerCase().includes(lowerQuery)),
              ),
          );

          displayRecs = displayRecs.filter(
            (course) =>
              course.title.toLowerCase().includes(lowerQuery) ||
              course.skills.some((s) => s.toLowerCase().includes(lowerQuery)),
          );
        } else {
          // Giới hạn hiển thị 6 phần tử ban đầu khi không tìm kiếm
          displayPaths = displayPaths.slice(0, 6);
          displayRecs = displayRecs.slice(0, 6);
        }

        // Cập nhật lại state cho UI render
        setLearningPaths(displayPaths);
        setRecommendedCourses(displayRecs);

        if (displayPaths.length > 0) {
          setExpandedPath(displayPaths[0].id);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch dữ liệu roadmap từ API:", err);
        setLearningPaths([]);
        setRecommendedCourses([]);
        setLoading(false);
      });
  }, [selectedSkillFromDB, selectedLevel, searchQuery]);

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

  if (loading) {
    return (
      <div className="p-6 text-slate-600 dark:text-slate-400">
        Loading roadmap data...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Learning Paths */}
      <div className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {searchQuery
            ? `Search Results for "${searchQuery}" (${learningPaths.length})`
            : "Learning Paths"}
        </h2>
        <div className="w-full">
          <input
            type="text"
            placeholder="🔍 Search specific skills or courses (e.g. Python, Docker, React)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-violet-400"
          />
        </div>
        {learningPaths.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
            No matching learning paths found.
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-1 xl:grid-cols-2 w-full">
            {learningPaths.map((path) => (
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
                      {path.difficulty}
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
                        Courses
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {path.duration}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Duration
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
                                  Go to course website →
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleSave(course.id)} // Giữ nguyên hàm cũ của bạn
                                className={`px-3 py-2 border rounded-lg transition-all ${course.is_saved ? "border-amber-500 text-amber-500 bg-amber-50" : "border-slate-300 text-slate-600"}`} // Sửa class màu trái tim (đỏ) thành màu của Job (hổ phách)
                                title={
                                  course.is_saved ? "Unsave" : "Save Course"
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
                        {path.courses.length} courses included
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

      {/* Recommended Courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Recommended for You
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Filter by level:
            </span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as any)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:border-slate-500"
            >
              <option value="All">All</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {recommendedCourses.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
            No matching recommended courses found.
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
                    <span>{(course.learners / 1000).toFixed(0)}K learners</span>
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
                      Start Learning •{" "}
                      {course.price > 0 ? `$${course.price}` : "Free"}
                    </button>
                    <button
                      onClick={() => handleToggleSave(course.id)}
                      className={`px-3 py-2 border rounded-lg transition-all ${course.is_saved ? "border-amber-500 text-amber-500 bg-amber-50" : "border-slate-300 text-slate-600"}`}
                      title={course.is_saved ? "Unsave" : "Save Course"}
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
    </div>
  );
}
