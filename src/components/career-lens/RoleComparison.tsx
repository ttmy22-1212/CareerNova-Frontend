"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowRight, TrendingUp, Sparkles, Clock } from "lucide-react";
import RecommendationApi from "@/api/recommendation";
import { CareerPathRecommendation } from "@/types/recommendation";

const priorityColor: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

// So sánh CV của bạn với nhiều vai trò cạnh nhau — dùng dữ liệu career-paths (không tốn thêm lệnh AI).
export function RoleComparison({
  currentScore,
  currentRole,
  onAnalyzeRole,
}: {
  currentScore?: number;
  currentRole?: string;
  onAnalyzeRole?: (searchGroup: string) => void;
}) {
  const [paths, setPaths] = useState<CareerPathRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    RecommendationApi.getCareerPaths(3)
      .then((res) => {
        if (!cancelled && Array.isArray(res?.data)) setPaths(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 flex items-center justify-center text-sm text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Đang tìm các vai trò phù hợp với CV của bạn…
      </div>
    );
  }

  if (paths.length === 0) return null;

  // Vai trò có độ phù hợp cao nhất → gợi ý nổi bật
  const bestScore = Math.max(...paths.map((p) => p.current_match));

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          So sánh vai trò phù hợp với CV của bạn
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Đang phân vân chọn hướng? Đây là mức độ sẵn sàng của bạn cho từng vai
          trò — chọn vai trò để đối soát chi tiết.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {paths.map((p) => {
          const isBest = p.current_match === bestScore;
          const beatsCurrent =
            currentScore != null && p.current_match > currentScore;
          return (
            <div
              key={p.id}
              className={`flex flex-col rounded-xl border p-4 transition-all ${
                isBest
                  ? "border-blue-300 bg-blue-50/40 ring-1 ring-blue-200"
                  : "border-slate-100 bg-slate-50/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  {p.title}
                </p>
                {isBest && (
                  <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    <Sparkles className="w-2.5 h-2.5" />
                    Hợp nhất
                  </span>
                )}
              </div>

              {/* Mức độ sẵn sàng */}
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-500">Mức độ sẵn sàng</span>
                <span className="font-bold text-slate-900">
                  {p.current_match}% → {p.target_match}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  style={{ width: `${p.current_match}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px]">
                <span className="rounded-full bg-white border border-slate-200 px-1.5 py-0.5 font-medium text-slate-600">
                  {p.readiness_label}
                </span>
                {p.time_to_ready && (
                  <span className="inline-flex items-center gap-0.5 text-slate-500">
                    <Clock className="w-2.5 h-2.5" />
                    {p.time_to_ready}
                  </span>
                )}
                {beatsCurrent && (
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-700">
                    Hợp hơn hiện tại
                  </span>
                )}
              </div>

              {/* Kỹ năng còn thiếu */}
              {p.skill_gaps && p.skill_gaps.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] text-slate-400 mb-1">
                    Cần bổ sung:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {p.skill_gaps.slice(0, 3).map((g) => (
                      <span
                        key={g.skill_id}
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                          priorityColor[g.priority] || priorityColor.low
                        }`}
                      >
                        {g.skill_name}
                      </span>
                    ))}
                    {p.skill_gaps.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{p.skill_gaps.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-auto flex flex-col gap-1.5">
                {onAnalyzeRole && p.search_group !== currentRole && (
                  <button
                    onClick={() => onAnalyzeRole(p.search_group)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    Đối soát vai trò này
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {p.search_group === currentRole && (
                  <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
                    Đang xem vai trò này
                  </span>
                )}
                {p.learning_path_id ? (
                  <Link
                    href={`/roadmap?skill=${encodeURIComponent(p.skill_gaps?.[0]?.skill_name || p.search_group)}`}
                    className="text-center text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    Xem lộ trình học
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
