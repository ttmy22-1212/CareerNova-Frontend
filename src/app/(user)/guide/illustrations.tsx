// Hình minh họa inline (SVG) cho trang Hướng dẫn sử dụng.
// Dùng currentColor nên tự đổi màu theo class text-* (an toàn dark mode);
// các mảng "giấy/thẻ" tô fill-white dark:fill-slate-900 để nổi trên nền tối.

type Props = { className?: string };

const base = "h-full w-full";

/** Bước 1 — Đọc & trích xuất kỹ năng từ CV (tài liệu + kính lúp). */
export function IllusScan({ className }: Props) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className={`${base} ${className ?? ""}`}>
      <rect x="20" y="12" width="40" height="56" rx="6" className="fill-current opacity-10" />
      <rect x="20" y="12" width="40" height="56" rx="6" stroke="currentColor" strokeWidth="3" />
      <line x1="28" y1="26" x2="52" y2="26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="28" y1="36" x2="52" y2="36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="28" y1="46" x2="44" y2="46" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="60" r="15" className="fill-white dark:fill-slate-900" />
      <circle cx="60" cy="60" r="15" stroke="currentColor" strokeWidth="3" />
      <line x1="71" y1="71" x2="82" y2="82" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

/** Bước 2 — Đối soát ngữ nghĩa (hai thẻ + mũi tên đối chiếu). */
export function IllusMatch({ className }: Props) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className={`${base} ${className ?? ""}`}>
      <rect x="8" y="24" width="30" height="48" rx="6" className="fill-current opacity-10" />
      <rect x="8" y="24" width="30" height="48" rx="6" stroke="currentColor" strokeWidth="3" />
      <rect x="58" y="24" width="30" height="48" rx="6" className="fill-current opacity-10" />
      <rect x="58" y="24" width="30" height="48" rx="6" stroke="currentColor" strokeWidth="3" />
      <path d="M40 42 H54" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 37 L56 42 L50 47" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M56 56 H42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M46 51 L40 56 L46 61" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Bước 3 — Tài nguyên học (đường lộ trình + cờ đích). */
export function IllusRoadmap({ className }: Props) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className={`${base} ${className ?? ""}`}>
      <path
        d="M14 78 C 34 78, 30 46, 50 46 S 64 18, 82 18"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 9"
      />
      <circle cx="14" cy="78" r="6" className="fill-current" />
      <circle cx="50" cy="46" r="6" className="fill-white dark:fill-slate-900" />
      <circle cx="50" cy="46" r="6" stroke="currentColor" strokeWidth="3" />
      <path d="M80 14 V40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M80 14 H66 L70 20 L66 26 H80" className="fill-current opacity-30" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

/** Bước 4 — Cơ hội đã lưu (cặp công việc + bookmark). */
export function IllusSaved({ className }: Props) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className={`${base} ${className ?? ""}`}>
      <path d="M34 28 V24 a4 4 0 0 1 4 -4 h20 a4 4 0 0 1 4 4 V28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <rect x="14" y="28" width="68" height="44" rx="7" className="fill-current opacity-10" />
      <rect x="14" y="28" width="68" height="44" rx="7" stroke="currentColor" strokeWidth="3" />
      <path d="M14 44 H82" stroke="currentColor" strokeWidth="3" />
      <path d="M56 44 V70 L66 62 L76 70 V44" className="fill-white dark:fill-slate-900" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

/** Hero — radar/mục tiêu + tia sáng (mang tính trang trí). */
export function IllusHero({ className }: Props) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className}>
      <circle cx="100" cy="84" r="58" className="fill-white/10" />
      <circle cx="100" cy="84" r="40" stroke="white" strokeOpacity="0.5" strokeWidth="2.5" />
      <circle cx="100" cy="84" r="24" stroke="white" strokeOpacity="0.7" strokeWidth="2.5" />
      <polygon
        points="100,52 128,76 116,108 84,108 72,76"
        className="fill-white/25"
        stroke="white"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="100" cy="84" r="6" className="fill-white" />
      <path d="M150 36 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z" className="fill-white/90" />
      <path d="M44 110 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" className="fill-white/70" />
    </svg>
  );
}
