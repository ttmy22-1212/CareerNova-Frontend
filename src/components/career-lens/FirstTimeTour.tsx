"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  FileText,
  Target,
  Map,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/auth/auth-context";

const TOUR_KEY = "career-lens.tour.v1";

// ── Tour steps definition ──────────────────────────────────────────
interface TourStep {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  title: string;
  desc: string;
  highlight?: string;
  cta?: { label: string; href: string };
  visual: React.ReactNode;
}

const STEPS: TourStep[] = [
  {
    icon: Sparkles,
    iconBg: "from-blue-600 to-indigo-600",
    title: "Chào mừng đến Career Lens! 🎉",
    desc: "Nền tảng giúp bạn hiểu rõ thị trường IT, tìm job phù hợp và xây lộ trình sự nghiệp cá nhân hóa dựa trên CV thực của bạn.",
    highlight: "Hướng dẫn nhanh — chỉ mất 1 phút",
    visual: (
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="flex items-center gap-3">
          {[
            { icon: LayoutGrid, label: "Dashboard", color: "bg-blue-100 text-blue-600" },
            { icon: FileText, label: "CV Matching", color: "bg-emerald-100 text-emerald-600" },
            { icon: Target, label: "Skill Gap", color: "bg-orange-100 text-orange-600" },
            { icon: Map, label: "Roadmap", color: "bg-violet-100 text-violet-600" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color} shadow-sm`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold text-slate-600">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2">
          <TrendingUp className="h-4 w-4 text-blue-600 shrink-0" />
          <span className="text-xs font-medium text-blue-800">4 tính năng chính · Tất cả miễn phí</span>
        </div>
      </div>
    ),
  },
  {
    icon: LayoutGrid,
    iconBg: "from-blue-500 to-blue-700",
    title: "Personal Dashboard — Trung tâm của bạn",
    desc: "Sau khi upload CV, dashboard cá nhân sẽ hiện match score với từng job, phân tích skill gap và lộ trình học tập được đề xuất riêng cho bạn.",
    highlight: "Cần upload CV để kích hoạt đầy đủ tính năng",
    cta: { label: "Đến Personal Dashboard", href: "/my-dashboard" },
    visual: (
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3">
          <p className="text-xs font-bold text-blue-200 mb-0.5">Xin chào!</p>
          <p className="text-sm font-bold text-white">Hồ sơ khớp với 3 jobs (match ≥ 70%)</p>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3">
          {[
            { label: "Match Score TB", value: "78%", color: "text-blue-700 bg-blue-50" },
            { label: "Jobs Phù Hợp", value: "3", color: "text-emerald-700 bg-emerald-50" },
            { label: "Skill Gaps", value: "4", color: "text-orange-700 bg-orange-50" },
            { label: "Profile", value: "65%", color: "text-violet-700 bg-violet-50" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-lg ${color} px-3 py-2`}>
              <p className="text-lg font-bold">{value}</p>
              <p className="text-[10px] font-medium opacity-80">{label}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: FileText,
    iconBg: "from-emerald-500 to-emerald-700",
    title: "CV–JD Matching — So khớp CV với Job",
    desc: "Upload CV (PDF/DOCX) rồi paste mô tả job bất kỳ. Hệ thống tự động tính điểm match, chỉ ra điểm mạnh và kỹ năng còn thiếu so với yêu cầu.",
    highlight: "Hỗ trợ PDF, DOCX · Kết quả trong vài giây",
    cta: { label: "Upload CV ngay", href: "/cv-matching" },
    visual: (
      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 shrink-0">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-900">my_cv.pdf đã được phân tích</p>
            <p className="text-[10px] text-emerald-700">Senior Frontend Developer · 87% match</p>
          </div>
          <div className="ml-auto">
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">87%</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-center">
            <p className="text-xs font-bold text-emerald-700">✓ React</p>
            <p className="text-[10px] text-emerald-600">Khớp hoàn toàn</p>
          </div>
          <div className="flex-1 rounded-lg bg-orange-50 border border-orange-200 p-2 text-center">
            <p className="text-xs font-bold text-orange-700">○ GraphQL</p>
            <p className="text-[10px] text-orange-600">Còn thiếu</p>
          </div>
          <div className="flex-1 rounded-lg bg-blue-50 border border-blue-200 p-2 text-center">
            <p className="text-xs font-bold text-blue-700">~ TypeScript</p>
            <p className="text-[10px] text-blue-600">Cần nâng cao</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Target,
    iconBg: "from-orange-500 to-orange-600",
    title: "Skill Gap Analysis — Biết mình thiếu gì",
    desc: "So sánh kỹ năng hiện tại của bạn với 1,000+ job posting trong thị trường IT. Biết chính xác skill nào đang được trả lương cao và bạn cần học gì tiếp theo.",
    highlight: "Cập nhật theo dữ liệu tuyển dụng thực mỗi tuần",
    cta: { label: "Phân tích Skill Gap", href: "/skill-gap" },
    visual: (
      <div className="space-y-1.5">
        {[
          { skill: "React", you: 80, market: 85, status: "Gần đạt" },
          { skill: "TypeScript", you: 60, market: 80, status: "Cần cải thiện" },
          { skill: "Node.js", you: 40, market: 75, status: "Ưu tiên học" },
          { skill: "Docker", you: 20, market: 65, status: "Còn thiếu" },
        ].map(({ skill, you, market, status }) => (
          <div key={skill} className="rounded-lg bg-slate-50 border border-slate-200 p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-800">{skill}</span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                you >= market - 10 ? "bg-emerald-100 text-emerald-700"
                : you >= market - 30 ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
              }`}>{status}</span>
            </div>
            <div className="flex gap-1">
              <div className="flex-1">
                <div className="flex items-center justify-between text-[9px] text-slate-500 mb-0.5">
                  <span>Bạn</span><span>{you}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${you}%` }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-[9px] text-slate-500 mb-0.5">
                  <span>Thị trường</span><span>{market}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${market}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Map,
    iconBg: "from-violet-500 to-violet-700",
    title: "Lộ trình học tập cá nhân hóa",
    desc: "Dựa trên skill gap và mục tiêu nghề nghiệp, hệ thống tạo lộ trình học tập với các khóa học cụ thể, thứ tự ưu tiên và mốc thời gian đạt được.",
    highlight: "Lộ trình cập nhật tự động khi bạn học thêm skill mới",
    cta: { label: "Xem Lộ trình", href: "/roadmap" },
    visual: (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-violet-900">
          <Route className="h-4 w-4 text-violet-600" />
          Frontend Developer Path · 12 tuần
        </div>
        {[
          { week: "Tuần 1–2", topic: "TypeScript nâng cao", done: true },
          { week: "Tuần 3–5", topic: "GraphQL + Apollo Client", done: false, current: true },
          { week: "Tuần 6–8", topic: "Docker & CI/CD cơ bản", done: false },
          { week: "Tuần 9–12", topic: "System Design cho FE", done: false },
        ].map(({ week, topic, done, current }) => (
          <div key={week} className={`flex items-center gap-3 rounded-lg border p-2.5 ${
            done ? "border-emerald-200 bg-emerald-50"
            : current ? "border-violet-300 bg-violet-50 ring-1 ring-violet-200"
            : "border-slate-200 bg-white"
          }`}>
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              done ? "bg-emerald-500 text-white"
              : current ? "bg-violet-600 text-white"
              : "bg-slate-200 text-slate-500"
            }`}>
              {done ? "✓" : current ? "▶" : "○"}
            </div>
            <div>
              <p className={`text-xs font-semibold ${done ? "text-emerald-700 line-through" : current ? "text-violet-800" : "text-slate-700"}`}>{topic}</p>
              <p className="text-[10px] text-slate-500">{week}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: User,
    iconBg: "from-slate-600 to-slate-800",
    title: "Bạn đã sẵn sàng! Bắt đầu từ đâu?",
    desc: "Hoàn thiện hồ sơ để mở khóa toàn bộ tính năng. Bước đầu tiên quan trọng nhất: Upload CV của bạn.",
    visual: (
      <div className="space-y-2">
        {[
          { href: "/cv-matching", icon: FileText, label: "Upload CV để phân tích", sub: "Bước đầu tiên — quan trọng nhất", color: "border-blue-300 bg-blue-50 hover:bg-blue-100", iconColor: "bg-blue-600", recommended: true },
          { href: "/onboarding/welcome", icon: Sparkles, label: "Hoàn thiện hồ sơ nhanh", sub: "Khai báo ngành học, định hướng, kỹ năng", color: "border-violet-200 bg-violet-50 hover:bg-violet-100", iconColor: "bg-violet-600", recommended: false },
          { href: "/dashboard", icon: TrendingUp, label: "Khám phá Market Dashboard", sub: "Xem xu hướng thị trường IT không cần login", color: "border-emerald-200 bg-emerald-50 hover:bg-emerald-100", iconColor: "bg-emerald-600", recommended: false },
        ].map(({ href, icon: Icon, label, sub, color, iconColor, recommended }) => (
          <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${color}`}>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconColor}`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-slate-900">{label}</p>
                {recommended && (
                  <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">Khuyên dùng</span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
          </Link>
        ))}
      </div>
    ),
  },
];

// Helper — needed in visual of step 4
function Route({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" />
      <path d="M12 19h4.5a3.5 3.5 0 0 0 0-7h-8a3.5 3.5 0 0 1 0-7H12" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────
export function FirstTimeTour() {
  const { user, ready } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [animDir, setAnimDir] = useState<"next" | "prev">("next");

  useEffect(() => {
    if (!ready || !user) return;
    const seen = localStorage.getItem(TOUR_KEY);
    if (!seen) setOpen(true);
  }, [ready, user]);

  function dismiss() {
    localStorage.setItem(TOUR_KEY, "done");
    setOpen(false);
  }

  function goNext() {
    if (step < STEPS.length - 1) {
      setAnimDir("next");
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }

  function goPrev() {
    if (step > 0) {
      setAnimDir("prev");
      setStep((s) => s - 1);
    }
  }

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)" }}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-label="Hướng dẫn sử dụng Career Lens"
      >
        {/* Progress bar */}
        <div className="flex gap-1 px-5 pt-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setAnimDir(i > step ? "next" : "prev"); setStep(i); }}
              aria-label={`Bước ${i + 1}`}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={dismiss}
          aria-label="Bỏ qua hướng dẫn"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Step counter */}
        <div className="px-5 pt-3 pb-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Bước {step + 1} / {STEPS.length}
          </span>
        </div>

        {/* Content */}
        <div className="px-5 pt-3 pb-5 space-y-4">
          {/* Icon + Title */}
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${current.iconBg} shadow-md`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {current.title}
              </h2>
              {current.highlight && (
                <div className="mt-1 flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-amber-500 shrink-0" />
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                    {current.highlight}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {current.desc}
          </p>

          {/* Visual preview */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            {current.visual}
          </div>

          {/* CTA (optional) */}
          {current.cta && !isLast && (
            <Link
              href={current.cta.href}
              onClick={dismiss}
              className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              {current.cta.label}
            </Link>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          {step > 0 ? (
            <button
              onClick={goPrev}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Quay lại
            </button>
          ) : (
            <button
              onClick={dismiss}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors px-3 py-2"
            >
              Bỏ qua
            </button>
          )}

          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setAnimDir(i > step ? "next" : "prev"); setStep(i); }}
                className={`rounded-full transition-all duration-200 ${
                  i === step
                    ? "h-2 w-5 bg-blue-600"
                    : "h-2 w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700"
                }`}
                aria-label={`Đến bước ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              isLast
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-300"
                : "bg-slate-900 text-white hover:bg-slate-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            }`}
          >
            {isLast ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Bắt đầu ngay!
              </>
            ) : (
              <>
                Tiếp theo
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
