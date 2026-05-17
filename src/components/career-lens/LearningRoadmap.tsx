"use client";

import React, { useState, useEffect } from "react";
import { Clock, Users, Star, ArrowRight, Zap } from "lucide-react";

interface Course {
  id: string;
  title: string;
  provider: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  learners: number;
  progress: number;
  skills: string[];
  price: string;
  image: string;
  source_url?: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  courses: Course[];
  icon: string;
  color: string;
  difficulty: string;
  skill_key?: string;
}

interface LearningRoadmapProps {
  selectedSkillFromDB?: string;
}

export function LearningRoadmap({ selectedSkillFromDB }: LearningRoadmapProps) {
  const [masterLearningPaths, setMasterLearningPaths] = useState<
    LearningPath[]
  >([]);
  const [masterRecommendedCourses, setMasterRecommendedCourses] = useState<
    Course[]
  >([]);

  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<
    "All" | "Beginner" | "Intermediate" | "Advanced"
  >("All");

  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetch("/course-data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải file dữ liệu");
        return res.json();
      })
      .then((data) => {
        const gradients = [
          "from-violet-500 to-purple-600",
          "from-blue-500 to-cyan-600",
          "from-orange-500 to-red-600",
          "from-emerald-500 to-teal-600",
        ];

        const getPathIcon = (iconText: string) => {
          switch (iconText?.toLowerCase()) {
            case "rocket":
              return "🚀";
            case "brain":
              return "🧠";
            case "laptop":
              return "💻";
            case "database":
              return "🗄️";
            default:
              return "📊";
          }
        };

        let rawPaths = data.learning_paths || [];

        if (selectedSkillFromDB) {
          rawPaths = rawPaths.filter((p: any) =>
            p.skill_key
              ?.toLowerCase()
              .includes(selectedSkillFromDB.toLowerCase()),
          );
        }

        const mappedPaths: LearningPath[] = rawPaths.map(
          (path: any, index: number) => ({
            id: path.path_id,
            title: path.path_title,
            description: path.path_description,
            duration: path.estimated_duration_months || "2 months",
            progress: path.path_progress_percent || 0,
            difficulty: path.path_level || "Advanced",
            icon: getPathIcon(path.path_icon),
            color: gradients[index % gradients.length],
            courses: (path.courses_in_path || []).map((course: any) => ({
              id: course.course_id,
              title: course.course_title,
              provider: course.provider_name,
              duration: `${course.duration_hours}h`,
              level: "Intermediate",
              rating: course.rating || 4.5,
              learners: 85000,
              progress: course.user_course_progress || 0,
              skills: course.skills_tags || [],
              price: `$${course.price || "Free"}`,
              image: course.provider_name === "Coursera" ? "⚛️" : "🟢",
              source_url: course.source_url,
            })),
          }),
        );

        const rawRecs = data.recommended_courses || [];
        const mappedRecs: Course[] = rawRecs.map((course: any) => {
          let learnersNum = 45000;
          if (typeof course.total_learners === "string") {
            learnersNum =
              parseFloat(course.total_learners.replace("K", "")) * 1000;
          } else if (typeof course.total_learners === "number") {
            learnersNum = course.total_learners;
          }

          return {
            id: course.course_id,
            title: course.course_title,
            provider: course.provider_name,
            duration: `${course.duration_hours}h`,
            level: "Intermediate",
            rating: course.rating || 4.5,
            learners: learnersNum,
            progress: 0,
            skills: course.skills_tags || [],
            price: course.price ? `$${course.price}` : "Free",
            image: course.thumbnail_icon === "triangle" ? "📘" : "▲",
            source_url: course.source_url,
          };
        });

        setMasterLearningPaths(mappedPaths);
        setMasterRecommendedCourses(mappedRecs);

        setLearningPaths(mappedPaths.slice(0, 6));
        setRecommendedCourses(mappedRecs.slice(0, 6));
        if (mappedPaths.length > 0) {
          setExpandedPath(mappedPaths[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch dữ liệu:", err);
        setLoading(false);
      });
  }, [selectedSkillFromDB]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setLearningPaths(masterLearningPaths.slice(0, 6));
      setRecommendedCourses(masterRecommendedCourses.slice(0, 6));
    } else {
      const lowerQuery = searchQuery.toLowerCase();

      const filteredPaths = masterLearningPaths.filter(
        (path) =>
          path.title.toLowerCase().includes(lowerQuery) ||
          path.courses.some((c) =>
            c.skills.some((s) => s.toLowerCase().includes(lowerQuery)),
          ),
      );

      const filteredRecs = masterRecommendedCourses.filter(
        (course) =>
          course.title.toLowerCase().includes(lowerQuery) ||
          course.skills.some((s) => s.toLowerCase().includes(lowerQuery)),
      );

      setLearningPaths(filteredPaths);
      setRecommendedCourses(filteredRecs);
    }
  }, [searchQuery, masterLearningPaths, masterRecommendedCourses]);

  const filteredRecommended = recommendedCourses.filter((course) =>
    selectedLevel === "All" ? true : course.level === selectedLevel,
  );

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

                {/* Courses Preview/List */}
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
                            {course.source_url && (
                              <button
                                onClick={() =>
                                  window.open(course.source_url, "_blank")
                                }
                                className="mt-3 text-xs text-violet-600 hover:underline font-medium block"
                              >
                                Go to course website →
                              </button>
                            )}
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
              <option>All</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>

        {filteredRecommended.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
            No matching recommended courses found.
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
            {filteredRecommended.map((course) => (
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
                  <button
                    onClick={() =>
                      course.source_url &&
                      window.open(course.source_url, "_blank")
                    }
                    className="w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 dark:hover:bg-violet-500"
                  >
                    Start Learning • {course.price}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
