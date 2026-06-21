"use client";

import Link from "next/link";
import { paths } from "@/paths";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Compass,
  FileText,
  Target,
  Map,
  Search,
  LayoutGrid,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  Lightbulb,
  MessageCircleQuestion,
  BookOpen,
  Gauge,
} from "lucide-react";
import {
  IllusScan,
  IllusMatch,
  IllusRoadmap,
  IllusSaved,
  IllusHero,
} from "./illustrations";
import {
  MockProfile,
  MockMatch,
  MockRoadmap,
  MockJob,
  MiniRadar,
  ScoreDonut,
  SkillChips,
} from "./mockups";

const NAV = [
  { href: "#bat-dau", label: "Bắt đầu" },
  { href: "#huong-dan", label: "Hướng dẫn" },
  { href: "#doc-ket-qua", label: "Đọc kết quả" },
  { href: "#tinh-nang", label: "Tính năng" },
  { href: "#thuat-ngu", label: "Thuật ngữ" },
  { href: "#faq", label: "Câu hỏi" },
];

/** Hướng dẫn chi tiết từng bước (click-by-click) + mockup "bạn sẽ thấy gì". */
const WALKTHROUGH = [
  {
    step: 1,
    title: "Khám phá hồ sơ",
    what: "Cho hệ thống biết bạn là ai để gợi ý chính xác hơn.",
    steps: [
      "Mở Kiểm tra hướng nghiệp (menu avatar hoặc thanh bên) và làm bài trắc nghiệm định hướng.",
      "Vào Hồ sơ của tôi, điền ngành học, năm học và các kỹ năng bạn có.",
      "Theo dõi thanh “Độ hoàn thiện hồ sơ” ở góc dưới bên trái cho tới khi đạt 100%.",
    ],
    tip: "Hồ sơ càng đầy đủ, gợi ý việc làm và kỹ năng càng đúng với bạn.",
    href: "/onboarding/welcome",
    cta: "Kiểm tra hướng nghiệp",
    Illus: IllusScan,
    Mock: MockProfile,
    tone: {
      tile: "bg-blue-50 dark:bg-blue-950/30",
      ink: "text-blue-600 dark:text-blue-300",
      badge: "bg-blue-600",
      link: "text-blue-600 dark:text-blue-400",
      num: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    },
  },
  {
    step: 2,
    title: "Phân tích & So khớp CV",
    what: "Đối chiếu CV của bạn với một vị trí để biết mức phù hợp.",
    steps: [
      "Vào So khớp CV, tải CV lên (PDF, JPG hoặc PNG) hoặc chọn CV đã có.",
      "Chọn nguồn so khớp: Nhóm nghề (vd Software Developer) hoặc dán URL công việc.",
      "Bấm “Phân tích & So khớp” rồi chờ vài giây để AI xử lý.",
      "Xem điểm phù hợp, kỹ năng đã đạt và kỹ năng còn thiếu.",
    ],
    tip: "Đặt một CV làm “Mặc định” để điểm match hiển thị thống nhất trên mọi trang.",
    href: paths.cvMatching,
    cta: "So khớp CV",
    Illus: IllusMatch,
    Mock: MockMatch,
    tone: {
      tile: "bg-violet-50 dark:bg-violet-950/30",
      ink: "text-violet-600 dark:text-violet-300",
      badge: "bg-violet-600",
      link: "text-violet-600 dark:text-violet-400",
      num: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    },
  },
  {
    step: 3,
    title: "Học để lấp khoảng trống",
    what: "Bổ sung đúng kỹ năng còn thiếu bằng lộ trình và khóa học gợi ý.",
    steps: [
      "Mở Phân tích kỹ năng để xem bạn còn thiếu kỹ năng nào so với thị trường.",
      "Bấm Khoá học & Lộ trình để xem lộ trình học theo định hướng.",
      "Chọn một kỹ năng cần học để xem các khóa học liên quan.",
    ],
    tip: "Học xong, quay lại So khớp CV để thấy điểm phù hợp tăng lên.",
    href: paths.roadmap.index,
    cta: "Khoá học & Lộ trình",
    Illus: IllusRoadmap,
    Mock: MockRoadmap,
    tone: {
      tile: "bg-emerald-50 dark:bg-emerald-950/30",
      ink: "text-emerald-600 dark:text-emerald-300",
      badge: "bg-emerald-600",
      link: "text-emerald-600 dark:text-emerald-400",
      num: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    },
  },
  {
    step: 4,
    title: "Tìm & lưu cơ hội",
    what: "Tìm việc phù hợp và lưu lại để xem sau.",
    steps: [
      "Vào Tìm kiếm việc làm, lọc theo khu vực hoặc loại hình nếu cần.",
      "Mở chi tiết một tin để xem yêu cầu và mức độ khớp với CV của bạn.",
      "Lưu lại tin bạn quan tâm để xem lại trong mục Cơ hội đã lưu.",
    ],
    tip: null,
    href: paths.jobs.index,
    cta: "Tìm kiếm việc làm",
    Illus: IllusSaved,
    Mock: MockJob,
    tone: {
      tile: "bg-amber-50 dark:bg-amber-950/30",
      ink: "text-amber-600 dark:text-amber-300",
      badge: "bg-amber-600",
      link: "text-amber-600 dark:text-amber-400",
      num: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    },
  },
];

const FEATURES = [
  { title: "Thông tin Thị trường", href: paths.dashboard, Icon: LayoutGrid, desc: "Xu hướng tuyển dụng IT, kỹ năng được săn đón và phân bố thị trường. Không cần đăng nhập." },
  { title: "Tổng quan", href: paths.personalDashboard, Icon: LayoutDashboard, desc: "Bảng điều khiển cá nhân: job phù hợp, độ hoàn thiện hồ sơ, kỹ năng cần cải thiện và tiến độ." },
  { title: "Kiểm tra hướng nghiệp", href: "/onboarding/welcome", Icon: Compass, desc: "Trắc nghiệm định hướng giúp gợi ý nhóm nghề phù hợp với sở thích và thế mạnh của bạn." },
  { title: "So khớp CV", href: paths.cvMatching, Icon: FileText, desc: "Cốt lõi của hệ thống — đối chiếu CV với một vị trí (nhóm nghề hoặc URL việc) để ra điểm phù hợp." },
  { title: "Phân tích kỹ năng", href: paths.skillGap, Icon: Target, desc: "Biểu đồ radar và độ khớp theo từng nhóm kỹ năng so với yêu cầu thị trường." },
  { title: "Đề xuất", href: paths.recommendations, Icon: Sparkles, desc: "Tổng hợp nhanh việc làm phù hợp, kỹ năng cần ưu tiên và tài nguyên học." },
  { title: "Khoá học & Lộ trình", href: paths.roadmap.index, Icon: Map, desc: "Lộ trình học theo định hướng cùng khóa học gợi ý để lấp khoảng trống kỹ năng." },
  { title: "Tìm kiếm việc làm", href: paths.jobs.index, Icon: Search, desc: "Duyệt và tìm tin tuyển dụng, xem chi tiết và lưu lại cơ hội bạn quan tâm." },
];

const GLOSSARY = [
  { term: "Nhóm nghề", def: "Tập hợp các vị trí tương tự (vd Software Developer) dùng để so khớp CV theo yêu cầu chung của nhóm." },
  { term: "CV mặc định", def: "CV được dùng để tính điểm match hiển thị thống nhất trên toàn hệ thống. Đổi được bất cứ lúc nào." },
  { term: "Điểm phù hợp", def: "Tỷ lệ % CV đáp ứng yêu cầu của vị trí, tính theo trọng số từng kỹ năng." },
  { term: "Khớp một phần", def: "Kỹ năng trong CV liên quan về ngữ nghĩa với yêu cầu (gần nghĩa, không trùng tên) — vẫn được tính điểm." },
  { term: "Khoảng trống kỹ năng", def: "Những kỹ năng thị trường yêu cầu mà CV của bạn chưa có." },
  { term: "Độ hoàn thiện hồ sơ", def: "Mức độ đầy đủ thông tin hồ sơ — càng cao thì gợi ý càng chính xác." },
];

const FAQS = [
  { q: "Tôi có cần CV để dùng hệ thống không?", a: "Trang Thông tin Thị trường xem được mà không cần đăng nhập hay CV. Nhưng để so khớp và nhận gợi ý cá nhân hóa, bạn nên tải lên một CV." },
  { q: "Tôi tải CV ở định dạng nào?", a: "Hỗ trợ PDF, JPG và PNG. Nên dùng bản rõ nét để AI đọc chính xác kỹ năng." },
  { q: "“CV mặc định” là gì?", a: "Là CV được dùng để tính điểm match hiển thị thống nhất trên toàn bộ các trang. Bạn có thể đổi CV mặc định bất cứ lúc nào trong trang So khớp CV." },
  { q: "Điểm phù hợp được tính thế nào?", a: "Hệ thống dùng AI đối soát ngữ nghĩa giữa kỹ năng trong CV và yêu cầu công việc, tính theo trọng số từng kỹ năng. Kỹ năng “khớp một phần” vẫn được tính điểm." },
  { q: "Làm sao để tăng điểm phù hợp?", a: "Xem mục Phân tích kỹ năng để biết khoảng trống, rồi vào Khoá học & Lộ trình để bổ sung đúng kỹ năng còn thiếu. Sau đó so khớp lại để thấy điểm thay đổi." },
  { q: "Vì sao kết quả mỗi lần có thể hơi khác nhau?", a: "Do hệ thống đối soát theo ngữ nghĩa nên có thể chênh lệch nhỏ. Dùng cùng một CV mặc định để kết quả nhất quán hơn." },
  { q: "Dữ liệu so khớp có được lưu lại không?", a: "Có. Mỗi lần so khớp được lưu vào lịch sử của CV đó — bạn có thể mở lại để so sánh các lần phân tích khác nhau." },
  { q: "Bật chế độ tối ở đâu?", a: "Trong menu avatar ở góc trên bên phải, chọn “Chế độ tối”. Bấm lại để về chế độ sáng." },
];

export default function GuidePage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 pb-4">
      {/* Hero */}
      <section
        id="bat-dau"
        className="relative scroll-mt-24 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md"
      >
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-100">
              <Sparkles className="h-4 w-4" />
              HƯỚNG DẪN SỬ DỤNG
            </div>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              Bắt đầu với Career Nova
            </h1>
            <p className="mt-2 max-w-xl text-sm text-blue-50/90 sm:text-base">
              Phân tích kỹ năng, đối chiếu CV với nhu cầu tuyển dụng và tìm lộ
              trình học phù hợp. Làm theo 4 bước bên dưới — mỗi bước có hướng dẫn
              thao tác cụ thể.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="#huong-dan"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition-transform hover:scale-105"
              >
                <BookOpen className="h-4 w-4" />
                Xem hướng dẫn
              </a>
              <Link
                href={paths.cvMatching}
                className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <FileText className="h-4 w-4" />
                So khớp CV ngay
              </Link>
            </div>
          </div>
          <IllusHero className="hidden h-40 w-52 shrink-0 sm:block" />
        </div>
      </section>

      {/* Mục lục điều hướng nhanh */}
      <nav className="-mt-4 flex flex-wrap gap-2">
        {NAV.map((n) => (
          <a
            key={n.href}
            href={n.href}
            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:text-blue-300"
          >
            {n.label}
          </a>
        ))}
      </nav>

      {/* Hướng dẫn chi tiết từng bước */}
      <section id="huong-dan" className="scroll-mt-24">
        <h2 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
          Hướng dẫn theo 4 bước
        </h2>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          Làm tuần tự để tận dụng tối đa hệ thống. Mỗi bước kèm thao tác cụ thể
          và hình minh họa kết quả.
        </p>

        <div className="space-y-5">
          {WALKTHROUGH.map(({ step, title, what, steps, tip, href, cta, Illus, Mock, tone }) => (
            <div
              key={step}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="grid gap-6 p-5 sm:grid-cols-[1fr_280px] sm:p-6">
                {/* Cột nội dung */}
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white ${tone.badge}`}>
                      {step}
                    </span>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-2 ${tone.tile} ${tone.ink}`}>
                      <Illus />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {what}
                      </p>
                    </div>
                  </div>

                  {/* Các thao tác */}
                  <ol className="mt-4 space-y-2.5">
                    {steps.map((s, i) => (
                      <li key={i} className="flex gap-2.5">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${tone.num}`}>
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {s}
                        </span>
                      </li>
                    ))}
                  </ol>

                  {tip && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950/20">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
                      <p className="text-xs text-amber-900/90 dark:text-amber-100/80">
                        {tip}
                      </p>
                    </div>
                  )}

                  <Link
                    href={href}
                    className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline ${tone.link}`}
                  >
                    {cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Cột "bạn sẽ thấy gì" */}
                <div className="sm:border-l sm:border-slate-100 sm:pl-6 sm:dark:border-slate-800">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Bạn sẽ thấy
                  </p>
                  <Mock />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hiểu kết quả so khớp */}
      <section id="doc-ket-qua" className="scroll-mt-24">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <Gauge className="h-5 w-5 text-blue-500" />
          Hiểu kết quả so khớp
        </h2>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          Sau khi so khớp, bạn sẽ thấy 3 thông tin chính dưới đây.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Điểm phù hợp */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Điểm phù hợp (%)
            </h3>
            <div className="my-3">
              <ScoreDonut value={60} />
            </div>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
              <li><b className="text-emerald-600 dark:text-emerald-400">80–100%</b> — Rất phù hợp</li>
              <li><b className="text-amber-600 dark:text-amber-400">60–79%</b> — Khá tốt, cần bổ sung vài kỹ năng</li>
              <li><b className="text-red-500">Dưới 60%</b> — Còn cách khá xa, nên học thêm</li>
            </ul>
          </div>

          {/* Mức khớp từng kỹ năng */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Mức khớp từng kỹ năng
            </h3>
            <div className="my-3">
              <SkillChips />
            </div>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
              <li><span className="font-semibold text-emerald-600 dark:text-emerald-400">Xanh lá</span> — Đạt: đã có trong CV</li>
              <li><span className="font-semibold text-amber-600 dark:text-amber-400">Vàng</span> — Khớp một phần: gần nghĩa</li>
              <li><span className="font-semibold text-red-500">Đỏ</span> — Còn thiếu: cần học thêm</li>
            </ul>
          </div>

          {/* Radar */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Biểu đồ radar
            </h3>
            <div className="my-3 flex justify-center">
              <MiniRadar />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Vùng <span className="font-semibold text-blue-600 dark:text-blue-400">xanh dương</span> là kỹ năng của bạn,{" "}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">xanh lá</span> là yêu cầu thị trường.
              Khoảng cách giữa hai vùng chính là kỹ năng cần bổ sung.
            </p>
          </div>
        </div>
      </section>

      {/* Các tính năng */}
      <section id="tinh-nang" className="scroll-mt-24">
        <h2 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
          Các mục trong menu
        </h2>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          Biết tìm gì ở đâu — bấm vào từng mục để mở trang tương ứng.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map(({ title, href, desc, Icon }) => (
            <Link
              key={title}
              href={href}
              className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-blue-950/40 dark:group-hover:text-blue-300">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h3 className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                  {title}
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-slate-600" />
                </h3>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                  {desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Thuật ngữ */}
      <section id="thuat-ngu" className="scroll-mt-24">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <BookOpen className="h-5 w-5 text-blue-500" />
          Thuật ngữ thường gặp
        </h2>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          Một số từ bạn sẽ thấy khi dùng hệ thống.
        </p>
        <dl className="grid gap-3 sm:grid-cols-2">
          {GLOSSARY.map(({ term, def }) => (
            <div
              key={term}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <dt className="text-sm font-bold text-slate-900 dark:text-white">
                {term}
              </dt>
              <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {def}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Mẹo nhỏ */}
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
        <h2 className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
          <Lightbulb className="h-5 w-5" />
          Mẹo nhỏ
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            "Hoàn thiện hồ sơ 100% để gợi ý chính xác hơn.",
            "Đặt một CV làm “Mặc định” để điểm match đồng nhất trên mọi trang.",
            "Thử so khớp với nhiều nhóm nghề để tìm hướng phù hợp nhất.",
            "Học xong kỹ năng còn thiếu thì so khớp lại để thấy điểm tăng.",
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-sm text-amber-900/90 dark:text-amber-100/80">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24">
        <h2 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
          Câu hỏi thường gặp
        </h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Bấm vào câu hỏi để xem câu trả lời.
        </p>
        <Accordion
          type="single"
          collapsible
          defaultValue="faq-0"
          className="rounded-xl border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900"
        >
          {FAQS.map(({ q, a }, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border-slate-100 dark:border-slate-800"
            >
              <AccordionTrigger className="font-semibold text-slate-900 hover:no-underline dark:text-white">
                {q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 dark:text-slate-300">
                {a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Cần thêm trợ giúp */}
      <section className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-800/40">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
          <MessageCircleQuestion className="h-5 w-5" />
        </span>
        <h2 className="font-bold text-slate-900 dark:text-white">
          Vẫn còn thắc mắc?
        </h2>
        <p className="max-w-md text-sm text-slate-600 dark:text-slate-300">
          Cách nhanh nhất để hiểu hệ thống là thử ngay: tải CV và chạy so khớp
          đầu tiên của bạn.
        </p>
        <Link
          href={paths.cvMatching}
          className="mt-1 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <FileText className="h-4 w-4" />
          Bắt đầu so khớp CV
        </Link>
      </section>
    </div>
  );
}
