"use client";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface SkillRadarPoint {
  subject: string;
  you: number;
  required?: number;
  matchedVia?: string | null;
}

interface SkillRadarProps {
  data: SkillRadarPoint[];
  /** Nhãn đường "yêu cầu" — "Yêu cầu" hoặc "Yêu cầu thị trường" */
  requiredLabel?: string;
  youLabel?: string;
  /** Cách diễn đạt matched_via: "liên quan tới" (mặc định) hoặc "khớp qua" */
  matchedViaLabel?: string;
  /** Dùng bar ngang khi số kỹ năng < ngưỡng (radar cần ≥3 trục) */
  barFallbackThreshold?: number;
  /** Nhãn trục bấm được (chế độ tổng quan) */
  clickableLabels?: boolean;
  onLabelClick?: (subject: string) => void;
  /** Cuộn ngang khi nhãn dài (chế độ tổng quan nhiều nhóm) */
  scrollable?: boolean;
  height?: number;
}

export function SkillRadar({
  data,
  requiredLabel = "Yêu cầu",
  youLabel = "Bạn",
  matchedViaLabel = "liên quan tới",
  barFallbackThreshold = 3,
  clickableLabels = false,
  onLabelClick,
  scrollable = false,
  height = 240,
}: SkillRadarProps) {
  // Hiện matched_via bất cứ khi nào có và khác tên kỹ năng — với kỹ năng
  // "tương thích một phần", biết nó khớp QUA kỹ năng nào (vd JavaScript ↔ Java)
  // chính là thông tin hữu ích, không phụ thuộc ngưỡng tương đồng.
  const showVia = (d: SkillRadarPoint) =>
    !!d.matchedVia &&
    d.matchedVia.toLowerCase() !== (d.subject || "").toLowerCase();

  // Gợi ý tương tác (chỉ ở chế độ tổng quan): nhiều người không nhận ra
  // có thể bấm vào tên nhóm trên radar để xem chi tiết kỹ năng.
  const DrillHint = () =>
    clickableLabels ? (
      <p className="mb-1.5 text-center text-[11px] font-medium text-blue-600">
        Bấm vào tên nhóm (gạch chân) để xem chi tiết kỹ năng →
      </p>
    ) : null;

  const Legend = () => (
    <div className="mt-2 flex items-center justify-center gap-5">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="inline-block h-0.5 w-4 rounded-full bg-blue-500" />
        {youLabel}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="inline-block h-0.5 w-4 rounded-full bg-emerald-500" />
        {requiredLabel}
      </div>
    </div>
  );

  // Radar méo khi <3 trục → dùng thanh ngang (trừ chế độ tổng quan bấm được)
  const useBars = !clickableLabels && data.length < barFallbackThreshold;
  if (useBars) {
    return (
      <div className="w-full space-y-4 py-2">
        <p className="text-[11px] text-slate-500">
          Nhóm này có ít kỹ năng — hiển thị dạng thanh để dễ so sánh với mức yêu
          cầu.
        </p>
        {data.map((d) => (
          <div key={d.subject}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                {d.subject}
                {showVia(d) && (
                  <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-normal text-violet-500">
                    {matchedViaLabel} {d.matchedVia}
                  </span>
                )}
              </span>
              <span className="font-bold text-blue-600">{d.you}%</span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="absolute inset-y-0 left-0 bg-emerald-100"
                style={{ width: `${d.required ?? 100}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-blue-500"
                style={{ width: `${d.you}%` }}
              />
            </div>
          </div>
        ))}
        <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded bg-blue-500" />
            {youLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded bg-emerald-100" />
            {requiredLabel}
          </span>
        </div>
      </div>
    );
  }

  const Tip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload as SkillRadarPoint;
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs font-medium shadow-xl">
        <p className="mb-1 flex items-center gap-1 font-semibold text-slate-900">
          <span>{d.subject}</span>
          {showVia(d) && (
            <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-normal text-violet-500">
              ({matchedViaLabel} {d.matchedVia})
            </span>
          )}
        </p>
        <p className="text-blue-600">
          {youLabel} có: {d.you}%
        </p>
        <p className="text-emerald-600">
          {requiredLabel}: {d.required ?? 100}%
        </p>
      </div>
    );
  };

  const chart = (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart
        data={data}
        margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
        onClick={(e: any) => {
          if (clickableLabels && onLabelClick && e?.activeLabel) {
            onLabelClick(e.activeLabel);
          }
        }}
        style={{ cursor: clickableLabels ? "pointer" : "default" }}
      >
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="subject"
          tick={
            clickableLabels
              ? (props: any) => {
                  const { x, y, textAnchor, payload } = props;
                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor={textAnchor}
                      dominantBaseline="central"
                      fontSize={10}
                      fontWeight={600}
                      fill="#2563eb"
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onLabelClick?.(payload.value);
                      }}
                    >
                      {payload.value}
                    </text>
                  );
                }
              : { fontSize: 10, fill: "#64748b" }
          }
        />
        <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
        <Radar
          name={youLabel}
          dataKey="you"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.35}
        />
        <Radar
          name={requiredLabel}
          dataKey="required"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.15}
        />
        <Tooltip content={<Tip />} />
      </RadarChart>
    </ResponsiveContainer>
  );

  if (scrollable) {
    const maxLabelLen = data.reduce(
      (m, d) => Math.max(m, (d.subject || "").length),
      0,
    );
    const innerWidth = 260 + maxLabelLen * 14;
    return (
      <>
        {/* <DrillHint /> */}
        <div
          ref={(el) => {
            if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
          }}
          style={{ overflow: "auto" }}
        >
          <div style={{ width: innerWidth, height }}>{chart}</div>
        </div>
        <Legend />
      </>
    );
  }

  return (
    <>
      {/* <DrillHint /> */}
      {/* w-full: tránh co chiều ngang về 0 khi đặt trong flex căn giữa
          (items-center) — nguyên nhân radar không hiện trong modal kết quả */}
      <div className="w-full" style={{ height }}>
        {chart}
      </div>
      <Legend />
    </>
  );
}
