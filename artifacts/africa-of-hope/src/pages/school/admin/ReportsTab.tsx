import { useMemo, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, Users, BookOpen, ClipboardList, DollarSign, RefreshCw,
  Download, GraduationCap, Briefcase, Activity, CalendarCheck,
} from "lucide-react";
import type { User, Course, Enrollment, Payment, ReportOverview, Attendance, Grade, Payroll, StaffRecord, LeaveRequest, AcademicReport, FinanceReport, HRReport, AttendanceReport } from "../schoolApi";
import { ROLE_LABELS } from "../schoolApi";

interface Props {
  report: ReportOverview | null;
  users: User[]; courses: Course[]; enrollments: Enrollment[]; payments: Payment[];
  attendance: Attendance[]; grades: Grade[]; payroll: Payroll[]; staff: StaffRecord[];
  leave: LeaveRequest[];
  academicReport: AcademicReport | null;
  financeReport: FinanceReport | null;
  hrReport: HRReport | null;
  attendanceReport: AttendanceReport | null;
}

const GREEN = "#1a6b2a";
const GOLD = "#d4a017";
const DARK = "#0d3d1a";
const PIE_COLORS = [GREEN, GOLD, "#3b82f6", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

type ReportSection = "overview" | "enrollment" | "finance" | "academic" | "attendance" | "hr";

/* ─── CSV export helper ───────────────────────────────────────── */
function exportCsv(filename: string, headers: string[], rows: (string | number)[]) {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(","), ...rows.map(r => escape(r))].join("\n");
  const blob = new Blob([lines], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportCsvRows(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(","), ...rows.map(r => r.map(escape).join(","))].join("\n");
  const blob = new Blob([lines], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ─── CSV button ──────────────────────────────────────────────── */
function CsvBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 shadow-sm transition-colors">
      <Download className="w-3 h-3" />Export CSV
    </button>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────── */
function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(parseInt(y), parseInt(m) - 1).toLocaleString("default", { month: "short", year: "2-digit" });
}
function last6Months(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}
function num(s: string) { return parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0; }

const TOOLTIP_STYLE = { backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 11, fontWeight: 600 };

/* ─── Section pill nav ────────────────────────────────────────── */
const SECTIONS: { key: ReportSection; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: TrendingUp },
  { key: "enrollment", label: "Enrollment", icon: ClipboardList },
  { key: "finance", label: "Finance", icon: DollarSign },
  { key: "academic", label: "Academic", icon: GraduationCap },
  { key: "attendance", label: "Attendance", icon: CalendarCheck },
  { key: "hr", label: "HR & Payroll", icon: Briefcase },
];

/* ─── Stat card ────────────────────────────────────────────────── */
function KPI({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3`} style={{ backgroundColor: color }}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="text-2xl sm:text-3xl font-black text-[#0f0f0f] mb-0.5">{value}</div>
      <div className="text-xs sm:text-sm font-bold text-gray-700">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5 hidden sm:block">{sub}</div>}
    </div>
  );
}

/* ─── Chart card wrapper ──────────────────────────────────────── */
function Card({ title, icon: Icon, iconColor, children }: { title: string; icon: React.ElementType; iconColor: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
        <h3 className="font-black text-[#0f0f0f] text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────────────── */
function NoData() {
  return <div className="flex items-center justify-center h-32 text-gray-300 text-sm font-bold">No data yet</div>;
}

/* ─── Custom tooltip ──────────────────────────────────────────── */
function Tip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      {label && <p className="font-black text-gray-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || GREEN }} className="font-bold">{p.name}: {typeof p.value === "number" && p.value > 1000 ? `$${p.value.toFixed(0)}` : p.value}</p>
      ))}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────── */
export default function ReportsTab({ report, users, courses, enrollments, payments, attendance, grades, payroll, staff, leave, academicReport, financeReport: _fr, hrReport, attendanceReport: _ar }: Props) {
  void _fr; void _ar;
  const [section, setSection] = useState<ReportSection>("overview");

  /* ── Enrollment trend (last 6 months) ── */
  const months = last6Months();
  const enrollTrend = useMemo(() => {
    const counts: Record<string, number> = {};
    months.forEach(m => { counts[m] = 0; });
    enrollments.forEach(e => { const k = monthKey(e.enrolledAt || e.createdAt); if (k in counts) counts[k]++; });
    return months.map(m => ({ month: monthLabel(m), enrollments: counts[m] }));
  }, [enrollments, months]);

  /* ── Revenue trend (last 6 months) ── */
  const revTrend = useMemo(() => {
    const totals: Record<string, number> = {};
    months.forEach(m => { totals[m] = 0; });
    payments.filter(p => p.status === "paid" && p.paidAt).forEach(p => {
      const k = monthKey(p.paidAt!); if (k in totals) totals[k] += num(p.amount);
    });
    return months.map(m => ({ month: monthLabel(m), revenue: parseFloat(totals[m].toFixed(2)) }));
  }, [payments, months]);

  /* ── Enrollment by status (pie) ── */
  const enrollByStatus = useMemo(() => {
    const counts = enrollments.reduce<Record<string, number>>((acc, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc; }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [enrollments]);

  /* ── Enrollments by course (top 8) ── */
  const enrollByCourse = useMemo(() => {
    return courses.map(c => ({
      name: c.title.length > 22 ? c.title.slice(0, 20) + "…" : c.title,
      count: enrollments.filter(e => e.courseId === c.id).length,
    })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [courses, enrollments]);

  /* ── Payments by status (pie) ── */
  const payByStatus = useMemo(() => {
    const counts = payments.reduce<Record<string, number>>((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [payments]);

  /* ── Revenue collected vs outstanding ── */
  const totalCollected = useMemo(() => payments.filter(p => p.status === "paid").reduce((s, p) => s + num(p.amount), 0), [payments]);
  const totalOutstanding = useMemo(() => payments.filter(p => p.status === "pending" || p.status === "overdue").reduce((s, p) => s + num(p.amount), 0), [payments]);
  const collectionRate = totalCollected + totalOutstanding > 0 ? Math.round((totalCollected / (totalCollected + totalOutstanding)) * 100) : 0;

  /* ── Attendance rate by course (top 8) ── */
  const attendByCourse = useMemo(() => {
    const byCourse: Record<string, { present: number; total: number; title: string }> = {};
    attendance.forEach(a => {
      if (!byCourse[a.courseId]) byCourse[a.courseId] = { present: 0, total: 0, title: a.courseTitle || a.courseId };
      byCourse[a.courseId].total++;
      if (a.status === "present" || a.status === "late") byCourse[a.courseId].present++;
    });
    return Object.values(byCourse)
      .map(c => ({ name: c.title.length > 20 ? c.title.slice(0, 18) + "…" : c.title, rate: c.total > 0 ? Math.round((c.present / c.total) * 100) : 0 }))
      .sort((a, b) => b.rate - a.rate).slice(0, 8);
  }, [attendance]);

  /* ── Grade distribution ── */
  const gradeDist = useMemo(() => {
    const buckets: Record<string, number> = { "A (90-100)": 0, "B (75-89)": 0, "C (60-74)": 0, "D (50-59)": 0, "F (<50)": 0 };
    grades.forEach(g => {
      const pct = parseFloat(g.maxScore) > 0 ? (parseFloat(g.score) / parseFloat(g.maxScore)) * 100 : 0;
      if (pct >= 90) buckets["A (90-100)"]++;
      else if (pct >= 75) buckets["B (75-89)"]++;
      else if (pct >= 60) buckets["C (60-74)"]++;
      else if (pct >= 50) buckets["D (50-59)"]++;
      else buckets["F (<50)"]++;
    });
    return Object.entries(buckets).map(([name, count]) => ({ name, count }));
  }, [grades]);

  /* ── Average grade by course ── */
  const avgByCourse = useMemo(() => {
    const byCourse: Record<string, { total: number; count: number; title: string }> = {};
    grades.forEach(g => {
      if (!byCourse[g.courseId]) byCourse[g.courseId] = { total: 0, count: 0, title: g.courseTitle || g.courseId };
      const pct = parseFloat(g.maxScore) > 0 ? (parseFloat(g.score) / parseFloat(g.maxScore)) * 100 : 0;
      byCourse[g.courseId].total += pct;
      byCourse[g.courseId].count++;
    });
    return Object.values(byCourse)
      .map(c => ({ name: c.title.length > 20 ? c.title.slice(0, 18) + "…" : c.title, avg: Math.round(c.total / c.count) }))
      .sort((a, b) => b.avg - a.avg).slice(0, 8);
  }, [grades]);

  /* ── Users by role (pie) ── */
  const roleData = useMemo(() => {
    const counts = users.reduce<Record<string, number>>((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});
    return Object.entries(counts).map(([role, value]) => ({ name: ROLE_LABELS[role] || role, value }));
  }, [users]);

  /* ── Staff by department ── */
  const staffByDept = useMemo(() => {
    const counts = staff.reduce<Record<string, number>>((acc, s) => { const d = s.department || "Unassigned"; acc[d] = (acc[d] || 0) + 1; return acc; }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [staff]);

  /* ── Payroll trend (last 6 periods) ── */
  const payrollTrend = useMemo(() => {
    const byPeriod: Record<string, { gross: number; net: number }> = {};
    payroll.forEach(p => {
      if (!byPeriod[p.period]) byPeriod[p.period] = { gross: 0, net: 0 };
      byPeriod[p.period].gross += num(p.gross);
      byPeriod[p.period].net += num(p.net);
    });
    return Object.entries(byPeriod).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
      .map(([period, v]) => ({ period, gross: parseFloat(v.gross.toFixed(2)), net: parseFloat(v.net.toFixed(2)) }));
  }, [payroll]);

  /* ── Leave by status ── */
  const avgGrade = useMemo(() => {
    if (!grades.length) return 0;
    const totalPct = grades.reduce((s, g) => s + (parseFloat(g.maxScore) > 0 ? (parseFloat(g.score) / parseFloat(g.maxScore)) * 100 : 0), 0);
    return Math.round(totalPct / grades.length);
  }, [grades]);

  const overallAttRate = useMemo(() => {
    if (!attendance.length) return 0;
    const present = attendance.filter(a => a.status === "present" || a.status === "late").length;
    return Math.round((present / attendance.length) * 100);
  }, [attendance]);

  const totalPayroll = useMemo(() => payroll.reduce((s, p) => s + num(p.net), 0), [payroll]);

  /* ── Daily attendance trend (last 30 days) ── */
  const dailyAttendance = useMemo(() => {
    const now = new Date();
    const days: Record<string, { date: string; present: number; absent: number; late: number; excused: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      days[k] = { date: k.slice(5), present: 0, absent: 0, late: 0, excused: 0 };
    }
    attendance.forEach(a => {
      const k = (a.sessionDate || "").slice(0, 10);
      if (k in days) (days[k] as Record<string, number | string>)[a.status] = ((days[k] as Record<string, number | string>)[a.status] as number || 0) + 1;
    });
    return Object.values(days);
  }, [attendance]);

  /* ── Leave utilisation by type ── */
  const leaveByType = useMemo(() => {
    const counts: Record<string, { approved: number; pending: number; rejected: number }> = {};
    leave.forEach(l => {
      if (!counts[l.type]) counts[l.type] = { approved: 0, pending: 0, rejected: 0 };
      const s = l.status as "approved" | "pending" | "rejected";
      if (s in counts[l.type]) counts[l.type][s]++;
    });
    return Object.entries(counts).map(([type, c]) => ({ type, ...c }));
  }, [leave]);

  /* ── CSV exports ── */
  const csvEnrollment = () => exportCsvRows(`enrollments-${new Date().toISOString().slice(0,10)}.csv`,
    ["Student", "Course", "Status", "Fee", "Enrolled At"],
    enrollments.map(e => [e.studentName || e.studentId, e.courseTitle || e.courseId, e.status, e.fee || "0", e.enrolledAt]));

  const csvFinance = () => exportCsvRows(`finance-${new Date().toISOString().slice(0,10)}.csv`,
    ["Student", "Course", "Amount", "Status", "Method", "Due Date", "Paid On"],
    payments.map(p => [p.studentName || p.studentId, p.courseTitle || p.courseId, p.amount, p.status, p.method || "", p.dueDate || "", p.paidAt || ""]));

  const csvAcademic = () => exportCsvRows(`grades-${new Date().toISOString().slice(0,10)}.csv`,
    ["Student", "Course", "Assessment", "Score", "Max Score", "Grade", "Comment"],
    grades.map(g => [g.studentName || g.studentId, g.courseTitle || g.courseId, g.assessment, g.score, g.maxScore, g.grade || "", g.comment || ""]));

  const csvAttendance = () => exportCsvRows(`attendance-${new Date().toISOString().slice(0,10)}.csv`,
    ["Student", "Course", "Date", "Status", "Notes"],
    attendance.map(a => [a.studentName || a.studentId, a.courseTitle || a.courseId, a.sessionDate, a.status, a.notes || ""]));

  const csvHr = () => exportCsvRows(`hr-${new Date().toISOString().slice(0,10)}.csv`,
    ["Staff", "Period", "Gross", "Deductions", "Net", "Status"],
    payroll.map(p => [p.userName || p.userId, p.period, p.gross, p.deductions, p.net, p.status]));

  void exportCsv;

  /* ── Export PDF summary ── */
  const exportPdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const GREEN_RGB = [13, 61, 26] as [number, number, number];
    const GOLD_RGB = [212, 160, 23] as [number, number, number];
    const doc = new jsPDF();

    doc.setFillColor(...GREEN_RGB);
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Africa of Hope — School of Professional Studies", 14, 11);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("RIA Highway, Schiefflin Township, Lower Margibi County, Liberia", 14, 17);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GOLD_RGB);
    doc.text("Analytics Report", 14, 25.5);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);
    doc.setTextColor(0, 0, 0);

    let y = 40;

    const section = (title: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...GREEN_RGB);
      doc.text(title, 14, y);
      doc.setTextColor(0, 0, 0);
      y += 4;
    };

    section("Platform Overview");
    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value"]],
      body: [
        ["Total Users", String(report?.totalUsers ?? users.length)],
        ["Students", String(report?.totalStudents ?? 0)],
        ["Instructors", String(report?.totalInstructors ?? 0)],
        ["Active Courses", String(report?.activeCourses ?? 0)],
        ["Total Enrollments", String(report?.totalEnrollments ?? enrollments.length)],
        ["Active Enrollments", String(report?.activeEnrollments ?? 0)],
        ["Attendance Rate", `${overallAttRate}%`],
        ["Average Grade", `${avgGrade}%`],
        ["Revenue Collected", `$${totalCollected.toFixed(2)}`],
        ["Outstanding Payments", `$${totalOutstanding.toFixed(2)}`],
        ["Collection Rate", `${collectionRate}%`],
        ["Total Payroll (Net)", `$${totalPayroll.toFixed(2)}`],
      ],
      headStyles: { fillColor: GREEN_RGB, textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 70 } },
      margin: { left: 14, right: 14 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    section("Enrollment by Course (Top 8)");
    autoTable(doc, {
      startY: y,
      head: [["Course", "Enrollments"]],
      body: enrollByCourse.map(c => [c.name, c.count]),
      headStyles: { fillColor: GREEN_RGB, textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    if (y > 240) { doc.addPage(); y = 20; }

    section("Attendance Rate by Course");
    autoTable(doc, {
      startY: y,
      head: [["Course", "Attendance Rate"]],
      body: attendByCourse.map(c => [c.name, `${c.rate}%`]),
      headStyles: { fillColor: GREEN_RGB, textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    if (y > 240) { doc.addPage(); y = 20; }

    section("Grade Distribution");
    autoTable(doc, {
      startY: y,
      head: [["Grade", "Count"]],
      body: gradeDist.map(g => [g.name, g.count]),
      headStyles: { fillColor: GREEN_RGB, textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });

    const pageH = doc.internal.pageSize.height;
    doc.setDrawColor(...GREEN_RGB);
    doc.setLineWidth(0.5);
    doc.line(14, pageH - 12, 196, pageH - 12);
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()} — Africa of Hope School of Professional Studies`, 14, pageH - 7);

    doc.save(`analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <RefreshCw className="w-8 h-8 text-gray-300 animate-spin mb-3" />
        <p className="text-gray-400 text-sm">Loading reports…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setSection(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${section === key ? "bg-[#0d3d1a] text-white" : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
        <button onClick={exportPdf} className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#b8891a] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors">
          <Download className="w-3.5 h-3.5" />Export PDF
        </button>
      </div>

      {/* Overview */}
      {section === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI label="Total Users" value={report.totalUsers} icon={Users} color={DARK}
              sub={`${report.totalStudents} students · ${report.totalInstructors} instructors`} />
            <KPI label="Active Courses" value={report.activeCourses} icon={BookOpen} color={GOLD}
              sub={`${report.totalCourses} total`} />
            <KPI label="Attendance Rate" value={`${overallAttRate}%`} icon={Activity} color="#3b82f6"
              sub={`${attendance.length} records`} />
            <KPI label="Collection Rate" value={`${collectionRate}%`} icon={DollarSign} color="#0d9488"
              sub={`$${totalCollected.toFixed(0)} collected`} />
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Enrollment Trend (6 Months)" icon={ClipboardList} iconColor={GREEN}>
              {enrollTrend.some(d => d.enrollments > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={enrollTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={GREEN} stopOpacity={0.15} /><stop offset="95%" stopColor={GREEN} stopOpacity={0} /></linearGradient></defs>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip content={<Tip />} contentStyle={TOOLTIP_STYLE} />
                    <Area type="monotone" dataKey="enrollments" stroke={GREEN} strokeWidth={2.5} fill="url(#eg)" name="Enrollments" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </Card>
            <Card title="Revenue Trend (6 Months)" icon={DollarSign} iconColor={GOLD}>
              {revTrend.some(d => d.revenue > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip content={<Tip />} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="revenue" fill={GOLD} radius={[4, 4, 0, 0]} name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </Card>
            <Card title="Users by Role" icon={Users} iconColor={DARK}>
              {roleData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={roleData} cx="50%" cy="50%" outerRadius={75} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={9}>
                      {roleData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </Card>
            <Card title="System Snapshot" icon={TrendingUp} iconColor={DARK}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Live Sessions", value: report.liveSessions, color: "text-purple-600" },
                  { label: "Upcoming Events", value: report.upcomingEvents, color: "text-indigo-600" },
                  { label: "Announcements", value: report.totalAnnouncements, color: "text-orange-600" },
                  { label: "Management", value: report.totalManagement, color: "text-red-600" },
                  { label: "Total Payroll Net", value: `$${totalPayroll.toFixed(0)}`, color: "text-[#1a6b2a]" },
                  { label: "Avg Grade", value: `${avgGrade}%`, color: "text-blue-600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className={`text-xl font-black ${color}`}>{value}</div>
                    <div className="text-[10px] text-gray-500 font-bold mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Enrollment section */}
      {section === "enrollment" && (
        <div className="space-y-5">
          <div className="flex justify-end"><CsvBtn onClick={csvEnrollment} /></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI label="Total Enrollments" value={report.totalEnrollments} icon={ClipboardList} color={GREEN} sub={`${report.activeEnrollments} active`} />
            <KPI label="Pending" value={report.pendingEnrollments} icon={ClipboardList} color="#f59e0b" />
            <KPI label="Total Courses" value={report.totalCourses} icon={BookOpen} color={DARK} sub={`${report.activeCourses} active`} />
            <KPI label="Students" value={report.totalStudents} icon={Users} color="#3b82f6" />
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Enrollment Trend (6 Months)" icon={TrendingUp} iconColor={GREEN}>
              {enrollTrend.some(d => d.enrollments > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={enrollTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs><linearGradient id="eg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={GREEN} stopOpacity={0.2} /><stop offset="95%" stopColor={GREEN} stopOpacity={0} /></linearGradient></defs>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip content={<Tip />} contentStyle={TOOLTIP_STYLE} />
                    <Area type="monotone" dataKey="enrollments" stroke={GREEN} strokeWidth={2.5} fill="url(#eg2)" name="Enrollments" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </Card>
            <Card title="Enrollment Status Distribution" icon={ClipboardList} iconColor={GREEN}>
              {enrollByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={enrollByStatus} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name"
                      label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`} labelLine={false} fontSize={9}>
                      {enrollByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </Card>
            <Card title="Enrollments by Course" icon={BookOpen} iconColor={GOLD}>
              {enrollByCourse.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(180, enrollByCourse.length * 32)}>
                  <BarChart data={enrollByCourse} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 9 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fontWeight: 600 }} width={120} />
                    <Tooltip content={<Tip />} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill={GOLD} radius={[0, 4, 4, 0]} name="Enrollments" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </Card>
            <Card title="Course Capacity Utilization" icon={Activity} iconColor={DARK}>
              {courses.length > 0 ? (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {courses.slice(0, 10).map(c => {
                    const cnt = enrollments.filter(e => e.courseId === c.id && e.status === "active").length;
                    const cap = c.capacity || 30;
                    const pct = Math.min(Math.round((cnt / cap) * 100), 100);
                    return (
                      <div key={c.id}>
                        <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-1">
                          <span className="truncate max-w-[65%]">{c.title}</span>
                          <span>{cnt}/{cap}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct >= 90 ? "#ef4444" : pct >= 70 ? GOLD : GREEN }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <NoData />}
            </Card>
          </div>
        </div>
      )}

      {/* Finance section */}
      {section === "finance" && (
        <div className="space-y-5">
          <div className="flex justify-end"><CsvBtn onClick={csvFinance} /></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI label="Collected" value={`$${totalCollected.toFixed(0)}`} icon={DollarSign} color="#0d9488" sub={`${report.paidPayments} payments`} />
            <KPI label="Outstanding" value={`$${totalOutstanding.toFixed(0)}`} icon={DollarSign} color="#ef4444" sub={`${report.pendingPayments} pending`} />
            <KPI label="Collection Rate" value={`${collectionRate}%`} icon={TrendingUp} color={GREEN} />
            <KPI label="Total Records" value={report.totalPayments} icon={ClipboardList} color={DARK} />
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Revenue Trend (6 Months)" icon={DollarSign} iconColor={GOLD}>
              {revTrend.some(d => d.revenue > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip content={<Tip />} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="revenue" fill={GOLD} radius={[4, 4, 0, 0]} name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </Card>
            <Card title="Payment Status Distribution" icon={DollarSign} iconColor={GREEN}>
              {payByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={payByStatus} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name"
                      label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={9}>
                      {payByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </Card>
            <Card title="Collection Rate" icon={TrendingUp} iconColor={GREEN}>
              <div className="flex flex-col items-center justify-center h-40 gap-4">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={GREEN} strokeWidth="3.5"
                      strokeDasharray={`${collectionRate} ${100 - collectionRate}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-[#0f0f0f]">{collectionRate}%</span>
                    <span className="text-[9px] font-bold text-gray-400">Collected</span>
                  </div>
                </div>
                <div className="flex gap-6 text-xs font-bold">
                  <span className="text-green-600">Collected: ${totalCollected.toFixed(0)}</span>
                  <span className="text-red-500">Outstanding: ${totalOutstanding.toFixed(0)}</span>
                </div>
              </div>
            </Card>
            <Card title="Revenue by Course" icon={BookOpen} iconColor={GOLD}>
              {courses.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {courses.map(c => {
                    const rev = payments.filter(p => p.courseId === c.id && p.status === "paid").reduce((s, p) => s + num(p.amount), 0);
                    const total = payments.filter(p => p.courseId === c.id).reduce((s, p) => s + num(p.amount), 0);
                    if (total === 0) return null;
                    const pct = Math.round((rev / total) * 100);
                    return (
                      <div key={c.id}>
                        <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-1">
                          <span className="truncate max-w-[65%]">{c.title}</span>
                          <span className="text-green-600">${rev.toFixed(0)} / ${total.toFixed(0)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: GOLD }} />
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              ) : <NoData />}
            </Card>
          </div>
        </div>
      )}

      {/* Academic section */}
      {section === "academic" && (
        <div className="space-y-5">
          <div className="flex justify-end"><CsvBtn onClick={csvAcademic} /></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI label="Average Grade" value={`${avgGrade}%`} icon={GraduationCap} color={GREEN} sub={`${grades.length} assessments`} />
            <KPI label="Courses" value={report.activeCourses} icon={BookOpen} color={DARK} sub="active" />
            <KPI label="Active Students" value={report.totalStudents} icon={Users} color={GOLD} />
            <KPI label="Enrollments" value={report.totalEnrollments} icon={ClipboardList} color="#3b82f6" sub={`${report.activeEnrollments} active`} />
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Enrollment Trend — Line chart by month */}
            <Card title="Enrollment Trend (Last 6 Months)" icon={TrendingUp} iconColor={GREEN}>
              {(() => {
                const data = academicReport?.enrollmentTrend ?? enrollTrend.map(d => ({ month: d.month, count: d.enrollments }));
                return data.some(d => d.count > 0) ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip content={<Tip />} contentStyle={TOOLTIP_STYLE} />
                      <Line type="monotone" dataKey="count" stroke={GREEN} strokeWidth={2.5} dot={{ fill: GREEN, r: 3 }} name="Enrollments" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <NoData />;
              })()}
            </Card>
            {/* Grade Distribution by Course — Bar chart */}
            <Card title="Average Grade by Course" icon={BookOpen} iconColor={GREEN}>
              {(() => {
                const data = academicReport?.gradesByCourse ?? avgByCourse.map(d => ({ course: d.name, avg: d.avg }));
                return data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={Math.max(180, data.length * 32)}>
                    <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                      <XAxis type="number" tick={{ fontSize: 9 }} domain={[0, 100]} unit="%" />
                      <YAxis type="category" dataKey="course" tick={{ fontSize: 9, fontWeight: 600 }} width={120} />
                      <Tooltip content={<Tip />} contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="avg" fill={GREEN} radius={[0, 4, 4, 0]} name="Avg Grade %" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <NoData />;
              })()}
            </Card>
            {/* Pass / Fail Ratio — Pie chart */}
            <Card title="Pass / Fail Ratio" icon={GraduationCap} iconColor={GREEN}>
              {(() => {
                const data = academicReport?.passFail ?? (() => {
                  let pass = 0, fail = 0;
                  grades.forEach(g => { const pct = parseFloat(g.maxScore) > 0 ? (parseFloat(g.score) / parseFloat(g.maxScore)) * 100 : 0; if (pct >= 50) pass++; else fail++; });
                  return [{ name: "Pass", value: pass }, { name: "Fail", value: fail }];
                })();
                const total = data.reduce((s, d) => s + d.value, 0);
                return total > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name"
                        label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`} labelLine={false} fontSize={9}>
                        <Cell fill={GREEN} />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <NoData />;
              })()}
            </Card>
            {/* Grade band distribution */}
            <Card title="Grade Distribution (Bands)" icon={GraduationCap} iconColor={GOLD}>
              {(() => {
                const data = academicReport?.gradeByBand ?? gradeDist.map(d => ({ band: d.name, count: d.count }));
                return data.some(d => d.count > 0) ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="band" tick={{ fontSize: 8, fontWeight: 600 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip content={<Tip />} contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
                        {data.map((d, i) => (
                          <Cell key={i} fill={d.band.startsWith("A") ? GREEN : d.band.startsWith("B") ? "#4ade80" : d.band.startsWith("C") ? GOLD : d.band.startsWith("D") ? "#f97316" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <NoData />;
              })()}
            </Card>
          </div>
        </div>
      )}

      {/* Attendance section */}
      {section === "attendance" && (
        <div className="space-y-5">
          <div className="flex justify-end"><CsvBtn onClick={csvAttendance} /></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI label="Attendance Rate" value={`${overallAttRate}%`} icon={CalendarCheck} color="#3b82f6" sub={`${attendance.length} records`} />
            <KPI label="Present" value={attendance.filter(a => a.status === "present").length} icon={Activity} color={GREEN} />
            <KPI label="Absent" value={attendance.filter(a => a.status === "absent").length} icon={Activity} color="#ef4444" />
            <KPI label="Late / Excused" value={attendance.filter(a => a.status === "late" || a.status === "excused").length} icon={Activity} color={GOLD} />
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Attendance Rate by Course" icon={Activity} iconColor="#3b82f6">
              {attendByCourse.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(180, attendByCourse.length * 32)}>
                  <BarChart data={attendByCourse} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 9 }} domain={[0, 100]} unit="%" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fontWeight: 600 }} width={120} />
                    <Tooltip content={<Tip />} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="rate" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Attendance %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </Card>
            <Card title="Daily Attendance Trends (Last 30 Days)" icon={TrendingUp} iconColor={GREEN}>
              {dailyAttendance.some(d => d.present + d.absent + d.late + d.excused > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dailyAttendance} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 8 }} interval={4} />
                    <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                    <Bar dataKey="present" stackId="a" fill={GREEN} name="Present" />
                    <Bar dataKey="late" stackId="a" fill={GOLD} name="Late" />
                    <Bar dataKey="excused" stackId="a" fill="#3b82f6" name="Excused" />
                    <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </Card>
            <Card title="Attendance Status Breakdown" icon={CalendarCheck} iconColor="#3b82f6">
              {attendance.length > 0 ? (() => {
                const counts = attendance.reduce<Record<string, number>>((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});
                const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
                const colors: Record<string, string> = { present: GREEN, absent: "#ef4444", late: GOLD, excused: "#3b82f6" };
                return (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name"
                        label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={9}>
                        {data.map((d, i) => <Cell key={i} fill={colors[d.name] || PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                );
              })() : <NoData />}
            </Card>
          </div>
        </div>
      )}

      {/* HR section */}
      {section === "hr" && (
        <div className="space-y-5">
          <div className="flex justify-end"><CsvBtn onClick={csvHr} /></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI label="Staff Records" value={staff.length} icon={Briefcase} color={DARK} />
            <KPI label="Total Payroll (Net)" value={`$${totalPayroll.toFixed(0)}`} icon={DollarSign} color={GREEN} sub={`${payroll.length} records`} />
            <KPI label="Paid Payslips" value={payroll.filter(p => p.status === "paid").length} icon={TrendingUp} color="#0d9488" />
            <KPI label="Management" value={report.totalManagement} icon={Users} color={GOLD} />
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Payroll Trend (Last 6 Periods)" icon={DollarSign} iconColor={GREEN}>
              {payrollTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={payrollTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="period" tick={{ fontSize: 9, fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip content={<Tip />} contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="gross" stroke={GOLD} strokeWidth={2} dot={false} name="Gross ($)" />
                    <Line type="monotone" dataKey="net" stroke={GREEN} strokeWidth={2} dot={false} name="Net ($)" />
                  </LineChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </Card>
            <Card title="Headcount by Department" icon={Briefcase} iconColor={DARK}>
              {(() => {
                const data = hrReport?.headcountByDept ?? staffByDept.map(d => ({ dept: d.name, count: d.value }));
                return data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={Math.max(180, data.length * 40)}>
                    <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <XAxis dataKey="dept" tick={{ fontSize: 9, fontWeight: 600 }} />
                      <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                      <Tooltip content={<Tip />} contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="count" fill={DARK} radius={[4, 4, 0, 0]} name="Staff" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <NoData />;
              })()}
            </Card>
            <Card title="Payroll by Status" icon={DollarSign} iconColor={GOLD}>
              {payroll.length > 0 ? (() => {
                const counts = payroll.reduce<Record<string, { count: number; net: number }>>((acc, p) => {
                  if (!acc[p.status]) acc[p.status] = { count: 0, net: 0 };
                  acc[p.status].count++;
                  acc[p.status].net += num(p.net);
                  return acc;
                }, {});
                return (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {Object.entries(counts).map(([status, { count, net }]) => (
                      <div key={status} className="bg-gray-50 rounded-xl p-3">
                        <div className={`w-3 h-3 rounded-full mb-2 ${status === "paid" ? "bg-green-500" : "bg-amber-400"}`} />
                        <div className="text-xl font-black text-[#0f0f0f]">{count}</div>
                        <div className="text-xs font-bold text-gray-500 capitalize">{status}</div>
                        <div className="text-xs text-gray-400">${net.toFixed(0)} net</div>
                      </div>
                    ))}
                  </div>
                );
              })() : <NoData />}
            </Card>
            <Card title="Staff Employment Types" icon={Users} iconColor={DARK}>
              {staff.length > 0 ? (() => {
                const types = staff.reduce<Record<string, number>>((acc, s) => { const t = s.employmentType || "Unknown"; acc[t] = (acc[t] || 0) + 1; return acc; }, {});
                const data = Object.entries(types).map(([name, value]) => ({ name, value }));
                return (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 600 }} />
                      <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                      <Tooltip content={<Tip />} contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="value" fill={DARK} radius={[4, 4, 0, 0]} name="Staff" />
                    </BarChart>
                  </ResponsiveContainer>
                );
              })() : <NoData />}
            </Card>
            <Card title="Leave Utilisation by Type" icon={CalendarCheck} iconColor="#3b82f6">
              {leaveByType.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={leaveByType} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="type" tick={{ fontSize: 9, fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                    <Bar dataKey="approved" stackId="a" fill={GREEN} name="Approved" />
                    <Bar dataKey="pending" stackId="a" fill={GOLD} name="Pending" />
                    <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
