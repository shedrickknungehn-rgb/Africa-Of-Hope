import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  BarChart2, BookOpen, ClipboardList, DollarSign, Bell, Calendar,
  LogOut, Home, X, Menu, RefreshCw, ChevronDown, Users,
} from "lucide-react";
import {
  User, Announcement, SchoolEvent, Payment, Attendance, Grade,
  apiGetMyChildren, apiGetAnnouncements, apiGetEvents,
  apiGetPayments, apiGetAttendance, apiGetGrades,
  clearSession, ROLE_LABELS,
} from "./schoolApi";

type Tab = "overview" | "grades" | "attendance" | "finance" | "announcements" | "events";

const TAB_TITLES: Record<Tab, string> = {
  overview: "Overview", grades: "Grades & Transcript", attendance: "Attendance",
  finance: "Payments & Finance", announcements: "Announcements", events: "Events",
};

const NAV: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: BarChart2 },
  { key: "grades", label: "Grades", icon: BookOpen },
  { key: "attendance", label: "Attendance", icon: ClipboardList },
  { key: "finance", label: "Finance", icon: DollarSign },
  { key: "announcements", label: "Announcements", icon: Bell },
  { key: "events", label: "Events", icon: Calendar },
];

export default function ParentDashboard({ user }: { user: User }) {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [children, setChildren] = useState<User[]>([]);
  const [selectedChild, setSelectedChild] = useState<User | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const loadChildren = useCallback(async () => {
    const kids = await apiGetMyChildren();
    setChildren(kids);
    if (kids.length > 0 && !selectedChild) setSelectedChild(kids[0]);
    return kids;
  }, [selectedChild]);

  const loadForChild = useCallback(async (child: User) => {
    const sid = child.id;
    const [py, at, gr, an, ev] = await Promise.allSettled([
      apiGetPayments({ studentId: sid }),
      apiGetAttendance({ studentId: sid }),
      apiGetGrades({ studentId: sid }),
      apiGetAnnouncements(),
      apiGetEvents(),
    ]);
    if (py.status === "fulfilled") setPayments(py.value);
    if (at.status === "fulfilled") setAttendance(at.value);
    if (gr.status === "fulfilled") setGrades(gr.value);
    if (an.status === "fulfilled") setAnnouncements(an.value);
    if (ev.status === "fulfilled") setEvents(ev.value);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const kids = await loadChildren();
      if (kids.length > 0) await loadForChild(kids[0]);
    } finally { setLoading(false); }
  }, [loadChildren, loadForChild]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const switchChild = (child: User) => {
    setSelectedChild(child);
    setLoading(true);
    loadForChild(child).finally(() => setLoading(false));
  };

  const goTab = (t: Tab) => { setTab(t); setSidebarOpen(false); };

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-[#0d3d1a]">
      <div className="p-4 border-b border-white/10">
        <div className="bg-white rounded-xl px-3 py-2 mx-auto w-fit mb-2 shadow-md">
          <img src="/logo-full.png" alt="Africa of Hope" className="h-9 w-auto object-contain" />
        </div>
        <p className="text-[#d4a017] text-[10px] text-center font-bold tracking-widest uppercase mt-1">Parent Portal</p>
      </div>

      <div className="p-3 border-b border-white/10">
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-white font-bold text-sm truncate">{user.name}</p>
          <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 bg-pink-100 text-pink-800">
            {ROLE_LABELS["parent"]}
          </span>
        </div>
      </div>

      {children.length > 1 && (
        <div className="p-3 border-b border-white/10">
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-2">Viewing</p>
          <div className="space-y-1">
            {children.map((c) => (
              <button key={c.id} onClick={() => switchChild(c)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors touch-manipulation flex items-center gap-2 ${selectedChild?.id === c.id ? "bg-[#d4a017] text-[#0f0f0f] font-black" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                <Users className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
        {NAV.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => goTab(key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors touch-manipulation ${tab === key ? "bg-[#d4a017] text-[#0f0f0f] font-black" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />{label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-0.5">
        <button onClick={loadAll} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors touch-manipulation">
          <RefreshCw className="w-4 h-4" />Refresh
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

  if (!loading && children.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-pink-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-pink-600" />
          </div>
          <h2 className="text-xl font-black text-[#0f0f0f] mb-2">No students linked yet</h2>
          <p className="text-gray-500 text-sm mb-6">Your account hasn't been linked to any student yet. Please contact the school administration to link your child's account.</p>
          <button onClick={() => { clearSession(); navigate("/school"); }}
            className="flex items-center gap-2 bg-[#1a6b2a] text-white font-black px-5 py-3 rounded-xl mx-auto">
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </div>
    );
  }

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
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 hidden md:flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-black text-[#0f0f0f]">{TAB_TITLES[tab]}</h1>
                {selectedChild && <p className="text-gray-500 text-sm">Viewing: <span className="font-bold text-[#1a6b2a]">{selectedChild.name}</span></p>}
              </div>
              <div className="flex items-center gap-3">
                {children.length > 1 && (
                  <div className="relative">
                    <select value={selectedChild?.id || ""}
                      onChange={(e) => { const c = children.find(k => k.id === e.target.value); if (c) switchChild(c); }}
                      className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#1a6b2a] focus:outline-none bg-white appearance-none pr-8">
                      {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                )}
                <button onClick={loadAll} disabled={loading} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a6b2a] transition-colors disabled:opacity-40">
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  {loading ? "Loading…" : "Refresh"}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-[#1a6b2a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Loading…</p>
                </div>
              </div>
            ) : (
              <>
                {tab === "overview" && <ParentOverview child={selectedChild} grades={grades} attendance={attendance} payments={payments} announcements={announcements} onNavigate={goTab} />}
                {tab === "grades" && <ParentGrades grades={grades} child={selectedChild} />}
                {tab === "attendance" && <ParentAttendance attendance={attendance} child={selectedChild} />}
                {tab === "finance" && <ParentFinance payments={payments} child={selectedChild} />}
                {tab === "announcements" && <ParentAnnouncements announcements={announcements} />}
                {tab === "events" && <ParentEvents events={events} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color = "green" }: { label: string; value: string | number; sub?: string; color?: string }) {
  const colors: Record<string, string> = { green: "bg-[#1a6b2a]", amber: "bg-amber-500", red: "bg-red-500", blue: "bg-blue-500" };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className={`w-10 h-10 rounded-xl ${colors[color] || colors.green} flex items-center justify-center mb-3`}>
        <span className="text-white font-black text-lg">{String(value)[0]}</span>
      </div>
      <p className="text-2xl font-black text-[#0f0f0f]">{value}</p>
      <p className="text-sm font-bold text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function ParentOverview({ child, grades, attendance, payments, announcements, onNavigate }: {
  child: User | null; grades: Grade[]; attendance: Attendance[]; payments: Payment[];
  announcements: Announcement[]; onNavigate: (t: Tab) => void;
}) {
  const avgScore = grades.length > 0
    ? grades.reduce((sum, g) => sum + (parseFloat(g.score) / (parseFloat(g.maxScore) || 100) * 100), 0) / grades.length
    : null;
  const presentCount = attendance.filter(a => a.status === "present").length;
  const attendPct = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : null;
  const pendingPayments = payments.filter(p => p.status === "pending" || p.status === "overdue").length;
  const urgentAnn = announcements.filter(a => a.priority === "urgent" || a.priority === "high").length;

  return (
    <div className="space-y-6">
      {child && (
        <div className="bg-gradient-to-r from-[#0d3d1a] to-[#1a6b2a] text-white rounded-2xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
            {child.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Your Child</p>
            <p className="text-xl font-black">{child.name}</p>
            <p className="text-white/60 text-sm">@{child.username}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Avg Grade" value={avgScore !== null ? `${Math.round(avgScore)}%` : "—"} sub={`${grades.length} assessments`} color="green" />
        <StatCard label="Attendance" value={attendPct !== null ? `${attendPct}%` : "—"} sub={`${attendance.length} sessions`} color={attendPct !== null && attendPct < 75 ? "red" : "blue"} />
        <StatCard label="Pending Fees" value={pendingPayments} sub="payments outstanding" color={pendingPayments > 0 ? "amber" : "green"} />
        <StatCard label="Alerts" value={urgentAnn} sub="urgent announcements" color={urgentAnn > 0 ? "red" : "green"} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[#0f0f0f]">Recent Grades</h3>
            <button onClick={() => onNavigate("grades")} className="text-xs text-[#1a6b2a] font-bold hover:underline">View all</button>
          </div>
          {grades.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No grades recorded yet</p>
          ) : grades.slice(0, 5).map((g) => {
            const pct = Math.round(parseFloat(g.score) / (parseFloat(g.maxScore) || 100) * 100);
            return (
              <div key={g.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-bold text-[#0f0f0f] truncate max-w-[160px]">{g.assessment}</p>
                  <p className="text-xs text-gray-400">{g.courseTitle}</p>
                </div>
                <span className={`text-sm font-black ${pct >= 70 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`}>{pct}%</span>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[#0f0f0f]">Announcements</h3>
            <button onClick={() => onNavigate("announcements")} className="text-xs text-[#1a6b2a] font-bold hover:underline">View all</button>
          </div>
          {announcements.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No announcements</p>
          ) : announcements.slice(0, 4).map((a) => (
            <div key={a.id} className="py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2 mb-0.5">
                {(a.priority === "urgent" || a.priority === "high") && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${a.priority === "urgent" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{a.priority.toUpperCase()}</span>
                )}
                <p className="text-sm font-bold text-[#0f0f0f] truncate">{a.title}</p>
              </div>
              <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ParentGrades({ grades, child }: { grades: Grade[]; child: User | null }) {
  const byCourse = grades.reduce<Record<string, Grade[]>>((acc, g) => {
    const k = g.courseTitle || g.courseId;
    if (!acc[k]) acc[k] = [];
    acc[k].push(g);
    return acc;
  }, {});

  const downloadTranscript = async () => {
    const { exportTranscriptPdf } = await import("./pdf/exportPdf");
    exportTranscriptPdf(child?.name || "Student", grades, []);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        {child && <p className="text-sm text-gray-500 font-bold">Academic record for <span className="text-[#1a6b2a]">{child.name}</span></p>}
        {grades.length > 0 && (
          <button onClick={downloadTranscript} className="flex items-center gap-2 bg-[#0d3d1a] hover:bg-[#1a6b2a] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors ml-auto">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Download Transcript
          </button>
        )}
      </div>
      {grades.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-bold">No grades recorded yet.</p>
        </div>
      ) : Object.entries(byCourse).map(([courseTitle, cGrades]) => {
        const avg = cGrades.reduce((sum, g) => sum + parseFloat(g.score) / (parseFloat(g.maxScore) || 100) * 100, 0) / cGrades.length;
        return (
          <div key={courseTitle} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-[#f7f5f0] px-5 py-3 flex items-center justify-between">
              <h3 className="font-black text-[#0f0f0f]">{courseTitle}</h3>
              <span className={`text-sm font-black ${avg >= 70 ? "text-green-600" : avg >= 50 ? "text-amber-600" : "text-red-600"}`}>Avg: {Math.round(avg)}%</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-400 uppercase px-5 py-2">Assessment</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase px-5 py-2">Score</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase px-5 py-2">%</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase px-5 py-2">Grade</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase px-5 py-2">Comment</th>
                </tr></thead>
                <tbody>
                  {cGrades.map((g) => {
                    const pct = Math.round(parseFloat(g.score) / (parseFloat(g.maxScore) || 100) * 100);
                    return (
                      <tr key={g.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-5 py-3 font-bold text-[#0f0f0f]">{g.assessment}</td>
                        <td className="px-5 py-3 font-mono">{g.score}/{g.maxScore}</td>
                        <td className={`px-5 py-3 font-black ${pct >= 70 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`}>{pct}%</td>
                        <td className="px-5 py-3 text-gray-600">{g.grade || "—"}</td>
                        <td className="px-5 py-3 text-gray-400 text-xs">{g.comment || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ParentAttendance({ attendance, child }: { attendance: Attendance[]; child: User | null }) {
  const presentCount = attendance.filter(a => a.status === "present").length;
  const absentCount = attendance.filter(a => a.status === "absent").length;
  const lateCount = attendance.filter(a => a.status === "late").length;
  const pct = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : null;

  const STATUS_COLORS: Record<string, string> = {
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-700",
    late: "bg-amber-100 text-amber-700",
    excused: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-5">
      {child && <p className="text-sm text-gray-500 font-bold">Attendance record for <span className="text-[#1a6b2a]">{child.name}</span></p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Attendance Rate", value: pct !== null ? `${pct}%` : "—", color: pct !== null && pct < 75 ? "bg-red-500" : "bg-green-600" },
          { label: "Present", value: presentCount, color: "bg-green-600" },
          { label: "Absent", value: absentCount, color: "bg-red-500" },
          { label: "Late", value: lateCount, color: "bg-amber-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className={`w-8 h-8 rounded-xl ${color} mb-3`} />
            <p className="text-2xl font-black text-[#0f0f0f]">{value}</p>
            <p className="text-sm text-gray-500 font-bold">{label}</p>
          </div>
        ))}
      </div>

      {attendance.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-bold">No attendance records yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#f7f5f0] border-b border-gray-100">
                <th className="text-left text-xs font-bold text-gray-400 uppercase px-5 py-3">Date</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase px-5 py-3">Course</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase px-5 py-3">Status</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase px-5 py-3">Notes</th>
              </tr></thead>
              <tbody>
                {attendance.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 font-mono text-gray-600">{new Date(a.sessionDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3 font-bold text-[#0f0f0f]">{a.courseTitle || a.courseId}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${STATUS_COLORS[a.status] || "bg-gray-100 text-gray-600"}`}>{a.status}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{a.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ParentFinance({ payments, child }: { payments: Payment[]; child: User | null }) {
  const totalPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
  const totalPending = payments.filter(p => p.status === "pending" || p.status === "overdue").reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);

  const STATUS_COLORS: Record<string, string> = {
    paid: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-700",
    overdue: "bg-red-100 text-red-700", waived: "bg-blue-100 text-blue-700",
  };

  const downloadAll = async () => {
    const { exportAllReceiptsPdf } = await import("./pdf/exportPdf");
    exportAllReceiptsPdf(payments, child?.name || "Student");
  };
  const downloadOne = async (p: Payment) => {
    const { exportReceiptPdf } = await import("./pdf/exportPdf");
    exportReceiptPdf(p, child?.name || "Student");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        {child && <p className="text-sm text-gray-500 font-bold">Payment history for <span className="text-[#1a6b2a]">{child.name}</span></p>}
        {payments.length > 0 && (
          <button onClick={downloadAll} className="flex items-center gap-1.5 text-xs font-bold text-[#1a6b2a] hover:underline ml-auto">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Download All
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Paid</p>
          <p className="text-2xl font-black text-green-600">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Outstanding</p>
          <p className={`text-2xl font-black ${totalPending > 0 ? "text-red-500" : "text-gray-400"}`}>${totalPending.toLocaleString()}</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400">
          <DollarSign className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-bold">No payment records yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#f7f5f0] border-b border-gray-100">
                <th className="text-left text-xs font-bold text-gray-400 uppercase px-5 py-3">Course</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase px-5 py-3">Amount</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase px-5 py-3">Status</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase px-5 py-3">Method</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase px-5 py-3">Due Date</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase px-5 py-3">Paid On</th>
                <th className="px-5 py-3"></th>
              </tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 font-bold text-[#0f0f0f]">{p.courseTitle || p.courseId}</td>
                    <td className="px-5 py-3 font-mono font-bold">${parseFloat(p.amount || "0").toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600"}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{p.method || "—"}</td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "—"}</td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => downloadOne(p)} title="Download receipt" className="w-7 h-7 rounded-lg bg-[#0d3d1a]/10 hover:bg-[#0d3d1a]/20 text-[#0d3d1a] flex items-center justify-center transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-100 text-red-700 border-red-200",
  high: "bg-amber-100 text-amber-700 border-amber-200",
  normal: "bg-blue-50 text-blue-600 border-blue-100",
  low: "bg-gray-50 text-gray-500 border-gray-100",
};

function ParentAnnouncements({ announcements }: { announcements: Announcement[] }) {
  return (
    <div className="space-y-4">
      {announcements.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400">
          <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-bold">No announcements yet.</p>
        </div>
      ) : announcements.map((a) => (
        <div key={a.id} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${PRIORITY_COLORS[a.priority]?.split(" ")[2] || "border-gray-200"}`}>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${PRIORITY_COLORS[a.priority] || "bg-gray-100 text-gray-500"}`}>{a.priority}</span>
                <h3 className="font-black text-[#0f0f0f]">{a.title}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{a.content}</p>
              <p className="text-xs text-gray-400 mt-2">By {a.authorName || "School"} · {new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ParentEvents({ events }: { events: SchoolEvent[] }) {
  const upcoming = events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = events.filter(e => new Date(e.date) < new Date()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const EventCard = ({ e }: { e: SchoolEvent }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-center bg-[#f7f5f0] rounded-xl px-3 py-2 min-w-[52px]">
          <p className="text-lg font-black text-[#0d3d1a]">{new Date(e.date).getDate()}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(e.date).toLocaleString("default", { month: "short" })}</p>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-[#0f0f0f]">{e.title}</h3>
          {e.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{e.description}</p>}
          <p className="text-xs text-gray-400 mt-1">📍 {e.location || "TBD"} · <span className="capitalize">{e.type}</span></p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Upcoming</h3>
          <div className="space-y-3">{upcoming.map(e => <EventCard key={e.id} e={e} />)}</div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Past</h3>
          <div className="space-y-3 opacity-60">{past.slice(0, 5).map(e => <EventCard key={e.id} e={e} />)}</div>
        </div>
      )}
      {events.length === 0 && (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-bold">No events scheduled.</p>
        </div>
      )}
    </div>
  );
}
