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
  History,
  Eye,
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
import { MatchedSkillDetail, MatchCategoryResponse } from "@/types/matching";
import { CvItemDto } from "@/types/cv";

type InputMode = "role" | "url";

function CategoryDropdown({
  categories,
  selected,
  onSelect,
  isLoading,
}: {
  categories: MatchCategoryResponse[];
  selected: string;
  onSelect: (cat: string) => void;
  isLoading: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const filtered = categories.filter((c) =>
    (c.category || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
      >
        <span className="truncate">
          {selected === "All" ? "Tất cả nhóm kỹ năng" : selected}
        </span>

        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-40 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <input
              type="text"
              placeholder="Tìm kiếm nhóm kỹ năng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 text-slate-700"
            />
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
            {filtered.map((cat) => (
              <button
                key={cat.category}
                onClick={() => {
                  onSelect(cat.category);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-all
                  ${
                    selected === cat.category
                      ? "text-blue-600 font-bold bg-blue-50"
                      : "text-slate-700"
                  }
                  ${
                    !cat.is_matched
                      ? "opacity-30 cursor-not-allowed bg-slate-50/50"
                      : "hover:bg-slate-50"
                  }
                `}
              >
                {cat.category}
                {!cat.is_matched && (
                  <span className="text-[10px] text-slate-400 ml-1">
                    (Không khớp)
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const getSkillLevel = (proficiency: number | null): string => {
  if (proficiency === null) return "Không có";
  if (proficiency >= 85) return "Chuyên gia";
  if (proficiency >= 70) return "Nâng cao";
  if (proficiency >= 50) return "Trung bình";
  return "Người mới";
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

const CustomRadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-xs font-medium">
        <p className="text-slate-900 font-semibold mb-1 flex items-center gap-1">
          <span>{data.subject}</span>
          {data.matchedVia && (
            <span className="text-violet-500 font-normal text-[11px] bg-violet-50 px-1.5 py-0.5 rounded">
              (khớp qua {data.matchedVia})
            </span>
          )}
        </p>
        <p className="text-blue-600">Bạn có: {data.you}%</p>
        <p className="text-emerald-600">Yêu cầu: {data.required}%</p>
      </div>
    );
  }
  return null;
};

export function CVMatching() {
  const [mode, setMode] = useState<InputMode>("role");
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
  const [analyzed, setAnalyzed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // States quản lý danh sách CV động từ API getMe
  const [defaultCv, setDefaultCv] = useState<any>(null);
  const [allCvs, setAllCvs] = useState<any[]>([]);
  const [activeCv, setActiveCv] = useState<CvItemDto | null>(null);

  // State quản lý danh sách lịch sử đối sánh phụ thuộc vào CV đang hoạt động
  const [allMatchings, setAllMatchings] = useState<any[]>([]);
  const [selectedMatchingId, setSelectedMatchingId] = useState<string>("");

  // Nhận biết xem người dùng đã thay đổi bất kỳ trường cấu hình nào hay chưa
  const [isConfigChanged, setIsConfigChanged] = useState<boolean>(true);

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

  const [showResultModal, setShowResultModal] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<MatchCategoryResponse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  const [modalCategories, setModalCategories] = useState<
    MatchCategoryResponse[]
  >([]);
  const [selectedModalCategory, setSelectedModalCategory] = useState("All");
  const [modalRadarDataFiltered, setModalRadarDataFiltered] = useState<any[]>(
    [],
  );
  const [originalRadarData, setOriginalRadarData] = useState<any[]>([]);
  const [originalModalRadarData, setOriginalModalRadarData] = useState<any[]>(
    [],
  );

  const filteredRoles = benchmarkRoles.filter((role) =>
    role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // State quản lý CV nào đang được chọn để xem chi tiết trong Popup
  const [viewingCvUrl, setViewingCvUrl] = useState<string | null>(null);
  const [viewingCvName, setViewingCvName] = useState<string>("");

  // Tải thông tin hồ sơ người dùng để phân rã Default CV và Toàn bộ CV
  const fetchConfigAndProfileData = async () => {
    try {
      const rolesRes = await MatchingApi.getJobGroups();
      if (rolesRes?.data && rolesRes.data.length > 0) {
        setBenchmarkRoles(rolesRes.data);
      }

      const profileRes = await profileApi.getMe();
      if (profileRes?.data) {
        const userData = profileRes.data;

        setAllCvs(userData.all_cvs || []);
        setDefaultCv(userData.default_cv || null);

        // Thiết lập Active CV ban đầu dựa trên Default CV hoặc CV đầu tiên
        let currentCv = null;
        if (userData.default_cv) {
          currentCv = {
            cv_id: userData.default_cv.cv_id,
            file_name: userData.default_cv.file_name,
            file_url: userData.default_cv.file_url || "",
            createdAt: userData.default_cv.uploaded_at,
          };
        } else if (userData.all_cvs && userData.all_cvs.length > 0) {
          const firstCv = userData.all_cvs[0];
          currentCv = {
            cv_id: firstCv.cv_id,
            file_name: firstCv.file_name,
            file_url: firstCv.file_url || "",
            createdAt: firstCv.uploaded_at,
          };
        }
        setActiveCv(currentCv);

        if (userData.default_match) {
          mapAndSetMatchResult(userData.default_match);
          if (userData.default_match.match_id) {
            setSelectedMatchingId(userData.default_match.match_id);
            fetchCategories(userData.default_match.match_id);
          }
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchMatchingsForCv = async () => {
    try {
      const res = await MatchingApi.getAllMatches();
      if (res?.data) {
        setAllMatchings(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải lịch sử đối sánh toàn hệ thống:", err);
    }
  };

  useEffect(() => {
    if (activeCv?.cv_id) {
      fetchMatchingsForCv();
    }
  }, [activeCv]);

  // Theo dõi sự thay đổi của cấu hình để mở khóa nút bấm chính
  useEffect(() => {
    setIsConfigChanged(true);
  }, [selectedRole, jdUrl, rightFile, activeCv]);

  useEffect(() => {
    if (showResultModal && analyzeResult?.match_id) {
      fetchCategories(analyzeResult.match_id, true);
      setSelectedModalCategory("All");

      const allData = [
        ...(analyzeResult.radar_data || []),
        ...(analyzeResult.gap_report?.partially_matched_skills || []),
        ...(analyzeResult.gap_report?.missing_skills || []),
      ].map((s: any) => ({
        subject: s.skill_name,
        you: Math.round((s.similarity || 0) * 100),
        required: 100,
      }));

      setModalRadarDataFiltered(allData);
      setOriginalModalRadarData(allData);
    }
  }, [showResultModal, analyzeResult]);

  const mapAndSetMatchResult = (backendData: any) => {
    const allSkillsForRadar = [
      ...(backendData.radar_data || []),
      ...(backendData.gap_report?.partially_matched_skills || []),
      ...(backendData.gap_report?.missing_skills || []),
    ];

    const mappedResult = {
      overallScore: Math.round(
        (parseFloat(backendData.match_score) || 0) * 100,
      ),
      jobTitle: backendData.job_title || backendData.search_group || "",
      company: backendData.company_name || "",
      analysis: {
        strongMatches: (backendData.radar_data || [])
          .filter((s: MatchedSkillDetail) => s.similarity >= 0.7)
          .map((s: MatchedSkillDetail) => ({
            skill: s.skill_name,
            cvLevel: getSkillLevel(s.similarity * 100),
            required: s.weight >= 0.2 ? "Bắt buộc" : "Ưa thích",
            match: Math.round(s.similarity * 100),
            years: 1,
          })),
        partialMatches: (
          backendData.gap_report?.partially_matched_skills || []
        ).map((s: any) => ({
          skill: s.skill_name,
          cvLevel: getSkillLevel(s.similarity * 100),
          required: s.weight >= 0.2 ? "Bắt buộc" : "Ưa thích",
          match: Math.round(s.similarity * 100),
          years: 0,
        })),
        missingSkills: (backendData.gap_report?.missing_skills || []).map(
          (s: any) => ({
            skill: s.skill_name,
            required: s.weight >= 0.2 ? "Bắt buộc" : "Ưa thích",
            priority: s.weight >= 0.2 ? "Tối thiểu" : "Tốt để có",
          }),
        ),
      },
      experience: {
        required: "3+ năm",
        yours: `${userProfile.experience_years} năm`,
        match: Math.min((userProfile.experience_years / 5) * 100, 100),
      },
      education: {
        required: "Cử nhân ngành Khoa học Máy tính hoặc liên quan",
        yours: userProfile.education_level,
        match: 100,
      },
      radarData: allSkillsForRadar.map((s: any) => ({
        subject: s.skill_name,
        you: Math.round((s.similarity || 0) * 100),
        required: 100,
      })),
    };
    setOriginalRadarData(mappedResult.radarData);
    setOriginalModalRadarData(mappedResult.radarData);
    setMatchResult(mappedResult);
    setAnalyzed(true);
    setIsConfigChanged(false);
  };

  const fetchCategories = async (matchId: string, isModal = false) => {
    try {
      const res = await MatchingApi.getMatchCategories(matchId);

      const categoriesArray = res.data;

      if (Array.isArray(categoriesArray)) {
        if (isModal) {
          setModalCategories(categoriesArray);
        } else {
          setCategories(categoriesArray);
        }
      } else {
        console.warn(
          "Dữ liệu trả về không phải là một mảng mảng!",
          categoriesArray,
        );
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách categories:", err);
    }
  };

  const handleCategoryChange = async (
    matchId: string,
    category: string,
    isModal = false,
  ) => {
    if (isModal) setSelectedModalCategory(category);
    else setSelectedCategory(category);

    if (category === "All") {
      if (isModal) {
        setModalRadarDataFiltered(originalModalRadarData);
      } else {
        setMatchResult((prev: any) => ({
          ...prev,
          radarData: originalRadarData,
        }));
      }
      return;
    }

    try {
      setIsCategoryLoading(true);
      const res = await MatchingApi.getRadarByCategory(matchId, category);

      if (res) {
        const rawRadar = res.data.radar_data || [];
        const rawGapReport = (res.data.gap_report as any) || {};

        const combinedSkills = [
          ...rawRadar,
          ...(rawGapReport.partially_matched_skills || []),
          ...(rawGapReport.missing_skills || []),
        ];

        const formattedData = combinedSkills.map((s: any) => {
          let youScore = Math.round((s.similarity || 0) * 100);

          if (youScore === 0) {
            youScore = 0.1;
          }

          return {
            subject: s.skill_name,
            you: youScore,
            required: 100,
            matchedVia: s.matched_via || null,
          };
        });

        if (isModal) {
          setModalRadarDataFiltered(formattedData);
        } else {
          setMatchResult((prev: any) => ({
            ...prev,
            radarData: formattedData,
          }));
        }
      }
    } catch (err) {
      console.error("Lỗi lọc radar theo category:", err);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const handleAnalyzeAndMatch = async () => {
    // Luồng kiểm soát: Ưu tiên lấy thông tin cv hoạt động
    const targetCvId = activeCv?.cv_id;

    if (!targetCvId && !rightFile) {
      setApiError(
        "Vui lòng chọn một CV sẵn có hoặc tải lên tệp tài liệu trước khi phân tích.",
      );
      return;
    }

    try {
      setIsLoading(true);
      setApiError(null);

      const payload: any = {
        cv_id: targetCvId!,
        search_group: mode === "url" ? "" : selectedRole || "",
      };

      if (mode === "url") {
        payload.job_url = jdUrl.trim();
      }

      const res = await MatchingApi.analyzeCv(payload);

      if (res?.data) {
        setAnalyzeResult(res.data);

        setShowResultModal(true);

        await fetchMatchingsForCv();
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

  const handleSetDefaultFromModal = async () => {
    if (!activeCv?.cv_id) return;
    try {
      await profileApi.setDefaultCv(activeCv.cv_id);

      await fetchConfigAndProfileData();
      await fetchMatchingsForCv();

      // Đóng popup
      setShowResultModal(false);
    } catch (err) {
      console.error("Lỗi đặt mặc định từ popup:", err);
      setApiError("Không thể thiết lập trạng thái mặc định mới.");
    }
  };

  // Hàm xử lý khi người dùng chọn một bản ghi đối sánh cũ từ dropdown
  const handleSelectHistoryMatching = async (matchId: string) => {
    if (!matchId) return;
    setSelectedMatchingId(matchId);
    try {
      setIsLoading(true);
      const res = await MatchingApi.getMatchDetail(matchId);
      if (res?.data) {
        mapAndSetMatchResult(res.data);
        fetchCategories(matchId); // Thêm dòng này
        setSelectedCategory("All"); // Reset filter
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết lịch sử đối sánh:", err);
      setApiError("Không thể tải thông tin đối sánh lịch sử.");
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm gọi API thiết lập CV Mặc định cho hệ thống và tự động Reload lại UI
  const handleSetDefaultCv = async (cvId: string) => {
    try {
      setIsUpdatingDefault(true);
      const res = await profileApi.setDefaultCv(cvId);
      if (res) {
        // Tự động kích hoạt cơ chế đồng bộ tải lại dữ liệu UI mới nhất từ API getMe
        await fetchConfigAndProfileData();
        await fetchMatchingsForCv();
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

    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(selectedFile.type)) {
      setRightUploadError(
        "Vui lòng tải lên tài liệu định dạng PDF hoặc Ảnh (.pdf, .jpg, .jpeg, .png)",
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
        setRightFile(null);
        const uploadedCv = response.data;
        if (uploadedCv?.cv_id) {
          setActiveCv({
            cv_id: uploadedCv.cv_id,
            file_name: uploadedCv.file_name || selectedFile.name,
            file_url: uploadedCv.file_url || "",
            createdAt: new Date().toISOString(),
          });

          const profileRes = await profileApi.getMe();
          if (profileRes?.data?.all_cvs) {
            setAllCvs(profileRes.data.all_cvs);
          }
        }
      } else {
        setRightUploadError(
          response?.message || "Tải CV lên thất bại. Vui lòng thử lại.",
        );
      }
    } catch (error: any) {
      console.error("Lỗi khi Tải CV bên phải:", error);
      setRightUploadError(error?.message || "Có lỗi hệ thống xảy ra.");
    } finally {
      setIsUploadingRight(false);
    }
  };

  const modeButtons: { key: InputMode; label: string; icon: any }[] = [
    { key: "role", label: "Role Benchmark", icon: BarChart3 },
    { key: "url", label: "Job URL", icon: LinkIcon },
  ];

  const toggleSection = (s: string) =>
    setExpandedSection((p) => (p === s ? null : s));

  // Kiểm soát trạng thái nút bấm: Nếu đã có Active CV chọn sẵn, không làm mờ nút (Trừ trường hợp mode là URL trống)
  const isAnalyzeDisabled =
    isLoading ||
    (!activeCv?.cv_id && !rightFile) ||
    (mode === "url" && !jdUrl.trim());

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
            Cấu hình phân tích
          </h2>
          <p className="text-xs text-slate-500">
            Tải lên CV của bạn và cung cấp mô tả công việc hoặc vị trí so sánh
            để bắt đầu so sánh.
          </p>
        </div>

        <div className="p-5 space-y-5">
          {/* Khu vực phân chia 2 cột bằng nhau */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {/* CỘT BÊN TRÁI: QUẢN LÝ PHÂN TÁCH CV DEFAULT VÀ DANH SÁCH ALL CVS */}
            <div className="space-y-4">
              {/* Hàng 1: Hiển thị System Default CV */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  CV Mặc định của bạn
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
                  Chọn CV để phân tích
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
                      {activeCv.file_url && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Ngăn chặn sự kiện lan ra ngoài
                            setViewingCvUrl(activeCv.file_url);
                            setViewingCvName(activeCv.file_name);
                          }}
                          className="p-1.5 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                          title="Xem nội dung CV"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
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
                            ? "Đang cập nhật..."
                            : activeCv.cv_id === defaultCv?.cv_id
                              ? "Mặc định?  ⭐"
                              : "Đặt làm mặc định"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 bg-slate-50/50 rounded-xl p-4 text-center flex flex-col justify-center items-center h-[114px]">
                    <AlertCircle className="w-5 h-5 text-slate-400 mb-1" />
                    <p className="text-xs font-semibold text-slate-600 mb-0.5">
                      Không có tài liệu CV nào được chọn
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Vui lòng tải lên hoặc quản lý CV của bạn trong cài đặt Hồ
                      sơ.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CỘT BÊN PHẢI: JD INPUT & UPLOAD JD */}
            <div className="space-y-4">
              {/* Hàng 1: Khối Upload tài liệu JD độc lập */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Tải Mô tả công việc (JD)
                </label>
                <input
                  type="file"
                  ref={rightFileInputRef}
                  onChange={handleRightFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <div
                  onClick={() =>
                    !isUploadingRight && rightFileInputRef.current?.click()
                  }
                  className="border-2 border-dashed border-slate-200 rounded-xl px-4 py-2.5 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-center min-h-[58px]"
                >
                  {isUploadingRight ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      <p className="text-xs font-medium text-slate-600">
                        Đang tải lên...
                      </p>
                    </div>
                  ) : rightFile ? (
                    <div className="flex items-center gap-2 w-full justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <p className="text-xs font-semibold text-slate-800 truncate max-w-[180px]">
                        {rightFile.name}
                      </p>
                      <span className="text-[10px] text-emerald-600 font-medium shrink-0">
                        (Hoàn tất)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <p className="text-xs font-medium">
                        Tải lên CV của bạn (.pdf, .jpg, .png)
                      </p>
                    </div>
                  )}
                </div>
                {rightUploadError && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {rightUploadError}
                  </p>
                )}
              </div>

              {/* Hàng 2: Trình chọn Source và Action Match */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Nguồn Mô tả Công việc
                  </label>
                  <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl mb-2">
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
                        <span className="inline">{b.label}</span>
                      </button>
                    ))}
                  </div>

                  {mode === "role" && (
                    <div className="relative w-full" ref={dropdownRef}>
                      {/* Nút bấm giả lập hiển thị Role đang chọn */}
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-medium h-[34px] flex items-center justify-between text-left shadow-sm hover:bg-slate-100/50 transition-all"
                      >
                        <span className="truncate">
                          {selectedRole || "Chọn vị trí tuyển dụng..."}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "transform rotate-180" : ""}`}
                        />
                      </button>

                      {/* Khung tìm kiếm và danh sách lựa chọn */}
                      {isDropdownOpen && (
                        <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
                          {/* Ô nhập từ khóa tìm kiếm */}
                          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                            <input
                              type="text"
                              placeholder="Tìm kiếm vị trí..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              autoFocus
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 text-slate-700"
                            />
                          </div>

                          {/* Danh sách kết quả cuộn động */}
                          <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                            {filteredRoles.length > 0 ? (
                              filteredRoles.map((role) => (
                                <button
                                  key={role}
                                  type="button"
                                  onClick={() => {
                                    setSelectedRole(role);
                                    setIsDropdownOpen(false);
                                    setSearchTerm("");
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors block truncate ${
                                    selectedRole === role
                                      ? "bg-blue-50 text-blue-700 font-bold"
                                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                  }`}
                                >
                                  {role}
                                </button>
                              ))
                            ) : (
                              <p className="text-xs text-slate-400 italic p-3 text-center">
                                Không tìm thấy vị trí phù hợp
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {mode === "url" && (
                    <input
                      type="url"
                      placeholder="https://linkedin.com/jobs/view/..."
                      value={jdUrl}
                      onChange={(e) => setJdUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 h-[34px]"
                    />
                  )}
                </div>

                <button
                  onClick={handleAnalyzeAndMatch}
                  disabled={isAnalyzeDisabled}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed h-[46px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Phân tích & So khớp
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {activeCv && (
            <div className="pt-4 border-t border-slate-100 w-full">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                <History className="w-3 h-3 text-slate-500" /> Lịch sử phù hợp
                cho CV này
              </label>
              <select
                value={selectedMatchingId}
                onChange={(e) => handleSelectHistoryMatching(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-medium"
              >
                <option value="">-- Chọn lần phân tích phù hợp --</option>
                {allMatchings.map((match) => (
                  <option key={match.match_id} value={match.match_id}>
                    {match.search_group || "Benchmark Role"} (
                    {Math.round((parseFloat(match.match_score) || 0) * 100)}%) -{" "}
                    {new Date(
                      match.created_at || match.uploaded_at,
                    ).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {!analyzed || !matchResult ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">
            Sẵn sàng để phân tích
          </h3>
          <p className="text-sm text-slate-500">
            Tải lên CV của bạn và cung cấp mô tả công việc để xem phân tích phù
            hợp cá nhân hóa.
          </p>
        </div>
      ) : (
        <>
          {/* ── Score Summary ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Tổng thể phù hợp",
                value: matchResult.overallScore,
                sub: "Ứng viên mạnh",
                type: "ring",
              },
              {
                label: "Kỹ năng phù hợp",
                value: `${matchResult.analysis.strongMatches.length}/${matchResult.analysis.strongMatches.length + matchResult.analysis.partialMatches.length + matchResult.analysis.missingSkills.length}`,
                sub: "Kỹ năng cốt lõi được đáp ứng hoàn toàn",
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

          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs mb-0.5">Phân tích so sánh</p>
              <p className="text-white font-bold">{matchResult.jobTitle}</p>
              <p className="text-slate-400 text-xs">{matchResult.company}</p>
            </div>
            <Link
              href="/skill-gap"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Xem phân tích khoảng cách kỹ năng{" "}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* ── Body ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Skills Breakdown */}
            <div className="lg:col-span-3 space-y-4">
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
                        Tương thích mạnh
                      </p>
                      <p className="text-xs text-slate-500">
                        Kỹ năng bạn đã thể hiện đầy đủ
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
                              {item.match}% Tương thích
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full w-full" />
                          </div>
                          <div className="flex gap-4 mt-1.5 text-[11px] text-slate-500">
                            <span>
                              Cấp độ của bạn:{" "}
                              <span className="font-semibold text-slate-700">
                                {item.cvLevel}
                              </span>
                            </span>
                            <span>
                              Yêu cầu:{" "}
                              <span className="font-semibold text-slate-700">
                                {item.required}
                              </span>
                            </span>
                            <span>{item.years}+ năm kinh nghiệm</span>
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
                        Tương thích một phần
                      </p>
                      <p className="text-xs text-slate-500">
                        Kỹ năng bạn có nhưng cần nâng cấp
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
                            {item.match}% Tương thích
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
                            Cấp độ của bạn:{" "}
                            <span className="font-semibold text-slate-700">
                              {item.cvLevel}
                            </span>
                          </span>
                          <span>
                            Yêu cầu:{" "}
                            <span className="font-semibold text-slate-700">
                              {item.required}
                            </span>
                          </span>
                        </div>
                        <div className="mt-2 flex items-start gap-1.5 p-2 bg-amber-50 rounded-lg">
                          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-amber-700 font-medium">
                            Xem xét việc nâng cao kỹ năng để đạt được cấp độ yêu
                            cầu
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
                        Kỹ năng thiếu
                      </p>
                      <p className="text-xs text-slate-500">
                        Kỹ năng chưa có trong hồ sơ của bạn
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
                          Yêu cầu: {item.required}
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
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 mb-1">Radar kỹ năng</h3>

                {categories.length > 0 && (
                  <div className="mb-4">
                    <CategoryDropdown
                      categories={categories}
                      selected={selectedCategory}
                      onSelect={(cat) =>
                        handleCategoryChange(selectedMatchingId, cat)
                      }
                      isLoading={isCategoryLoading}
                    />
                  </div>
                )}

                <ResponsiveContainer width="100%" height={240}>
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
                    <Tooltip content={<CustomRadarTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 justify-center mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-4 h-0.5 bg-blue-500 rounded-full inline-block" />
                    Bạn
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-4 h-0.5 bg-emerald-500 rounded-full inline-block" />
                    Yêu cầu
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-xl p-5">
                <p className="text-sm font-bold text-violet-900 mb-1">
                  Muốn có những gợi ý chi tiết?
                </p>
                <p className="text-xs text-violet-700 mb-3">
                  Xem chính xác những gì bạn cần học để lấp đầy các khoảng trống
                  kỹ năng.
                </p>
                <Link
                  href="/skill-gap"
                  className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors justify-center"
                >
                  Xem Phân Tích Khoảng Trống{" "}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal hiển thị kết quả phân tích mới */}
      {showResultModal &&
        analyzeResult &&
        (() => {
          // Trích xuất và chuẩn hóa dữ liệu từ analyzeResult cho Modal
          const modalScore = Math.round(
            (parseFloat(analyzeResult.match_score) || 0) * 100,
          );
          const modalRadarData = [
            ...(analyzeResult.radar_data || []),
            ...(analyzeResult.gap_report?.partially_matched_skills || []),
            ...(analyzeResult.gap_report?.missing_skills || []),
          ].map((s: any) => ({
            subject: s.skill_name,
            you: Math.round((s.similarity || 0) * 100),
            required: 100,
          }));

          const strongMatches = (analyzeResult.radar_data || []).filter(
            (s: any) => s.similarity >= 0.7,
          );
          const partialMatches =
            analyzeResult.gap_report?.partially_matched_skills || [];
          const missingSkills = analyzeResult.gap_report?.missing_skills || [];

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl max-w-[90vw] w-full max-h-[90vh] overflow-y-auto p-6 relative flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Header của Modal */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-violet-500" />
                      Kết quả phân tích đối sánh mới
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dưới đây là đánh giá mức độ tương thích đối với vị trí{" "}
                      <span className="font-semibold text-slate-700">
                        {analyzeResult.search_group || selectedRole}
                      </span>
                      .
                    </p>
                  </div>
                  <button
                    onClick={() => setShowResultModal(false)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Nội dung chi tiết kết quả phân tích */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto pr-1">
                  {/* Cột 1 & 2: Danh sách kỹ năng */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Tóm tắt điểm số nhanh trong Modal */}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <ScoreRing score={modalScore} size={80} />
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          Điểm tương thích tổng thể
                        </p>
                        <p className="text-xs text-slate-500">
                          Hệ thống ghi nhận độ tương thích cốt lõi đạt{" "}
                          {modalScore}%.
                        </p>
                      </div>
                    </div>

                    <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                      <div className="bg-emerald-50/50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />{" "}
                          Tương thích mạnh ({strongMatches.length})
                        </span>
                      </div>
                      <div className="p-4 flex flex-wrap gap-2">
                        {strongMatches.length > 0 ? (
                          strongMatches.map((item: any) => (
                            <span
                              key={item.skill_id}
                              className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full"
                            >
                              {item.skill_name} (
                              {Math.round(item.similarity * 100)}%)
                            </span>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            Không có kỹ năng tương thích mạnh.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                      <div className="bg-amber-50/50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600" />{" "}
                          Tương thích một phần ({partialMatches.length})
                        </span>
                      </div>
                      <div className="p-4 flex flex-wrap gap-2">
                        {partialMatches.length > 0 ? (
                          partialMatches.map((item: any) => (
                            <span
                              key={item.skill_id}
                              className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full"
                            >
                              {item.skill_name} (
                              {Math.round(item.similarity * 100)}%)
                            </span>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            Không có kỹ năng tương thích một phần.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                      <div className="bg-red-50/50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-red-700 uppercase tracking-wide flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-red-500" /> Kỹ năng
                          thiếu ({missingSkills.length})
                        </span>
                      </div>
                      <div className="p-4 flex flex-wrap gap-2">
                        {missingSkills.length > 0 ? (
                          missingSkills.map((item: any) => (
                            <span
                              key={item.skill_id}
                              className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-100"
                            >
                              {item.skill_name}
                            </span>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            Tuyệt vời! Không thiếu kỹ năng nào.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex flex-col justify-center items-center min-h-[300px]">
                    <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide self-start">
                      Biểu đồ radar kỹ năng
                    </p>

                    {modalCategories.length > 0 && (
                      <div className="w-full mb-3">
                        <CategoryDropdown
                          categories={modalCategories}
                          selected={selectedModalCategory}
                          onSelect={(cat) =>
                            handleCategoryChange(
                              analyzeResult.match_id,
                              cat,
                              true,
                            )
                          }
                          isLoading={isCategoryLoading}
                        />
                      </div>
                    )}

                    <ResponsiveContainer width="100%" height={240}>
                      <RadarChart
                        data={
                          modalRadarDataFiltered.length > 0 ||
                          selectedModalCategory !== "All"
                            ? modalRadarDataFiltered
                            : modalRadarData
                        }
                        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                      >
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fontSize: 9, fill: "#64748b" }}
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
                        <Tooltip content={<CustomRadarTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 justify-center mt-3 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-600">
                        <span className="w-3 h-0.5 bg-blue-500 inline-block rounded-full" />{" "}
                        Bạn
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <span className="w-3 h-0.5 bg-emerald-500 inline-block rounded-full" />{" "}
                        Yêu cầu
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer chứa Action đặt làm Default */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4 mt-auto">
                  <div className="flex items-center gap-2 text-slate-600 text-xs text-center sm:text-left">
                    <Info className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
                    <span>
                      Bạn có muốn đặt CV này làm mặc định? Hệ thống sẽ tự động
                      ghim lượt đối sánh cao điểm nhất của CV này làm dữ liệu
                      hiển thị chính trên Dashboard.
                    </span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => setShowResultModal(false)}
                      className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Bỏ qua
                    </button>
                    <button
                      onClick={handleSetDefaultFromModal}
                      className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm transition-colors"
                    >
                      Đặt làm mặc định
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {viewingCvUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-slate-100">
            {/* Header của Popup */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-violet-600 shrink-0" />
                <h3 className="text-sm font-bold text-slate-800 truncate">
                  Chi tiết tài liệu: {viewingCvName}
                </h3>
              </div>
              <button
                onClick={() => {
                  setViewingCvUrl(null);
                  setViewingCvName("");
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-slate-100 p-4 flex justify-center items-center overflow-auto">
              {viewingCvUrl.toLowerCase().includes(".pdf") ? (
                <iframe
                  src={`${viewingCvUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-full rounded-lg bg-white border border-slate-200"
                  title="PDF Preview"
                />
              ) : (
                <div className="max-w-full max-h-full overflow-auto flex justify-center">
                  <img
                    src={viewingCvUrl}
                    alt="CV Preview"
                    className="max-w-full h-auto object-contain rounded-lg shadow-md bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
