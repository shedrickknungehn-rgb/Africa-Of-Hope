import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { BookOpen, Video, FileText, Home, LogOut, BarChart2, Bell, Menu, X, GraduationCap, ClipboardCheck, DollarSign, Calendar, Mail, Clock, ClipboardList, CheckCircle, AlertCircle } from "lucide-react";
import {
  User, Course, Enrollment, Grade, Attendance, Payment, Announcement, SchoolEvent, TimetableSlot, Exam,
  Quiz, QuizSubmission,
  apiGetCourses, apiGetEnrollments, apiGetGrades, apiGetAttendance, apiGetPayments,
  apiGetAnnouncements, apiGetEvents, apiGetTimetable, apiGetExams, clearSession,
  apiGetQuizzes, apiSubmitQuiz, apiGetMyQuizSubmission,
} from "./schoolApi";
import MessagingTab from "./admin/MessagingTab";

type Tab = "overview" | "courses" | "transcript" | "attendance" | "finance" | "schedule" | "assessments" | "inbox" | "announcements" | "events";

export default function StudentDashboard({ user }: { user: User }) {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAlumni = user.role === "alumni";
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    apiGetCourses().then(setCourses).catch(() => {});
    apiGetEnrollments({ studentId: user.id }).then(setEnrollments).catch(() => {});
    apiGetGrades({ studentId: user.id }).then(setGrades).catch(() => {});
    apiGetAttendance({ studentId: user.id }).then(setAttendance).catch(() => {});
    apiGetPayments({ studentId: user.id }).then(setPayments).catch(() => {});
    apiGetAnnouncements().then(setAnnouncements).catch(() => {});
    apiGetEvents().then(setEvents).catch(() => {});
    apiGetTimetable().then(setTimetable).catch(() => {});
    apiGetExams().then(setExams).catch(() => {});
  }, [user.id]);

  const myCourses = useMemo(() => {
    const ids = new Set(enrollments.filter((e) => e.status !== "withdrawn").map((e) => e.courseId));
    const enrolled = courses.filter((c) => ids.has(c.id));
    return enrolled.length > 0 ? enrolled : (isAlumni ? [] : courses.filter((c) => c.status === "active"));
  }, [courses, enrollments, isAlumni]);

  const myAnnouncements = announcements.filter(
    (a) => a.targetRoles.includes("all") || a.targetRoles.includes("student") || (isAlumni && a.targetRoles.includes("alumni"))
  );

  const tabs = [
    { key: "overview" as Tab, label: "Overview", icon: BarChart2 },
    { key: "courses" as Tab, label: isAlumni ? "My Programs" : "My Courses", icon: BookOpen },
    { key: "transcript" as Tab, label: "Grades & Transcript", icon: GraduationCap },
    { key: "attendance" as Tab, label: "Attendance", icon: ClipboardCheck },
    { key: "finance" as Tab, label: "Finance", icon: DollarSign },
    { key: "assessments" as Tab, label: "Assessments", icon: ClipboardList },
    { key: "schedule" as Tab, label: "Schedule", icon: Calendar },
    { key: "inbox" as Tab, label: "Inbox", icon: Mail },
    { key: "announcements" as Tab, label: "Announcements", icon: Bell },
    { key: "events" as Tab, label: "Events", icon: Calendar },
  ];

  const changeTab = (t: Tab) => { setTab(t); setSidebarOpen(false); };

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-[#0d3d1a]">
      <div className="p-4 border-b border-white/10">
        <div className="bg-white rounded-xl px-3 py-2 mx-auto w-fit mb-2 shadow-md"><img src="/logo-full.png" alt="Africa of Hope Inc" className="h-9 w-auto object-contain" /></div>
        <p className="text-[#d4a017] text-[10px] text-center font-bold tracking-widest uppercase mt-1">School Portal</p>
      </div>
      <div className="p-3 border-b border-white/10">
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-white font-bold text-sm">{user.name}</p>
          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full uppercase mt-0.5 ${isAlumni ? "bg-indigo-500/20 text-indigo-300" : "bg-green-500/20 text-green-300"}`}>{isAlumni ? "Alumni" : "Student"}</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => changeTab(key)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors touch-manipulation ${tab === key ? "bg-[#d4a017] text-[#0f0f0f] font-black" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />{label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10 space-y-1">
        <a href="/" className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors touch-manipulation"><Home className="w-4 h-4" />Main Website</a>
        <button onClick={() => { clearSession(); navigate("/school"); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-colors touch-manipulation"><LogOut className="w-4 h-4" />Sign Out</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f7f5f0] overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full w-64 z-40 shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-auto md:w-56 md:flex-shrink-0 md:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button className="absolute top-4 right-4 z-50 text-white/70 hover:text-white md:hidden p-1" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center gap-3 bg-[#0d3d1a] px-4 py-3 flex-shrink-0 shadow-lg">
          <button onClick={() => setSidebarOpen(true)} className="text-white p-1 touch-manipulation"><Menu className="w-6 h-6" /></button>
          <div className="bg-white rounded-lg px-2 py-1"><img src="/logo-full.png" alt="AOH" className="h-6 w-auto object-contain" /></div>
          <span className="text-white font-black text-sm flex-1">School Portal</span>
          <span className="text-white/60 text-xs truncate max-w-[80px]">{user.name.split(" ")[0]}</span>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-[#0f0f0f]">Welcome, {user.name.split(" ")[0]}</h1>
            <p className="text-gray-500 text-sm">Africa of Hope School of Professional Studies</p>
          </div>

          {tab === "overview" && <OverviewView isAlumni={isAlumni} myCourses={myCourses} grades={grades} attendance={attendance} payments={payments} announcements={myAnnouncements} onGo={changeTab} onJoin={(id) => navigate(`/school/class/${id}`)} />}
          {tab === "courses" && <CoursesView isAlumni={isAlumni} myCourses={myCourses} enrollments={enrollments} onJoin={(id) => navigate(`/school/class/${id}`)} />}
          {tab === "transcript" && <TranscriptView grades={grades} courses={courses} />}
          {tab === "attendance" && <AttendanceView attendance={attendance} />}
          {tab === "finance" && <FinanceView payments={payments} />}
          {tab === "assessments" && <StudentAssessmentsView user={user} myCourses={myCourses} />}
          {tab === "schedule" && <StudentScheduleView myCourses={myCourses} timetable={timetable} exams={exams} />}
          {tab === "inbox" && <MessagingTab currentUser={user} />}
          {tab === "announcements" && <AnnouncementsView announcements={myAnnouncements} />}
          {tab === "events" && <EventsView events={events} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Overview ───────────────────────────────────────────────── */
function OverviewView({ isAlumni, myCourses, grades, attendance, payments, announcements, onGo, onJoin }: {
  isAlumni: boolean; myCourses: Course[]; grades: Grade[]; attendance: Attendance[]; payments: Payment[]; announcements: Announcement[]; onGo: (t: Tab) => void; onJoin: (id: string) => void;
}) {
  const presentRate = attendance.length ? Math.round((attendance.filter((a) => a.status === "present" || a.status === "late").length / attendance.length) * 100) : 0;
  const outstanding = payments.filter((p) => p.status === "pending" || p.status === "overdue").length;
  const stats = [
    { label: isAlumni ? "Programs" : "Courses", value: myCourses.length, color: "bg-[#1a6b2a]" },
    { label: "Grades", value: grades.length, color: "bg-[#d4a017]" },
    { label: "Attendance", value: `${presentRate}%`, color: "bg-blue-600" },
    { label: "Unpaid", value: outstanding, color: outstanding > 0 ? "bg-red-500" : "bg-gray-400" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm text-center">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${color} rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3`}><BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div>
            <div className="text-xl sm:text-3xl font-black text-[#0f0f0f]">{value}</div>
            <div className="text-[10px] sm:text-sm font-bold text-gray-600 leading-tight mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      {announcements.length > 0 && (
        <div className="bg-[#0d3d1a] rounded-2xl p-5 sm:p-6 text-white">
          <div className="flex items-center gap-3 mb-3"><Bell className="w-5 h-5 text-[#d4a017]" /><h3 className="font-black">{announcements[0].title}</h3></div>
          <p className="text-white/70 text-sm">{announcements[0].content}</p>
          {announcements.length > 1 && <button onClick={() => onGo("announcements")} className="text-[#d4a017] text-xs font-bold mt-3 hover:underline">View all {announcements.length} announcements →</button>}
        </div>
      )}
      {!isAlumni && myCourses.length > 0 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="font-black text-[#0f0f0f] mb-4">Your Courses</h3>
          <div className="space-y-3">
            {myCourses.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 sm:p-4 bg-[#f7f5f0] rounded-xl gap-3">
                <div className="min-w-0"><p className="font-bold text-sm text-[#0f0f0f] truncate">{c.title}</p><p className="text-xs text-gray-400">{c.duration} · {c.schedule}</p></div>
                <button onClick={() => onJoin(c.id)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors flex-shrink-0 touch-manipulation"><Video className="w-3 h-3" />Join</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Courses ────────────────────────────────────────────────── */
function CoursesView({ isAlumni, myCourses, enrollments, onJoin }: { isAlumni: boolean; myCourses: Course[]; enrollments: Enrollment[]; onJoin: (id: string) => void }) {
  if (myCourses.length === 0) return <Empty text={isAlumni ? "No completed programs on record yet." : "You are not enrolled in any courses yet. Contact the registrar to enroll."} />;
  const statusOf = (courseId: string) => enrollments.find((e) => e.courseId === courseId)?.status;
  const badge: Record<string, string> = { active: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-700", completed: "bg-blue-100 text-blue-700" };
  return (
    <div className="space-y-4">
      {myCourses.map((c) => {
        const st = statusOf(c.id);
        return (
          <div key={c.id} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-black text-[#0f0f0f]">{c.title}</h3>
                  {st && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${badge[st] || "bg-gray-100 text-gray-600"}`}>{st}</span>}
                </div>
                <p className="text-gray-500 text-sm mb-3">{c.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-400"><span>📅 {c.duration}</span><span>🕐 {c.schedule}</span><span>💰 {c.fee}</span></div>
                {c.materials.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.materials.map((m, i) => <a key={i} href={m.url} className="inline-flex items-center gap-1 text-xs font-medium text-[#1a6b2a] bg-[#1a6b2a]/10 px-2 py-1 rounded-lg hover:bg-[#1a6b2a]/20"><FileText className="w-3 h-3" />{m.title}</a>)}
                  </div>
                )}
              </div>
              {!isAlumni && st !== "completed" && (
                <button onClick={() => onJoin(c.id)} className="flex items-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors flex-shrink-0 touch-manipulation"><Video className="w-4 h-4" />Join Class</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Transcript ─────────────────────────────────────────────── */
function TranscriptView({ grades, courses }: { grades: Grade[]; courses: Course[] }) {
  if (grades.length === 0) return <Empty text="No grades have been recorded yet." />;
  const byCourse = useMemo(() => {
    const map = new Map<string, Grade[]>();
    grades.forEach((g) => { const arr = map.get(g.courseId) ?? []; arr.push(g); map.set(g.courseId, arr); });
    return map;
  }, [grades]);
  const courseTitle = (id: string) => courses.find((c) => c.id === id)?.title || grades.find((g) => g.courseId === id)?.courseTitle || "Course";
  const pct = (g: Grade) => { const s = parseFloat(g.score), m = parseFloat(g.maxScore); return m > 0 ? Math.round((s / m) * 100) : 0; };

  return (
    <div className="space-y-5">
      {[...byCourse.entries()].map(([cid, list]) => {
        const avg = Math.round(list.reduce((a, g) => a + pct(g), 0) / list.length);
        return (
          <div key={cid} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-[#0d3d1a] text-white px-5 py-3 flex items-center justify-between">
              <h3 className="font-black text-sm">{courseTitle(cid)}</h3>
              <span className="text-[#d4a017] font-black text-sm">Avg {avg}%</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#f7f5f0] text-gray-500 text-xs uppercase"><tr><th className="text-left px-5 py-2.5">Assessment</th><th className="text-left px-5 py-2.5">Score</th><th className="text-left px-5 py-2.5">%</th></tr></thead>
              <tbody>
                {list.map((g) => (
                  <tr key={g.id} className="border-t border-gray-100">
                    <td className="px-5 py-3 font-bold text-[#0f0f0f]">{g.assessment}{g.comment && <span className="block text-xs font-normal text-gray-400">{g.comment}</span>}</td>
                    <td className="px-5 py-3 font-mono">{g.score}/{g.maxScore}</td>
                    <td className="px-5 py-3 font-bold text-[#1a6b2a]">{pct(g)}%{g.grade && <span className="ml-1">({g.grade})</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Attendance ─────────────────────────────────────────────── */
function AttendanceView({ attendance }: { attendance: Attendance[] }) {
  if (attendance.length === 0) return <Empty text="No attendance records yet." />;
  const counts = attendance.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const rate = Math.round(((counts.present || 0) + (counts.late || 0)) / attendance.length * 100);
  const colors: Record<string, string> = { present: "text-green-600", absent: "text-red-600", late: "text-amber-600", excused: "text-blue-600" };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#0d3d1a] text-white rounded-2xl p-4 text-center col-span-2 sm:col-span-1"><div className="text-2xl font-black text-[#d4a017]">{rate}%</div><div className="text-xs font-bold text-white/70">Attendance Rate</div></div>
        {(["present", "absent", "late", "excused"] as const).map((s) => (
          <div key={s} className="bg-white rounded-2xl p-4 text-center shadow-sm"><div className={`text-2xl font-black ${colors[s]}`}>{counts[s] || 0}</div><div className="text-xs font-bold text-gray-500 capitalize">{s}</div></div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f5f0] text-gray-500 text-xs uppercase"><tr><th className="text-left px-5 py-2.5">Date</th><th className="text-left px-5 py-2.5">Class</th><th className="text-left px-5 py-2.5">Status</th></tr></thead>
          <tbody>
            {attendance.map((a) => (
              <tr key={a.id} className="border-t border-gray-100">
                <td className="px-5 py-3 text-gray-600">{new Date(a.sessionDate).toLocaleDateString()}</td>
                <td className="px-5 py-3 font-bold text-[#0f0f0f]">{a.courseTitle}</td>
                <td className={`px-5 py-3 font-bold capitalize ${colors[a.status]}`}>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Finance ────────────────────────────────────────────────── */
function FinanceView({ payments }: { payments: Payment[] }) {
  const num = (s: string) => parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;
  const paid = payments.filter((p) => p.status === "paid").reduce((a, p) => a + num(p.amount), 0);
  const due = payments.filter((p) => p.status === "pending" || p.status === "overdue").reduce((a, p) => a + num(p.amount), 0);
  const badge: Record<string, string> = { paid: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-700", overdue: "bg-red-100 text-red-700", waived: "bg-gray-100 text-gray-600" };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-5 shadow-sm"><div className="text-xs font-bold text-gray-500 uppercase">Total Paid</div><div className="text-2xl font-black text-green-600">${paid.toFixed(2)}</div></div>
        <div className="bg-white rounded-2xl p-5 shadow-sm"><div className="text-xs font-bold text-gray-500 uppercase">Outstanding</div><div className={`text-2xl font-black ${due > 0 ? "text-red-600" : "text-gray-400"}`}>${due.toFixed(2)}</div></div>
      </div>
      {payments.length === 0 ? <Empty text="No payment records yet." /> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f7f5f0] text-gray-500 text-xs uppercase"><tr><th className="text-left px-5 py-2.5">Course</th><th className="text-left px-5 py-2.5">Amount</th><th className="text-left px-5 py-2.5">Due</th><th className="text-left px-5 py-2.5">Status</th></tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-5 py-3 font-bold text-[#0f0f0f]">{p.courseTitle || "—"}</td>
                  <td className="px-5 py-3 font-mono">${num(p.amount).toFixed(2)}</td>
                  <td className="px-5 py-3 text-gray-500">{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${badge[p.status]}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Schedule ───────────────────────────────────────────────── */
const STU_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const STU_DAY_SHORT: Record<string, string> = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat" };

function StudentScheduleView({ myCourses, timetable, exams }: { myCourses: Course[]; timetable: TimetableSlot[]; exams: Exam[] }) {
  const myCourseIds = useMemo(() => new Set(myCourses.map((c) => c.id)), [myCourses]);
  const mySlots = timetable.filter((s) => myCourseIds.has(s.courseId));
  const myExams = exams.filter((e) => myCourseIds.has(e.courseId));
  const now = Date.now();
  const upcoming = myExams.filter((e) => new Date(e.examDate).getTime() >= now);
  const past = myExams.filter((e) => new Date(e.examDate).getTime() < now);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Weekly Timetable</h3>
        {mySlots.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No timetable scheduled for your courses yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid gap-px bg-gray-100" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
              {STU_DAYS.map((day) => {
                const daySlots = mySlots.filter((s) => s.dayOfWeek === day);
                return (
                  <div key={day} className="bg-white p-3">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">{STU_DAY_SHORT[day]}</p>
                    {daySlots.length === 0 ? (
                      <p className="text-[10px] text-gray-200">—</p>
                    ) : (
                      <div className="space-y-1.5">
                        {daySlots.map((s) => (
                          <div key={s.id} className="bg-[#1a6b2a] rounded-lg p-2 text-white">
                            <p className="text-[10px] font-black truncate leading-tight">{s.courseTitle || s.courseId}</p>
                            {s.period && <p className="text-[9px] opacity-70">{s.period}</p>}
                            {s.startTime && <p className="text-[9px] opacity-70">{s.startTime}{s.endTime ? `–${s.endTime}` : ""}</p>}
                            {s.room && <p className="text-[9px] opacity-70">📍{s.room}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
          Upcoming Exams {upcoming.length > 0 && `(${upcoming.length})`}
        </h3>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-400">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No upcoming exams for your courses.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((e) => {
              const d = new Date(e.examDate);
              const daysLeft = Math.ceil((d.getTime() - now) / 86400000);
              return (
                <div key={e.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#d4a017] rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0">
                    <span className="text-[9px] font-bold uppercase">{d.toLocaleString("en", { month: "short" })}</span>
                    <span className="text-lg font-black leading-none">{d.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-[#0f0f0f]">{e.title}</p>
                      {daysLeft <= 7 && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{daysLeft}d away</span>}
                    </div>
                    <p className="text-sm text-gray-500">{e.courseTitle}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                      {e.startTime && <span>⏰ {e.startTime}{e.endTime ? `–${e.endTime}` : ""}</span>}
                      {e.room && <span>📍 {e.room}</span>}
                    </div>
                    {e.notes && <p className="text-xs text-gray-400 mt-1 italic">{e.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Past Exams</h3>
          <div className="space-y-2">
            {past.map((e) => (
              <div key={e.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 opacity-60">
                <div className="w-10 h-10 bg-gray-300 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0">
                  <span className="text-[8px] font-bold uppercase">{new Date(e.examDate).toLocaleString("en", { month: "short" })}</span>
                  <span className="text-sm font-black leading-none">{new Date(e.examDate).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#0f0f0f] text-sm">{e.title}</p>
                  <p className="text-xs text-gray-400">{e.courseTitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Announcements ──────────────────────────────────────────── */
function AnnouncementsView({ announcements }: { announcements: Announcement[] }) {
  if (announcements.length === 0) return <Empty text="No announcements right now." />;
  const colors: Record<string, string> = { urgent: "border-red-400 bg-red-50", high: "border-amber-400 bg-amber-50", normal: "border-gray-200 bg-white", low: "border-gray-200 bg-white" };
  return (
    <div className="space-y-3">
      {announcements.map((a) => (
        <div key={a.id} className={`rounded-2xl p-5 shadow-sm border-l-4 ${colors[a.priority] || colors.normal}`}>
          <div className="flex items-center justify-between gap-2 flex-wrap"><h3 className="font-black text-[#0f0f0f]">{a.title}</h3><span className="text-xs font-bold uppercase text-gray-400">{a.priority}</span></div>
          <p className="text-gray-600 text-sm mt-1">{a.content}</p>
          <p className="text-xs text-gray-400 mt-2">{a.authorName} · {new Date(a.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Events ─────────────────────────────────────────────────── */
function EventsView({ events }: { events: SchoolEvent[] }) {
  if (events.length === 0) return <Empty text="No upcoming events." />;
  const now = Date.now();
  const colors: Record<string, string> = { academic: "bg-[#1a6b2a]", social: "bg-[#d4a017]", administrative: "bg-blue-600", external: "bg-purple-600" };
  return (
    <div className="space-y-3">
      {events.map((e) => {
        const past = new Date(e.date).getTime() < now;
        return (
          <div key={e.id} className={`bg-white rounded-2xl p-5 shadow-sm flex items-start gap-4 ${past ? "opacity-60" : ""}`}>
            <div className={`w-12 h-12 ${colors[e.type] || "bg-gray-500"} rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0`}>
              <span className="text-[10px] font-bold uppercase">{new Date(e.date).toLocaleString("en", { month: "short" })}</span>
              <span className="text-lg font-black leading-none">{new Date(e.date).getDate()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap"><h3 className="font-black text-[#0f0f0f]">{e.title}</h3><span className="text-[10px] font-bold uppercase text-gray-400">{e.type}</span></div>
              <p className="text-gray-500 text-sm mt-0.5">{e.description}</p>
              <p className="text-xs text-gray-400 mt-1">📍 {e.location || "TBA"} · {new Date(e.date).toLocaleString()}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Student Assessments ────────────────────────────────────── */
function StudentAssessmentsView({ user, myCourses }: { user: User; myCourses: Course[] }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [submittedFor, setSubmittedFor] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; maxScore: number } | null>(null);
  const [pastSubmissions, setPastSubmissions] = useState<Record<string, { score: number; maxScore: number } | null>>({});

  useEffect(() => {
    apiGetQuizzes().then((all) => {
      setQuizzes(all);
      setLoading(false);
      all.forEach(async (q) => {
        try {
          const sub = await apiGetMyQuizSubmission(q.id);
          if (sub) setPastSubmissions((p) => ({ ...p, [q.id]: { score: sub.score, maxScore: sub.maxScore } }));
        } catch { }
      });
    }).catch(() => setLoading(false));
  }, []);

  const myCourseIds = useMemo(() => new Set(myCourses.map((c) => c.id)), [myCourses]);
  const available = quizzes.filter((q) => myCourseIds.has(q.courseId));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-[#1a6b2a] border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  if (activeQuiz) return (
    <QuizTaker
      quiz={activeQuiz} userId={user.id}
      onDone={(score, maxScore) => {
        setResult({ score, maxScore });
        setPastSubmissions((p) => ({ ...p, [activeQuiz.id]: { score, maxScore } }));
        setSubmittedFor(activeQuiz.id);
        setActiveQuiz(null);
      }}
      onCancel={() => setActiveQuiz(null)}
    />
  );

  if (submittedFor && result) {
    const pct = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
    return (
      <div className="bg-white rounded-2xl p-10 shadow-sm text-center space-y-4">
        <CheckCircle className={`w-16 h-16 mx-auto ${pct >= 70 ? "text-green-500" : pct >= 50 ? "text-amber-500" : "text-red-500"}`} />
        <h2 className="text-2xl font-black text-[#0f0f0f]">Quiz Submitted!</h2>
        {result.maxScore > 0 ? (
          <>
            <p className="text-4xl font-black text-[#1a6b2a]">{pct}%</p>
            <p className="text-gray-500">{result.score} / {result.maxScore} correct</p>
          </>
        ) : (
          <p className="text-gray-500">Your answers have been saved for instructor review.</p>
        )}
        <button onClick={() => { setSubmittedFor(null); setResult(null); }}
          className="bg-[#0d3d1a] hover:bg-[#155a22] text-white font-black px-6 py-3 rounded-xl transition-colors touch-manipulation">
          Back to Assessments
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {available.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-bold">No assessments available yet.</p>
          <p className="text-sm mt-1">Published quizzes for your courses will appear here.</p>
        </div>
      ) : available.map((quiz) => {
        const sub = pastSubmissions[quiz.id];
        const isSubmitted = !!sub;
        const pct = sub && sub.maxScore > 0 ? Math.round((sub.score / sub.maxScore) * 100) : null;
        const now = new Date();
        const due = quiz.dueDate ? new Date(quiz.dueDate) : null;
        const overdue = due && due < now;

        return (
          <div key={quiz.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-[#0f0f0f]">{quiz.title}</h3>
                <p className="text-sm text-gray-500">{quiz.courseTitle}</p>
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                  <span>📝 {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""}</span>
                  {quiz.timeLimitMins > 0 && <span>⏱ {quiz.timeLimitMins} min</span>}
                  {due && (
                    <span className={overdue ? "text-red-500 font-bold" : ""}>
                      📅 Due {due.toLocaleDateString()}{overdue ? " (overdue)" : ""}
                    </span>
                  )}
                </div>
                {quiz.instructions && <p className="text-xs text-gray-400 mt-2 italic">{quiz.instructions}</p>}
              </div>
              <div className="flex-shrink-0">
                {isSubmitted ? (
                  <div className="text-center">
                    <div className={`text-xl font-black ${pct !== null && pct >= 70 ? "text-green-600" : pct !== null && pct >= 50 ? "text-amber-600" : "text-red-600"}`}>
                      {pct !== null ? `${pct}%` : "✓"}
                    </div>
                    <p className="text-xs text-gray-400 font-bold">Submitted</p>
                  </div>
                ) : (
                  <button onClick={() => setActiveQuiz(quiz)}
                    className="flex items-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-black px-4 py-2.5 rounded-xl text-sm transition-colors touch-manipulation">
                    Start Quiz
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Quiz Taker ──────────────────────────────────────────────── */
function QuizTaker({ quiz, userId, onDone, onCancel }: {
  quiz: Quiz; userId: string;
  onDone: (score: number, maxScore: number) => void;
  onCancel: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimitMins > 0 ? quiz.timeLimitMins * 60 : null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null || t <= 1) { clearInterval(timerRef.current!); submit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const submit = async (auto = false) => {
    if (submitting) return;
    setSubmitting(true); setErr("");
    try {
      const res = await apiSubmitQuiz(quiz.id, answers);
      onDone(res.score, res.maxScore);
    } catch (e) { setErr(e instanceof Error ? e.message : "Submit failed"); setSubmitting(false); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-5">
      <div className="bg-[#0d3d1a] text-white rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-black text-lg">{quiz.title}</h2>
          <p className="text-white/70 text-sm">{quiz.courseTitle} · {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          {timeLeft !== null && (
            <div className={`flex items-center gap-1.5 font-black text-lg px-3 py-1.5 rounded-xl ${timeLeft <= 60 ? "bg-red-500 animate-pulse" : "bg-white/10"}`}>
              <Clock className="w-4 h-4" />{formatTime(timeLeft)}
            </div>
          )}
          <button onClick={onCancel} className="text-white/60 hover:text-white p-1 touch-manipulation"><X className="w-5 h-5" /></button>
        </div>
      </div>

      {quiz.instructions && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-700 text-sm">{quiz.instructions}</div>
      )}

      <div className="space-y-4">
        {quiz.questions.map((q, i) => (
          <div key={q.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="font-black text-[#0f0f0f] mb-3">Q{i + 1}. {q.text}</p>

            {q.type === "mcq" && q.options && (
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <label key={oi} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors touch-manipulation ${answers[q.id] === opt ? "bg-[#1a6b2a]/10 border border-[#1a6b2a]" : "bg-[#f7f5f0] hover:bg-gray-100"}`}>
                    <input type="radio" name={`q-${q.id}`} value={opt} checked={answers[q.id] === opt}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                      className="accent-[#1a6b2a] flex-shrink-0" />
                    <span className="text-sm font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === "true_false" && (
              <div className="flex gap-3">
                {["True", "False"].map((opt) => (
                  <label key={opt} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer transition-colors touch-manipulation border ${answers[q.id] === opt ? "bg-[#1a6b2a]/10 border-[#1a6b2a]" : "border-gray-200 hover:bg-gray-50"}`}>
                    <input type="radio" name={`tf-${q.id}`} value={opt} checked={answers[q.id] === opt}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                      className="accent-[#1a6b2a]" />
                    <span className="font-bold">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === "short_answer" && (
              <textarea
                value={answers[q.id] || ""} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                rows={3} placeholder="Write your answer here…"
                className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none"
              />
            )}
          </div>
        ))}
      </div>

      {err && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-sm font-bold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{err}
        </div>
      )}

      <div className="flex gap-3 pb-6">
        <button onClick={onCancel} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-black px-5 py-3 rounded-xl text-sm transition-colors touch-manipulation">Cancel</button>
        <button onClick={() => submit()} disabled={submitting}
          className="flex-1 bg-[#1a6b2a] hover:bg-[#155a22] disabled:opacity-50 text-white font-black py-3 rounded-xl text-sm transition-colors touch-manipulation">
          {submitting ? "Submitting…" : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400">{text}</div>;
}
