'use client';

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Filter, Download, ChevronDown } from 'lucide-react';

// Mock salary data by role and experience level
const salaryDataByRole = [
  { role: 'Junior Developer', min: 15, max: 25, avg: 20, count: 1250 },
  { role: 'Mid-level Developer', min: 25, max: 40, avg: 32, count: 980 },
  { role: 'Senior Developer', min: 40, max: 60, avg: 50, count: 650 },
  { role: 'Tech Lead', min: 55, max: 75, avg: 65, count: 320 },
  { role: 'Engineering Manager', min: 60, max: 85, avg: 72, count: 280 },
  { role: 'Principal Engineer', min: 75, max: 120, avg: 95, count: 150 },
];

const salaryTrendData = [
  { month: 'Jan', junior: 18, mid: 28, senior: 45, lead: 60 },
  { month: 'Feb', junior: 18.5, mid: 28.5, senior: 46, lead: 61 },
  { month: 'Mar', junior: 19, mid: 29, senior: 47, lead: 62 },
  { month: 'Apr', junior: 19.5, mid: 30, senior: 48, lead: 63 },
  { month: 'May', junior: 20, mid: 31, senior: 49, lead: 64 },
  { month: 'Jun', junior: 20.5, mid: 32, senior: 50, lead: 65 },
];

const salaryByLocation = [
  { location: 'Silicon Valley', salary: 95, jobs: 1250 },
  { location: 'New York', salary: 85, jobs: 890 },
  { location: 'Seattle', salary: 80, jobs: 720 },
  { location: 'Austin', salary: 75, jobs: 650 },
  { location: 'Boston', salary: 78, jobs: 580 },
  { location: 'Denver', salary: 72, jobs: 420 },
];

const salaryByTech = [
  { tech: 'TypeScript', salary: 75, jobs: 2100 },
  { tech: 'React', salary: 72, jobs: 1980 },
  { tech: 'Node.js', salary: 70, jobs: 1820 },
  { tech: 'Python', salary: 68, jobs: 1650 },
  { tech: 'AWS', salary: 82, jobs: 1400 },
  { tech: 'Go', salary: 85, jobs: 890 },
];

const industryDistribution = [
  { name: 'Tech/Software', value: 45, color: '#8b5cf6' },
  { name: 'Finance/FinTech', value: 25, color: '#06b6d4' },
  { name: 'E-commerce', value: 15, color: '#10b981' },
  { name: 'Healthcare', value: 10, color: '#f59e0b' },
  { name: 'Other', value: 5, color: '#64748b' },
];

interface SalaryFilter {
  role: string;
  experience: string;
  location: string;
  tech: string;
}

export function SalaryInsights() {
  const [filters, setFilters] = useState<SalaryFilter>({
    role: 'All Roles',
    experience: 'All Levels',
    location: 'All Locations',
    tech: 'All Skills',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof SalaryFilter, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Salary Insights</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Market salary analysis based on 25,000 job postings</p>
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
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">Filters</h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="ml-auto flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Role</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:border-slate-500"
            >
              <option>All Roles</option>
              {salaryDataByRole.map(r => (
                <option key={r.role} value={r.role}>{r.role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Location</label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:border-slate-500"
            >
              <option>All Locations</option>
              {salaryByLocation.map(l => (
                <option key={l.location} value={l.location}>{l.location}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Tech Stack</label>
            <select
              value={filters.tech}
              onChange={(e) => handleFilterChange('tech', e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:border-slate-500"
            >
              <option>All Skills</option>
              {salaryByTech.map(t => (
                <option key={t.tech} value={t.tech}>{t.tech}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Experience</label>
            <select
              value={filters.experience}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
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
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Salary</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">$65K</p>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">+5.2% vs last year</p>
            </div>
            <div className="rounded-full bg-gradient-to-br from-green-50 to-emerald-50 p-3 dark:from-green-900/20 dark:to-emerald-900/20">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Median Salary</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">$62K</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">50th percentile</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">75th Percentile</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">$85K</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Top 25% earn this+</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Open Jobs</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">25K</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Across all roles</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Salary by Role */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Salary Ranges by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryDataByRole}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="role" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
              <YAxis label={{ value: 'Salary (K USD)', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#fff',
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

        {/* Salary Trends */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Salary Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salaryTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Salary (K USD)', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
                formatter={(value) => `$${value}K`}
              />
              <Legend />
              <Line type="monotone" dataKey="junior" stroke="#10b981" name="Junior" />
              <Line type="monotone" dataKey="mid" stroke="#8b5cf6" name="Mid-level" />
              <Line type="monotone" dataKey="senior" stroke="#06b6d4" name="Senior" />
              <Line type="monotone" dataKey="lead" stroke="#f59e0b" name="Tech Lead" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Salary by Location */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Average Salary by Location</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryByLocation} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" />
              <YAxis dataKey="location" type="category" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
                formatter={(value) => `$${value}K`}
              />
              <Bar dataKey="salary" fill="#8b5cf6" name="Average Salary (K USD)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tech Stack Impact */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Highest Paying Skills</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryByTech}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="tech" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
              <YAxis label={{ value: 'Salary (K USD)', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
                formatter={(value) => `$${value}K`}
              />
              <Bar dataKey="salary" fill="#06b6d4" name="Average Salary" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Industry Distribution */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Job Distribution by Industry</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={industryDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} ${value}%`} outerRadius={80} fill="#8b5cf6" dataKey="value">
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
              <div key={item.name} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/20">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300">💡 Key Insight</h4>
          <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
            Developers with Go proficiency earn 18% more than those with only Python skills. Consider adding Go to your skill set for a salary boost.
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/20">
          <h4 className="font-semibold text-amber-900 dark:text-amber-300">📈 Market Trend</h4>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
            Tech salaries have grown 5.2% YoY. Senior roles have the highest growth at 7.1%, indicating strong demand for experienced developers.
          </p>
        </div>
      </div>
    </div>
  );
}
