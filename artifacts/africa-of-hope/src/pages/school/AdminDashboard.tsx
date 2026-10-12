import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  BarChart2,
  BookOpen,
  ClipboardList,
  DollarSign,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  RefreshCw,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  type Course,
  type Enrollment,
  type Grade,
  type Payment,
  type ReportOverview,
  type User,
  apiGetCourses,
  apiGetEnrollments,
  apiGetGrades,
  apiGetPayments,
  apiGetReportOverview,
  apiGetUsers,
  clearSession,
  ROLE_COLORS,
  ROLE_LABELS,
} from "./schoolApi";
import AssessmentsTab from "./admin/AssessmentsTab";
import CoursesTab from "./admin/CoursesTab";
import EnrollmentsTab from "./admin/EnrollmentsTab";
import FinanceTab from "./admin/FinanceTab";
import OverviewTab from "./admin/OverviewTab";
import ReportsTab from "./admin/ReportsTab";
import UsersTab from "./admin/UsersTab";

type Tab =
  | "overview"
  | "users"
  | "courses"
  | "enrollments"
  | "assessments"
  | "finance"
  | "reports";
const navigation = [
  { label: "Overview", key: "overview" as Tab, icon: BarChart2 },
  { label: "Users", key: "users" as Tab, icon: Users },
  { label: "Courses", key: "courses" as Tab, icon: BookOpen },
  { label: "Enrollments", key: "enrollments" as Tab, icon: ClipboardList },
  { label: "Assessments", key: "assessments" as Tab, icon: GraduationCap },
  { label: "Finance", key: "finance" as Tab, icon: DollarSign },
  { label: "Reports", key: "reports" as Tab, icon: TrendingUp },
];
const titles: Record<Tab, string> = {
  overview: "Overview",
  users: "User management",
  courses: "Course management",
  enrollments: "Enrollment management",
  assessments: "Assessments & quizzes",
  finance: "Finance management",
  reports: "Academy reports",
};

export default function AdminDashboard({ user }: { user: User }) {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [report, setReport] = useState<ReportOverview | null>(null);
  const loadAll = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      apiGetUsers(),
      apiGetCourses(),
      apiGetEnrollments(),
      apiGetPayments(),
      apiGetGrades(),
      apiGetReportOverview(),
    ]);
    if (results[0].status === "fulfilled") setUsers(results[0].value);
    if (results[1].status === "fulfilled") setCourses(results[1].value);
    if (results[2].status === "fulfilled") setEnrollments(results[2].value);
    if (results[3].status === "fulfilled") setPayments(results[3].value);
    if (results[4].status === "fulfilled") setGrades(results[4].value);
    if (results[5].status === "fulfilled") setReport(results[5].value);
    setLoading(false);
  }, []);
  useEffect(() => {
    loadAll();
  }, [loadAll]);
  const go = (next: Tab) => {
    setTab(next);
    setSidebarOpen(false);
  };
  const refreshUsers = () =>
    apiGetUsers()
      .then(setUsers)
      .catch(() => {});
  const refreshCourses = () =>
    apiGetCourses()
      .then(setCourses)
      .catch(() => {});
  const refreshEnrollments = async () => {
    const [items, summary] = await Promise.allSettled([
      apiGetEnrollments(),
      apiGetReportOverview(),
    ]);
    if (items.status === "fulfilled") setEnrollments(items.value);
    if (summary.status === "fulfilled") setReport(summary.value);
  };
  const refreshPayments = async () => {
    const [items, summary] = await Promise.allSettled([
      apiGetPayments(),
      apiGetReportOverview(),
    ]);
    if (items.status === "fulfilled") setPayments(items.value);
    if (summary.status === "fulfilled") setReport(summary.value);
  };
  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f5f0]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-[#0d3d1a] shadow-2xl transition-transform md:relative md:w-60 md:translate-x-0 md:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          className="absolute right-4 top-4 text-white md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
        <div className="border-b border-white/10 p-4 text-center">
          <div className="mx-auto mb-2 w-fit rounded-xl bg-white px-3 py-2">
            <img
              src="/logo-full.png"
              alt="Africa of Hope"
              className="h-9 w-auto"
            />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#d4a017]">
            Management Portal
          </p>
        </div>
        <div className="border-b border-white/10 p-3">
          <div className="rounded-xl bg-white/10 p-3">
            <p className="truncate text-sm font-bold text-white">{user.name}</p>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${ROLE_COLORS[user.role]}`}
            >
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navigation.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => go(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${tab === key ? "bg-[#d4a017] font-black text-[#0f0f0f]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3">
          <button
            onClick={loadAll}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/60 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh data
          </button>
          <a
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/60 hover:bg-white/10"
          >
            <Home className="h-4 w-4" />
            Main Website
          </a>
          <button
            onClick={() => {
              clearSession();
              navigate("/school");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/60 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 bg-[#0d3d1a] px-4 py-3 text-white md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <span className="flex-1 text-sm font-black">{titles[tab]}</span>
          <span className="text-xs text-white/60">
            {user.name.split(" ")[0]}
          </span>
        </div>
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 hidden items-center justify-between md:flex">
            <div>
              <h1 className="text-2xl font-black text-[#0f0f0f]">
                {titles[tab]}
              </h1>
              <p className="text-sm text-gray-500">
                Africa of Hope — School of Professional Studies
              </p>
            </div>
            <button
              onClick={loadAll}
              className="flex items-center gap-2 text-sm text-gray-500"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
          {loading && !users.length ? (
            <div className="flex h-64 items-center justify-center text-sm text-gray-400">
              Loading academy data…
            </div>
          ) : (
            <>
              {tab === "overview" && (
                <OverviewTab
                  users={users}
                  courses={courses}
                  enrollments={enrollments}
                  payments={payments}
                  report={report}
                  onNavigate={(next) => go(next as Tab)}
                />
              )}
              {tab === "users" && (
                <UsersTab
                  users={users}
                  currentUser={user}
                  onRefresh={refreshUsers}
                />
              )}
              {tab === "courses" && (
                <CoursesTab
                  courses={courses}
                  users={users}
                  onRefresh={refreshCourses}
                />
              )}
              {tab === "enrollments" && (
                <EnrollmentsTab
                  enrollments={enrollments}
                  users={users}
                  courses={courses}
                  onRefresh={refreshEnrollments}
                />
              )}
              {tab === "assessments" && (
                <AssessmentsTab
                  courses={courses}
                  users={users}
                  currentUser={user}
                />
              )}
              {tab === "finance" && (
                <FinanceTab
                  payments={payments}
                  users={users}
                  courses={courses}
                  enrollments={enrollments}
                  onRefresh={refreshPayments}
                />
              )}
              {tab === "reports" && (
                <ReportsTab
                  report={report}
                  users={users}
                  courses={courses}
                  enrollments={enrollments}
                  payments={payments}
                  grades={grades}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
