import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BookOpen,
  DollarSign,
  Download,
  GraduationCap,
  Users,
} from "lucide-react";
import type {
  AcademicReport,
  Course,
  Enrollment,
  FinanceReport,
  Grade,
  Payment,
  ReportOverview,
  User,
} from "../schoolApi";
import {
  ROLE_LABELS,
  apiGetAcademicReport,
  apiGetFinanceReport,
} from "../schoolApi";

interface Props {
  report: ReportOverview | null;
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  payments: Payment[];
  grades: Grade[];
}
type Section = "overview" | "enrollment" | "academic" | "finance";
const COLORS = ["#1a6b2a", "#d4a017", "#3b82f6", "#ef4444", "#8b5cf6"];
const number = (value: string) =>
  parseFloat(value.replace(/[^0-9.]/g, "")) || 0;

function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
  const href = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}
function Chart({
  children,
  className = "h-64",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
function ChartEmpty() {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-gray-400">
      No data available yet.
    </div>
  );
}
function PieLegend({ items }: { items: { name: string; value: number }[] }) {
  return (
    <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-600 sm:grid-cols-3">
      {items.map((item, index) => (
        <li key={item.name} className="flex min-w-0 items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: COLORS[index % COLORS.length] }}
          />
          <span className="truncate">{item.name}</span>
          <span className="shrink-0 font-semibold text-gray-900">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ReportsTab({
  report,
  users,
  courses,
  enrollments,
  payments,
  grades,
}: Props) {
  const [section, setSection] = useState<Section>("overview");
  const [academic, setAcademic] = useState<AcademicReport | null>(null);
  const [finance, setFinance] = useState<FinanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([apiGetAcademicReport(), apiGetFinanceReport()])
      .then(([academicData, financeData]) => {
        setAcademic(academicData);
        setFinance(financeData);
      })
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load report details.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);
  const enrollmentByStatus = useMemo(
    () =>
      Object.entries(
        enrollments.reduce<Record<string, number>>(
          (total, enrollment) => ({
            ...total,
            [enrollment.status]: (total[enrollment.status] || 0) + 1,
          }),
          {},
        ),
      ).map(([name, value]) => ({ name, value })),
    [enrollments],
  );
  const enrollmentByCourse = useMemo(
    () =>
      courses
        .map((course) => ({
          name:
            course.title.length > 18
              ? `${course.title.slice(0, 17)}…`
              : course.title,
          enrollments: enrollments.filter(
            (enrollment) => enrollment.courseId === course.id,
          ).length,
        }))
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 8),
    [courses, enrollments],
  );
  const usersByRole = useMemo(
    () =>
      Object.entries(
        users.reduce<Record<string, number>>(
          (total, user) => ({
            ...total,
            [user.role]: (total[user.role] || 0) + 1,
          }),
          {},
        ),
      ).map(([name, value]) => ({ name: ROLE_LABELS[name] || name, value })),
    [users],
  );
  const localRevenue = useMemo(
    () =>
      payments
        .filter((payment) => payment.status === "paid")
        .reduce((sum, payment) => sum + number(payment.amount), 0),
    [payments],
  );
  const localOutstanding = useMemo(
    () =>
      payments
        .filter(
          (payment) =>
            payment.status === "pending" || payment.status === "overdue",
        )
        .reduce((sum, payment) => sum + number(payment.amount), 0),
    [payments],
  );
  const exportPdf = async () => {
    const { exportAcademyReportPdf } = await import("../pdf/exportPdf");
    const rows =
      section === "enrollment"
        ? [
            ["Total enrollments", String(enrollments.length)],
            [
              "Active enrollments",
              String(
                enrollments.filter((item) => item.status === "active").length,
              ),
            ],
            ...enrollmentByStatus.map((item) => [
              `${item.name} enrollments`,
              String(item.value),
            ]),
          ]
        : section === "academic"
          ? [
              ["Grades recorded", String(grades.length)],
              ...(academic?.gradesByCourse || []).map((item) => [
                item.course,
                `${item.avg}%`,
              ]),
            ]
          : section === "finance"
            ? [
                [
                  "Collected",
                  `$${(finance?.totalCollected ?? localRevenue).toFixed(2)}`,
                ],
                [
                  "Outstanding",
                  `$${(finance?.totalOutstanding ?? localOutstanding).toFixed(2)}`,
                ],
                ...(finance?.paymentStatus || []).map((item) => [
                  `${item.name} payments`,
                  String(item.value),
                ]),
              ]
            : [
                ["Users", String(report?.totalUsers ?? users.length)],
                ["Courses", String(report?.totalCourses ?? courses.length)],
                [
                  "Enrollments",
                  String(report?.totalEnrollments ?? enrollments.length),
                ],
                ["Payments", String(report?.totalPayments ?? payments.length)],
              ];
    exportAcademyReportPdf(
      `${section[0].toUpperCase()}${section.slice(1)} Report`,
      rows,
    );
  };
  const exportCsv = () => {
    if (section === "enrollment")
      return downloadCsv(
        "enrollment-report.csv",
        ["Student", "Course", "Status", "Enrolled"],
        enrollments.map((item) => [
          item.studentName || item.studentId,
          item.courseTitle || item.courseId,
          item.status,
          item.enrolledAt,
        ]),
      );
    if (section === "academic")
      return downloadCsv(
        "academic-report.csv",
        ["Student", "Course", "Assessment", "Score", "Weight", "Grade"],
        grades.map((item) => [
          item.studentName || item.studentId,
          item.courseTitle || item.courseId,
          item.assessment,
          `${item.score}/${item.maxScore}`,
          item.weight,
          item.grade,
        ]),
      );
    return downloadCsv(
      "finance-report.csv",
      ["Student", "Course", "Amount", "Status", "Reference"],
      payments.map((item) => [
        item.studentName || item.studentId,
        item.courseTitle || item.courseId,
        item.amount,
        item.status,
        item.reference,
      ]),
    );
  };
  const actions = (
    <div className="flex gap-2">
      <button
        onClick={exportCsv}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700"
      >
        <Download className="h-3 w-3" />
        CSV
      </button>
      <button
        onClick={exportPdf}
        className="flex items-center gap-2 rounded-xl bg-[#1a6b2a] px-3 py-2 text-xs font-bold text-white"
      >
        <Download className="h-3 w-3" />
        PDF
      </button>
    </div>
  );
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(["overview", "enrollment", "academic", "finance"] as Section[]).map(
          (key) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold capitalize ${section === key ? "bg-[#0d3d1a] text-white" : "bg-white text-gray-600 shadow-sm"}`}
            >
              {key}
            </button>
          ),
        )}
      </div>
      {loading && (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
          Loading report charts…
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {!loading && section === "overview" && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi
              label="Users"
              value={report?.totalUsers ?? users.length}
              icon={Users}
              color="bg-[#1a6b2a]"
            />
            <Kpi
              label="Courses"
              value={report?.totalCourses ?? courses.length}
              icon={BookOpen}
              color="bg-[#d4a017]"
            />
            <Kpi
              label="Enrollments"
              value={report?.totalEnrollments ?? enrollments.length}
              icon={GraduationCap}
              color="bg-blue-600"
            />
            <Kpi
              label="Payments"
              value={report?.totalPayments ?? payments.length}
              icon={DollarSign}
              color="bg-teal-600"
            />
          </div>
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black">Users by role</h2>
              {actions}
            </div>
            {usersByRole.length ? (
              <>
                <Chart className="h-40 sm:h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={usersByRole}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                    >
                      {usersByRole.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                </Chart>
                <PieLegend items={usersByRole} />
              </>
            ) : (
              <ChartEmpty />
            )}
          </section>
        </>
      )}
      {!loading && section === "enrollment" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <ReportCard title="Enrollments by course" actions={actions}>
            {enrollmentByCourse.length ? (
              <Chart>
                <ResponsiveContainer>
                  <BarChart data={enrollmentByCourse}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="enrollments"
                      fill="#1a6b2a"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Chart>
            ) : (
              <ChartEmpty />
            )}
          </ReportCard>
          <ReportCard title="Enrollment status">
            {enrollmentByStatus.length ? (
              <Chart>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={enrollmentByStatus}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={85}
                      label
                    >
                      {enrollmentByStatus.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Chart>
            ) : (
              <ChartEmpty />
            )}
          </ReportCard>
        </div>
      )}
      {!loading && section === "academic" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <ReportCard title="Average grade by course" actions={actions}>
            {academic?.gradesByCourse.length ? (
              <Chart>
                <ResponsiveContainer>
                  <BarChart data={academic.gradesByCourse}>
                    <XAxis dataKey="course" tick={{ fontSize: 10 }} />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Bar dataKey="avg" fill="#d4a017" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Chart>
            ) : (
              <ChartEmpty />
            )}
          </ReportCard>
          <ReportCard title="Grade distribution">
            {academic?.gradeByBand.length ? (
              <Chart>
                <ResponsiveContainer>
                  <BarChart data={academic.gradeByBand}>
                    <XAxis dataKey="band" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1a6b2a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Chart>
            ) : (
              <ChartEmpty />
            )}
          </ReportCard>
        </div>
      )}
      {!loading && section === "finance" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <ReportCard title="Revenue trend" actions={actions}>
            {finance?.revenueTrend.length ? (
              <Chart>
                <ResponsiveContainer>
                  <LineChart data={finance.revenueTrend}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#1a6b2a"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Chart>
            ) : (
              <ChartEmpty />
            )}
          </ReportCard>
          <ReportCard title="Payment status">
            <div className="mb-3 grid grid-cols-2 gap-3">
              <Metric
                label="Collected"
                value={`$${(finance?.totalCollected ?? localRevenue).toFixed(2)}`}
              />
              <Metric
                label="Outstanding"
                value={`$${(finance?.totalOutstanding ?? localOutstanding).toFixed(2)}`}
              />
            </div>
            {finance?.paymentStatus.length ? (
              <Chart>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={finance.paymentStatus}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={75}
                      label
                    >
                      {finance.paymentStatus.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Chart>
            ) : (
              <ChartEmpty />
            )}
          </ReportCard>
        </div>
      )}
    </div>
  );
}
function Kpi({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${color}`}
      >
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-sm font-bold text-gray-600">{label}</p>
    </div>
  );
}
function ReportCard({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-black">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f7f5f0] p-4">
      <p className="text-lg font-black">{value}</p>
      <p className="text-xs font-bold text-gray-500">{label}</p>
    </div>
  );
}
