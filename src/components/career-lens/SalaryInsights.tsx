"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Filter, Download, ChevronDown } from "lucide-react";
import SalaryApi from "@/api/salary";
import { SalarySummaryDto } from "@/types/salary";

interface SalaryFilter {
  role: string;
  experience: string;
  location: string;
  tech: string;
}

export function SalaryInsights() {
  const [filters, setFilters] = useState<SalaryFilter>({
    role: "All Roles",
    experience: "All Levels",
    location: "All Locations",
    tech: "All Skills",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // --- STATE DỮ LIỆU THẬT ---
  const [summary, setSummary] = useState<SalarySummaryDto | null>(null);
  const [salaryDataByRole, setSalaryDataByRole] = useState<any[]>([]);
  const [salaryTrendData, setSalaryTrendData] = useState<any[]>([]);
  const [salaryByLocation, setSalaryByLocation] = useState<any[]>([]);
  const [salaryByTech, setSalaryByTech] = useState<any[]>([]);

  // Giữ nguyên mảng màu Industry của thiết kế cũ
  const industryDistribution = [
    { name: "Tech/Software", value: 45, color: "#8b5cf6" },
    { name: "Finance/FinTech", value: 25, color: "#06b6d4" },
    { name: "E-commerce", value: 15, color: "#10b981" },
    { name: "Healthcare", value: 10, color: "#f59e0b" },
    { name: "Other", value: 5, color: "#64748b" },
  ];

  // Helper format VND về $K cho khớp UI cũ
  const toK = (val: number) => {
    if (!val || val === 0) return "0";
    return Math.round(val / 1000); // Ví dụ: 25,000,000 -> 25000 (hiển thị kèm chữ K trong UI)
  };

  const fetchData = useCallback(async () => {
    try {
      const apiFilters = {
        role: filters.role === "All Roles" ? undefined : filters.role,
        location:
          filters.location === "All Locations" ? undefined : filters.location,
        level:
          filters.experience === "All Levels" ? undefined : filters.experience,
      };

      const [resSum, resRole, resLoc, resSkill, resTrend] = await Promise.all([
        SalaryApi.getSummary(apiFilters),
        SalaryApi.getByRole(apiFilters),
        SalaryApi.getByLocation(apiFilters),
        SalaryApi.getBySkill(apiFilters),
        SalaryApi.getTrend(apiFilters),
      ]);

      if (resSum.data) setSummary(resSum.data);

      if (resRole.data) {
        setSalaryDataByRole(
          resRole.data.map((d) => ({
            role: d.role,
            min: toK(d.min_salary),
            max: toK(d.max_salary),
            avg: toK(d.avg_salary),
            count: d.sample_count,
          })),
        );
      }

      if (resLoc.data) {
        setSalaryByLocation(
          resLoc.data.map((d) => ({
            location: d.location,
            salary: toK(d.avg_salary),
            jobs: d.job_count,
          })),
        );
      }

      if (resSkill.data) {
        setSalaryByTech(
          resSkill.data.map((d) => ({
            tech: d.skill_name,
            salary: toK(d.avg_salary),
            jobs: d.job_count,
          })),
        );
      }

      if (resTrend.data) {
        // Logic gộp tháng để vẽ 4 đường Line
        const pivot = resTrend.data.reduce((acc: any[], curr) => {
          let monthData = acc.find((item) => item.month === curr.month);
          if (!monthData) {
            monthData = { month: curr.month };
            acc.push(monthData);
          }
          const lvl = curr.level.toLowerCase();
          if (lvl.includes("junior")) monthData.junior = toK(curr.avg_salary);
          else if (lvl.includes("mid")) monthData.mid = toK(curr.avg_salary);
          else if (lvl.includes("senior"))
            monthData.senior = toK(curr.avg_salary);
          else monthData.lead = toK(curr.avg_salary);
          return acc;
        }, []);
        setSalaryTrendData(pivot);
      }
    } catch (error) {
      console.error(error);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key: keyof SalaryFilter, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Salary Insights
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Market salary analysis based on{" "}
            {summary?.open_jobs_count.toLocaleString() || "25,000"} job postings
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-slate-500" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">
            Filters
          </h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="ml-auto flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400"
          >
            {showAdvanced ? "Hide" : "Show"} Advanced
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:border-slate-500"
            >
              <option>All Roles</option>
              {salaryDataByRole.map((r) => (
                <option key={r.role} value={r.role}>
                  {r.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Location
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:border-slate-500"
            >
              <option>All Locations</option>
              {salaryByLocation.map((l) => (
                <option key={l.location} value={l.location}>
                  {l.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Tech Stack
            </label>
            <select
              value={filters.tech}
              onChange={(e) => handleFilterChange("tech", e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:border-slate-500"
            >
              <option>All Skills</option>
              {salaryByTech.map((t) => (
                <option key={t.tech} value={t.tech}>
                  {t.tech}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Experience
            </label>
            <select
              value={filters.experience}
              onChange={(e) => handleFilterChange("experience", e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:border-slate-500"
            >
              <option>All Levels</option>
              <option>0-2 Years</option>
              <option>2-5 Years</option>
              <option>5-10 Years</option>
              <option>10+ Years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Average Salary
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                ${toK(summary?.average_salary || 0)}K
              </p>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                +{summary?.salary_growth_percentage || 0}% vs last year
              </p>
            </div>
            <div className="rounded-full bg-gradient-to-br from-green-50 to-emerald-50 p-3 dark:from-green-900/20 dark:to-emerald-900/20">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Median Salary
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              ${toK(summary?.median_salary || 0)}K
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              50th percentile
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              75th Percentile
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              ${toK(summary?.percentile_75 || 0)}K
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Top 25% earn this+
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Open Jobs
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {toK(summary?.open_jobs_count || 0)}K
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Across all roles
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Salary Ranges by Role
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryDataByRole}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="role"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                label={{
                  value: "Salary (K USD)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                  color: "#fff",
                }}
                formatter={(value) => `$${value}K`}
              />
              <Legend />
              <Bar dataKey="min" fill="#94a3b8" name="Minimum" />
              <Bar dataKey="avg" fill="#8b5cf6" name="Average" />
              <Bar dataKey="max" fill="#06b6d4" name="Maximum" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Salary Trend (6 months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salaryTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" />
              <YAxis
                label={{
                  value: "Salary (K USD)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                  color: "#fff",
                }}
                formatter={(value) => `$${value}K`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="junior"
                stroke="#10b981"
                name="Junior"
              />
              <Line
                type="monotone"
                dataKey="mid"
                stroke="#8b5cf6"
                name="Mid-level"
              />
              <Line
                type="monotone"
                dataKey="senior"
                stroke="#06b6d4"
                name="Senior"
              />
              <Line
                type="monotone"
                dataKey="lead"
                stroke="#f59e0b"
                name="Tech Lead"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Average Salary by Location
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryByLocation} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" />
              <YAxis
                dataKey="location"
                type="category"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                  color: "#fff",
                }}
                formatter={(value) => `$${value}K`}
              />
              <Bar
                dataKey="salary"
                fill="#8b5cf6"
                name="Average Salary (K USD)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Highest Paying Skills
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryByTech}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="tech"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                label={{
                  value: "Salary (K USD)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                  color: "#fff",
                }}
                formatter={(value) => `$${value}K`}
              />
              <Bar dataKey="salary" fill="#06b6d4" name="Average Salary" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Job Distribution by Industry
        </h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={industryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8b5cf6"
                  dataKey="value"
                >
                  {industryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {industryDistribution.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/20">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300">
            💡 Key Insight
          </h4>
          <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
            Developers with Go proficiency earn 18% more than those with only
            Python skills. Consider adding Go to your skill set for a salary
            boost.
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/20">
          <h4 className="font-semibold text-amber-900 dark:text-amber-300">
            📈 Market Trend
          </h4>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
            Tech salaries have grown 5.2% YoY. Senior roles have the highest
            growth at 7.1%, indicating strong demand for experienced developers.
          </p>
        </div>
      </div>
    </div>
  );
}
