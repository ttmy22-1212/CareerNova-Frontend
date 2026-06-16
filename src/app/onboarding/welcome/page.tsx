"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  GraduationCap,
  Compass,
  FileText,
  Loader2,
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

const interestLabelMap = interests.reduce(
  (acc, item) => {
    acc[item.value] = item.label;
    return acc;
  },
  {} as Record<CareerInterest, string>,
);

const careerResultOrder: CareerInterest[] = [
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "data",
  "ai_ml",
  "devops",
  "cybersecurity",
  "qa",
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

const quizQuestions: {
  q: string;
  options: {
    text: string;
    weights: Partial<Record<CareerInterest, number>>;
  }[];
}[] = [
  {
    q: "Bạn thích làm việc với gì hơn?",
    options: [
      {
        text: "Giao diện người dùng đẹp, tương tác mượt",
        weights: { frontend: 2, mobile: 1 },
      },
      {
        text: "Logic phức tạp, hệ thống chịu tải lớn",
        weights: { backend: 2, devops: 1 },
      },
      {
        text: "Số liệu, thuật toán, mô hình dự đoán",
        weights: { data: 2, ai_ml: 1 },
      },
      {
        text: "Bảo mật, audit, tìm lỗ hổng",
        weights: { cybersecurity: 2, qa: 1 },
      },
    ],
  },
  {
    q: "Phong cách làm việc của bạn?",
    options: [
      {
        text: "Visual & sáng tạo — thích thấy kết quả ngay",
        weights: { frontend: 2, mobile: 1 },
      },
      {
        text: "Logic & cấu trúc — thích tối ưu, refactor",
        weights: { backend: 2, fullstack: 1 },
      },
      {
        text: "Tỉ mỉ & phân tích — thích đào sâu data",
        weights: { data: 2, ai_ml: 1, qa: 1 },
      },
      {
        text: "Hệ thống & tự động — thích hạ tầng",
        weights: { devops: 2, cybersecurity: 1 },
      },
    ],
  },
  {
    q: "Khi gặp lỗi, bạn thường?",
    options: [
      {
        text: "Inspect element, thử nhiều UI khác nhau",
        weights: { frontend: 2, mobile: 1 },
      },
      {
        text: "Đọc log, debug step-by-step",
        weights: { backend: 2, fullstack: 1 },
      },
      {
        text: "Phân tích pattern, viết test reproduce",
        weights: { qa: 2, backend: 1 },
      },
      {
        text: "Dựng môi trường mô phỏng để cô lập",
        weights: { devops: 2, cybersecurity: 1 },
      },
    ],
  },
  {
    q: "Mục tiêu sự nghiệp 5 năm tới?",
    options: [
      {
        text: "Senior Engineer, làm sản phẩm cho hàng triệu user",
        weights: { fullstack: 2, frontend: 1, backend: 1, mobile: 1 },
      },
      {
        text: "ML Engineer / Data Scientist",
        weights: { ai_ml: 2, data: 1 },
      },
      {
        text: "Cloud Architect / SRE",
        weights: { devops: 2, backend: 1 },
      },
      {
        text: "Security Researcher / Pentester",
        weights: { cybersecurity: 2 },
      },
      {
        text: "QA Lead / Automation Architect",
        weights: { qa: 2, backend: 1 },
      },
    ],
  },
  {
    q: "Sản phẩm nào bạn thích build nhất?",
    options: [
      {
        text: "Web app SaaS, dashboard",
        weights: { frontend: 2, fullstack: 1 },
      },
      {
        text: "Mobile app trên store",
        weights: { mobile: 2, frontend: 1 },
      },
      {
        text: "Recommendation engine, chatbot AI",
        weights: { ai_ml: 2, data: 1 },
      },
      {
        text: "API service, microservices, tool nội bộ",
        weights: { backend: 2, devops: 1 },
      },
      {
        text: "Test automation, monitoring, security tooling",
        weights: { qa: 2, cybersecurity: 1, devops: 1 },
      },
    ],
  },
];

const isQuizComplete = (answers: number[]) =>
  quizQuestions.every((question, qIdx) => {
    const answer = answers[qIdx];
    return Number.isInteger(answer) && answer >= 0 && answer < question.options.length;
  });

const getCareerQuizSuggestions = (answers: number[]): CareerInterest[] => {
  const scores = new Map<CareerInterest, number>(
    careerResultOrder.map((career) => [career, 0]),
  );

  answers.forEach((optIdx, qIdx) => {
    const option = quizQuestions[qIdx]?.options[optIdx];
    if (!option) return;

    Object.entries(option.weights).forEach(([career, weight]) => {
      const key = career as CareerInterest;
      scores.set(key, (scores.get(key) ?? 0) + Number(weight || 0));
    });
  });

  return careerResultOrder
    .map((career) => ({
      career,
      score: scores.get(career) ?? 0,
      order: careerResultOrder.indexOf(career),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, 3)
    .map((item) => item.career);
};

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

  const [dbSkills, setDbSkills] = useState<string[]>([]);
  const [isSearchingSkills, setIsSearchingSkills] = useState(false);
  const [uploadedCvId, setUploadedCvId] = useState<string | null>(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [cvUploadError, setCvUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [calculatedPaths, setCalculatedPaths] = useState<CareerInterest[]>([]);

  // 1. Kiểm tra trạng thái Onboarding từ database khi vừa tải trang
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const res = await ProfileApi.getOnboardingStatus();
        if (res.data) {
          const { onboarding_completed, current_step } = res.data;
          if (onboarding_completed) {
            router.push(paths.personalDashboard);
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

  // Tự động tải danh sách kĩ năng ban đầu từ API thực tế khi người dùng bước vào Step 3
  useEffect(() => {
    if (step === 3) {
      const fetchInitialSkills = async () => {
        try {
          setIsSearchingSkills(true);
          const res = await JobApi.getSkills({ q: "" });
          if (res.data?.data) {
            const skillNames = res.data.data.map(
              (s: any) => s.skill_name || s.name,
            );
            setDbSkills(skillNames);
          }
        } catch (err) {
          console.error("Lỗi lấy danh sách skill mặc định từ API:", err);
        } finally {
          setIsSearchingSkills(false);
        }
      };
      fetchInitialSkills();
    }
  }, [step]);

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
      const suggested = getCareerQuizSuggestions(quizAnswers);
      const selectedOrientation = profile.interests.join(",");
      const quizOrientation = suggested.join(",");
      const orientation =
        selectedOrientation || quizOrientation
          ? `${selectedOrientation}${quizOrientation ? `|${quizOrientation}` : ""}`
          : undefined;

      setProfile({
        quizDone: true,
        suggestedPaths: suggested,
        completedAt: new Date().toISOString(),
      });

      await ProfileApi.updateOnboardingProgress({
        current_step: 5,
        orientation,
      });
      await ProfileApi.completeOnboarding();

      setCalculatedPaths(suggested); // Lưu kết quả vào state để hiện lên UI
      setShowResult(true); // Bật màn hình hiển thị kết quả
    } catch (error) {
      console.error("Lỗi:", error);
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
    if (step === 5) return isQuizComplete(quizAnswers);
    return false;
  }, [step, profile, quizAnswers, isLoading, isUploadingCv, isSearchingSkills]);

  const handleSkillInputChange = async (value: string) => {
    setSkillInput(value);
    try {
      setIsSearchingSkills(true);
      const res = await JobApi.getSkills({ q: value.trim() });
      if (Array.isArray(res.data)) {
        const skillNames = res.data.map((s: any) => s.skill_name || s.name);
        setDbSkills(skillNames);
      }
    } catch (err) {
      console.error("Lỗi tìm kiếm kĩ năng:", err);
    } finally {
      setIsSearchingSkills(false);
    }
  };

  const addSkill = async (name: string) => {
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

    // Sau khi add thành công, gọi lại API chuỗi rỗng để khôi phục danh sách gợi ý ban đầu
    try {
      setIsSearchingSkills(true);
      const res = await JobApi.getSkills({ q: "" });
      if (Array.isArray(res.data)) {
        const skillNames = res.data.map((s: any) => s.skill_name || s.name);
        setDbSkills(skillNames);
      }
    } catch (err) {
      console.error("Lỗi khôi phục danh sách gợi ý:", err);
    } finally {
      setIsSearchingSkills(false);
    }
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

  const handleCvUpload = async (file: File | null) => {
    if (!file) {
      setProfile({ hasUploadedCV: false, cvFileName: null });
      setUploadedCvId(null);
      return;
    }

    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setCvUploadError("Vui lòng tải lên tài liệu định dạng PDF hoặc Ảnh (.pdf, .jpg, .jpeg, .png)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvUploadError("File phải nhỏ hơn 5MB");
      return;
    }

    try {
      setIsUploadingCv(true);
      setCvUploadError(null);
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
      setCvUploadError("Tải file CV thất bại, vui lòng thử lại!");
    } finally {
      setIsUploadingCv(false);
    }
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-10 flex items-center justify-center">
        <div className="mx-auto max-w-md w-full text-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 animate-bounce">
            <Check className="h-7 w-7 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Chúc mừng bạn!</h1>
          <p className="mt-1 text-sm text-slate-500 mb-6">
            Dựa trên Kiểm tra hướng nghiệp, đây là các định hướng phù hợp nhất
            với bạn:
          </p>

          <div className="space-y-2.5 mb-8">
            {calculatedPaths.map((path) => (
              <div
                key={path}
                className="py-3 px-4 rounded-xl border border-blue-100 bg-blue-50/50 font-semibold text-blue-700 text-sm tracking-wide shadow-sm"
              >
                🚀 {interestLabelMap[path] ?? path}
              </div>
            ))}
          </div>

          {/* Bắc cầu sang lộ trình nghề nghiệp dựa trên CV (data-driven) */}
          <div className="mb-3 rounded-xl border border-violet-100 bg-violet-50/60 p-4 text-left">
            <p className="text-sm font-bold text-violet-900">
              Muốn biết mình <span className="underline">thực sự</span> hợp hướng
              nào?
            </p>
            <p className="mt-0.5 mb-3 text-xs text-violet-700">
              {profile.hasUploadedCV
                ? "Xem lộ trình nghề nghiệp dựa trên CV thật của bạn — kèm mức độ sẵn sàng và kỹ năng cần bổ sung."
                : "Tải CV để hệ thống đối soát và gợi ý vai trò phù hợp nhất với năng lực thật của bạn."}
            </p>
            <button
              onClick={() =>
                router.push(
                  profile.hasUploadedCV
                    ? paths.recommendations
                    : paths.cvMatching,
                )
              }
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-300 transition-all hover:opacity-90"
            >
              {profile.hasUploadedCV
                ? "Xem lộ trình nghề nghiệp đề xuất"
                : "Tải CV & xem vai trò phù hợp"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => router.push(paths.personalDashboard)}
            className="w-full text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            Để sau, đi tới trang cá nhân
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-300">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Chào mừng đến Career Nova
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
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Tiến độ được lưu tự động — bạn có thể thoát và quay lại bất cứ lúc
            nào.
          </p>
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
              setSkillInput={handleSkillInputChange}
              addSkill={addSkill}
              removeSkill={removeSkill}
              updateLevel={updateLevel}
              onCV={handleCvUpload}
              dbSkills={dbSkills}
              isUploadingCv={isUploadingCv}
              cvUploadError={cvUploadError}
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
            onClick={() => router.push(paths.personalDashboard)}
            disabled={isLoading}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-40"
          >
            Bỏ qua, vào trang cá nhân
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
  dbSkills = [],
  isUploadingCv = false,
  cvUploadError = null,
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
  isUploadingCv?: boolean;
  cvUploadError?: string | null;
}) {
  const cvFileInputRef = useRef<HTMLInputElement>(null);
  // Lọc suggestions dựa trực tiếp vào mảng dbSkills nhận từ API, loại bỏ những kĩ năng đã chọn
  const suggestions = useMemo(() => {
    const selectedNames = skills.map((s) => s.name.toLowerCase());
    return dbSkills
      .filter((p) => p && !selectedNames.includes(p.toLowerCase()))
      .slice(0, 6);
  }, [skills, dbSkills]);

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-900">
        Skill & CV của bạn
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Khai báo 3-8 skill mạnh nhất + level. Tải CV để chúng tôi phân tích
        chính xác hơn (tùy chọn).
      </p>

      {/* CV Upload */}
      <div className="mb-5">
        <input
          type="file"
          ref={cvFileInputRef}
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => onCV(e.target.files?.[0] ?? null)}
        />
        <div
          onClick={() => !isUploadingCv && cvFileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-xl px-4 py-3 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-center min-h-[64px]"
        >
          {isUploadingCv ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <span className="text-xs font-medium text-slate-600">Đang tải lên...</span>
            </div>
          ) : hasCV ? (
            <div className="flex items-center gap-2 w-full justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[200px]">
                {cvName}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium shrink-0">(Hoàn tất)</span>
              <button
                onClick={(e) => { e.stopPropagation(); onCV(null); }}
                className="text-xs text-red-500 hover:underline shrink-0"
              >
                Xoá
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 text-slate-500">
                <Upload className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">
                  Bấm để Tải CV (PDF/DOCX)
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Tối đa 5MB. Tùy chọn.</span>
            </div>
          )}
        </div>
        {cvUploadError && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" /> {cvUploadError}
          </p>
        )}
        {hasCV && skills.length > 0 && (
          <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            Đã nhận diện {skills.length} kỹ năng từ CV của bạn — kiểm tra & bổ
            sung bên dưới.
          </p>
        )}
      </div>

      {/* Skill input */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Top skills{" "}
        <span className="ml-1 font-normal normal-case text-slate-400">
          ({skills.length}/8 — tối thiểu 3)
        </span>
      </p>

      {/* Hộp cô lập cụm ô nhập và bảng gợi ý */}
      <div className="relative w-full mb-4">
        <div className="flex gap-2">
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

        {/* Thanh Suggestions - Cho hiển thị absolute rớt hẳn xuống dưới mà không ảnh hưởng div xung quanh */}
        {suggestions.length > 0 && skillInput.trim() !== "" && (
          <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-wrap gap-1.5 w-full">
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
      </div>

      {/* Selected skills */}
      <div className="mt-4 space-y-2 block clear-both">
        {skills.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            <span className="flex-1 text-sm font-medium text-slate-800">
              {s.name}
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
      <h2 className="mb-1 text-xl font-bold text-slate-900">
        Kiểm tra hướng nghiệp
      </h2>
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
