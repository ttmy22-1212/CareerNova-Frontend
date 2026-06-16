"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Dải CTA "Bước tiếp theo" — nối các trang feature thành 1 chuỗi hành trình liền mạch.
export function NextStepBanner({
  href,
  eyebrow = "Bước tiếp theo",
  title,
  desc,
  cta,
}: {
  href: string;
  eyebrow?: string;
  title: string;
  desc: string;
  cta: string;
}) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-1">
          {eyebrow}
        </p>
        <p className="text-base font-bold text-white">{title}</p>
        <p className="text-sm text-blue-100 mt-0.5">{desc}</p>
      </div>
      <Link
        href={href}
        className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-blue-700 shadow-lg hover:bg-blue-50 transition-colors"
      >
        {cta}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
