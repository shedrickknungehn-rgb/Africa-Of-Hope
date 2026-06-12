import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { BookOpen, Users, Video, FileText, LogOut, Home, BarChart2, Menu, X, ClipboardCheck, GraduationCap, Plus, Trash2, Bell, Mail } from "lucide-react";
import {
  User, Course, Enrollment, Grade, Attendance, Announcement,
  apiGetCourses, apiGetUsers, apiGetEnrollments, apiGetGrades, apiGetAttendance,
  apiCreateGrade, apiDeleteGrade, apiSaveAttendance, apiUpdateCourseMaterials, apiGetAnnouncements,
  clearSession,
} from "./schoolApi";
import MessagingTab from "./admin/MessagingTab";

type Tab = "overview" | "classes" | "roster" | "attendance" | "grades" | "materials" | "announcements" | "inbox";

const ATT_STATUSES = ["present", "absent", "late", "excused"] as const;
const ATT_COLORS: Record<string, string> = {
  present: "bg-green-100 text-green-700 border-green-300",
  absent: "bg-red-100 text-red-700 border-red-300",
  late: "bg-amber-100 text-amber-700 border-amber-300",
  excused: "bg-blue-100 text-blue-700 border-blue-300",
};

export default function InstructorDashboard({ user }: { user: User }) {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const isAssistant = user.role === "assistant";

  const loadAll = () => {
    apiGetCourses().then(setCourses).catch(() => {});
    apiGetUsers().then((u) => setStudents(u.filter((x) => x.role === "student"))).catch(() => {});
    apiGetEnrollments().then(setEnrollments).catch(() => {});
    apiGetGrades().then(setGrades).catch(() => {});
    apiGetAnnouncements().then(setAnnouncements).catch(() => {});
  };
  useEffect(loadAll, []);

  const myCourses = useMemo(() => {
    const mine = isAssistant ? courses : courses.filter((c) => c.instructorId === user.id);
    return mine.length > 0 ? mine : courses.filter((c) => c.status === "active");
  }, [courses, user.id, isAssistant]);

  const myCourseIds = useMemo(() => new Set(myCourses.map((c) => c.id)), [myCourses]);

  const rosterFor = (courseId: string): User[] => {
    const ids = new Set(
      enrollments.filter((e) => e.courseId === courseId && e.status !== "withdrawn").map((e) => e.studentId)
    );
    const course = courses.find((c) => c.id === courseId);
    (course?.students ?? []).forEach((id) => ids.add(id));
    return students.filter((s) => ids.has(s.id));
  };

  const myAnnouncements = announcements.filter(
    (a) => a.targetRoles.includes("all") || a.targetRoles.includes("instructor") || a.targetRoles.includes("assistant")
  );

  const tabs = [
    { key: "overview" as Tab, label: "Overview", icon: BarChart2 },
    { key: "classes" as Tab, label: "My Classes", icon: BookOpen },
    { key: "roster" as Tab, label: "Class Roster", icon: Users },
    { key: "attendance" as Tab, label: "Attendance", icon: ClipboardCheck },
    { key: "grades" as Tab, label: "Grades", icon: GraduationCap },
    { key: "materials" as Tab, label: "Materials", icon: FileText },
    { key: "inbox" as Tab, label: "Inbox", icon: Mail },
    { key: "announcements" as Tab, label: "Announcements", icon: Bell },
  ];

  const changeTab = (t: Tab) => { setTab(t); setSidebarOpen(false); };

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-[#0d3d1a]">
      <div className="p-4 border-b border-white/10">
        <div className="bg-white rounded-xl px-3 py-2 mx-auto w-fit mb-2 shadow-md">
          <img src="/logo-full.png" alt="Africa of Hope Inc" className="h-9 w-auto object-contain" />
        </div>
        <p className="text-[#d4a017] text-[10px] text-center font-bold tracking-widest uppercase mt-1">School Portal</p>
      </div>
      <div className="p-3 border-b border-white/10">
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-white font-bold text-sm">{user.name}</p>
          <span className="inline-block bg-blue-500/20 text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full uppercase mt-0.5">
            {isAssistant ? "Assistant" : "Instructor"}
          </span>
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

          {tab === "overview" && <OverviewView myCourses={myCourses} students={students} enrollments={enrollments} grades={grades} myCourseIds={myCourseIds} announcements={myAnnouncements} onGo={changeTab} />}
          {tab === "classes" && <ClassesView myCourses={myCourses} rosterFor={rosterFor} onStart={(id) => navigate(`/school/class/${id}`)} />}
          {tab === "roster" && <RosterView myCourses={myCourses} rosterFor={rosterFor} />}
          {tab === "attendance" && <AttendanceView myCourses={myCourses} rosterFor={rosterFor} />}
          {tab === "grades" && <GradesView myCourses={myCourses} rosterFor={rosterFor} grades={grades} onRefresh={() => apiGetGrades().then(setGrades).catch(() => {})} />}
          {tab === "materials" && <MaterialsView myCourses={myCourses} onRefresh={() => apiGetCourses().then(setCourses).catch(() => {})} />}
          {tab === "inbox" && <MessagingTab currentUser={user} />}
          {tab === "announcements" && <AnnouncementsView announcements={myAnnouncements} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Overview ───────────────────────────────────────────────── */
function OverviewView({ myCourses, students, enrollments, grades, myCourseIds, announcements, onGo }: {
  myCourses: Course[]; students: User[]; enrollments: Enrollment[]; grades: Grade[]; myCourseIds: Set<string>; announcements: Announcement[]; onGo: (t: Tab) => void;
}) {
  const myEnrollments = enrollments.filter((e) => myCourseIds.has(e.courseId) && e.status !== "withdrawn");
  const enrolledStudents = new Set(myEnrollments.map((e) => e.studentId)).size;
  const myGrades = grades.filter((g) => myCourseIds.has(g.courseId));
  const stats = [
    { label: "My Classes", value: myCourses.length, color: "bg-[#1a6b2a]" },
    { label: "Students", value: enrolledStudents || students.length, color: "bg-blue-600" },
    { label: "Grades Logged", value: myGrades.length, color: "bg-[#d4a017]" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm text-center">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${color} rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3`}><BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div>
            <div className="text-xl sm:text-3xl font-black text-[#0f0f0f]">{value}</div>
            <div className="text-[10px] sm:text-sm font-bold text-gray-600 leading-tight mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="font-black text-[#0f0f0f] mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <button onClick={() => onGo("attendance")} className="bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all text-left touch-manipulation">✓ Take Attendance</button>
          <button onClick={() => onGo("grades")} className="bg-[#d4a017] hover:bg-[#b8890f] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all text-left touch-manipulation">★ Enter Grades</button>
          <button onClick={() => onGo("materials")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all text-left touch-manipulation">＋ Add Materials</button>
        </div>
      </div>
      {announcements.length > 0 && (
        <div className="bg-[#0d3d1a] rounded-2xl p-5 sm:p-6 text-white">
          <div className="flex items-center gap-3 mb-3"><Bell className="w-5 h-5 text-[#d4a017]" /><h3 className="font-black">Latest Announcement</h3></div>
          <p className="font-bold text-sm">{announcements[0].title}</p>
          <p className="text-white/70 text-sm mt-1">{announcements[0].content}</p>
        </div>
      )}
    </div>
  );
}

/* ─── My Classes ─────────────────────────────────────────────── */
function ClassesView({ myCourses, rosterFor, onStart }: { myCourses: Course[]; rosterFor: (id: string) => User[]; onStart: (id: string) => void }) {
  if (myCourses.length === 0) return <Empty text="No classes assigned to you yet." />;
  return (
    <div className="space-y-4">
      {myCourses.map((c) => (
        <div key={c.id} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-[#0f0f0f] mb-1">{c.title}</h3>
              <p className="text-gray-500 text-sm mb-3">{c.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                <span>📅 {c.duration}</span><span>🕐 {c.schedule}</span><span>👥 {rosterFor(c.id).length} students</span>
              </div>
            </div>
            <button onClick={() => onStart(c.id)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors flex-shrink-0 touch-manipulation"><Video className="w-4 h-4" />Start Class</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Roster ─────────────────────────────────────────────────── */
function RosterView({ myCourses, rosterFor }: { myCourses: Course[]; rosterFor: (id: string) => User[] }) {
  const [courseId, setCourseId] = useState(myCourses[0]?.id ?? "");
  useEffect(() => { if (!courseId && myCourses[0]) setCourseId(myCourses[0].id); }, [myCourses, courseId]);
  const roster = courseId ? rosterFor(courseId) : [];
  return (
    <div className="space-y-4">
      <CourseSelect courses={myCourses} value={courseId} onChange={setCourseId} />
      {roster.length === 0 ? <Empty text="No students enrolled in this class yet." /> : (
        <div className="space-y-3">
          {roster.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-sm flex-shrink-0">{s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#0f0f0f] text-sm">{s.name}</p>
                <p className="text-xs text-gray-400 font-mono">{s.username} · {s.email}</p>
              </div>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full flex-shrink-0">Enrolled</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Attendance ─────────────────────────────────────────────── */
function AttendanceView({ myCourses, rosterFor }: { myCourses: Course[]; rosterFor: (id: string) => User[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const [courseId, setCourseId] = useState(myCourses[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { if (!courseId && myCourses[0]) setCourseId(myCourses[0].id); }, [myCourses, courseId]);

  const roster = courseId ? rosterFor(courseId) : [];

  useEffect(() => {
    if (!courseId || !date) return;
    setMsg("");
    apiGetAttendance({ courseId, date: new Date(date).toISOString() }).then((rows) => {
      const m: Record<string, string> = {};
      rows.forEach((r) => { m[r.studentId] = r.status; });
      setMarks(m);
    }).catch(() => setMarks({}));
  }, [courseId, date]);

  const setMark = (studentId: string, status: string) => setMarks((m) => ({ ...m, [studentId]: status }));

  const save = async () => {
    if (!courseId) return;
    setSaving(true); setMsg("");
    try {
      const records = roster.map((s) => ({ studentId: s.id, status: marks[s.id] || "present" }));
      await apiSaveAttendance({ courseId, sessionDate: new Date(date).toISOString(), records });
      setMsg("Attendance saved ✓");
    } catch (e) { setMsg(e instanceof Error ? e.message : "Failed to save"); }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <CourseSelect courses={myCourses} value={courseId} onChange={setCourseId} />
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Session Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium" />
        </div>
      </div>
      {roster.length === 0 ? <Empty text="No students to mark for this class." /> : (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          {roster.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 flex-wrap border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-xs flex-shrink-0">{s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
                <p className="font-bold text-[#0f0f0f] text-sm truncate">{s.name}</p>
              </div>
              <div className="flex gap-1.5">
                {ATT_STATUSES.map((st) => (
                  <button key={st} onClick={() => setMark(s.id, st)}
                    className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border capitalize transition-all touch-manipulation ${(marks[s.id] || "present") === st ? ATT_COLORS[st] : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"}`}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <button onClick={save} disabled={saving} className="bg-[#1a6b2a] hover:bg-[#155a22] disabled:opacity-50 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-colors touch-manipulation">{saving ? "Saving…" : "Save Attendance"}</button>
            {msg && <span className="text-sm font-bold text-[#1a6b2a]">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Grades ─────────────────────────────────────────────────── */
function GradesView({ myCourses, rosterFor, grades, onRefresh }: { myCourses: Course[]; rosterFor: (id: string) => User[]; grades: Grade[]; onRefresh: () => void }) {
  const [courseId, setCourseId] = useState(myCourses[0]?.id ?? "");
  const [form, setForm] = useState({ studentId: "", assessment: "", score: "", maxScore: "100", weight: "", comment: "" });
  const [err, setErr] = useState("");
  useEffect(() => { if (!courseId && myCourses[0]) setCourseId(myCourses[0].id); }, [myCourses, courseId]);

  const roster = courseId ? rosterFor(courseId) : [];
  const courseGrades = grades.filter((g) => g.courseId === courseId);

  const submit = async () => {
    if (!courseId || !form.studentId || !form.assessment) { setErr("Student and assessment required"); return; }
    setErr("");
    try {
      await apiCreateGrade({ courseId, studentId: form.studentId, assessment: form.assessment, score: form.score || "0", maxScore: form.maxScore || "100", weight: form.weight, comment: form.comment });
      setForm({ studentId: "", assessment: "", score: "", maxScore: "100", weight: "", comment: "" });
      onRefresh();
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed"); }
  };

  const remove = async (id: string) => { await apiDeleteGrade(id).catch(() => {}); onRefresh(); };

  return (
    <div className="space-y-4">
      <CourseSelect courses={myCourses} value={courseId} onChange={setCourseId} />
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <h3 className="font-black text-[#0f0f0f] mb-3 text-sm">Record a Grade</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
            <option value="">Select student…</option>
            {roster.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input placeholder="Assessment (e.g. Midterm)" value={form.assessment} onChange={(e) => setForm({ ...form, assessment: e.target.value })} className="bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
          <div className="flex gap-2">
            <input placeholder="Score" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} className="w-1/2 bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
            <input placeholder="Max" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} className="w-1/2 bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
          </div>
          <input placeholder="Weight (optional)" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
          <input placeholder="Comment (optional)" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className="bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm lg:col-span-2" />
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={submit} className="flex items-center gap-1.5 bg-[#d4a017] hover:bg-[#b8890f] text-white font-black px-4 py-2.5 rounded-xl text-sm transition-colors touch-manipulation"><Plus className="w-4 h-4" />Add Grade</button>
          {err && <span className="text-sm font-bold text-red-600">{err}</span>}
        </div>
      </div>
      {courseGrades.length === 0 ? <Empty text="No grades recorded for this class yet." /> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f7f5f0] text-gray-500 text-xs uppercase">
              <tr><th className="text-left px-4 py-3">Student</th><th className="text-left px-4 py-3">Assessment</th><th className="text-left px-4 py-3">Score</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody>
              {courseGrades.map((g) => (
                <tr key={g.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-bold text-[#0f0f0f]">{g.studentName}</td>
                  <td className="px-4 py-3 text-gray-600">{g.assessment}{g.comment && <span className="block text-xs text-gray-400">{g.comment}</span>}</td>
                  <td className="px-4 py-3 font-mono font-bold">{g.score}/{g.maxScore}{g.grade && <span className="ml-2 text-[#1a6b2a]">{g.grade}</span>}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => remove(g.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Materials ──────────────────────────────────────────────── */
function MaterialsView({ myCourses, onRefresh }: { myCourses: Course[]; onRefresh: () => void }) {
  const [courseId, setCourseId] = useState(myCourses[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  useEffect(() => { if (!courseId && myCourses[0]) setCourseId(myCourses[0].id); }, [myCourses, courseId]);
  const course = myCourses.find((c) => c.id === courseId);

  const add = async () => {
    if (!course || !title) return;
    const materials = [...course.materials, { title, url: url || "#" }];
    await apiUpdateCourseMaterials(course.id, materials).catch(() => {});
    setTitle(""); setUrl(""); onRefresh();
  };
  const remove = async (idx: number) => {
    if (!course) return;
    const materials = course.materials.filter((_, i) => i !== idx);
    await apiUpdateCourseMaterials(course.id, materials).catch(() => {});
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <CourseSelect courses={myCourses} value={courseId} onChange={setCourseId} />
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <h3 className="font-black text-[#0f0f0f] mb-3 text-sm">Add Material</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
          <input placeholder="Link / URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} className="bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
        </div>
        <button onClick={add} className="mt-3 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-2.5 rounded-xl text-sm transition-colors touch-manipulation"><Plus className="w-4 h-4" />Add</button>
      </div>
      {course && course.materials.length > 0 ? (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
          {course.materials.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-[#f7f5f0] rounded-xl">
              <FileText className="w-5 h-5 text-[#1a6b2a] flex-shrink-0" />
              <span className="text-sm font-medium text-[#0f0f0f] flex-1 truncate">{m.title}</span>
              <button onClick={() => remove(i)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      ) : <Empty text="No materials uploaded for this class yet." />}
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
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-black text-[#0f0f0f]">{a.title}</h3>
            <span className="text-xs font-bold uppercase text-gray-400">{a.priority}</span>
          </div>
          <p className="text-gray-600 text-sm mt-1">{a.content}</p>
          <p className="text-xs text-gray-400 mt-2">{a.authorName} · {new Date(a.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Shared ─────────────────────────────────────────────────── */
function CourseSelect({ courses, value, onChange }: { courses: Course[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Select Class</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium">
        {courses.length === 0 && <option value="">No classes available</option>}
        {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400">{text}</div>;
}
