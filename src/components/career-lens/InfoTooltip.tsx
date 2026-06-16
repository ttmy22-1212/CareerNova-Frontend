"use client";
import { useState } from "react";
import { HelpCircle } from "lucide-react";

// Bộ thuật ngữ chuẩn dùng chung toàn app — giải thích cách tính để tăng độ tin cậy.
export const GLOSSARY = {
  matchScore:
    "Điểm phù hợp: mức độ hồ sơ của bạn đáp ứng yêu cầu công việc, tính theo trọng số từng kỹ năng.",
  similarity:
    "Độ tương đồng: mức gần nhau về ngữ nghĩa giữa kỹ năng của bạn và kỹ năng yêu cầu (theo embedding, không phải trùng từ khóa).",
  weight:
    "Trọng số: mức quan trọng của kỹ năng trong tin tuyển dụng. 'Bắt buộc' quan trọng hơn 'Ưa thích'.",
  gap: "Khoảng trống kỹ năng: những kỹ năng thị trường yêu cầu nhưng hồ sơ của bạn còn thiếu hoặc chưa đủ mạnh.",
} as const;

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="Giải thích"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-1.5 w-56 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-[11px] font-normal leading-relaxed text-white shadow-xl"
        >
          {text}
        </span>
      )}
    </span>
  );
}
