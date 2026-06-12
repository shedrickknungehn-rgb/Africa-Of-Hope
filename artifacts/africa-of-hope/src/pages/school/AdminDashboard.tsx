import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  BarChart2, Users, BookOpen, ClipboardList, DollarSign,
  Bell, Calendar, TrendingUp, LogOut, Home, X, Menu, RefreshCw, Briefcase, Mail,
} from "lucide-react";
import {
  User, Course, LiveSession, Enrollment, Announcement, SchoolEvent, Payment, ReportOverview,
  apiGetUsers, apiGetCourses, apiGetSessions, apiGetEnrollments,
  apiGetAnnouncements, apiGetEvents, apiGetPayments, apiGetReportOverview,
  clearSession, ROLE_LABELS, ROLE_COLORS,
} from "./schoolApi";
import OverviewTab from "./admin/OverviewTab";
import UsersTab from "./admin/UsersTab";
import CoursesTab from "./admin/CoursesTab";
import EnrollmentsTab from "./admin/EnrollmentsTab";
import FinanceTab from "./admin/FinanceTab";
import AnnouncementsTab from "./admin/AnnouncementsTab";
import EventsTab from "./admin/EventsTab";
import ReportsTab from "./admin/ReportsTab";
import HRTab from "./admin/HRTab";
import MessagingTab from "./admin/MessagingTab";
import TimetableTab from "./admin/TimetableTab";
import AssessmentsTab from "./admin/AssessmentsTab";

type Tab = "overview" | "users" | "courses" | "enrollments" | "finance" | "hr" | "announcements" | "events" | "reports" | "messaging" | "timetable" | "assessments";

interface NavItem { key: Tab; label: string; icon: React.ElementType; }

const NAV_GROUPS = [
  { label: "Dashboard", items: [{ key: "overview" as Tab, label: "Overview", icon: BarChart2 }] },
  { label: "People", items: [{ key: "users" as Tab, label: "Users", icon: Users }] },
  {
    label: "Academic",
    items: [
      { key: "courses" as Tab, label: "Courses", icon: BookOpen },
      { key: "enrollments" as Tab, label: "Enrollments", icon: ClipboardList },
      { key: "timetable" as Tab, label: "Timetable & Exams", icon: Calendar },
      { key: "assessments" as Tab, label: "Assessments", icon: ClipboardList },
    ],
  },
  { label: "Finance", items: [{ key: "finance" as Tab, label: "Finance", icon: DollarSign }] },
  { label: "Human Resources", items: [{ key: "hr" as Tab, label: "HR & Payroll", icon: Briefcase }] },
  {
    label: "Communication",
    items: [
      { key: "messaging" as Tab, label: "Messaging", icon: Mail },
      { key: "announcements" as Tab, label: "Announcements", icon: Bell },
      { key: "events" as Tab, label: "Events", icon: Calendar },
    ],
  },
  { label: "Analysis", items: [{ key: "reports" as Tab, label: "Reports", icon: TrendingUp }] },
];

const TAB_TITLES: Record<Tab, string> = {
  overview: "Overview", users: "User Management", courses: "Course Management",
  enrollments: "Enrollment Management", finance: "Finance Management",
  hr: "Human Resources & Payroll", messaging: "Messaging",
  timetable: "Timetable & Exam Scheduler",
  assessments: "Assessments & Quizzes",
  announcements: "Announcements", events: "Events", reports: "Reports & Analytics",
};

export default function AdminDashboard({ user }: { user: User }) {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [report, setReport] = useState<ReportOverview | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [u, c, s, en, an, ev, py, rp] = await Promise.allSettled([
        apiGetUsers(), apiGetCourses(), apiGetSessions(),
        apiGetEnrollments(), apiGetAnnouncements(), apiGetEvents(),
        apiGetPayments(), apiGetReportOverview(),
      ]);
      if (u.status === "fulfilled") setUsers(u.value);
      if (c.status === "fulfilled") setCourses(c.value);
      if (s.status === "fulfilled") setSessions(s.value);
      if (en.status === "fulfilled") setEnrollments(en.value);
      if (an.status === "fulfilled") setAnnouncements(an.value);
      if (ev.status === "fulfilled") setEvents(ev.value);
      if (py.status === "fulfilled") setPayments(py.value);
      if (rp.status === "fulfilled") setReport(rp.value);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const refreshUsers = useCallback(() => apiGetUsers().then(setUsers).catch(() => {}), []);
  const refreshCourses = useCallback(() => apiGetCourses().then(setCourses).catch(() => {}), []);
  const refreshEnrollments = useCallback(async () => {
    const [en, rp] = await Promise.allSettled([apiGetEnrollments(), apiGetReportOverview()]);
    if (en.status === "fulfilled") setEnrollments(en.value);
    if (rp.status === "fulfilled") setReport(rp.value);
  }, []);
  const refreshAnnouncements = useCallback(() => apiGetAnnouncements().then(setAnnouncements).catch(() => {}), []);
  const refreshEvents = useCallback(() => apiGetEvents().then(setEvents).catch(() => {}), []);
  const refreshPayments = useCallback(async () => {
    const [py, rp] = await Promise.allSettled([apiGetPayments(), apiGetReportOverview()]);
    if (py.status === "fulfilled") setPayments(py.value);
    if (rp.status === "fulfilled") setReport(rp.value);
  }, []);

  const goTab = (t: Tab) => { setTab(t); setSidebarOpen(false); };

  const roleLabel = ROLE_LABELS[user.role] || user.role;
  const roleColor = ROLE_COLORS[user.role] || "bg-gray-100 text-gray-700";

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-[#0d3d1a]">
      <div className="p-4 border-b border-white/10">
        <div className="bg-white rounded-xl px-3 py-2 mx-auto w-fit mb-2 shadow-md">
          <img src="/logo-full.png" alt="Africa of Hope" className="h-9 w-auto object-contain" />
        </div>
        <p className="text-[#d4a017] text-[10px] text-center font-bold tracking-widest uppercase mt-1">Management Portal</p>
      </div>

      <div className="p-3 border-b border-white/10">
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-white font-bold text-sm truncate">{user.name}</p>
          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 ${roleColor}`}>{roleLabel}</span>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-white/30 text-[9px] font-black uppercase tracking-widest px-3 mb-1">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(({ key, label, icon: Icon }: NavItem) => (
                <button key={key} onClick={() => goTab(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors touch-manipulation ${tab === key ? "bg-[#d4a017] text-[#0f0f0f] font-black" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />{label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-0.5">
        <button onClick={loadAll} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors touch-manipulation">
          <RefreshCw className="w-4 h-4" />Refresh Data
        </button>
        <a href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors touch-manipulation">
          <Home className="w-4 h-4" />Main Website
        </a>
        <button onClick={() => { clearSession(); navigate("/school"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-colors touch-manipulation">
          <LogOut className="w-4 h-4" />Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f7f5f0] overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-auto md:w-60 md:flex-shrink-0 md:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button className="absolute top-4 right-4 z-50 text-white/70 hover:text-white md:hidden p-1" onClick={() => setSidebarOpen(false)}>
          <X className="w-5 h-5" />
        </button>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center gap-3 bg-[#0d3d1a] px-4 py-3 flex-shrink-0 shadow-lg">
          <button onClick={() => setSidebarOpen(true)} className="text-white p-1 touch-manipulation"><Menu className="w-6 h-6" /></button>
          <div className="bg-white rounded-lg px-2 py-1">
            <img src="/logo-full.png" alt="AOH" className="h-6 w-auto object-contain" />
          </div>
          <span className="text-white font-black text-sm flex-1">{TAB_TITLES[tab]}</span>
          <span className="text-white/60 text-xs truncate max-w-[80px]">{user.name.split(" ")[0]}</span>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 hidden md:flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-[#0f0f0f]">{TAB_TITLES[tab]}</h1>
                <p className="text-gray-500 text-sm">Africa of Hope — School of Professional Studies</p>
              </div>
              <button onClick={loadAll} disabled={loading} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a6b2a] transition-colors disabled:opacity-40">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Loading…" : "Refresh"}
              </button>
            </div>

            {loading && !users.length ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-[#1a6b2a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Loading data…</p>
                </div>
              </div>
            ) : (
              <>
                {tab === "overview" && <OverviewTab users={users} courses={courses} enrollments={enrollments} payments={payments} announcements={announcements} events={events} sessions={sessions} report={report} onNavigate={goTab} />}
                {tab === "users" && <UsersTab users={users} currentUser={user} onRefresh={refreshUsers} />}
                {tab === "courses" && <CoursesTab courses={courses} users={users} onRefresh={refreshCourses} />}
                {tab === "enrollments" && <EnrollmentsTab enrollments={enrollments} users={users} courses={courses} onRefresh={refreshEnrollments} />}
                {tab === "finance" && <FinanceTab payments={payments} users={users} courses={courses} enrollments={enrollments} onRefresh={refreshPayments} />}
                {tab === "hr" && <HRTab users={users} />}
                {tab === "messaging" && <MessagingTab currentUser={user} />}
                {tab === "timetable" && <TimetableTab courses={courses} users={users} />}
                {tab === "assessments" && <AssessmentsTab courses={courses} users={users} currentUser={user} />}
                {tab === "announcements" && <AnnouncementsTab announcements={announcements} currentUser={user} onRefresh={refreshAnnouncements} />}
                {tab === "events" && <EventsTab events={events} onRefresh={refreshEvents} />}
                {tab === "reports" && <ReportsTab report={report} users={users} courses={courses} enrollments={enrollments} payments={payments} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
