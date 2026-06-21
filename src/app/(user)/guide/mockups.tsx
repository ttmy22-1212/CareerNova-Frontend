// Mockup "bạn sẽ thấy gì" — mô phỏng lại giao diện thật bằng HTML/SVG nhẹ.
// Tự chứa, hợp dark mode. Mang tính minh họa nên dùng số liệu mẫu cố định.

/** Vòng tròn điểm phù hợp (donut) — mô phỏng ô "Điểm phù hợp". */
export function ScoreDonut({ value = 60 }: { value?: number }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 100 100" className="h-20 w-20 shrink-0">
        <circle
          cx="50"
          cy="50"
          r={r}
          className="fill-none stroke-slate-200 dark:stroke-slate-700"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          className="fill-none stroke-amber-500"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-slate-900 dark:fill-white"
          fontSize="24"
          fontWeight="700"
        >
          {value}%
        </text>
      </svg>
      <div className="text-left">
        <p className="text-xs font-semibold text-slate-900 dark:text-white">
          Khá tốt
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Đáp ứng phần lớn yêu cầu
        </p>
      </div>
    </div>
  );
}

/** Ba thẻ kỹ năng minh họa 3 mức khớp. */
const CHIPS = [
  { label: "React", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  { label: "Node.js", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  { label: "AWS", cls: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300" },
];
export function SkillChips() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CHIPS.map((c) => (
        <span
          key={c.label}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${c.cls}`}
        >
          {c.label}
        </span>
      ))}
    </div>
  );
}

/** Khung mockup chung — viền + chấm cửa sổ cho giống "ảnh màn hình". */
function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
      <div className="flex items-center gap-1.5 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
        <span className="h-2 w-2 rounded-full bg-red-300" />
        <span className="h-2 w-2 rounded-full bg-amber-300" />
        <span className="h-2 w-2 rounded-full bg-emerald-300" />
        <span className="ml-2 text-[10px] font-medium text-slate-400">{title}</span>
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  );
}

/** Bước 1 — Hồ sơ hoàn thiện. */
export function MockProfile() {
  return (
    <Frame title="Hồ sơ của bạn">
      <p className="mb-1 text-xs font-semibold text-slate-900 dark:text-white">
        Độ hoàn thiện hồ sơ
      </p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
      </div>
      <p className="mt-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
        100% — Hồ sơ đã đầy đủ
      </p>
    </Frame>
  );
}

/** Bước 2 — Kết quả so khớp (donut + chips). */
export function MockMatch() {
  return (
    <Frame title="Kết quả so khớp">
      <ScoreDonut value={60} />
      <p className="mt-3 mb-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        Kỹ năng phù hợp · còn thiếu
      </p>
      <SkillChips />
    </Frame>
  );
}

/** Bước 3 — Lộ trình & khóa học gợi ý. */
export function MockRoadmap() {
  return (
    <Frame title="Khoá học & Lộ trình">
      <p className="text-xs font-bold text-slate-900 dark:text-white">
        Lộ trình Frontend cơ bản
      </p>
      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
        Kỹ năng cần học
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          Node.js
        </span>
        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          AWS
        </span>
      </div>
      <div className="mt-2.5 h-1.5 w-2/3 rounded-full bg-slate-100 dark:bg-slate-800" />
      <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800" />
    </Frame>
  );
}

/** Bước 4 — Thẻ việc làm đã lưu. */
export function MockJob() {
  return (
    <Frame title="Tìm kiếm việc làm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
            Frontend Developer
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            Công ty ABC · Hà Nội
          </p>
        </div>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
          {/* bookmark */}
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
          </svg>
        </span>
      </div>
      <div className="mt-2 flex gap-1.5">
        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          React
        </span>
        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          78% khớp
        </span>
      </div>
    </Frame>
  );
}

/** Radar mini cho phần "đọc kết quả" (Bạn vs Thị trường). */
export function MiniRadar() {
  // ngũ giác đều, tâm (50,52), bán kính 36
  const pts = (rad: number) =>
    Array.from({ length: 5 }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      return `${50 + rad * Math.cos(a)},${52 + rad * Math.sin(a)}`;
    }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24">
      <polygon points={pts(36)} className="fill-none stroke-slate-200 dark:stroke-slate-700" strokeWidth="1.5" />
      <polygon points={pts(24)} className="fill-none stroke-slate-200 dark:stroke-slate-700" strokeWidth="1" />
      <polygon points={pts(34)} className="fill-emerald-500/15 stroke-emerald-500" strokeWidth="2" />
      <polygon
        points="50,24 78,44 67,76 33,73 24,46"
        className="fill-blue-500/25 stroke-blue-500"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
