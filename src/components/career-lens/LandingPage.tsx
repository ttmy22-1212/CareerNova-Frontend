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
  Award,
  Rocket,
  ChevronRight,
  FileText,
  Briefcase,
  BookOpen,
} from "lucide-react";

export function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    jobs?: number;
    companies?: number;
  }>({});

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
            <span className="text-lg font-bold text-slate-900">
              Career Nova
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Market Insights
            </Link>
            <Link
              href="/auth/login"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
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
      <section className="relative py-16 sm:py-24 lg:py-32 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center">
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/auth/register"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Bắt đầu miễn phí
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-900 rounded-lg font-semibold hover:bg-slate-200 transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              Xem Thông tin Thị trường
            </Link>
          </div>

          <p className="text-sm text-slate-500 mb-12">
            Tạo hồ sơ, tải CV và xem insight nghề nghiệp trong vài bước.
          </p>

          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-50">
            <div className="aspect-video p-5 sm:p-8 text-left bg-white">
              <div className="h-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: FileText,
                    title: "CV matching",
                    desc: "Tính điểm phù hợp với từng job",
                  },
                  {
                    icon: Briefcase,
                    title: "Job gợi ý",
                    desc: "Xếp hạng theo CV mặc định",
                  },
                  {
                    icon: Target,
                    title: "Skill gap",
                    desc: "Xác định kỹ năng còn thiếu",
                  },
                  {
                    icon: BarChart3,
                    title: "Market dashboard",
                    desc: "Theo dõi nhu cầu tuyển dụng & kỹ năng hot",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                      <item.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cách hoạt động ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Chỉ 3 bước để biết mình đang ở đâu
          </h2>
          <p className="text-center text-slate-500 mb-10 max-w-xl mx-auto">
            Không cần chuyên môn phân tích — hệ thống làm phần khó, bạn chỉ cần
            hành động.
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
                className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6"
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
                <p className="text-sm text-slate-500 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
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

      {/* ── Social proof: số liệu thật ── */}
      <section className="py-12 px-4 border-t border-b border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold text-slate-500 mb-8">
            DỮ LIỆU THỊ TRƯỜNG THỰC TẾ
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
              { value: "Realtime", label: "Cập nhật xu hướng" },
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

      {/* ── Features ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Những gì bạn sẽ nhận được
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Công cụ toàn diện để hiểu rõ hơn về bản thân, thị trường, và lộ
              trình phát triển sự nghiệp
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              {
                icon: FileText,
                title: "So khớp CV",
                desc: "So khớp CV của bạn với mô tả công việc. Xem điểm match chi tiết, skills phù hợp vs. thiếu.",
                features: [
                  "Match score tức thời",
                  "Phân tích skills",
                  "Lợi thế & điểm yếu",
                ],
              },
              {
                icon: Target,
                title: "Phân tích kỹ năng",
                desc: "Biết chính xác kỹ năng nào đang thiếu so với thị trường. Nhận lộ trình học cái nào trước.",
                features: [
                  "Top gaps năng lực",
                  "Mức độ ưu tiên",
                  "Lộ trình đề xuất",
                ],
              },
              {
                icon: Briefcase,
                title: "Job Đề xuất",
                desc: "Xem danh sách jobs phù hợp với hồ sơ của bạn. Filter theo level, location, salary, skills.",
                features: ["Match ≥ 70%", "Filter nâng cao", "Save & apply"],
              },
              {
                icon: TrendingUp,
                title: "Market Insights",
                desc: "Theo dõi xu hướng thị trường: top jobs, top skills, mức lương, nhu cầu tuyển dụng.",
                features: [
                  "Real-time data",
                  "Trending skills",
                  "Salary by role",
                ],
              },
            ].map((feature, i) => {
              const Icon = feature.icon || Sparkles;
              return (
                <div
                  key={i}
                  className="p-6 border border-slate-200 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-blue-600" />
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
              );
            })}
          </div>

          {/* Extra features */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: BarChart3,
                title: "Radar Chart",
                desc: "Trực quan hóa kỹ năng",
              },
              {
                icon: BookOpen,
                title: "Learning Paths",
                desc: "Lộ trình học được cá nhân hóa",
              },
              {
                icon: Award,
                title: "Salary Insights",
                desc: "Mức lương theo vị trí",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 bg-slate-50 rounded-lg flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-1">
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

      {/* ── How It Works ── */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Hoạt động như thế nào?
            </h2>
          </div>

          <div className="space-y-8">
            {[
              {
                num: 1,
                title: "Đăng ký & Onboarding",
                desc: "Tạo tài khoản miễn phí. Hoàn thành Kiểm tra hướng nghiệp (5 phút) để hệ thống hiểu định hướng của bạn.",
                items: [
                  "Email/Password",
                  "Kinh nghiệm & skills",
                  "Định hướng sự nghiệp",
                ],
              },
              {
                num: 2,
                title: "Tải CV",
                desc: "Tải lên CV (PDF/DOCX). Hệ thống phân tích tự động trong 30 giây.",
                items: [
                  "Trích xuất thông tin",
                  "Nhân diện kỹ năng",
                  "Xác định gaps",
                ],
              },
              {
                num: 3,
                title: "Nhận Insight",
                desc: "Xem điểm match với từng job, skill gaps, lộ trình phát triển, top jobs phù hợp.",
                items: ["Phân tích kỹ năng", "Job Đề xuất", "Market Trends"],
              },
              {
                num: 4,
                title: "Hành động",
                desc: "Bắt đầu học từng skill theo lộ trình, áp dụng jobs phù hợp, theo dõi tiến độ.",
                items: ["Learning paths", "Job applications", "Track progress"],
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-6 md:gap-12 items-start">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {step.num}
                  </div>
                  {step.num < 4 && (
                    <div className="w-0.5 h-20 bg-blue-200 mt-4" />
                  )}
                </div>
                <div className="pt-2 pb-12 md:pb-0">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 mb-3">{step.desc}</p>
                  <ul className="space-y-1">
                    {step.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-slate-500"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Các luồng sử dụng chính
            </h2>
            <p className="text-slate-600">
              Chọn hướng phân tích phù hợp với mục tiêu nghề nghiệp hiện tại
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "Bắt đầu từ CV",
                text: "Tải CV để hệ thống đọc kỹ năng, tính match score và gợi ý những job phù hợp hơn với hồ sơ hiện tại.",
              },
              {
                icon: Target,
                title: "Xác định skill gap",
                text: "Xem kỹ năng còn thiếu hoặc mới khớp một phần, sau đó mở lộ trình học tương ứng để ưu tiên cải thiện.",
              },
              {
                icon: TrendingUp,
                title: "Theo dõi thị trường",
                text: "Dùng dashboard thị trường để xem vị trí, kỹ năng và mức lương đang nổi bật trong dữ liệu tuyển dụng.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <item.icon className="h-5 w-5 text-blue-600" />
                </div>
                <p className="font-semibold text-slate-900 text-sm">
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-4 bg-slate-50 border-t border-slate-200">
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
                a: "Thay vì so trùng từ khóa, hệ thống hiểu ý nghĩa từng kỹ năng (vd ReactJS liên quan tới Frontend) để đánh giá độ phù hợp chính xác hơn.",
              },
              {
                q: "Tôi cần chuẩn bị gì để bắt đầu?",
                a: "Chỉ cần một CV (PDF/DOCX). Phần còn lại hệ thống tự trích xuất và phân tích trong vài phút.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-slate-200 bg-white px-5 py-4"
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
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Sẵn sàng tìm công việc IT phù hợp?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Tạo hồ sơ, tải CV và dùng dữ liệu thị trường hiện có để tìm hướng
            đi phù hợp hơn.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Đăng ký ngay
              <Rocket className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-slate-100 text-slate-900 rounded-lg font-semibold hover:bg-slate-200 transition-all"
            >
              Xem thị trường trước
            </Link>
          </div>

          <p className="text-xs text-slate-500 mt-6">
            Tạo tài khoản và hoàn tất onboarding trong vài bước.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-4 border-t border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600" />
                <span className="font-bold text-slate-900">Career Nova</span>
              </div>
              <p className="text-xs text-slate-500">
                Nền tảng tuyển dụng thông minh cho IT Việt Nam.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm mb-3">
                Sản phẩm
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link href="/dashboard" className="hover:text-slate-900">
                    Thông tin Thị trường
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="hover:text-slate-900">
                    Tìm kiếm việc làm
                  </Link>
                </li>
                <li>
                  <Link href="/skill-gap" className="hover:text-slate-900">
                    Skill Gap
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <p>&copy; 2026 Career Nova Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
