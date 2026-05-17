"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Building2,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  BookmarkPlus,
  Share2,
  ExternalLink,
  ChevronRight,
  Loader2,
  Bookmark,
} from "lucide-react";
import JobApi from "@/api/job";
import CvApi from "@/api/cv";
import { JobDetailResponse } from "@/types/job-insight";
import ProfileApi from "@/api/profile";

const typeColors: Record<string, string> = {
  "Full-time": "bg-blue-100 text-blue-700",
  Remote: "bg-emerald-100 text-emerald-700",
  Hybrid: "bg-violet-100 text-violet-700",
};

export function JobDetail() {
  const params = useParams();
  const paramValues = params ? Object.values(params) : [];
  const id = Array.isArray(paramValues[0]) ? paramValues[0][0] : paramValues[0];
  const [data, setData] = useState<JobDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const formatSalary = (
    min: string | number | undefined,
    max: string | number | undefined,
  ) => {
    if (!min && !max) return "Negotiable";
    const toK = (val: string | number) => Math.round(Number(val) / 1000) + "K";
    if (min && max) return `$${toK(min)}–$${toK(max)}`;
    return min ? `$${toK(min)}+` : `Up to $${toK(max!)}`;
  };

  const loadJobDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      let activeCvId: string | undefined = undefined;
      try {
        const cvRes = await CvApi.getMyCvs();
        if (cvRes?.data && cvRes.data.length > 0) {
          activeCvId = cvRes.data[0].cv_id;
        }
      } catch (cvErr) {
        console.error("Error fetching CV:", cvErr);
      }

      const res = await JobApi.findOne(id, activeCvId);
      if (res && res.data) {
        setData(res.data);
        setIsSaved(!!(res.data as any).is_saved);
      }
    } catch (error) {
      console.error("Failed to load job detail:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadJobDetail();
  }, [loadJobDetail]);

  const job = data?.job;
  const company = data?.company;
  const salary = data?.salary;
  const skills = data?.skills || [];
  const match_breakdown = data?.match_breakdown;
  const industries = data?.industries || [];
  const benefits = data?.benefits || [];

  const isSkillInGroup = (group: any, skillName: string) => {
    if (!group || !Array.isArray(group)) return false;
    return group.some((item: any) =>
      typeof item === "string"
        ? item.toLowerCase() === skillName.toLowerCase()
        : item?.skill?.toLowerCase() === skillName.toLowerCase(),
    );
  };

  const responsibilities = useMemo(() => {
    if (!job?.title) return [];
    return [
      `Design and develop solutions according to ${job.title} best practices`,
      "Collaborate with cross-functional teams to define, design, and ship new features",
      "Write clean, maintainable, well-tested, and documented code",
      "Participate in code reviews and contribute to team knowledge sharing",
      "Optimize applications for maximum speed, scalability, and security",
    ];
  }, [job?.title]);

  const requirements = useMemo(() => {
    return [
      `${job?.formatted_experience_level || "3+ years"} of professional experience`,
      "Strong problem-solving and communication skills",
      "Bachelor's degree in Computer Science or equivalent experience",
    ];
  }, [job?.formatted_experience_level]);

  const handleToggleSaveJob = async () => {
    if (!id || saving) return;
    try {
      setSaving(true);
      if (isSaved) {
        const res = await ProfileApi.deleteSavedJob(id);
        if (res.message || res.data) {
          setIsSaved(false);
        }
      } else {
        const res = await ProfileApi.saveJob({ job_id: id });
        if (res.message || res.data) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error("Lỗi khi xử lý lưu/hủy lưu job:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) return <div className="p-6 text-center">Job not found.</div>;

  return (
    <div className="p-6 max-w-6xl">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-700 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Job Search
      </Link>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-5 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 mb-1">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-slate-600 font-medium">
                    {company?.name}
                  </span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <a
                    href={company?.url || "#"}
                    className="text-blue-600 text-sm hover:underline flex items-center gap-0.5"
                  >
                    {company?.url || "website.com"}{" "}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {job.location || "Remote"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    {job.work_type}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    {formatSalary(salary?.min_salary!, salary?.max_salary!)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Posted {new Date(job.listed_time!).toLocaleDateString()}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${typeColors[job.work_type!] || "bg-slate-100 text-slate-600"}`}
                  >
                    {job.work_type}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              <div
                className={`px-4 py-2 rounded-xl text-sm font-bold bg-blue-100 text-blue-700`}
              >
                Match Analysis Active
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleToggleSaveJob}
                  disabled={saving}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 ${
                    isSaved
                      ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900"
                      : "border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:border-slate-800"
                  }`}
                >
                  <BookmarkPlus
                    className={`w-5 h-5 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`}
                  />
                </button>
                <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 grid grid-cols-3 divide-x divide-slate-200">
          <div className="px-4 first:pl-0">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-semibold">Matched Skills</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(match_breakdown?.strong || []).map((s: any, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[11px] font-medium rounded"
                >
                  {typeof s === "string" ? s : s?.skill}
                </span>
              ))}
            </div>
          </div>
          <div className="px-4">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Partial Match</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(match_breakdown?.partial || []).map((s: any, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[11px] font-medium rounded"
                >
                  {typeof s === "string" ? s : s?.skill}
                </span>
              ))}
            </div>
          </div>
          <div className="px-4">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Missing Skills</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(match_breakdown?.missing || []).map((s: any, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-red-100 text-red-600 text-[11px] font-medium rounded"
                >
                  {typeof s === "string" ? s : s?.skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-3">Job Description</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Responsibilities</h2>
            <ul className="space-y-2.5">
              {responsibilities.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-slate-700"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Requirements</h2>
            <ul className="space-y-2.5">
              {requirements.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-slate-700"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
              {job.skills_desc && (
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  {job.skills_desc}
                </li>
              )}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Benefits & Perks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {benefits.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-3 bg-emerald-50 rounded-lg border border-emerald-100"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-sm text-slate-700">
                    {b.benefit_name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Apply by{" "}
                {job.expiry_time
                  ? new Date(job.expiry_time).toLocaleDateString()
                  : "May 31, 2026"}
              </span>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-200 mb-3">
              Apply Now
            </button>
            <Link
              href="/cv-matching"
              className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-xl font-semibold text-sm hover:bg-violet-100 transition-colors"
            >
              Match My CV <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s.skill_id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    isSkillInGroup(match_breakdown?.strong, s.skill_name)
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : isSkillInGroup(match_breakdown?.partial, s.skill_name)
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {s.skill_name}
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-sm bg-emerald-300 inline-block" />
                You have
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <span className="w-2 h-2 rounded-sm bg-amber-300 inline-block" />
                Partial
              </span>
              <span className="flex items-center gap-1 text-red-500 font-medium">
                <span className="w-2 h-2 rounded-sm bg-red-300 inline-block" />
                Missing
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-3">About the Company</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Company Size</p>
                  <p className="text-sm font-medium text-slate-900">
                    {company?.company_size_min}-{company?.company_size_max}{" "}
                    employees
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Industry</p>
                  <p className="text-sm font-medium text-slate-900">
                    {industries.length > 0
                      ? industries.map((i) => i.industry_name).join(", ")
                      : "Technology"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Explore Similar Jobs
            </p>
            <p className="text-xs text-blue-700 mb-3">
              Found roles matching your profile
            </p>
            <Link
              href="/jobs"
              className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors"
            >
              Browse all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
