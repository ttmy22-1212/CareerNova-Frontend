"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LayoutGrid,
  Search,
  FileText,
  Target,
  BookmarkCheck,
  TrendingUp,
  ChevronDown,
  Sparkles,
  User,
  Compass,
  Map,
  ChevronRight,
  CheckCircle2,
  Circle,
  ArrowRight,
  Menu,
  Sun,
  Moon,
  LogOut,
  Settings,
} from "lucide-react";
import { paths } from "@/paths";
import {
  useOnboarding,
  type JourneyStage,
} from "@/contexts/onboarding/onboarding-context";
import PersonalDashboardApi from "@/api/personal-dashboard";
import { useTheme } from "@/contexts/theme/theme-context";
import { useAuth } from "@/contexts/auth/auth-context";
import { SpotlightTour } from "@/components/career-lens/SpotlightTour";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { DefaultCvManager } from "../../components/cv-matching/DefaultCvManager";

type AnyJourneyStage = Pick<
  JourneyStage,
  "id" | "label" | "desc" | "done" | "href"
>;

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  badge?: string;
};

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Cá nhân",
    items: [
      {
        href: paths.personalDashboard,
        label: "Tổng quan Cá nhân",
        Icon: LayoutGrid,
        end: true,
      },
      {
        href: paths.cvMatching,
        label: "So khớp CV",
        Icon: FileText,
        badge: "Cốt lõi",
      },
      { href: paths.profile.detail, label: "Hồ sơ Người dùng", Icon: User },
      {
        href: "/onboarding/welcome",
        label: "Kiểm tra hướng nghiệp",
        Icon: Compass,
      },
      { href: paths.skillGap, label: "Phân tích kỹ năng", Icon: Target },
    ],
  },
  {
    title: "Thị trường",
    items: [
      {
        href: paths.dashboard,
        label: "Thông tin Thị trường",
        Icon: LayoutDashboard,
        end: true,
      },
      { href: paths.jobs.index, label: "Tìm kiếm việc làm", Icon: Search },
    ],
  },
  {
    title: "Lộ trình hành động",
    items: [
      {
        href: paths.recommendations,
        label: "Đề xuất",
        Icon: BookmarkCheck,
      },
      { href: paths.roadmap.index, label: "Khoá học & Lộ trình", Icon: Map },
    ],
  },
];

const allItems = navGroups.flatMap((g) => g.items);

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  [paths.dashboard]: {
    title: "Thông tin Thị trường",
    subtitle: "Tổng quan thị trường IT — không cần đăng nhập",
  },
  [paths.personalDashboard]: {
    title: "Tổng quan Cá nhân",
    subtitle: "Insight cá nhân hóa dựa trên Hồ sơ Người dùng của bạn",
  },
  [paths.jobs.index]: {
    title: "Tìm kiếm việc làm",
    subtitle: "Tìm việc phù hợp với bạn",
  },
  [paths.cvMatching]: {
    title: "So khớp CV",
    subtitle: "So khớp CV với mô tả việc",
  },
  [paths.skillGap]: {
    title: "Phân tích kỹ năng",
    subtitle: "Khoảng cách kỹ năng so với thị trường",
  },
  [paths.recommendations]: {
    title: "Đề xuất",
    subtitle: "Lộ trình & gợi ý cho bạn",
  },
  [paths.profile.detail]: {
    title: "Hồ sơ Người dùng",
    subtitle: "Thông tin cá nhân và CV của bạn",
  },
  [paths.roadmap.index]: {
    title: "Khoá học & Lộ trình",
    subtitle: "Lộ trình học theo định hướng",
  },
  "/onboarding/welcome": {
    title: "Kiểm tra hướng nghiệp",
    subtitle: "Khám phá định hướng phù hợp",
  },
};


function findActive(pathname: string) {
  let best: NavItem | null = null;
  for (const it of allItems) {
    const matched = it.end
      ? pathname === it.href
      : pathname.startsWith(it.href);
    if (matched && (!best || it.href.length > best.href.length)) best = it;
  }
  return best;
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { profile, strength, checklist, journey } = useOnboarding();
  const { theme, toggle: toggleTheme } = useTheme();
  const { user, ready: authReady, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);
  const [serverJourney, setServerJourney] = useState<AnyJourneyStage[] | null>(null);

  useEffect(() => {
    if (!user) return;
    PersonalDashboardApi.getJourney()
      .then((res) => {
        if (res?.data?.stages) setServerJourney(res.data.stages);
      })
      .catch(() => {/* fallback to localStorage journey */});
  }, [user]);

  // Thông tin Thị trường is publicly accessible (no login required)
  const PUBLIC_PATHS = [paths.dashboard];
  const isPublicPage = PUBLIC_PATHS.some((p) => pathname === p);

  useEffect(() => {
    if (authReady && !user && !isPublicPage) {
      const next = encodeURIComponent(pathname);
      router.replace(`/auth/login?next=${next}`);
    }
  }, [authReady, user, pathname, router, isPublicPage]);

  if (!authReady || (!user && !isPublicPage)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Đang kiểm tra phiên đăng nhập…
        </div>
      </div>
    );
  }

  const active = findActive(pathname);
  const meta = (active && pageMeta[active.href]) ?? {
    title: "Career Nova",
    subtitle: "",
  };

  const nextAction = checklist.find((c) => !c.done);
  const groupTitle =
    navGroups.find((g) => g.items.some((it) => it.href === active?.href))
      ?.title ?? "";
  const initials =
    (user?.full_name || profile.major || "JD")
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "U";

  const UserAvatar = ({
    size = "h-8 w-8",
    text = "text-xs",
  }: {
    size?: string;
    text?: string;
  }) =>
    user?.avatarUrl ? (
      <img
        src={user.avatarUrl}
        alt={user.full_name}
        className={`${size} rounded-full object-cover border border-slate-200 dark:border-slate-700`}
      />
    ) : (
      <div
        className={`flex ${size} items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 ${text} font-bold text-white shadow`}
      >
        {initials}
      </div>
    );

  // --- COMPONENT CHUNG CHO DROPDOWN MENU ITEM (ĐỂ TRÁNH TRÙNG LẶP CODE) ---
  const UserDropdownMenu = ({
    closeDropdown,
  }: {
    closeDropdown: () => void;
  }) => (
    <PopoverContent side="top" align="end" className="w-60 p-1.5">
      <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {user?.full_name}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {user?.email}
        </p>
      </div>

      <button
        onClick={() => {
          toggleTheme();
          closeDropdown();
        }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {theme === "dark" ? (
          <>
            <Sun className="h-4 w-4 text-amber-400" />
            <span>Chế độ sáng</span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4 text-slate-400" />
            <span>Chế độ tối</span>
          </>
        )}
      </button>

      <Link
        href={paths.profile.detail}
        onClick={() => {
          setMobileOpen(false);
          closeDropdown(); // Đóng dropdown lập tức khi chuyển trang
        }}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <User className="h-4 w-4 text-slate-400" />
        Hồ sơ của tôi
      </Link>

      <Link
        href="/onboarding/welcome"
        onClick={() => {
          setMobileOpen(false);
          closeDropdown(); // Đóng dropdown lập tức khi chuyển trang
        }}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Settings className="h-4 w-4 text-slate-400" />
        Cập nhật onboarding
      </Link>

      <button
        onClick={() => {
          closeDropdown();
          logout();
          router.replace("/auth/login");
        }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
      >
        <LogOut className="h-4 w-4" />
        Đăng xuất
      </button>
    </PopoverContent>
  );

  const sidebarInner = (
    <>
      <div className="flex h-16 items-center border-b border-slate-100 px-4 dark:border-slate-800">
        {/* Nếu đang collapsed, bấm thẳng vào vùng logo này sẽ mở to Sidebar ra lại */}
        <div
          onClick={() => collapsed && setCollapsed(false)}
          className={`flex items-center overflow-hidden ${
            collapsed
              ? "justify-center w-full cursor-pointer hover:scale-105 transition-transform"
              : "gap-3"
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-200 dark:shadow-none">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>

          {!collapsed && (
            <div className="whitespace-nowrap">
              <p className="text-sm font-bold leading-tight text-slate-900 dark:text-slate-100">
                Career Nova
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Platform
              </p>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Thu nhỏ menu"
            className="ml-auto hidden rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:block dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = item.end
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    {...(item.href === paths.cvMatching
                      ? { "data-tour": "sidebar-cv-matching" }
                      : {})}
                    className={`group flex items-center rounded-lg py-2 text-sm font-medium transition-all duration-150 ${
                      collapsed ? "justify-center px-2" : "gap-3 px-3"
                    } ${
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-300"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      <item.Icon className="h-3.5 w-3.5" />
                    </span>
                    {!collapsed && <span>{item.label}</span>}
                    {item.badge && !isActive && !collapsed && (
                      <span className="ml-auto rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        {item.badge}
                      </span>
                    )}
                    {isActive && !collapsed && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3 dark:border-slate-800">
        {!collapsed && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                data-tour="profile-strength"
                className="mb-3 w-full rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 px-3 py-3 text-left transition-all hover:shadow-sm dark:border-blue-900 dark:from-blue-950/40 dark:to-indigo-950/40"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                    Độ hoàn thiện hồ sơ
                  </p>
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-blue-500" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                    {strength}%
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-blue-600 dark:text-blue-400">
                  {strength === 100
                    ? "Hoàn hảo! Hồ sơ đã đầy đủ"
                    : `Bấm để xem ${checklist.filter((c) => !c.done).length} bước còn thiếu`}
                </p>
              </button>
            </PopoverTrigger>
            <PopoverContent side="right" align="end" className="w-80">
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Hoàn thiện hồ sơ
                </p>
                <p className="text-xs text-slate-500">
                  Càng đầy đủ, gợi ý job & lộ trình càng chính xác.
                </p>
              </div>
              <ul className="space-y-1">
                {checklist.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={c.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-start gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors ${
                        c.done
                          ? "text-slate-400"
                          : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      {c.done ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      )}
                      <span
                        className={`flex-1 ${c.done ? "line-through" : ""}`}
                      >
                        {c.label}
                      </span>
                      {!c.done && (
                        <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                          +{c.weight}%
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        )}

        {user && (
          <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <PopoverTrigger asChild>
              <button
                className={`flex w-full items-center rounded-lg py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                  collapsed ? "justify-center px-2" : "gap-3 px-3"
                }`}
              >
                <UserAvatar />

                {!collapsed && (
                  <>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {user.full_name}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {user.email}
                      </p>
                    </div>

                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                  </>
                )}
              </button>
            </PopoverTrigger>
            <UserDropdownMenu closeDropdown={() => setDropdownOpen(false)} />
          </Popover>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <aside
        className={`z-20 hidden shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 md:flex dark:border-slate-800 dark:bg-slate-900 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarInner}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 dark:bg-slate-900">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-full flex-col">{sidebarInner}</div>
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 md:gap-4 md:px-6 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 md:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            {groupTitle && (
              <nav className="hidden items-center gap-1 text-xs text-slate-400 md:flex">
                <Link href={paths.dashboard} className="hover:text-slate-600">
                  Career Nova
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span>{groupTitle}</span>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {meta.title}
                </span>
              </nav>
            )}
            <h1 className="truncate text-base font-bold leading-tight text-slate-900 dark:text-slate-100">
              {meta.title}
            </h1>
          </div>

          {nextAction && (
            <Link
              href={nextAction.href}
              title={`Bước tiếp theo để hoàn thiện hồ sơ: ${nextAction.label}`}
              className="hidden items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 lg:flex dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Hồ sơ {strength}%</span>
              <span className="hidden xl:inline">— {nextAction.label}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}

          <div className="hidden md:block">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-100/80 active:scale-95 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <span>CV và So khớp mặc định</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>
              </PopoverTrigger>

              <PopoverContent
                align="end"
                className="w-[420px] p-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <DefaultCvManager />
              </PopoverContent>
            </Popover>
          </div>

          <button
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Chuyển sang light mode"
                : "Chuyển sang dark mode"
            }
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>

          {user && (
            <Popover
              open={headerDropdownOpen}
              onOpenChange={setHeaderDropdownOpen}
            >
              <PopoverTrigger asChild>
                <button className="hidden items-center gap-2 rounded-lg border border-transparent py-1 pl-1 pr-3 transition-all hover:border-slate-200 hover:bg-slate-50 sm:flex dark:hover:border-slate-700 dark:hover:bg-slate-800">
                  <UserAvatar />
                  <span className="hidden text-sm font-medium text-slate-700 lg:block dark:text-slate-300">
                    {user?.full_name
                      ? user.full_name.split(/\s+/).slice(-1)[0]
                      : "Thành viên"}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-slate-400 lg:block" />
                </button>
              </PopoverTrigger>
              <UserDropdownMenu
                closeDropdown={() => setHeaderDropdownOpen(false)}
              />
            </Popover>
          )}
        </header>

        <JourneyBar journey={serverJourney ?? journey} />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* First-time user tour — spotlight on real elements */}
      <SpotlightTour />
    </div>
  );
}

function JourneyBar({ journey }: { journey: AnyJourneyStage[] }) {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/onboarding")) return null;

  const firstIncomplete = journey.findIndex((s) => !s.done);

  return (
    <div
      data-tour="journey-bar"
      className="border-b border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900 md:px-6"
    >
      <div className="flex items-center gap-3">
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Hành trình
          </p>
        </div>

        <div className="hidden h-4 w-px bg-slate-200 dark:bg-slate-700 md:block" />

        <div className="flex flex-1 items-center gap-1 overflow-x-auto">
          {journey.map((stage, idx) => {
            const isCurrent = !stage.done && firstIncomplete === idx;
            const isPast = stage.done;
            const isFuture = !stage.done && !isCurrent;

            return (
              <div key={stage.id} className="flex items-center gap-1">
                <Link
                  href={stage.href}
                  title={
                    isCurrent
                      ? `Bước tiếp theo: ${stage.desc}`
                      : stage.desc
                  }
                  className={`group flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all duration-150 ${
                    isPast
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                      : isCurrent
                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-800 dark:hover:bg-blue-950/60"
                        : "text-slate-400 hover:bg-slate-50 dark:text-slate-600 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {/* Step number / icon */}
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold transition-all ${
                      isPast
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                          ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : isCurrent ? (
                      <ArrowRight className="h-3 w-3" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  <div className="hidden min-w-0 sm:block">
                    <p className="text-xs font-semibold leading-tight whitespace-nowrap">
                      {stage.label}
                    </p>
                    <p
                      className={`mt-0.5 max-w-[150px] truncate text-[10px] leading-tight ${
                        isFuture
                          ? "text-slate-400 dark:text-slate-500"
                          : "text-current opacity-75"
                      }`}
                    >
                      {stage.desc}
                    </p>
                  </div>

                  {isCurrent && (
                    <ArrowRight className="ml-0.5 hidden h-3 w-3 shrink-0 group-hover:translate-x-0.5 transition-transform sm:block" />
                  )}
                </Link>

                {idx < journey.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-200 dark:text-slate-700" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
