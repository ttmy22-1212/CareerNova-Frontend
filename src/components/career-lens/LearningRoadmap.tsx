'use client';

import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Clock, Users, Star, ArrowRight, Zap, Target } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  provider: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  learners: number;
  progress: number;
  skills: string[];
  price: string;
  image: string;
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
}

const learningPaths: LearningPath[] = [
  {
    id: 'full-stack',
    title: 'Full Stack Developer',
    description: 'Master frontend & backend development with modern technologies',
    duration: '6-8 months',
    progress: 45,
    difficulty: 'Advanced',
    icon: '🚀',
    color: 'from-violet-500 to-purple-600',
    courses: [
      {
        id: 'react-101',
        title: 'React Fundamentals & Hooks',
        provider: 'Udemy',
        duration: '40h',
        level: 'Beginner',
        rating: 4.8,
        learners: 125000,
        progress: 100,
        skills: ['React', 'JavaScript', 'JSX'],
        price: '$14.99',
        image: '⚛️',
      },
      {
        id: 'node-backend',
        title: 'Node.js Backend Development',
        provider: 'Coursera',
        duration: '60h',
        level: 'Intermediate',
        rating: 4.7,
        learners: 89000,
        progress: 60,
        skills: ['Node.js', 'Express', 'REST APIs'],
        price: '$39/mo',
        image: '🟢',
      },
      {
        id: 'database-design',
        title: 'Database Design & SQL',
        provider: 'LinkedIn Learning',
        duration: '35h',
        level: 'Intermediate',
        rating: 4.6,
        learners: 76000,
        progress: 0,
        skills: ['SQL', 'PostgreSQL', 'Database Design'],
        price: '$29/mo',
        image: '🗄️',
      },
    ],
  },
  {
    id: 'data-science',
    title: 'Data Science & ML',
    description: 'Learn machine learning and data analysis with Python',
    duration: '5-7 months',
    progress: 25,
    difficulty: 'Advanced',
    icon: '📊',
    color: 'from-blue-500 to-cyan-600',
    courses: [
      {
        id: 'python-basics',
        title: 'Python for Data Science',
        provider: 'DataCamp',
        duration: '45h',
        level: 'Beginner',
        rating: 4.8,
        learners: 156000,
        progress: 100,
        skills: ['Python', 'Pandas', 'NumPy'],
        price: '$35/mo',
        image: '🐍',
      },
      {
        id: 'ml-algorithms',
        title: 'Machine Learning Algorithms',
        provider: 'Coursera',
        duration: '50h',
        level: 'Advanced',
        rating: 4.9,
        learners: 98000,
        progress: 0,
        skills: ['ML', 'Scikit-learn', 'Model Training'],
        price: '$39/mo',
        image: '🤖',
      },
    ],
  },
  {
    id: 'cloud-architecture',
    title: 'Cloud Architecture',
    description: 'Master AWS, Azure, and GCP cloud platforms',
    duration: '4-6 months',
    progress: 10,
    difficulty: 'Advanced',
    icon: '☁️',
    color: 'from-orange-500 to-red-600',
    courses: [
      {
        id: 'aws-basics',
        title: 'AWS Solutions Architect',
        provider: 'A Cloud Guru',
        duration: '55h',
        level: 'Intermediate',
        rating: 4.7,
        learners: 112000,
        progress: 30,
        skills: ['AWS', 'EC2', 'S3', 'Lambda'],
        price: '$49/mo',
        image: '☁️',
      },
    ],
  },
];

const recommendedCourses: Course[] = [
  {
    id: 'typescript-course',
    title: 'TypeScript Advanced Patterns',
    provider: 'Frontend Masters',
    duration: '5h',
    level: 'Advanced',
    rating: 4.9,
    learners: 45000,
    progress: 0,
    skills: ['TypeScript', 'Type System', 'Advanced Types'],
    price: '$39',
    image: '📘',
  },
  {
    id: 'nextjs-course',
    title: 'Next.js 15 Full Course',
    provider: 'Vercel',
    duration: '8h',
    level: 'Intermediate',
    rating: 4.8,
    learners: 67000,
    progress: 0,
    skills: ['Next.js', 'Server Components', 'App Router'],
    price: '$29',
    image: '▲',
  },
  {
    id: 'devops-course',
    title: 'DevOps Fundamentals',
    provider: 'Linux Academy',
    duration: '12h',
    level: 'Intermediate',
    rating: 4.6,
    learners: 54000,
    progress: 0,
    skills: ['DevOps', 'Docker', 'Kubernetes'],
    price: '$34',
    image: '🐳',
  },
];

export function LearningRoadmap() {
  const [expandedPath, setExpandedPath] = useState<string | null>('full-stack');
  const [selectedLevel, setSelectedLevel] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');

  const totalProgress = Math.round(
    learningPaths.reduce((acc, path) => acc + path.progress, 0) / learningPaths.length
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Learning Roadmap</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Structured learning paths to advance your career</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-violet-100 px-4 py-2 dark:bg-violet-900/30">
          <Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <span className="text-sm font-semibold text-violet-900 dark:text-violet-300">Overall Progress: {totalProgress}%</span>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="h-2 bg-slate-100 dark:bg-slate-800">
          <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600" style={{ width: `${totalProgress}%` }} />
        </div>
      </div>

      {/* Learning Paths */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Learning Paths</h2>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {learningPaths.map((path) => (
            <div
              key={path.id}
              className="cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              onClick={() => setExpandedPath(expandedPath === path.id ? null : path.id)}
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${path.color} p-6 text-white`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-2 text-4xl">{path.icon}</div>
                    <h3 className="text-xl font-bold">{path.title}</h3>
                    <p className="mt-1 text-sm opacity-90">{path.description}</p>
                  </div>
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{path.difficulty}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                <div className="grid gap-4 grid-cols-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{path.courses.length}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Courses</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{path.duration}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Duration</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{path.progress}%</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Completed</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-6 py-4">
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600" style={{ width: `${path.progress}%` }} />
                </div>
              </div>

              {/* Courses Preview/List */}
              <div className="border-t border-slate-200 dark:border-slate-800">
                {expandedPath === path.id ? (
                  <div className="space-y-3 p-6">
                    {path.courses.map((course, idx) => (
                      <div key={course.id} className="flex items-start gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                        <div className="flex-shrink-0 text-2xl">{course.image}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 dark:text-white">{course.title}</h4>
                              <p className="text-xs text-slate-600 dark:text-slate-400">{course.provider} • {course.duration}</p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {course.skills.slice(0, 2).map(skill => (
                                  <span key={skill} className="inline-block bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700 rounded dark:bg-violet-900/30 dark:text-violet-300">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {course.rating}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="h-1.5 flex-1 bg-slate-200 rounded-full dark:bg-slate-700 overflow-hidden mr-3">
                              <div className="h-full bg-green-500" style={{ width: `${course.progress}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{course.progress}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-4 flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{path.courses.length} courses included</span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recommended for You</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Filter by level:</span>
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
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {recommendedCourses.map((course) => (
            <div key={course.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-6 text-center text-4xl dark:from-slate-800 dark:to-slate-700">
                {course.image}
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{course.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{course.provider}</p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-slate-600 dark:text-slate-400">{course.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                  <Users className="h-3 w-3" />
                  <span>{(course.learners / 1000).toFixed(0)}K learners</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {course.skills.slice(0, 2).map(skill => (
                    <span key={skill} className="inline-block bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 rounded dark:bg-slate-800 dark:text-slate-300">
                      {skill}
                    </span>
                  ))}
                </div>
                <button className="w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 dark:hover:bg-violet-500">
                  Start Learning • {course.price}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/20">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300">💡 Learning Tip</h4>
          <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
            Consistency is key! Dedicate 1-2 hours daily to learning. Studies show learners who practice daily retain 90% more information.
          </p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/20">
          <h4 className="font-semibold text-green-900 dark:text-green-300">🎯 Goal Tracking</h4>
          <p className="mt-2 text-sm text-green-800 dark:text-green-200">
            You're 45% through the Full Stack path! Complete the Database course next week to reach 60% completion.
          </p>
        </div>
      </div>
    </div>
  );
}
