import { useEffect, useState } from "react";
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
import { apiGetAcademicReport, apiGetFinanceReport } from "../schoolApi";

interface Props {
  report: ReportOverview | null;
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  payments: Payment[];
  grades: Grade[];
}
type Section = "overview" | "academic" | "finance";

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
  useEffect(() => {
    apiGetAcademicReport()
      .then(setAcademic)
      .catch(() => {});
    apiGetFinanceReport()
      .then(setFinance)
      .catch(() => {});
  }, []);
  const controls = [
    { key: "overview" as Section, label: "Core overview" },
    { key: "academic" as Section, label: "Academic" },
    { key: "finance" as Section, label: "Finance" },
  ];
  const exportAcademic = () =>
    downloadCsv(
      "academic-report.csv",
      ["Student", "Course", "Assessment", "Score", "Grade"],
      grades.map((grade) => [
        grade.studentName || grade.studentId,
        grade.courseTitle || grade.courseId,
        grade.assessment,
        `${grade.score}/${grade.maxScore}`,
        grade.grade,
      ]),
    );
  const exportFinance = () =>
    downloadCsv(
      "finance-report.csv",
      ["Student", "Course", "Amount", "Status", "Reference"],
      payments.map((payment) => [
        payment.studentName || payment.studentId,
        payment.courseTitle || payment.courseId,
        payment.amount,
        payment.status,
        payment.reference,
      ]),
    );
  const stats = [
    {
      label: "Users",
      value: report?.totalUsers ?? users.length,
      icon: Users,
      color: "bg-[#1a6b2a]",
    },
    {
      label: "Courses",
      value: report?.totalCourses ?? courses.length,
      icon: BookOpen,
      color: "bg-[#d4a017]",
    },
    {
      label: "Enrollments",
      value: report?.totalEnrollments ?? enrollments.length,
      icon: GraduationCap,
      color: "bg-blue-600",
    },
    {
      label: "Payments",
      value: report?.totalPayments ?? payments.length,
      icon: DollarSign,
      color: "bg-teal-600",
    },
  ];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {controls.map((control) => (
          <button
            key={control.key}
            onClick={() => setSection(control.key)}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold ${section === control.key ? "bg-[#0d3d1a] text-white" : "bg-white text-gray-600 shadow-sm"}`}
          >
            {control.label}
          </button>
        ))}
      </div>
      {section === "overview" && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
                <div
                  className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${color}`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-2xl font-black">{value}</p>
                <p className="text-sm font-bold text-gray-600">{label}</p>
              </div>
            ))}
          </div>
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-black">Academy overview</h2>
            <p className="mt-2 text-sm text-gray-500">
              Core reports cover active academy users, courses, enrollments,
              quizzes, grades, and payment records.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label="Quizzes" value={report?.totalQuizzes ?? "—"} />
              <Metric
                label="Grades"
                value={report?.totalGrades ?? grades.length}
              />
              <Metric
                label="Active enrollments"
                value={
                  report?.activeEnrollments ??
                  enrollments.filter(
                    (enrollment) => enrollment.status === "active",
                  ).length
                }
              />
            </div>
          </section>
        </>
      )}
      {section === "academic" && (
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-black">Academic report</h2>
              <p className="text-sm text-gray-500">
                Enrollments, quiz outcomes, and grades.
              </p>
            </div>
            <button
              onClick={exportAcademic}
              className="flex items-center gap-2 rounded-xl bg-[#1a6b2a] px-4 py-2.5 text-sm font-bold text-white"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(academic?.gradesByCourse || []).map((item) => (
              <Metric
                key={item.course}
                label={item.course}
                value={`${item.avg}%`}
              />
            ))}
            {!academic?.gradesByCourse.length && (
              <p className="text-sm text-gray-400">
                No academic data is available yet.
              </p>
            )}
          </div>
        </section>
      )}
      {section === "finance" && (
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-black">Finance report</h2>
              <p className="text-sm text-gray-500">
                Payment records and outstanding balances.
              </p>
            </div>
            <button
              onClick={exportFinance}
              className="flex items-center gap-2 rounded-xl bg-[#1a6b2a] px-4 py-2.5 text-sm font-bold text-white"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Metric
              label="Collected"
              value={finance ? `$${finance.totalCollected}` : "—"}
            />
            <Metric
              label="Outstanding"
              value={finance ? `$${finance.totalOutstanding}` : "—"}
            />
          </div>
        </section>
      )}
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-[#f7f5f0] p-4">
      <p className="text-2xl font-black text-[#0f0f0f]">{value}</p>
      <p className="text-xs font-bold text-gray-500">{label}</p>
    </div>
  );
}
