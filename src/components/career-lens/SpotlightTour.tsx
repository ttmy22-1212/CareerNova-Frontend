"use client";

/**
 * SpotlightTour — highlights real UI elements one by one with a cutout overlay.
 * Uses the CSS box-shadow "giant shadow" technique to darken everything except
 * the target element.  No external dependencies.
 */

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, X, Zap } from "lucide-react";
import { useAuth } from "@/contexts/auth/auth-context";

const TOUR_KEY = "career-lens.tour.v1";
const TW = 312; // tooltip width  (px)
const PAD = 8; // spotlight padding (px)

// ── Step definitions ───────────────────────────────────────────────
interface Step {
  /** value of [data-tour="…"] attribute.  Absent = center card, no spotlight. */
  target?: string;
  title: string;
  desc: string;
  placement?: "top" | "bottom" | "left" | "right";
  tip?: string;
}

const STEPS: Step[] = [
  {
    title: "Chào mừng đến Career Nova! 👋",
    desc: "Mình sẽ hướng dẫn bạn trực tiếp trên giao diện thực — không phải demo giả. Bấm Tiếp theo để bắt đầu!",
    tip: "6 bước · Khoảng 1 phút",
  },
  {
    target: "journey-bar",
    title: "🗺️ Hành trình sự nghiệp",
    desc: "Thanh 4 bước theo dõi tiến trình từ Khám phá → Phân tích → Lộ trình → Apply jobs. Bấm vào từng ô để đến tính năng tương ứng — ô sẽ sáng xanh khi bạn hoàn thành.",
    placement: "bottom",
    tip: "Bấm trực tiếp vào từng bước để xem",
  },
  {
    target: "sidebar-cv-matching",
    title: "📄 So khớp CV — Bắt đầu từ đây",
    desc: "Tải CV rồi paste mô tả job bất kỳ. Hệ thống tính ngay điểm match (0–100%) và chỉ ra đúng kỹ năng nào bạn còn thiếu so với yêu cầu tuyển dụng.",
    placement: "right",
    tip: "Đây là bước quan trọng nhất — làm ngay nhé!",
  },
  {
    target: "profile-strength",
    title: "💪 Độ hoàn thiện hồ sơ",
    desc: "Mỗi bước hoàn thiện hồ sơ tăng thêm %. Càng cao, gợi ý job và lộ trình học càng chính xác hơn. Bấm để xem checklist các bước còn thiếu.",
    placement: "top",
    tip: "Mục tiêu: đạt ít nhất 50% để mở insight",
  },
  {
    target: "welcome-banner",
    title: "📊 Tổng kết cá nhân của bạn",
    desc: "Sau khi Tải CV, banner này hiện số jobs khớp với hồ sơ và điểm match trung bình. Dữ liệu tự cập nhật khi bạn thêm thông tin vào hồ sơ.",
    placement: "bottom",
    tip: "Số liệu cập nhật tự động theo hồ sơ",
  },
  {
    target: "next-actions",
    title: "⚡ Hành động được gợi ý",
    desc: "3 card hành động quan trọng nhất dựa trên trạng thái hồ sơ hiện tại. Hệ thống tự chọn và cập nhật khi bạn tiến bộ — bấm vào bất kỳ card nào để bắt đầu.",
    placement: "top",
    tip: "Bấm vào card để thực hiện ngay",
  },
];

// ── Geometry helpers ───────────────────────────────────────────────
interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getSpot(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  };
}

function tooltipPos(
  sp: Rect,
  placement: Step["placement"],
): { top: number; left: number } {
  const g = 14;
  const iw = window.innerWidth;
  const ih = window.innerHeight;
  const th = 210; // estimated tooltip height

  const cx = (x: number) => Math.max(12, Math.min(x, iw - TW - 12));
  const cy = (y: number) => Math.max(12, Math.min(y, ih - th - 12));

  if (placement === "bottom")
    return {
      top: cy(sp.top + sp.height + g),
      left: cx(sp.left + sp.width / 2 - TW / 2),
    };
  if (placement === "top")
    return {
      top: cy(sp.top - th - g),
      left: cx(sp.left + sp.width / 2 - TW / 2),
    };
  if (placement === "right")
    return { top: cy(sp.top), left: cx(sp.left + sp.width + g) };
  if (placement === "left")
    return { top: cy(sp.top), left: cx(sp.left - TW - g) };
  return { top: ih / 2 - th / 2, left: iw / 2 - TW / 2 };
}

// ── Component ──────────────────────────────────────────────────────
export function SpotlightTour() {
  const { user, ready } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [spot, setSpot] = useState<Rect | null>(null);
  const [vp, setVp] = useState({ w: 1280, h: 800 });

  // Sync viewport
  useEffect(() => {
    const sync = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  // Open once per user account (keyed by user id so multi-account machines work)
  useEffect(() => {
    if (!ready || !user) return;
    const key = `${TOUR_KEY}.${user.id}`;
    if (!localStorage.getItem(key)) {
      const t = setTimeout(() => setOpen(true), 900);
      return () => clearTimeout(t);
    }
  }, [ready, user]);

  // Resolve spotlight for current step
  const resolveSpot = useCallback((idx: number) => {
    const target = STEPS[idx].target;
    if (!target) {
      setSpot(null);
      return;
    }

    let tries = 0;
    const find = () => {
      const el = document.querySelector(`[data-tour="${target}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        // wait for scroll to settle
        setTimeout(() => setSpot(getSpot(el)), 380);
      } else if (tries++ < 20) {
        setTimeout(find, 200);
      } else {
        setSpot(null); // element not in DOM — fallback to center card
      }
    };
    find();
  }, []);

  useEffect(() => {
    if (open) resolveSpot(step);
  }, [step, open, resolveSpot]);

  // Live-update spotlight on resize
  useEffect(() => {
    if (!open) return;
    const target = STEPS[step].target;
    if (!target) return;
    const update = () => {
      const el = document.querySelector(`[data-tour="${target}"]`);
      if (el) setSpot(getSpot(el));
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [step, open]);

  function dismiss() {
    if (user) localStorage.setItem(`${TOUR_KEY}.${user.id}`, "done");
    setOpen(false);
    setSpot(null);
  }
  function goNext() {
    step < STEPS.length - 1 ? setStep((s) => s + 1) : dismiss();
  }
  function goPrev() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (!open) return null;

  const cur = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isCenter = !cur.target || !spot;
  const tPos =
    spot && cur.placement
      ? tooltipPos(spot, cur.placement)
      : { top: vp.h / 2 - 105, left: vp.w / 2 - TW / 2 };

  return (
    <>
      {/* ── Overlay ─────────────────────────────────────────────── */}
      {isCenter ? (
        <div
          className="fixed inset-0 z-[9998]"
          style={{
            background: "rgba(15,23,42,0.72)",
            backdropFilter: "blur(3px)",
          }}
        />
      ) : (
        spot && (
          // The enormous box-shadow IS the dark overlay; the element itself stays lit
          <div
            style={{
              position: "fixed",
              top: spot.top,
              left: spot.left,
              width: spot.width,
              height: spot.height,
              borderRadius: 10,
              boxShadow: "0 0 0 9999px rgba(15,23,42,0.65)",
              border: "2px solid rgba(99,102,241,0.75)",
              outline: "4px solid rgba(99,102,241,0.12)",
              outlineOffset: 3,
              zIndex: 9998,
              pointerEvents: "none",
              transition:
                "top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease",
            }}
          />
        )
      )}

      {/* ── Tooltip card ────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={cur.title}
        style={{
          position: "fixed",
          top: tPos.top,
          left: tPos.left,
          width: TW,
          zIndex: 10000,
          transition: isCenter ? "none" : "top 0.3s ease, left 0.3s ease",
        }}
        className="rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden dark:bg-slate-900 dark:ring-slate-700"
      >
        {/* Progress bar + close */}
        <div className="flex items-center gap-1 px-4 pt-3.5 pb-0">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              aria-label={`Đến bước ${i + 1}`}
              className={`rounded-full transition-all duration-250 ${
                i === step
                  ? "h-1.5 w-5 bg-indigo-600"
                  : i < step
                    ? "h-1.5 w-1.5 bg-indigo-300"
                    : "h-1.5 w-1.5 bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
          <span className="ml-auto text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            {step + 1} / {STEPS.length}
          </span>
          <button
            onClick={dismiss}
            aria-label="Đóng hướng dẫn"
            className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pt-3 pb-1 space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {cur.title}
          </h3>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {cur.desc}
          </p>
          {cur.tip && (
            <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 dark:bg-indigo-950/30">
              <Zap className="h-3 w-3 shrink-0 text-indigo-500" />
              <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                {cur.tip}
              </span>
            </div>
          )}
        </div>

        {/* Navigation footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
          {step > 0 ? (
            <button
              onClick={goPrev}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Quay lại
            </button>
          ) : (
            <button
              onClick={dismiss}
              className="px-2.5 py-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              Bỏ qua
            </button>
          )}

          <button
            onClick={goNext}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-[11px] font-bold transition-all ${
              isLast
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-300 dark:shadow-indigo-900"
                : "bg-slate-900 text-white hover:bg-slate-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
            }`}
          >
            {isLast ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Bắt đầu ngay!
              </>
            ) : (
              <>
                Tiếp theo <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
