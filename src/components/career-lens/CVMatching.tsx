"use client";
import { useState, useRef } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BarChart3,
  ArrowRight,
  Info,
  RefreshCcw,
  Loader2, // Thêm icon loading từ lucide-react
} from "lucide-react";
import Link from "next/link";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { jobsWithDetails, userProfile } from "@/data/mockData";
import { calculateJobMatch } from "@/utils/matching";
import CvApi from "@/api/cv"; // Import API CV của bạn ở đây

type InputMode = "upload" | "paste" | "url" | "role";

const benchmarkRoles = [
  "Frontend Developer",
  "Full Stack Developer",
  "Backend Developer",
  "DevOps Engineer",
  "Data Engineer",
  "Machine Learning Engineer",
  "Mobile Developer",
  "Cloud Architect",
];

// Use the first job (Senior React Developer) for demo matching
const targetJob = jobsWithDetails[0];
const matchData = calculateJobMatch(targetJob, userProfile);

const getSkillLevel = (proficiency: number | null): string => {
  if (proficiency === null) return "None";
  if (proficiency >= 85) return "Expert";
  if (proficiency >= 70) return "Advanced";
  if (proficiency >= 50) return "Intermediate";
  return "Beginner";
};

const matchResult = {
  overallScore: matchData.overall_score,
  jobTitle: targetJob.title,
  company: targetJob.company.name,
  analysis: {
    strongMatches: matchData.skill_matches
      .filter((sm) => sm.match_level === "strong")
      .map((sm) => ({
        skill: sm.skill_name,
        cvLevel: getSkillLevel(sm.user_proficiency),
        required: sm.required ? "Required" : "Preferred",
        match: sm.match_score,
        years: sm.years_experience || 0,
      })),
    partialMatches: matchData.skill_matches
      .filter((sm) => sm.match_level === "partial")
      .map((sm) => ({
        skill: sm.skill_name,
        cvLevel: getSkillLevel(sm.user_proficiency),
        required: sm.required ? "Required" : "Preferred",
        match: sm.match_score,
        years: sm.years_experience || 0,
      })),
    missingSkills: matchData.skill_matches
      .filter((sm) => sm.match_level === "missing")
      .map((sm) => ({
        skill: sm.skill_name,
        required: sm.required ? "Required" : "Preferred",
        priority: sm.required ? "Critical" : "Nice to have",
      })),
  },
  experience: {
    required: targetJob.formatted_experience_level || "3+ years",
    yours: `${userProfile.experience_years} years`,
    match: Math.min((userProfile.experience_years / 5) * 100, 100),
  },
  education: {
    required: "Bachelor's in CS or related",
    yours: userProfile.education_level,
    match: 100,
  },
  radarData: matchData.skill_matches.slice(0, 6).map((sm) => ({
    subject: sm.skill_name,
    you: sm.user_proficiency || 0,
    required: 70,
  })),
};

function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 65 ? "#3b82f6" : "#f59e0b";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>
          {score}%
        </span>
      </div>
    </div>
  );
}

export function CVMatching() {
  const [mode, setMode] = useState<InputMode>("upload");
  const [selectedRole, setSelectedRole] = useState("Senior React Developer");
  const [jdUrl, setJdUrl] = useState("");
  const [jdText, setJdText] = useState("");
  const [analyzed, setAnalyzed] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const cvUploaded = true; // Bên trái giữ nguyên hằng số hiển thị CV mặc định của bạn

  // ── THÊM ĐOẠN QUẢN LÝ UPLOAD CHO Ô BÊN PHẢI (JOB DESCRIPTION SOURCE) ──
  const [rightFile, setRightFile] = useState<File | null>(null);
  const [isUploadingRight, setIsUploadingRight] = useState(false);
  const [rightUploadError, setRightUploadError] = useState("");
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  const handleRightFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const selectedFile = files[0];

    // Validate giống bên file CVUpload.tsx của bạn
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setRightUploadError(
        "Please upload a PDF or Word document (.pdf, .doc, .docx)",
      );
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setRightUploadError("File size must be less than 5MB");
      return;
    }

    setRightUploadError("");
    setIsUploadingRight(true);

    try {
      // Gọi endpoint upload CV thực tế
      const response = await CvApi.uploadCv(selectedFile);
      if (response && response.data) {
        setRightFile(selectedFile);
      } else {
        setRightUploadError(
          response?.message || "Tải CV lên thất bại. Vui lòng thử lại.",
        );
      }
    } catch (error: any) {
      console.error("Lỗi khi upload CV bên phải:", error);
      setRightUploadError(error?.message || "Có lỗi hệ thống xảy ra.");
    } finally {
      setIsUploadingRight(false);
    }
  };
  // ──────────────────────────────────────────────────────────────────

  const modeButtons: { key: InputMode; label: string; icon: any }[] = [
    { key: "upload", label: "Upload CV", icon: Upload },
    { key: "role", label: "Role Benchmark", icon: BarChart3 },
    { key: "url", label: "Job URL", icon: LinkIcon },
    { key: "paste", label: "Paste JD", icon: FileText },
  ];

  const toggleSection = (s: string) =>
    setExpandedSection((p) => (p === s ? null : s));

  return (
    <div className="p-6 space-y-5">
      {/* ── Input Panel ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 mb-0.5">
            Configure Analysis
          </h2>
          <p className="text-xs text-slate-500">
            Upload your CV and provide a job description or benchmark role to
            start the comparison.
          </p>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* CV Upload (Bên Trái - Giữ Nguyên Hoàn Toàn Giao Diện Cũ) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
              Your CV / Profile
            </label>
            {cvUploaded ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    Jane_Doe_CV_2026.pdf
                  </p>
                  <p className="text-xs text-emerald-700">Uploaded · 142 KB</p>
                </div>
                <button className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors">
                  <RefreshCcw className="w-3.5 h-3.5 text-emerald-700" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer">
                <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700 mb-0.5">
                  Drop your CV here
                </p>
                <p className="text-xs text-slate-400">PDF, DOCX up to 5MB</p>
                <button className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                  Browse Files
                </button>
              </div>
            )}
          </div>

          {/* JD Input (Bên Phải - Nơi gắn endpoint upload thực tế vào tab Upload CV) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
              Job Description Source
            </label>
            <div className="flex gap-1.5 mb-3 p-1 bg-slate-100 rounded-xl">
              {modeButtons.map((b) => (
                <button
                  key={b.key}
                  onClick={() => setMode(b.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    mode === b.key
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <b.icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{b.label}</span>
                </button>
              ))}
            </div>

            {mode === "role" && (
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {benchmarkRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            )}
            {mode === "url" && (
              <input
                type="url"
                placeholder="https://linkedin.com/jobs/view/..."
                value={jdUrl}
                onChange={(e) => setJdUrl(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            )}
            {mode === "paste" && (
              <textarea
                placeholder="Paste the full job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-slate-400"
              />
            )}

            {/* THAY ĐỔI TẠI ĐÂY: Quản lý click và gọi API thực tế khi chọn tab upload bên phải */}
            {mode === "upload" && (
              <>
                <input
                  type="file"
                  ref={rightFileInputRef}
                  onChange={handleRightFileChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <div
                  onClick={() =>
                    !isUploadingRight && rightFileInputRef.current?.click()
                  }
                  className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col justify-center items-center min-h-[105px]"
                >
                  {isUploadingRight ? (
                    <>
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin mb-1.5" />
                      <p className="text-xs font-medium text-slate-600">
                        Uploading...
                      </p>
                    </>
                  ) : rightFile ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-slate-800 truncate max-w-full px-2">
                        {rightFile.name}
                      </p>
                      <p className="text-[11px] text-emerald-600">
                        Successfully uploaded
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                      <p className="text-xs font-medium text-slate-600">
                        Upload JD document
                      </p>
                      <p className="text-[11px] text-slate-400">
                        PDF, DOCX, TXT
                      </p>
                    </>
                  )}
                </div>
                {rightUploadError && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {rightUploadError}
                  </p>
                )}
              </>
            )}

            <button
              onClick={() => setAnalyzed(true)}
              className="mt-3 w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Analyze & Match
            </button>
          </div>
        </div>
      </div>

      {!analyzed ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Ready to analyze</h3>
          <p className="text-sm text-slate-500">
            Upload your CV and provide a job description to see your
            personalized match analysis.
          </p>
        </div>
      ) : (
        <>
          {/* ── Score Summary ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Overall Match",
                value: matchResult.overallScore,
                sub: "Strong candidate",
                type: "ring",
              },
              {
                label: "Skills Matched",
                value: `${matchResult.analysis.strongMatches.length}/${matchResult.analysis.strongMatches.length + matchResult.analysis.partialMatches.length}`,
                sub: "Core skills fully met",
                type: "text",
                color: "text-emerald-600",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-5"
              >
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  {card.label}
                </p>
                {card.type === "ring" ? (
                  <div className="flex items-center gap-4">
                    <ScoreRing score={card.value as number} />
                    <div>
                      <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={`text-3xl font-bold mb-1 ${card.color}`}>
                      {card.value}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {card.sub}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* ── Matching For Banner ── */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs mb-0.5">Analyzed against</p>
              <p className="text-white font-bold">{matchResult.jobTitle}</p>
              <p className="text-slate-400 text-xs">{matchResult.company}</p>
            </div>
            <Link
              href="/skill-gap"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              View Gap Analysis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* ── Body ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Skills Breakdown */}
            <div className="lg:col-span-2 space-y-4">
              {/* Strong Matches */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection("strong")}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 text-sm">
                        Strong Matches
                      </p>
                      <p className="text-xs text-slate-500">
                        Skills you've fully demonstrated
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full ml-1">
                      {matchResult.analysis.strongMatches.length}
                    </span>
                  </div>
                  {expandedSection === "strong" ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {expandedSection !== "strong" && (
                  <div className="px-5 pb-4 flex flex-wrap gap-2">
                    {matchResult.analysis.strongMatches.map((item) => (
                      <span
                        key={item.skill}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full"
                      >
                        {item.skill}
                      </span>
                    ))}
                  </div>
                )}
                {expandedSection === "strong" && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {matchResult.analysis.strongMatches.map((item) => (
                      <div
                        key={item.skill}
                        className="px-5 py-3 flex items-center gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-slate-900">
                              {item.skill}
                            </span>
                            <span className="text-xs font-bold text-emerald-600">
                              100% Match
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full w-full" />
                          </div>
                          <div className="flex gap-4 mt-1.5 text-[11px] text-slate-500">
                            <span>
                              Your level:{" "}
                              <span className="font-semibold text-slate-700">
                                {item.cvLevel}
                              </span>
                            </span>
                            <span>
                              Required:{" "}
                              <span className="font-semibold text-slate-700">
                                {item.required}
                              </span>
                            </span>
                            <span>{item.years}+ yrs experience</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Partial Matches */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection("partial")}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 text-sm">
                        Partial Matches
                      </p>
                      <p className="text-xs text-slate-500">
                        Skills you have but need to level up
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full ml-1">
                      {matchResult.analysis.partialMatches.length}
                    </span>
                  </div>
                  {expandedSection === "partial" ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {expandedSection !== "partial" && (
                  <div className="px-5 pb-4 flex flex-wrap gap-2">
                    {matchResult.analysis.partialMatches.map((item) => (
                      <span
                        key={item.skill}
                        className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full"
                      >
                        {item.skill}
                      </span>
                    ))}
                  </div>
                )}
                {expandedSection === "partial" && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {matchResult.analysis.partialMatches.map((item) => (
                      <div key={item.skill} className="px-5 py-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-slate-900">
                            {item.skill}
                          </span>
                          <span className="text-xs font-bold text-amber-600">
                            {item.match}% Match
                          </span>
                        </div>
                        <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${item.match}%` }}
                          />
                        </div>
                        <div className="flex gap-4 text-[11px] text-slate-500">
                          <span>
                            Your level:{" "}
                            <span className="font-semibold text-slate-700">
                              {item.cvLevel}
                            </span>
                          </span>
                          <span>
                            Required:{" "}
                            <span className="font-semibold text-slate-700">
                              {item.required}
                            </span>
                          </span>
                        </div>
                        <div className="mt-2 flex items-start gap-1.5 p-2 bg-amber-50 rounded-lg">
                          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-amber-700">
                            Consider upskilling to reach the required level
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Skills */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection("missing")}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 text-sm">
                        Missing Skills
                      </p>
                      <p className="text-xs text-slate-500">
                        Skills not yet in your profile
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full ml-1">
                      {matchResult.analysis.missingSkills.length}
                    </span>
                  </div>
                  {expandedSection === "missing" ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {expandedSection !== "missing" && (
                  <div className="px-5 pb-4 flex flex-wrap gap-2">
                    {matchResult.analysis.missingSkills.map((item) => (
                      <span
                        key={item.skill}
                        className="px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-200"
                      >
                        {item.skill}
                      </span>
                    ))}
                  </div>
                )}
                {expandedSection === "missing" && (
                  <div className="border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
                    {matchResult.analysis.missingSkills.map((item) => (
                      <div
                        key={item.skill}
                        className="p-3 bg-red-50 border border-red-100 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-slate-900">
                            {item.skill}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-1.5">
                          Req: {item.required}
                        </p>
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                          {item.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Radar Chart Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 mb-1">Skills Radar</h3>
                <p className="text-xs text-slate-500 mb-4">
                  You vs. Requirements
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart
                    data={matchResult.radarData}
                    margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                  >
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                    />
                    <PolarRadiusAxis
                      tick={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Radar
                      name="You"
                      dataKey="you"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.35}
                    />
                    <Radar
                      name="Required"
                      dataKey="required"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.15}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 justify-center mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-4 h-0.5 bg-blue-500 rounded-full inline-block" />
                    You
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-4 h-0.5 bg-emerald-500 rounded-full inline-block" />
                    Required
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-xl p-5">
                <p className="text-sm font-bold text-violet-900 mb-1">
                  Want detailed recommendations?
                </p>
                <p className="text-xs text-violet-700 mb-3">
                  See exactly what to learn to close your skill gaps.
                </p>
                <Link
                  href="/skill-gap"
                  className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors justify-center"
                >
                  View Gap Analysis <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
