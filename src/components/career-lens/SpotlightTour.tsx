"use client";

/**
 * SpotlightTour — highlights real UI elements one by one with a cutout overlay.
 * Uses the CSS box-shadow "giant shadow" technique to darken everything except
 * the target element.  No external dependencies.
 *
 * Luồng được thiết kế cho user MỚI ngay sau đăng nhập: app luôn đưa họ về
 * /my-dashboard (Tổng quan cá nhân), nên các bước chỉ trỏ vào anchor THỰC SỰ
 * có mặt trên trang đó.
 *
 * - `optional`      : tự bỏ qua nếu anchor vắng/ẩn (dùng cho phần không thiết yếu).
 * - `centerFallback`: nếu anchor vắng/ẩn (vd sidebar ẩn trên mobile) thì hiển thị
 *                     dưới dạng thẻ-giữa-màn với cùng nội dung — KHÔNG bỏ qua, để
 *                     user mobile vẫn nắm được chức năng cốt lõi.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, X, Zap } from "lucide-react";
import { useAuth } from "@/contexts/auth/auth-context";
import { paths } from "@/paths";

const TOUR_KEY = "career-lens.tour.v2"; // bump v1→v2: thiết kế lại luồng → mọi user thấy tour mới
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
  /** true ⇒ tự bỏ qua nếu anchor vắng/ẩn (kích thước 0×0 / display:none). */
  optional?: boolean;
  /** true ⇒ nếu anchor vắng/ẩn thì hiện như thẻ-giữa-màn thay vì bỏ qua. */
  centerFallback?: boolean;
}

const STEPS: Step[] = [
  // 1 — Toàn cảnh: app này để làm gì + có thể bỏ qua bất cứ lúc nào
  {
    title: "Chào mừng đến Career Nova! 👋",
    desc: "Career Nova giúp bạn 3 việc: đo độ khớp CV với tin tuyển dụng, chỉ ra kỹ năng còn thiếu, và gợi ý khóa học để lấp đầy. Mình dẫn một vòng ~1 phút ngay trên giao diện thật. Không muốn xem? Bấm “Bỏ qua” ở góc dưới bất cứ lúc nào.",
    tip: "Khoảng 1 phút · Có thể bỏ qua bất cứ lúc nào",
  },
  // 2 — CỐT LÕI: trang Tổng quan này nghĩa là gì (gộp: ý nghĩa + chỉ số + nút chính)
  {
    target: "welcome-banner",
    title: "📊 Đây là Tổng quan cá nhân của bạn",
    desc: "Trang chủ sau khi đăng nhập — tóm tắt nhanh tình hình của bạn: số việc làm phù hợp, điểm match CV trung bình và việc nên làm tiếp. Mọi con số tự cập nhật theo hồ sơ & CV của bạn.",
    placement: "bottom",
    tip: "Bắt đầu bằng nút CV ngay trên banner này",
  },
  // 3 — CỐT LÕI: toàn bộ luồng dùng app, giải thích từng bước + thứ tự nên đi
  {
    target: "journey-strip",
    title: "🗺️ Hành trình 5 bước — luồng dùng chính",
    desc: "Đây là toàn bộ cách dùng web, đi theo thứ tự: 1) Hồ sơ & CV → 2) Đối soát CV (tính điểm khớp) → 3) Khoảng trống kỹ năng (xem còn thiếu gì) → 4) Lộ trình học (khóa học gợi ý) → 5) Tìm việc phù hợp. Mỗi bước mở khóa và làm tốt hơn cho bước sau.",
    placement: "top",
    tip: "Cứ làm tuần tự từ trái sang phải",
  },
  // 4 — PHỤ (lướt nhanh): bản đồ menu — giới thiệu MỌI chức năng cùng lúc.
  //     centerFallback: trên mobile sidebar ẩn → vẫn hiện dưới dạng thẻ giữa màn.
  {
    target: "nav-groups",
    title: "🧭 Mọi chức năng đều nằm trong menu",
    desc: "Web gom thành 4 nhóm: Khám phá thị trường (xu hướng IT), Dành cho bạn (Tổng quan + Kiểm tra hướng nghiệp), Phân tích & đối soát (So khớp CV, Phân tích kỹ năng), và Hành động (Đề xuất, Khoá học & Lộ trình, Tìm việc).",
    placement: "right",
    tip: "Trên điện thoại, mở menu bằng nút ☰ ở góc trên",
    centerFallback: true,
  },
  // 5 — CỐT LÕI: tính năng quan trọng nhất, giải thích kỹ.
  //     centerFallback: mobile vẫn được giới thiệu tính năng cốt lõi này.
  {
    target: "sidebar-cv-matching",
    title: "📄 So khớp CV — tính năng cốt lõi",
    desc: "Quan trọng nhất cả web: tải CV rồi dán mô tả tuyển dụng bất kỳ. Hệ thống chấm điểm khớp 0–100% và chỉ rõ kỹ năng bạn còn thiếu so với yêu cầu — đây là nền tảng cho gợi ý job, lộ trình học và phân tích kỹ năng.",
    placement: "right",
    tip: "Chưa biết bắt đầu từ đâu? Mở mục “So khớp CV”",
    centerFallback: true,
  },
  // 6 — Kết: chốt việc nên làm đầu tiên + nơi mở lại hướng dẫn
  {
    title: "🎉 Xong rồi! Bắt đầu thôi",
    desc: "Việc nên làm đầu tiên là Tải CV để hệ thống phân tích hồ sơ của bạn. Cần xem lại cách dùng? Vào mục “Hướng dẫn sử dụng” ở menu tài khoản. Chúc bạn sớm tìm được hướng đi phù hợp!",
    tip: "Bấm “Bắt đầu ngay” để tới So khớp CV",
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

/** Anchor dùng được = có trong DOM, không display:none, kích thước > 0. */
function isUsable(el: Element | null): el is HTMLElement {
  if (!el) return false;
  if ((el as HTMLElement).offsetParent === null) return false; // display:none / detached
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [spot, setSpot] = useState<Rect | null>(null);
  const [vp, setVp] = useState({ w: 1280, h: 800 });

  // Hướng điều hướng hiện tại (+1 tiến / -1 lùi) để biết auto-skip về phía nào.
  const dirRef = useRef(1);
  // Đếm số bước optional bị bỏ qua liên tiếp → chặn lặp vô hạn nếu mọi anchor vắng.
  const skipCountRef = useRef(0);
  // a11y: focus nút chính khi mở/đổi bước + bẫy focus trong hộp thoại.
  const cardRef = useRef<HTMLDivElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

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

  function dismiss() {
    if (user) localStorage.setItem(`${TOUR_KEY}.${user.id}`, "done");
    setOpen(false);
    setSpot(null);
  }

  // Resolve spotlight cho bước hiện tại — có retry ngắn + tự bỏ qua / fallback giữa màn.
  useEffect(() => {
    if (!open) return;
    const stepDef = STEPS[step];

    // Bước thẻ-giữa: không có spotlight.
    if (!stepDef.target) {
      setSpot(null);
      skipCountRef.current = 0;
      return;
    }

    let cancelled = false;
    let tries = 0;

    const handleMissing = () => {
      if (cancelled) return;
      if (stepDef.centerFallback) {
        // Anchor ẩn (vd sidebar trên mobile) → hiện như thẻ giữa màn, KHÔNG bỏ qua.
        setSpot(null);
        skipCountRef.current = 0;
      } else if (stepDef.optional) {
        // Tự nhảy theo hướng đang đi thay vì kẹt ở center fallback.
        skipCountRef.current += 1;
        if (skipCountRef.current > STEPS.length) {
          dismiss();
          return;
        }
        const next = step + dirRef.current;
        if (next < 0 || next >= STEPS.length) {
          dismiss();
        } else {
          setStep(next);
        }
      } else {
        // Bước bắt buộc nhưng anchor vắng (hiếm) → center fallback mượt.
        setSpot(null);
        skipCountRef.current = 0;
      }
    };

    const find = () => {
      if (cancelled) return;
      const el = document.querySelector(`[data-tour="${stepDef.target}"]`);
      if (isUsable(el)) {
        skipCountRef.current = 0;
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        // chờ scroll ổn định rồi mới chốt vị trí spotlight
        setTimeout(() => {
          if (cancelled) return;
          const el2 = document.querySelector(`[data-tour="${stepDef.target}"]`);
          if (isUsable(el2)) setSpot(getSpot(el2));
          else handleMissing();
        }, 320);
      } else if (tries++ < 6) {
        setTimeout(find, 180); // ~1.2s tổng, đủ cho anchor cùng trang mount
      } else {
        handleMissing();
      }
    };

    find();
    return () => {
      cancelled = true;
    };
    // dismiss/router ổn định sau khi auth ready — chỉ cần chạy lại theo step/open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, open]);

  // Live-update spotlight on resize (và bỏ spotlight nếu anchor bị ẩn, vd thu về mobile)
  useEffect(() => {
    if (!open) return;
    const target = STEPS[step].target;
    if (!target) return;
    const update = () => {
      const el = document.querySelector(`[data-tour="${target}"]`);
      if (isUsable(el)) setSpot(getSpot(el));
      else setSpot(null);
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [step, open]);

  // a11y: Esc để đóng
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // a11y: đưa focus vào nút chính khi mở và mỗi lần đổi bước
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => nextBtnRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open, step]);

  function goNext() {
    dirRef.current = 1;
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else {
      // Khép vòng tour bằng hành động thật: đưa user mới tới So khớp CV.
      dismiss();
      router.push(paths.cvMatching);
    }
  }
  function goPrev() {
    dirRef.current = -1;
    if (step > 0) setStep((s) => s - 1);
  }
  function jumpTo(i: number) {
    dirRef.current = i >= step ? 1 : -1;
    setStep(i);
  }

  // a11y: bẫy Tab trong hộp thoại để không lạc focus ra trang nền bị che
  function trapTab(e: React.KeyboardEvent) {
    if (e.key !== "Tab") return;
    const focusables = cardRef.current?.querySelectorAll<HTMLElement>(
      "button:not([disabled])",
    );
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
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
        // Thẻ giữa màn: nền tối phủ kín, đồng thời chặn click trang nền.
        <div
          className="fixed inset-0 z-[9998]"
          style={{
            background: "rgba(15,23,42,0.72)",
            backdropFilter: "blur(3px)",
          }}
          aria-hidden
        />
      ) : (
        <>
          {/* Lớp chặn click trong suốt: box-shadow KHÔNG chặn được click nên cần
              lớp này để user không lỡ bấm trúng trang nền làm rời trang / vỡ tour. */}
          <div className="fixed inset-0 z-[9997]" aria-hidden />
          {spot && (
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
          )}
        </>
      )}

      {/* ── Tooltip card ────────────────────────────────────────── */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={cur.title}
        onKeyDown={trapTab}
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
              onClick={() => jumpTo(i)}
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
          <h3 className="text-sm font-bold text-slate-900 dark:text-white dark:text-slate-100 leading-snug">
            {cur.title}
          </h3>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 dark:text-slate-400">
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
            <span aria-hidden />
          )}

          {/* Nút Bỏ qua luôn hiển thị ở mọi bước cho user không muốn xem hướng dẫn */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={dismiss}
              className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              Bỏ qua
            </button>

            <button
              ref={nextBtnRef}
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
      </div>
    </>
  );
}
