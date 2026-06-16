import Link from "next/link";
import { TrendingUp, Sparkles, Target, BarChart3, Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT: marketing hero (desktop only) */}
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_50%)]" />

          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/30">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-white">Career Nova</p>
                <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                  Nền tảng
                </p>
              </div>
            </Link>
          </div>

          <div className="relative space-y-8">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm ring-1 ring-white/20">
                <Sparkles className="h-3 w-3" />
                Cá nhân hoá lộ trình
              </span>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-white xl:text-4xl">
                Định hướng nghề nghiệp
                <br />
                bằng dữ liệu, không phải linh cảm.
              </h2>
              <p className="mt-3 max-w-md text-sm text-white/80 xl:text-base">
                Phân tích kỹ năng, so khớp CV với JD, đề xuất lộ trình học theo
                career path bạn chọn — tất cả trong một nền tảng.
              </p>
            </div>

            <ul className="space-y-3">
              {[
                { Icon: Target, text: "Phân tích kỹ năng theo career path" },
                { Icon: BarChart3, text: "Thông tin Thị trường" },
                { Icon: Shield, text: "Bảo mật — dữ liệu thuộc về bạn" },
              ].map(({ Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 text-sm text-white/90"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                    <Icon className="h-4 w-4 text-white" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex items-center gap-3 text-xs text-white/70">
            <span className="rounded-full bg-white/15 px-3 py-1 font-semibold text-white ring-1 ring-white/20">
              Career Nova
            </span>
            <span>
              CV matching, skill gap và market insight trong một luồng
            </span>
          </div>
        </aside>

        {/* RIGHT: form */}
        <main className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2.5 lg:hidden"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                Career Nova
              </p>
            </Link>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              {children}
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">
              Bằng việc tiếp tục, bạn đồng ý với điều khoản sử dụng và chính
              sách bảo mật của Career Nova.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
