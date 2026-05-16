"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  Compass,
  FileText,
  Target as TargetIcon,
  Sparkles,
  Upload,
  Briefcase,
  Code2,
  Smartphone,
  Brain,
  Database,
  Server,
  Wrench,
  Shield,
  Bug,
  Layers,
} from "lucide-react";
import {
  CareerInterest,
  Goal,
  StudentMajor,
  StudentYear,
  useOnboarding,
} from "@/contexts/onboarding/onboarding-context";
import { paths } from "@/paths";
import ProfileApi from "@/api/profile";
import JobApi from "@/api/job";
import CvApi from "@/api/cv";

const TOTAL_STEPS = 5;

const majors: { value: StudentMajor; label: string; desc: string }[] = [
  { value: "CS", label: "Khoa học Máy tính", desc: "Computer Science" },
  { value: "SE", label: "Kỹ thuật Phần mềm", desc: "Software Engineering" },
  { value: "IS", label: "Hệ thống Thông tin", desc: "Information Systems" },
  { value: "IT", label: "Công nghệ Thông tin", desc: "Information Technology" },
  { value: "AI", label: "Trí tuệ Nhân tạo", desc: "AI / Data Science" },
  { value: "DA", label: "Phân tích Dữ liệu", desc: "Data Analytics" },
  { value: "Other", label: "Ngành khác", desc: "Liên quan IT" },
];

const interests: {
  value: CareerInterest;
  label: string;
  Icon: any;
  tone: string;
}[] = [
  { value: "frontend", label: "Frontend", Icon: Code2, tone: "blue" },
  { value: "backend", label: "Backend", Icon: Server, tone: "indigo" },
  { value: "fullstack", label: "Fullstack", Icon: Layers, tone: "violet" },
  { value: "mobile", label: "Mobile", Icon: Smartphone, tone: "emerald" },
  { value: "data", label: "Data", Icon: Database, tone: "cyan" },
  { value: "ai_ml", label: "AI / ML", Icon: Brain, tone: "fuchsia" },
  { value: "devops", label: "DevOps", Icon: Wrench, tone: "amber" },
  { value: "cybersecurity", label: "Security", Icon: Shield, tone: "red" },
  { value: "qa", label: "QA / Test", Icon: Bug, tone: "lime" },
];

const goals: { value: Goal; label: string; desc: string; Icon: any }[] = [
  {
    value: "internship",
    label: "Tìm thực tập",
    desc: "Internship trong 3-6 tháng tới",
    Icon: GraduationCap,
  },
  {
    value: "fulltime",
    label: "Tìm việc fulltime",
    desc: "Bắt đầu sự nghiệp sau tốt nghiệp",
    Icon: Briefcase,
  },
  {
    value: "switch",
    label: "Chuyển hướng",
    desc: "Đổi mảng kỹ thuật",
    Icon: Compass,
  },
  {
    value: "explore",
    label: "Khám phá",
    desc: "Chưa rõ định hướng, muốn tìm hiểu",
    Icon: Sparkles,
  },
];

const popularSkills = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "React",
  "Next.js",
  "Vue",
  "Angular",
  "Node.js",
  "Express",
  "Spring Boot",
  "Django",
  "FastAPI",
  "Flask",
  "Tailwind CSS",
  "HTML/CSS",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "SQL",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Linux",
  "Git",
  "Flutter",
  "React Native",
  "Swift",
  "Kotlin",
  "TensorFlow",
  "PyTorch",
  "Pandas",
  "NumPy",
  "Scikit-learn",
];

const quizQuestions: {
  q: string;
  options: { text: string; tags: CareerInterest[] }[];
}[] = [
  {
    q: "Bạn thích làm việc với gì hơn?",
    options: [
      {
        text: "Giao diện người dùng đẹp, tương tác mượt",
        tags: ["frontend", "mobile"],
      },
      {
        text: "Logic phức tạp, hệ thống chịu tải lớn",
        tags: ["backend", "devops"],
      },
      { text: "Số liệu, thuật toán, mô hình dự đoán", tags: ["data", "ai_ml"] },
      { text: "Bảo mật, audit, tìm lỗ hổng", tags: ["cybersecurity", "qa"] },
    ],
  },
  {
    q: "Phong cách làm việc của bạn?",
    options: [
      {
        text: "Visual & sáng tạo — thích thấy kết quả ngay",
        tags: ["frontend", "mobile"],
      },
      {
        text: "Logic & cấu trúc — thích tối ưu, refactor",
        tags: ["backend", "fullstack"],
      },
      {
        text: "Tỉ mỉ & phân tích — thích đào sâu data",
        tags: ["data", "ai_ml"],
      },
      {
        text: "Hệ thống & tự động — thích hạ tầng",
        tags: ["devops", "cybersecurity"],
      },
    ],
  },
  {
    q: "Khi gặp lỗi, bạn thường?",
    options: [
      { text: "Inspect element, thử nhiều UI khác nhau", tags: ["frontend"] },
      { text: "Đọc log, debug step-by-step", tags: ["backend", "fullstack"] },
      {
        text: "Phân tích pattern, viết test reproduce",
        tags: ["qa", "backend"],
      },
      { text: "Dựng môi trường mô phỏng để cô lập", tags: ["devops"] },
    ],
  },
  {
    q: "Mục tiêu sự nghiệp 5 năm tới?",
    options: [
      {
        text: "Senior Engineer, làm sản phẩm cho hàng triệu user",
        tags: ["fullstack", "frontend", "backend"],
      },
      { text: "ML Engineer / Data Scientist", tags: ["ai_ml", "data"] },
      { text: "Cloud Architect / SRE", tags: ["devops"] },
      { text: "Security Researcher / Pentester", tags: ["cybersecurity"] },
    ],
  },
  {
    q: "Sản phẩm nào bạn thích build nhất?",
    options: [
      { text: "Web app SaaS, dashboard", tags: ["frontend", "fullstack"] },
      { text: "Mobile app trên store", tags: ["mobile"] },
      { text: "Recommendation engine, chatbot AI", tags: ["ai_ml", "data"] },
      {
        text: "API service, microservices, tool nội bộ",
        tags: ["backend", "devops"],
      },
    ],
  },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const { profile, setProfile } = useOnboarding();
  const initialStep = Math.min(
    Math.max(parseInt(params.get("step") ?? "1", 10) || 1, 1),
    TOTAL_STEPS,
  );
  const [step, setStep] = useState(initialStep);
  const [skillInput, setSkillInput] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

  // Các States bổ sung hỗ trợ quản lý tích hợp API chuyên sâu
  const [dbSkills, setDbSkills] = useState<string[]>([]);
  const [isSearchingSkills, setIsSearchingSkills] = useState(false);
  const [uploadedCvId, setUploadedCvId] = useState<string | null>(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Kiểm tra trạng thái Onboarding từ database khi vừa tải trang
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const res = await ProfileApi.getOnboardingStatus();
        if (res.data) {
          const { onboarding_completed, current_step } = res.data;
          if (onboarding_completed) {
            router.push(paths.dashboard);
            return;
          }
          if (
            current_step &&
            current_step >= 1 &&
            current_step <= TOTAL_STEPS
          ) {
            setStep(current_step);
          }
        }
      } catch (err) {
        console.error("Lỗi kiểm tra trạng thái onboarding:", err);
      }
    };
    checkOnboardingStatus();
  }, [router]);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  const progress = (step / TOTAL_STEPS) * 100;

  const next = async () => {
    try {
      setIsLoading(true);
      switch (step) {
        case 1:
          await ProfileApi.updateOnboardingProgress({
            current_step: 2,
            major: profile.major || undefined,
            school: profile.university,
          });
          setStep((s) => Math.min(s + 1, TOTAL_STEPS));
          break;

        case 2:
          await ProfileApi.updateOnboardingProgress({
            current_step: 3,
            current_year: Number(profile.year),
            orientation: profile.interests.join(","),
          });
          setStep((s) => Math.min(s + 1, TOTAL_STEPS));
          break;

        case 3:
          await CvApi.syncProfileSkills({
            cv_id: uploadedCvId,
            skills: profile.topSkills.map((s) => s.name),
          });
          await ProfileApi.updateOnboardingProgress({
            current_step: 4,
          });
          setStep((s) => Math.min(s + 1, TOTAL_STEPS));
          break;

        case 4:
          await ProfileApi.updateOnboardingProgress({
            current_step: 5,
            objective: profile.goal || undefined,
            target_salary: profile.targetSalaryUSD
              ? Number(profile.targetSalaryUSD)
              : undefined,
            prefer_remote: profile.preferRemote,
          });
          setStep((s) => Math.min(s + 1, TOTAL_STEPS));
          break;

        default:
          setStep((s) => Math.min(s + 1, TOTAL_STEPS));
          break;
      }
    } catch (error) {
      console.error(`Gặp lỗi khi lưu tiến độ bước ${step}:`, error);
      alert("Đã có lỗi hệ thống xảy ra khi lưu tiến trình, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const finish = async () => {
    try {
      setIsLoading(true);
      const tally = new Map<CareerInterest, number>();
      quizAnswers.forEach((optIdx, qIdx) => {
        const opt = quizQuestions[qIdx]?.options[optIdx];
        opt?.tags.forEach((t) => tally.set(t, (tally.get(t) ?? 0) + 1));
      });
      const suggested = Array.from(tally.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([t]) => t);

      setProfile({
        quizDone: quizAnswers.length === quizQuestions.length,
        suggestedPaths: suggested,
        completedAt: new Date().toISOString(),
      });

      await ProfileApi.completeOnboarding();

      router.push(paths.dashboard);
    } catch (error) {
      console.error("Lỗi hoàn tất onboarding:", error);
      alert("Không thể hoàn thành khảo sát, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const canNext = useMemo(() => {
    if (isLoading || isUploadingCv || isSearchingSkills) return false;
    if (step === 1) return !!profile.major;
    if (step === 2) return !!profile.year && profile.interests.length > 0;
    if (step === 3) return profile.topSkills.length >= 3;
    if (step === 4) return !!profile.goal;
    if (step === 5) return quizAnswers.length === quizQuestions.length;
    return false;
  }, [step, profile, quizAnswers, isLoading, isUploadingCv, isSearchingSkills]);

  const handleSkillInputChange = async (value: string) => {
    setSkillInput(value);
    if (!value.trim()) {
      setDbSkills([]);
      return;
    }
    try {
      setIsSearchingSkills(true);
      const res = await JobApi.getSkills({ q: value });
      if (res.data?.data) {
        // Map mảng object kỹ năng từ database trả về thành chuỗi string tên kĩ năng
        const skillNames = res.data.data.map(
          (s: any) => s.skill_name || s.name,
        );
        setDbSkills(skillNames);
      }
    } catch (err) {
      console.error("Lỗi tìm kiếm kĩ năng:", err);
    } finally {
      setIsSearchingSkills(false);
    }
  };

  const addSkill = (name: string) => {
    if (!name.trim()) return;
    if (
      profile.topSkills.find((s) => s.name.toLowerCase() === name.toLowerCase())
    )
      return;
    if (profile.topSkills.length >= 8) return;
    setProfile({
      topSkills: [...profile.topSkills, { name: name.trim(), level: 3 }],
    });
    setSkillInput("");
    setDbSkills([]); // Clear gợi ý cũ sau khi chọn
  };

  const removeSkill = (name: string) => {
    setProfile({ topSkills: profile.topSkills.filter((s) => s.name !== name) });
  };

  const updateLevel = (name: string, level: number) => {
    setProfile({
      topSkills: profile.topSkills.map((s) =>
        s.name === name ? { ...s, level } : s,
      ),
    });
  };

  // 5. Xử lý tải file CV thực tế lên Cloudinary qua API hệ thống
  const handleCvUpload = async (file: File | null) => {
    if (!file) {
      setProfile({ hasUploadedCV: false, cvFileName: null });
      setUploadedCvId(null);
      return;
    }

    try {
      setIsUploadingCv(true);
      const res = await CvApi.uploadCv(file);
      if (res.data) {
        const { cv_id, file_name } = res.data;
        setUploadedCvId(cv_id);

        setProfile({ hasUploadedCV: true, cvFileName: file_name });
        const parsed_skills = (res.data as any).parsed_skills;
        if (parsed_skills && Array.isArray(parsed_skills)) {
          const formattedParsed = parsed_skills.map((skillName: string) => ({
            name: skillName,
            level: 3,
          }));
          const mergedSkills = [...profile.topSkills];
          formattedParsed.forEach((newSkill: any) => {
            if (
              !mergedSkills.find(
                (s) => s.name.toLowerCase() === newSkill.name.toLowerCase(),
              )
            ) {
              if (mergedSkills.length < 8) mergedSkills.push(newSkill);
            }
          });
          setProfile({ topSkills: mergedSkills });
        }
      }
    } catch (err) {
      console.error("Lỗi tải CV lên hệ thống:", err);
      alert("Tải file CV thất bại, vui lòng thử lại!");
    } finally {
      setIsUploadingCv(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-300">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Chào mừng đến Career Insight
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            5 bước (~5 phút) để nhận gợi ý cá nhân hóa cho riêng bạn
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600">
              Bước {step}/{TOTAL_STEPS}
            </span>
            <span className="text-blue-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-[10px] font-medium text-slate-500">
            {["Ngành học", "Định hướng", "Skill & CV", "Mục tiêu", "Quiz"].map(
              (label, i) => (
                <span
                  key={label}
                  className={i + 1 <= step ? "text-blue-600 font-semibold" : ""}
                >
                  {label}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Step body */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          {step === 1 && (
            <Step1
              major={profile.major}
              university={profile.university}
              onMajor={(m) => setProfile({ major: m })}
              onUni={(u) => setProfile({ university: u })}
            />
          )}
          {step === 2 && (
            <Step2
              year={profile.year}
              interests={profile.interests}
              onYear={(y) => setProfile({ year: y })}
              onToggle={(v) => {
                const has = profile.interests.includes(v);
                setProfile({
                  interests: has
                    ? profile.interests.filter((i) => i !== v)
                    : [...profile.interests, v].slice(0, 3),
                });
              }}
            />
          )}
          {step === 3 && (
            <Step3
              skills={profile.topSkills}
              hasCV={profile.hasUploadedCV}
              cvName={profile.cvFileName}
              skillInput={skillInput}
              setSkillInput={handleSkillInputChange} // Gắn hàm gọi API search ở đây
              addSkill={addSkill}
              removeSkill={removeSkill}
              updateLevel={updateLevel}
              onCV={handleCvUpload} // Gắn hàm xử lý tải CV thực tế lên server ở đây
              dbSkills={dbSkills} // Truyền dữ liệu gợi ý lấy từ DB xuống
            />
          )}
          {step === 4 && (
            <Step4
              goal={profile.goal}
              targetSalary={profile.targetSalaryUSD}
              preferRemote={profile.preferRemote}
              onGoal={(g) => setProfile({ goal: g })}
              onSalary={(v) => setProfile({ targetSalaryUSD: v })}
              onRemote={(v) => setProfile({ preferRemote: v })}
            />
          )}
          {step === 5 && (
            <Step5 answers={quizAnswers} setAnswers={setQuizAnswers} />
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={prev}
            disabled={step === 1 || isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </button>

          <button
            onClick={() => router.push(paths.dashboard)}
            disabled={isLoading}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-40"
          >
            Bỏ qua, vào ngay dashboard
          </button>

          {step < TOTAL_STEPS ? (
            <button
              onClick={next}
              disabled={!canNext}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-300 transition-all hover:shadow-lg disabled:opacity-40 disabled:shadow-none"
            >
              {isLoading ? "Đang xử lý..." : "Tiếp tục"}{" "}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={!canNext}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-300 transition-all hover:shadow-lg disabled:opacity-40 disabled:shadow-none"
            >
              {isLoading ? "Đang lưu..." : "Hoàn tất"}{" "}
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Step components ─────────── */

function Step1({
  major,
  university,
  onMajor,
  onUni,
}: {
  major: StudentMajor | null;
  university: string;
  onMajor: (m: StudentMajor) => void;
  onUni: (u: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-900">
        Bạn học ngành gì?
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Chọn ngành gần nhất với chuyên môn của bạn để chúng tôi gợi ý career
        path phù hợp.
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {majors.map((m) => (
          <button
            key={m.value}
            onClick={() => onMajor(m.value)}
            className={`rounded-xl border p-3 text-left transition-all ${
              major === m.value
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <p className="text-sm font-semibold text-slate-900">{m.label}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">{m.desc}</p>
          </button>
        ))}
      </div>
      <div className="mt-5">
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
          Trường đại học (tùy chọn)
        </label>
        <input
          value={university}
          onChange={(e) => onUni(e.target.value)}
          placeholder="VD: Đại học Bách Khoa, FPT University..."
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}

function Step2({
  year,
  interests: chosen,
  onYear,
  onToggle,
}: {
  year: StudentYear | null;
  interests: CareerInterest[];
  onYear: (y: StudentYear) => void;
  onToggle: (v: CareerInterest) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-900">
        Năm học & định hướng
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Chọn 1-3 mảng bạn quan tâm nhất. Có thể đổi sau.
      </p>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Bạn đang học năm
      </p>
      <div className="mb-6 flex gap-2">
        {([1, 2, 3, 4, 5] as StudentYear[]).map((y) => (
          <button
            key={y}
            onClick={() => onYear(y)}
            className={`h-10 w-10 rounded-lg border text-sm font-semibold transition-all ${
              year === y
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Định hướng quan tâm{" "}
        <span className="ml-1 font-normal normal-case text-slate-400">
          ({chosen.length}/3)
        </span>
      </p>
      <div className="grid grid-cols-3 gap-2.5 md:grid-cols-4">
        {interests.map((it) => {
          const active = chosen.includes(it.value);
          const disabled = !active && chosen.length >= 3;
          return (
            <button
              key={it.value}
              disabled={disabled}
              onClick={() => onToggle(it.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                active
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                  : disabled
                    ? "border-slate-100 bg-slate-50 opacity-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <it.Icon
                className={`h-5 w-5 ${active ? "text-blue-600" : "text-slate-500"}`}
              />
              <span className="text-xs font-semibold text-slate-700">
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step3({
  skills,
  hasCV,
  cvName,
  skillInput,
  setSkillInput,
  addSkill,
  removeSkill,
  updateLevel,
  onCV,
  dbSkills = [], // Nhận thêm prop để render danh sách từ API
}: {
  skills: { name: string; level: number }[];
  hasCV: boolean;
  cvName: string | null;
  skillInput: string;
  setSkillInput: (s: string) => void;
  addSkill: (s: string) => void;
  removeSkill: (s: string) => void;
  updateLevel: (s: string, lvl: number) => void;
  onCV: (file: File | null) => void;
  dbSkills?: string[];
}) {
  // Nếu không tìm kiếm trên ô Input, ưu tiên hiển thị gợi ý popularSkills cứng
  const suggestions =
    skillInput.trim() === ""
      ? popularSkills
          .filter((p) => !skills.find((s) => s.name === p))
          .slice(0, 6)
      : dbSkills.filter((p) => !skills.find((s) => s.name === p)).slice(0, 6);

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-900">
        Skill & CV của bạn
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Khai báo 3-8 skill mạnh nhất + level. Upload CV để chúng tôi phân tích
        chính xác hơn (tùy chọn).
      </p>

      {/* CV Upload */}
      <div className="mb-5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center">
        {hasCV ? (
          <div className="flex items-center justify-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-slate-700">{cvName}</span>
            <button
              onClick={() => onCV(null)}
              className="text-xs text-red-500 hover:underline"
            >
              Xoá
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-1.5">
            <Upload className="h-6 w-6 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">
              Bấm để upload CV (PDF/DOCX)
            </span>
            <span className="text-[11px] text-slate-500">
              Tối đa 5MB. Tùy chọn.
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => onCV(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </div>

      {/* Skill input */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Top skills{" "}
        <span className="ml-1 font-normal normal-case text-slate-400">
          ({skills.length}/8 — tối thiểu 3)
        </span>
      </p>

      <div className="mb-2 flex gap-2">
        <input
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill(skillInput);
            }
          }}
          placeholder="Gõ tên skill rồi Enter (vd: React, Python...)"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          onClick={() => addSkill(skillInput)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Thêm
        </button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSkill(s)}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/40"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected skills */}
      <div className="space-y-2">
        {skills.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            <span className="flex-1 text-sm font-medium text-slate-800">
              {s.name}
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => updateLevel(s.name, lvl)}
                  className={`h-2 w-6 rounded-full transition-all ${
                    lvl <= s.level
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                      : "bg-slate-200"
                  }`}
                  title={`Level ${lvl}/5`}
                />
              ))}
            </div>
            <span className="w-6 text-right text-xs font-semibold text-slate-500">
              {s.level}/5
            </span>
            <button
              onClick={() => removeSkill(s.name)}
              className="text-xs text-red-500 hover:underline"
            >
              ×
            </button>
          </div>
        ))}
        {skills.length === 0 && (
          <p className="rounded-lg bg-slate-50 px-3 py-3 text-center text-xs text-slate-500">
            Chưa có skill nào. Gõ tên skill và bấm Enter, hoặc bấm vào gợi ý ở
            trên.
          </p>
        )}
      </div>
    </div>
  );
}

function Step4({
  goal,
  targetSalary,
  preferRemote,
  onGoal,
  onSalary,
  onRemote,
}: {
  goal: Goal | null;
  targetSalary: number | null;
  preferRemote: boolean;
  onGoal: (g: Goal) => void;
  onSalary: (v: number | null) => void;
  onRemote: (v: boolean) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-900">
        Mục tiêu nghề nghiệp
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Bạn đang ở giai đoạn nào? Chúng tôi sẽ ưu tiên gợi ý phù hợp.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {goals.map((g) => (
          <button
            key={g.value}
            onClick={() => onGoal(g.value)}
            className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
              goal === g.value
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                goal === g.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <g.Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{g.label}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{g.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Lương mong muốn (USD/năm, tùy chọn)
          </label>
          <input
            type="number"
            value={targetSalary ?? ""}
            onChange={(e) =>
              onSalary(e.target.value ? Number(e.target.value) : null)
            }
            placeholder="VD: 30000"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Ước tính ~
            {targetSalary
              ? Math.round((targetSalary * 25000) / 12 / 1000000)
              : "??"}{" "}
            triệu/tháng (tỷ giá tham khảo)
          </p>
        </div>
        <div className="flex items-center">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5">
            <input
              type="checkbox"
              checked={preferRemote}
              onChange={(e) => onRemote(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700">
              Ưu tiên job Remote
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

function Step5({
  answers,
  setAnswers,
}: {
  answers: number[];
  setAnswers: (a: number[]) => void;
}) {
  const select = (qIdx: number, optIdx: number) => {
    const next = [...answers];
    next[qIdx] = optIdx;
    setAnswers(next);
  };

  const completed = answers.filter((a) => a !== undefined).length;

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-900">Career Quiz</h2>
      <p className="mb-5 text-sm text-slate-500">
        5 câu hỏi nhanh để tìm 2-3 hướng phù hợp nhất. ({completed}/
        {quizQuestions.length})
      </p>

      <div className="space-y-5">
        {quizQuestions.map((q, qIdx) => (
          <div
            key={qIdx}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
          >
            <p className="mb-3 text-sm font-semibold text-slate-800">
              {qIdx + 1}. {q.q}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                const active = answers[qIdx] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => select(qIdx, optIdx)}
                    className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                      active
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                        active
                          ? "border-blue-600 bg-blue-600"
                          : "border-slate-300"
                      }`}
                    >
                      {active && <Check className="h-2.5 w-2.5 text-white" />}
                    </div>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
