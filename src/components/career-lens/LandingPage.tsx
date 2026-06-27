"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth/auth-context";
import MarketDashboardApi from "@/api/market-dashboard";
import {
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Rocket,
  ChevronRight,
  FileText,
  Briefcase,
  BookOpen,
  Compass,
} from "lucide-react";

export function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ jobs?: number; companies?: number }>({});

  useEffect(() => {
    MarketDashboardApi.getStats({ time_range: "30days" })
      .then((res) => {
        const d = (res?.data as any)?.data || res?.data;
        if (d)
          setStats({
            jobs: d.active_jobs?.count,
            companies: d.companies_hiring?.count,
          });
      })
      .catch(() => {});
  }, []);

  if (user) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Career Nova</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-4">
            <Link
              href="/dashboard"
              className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Thông tin thị trường
            </Link>
            <Link
              href="/auth/login"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors px-2"
            >
              Đăng nhập
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white px-4 py-16 sm:py-24">
        {/* Khối nền trang trí */}
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute top-32 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm font-semibold text-blue-700 mb-6">
            <Sparkles className="w-4 h-4" />
            Dành cho sinh viên IT sắp ra trường
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Biết mình{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              còn thiếu kỹ năng gì
            </span>{" "}
            so với thị trường
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Tải CV lên — hệ thống đối soát với yêu cầu tuyển dụng thật, chỉ ra
            khoảng trống kỹ năng và gợi ý lộ trình học để bạn sẵn sàng đi làm.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link
              href="/auth/register"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Bắt đầu miễn phí
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-50 transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              Xem thông tin thị trường
            </Link>
          </div>

          <p className="text-sm text-slate-500 mb-12">
            Miễn phí · không cần kinh nghiệm phân tích · chỉ vài phút.
          </p>

          {/* Preview các tính năng chính */}
          <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-5 sm:p-7 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {[
                {
                  icon: FileText,
                  title: "Đối soát CV",
                  desc: "Tính điểm phù hợp với từng vị trí",
                  tint: "bg-blue-50 text-blue-600",
                },
                {
                  icon: Briefcase,
                  title: "Việc làm gợi ý",
                  desc: "Xếp hạng theo CV mặc định của bạn",
                  tint: "bg-indigo-50 text-indigo-600",
                },
                {
                  icon: Target,
                  title: "Khoảng trống kỹ năng",
                  desc: "Chỉ ra kỹ năng còn thiếu so với thị trường",
                  tint: "bg-violet-50 text-violet-600",
                },
                {
                  icon: TrendingUp,
                  title: "Thông tin thị trường",
                  desc: "Nhu cầu tuyển dụng & kỹ năng được săn đón",
                  tint: "bg-sky-50 text-sky-600",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-100 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div
                    className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${item.tint}`}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Số liệu thật ── */}
      <section className="px-4 py-12 border-y border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold text-slate-500 mb-8 tracking-wider">
            DỮ LIỆU TUYỂN DỤNG THỰC TẾ
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              {
                value: stats.jobs ? stats.jobs.toLocaleString() : "—",
                label: "Tin tuyển dụng IT",
              },
              {
                value: stats.companies ? stats.companies.toLocaleString() : "—",
                label: "Công ty đang tuyển",
              },
              { value: "Ngữ nghĩa", label: "Đối soát kỹ năng bằng AI" },
              { value: "Liên tục", label: "Cập nhật xu hướng" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                  {s.value}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cách hoạt động (3 bước) ── */}
      <section className="px-4 py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Chỉ 3 bước để biết mình đang ở đâu
          </h2>
          <p className="text-center text-slate-500 mb-12 max-w-xl mx-auto">
            Hệ thống làm phần khó — bạn chỉ cần hành động.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: FileText,
                step: "1",
                title: "Tải CV của bạn",
                desc: "Hệ thống tự trích xuất kỹ năng từ CV — không cần nhập tay.",
              },
              {
                icon: Target,
                step: "2",
                title: "Xem khoảng trống kỹ năng",
                desc: "Đối soát ngữ nghĩa với yêu cầu tuyển dụng thật, chỉ ra điểm còn yếu.",
              },
              {
                icon: BarChart3,
                step: "3",
                title: "Nhận lộ trình học",
                desc: "Gợi ý kỹ năng cần bổ sung theo thứ tự ưu tiên + việc làm phù hợp.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="absolute top-4 right-5 text-4xl font-black text-slate-200">
                  {s.step}
                </span>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-base font-bold text-slate-900 mb-1">
                  {s.title}
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:-translate-y-0.5"
            >
              Bắt đầu miễn phí — chỉ vài phút
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Tính năng ── */}
      <section className="px-4 py-16 sm:py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Những gì bạn nhận được
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Bộ công cụ giúp bạn hiểu rõ bản thân, thị trường và lộ trình phát
              triển sự nghiệp.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[
              {
                icon: FileText,
                tint: "bg-blue-50 text-blue-600",
                title: "Đối soát CV",
                desc: "So khớp CV với mô tả công việc — xem điểm phù hợp, kỹ năng mạnh và kỹ năng còn thiếu.",
                features: [
                  "Điểm phù hợp tức thì",
                  "Kỹ năng mạnh / một phần / thiếu",
                  "Đối soát ngữ nghĩa bằng AI",
                ],
              },
              {
                icon: Target,
                tint: "bg-violet-50 text-violet-600",
                title: "Phân tích kỹ năng",
                desc: "Biết chính xác kỹ năng nào đang thiếu so với thị trường và nên học cái nào trước.",
                features: [
                  "Khoảng trống lớn nhất",
                  "Mức độ ưu tiên rõ ràng",
                  "Lộ trình học gợi ý",
                ],
              },
              {
                icon: Briefcase,
                tint: "bg-indigo-50 text-indigo-600",
                title: "Việc làm phù hợp",
                desc: "Danh sách việc làm khớp hồ sơ của bạn, lọc theo hình thức, kinh nghiệm và địa điểm.",
                features: [
                  "Độ phù hợp ≥ 70%",
                  "Bộ lọc nâng cao",
                  "Lưu việc & xem lại",
                ],
              },
              {
                icon: TrendingUp,
                tint: "bg-sky-50 text-sky-600",
                title: "Thông tin thị trường",
                desc: "Theo dõi xu hướng tuyển dụng: vị trí tuyển nhiều, kỹ năng được săn đón, kỹ năng tăng nhanh.",
                features: [
                  "Dữ liệu cập nhật",
                  "Kỹ năng đang lên",
                  "Top vị trí tuyển dụng",
                ],
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 border border-slate-200 bg-white rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${feature.tint}`}
                >
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm mb-3">{feature.desc}</p>
                <ul className="space-y-1">
                  {feature.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-xs text-slate-500"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Tính năng bổ trợ */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: BarChart3,
                title: "Biểu đồ radar",
                desc: "Trực quan hóa kỹ năng của bạn so với thị trường",
              },
              {
                icon: BookOpen,
                title: "Lộ trình học",
                desc: "Khóa học cá nhân hóa theo kỹ năng còn thiếu",
              },
              {
                icon: Compass,
                title: "Hồ sơ hướng nghiệp",
                desc: "Trắc nghiệm RIASEC gợi ý nghề IT phù hợp",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Câu hỏi thường gặp ── */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
            Câu hỏi thường gặp
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "Sử dụng có miễn phí không?",
                a: "Có. Bạn có thể tạo tài khoản, tải CV, đối soát kỹ năng và xem lộ trình học hoàn toàn miễn phí.",
              },
              {
                q: "Dữ liệu CV của tôi có an toàn không?",
                a: "CV chỉ dùng để phân tích kỹ năng và đối soát với yêu cầu công việc cho riêng bạn. Bạn có thể xóa CV bất cứ lúc nào trong phần Hồ sơ.",
              },
              {
                q: "Hệ thống đối soát kỹ năng như thế nào?",
                a: "Thay vì so trùng từ khóa, hệ thống hiểu ý nghĩa từng kỹ năng (ví dụ ReactJS liên quan tới Frontend) để đánh giá độ phù hợp chính xác hơn.",
              },
              {
                q: "Tôi cần chuẩn bị gì để bắt đầu?",
                a: "Chỉ cần một CV (PDF, JPG hoặc PNG). Phần còn lại hệ thống tự trích xuất và phân tích trong vài phút.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-slate-200 bg-slate-50 px-5 py-4"
              >
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-900 list-none">
                  {item.q}
                  <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 py-16 sm:py-20">
        <div className="relative max-w-5xl mx-auto overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-14 text-center shadow-xl">
          <div className="pointer-events-none absolute inset-0 opacity-15">
            <div className="absolute -top-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white blur-2xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Sẵn sàng tìm công việc IT phù hợp?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
              Tạo hồ sơ, tải CV và dùng dữ liệu thị trường thật để tìm hướng đi
              phù hợp hơn cho bạn.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="flex items-center gap-2 px-8 py-3 bg-white text-blue-700 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-lg"
              >
                Đăng ký ngay
                <Rocket className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-blue-500/30 text-white border border-blue-300/50 rounded-lg font-semibold hover:bg-blue-500/50 transition-all"
              >
                Xem thị trường trước
              </Link>
            </div>
            <p className="text-xs text-blue-200 mt-6">
              Tạo tài khoản và hoàn tất thiết lập trong vài bước.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-4 py-12 border-t border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600" />
                <span className="font-bold text-slate-900">Career Nova</span>
              </div>
              <p className="text-xs text-slate-500 max-w-xs">
                Phân tích kỹ năng & việc làm IT cho sinh viên Việt Nam.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm mb-3">Sản phẩm</p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link href="/dashboard" className="hover:text-slate-900">
                    Thông tin thị trường
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="hover:text-slate-900">
                    Tìm kiếm việc làm
                  </Link>
                </li>
                <li>
                  <Link href="/skill-gap" className="hover:text-slate-900">
                    Phân tích kỹ năng
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 text-xs text-slate-500">
            <p>© 2026 Career Nova · Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
