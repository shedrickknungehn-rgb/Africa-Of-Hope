import { BookOpen, ClipboardList, DollarSign, Plus, Users } from "lucide-react";
import type {
  Course,
  Enrollment,
  Payment,
  ReportOverview,
  User,
} from "../schoolApi";

interface Props {
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  payments: Payment[];
  report: ReportOverview | null;
  onNavigate: (tab: string) => void;
}

export default function OverviewTab({
  users,
  courses,
  enrollments,
  payments,
  report,
  onNavigate,
}: Props) {
  const stats = [
    {
      label: "Students",
      value:
        report?.totalStudents ??
        users.filter((user) => user.role === "student").length,
      sub: `${report?.totalUsers ?? users.length} active users`,
      color: "bg-[#1a6b2a]",
      icon: Users,
      tab: "users",
    },
    {
      label: "Active courses",
      value:
        report?.activeCourses ??
        courses.filter((course) => course.status === "active").length,
      sub: `${report?.totalCourses ?? courses.length} total courses`,
      color: "bg-[#d4a017]",
      icon: BookOpen,
      tab: "courses",
    },
    {
      label: "Enrollments",
      value: report?.totalEnrollments ?? enrollments.length,
      sub: `${report?.pendingEnrollments ?? enrollments.filter((enrollment) => enrollment.status === "pending").length} pending`,
      color: "bg-blue-600",
      icon: ClipboardList,
      tab: "enrollments",
    },
    {
      label: "Pending payments",
      value:
        report?.pendingPayments ??
        payments.filter(
          (payment) =>
            payment.status === "pending" || payment.status === "overdue",
        ).length,
      sub: `${report?.paidPayments ?? payments.filter((payment) => payment.status === "paid").length} paid`,
      color: "bg-teal-600",
      icon: DollarSign,
      tab: "finance",
    },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, sub, color, icon: Icon, tab }) => (
          <button
            key={label}
            onClick={() => onNavigate(tab)}
            className="rounded-2xl bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${color}`}
            >
              <Icon className="h-4 w-4 text-white" />
            </div>
            <p className="text-2xl font-black text-[#0f0f0f] sm:text-3xl">
              {value}
            </p>
            <p className="text-xs font-bold text-gray-700 sm:text-sm">
              {label}
            </p>
            <p className="mt-0.5 hidden text-xs text-gray-400 sm:block">
              {sub}
            </p>
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-black">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                label: "Add user",
                tab: "users",
                color: "bg-[#1a6b2a] text-white",
              },
              {
                label: "Create course",
                tab: "courses",
                color: "bg-[#d4a017] text-[#0f0f0f]",
              },
              {
                label: "New enrollment",
                tab: "enrollments",
                color: "bg-blue-600 text-white",
              },
              {
                label: "Record payment",
                tab: "finance",
                color: "bg-teal-600 text-white",
              },
              {
                label: "Manage quizzes",
                tab: "assessments",
                color: "bg-violet-600 text-white",
              },
              {
                label: "View reports",
                tab: "reports",
                color: "bg-gray-700 text-white",
              },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => onNavigate(action.tab)}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-bold ${action.color}`}
              >
                <Plus className="h-4 w-4" />
                {action.label}
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-black">Recent users</h2>
          {users.length ? (
            <div className="space-y-3">
              {users
                .slice(-5)
                .reverse()
                .map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a6b2a]/10 text-xs font-black text-[#1a6b2a]">
                      {user.name
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{user.name}</p>
                      <p className="text-xs capitalize text-gray-400">
                        {user.role.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No users yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
