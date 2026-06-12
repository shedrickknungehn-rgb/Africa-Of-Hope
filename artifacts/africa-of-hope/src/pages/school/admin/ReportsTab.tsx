import { TrendingUp, Users, BookOpen, ClipboardList, DollarSign, RefreshCw } from "lucide-react";
import type { User, Course, Enrollment, Payment, ReportOverview } from "../schoolApi";
import { ROLE_LABELS } from "../schoolApi";

interface Props {
  report: ReportOverview | null; users: User[]; courses: Course[];
  enrollments: Enrollment[]; payments: Payment[];
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-600 w-6 text-right">{value}</span>
    </div>
  );
}

export default function ReportsTab({ report, users, courses, enrollments, payments }: Props) {
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <RefreshCw className="w-8 h-8 text-gray-300 animate-spin mb-3" />
        <p className="text-gray-400 text-sm">Loading reports…</p>
      </div>
    );
  }

  const roleCounts = users.reduce<Record<string, number>>((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});
  const maxRoleCount = Math.max(...Object.values(roleCounts), 1);

  const courseEnrollCounts = courses.map(c => ({
    title: c.title, count: enrollments.filter(e => e.courseId === c.id).length,
  })).sort((a, b) => b.count - a.count).slice(0, 6);
  const maxEnroll = Math.max(...courseEnrollCounts.map(c => c.count), 1);

  const enrollStatuses = [
    { label: "Active", count: report.activeEnrollments, color: "bg-green-500" },
    { label: "Pending", count: report.pendingEnrollments, color: "bg-yellow-400" },
    { label: "Completed", count: enrollments.filter(e => e.status === "completed").length, color: "bg-blue-500" },
    { label: "Withdrawn", count: enrollments.filter(e => e.status === "withdrawn").length, color: "bg-gray-400" },
  ];

  const paymentStatuses = [
    { label: "Paid", count: report.paidPayments, color: "bg-green-500" },
    { label: "Pending", count: payments.filter(p => p.status === "pending").length, color: "bg-yellow-400" },
    { label: "Overdue", count: payments.filter(p => p.status === "overdue").length, color: "bg-red-500" },
    { label: "Waived", count: payments.filter(p => p.status === "waived").length, color: "bg-gray-400" },
  ];

  const kpis = [
    { label: "Total Users", value: report.totalUsers, icon: Users, color: "bg-[#1a6b2a]", sub: `${report.totalStudents} students · ${report.totalInstructors} instructors` },
    { label: "Total Courses", value: report.totalCourses, icon: BookOpen, color: "bg-[#d4a017]", sub: `${report.activeCourses} active` },
    { label: "Total Enrollments", value: report.totalEnrollments, icon: ClipboardList, color: "bg-blue-600", sub: `${report.activeEnrollments} active · ${report.pendingEnrollments} pending` },
    { label: "Payment Records", value: report.totalPayments, icon: DollarSign, color: "bg-teal-600", sub: `${report.paidPayments} paid · ${report.pendingPayments} outstanding` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0f0f0f] mb-0.5">{value}</div>
            <div className="text-xs sm:text-sm font-bold text-gray-700">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5 hidden sm:block">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#1a6b2a]" />
            <h3 className="font-black text-[#0f0f0f]">Users by Role</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(roleCounts).sort(([, a], [, b]) => b - a).map(([role, count]) => (
              <div key={role}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-600">{ROLE_LABELS[role] || role}</span>
                </div>
                <Bar value={count} max={maxRoleCount} color="bg-[#1a6b2a]" />
              </div>
            ))}
            {Object.keys(roleCounts).length === 0 && <p className="text-gray-400 text-sm text-center py-4">No data</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-[#d4a017]" />
            <h3 className="font-black text-[#0f0f0f]">Enrollments by Course</h3>
          </div>
          <div className="space-y-3">
            {courseEnrollCounts.map(({ title, count }) => (
              <div key={title}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-600 truncate max-w-[70%]">{title}</span>
                </div>
                <Bar value={count} max={maxEnroll} color="bg-[#d4a017]" />
              </div>
            ))}
            {courseEnrollCounts.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No enrollment data</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            <h3 className="font-black text-[#0f0f0f]">Enrollment Status</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {enrollStatuses.map(({ label, count, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <div className={`w-3 h-3 rounded-full ${color} mb-2`} />
                <div className="text-xl font-black text-[#0f0f0f]">{count}</div>
                <div className="text-xs text-gray-500 font-bold">{label}</div>
                <div className="text-xs text-gray-400">{report.totalEnrollments > 0 ? Math.round((count / report.totalEnrollments) * 100) : 0}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-teal-600" />
            <h3 className="font-black text-[#0f0f0f]">Payment Status</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {paymentStatuses.map(({ label, count, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <div className={`w-3 h-3 rounded-full ${color} mb-2`} />
                <div className="text-xl font-black text-[#0f0f0f]">{count}</div>
                <div className="text-xs text-gray-500 font-bold">{label}</div>
                <div className="text-xs text-gray-400">{report.totalPayments > 0 ? Math.round((count / report.totalPayments) * 100) : 0}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-black text-[#0f0f0f] mb-4">System Snapshot</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Live Sessions", value: report.liveSessions, color: "text-purple-600" },
            { label: "Upcoming Events", value: report.upcomingEvents, color: "text-indigo-600" },
            { label: "Announcements", value: report.totalAnnouncements, color: "text-orange-600" },
            { label: "Management Staff", value: report.totalManagement, color: "text-red-600" },
            { label: "Active Courses", value: report.activeCourses, color: "text-[#1a6b2a]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center p-3 bg-gray-50 rounded-xl">
              <div className={`text-2xl font-black ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 font-bold mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
