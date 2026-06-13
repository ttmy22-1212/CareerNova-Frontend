"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type StudentMajor = "CS" | "SE" | "IS" | "IT" | "AI" | "DA" | "Other";
export type StudentYear = 1 | 2 | 3 | 4 | 5;
export type CareerInterest =
  | "frontend"
  | "backend"
  | "fullstack"
  | "mobile"
  | "data"
  | "ai_ml"
  | "devops"
  | "cybersecurity"
  | "qa";
export type Goal = "internship" | "fulltime" | "switch" | "explore";

export interface OnboardingProfile {
  completedAt: string | null;
  // Step 1
  major: StudentMajor | null;
  university: string;
  // Step 2
  year: StudentYear | null;
  interests: CareerInterest[];
  // Step 3
  hasUploadedCV: boolean;
  cvFileName: string | null;
  topSkills: { name: string; level: number }[]; // level 1-5
  // Step 4
  goal: Goal | null;
  targetSalaryUSD: number | null;
  preferRemote: boolean;
  // Step 5
  quizDone: boolean;
  suggestedPaths: CareerInterest[];
  // Activity tracking
  bookmarkedJobIds: string[];
  appliedJobIds: string[];
  /** ms timestamp of last analysis run on Skill Gap or CV Matching. */
  lastAnalysisAt: number | null;
}

const DEFAULT_PROFILE: OnboardingProfile = {
  completedAt: null,
  major: null,
  university: "",
  year: null,
  interests: [],
  hasUploadedCV: false,
  cvFileName: null,
  topSkills: [],
  goal: null,
  targetSalaryUSD: null,
  preferRemote: false,
  quizDone: false,
  suggestedPaths: [],
  bookmarkedJobIds: [],
  appliedJobIds: [],
  lastAnalysisAt: null,
};

const STORAGE_KEY = "career-lens.onboarding.v1";

interface Ctx {
  profile: OnboardingProfile;
  setProfile: (p: Partial<OnboardingProfile>) => void;
  reset: () => void;
  ready: boolean;
  /** Has the user completed the welcome wizard at least once. */
  isOnboarded: boolean;
  /** 0-100 numeric profile completeness based on what's actually filled. */
  strength: number;
  /** Per-item checklist with action hint + target route. */
  checklist: ChecklistItem[];
  /** 4-stage product journey. */
  journey: JourneyStage[];
  /** Toggle bookmark on a job id. */
  toggleBookmark: (jobId: string) => void;
}

export interface JourneyStage {
  id: "explore" | "analyze" | "resources" | "saved";
  label: string;
  desc: string;
  done: boolean;
  /** Kept for older server responses. The current UI does not show percent. */
  progress?: number;
  href: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  weight: number;
  href: string;
}

const OnboardingContext = createContext<Ctx | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] =
    useState<OnboardingProfile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProfileState({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {}
  }, [profile, ready]);

  const setProfile = (p: Partial<OnboardingProfile>) =>
    setProfileState((prev) => ({ ...prev, ...p }));

  const reset = () => setProfileState(DEFAULT_PROFILE);

  const checklist: ChecklistItem[] = [
    {
      id: "basics",
      label: "Chọn ngành học & trường",
      done: !!profile.major,
      weight: 10,
      href: "/onboarding/welcome?step=1",
    },
    {
      id: "interests",
      label: "Chọn năm học & 1-3 định hướng quan tâm",
      done:
        profile.year !== null &&
        Number(profile.year) > 0 &&
        profile.interests.length > 0,
      weight: 15,
      href: "/onboarding/welcome?step=2",
    },
    {
      id: "skills",
      label: "Khai báo skill mạnh nhất",
      // Đổi điều kiện từ >= 5 thành chỉ cần khai báo tối thiểu 1 skill theo UI mới
      done: profile.topSkills.length >= 1,
      weight: 20,
      href: "/onboarding/welcome?step=3",
    },
    {
      id: "cv",
      label: "Tải CV để phân tích chính xác hơn",
      done: profile.hasUploadedCV,
      weight: 25,
      href: "/onboarding/welcome?step=3",
    },
    {
      id: "goal",
      label: "Đặt mục tiêu nghề nghiệp",
      done: !!profile.goal,
      weight: 10,
      href: "/onboarding/welcome?step=4",
    },
    {
      id: "quiz",
      label: "Hoàn thành Kiểm tra hướng nghiệp",
      done: profile.quizDone || !!profile.completedAt,
      weight: 20,
      href: "/onboarding/welcome?step=5",
    },
  ];

  const strength = checklist.reduce(
    (sum, c) => sum + (c.done ? c.weight : 0),
    0,
  );

  const isOnboarded =
    !!profile.completedAt || (!!profile.major && profile.interests.length > 0);

  const journey: JourneyStage[] = [
    {
      id: "explore",
      label: "Khám phá hồ sơ",
      desc: "Ngành học, năm học và định hướng",
      done:
        !!profile.major &&
        profile.year !== null &&
        profile.interests.length > 0,
      href: "/onboarding/welcome",
    },
    {
      id: "analyze",
      label: "Phân tích",
      desc: "CV, kỹ năng và khoảng cách cần bổ sung",
      done: profile.topSkills.length >= 1 || profile.hasUploadedCV,
      href: "/skill-gap",
    },
    {
      id: "resources",
      label: "Tài nguyên học",
      desc: "Lưu khóa học hoặc lộ trình tham khảo",
      done: profile.suggestedPaths.length > 0 || !!profile.goal,
      href: "/roadmap",
    },
    {
      id: "saved",
      label: "Cơ hội đã lưu",
      desc: "Lưu URL việc làm để xem lại",
      done: profile.bookmarkedJobIds.length > 0,
      href: "/jobs",
    },
  ];

  const toggleBookmark = (jobId: string) =>
    setProfileState((prev) => ({
      ...prev,
      bookmarkedJobIds: prev.bookmarkedJobIds.includes(jobId)
        ? prev.bookmarkedJobIds.filter((id) => id !== jobId)
        : [...prev.bookmarkedJobIds, jobId],
    }));

  return (
    <OnboardingContext.Provider
      value={{
        profile,
        setProfile,
        reset,
        ready,
        isOnboarded,
        strength,
        checklist,
        journey,
        toggleBookmark,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): Ctx {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
