"use client";
import { useState, useRef, useEffect } from "react";
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
  Loader2,
  Star,
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
import { userProfile } from "@/data/mockData";
import CvApi from "@/api/cv";
import MatchingApi from "@/api/matching";
import profileApi from "@/api/profile";
import { MatchedSkillDetail } from "@/types/matching";
import { CvItemDto } from "@/types/cv";

type InputMode = "upload" | "paste" | "url" | "role";

const getSkillLevel = (proficiency: number | null): string => {
  if (proficiency === null) return "None";
  if (proficiency >= 85) return "Expert";
  if (proficiency >= 70) return "Advanced";
  if (proficiency >= 50) return "Intermediate";
  return "Beginner";
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
  const [benchmarkRoles, setBenchmarkRoles] = useState<string[]>([
    "Frontend Developer",
    "Full Stack Developer",
    "Backend Developer",
    "DevOps Engineer",
    "Data Engineer",
    "Machine Learning Engineer",
    "Mobile Developer",
    "Cloud Architect",
  ]);
  const [jdUrl, setJdUrl] = useState("");
  const [jdText, setJdText] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // States quản lý danh sách CV động từ API getMe
  const [defaultCv, setDefaultCv] = useState<any>(null);
  const [allCvs, setAllCvs] = useState<any[]>([]);
  const [activeCv, setActiveCv] = useState<CvItemDto | null>(null);

  // Nhận biết xem người dùng đã thay đổi bất kỳ trường cấu hình nào hay chưa
  const [isConfigChanged, setIsConfigChanged] = useState<boolean>(false);

  // ── STATES QUẢN LÝ DỮ LIỆU REAL TỪ API ──
  const [matchResult, setMatchResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isUpdatingDefault, setIsUpdatingDefault] = useState<boolean>(false);

  // ── THÊM ĐOẠN QUẢN LÝ UPLOAD CHO Ô BÊN PHẢI (JOB DESCRIPTION SOURCE) ──
  const [rightFile, setRightFile] = useState<File | null>(null);
  const [isUploadingRight, setIsUploadingRight] = useState(false);
  const [rightUploadError, setRightUploadError] = useState("");
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  // Tải thông tin hồ sơ người dùng để phân rã Default CV và Toàn bộ CV
  const fetchConfigAndProfileData = async () => {
    try {
      const rolesRes = await MatchingApi.getJobGroups();
      if (rolesRes?.data && rolesRes.data.length > 0) {
        setBenchmarkRoles(rolesRes.data);
        setSelectedRole(rolesRes.data[0]);
      }

      const profileRes = await profileApi.getMe();
      if (profileRes?.data) {
        const userData = profileRes.data;

        setAllCvs(userData.all_cvs || []);
        setDefaultCv(userData.default_cv || null);

        if (userData.default_cv) {
          setActiveCv({
            cv_id: userData.default_cv.cv_id,
            file_name: userData.default_cv.file_name,
            createdAt: userData.default_cv.uploaded_at,
          });
        } else if (userData.all_cvs && userData.all_cvs.length > 0) {
          const firstCv = userData.all_cvs[0];
          setActiveCv({
            cv_id: firstCv.cv_id,
            file_name: firstCv.file_name,
            createdAt: firstCv.uploaded_at,
          });
        }

        if (userData.default_match) {
          mapAndSetMatchResult(userData.default_match);
        }
      }
    } catch (err) {
      console.error("Lỗi đồng bộ cấu hình dữ liệu profile:", err);
      setApiError("Không thể tải thông tin hồ sơ từ hệ thống.");
    }
  };

  useEffect(() => {
    fetchConfigAndProfileData();
  }, []);

  // Theo dõi sự thay đổi của cấu hình để mở khóa nút bấm chính
  useEffect(() => {
    if (analyzed) {
      setIsConfigChanged(true);
    }
  }, [selectedRole, jdUrl, jdText, rightFile, activeCv]);

  // Hàm helper map cấu trúc JSON API sang Object phẳng cho UI Recharts
  const mapAndSetMatchResult = (backendData: any) => {
    const allSkillsForRadar = [
      ...(backendData.radar_data || []),
      ...(backendData.gap_report?.partially_matched_skills || []),
      ...(backendData.gap_report?.missing_skills || []),
    ];

    const mappedResult = {
      overallScore: Math.round((backendData.match_score || 0) * 100),
      jobTitle: backendData.search_group || selectedRole,
      company: "Market Benchmark",
      analysis: {
        strongMatches: (backendData.radar_data || [])
          .filter((s: MatchedSkillDetail) => s.similarity >= 0.7)
          .map((s: MatchedSkillDetail) => ({
            skill: s.skill_name,
            cvLevel: getSkillLevel(s.similarity * 100),
            required: s.weight >= 0.2 ? "Required" : "Preferred",
            match: Math.round(s.similarity * 100),
            years: 1,
          })),
        partialMatches: (
          backendData.gap_report?.partially_matched_skills || []
        ).map((s: any) => ({
          skill: s.skill_name,
          cvLevel: getSkillLevel(s.similarity * 100),
          required: s.weight >= 0.2 ? "Required" : "Preferred",
          match: Math.round(s.similarity * 100),
          years: 0,
        })),
        missingSkills: (backendData.gap_report?.missing_skills || []).map(
          (s: any) => ({
            skill: s.skill_name,
            required: s.weight >= 0.2 ? "Required" : "Preferred",
            priority: s.weight >= 0.2 ? "Critical" : "Nice to have",
          }),
        ),
      },
      experience: {
        required: "3+ years",
        yours: `${userProfile.experience_years} years`,
        match: Math.min((userProfile.experience_years / 5) * 100, 100),
      },
      education: {
        required: "Bachelor's in CS or related",
        yours: userProfile.education_level,
        match: 100,
      },
      radarData: allSkillsForRadar.map((s: any) => ({
        subject: s.skill_name,
        you: Math.round((s.similarity || 0) * 100),
        required: Math.round((s.weight || 0) * 100),
      })),
    };

    setMatchResult(mappedResult);
    setAnalyzed(true);
    setIsConfigChanged(false); // Đóng khóa nút sau khi đã hiển thị kết quả khớp cấu hình hiện tại
  };

  // HÀM XỬ LÝ GỌI API ĐỐI SÁNH KHI BẤM NÚT ANALYZE & MATCH HOẶC ICON REFRESH
  const handleAnalyzeAndMatch = async () => {
    if (!activeCv?.cv_id) {
      setApiError(
        "Vui lòng tải lên CV của bạn ở ô bên trái trước khi thực hiện đối sánh.",
      );
      return;
    }

    try {
      setIsLoading(true);
      setApiError(null);

      const res = await MatchingApi.analyzeCv({
        cv_id: activeCv.cv_id,
        search_group: selectedRole,
      });

      if (res?.data) {
        mapAndSetMatchResult(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi tính toán đối sánh:", err);
      setApiError(
        "Không thể hoàn thành phân tích đối sánh. Vui lòng kiểm tra lại hệ thống.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm gọi API thiết lập CV Mặc định cho hệ thống
  const handleSetDefaultCv = async (cvId: string) => {
    try {
      setIsUpdatingDefault(true);
      const res = await profileApi.setDefaultCv(cvId);
      if (res) {
        await fetchConfigAndProfileData(); // Tải lại dữ liệu đồng bộ trạng thái mới
      }
    } catch (err) {
      console.error("Lỗi cập nhật CV mặc định:", err);
      setApiError("Đặt trạng thái CV mặc định thất bại.");
    } finally {
      setIsUpdatingDefault(false);
    }
  };

  const handleRightFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const selectedFile = files[0];

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
      {/* Khối thông báo lỗi gọi API nếu có */}
      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

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
          {/* CỘT BÊN TRÁI: QUẢN LÝ PHÂN TÁCH CV DEFAULT VÀ DANH SÁCH ALL CVS */}
          <div className="space-y-4">
            {/* Hàng 1: Hiển thị System Default CV */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                System Default CV
              </label>
              {defaultCv ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 text-blue-600 fill-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {defaultCv.file_name}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md shrink-0">
                    Mặc định
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic pl-1">
                  Chưa thiết lập CV mặc định.
                </p>
              )}
            </div>

            {/* Hàng 2: Hiển thị Active CV để quét và Dropdown chọn All CVs bên dưới */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Active CV for Analysis & All Documents
              </label>
              {activeCv ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-emerald-700 font-medium">
                        Đang chọn quét AI
                      </p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {activeCv.file_name}
                      </p>
                    </div>
                    {/* THAY ĐỔI: Bấm nút này sẽ trực tiếp kích hoạt đối sánh ngay tức thì */}
                    <button
                      onClick={handleAnalyzeAndMatch}
                      disabled={isLoading}
                      title="Chạy đối sánh nhanh với CV này"
                      className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors text-emerald-700 disabled:opacity-40"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCcw className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Dropdown bốc all_cvs và tích hợp nút cài đặt default */}
                  {allCvs.length > 0 && (
                    <div className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex items-center gap-3 justify-between">
                      <div className="flex-1">
                        <select
                          value={activeCv.cv_id}
                          onChange={(e) => {
                            const selected = allCvs.find(
                              (c) => c.cv_id === e.target.value,
                            );
                            if (selected) setActiveCv(selected);
                          }}
                          className="w-full bg-white border border-slate-200 px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-medium"
                        >
                          {allCvs.map((cv) => (
                            <option key={cv.cv_id} value={cv.cv_id}>
                              {cv.file_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        disabled={
                          isUpdatingDefault ||
                          activeCv.cv_id === defaultCv?.cv_id
                        }
                        onClick={() => handleSetDefaultCv(activeCv.cv_id)}
                        className="px-2.5 py-1.5 border border-slate-200 bg-white text-slate-700 font-semibold rounded-lg text-[11px] hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 whitespace-nowrap transition-all"
                      >
                        {isUpdatingDefault
                          ? "Processing..."
                          : activeCv.cv_id === defaultCv?.cv_id
                            ? "Is Default ⭐"
                            : "Set Default"}
                      </button>
                    </div>
                  )}
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
          </div>

          {/* JD Input (Bên Phải - Giữ nguyên hoàn toàn cấu trúc giao diện) */}
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

            {/* THAY ĐỔI: Thêm điều kiện !isConfigChanged để vô hiệu hóa nút bấm khi mở trang */}
            <button
              onClick={handleAnalyzeAndMatch}
              disabled={isLoading || !isConfigChanged}
              className="mt-3 w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze & Match
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {!analyzed || !matchResult ? (
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
                value: `${matchResult.analysis.strongMatches.length}/${matchResult.analysis.strongMatches.length + matchResult.analysis.partialMatches.length + matchResult.analysis.missingSkills.length}`,
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
                    {matchResult.analysis.strongMatches.map((item: any) => (
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
                    {matchResult.analysis.strongMatches.map((item: any) => (
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
                              {item.match}% Match
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
                    {matchResult.analysis.partialMatches.map((item: any) => (
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
                    {matchResult.analysis.partialMatches.map((item: any) => (
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
                          <p className="text-[11px] text-amber-700 font-medium">
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
                    {matchResult.analysis.missingSkills.map((item: any) => (
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
                    {matchResult.analysis.missingSkills.map((item: any) => (
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
