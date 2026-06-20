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
  Lightbulb,
  Users,
  Headphones,
  Megaphone,
  LineChart,
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

const TOTAL_STEPS = 4;

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
  { value: "product", label: "Product / PM", Icon: Lightbulb, tone: "orange" },
  {
    value: "engineering_manager",
    label: "Quản lý Kỹ thuật",
    Icon: Users,
    tone: "teal",
  },
  { value: "it_support", label: "IT Support", Icon: Headphones, tone: "sky" },
  { value: "devrel", label: "DevRel / Đào tạo", Icon: Megaphone, tone: "rose" },
  {
    value: "business_analyst",
    label: "Business Analyst",
    Icon: LineChart,
    tone: "pink",
  },
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
  "product",
  "engineering_manager",
  "it_support",
  "devrel",
  "business_analyst",
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

// ── Bài trắc nghiệm hướng nghiệp theo RIASEC (Holland Codes / O*NET Interest Profiler) ──
// Nguồn: J. Holland — Theory of Vocational Choice; O*NET Interest Profiler (U.S. Dept of Labor).
type Riasec = "R" | "I" | "A" | "S" | "E" | "C";

const RIASEC_META: Record<
  Riasec,
  { label: string; short: string; desc: string }
> = {
  R: {
    label: "Thực hành",
    short: "Realistic",
    desc: "Thích làm việc với hệ thống, máy móc, hạ tầng và tự động hóa.",
  },
  I: {
    label: "Phân tích",
    short: "Investigative",
    desc: "Thích nghiên cứu, giải quyết vấn đề bằng logic và dữ liệu.",
  },
  A: {
    label: "Sáng tạo",
    short: "Artistic",
    desc: "Thích thiết kế, thẩm mỹ và tạo ra cái mới.",
  },
  S: {
    label: "Xã hội",
    short: "Social",
    desc: "Thích giúp đỡ, hướng dẫn và làm việc cùng người khác.",
  },
  E: {
    label: "Quản trị",
    short: "Enterprising",
    desc: "Thích dẫn dắt, thuyết phục và khởi xướng.",
  },
  C: {
    label: "Quy chuẩn",
    short: "Conventional",
    desc: "Thích sự tỉ mỉ, tổ chức và quy trình chính xác.",
  },
};

// 18 hoạt động (3/nhóm), phong cách O*NET: "Bạn thích hoạt động này tới mức nào?"
const riasecItems: { text: string; dim: Riasec }[] = [
  { text: "Cấu hình máy chủ, mạng hoặc thiết bị phần cứng", dim: "R" },
  { text: "Phân tích dữ liệu để tìm ra quy luật và kết luận", dim: "I" },
  { text: "Thiết kế giao diện đẹp, trải nghiệm người dùng mượt mà", dim: "A" },
  { text: "Hướng dẫn, hỗ trợ người khác giải quyết vấn đề kỹ thuật", dim: "S" },
  { text: "Dẫn dắt một dự án và đưa ra các quyết định quan trọng", dim: "E" },
  { text: "Kiểm thử kỹ lưỡng, đảm bảo chất lượng theo quy chuẩn", dim: "C" },
  { text: "Tự động hóa triển khai (CI/CD), dựng và vận hành hạ tầng", dim: "R" },
  { text: "Nghiên cứu thuật toán hoặc mô hình để giải bài toán khó", dim: "I" },
  { text: "Sáng tạo ý tưởng sản phẩm, hình ảnh hoặc hiệu ứng mới", dim: "A" },
  { text: "Làm việc nhóm, điều phối để mọi người cùng tiến độ", dim: "S" },
  { text: "Thuyết phục người khác ủng hộ một ý tưởng hoặc sản phẩm", dim: "E" },
  { text: "Tổ chức, quản lý dữ liệu và tài liệu một cách có hệ thống", dim: "C" },
  { text: "Làm việc với thiết bị vật lý: IoT, robot, hệ thống nhúng", dim: "R" },
  { text: "Tìm nguyên nhân gốc của một lỗi phức tạp", dim: "I" },
  { text: "Xây dựng hoạt ảnh, đồ họa hoặc bố cục trực quan", dim: "A" },
  { text: "Giải thích vấn đề kỹ thuật cho người không chuyên", dim: "S" },
  { text: "Khởi xướng sản phẩm mới, nghĩ về thị trường và người dùng", dim: "E" },
  { text: "Làm việc tỉ mỉ với quy trình, checklist, độ chính xác cao", dim: "C" },
];

// Thang Likert 5 mức (1..5)
const likertScale: { value: number; label: string }[] = [
  { value: 1, label: "Rất không thích" },
  { value: 2, label: "Không thích" },
  { value: 3, label: "Trung lập" },
  { value: 4, label: "Thích" },
  { value: 5, label: "Rất thích" },
];

// Hồ sơ sở thích RIASEC của TỪNG nghề IT — bám mã sở thích O*NET (3=chính, 2=phụ, 1=thứ ba).
// Đề xuất = so khớp hồ sơ RIASEC của user với từng hồ sơ nghề (giống cách O*NET match người↔nghề).
const ROLE_RIASEC_PROFILE: Record<
  CareerInterest,
  Partial<Record<Riasec, number>>
> = {
  frontend: { A: 3, I: 1, R: 1 }, // Web & Digital Interface Designers (A,I,R)
  mobile: { A: 2, I: 2, R: 1 }, // App dev (Software Dev + thiết kế)
  backend: { I: 3, C: 2, R: 1 }, // Software Developers (I,C,R)
  fullstack: { I: 2, A: 1, E: 1, C: 1 }, // rộng + thiên sản phẩm
  data: { I: 3, C: 2, R: 1 }, // Data Scientists (I,C,R)
  ai_ml: { I: 3, C: 1, R: 1 }, // nghiên cứu — nặng Investigative
  devops: { R: 3, C: 2, I: 1 }, // Network/Sys Admin (R,I,C)
  cybersecurity: { I: 3, C: 2, R: 1 }, // Information Security Analysts (I,C,R)
  qa: { C: 3, I: 1 }, // QA Analysts & Testers (C,I)
  product: { E: 3, I: 1, S: 1 }, // Product Manager — dẫn dắt, định hướng sản phẩm (E)
  engineering_manager: { E: 3, S: 2, I: 1 }, // Tech Lead / EM — lãnh đạo + con người (E,S)
  it_support: { S: 3, C: 2, R: 1 }, // IT Support — hỗ trợ người dùng, quy trình (S,C,R)
  devrel: { S: 3, E: 1, A: 1 }, // DevRel / Trainer — truyền đạt, cộng đồng (S)
  business_analyst: { C: 2, E: 2, I: 1, S: 1 }, // BA — cầu nối nghiệp vụ↔kỹ thuật (C,E)
};

const ITEMS_PER_DIM = 3;
const MAX_DIM_SCORE = ITEMS_PER_DIM * 5; // 15

const isQuizComplete = (answers: number[]) =>
  riasecItems.every((_, i) => {
    const a = answers[i];
    return Number.isInteger(a) && a >= 1 && a <= 5;
  });

// Tính điểm 6 nhóm RIASEC (mỗi nhóm 0..15) + phần trăm chuẩn hóa
const computeRiasecScores = (answers: number[]) => {
  const raw: Record<Riasec, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  riasecItems.forEach((item, i) => {
    const a = answers[i];
    if (Number.isInteger(a)) raw[item.dim] += a;
  });
  return (Object.keys(raw) as Riasec[])
    .map((dim) => ({
      dim,
      score: raw[dim],
      percent: Math.round((raw[dim] / MAX_DIM_SCORE) * 100),
    }))
    .sort((a, b) => b.score - a.score);
};

const getCareerQuizSuggestions = (answers: number[]): CareerInterest[] => {
  // Vector sở thích của user theo 6 nhóm RIASEC, chuẩn hóa 0..1
  const dims = computeRiasecScores(answers);
  const userVec: Record<Riasec, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  dims.forEach((d) => {
    userVec[d.dim] = d.score / MAX_DIM_SCORE;
  });

  // Điểm khớp mỗi nghề = cosine giữa vector sở thích user và vector nghề.
  // Chuẩn hoá theo độ lớn vector nghề để KHÔNG thiên vị nghề có tổng trọng số
  // lớn hoặc nhóm I (trọng số 3) — đây là nguyên nhân khiến user mạnh E/A vẫn
  // bị đẩy sang nghề thiên phân tích. (Norm của user là hằng số giữa các nghề
  // nên có thể bỏ qua mà không đổi thứ hạng.)
  return careerResultOrder
    .map((career) => {
      const entries = Object.entries(ROLE_RIASEC_PROFILE[career] || {}) as [
        Riasec,
        number,
      ][];
      const dot = entries.reduce((sum, [dim, w]) => sum + userVec[dim] * w, 0);
      const roleNorm =
        Math.sqrt(entries.reduce((s, [, w]) => s + w * w, 0)) || 1;
      return {
        career,
        score: dot / roleNorm,
        order: careerResultOrder.indexOf(career),
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, 3)
    .map((item) => item.career);
};

// Nhóm RIASEC khớp NHẤT giữa user và nghề (đóng góp lớn nhất vào điểm match) —
// dùng để giải thích "vì sao hợp" theo đúng thế mạnh của user, thay vì nhóm
// trội cố định của nghề (vốn khiến mọi nghề I-trội đều ghi "Phân tích").
const getAlignedDim = (
  career: CareerInterest,
  userVec: Record<Riasec, number>,
): Riasec | undefined => {
  const entries = Object.entries(ROLE_RIASEC_PROFILE[career] || {}) as [
    Riasec,
    number,
  ][];
  if (!entries.length) return undefined;
  return entries.sort(
    (a, b) => userVec[b[0]] * b[1] - userVec[a[0]] * a[1],
  )[0][0];
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
  // Nhánh ở bước Định hướng: "known" = đã rõ (chọn tay) · "explore" = chưa rõ (làm quiz RIASEC)
  const [directionMode, setDirectionMode] = useState<"known" | "explore" | null>(
    null,
  );

  const [dbSkills, setDbSkills] = useState<string[]>([]);
  const [isSearchingSkills, setIsSearchingSkills] = useState(false);
  // CV không tải ở onboarding nữa (chỉ khai báo kỹ năng) — uploadedCvId giữ null
  const [uploadedCvId] = useState<string | null>(null);
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

  // Khôi phục nhánh Định hướng cho user quay lại (đã làm quiz → explore; đã chọn tay → known)
  useEffect(() => {
    if (directionMode) return;
    if (profile.quizDone) setDirectionMode("explore");
    else if (profile.interests.length > 0) setDirectionMode("known");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.quizDone, profile.interests.length]);

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
            current_year: Number(profile.year),
          });
          setStep((s) => Math.min(s + 1, TOTAL_STEPS));
          break;

        case 2: {
          // Nhánh "khám phá" → suy ra định hướng từ kết quả quiz; nhánh "đã rõ" → dùng lựa chọn tay
          let orientationRoles = profile.interests;
          if (directionMode === "explore" && isQuizComplete(quizAnswers)) {
            orientationRoles = getCareerQuizSuggestions(quizAnswers);
            setProfile({ interests: orientationRoles });
          }
          await ProfileApi.updateOnboardingProgress({
            current_step: 3,
            orientation: orientationRoles.join(","),
          });
          setStep((s) => Math.min(s + 1, TOTAL_STEPS));
          break;
        }

        case 3:
          // Bước Kỹ năng cho phép bỏ qua → chỉ đồng bộ khi có dữ liệu
          if (uploadedCvId || profile.topSkills.length > 0) {
            await CvApi.syncProfileSkills({
              cv_id: uploadedCvId,
              skills: profile.topSkills.map((s) => s.name),
            });
          }
          await ProfileApi.updateOnboardingProgress({
            current_step: 4,
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
      const quizTaken = isQuizComplete(quizAnswers);
      // Định hướng: ưu tiên kết quả quiz nếu có, ngược lại dùng lựa chọn tay
      const suggested = quizTaken
        ? getCareerQuizSuggestions(quizAnswers)
        : profile.interests.slice(0, 3);

      // Hồ sơ RIASEC chỉ tính khi user đã làm quiz
      let riasec: { code: string; top: any[] } | null = null;
      if (quizTaken) {
        const top = computeRiasecScores(quizAnswers)
          .slice(0, 3)
          .map((d) => ({
            dim: d.dim,
            label: RIASEC_META[d.dim].label,
            short: RIASEC_META[d.dim].short,
            percent: d.percent,
            desc: RIASEC_META[d.dim].desc,
          }));
        riasec = { code: top.map((t) => t.dim).join(""), top };
      }

      setProfile({
        quizDone: quizTaken,
        suggestedPaths: suggested,
        riasec,
        goal: profile.goal,
        completedAt: new Date().toISOString(),
      });

      await ProfileApi.updateOnboardingProgress({
        current_step: TOTAL_STEPS,
        orientation: suggested.join(","),
        objective: profile.goal || undefined,
        target_salary: profile.targetSalaryUSD
          ? Number(profile.targetSalaryUSD)
          : undefined,
        prefer_remote: profile.preferRemote,
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
    if (isLoading || isSearchingSkills) return false;
    if (step === 1) return !!profile.major && !!profile.year;
    if (step === 2)
      return directionMode === "explore"
        ? isQuizComplete(quizAnswers)
        : directionMode === "known" && profile.interests.length > 0;
    if (step === 3) return true; // Kỹ năng — cho phép bỏ qua
    if (step === 4) return true; // Mục tiêu — cho phép bỏ qua
    return false;
  }, [
    step,
    profile,
    quizAnswers,
    directionMode,
    isLoading,
    isSearchingSkills,
  ]);

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

  if (showResult) {
    const quizTaken = isQuizComplete(quizAnswers);
    const topDims = quizTaken ? computeRiasecScores(quizAnswers).slice(0, 3) : [];
    const riasecCode = topDims.map((d) => d.dim).join("");
    // Vector sở thích user (0..1) để giải thích "vì sao hợp" theo đúng thế mạnh
    const userVec: Record<Riasec, number> = {
      R: 0,
      I: 0,
      A: 0,
      S: 0,
      E: 0,
      C: 0,
    };
    if (quizTaken)
      computeRiasecScores(quizAnswers).forEach((d) => {
        userVec[d.dim] = d.score / MAX_DIM_SCORE;
      });
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-10 flex items-center justify-center">
        <div className="mx-auto max-w-lg w-full text-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200">
            <Check className="h-7 w-7 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            {quizTaken ? "Hồ sơ hướng nghiệp của bạn" : "Hoàn tất hồ sơ!"}
          </h1>
          {quizTaken ? (
            <p className="mt-1 text-sm text-slate-500 mb-5">
              Mã sở thích nghề nghiệp (RIASEC):{" "}
              <span className="font-bold text-blue-600">{riasecCode}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500 mb-5">
              Dưới đây là các hướng nghề phù hợp với định hướng bạn đã chọn.
            </p>
          )}

          {/* Hồ sơ RIASEC — chỉ hiện khi đã làm quiz */}
          {quizTaken && (
            <div className="mb-6 space-y-3 text-left">
              {topDims.map((d) => (
                <div key={d.dim}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">
                      {RIASEC_META[d.dim].label}{" "}
                      <span className="text-xs font-normal text-slate-400">
                        ({RIASEC_META[d.dim].short})
                      </span>
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {d.percent}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      style={{ width: `${d.percent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {RIASEC_META[d.dim].desc}
                  </p>
                </div>
              ))}
            </div>
          )}

          <p className="mb-2 text-left text-sm font-semibold text-slate-800">
            Hướng nghề IT phù hợp nhất với bạn:
          </p>
          <div className="space-y-2.5 mb-8">
            {calculatedPaths.map((path) => {
              // Nhóm RIASEC mà user & nghề khớp nhất (giải thích "vì sao hợp")
              const domDim = getAlignedDim(path, userVec);
              return (
                <div
                  key={path}
                  className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-left shadow-sm"
                >
                  <p className="text-sm font-semibold text-blue-700">
                    🚀 {interestLabelMap[path] ?? path}
                  </p>
                  {quizTaken && domDim && (
                    <p className="mt-0.5 text-[11px] text-blue-600/80">
                      Hợp với thiên hướng{" "}
                      <b>{RIASEC_META[domDim].label}</b> của bạn
                    </p>
                  )}
                </div>
              );
            })}
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
            4 bước ngắn để nhận gợi ý nghề nghiệp cá nhân hóa
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
            {["Về bạn", "Định hướng", "Kỹ năng", "Mục tiêu"].map(
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
              year={profile.year}
              onMajor={(m) => setProfile({ major: m })}
              onUni={(u) => setProfile({ university: u })}
              onYear={(y) => setProfile({ year: y })}
            />
          )}
          {step === 2 && (
            <Step2
              mode={directionMode}
              setMode={(m) => {
                if (m === directionMode) return;
                setDirectionMode(m);
                // Đổi nhánh → bỏ dữ liệu nhánh đối lập để không lưu nhầm lựa
                // chọn cũ (vd: lỡ chọn "đã rõ" rồi đổi sang "khám phá").
                if (m === "known") setQuizAnswers([]);
                else setProfile({ interests: [] });
              }}
              interests={profile.interests}
              quizAnswers={quizAnswers}
              setQuizAnswers={setQuizAnswers}
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
              skillInput={skillInput}
              setSkillInput={handleSkillInputChange}
              addSkill={addSkill}
              removeSkill={removeSkill}
              updateLevel={updateLevel}
              dbSkills={dbSkills}
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
  year,
  onMajor,
  onUni,
  onYear,
}: {
  major: StudentMajor | null;
  university: string;
  year: StudentYear | null;
  onMajor: (m: StudentMajor) => void;
  onUni: (u: string) => void;
  onYear: (y: StudentYear) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-900">Về bạn</h2>
      <p className="mb-5 text-sm text-slate-500">
        Vài thông tin cơ bản để chúng tôi cá nhân hóa gợi ý cho bạn.
      </p>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Ngành học
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

      <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Bạn đang học năm
      </p>
      <div className="flex gap-2">
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

      <div className="mt-6">
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
  mode,
  setMode,
  interests: chosen,
  onToggle,
  quizAnswers,
  setQuizAnswers,
}: {
  mode: "known" | "explore" | null;
  setMode: (m: "known" | "explore") => void;
  interests: CareerInterest[];
  onToggle: (v: CareerInterest) => void;
  quizAnswers: number[];
  setQuizAnswers: (a: number[]) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-900">
        Định hướng nghề nghiệp
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Bạn đã có hướng đi cụ thể trong ngành IT chưa?
      </p>

      {/* Nhánh lựa chọn */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => setMode("known")}
          className={`rounded-xl border p-4 text-left transition-all ${
            mode === "known"
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <p className="text-sm font-bold text-slate-900">Tôi đã rõ hướng</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Chọn nhanh 1-3 mảng bạn quan tâm.
          </p>
        </button>
        <button
          onClick={() => setMode("explore")}
          className={`rounded-xl border p-4 text-left transition-all ${
            mode === "explore"
              ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <p className="text-sm font-bold text-slate-900">
            Chưa rõ — giúp tôi khám phá
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Làm bài trắc nghiệm hướng nghiệp RIASEC.
          </p>
        </button>
      </div>

      {mode === "known" && (
        <>
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
        </>
      )}

      {mode === "explore" && (
        <Step5 answers={quizAnswers} setAnswers={setQuizAnswers} />
      )}
    </div>
  );
}

function Step3({
  skills,
  skillInput,
  setSkillInput,
  addSkill,
  removeSkill,
  updateLevel,
  dbSkills = [],
}: {
  skills: { name: string; level: number }[];
  skillInput: string;
  setSkillInput: (s: string) => void;
  addSkill: (s: string) => void;
  removeSkill: (s: string) => void;
  updateLevel: (s: string, lvl: number) => void;
  dbSkills?: string[];
}) {
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
        Kỹ năng{" "}
        <span className="text-sm font-normal text-slate-400">(tùy chọn)</span>
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Chọn các kỹ năng bạn đã có. Có thể bỏ qua và bổ sung sau.
      </p>

      {/* Skill input */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Top skills{" "}
        <span className="ml-1 font-normal normal-case text-slate-400">
          ({skills.length})
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
        Mục tiêu nghề nghiệp{" "}
        <span className="text-sm font-normal text-slate-400">(tùy chọn)</span>
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Bạn đang ở giai đoạn nào? Chúng tôi sẽ ưu tiên gợi ý phù hợp. Có thể bỏ
        qua.
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
  const select = (qIdx: number, value: number) => {
    const next = [...answers];
    next[qIdx] = value;
    setAnswers(next);
  };

  const completed = riasecItems.filter(
    (_, i) => Number.isInteger(answers[i]) && answers[i] >= 1,
  ).length;

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-900">
        Khám phá hướng nghề phù hợp
      </h2>
      <p className="mb-1 text-sm text-slate-500">
        Cho biết mức độ bạn <b>thích làm</b> mỗi hoạt động dưới đây. Không có
        đúng/sai — hãy trả lời theo cảm nhận thật.
      </p>
      <p className="mb-4 text-[11px] text-slate-400">
        Dựa trên mô hình RIASEC (Holland Codes) & O*NET Interest Profiler — U.S.
        Department of Labor.
      </p>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
          style={{ width: `${(completed / riasecItems.length) * 100}%` }}
        />
      </div>
      <p className="mb-4 text-xs font-medium text-slate-500">
        {completed}/{riasecItems.length} câu
      </p>

      <div className="space-y-4">
        {riasecItems.map((item, qIdx) => (
          <div
            key={qIdx}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
          >
            <p className="mb-3 text-sm font-semibold text-slate-800">
              {qIdx + 1}. {item.text}
            </p>
            <div className="flex flex-wrap gap-2">
              {likertScale.map((opt) => {
                const active = answers[qIdx] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => select(qIdx, opt.value)}
                    aria-pressed={active}
                    className={`flex-1 min-w-[88px] rounded-lg border px-2 py-2 text-center text-xs font-medium transition-all ${
                      active
                        ? "border-blue-500 bg-blue-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {opt.label}
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
