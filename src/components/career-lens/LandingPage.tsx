"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/auth/auth-context";
import {
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  BarChart3,
  CheckCircle2,
  MapPin,
  Clock,
  Users,
  Award,
  Rocket,
  Shield,
  ChevronRight,
  Star,
  Play,
  FileText,
  Briefcase,
  BookOpen,
} from "lucide-react";

export function LandingPage() {
  const { user } = useAuth();

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
      <section className="relative py-16 sm:py-24 lg:py-32 px-4">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-20" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm font-semibold text-blue-700 mb-6">
            <Sparkles className="w-4 h-4" />
            Nền tảng tuyên dụng thông minh cho IT
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Tìm công việc IT{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              phù hợp chính xác
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Tải CV, nhận gợi ý job cá nhân hóa, phân tích kỹ năng, và lộ trình
            phát triển sự nghiệp dựa trên thị trường IT thực tế.
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
              <Play className="w-4 h-4" />
              Xem Thông tin Thị trường
            </Link>
          </div>

          <p className="text-sm text-slate-500 mb-12">
            ✨ Không cần thẻ tín dụng. Hoàn tác onboarding miễn phí trong 5
            phút.
          </p>

          {/* Hero image placeholder */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-50">
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-3">
                  <Play className="w-8 h-8 text-blue-600 ml-1" />
                </div>
                <p className="text-sm text-slate-500">Xem demo (1:30)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-12 px-4 border-t border-b border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold text-slate-500 mb-6">
            ĐƯỢC TIN TỚI BỞI
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {["TechCorp", "DataFlow", "CloudSys", "DesignLab"].map(
              (company) => (
                <div
                  key={company}
                  className="text-slate-400 font-semibold text-sm"
                >
                  {company}
                </div>
              ),
            )}
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
                title: "Peer Comparison",
                desc: "So sánh với bạn cùng ngành",
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

      {/* ── Testimonials ── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Sinh viên nói gì?
            </h2>
            <p className="text-slate-600">
              Được yêu thích bởi hàng ngàn sinh viên IT Việt Nam
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Phạm Minh Đức",
                role: "CS năm 3, HUST",
                text: "Sau khi dùng Career Nova, tôi biết chính xác kỹ năng nào cần học để match với các job senior. Tăng từ 45% match lên 78% trong 2 tháng.",
                rating: 5,
              },
              {
                name: "Nguyễn Thảo Vy",
                role: "Fresh grad, HCM",
                text: "Rất helpful! Dashboard hiển thị rõ ràng, gợi ý job phù hợp, + learning paths cụ thể. Tìm được job phù hợp sau 3 tuần.",
                rating: 5,
              },
              {
                name: "Trương Quốc Huy",
                role: "Working professional",
                text: "Phân tích kỹ năng giúp tôi hiểu nên focus vào kỹ năng nào để tăng lương. Rất cụ thể, data-driven.",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-slate-700 text-sm mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </div>
              </div>
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
            Hơn 2,000 sinh viên đã dùng Career Nova để tìm được công việc ưng ý.
            Bạn tiếp theo?
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
            💳 Không cần thẻ tín dụng • 📧 Miễn phí mãi mãi • ✅ Hoàn tất
            onboarding trong 5 phút
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-4 border-t border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
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
                  <Link href="#" className="hover:text-slate-900">
                    Tìm kiếm việc làm
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-slate-900">
                    Skill Gap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm mb-3">
                Công ty
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link href="#" className="hover:text-slate-900">
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-slate-900">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-slate-900">
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm mb-3">Legal</p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link href="#" className="hover:text-slate-900">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-slate-900">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <p>&copy; 2026 Career Nova Platform. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <a href="#" className="hover:text-slate-700">
                Twitter
              </a>
              <a href="#" className="hover:text-slate-700">
                LinkedIn
              </a>
              <a href="#" className="hover:text-slate-700">
                Facebook
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
