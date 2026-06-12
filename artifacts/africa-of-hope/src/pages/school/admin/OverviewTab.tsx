import { Users, BookOpen, ClipboardList, Video, Bell, Calendar, DollarSign, TrendingUp, Plus } from "lucide-react";
import type { User, Course, Enrollment, Payment, Announcement, SchoolEvent, LiveSession, ReportOverview } from "../schoolApi";

interface Props {
  users: User[]; courses: Course[]; enrollments: Enrollment[]; payments: Payment[];
  announcements: Announcement[]; events: SchoolEvent[]; sessions: LiveSession[];
  report: ReportOverview | null; onNavigate: (tab: string) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  normal: "bg-blue-100 text-blue-700 border-blue-200",
  low: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function OverviewTab({ users, courses, enrollments, payments, announcements, events, sessions, report, onNavigate }: Props) {
  const stats = [
    { label: "Total Students", value: report?.totalStudents ?? users.filter(u => u.role === "student").length, sub: `${report?.totalUsers ?? users.length} total users`, color: "bg-[#1a6b2a]", icon: Users, tab: "users" },
    { label: "Active Courses", value: report?.activeCourses ?? courses.filter(c => c.status === "active").length, sub: `${report?.totalCourses ?? courses.length} total courses`, color: "bg-[#d4a017]", icon: BookOpen, tab: "courses" },
    { label: "Enrollments", value: report?.totalEnrollments ?? enrollments.length, sub: `${report?.pendingEnrollments ?? enrollments.filter(e => e.status === "pending").length} pending`, color: "bg-blue-600", icon: ClipboardList, tab: "enrollments" },
    { label: "Live Sessions", value: report?.liveSessions ?? sessions.filter(s => s.status === "live").length, sub: "Currently active", color: "bg-purple-600", icon: Video, tab: "overview" },
    { label: "Pending Payments", value: report?.pendingPayments ?? payments.filter(p => p.status === "pending").length, sub: `${report?.paidPayments ?? payments.filter(p => p.status === "paid").length} paid`, color: "bg-teal-600", icon: DollarSign, tab: "finance" },
    { label: "Upcoming Events", value: report?.upcomingEvents ?? events.filter(e => new Date(e.date) > new Date()).length, sub: `${report?.totalAnnouncements ?? announcements.length} announcements`, color: "bg-indigo-600", icon: Calendar, tab: "events" },
  ];

  const upcoming = events.filter(e => new Date(e.date) > new Date()).slice(0, 3);
  const recentAnnouncements = announcements.slice(0, 4);
  const recentUsers = users.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {stats.map(({ label, value, sub, color, icon: Icon, tab }) => (
          <button key={label} onClick={() => onNavigate(tab)}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm text-left hover:shadow-md transition-shadow group">
            <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0f0f0f] mb-0.5">{value}</div>
            <div className="text-xs sm:text-sm font-bold text-gray-700">{label}</div>
            <div className="text-xs text-gray-400 hidden sm:block mt-0.5">{sub}</div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-black text-[#0f0f0f] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1a6b2a]" />Quick Actions
          </h3>
          <div className="space-y-2">
            {[
              { label: "Add New User", tab: "users", color: "bg-[#1a6b2a] text-white" },
              { label: "Create Course", tab: "courses", color: "bg-[#d4a017] text-[#0f0f0f]" },
              { label: "New Enrollment", tab: "enrollments", color: "bg-blue-600 text-white" },
              { label: "Add Payment", tab: "finance", color: "bg-teal-600 text-white" },
              { label: "Post Announcement", tab: "announcements", color: "bg-orange-500 text-white" },
            ].map(({ label, tab, color }) => (
              <button key={label} onClick={() => onNavigate(tab)}
                className={`w-full ${color} hover:opacity-90 font-bold py-2.5 px-4 rounded-xl text-sm transition-all text-left flex items-center gap-2 touch-manipulation`}>
                <Plus className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[#0f0f0f] flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" />Recent Announcements
            </h3>
            <button onClick={() => onNavigate("announcements")} className="text-xs text-[#1a6b2a] font-bold hover:underline">View all</button>
          </div>
          {recentAnnouncements.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No announcements yet</p>
          ) : (
            <div className="space-y-2">
              {recentAnnouncements.map(a => (
                <div key={a.id} className={`p-3 rounded-xl border text-xs ${PRIORITY_COLORS[a.priority] || PRIORITY_COLORS.normal}`}>
                  <p className="font-bold truncate">{a.title}</p>
                  <p className="opacity-75 mt-0.5 truncate">{a.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-[#0f0f0f] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />Upcoming Events
              </h3>
              <button onClick={() => onNavigate("events")} className="text-xs text-[#1a6b2a] font-bold hover:underline">View all</button>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No upcoming events</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map(ev => (
                  <div key={ev.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-indigo-700 font-black text-xs">{new Date(ev.date).toLocaleDateString("en", { month: "short" })}</span>
                      <span className="text-indigo-700 font-black text-sm leading-none">{new Date(ev.date).getDate()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#0f0f0f] truncate">{ev.title}</p>
                      <p className="text-xs text-gray-400 truncate">{ev.location || ev.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-[#0f0f0f] text-sm">Recent Users</h3>
              <button onClick={() => onNavigate("users")} className="text-xs text-[#1a6b2a] font-bold hover:underline">View all</button>
            </div>
            <div className="space-y-2">
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#1a6b2a]/10 flex items-center justify-center text-[#1a6b2a] font-black text-[10px] flex-shrink-0">
                    {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0f0f0f] truncate">{u.name}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full capitalize">{u.role.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
