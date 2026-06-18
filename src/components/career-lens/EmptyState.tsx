"use client";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

// Empty state dùng chung — icon + tiêu đề + mô tả + CTA hành động (tùy chọn).
export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  onCta,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
  compact?: boolean;
}) {
  const cta = ctaLabel ? (
    ctaHref ? (
      <Link
        href={ctaHref}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
      >
        {ctaLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    ) : (
      <button
        onClick={onCta}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
      >
        {ctaLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    )
  ) : null;

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 text-center dark:border-slate-800 dark:bg-slate-900/40 ${
        compact ? "py-8" : "min-h-[200px] py-10"
      }`}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40">
        <Icon className="h-6 w-6 text-blue-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {title}
      </p>
      {description && (
        <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {cta}
    </div>
  );
}
