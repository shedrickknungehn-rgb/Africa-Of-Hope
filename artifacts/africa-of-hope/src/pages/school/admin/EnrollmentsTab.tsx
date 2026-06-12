import { useState } from "react";
import { Plus, Trash2, Search, X, ClipboardList } from "lucide-react";
import type { User, Course, Enrollment } from "../schoolApi";
import { apiCreateEnrollment, apiUpdateEnrollment, apiDeleteEnrollment } from "../schoolApi";

interface Props { enrollments: Enrollment[]; users: User[]; courses: Course[]; onRefresh: () => void; }

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  withdrawn: "bg-gray-100 text-gray-500",
};

const STATUS_ACTIONS: Record<string, { label: string; next: string; color: string }[]> = {
  pending: [{ label: "Activate", next: "active", color: "bg-green-500 text-white" }, { label: "Withdraw", next: "withdrawn", color: "bg-gray-200 text-gray-700" }],
  active: [{ label: "Complete", next: "completed", color: "bg-blue-500 text-white" }, { label: "Withdraw", next: "withdrawn", color: "bg-gray-200 text-gray-700" }],
  completed: [],
  withdrawn: [{ label: "Re-activate", next: "active", color: "bg-green-500 text-white" }],
};

export default function EnrollmentsTab({ enrollments, users, courses, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ studentId: "", courseId: "", fee: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const students = users.filter(u => u.role === "student");

  const filtered = enrollments.filter(e => {
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    const matchSearch = !search
      || (e.studentName || "").toLowerCase().includes(search.toLowerCase())
      || (e.courseTitle || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusCounts = { all: enrollments.length, pending: 0, active: 0, completed: 0, withdrawn: 0 };
  enrollments.forEach(e => { if (e.status in statusCounts) (statusCounts as Record<string, number>)[e.status]++; });

  const changeStatus = async (id: string, status: string) => {
    setUpdating(id);
    try { await apiUpdateEnrollment(id, { status: status as Enrollment["status"] }); onRefresh(); }
    catch { /* silent */ } finally { setUpdating(null); }
  };

  const del = async (id: string) => {
    setUpdating(id);
    try { await apiDeleteEnrollment(id); onRefresh(); }
    catch { /* silent */ } finally { setUpdating(null); }
  };

  const save = async () => {
    if (!form.studentId || !form.courseId) { setError("Student and course required"); return; }
    setSaving(true); setError("");
    try { await apiCreateEnrollment(form); setShowAdd(false); setForm({ studentId: "", courseId: "", fee: "", notes: "" }); onRefresh(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to enroll"); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student or course…"
            className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#1a6b2a] focus:outline-none" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "active", "completed", "withdrawn"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors capitalize touch-manipulation ${statusFilter === s ? "bg-[#1a6b2a] text-white" : "bg-white text-gray-600 border-2 border-gray-200 hover:border-[#1a6b2a]"}`}>
              {s} ({(statusCounts as Record<string, number>)[s]})
            </button>
          ))}
        </div>
        <button onClick={() => { setShowAdd(true); setError(""); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors touch-manipulation">
          <Plus className="w-4 h-4" />Enroll Student
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f7f5f0] border-b border-gray-100">
                {["Student", "Course", "Fee", "Status", "Enrolled", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-[#f7f5f0]/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-[10px]">
                        {(e.studentName || "?").split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-bold text-sm text-[#0f0f0f]">{e.studentName || e.studentId}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600 max-w-[180px] truncate">{e.courseTitle || e.courseId}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{e.fee || "—"}</td>
                  <td className="px-5 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${STATUS_COLORS[e.status]}`}>{e.status}</span></td>
                  <td className="px-5 py-3 text-xs text-gray-400">{new Date(e.enrolledAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(STATUS_ACTIONS[e.status] || []).map(({ label, next, color }) => (
                        <button key={next} onClick={() => changeStatus(e.id, next)} disabled={updating === e.id}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${color} disabled:opacity-40 transition-colors touch-manipulation`}>
                          {label}
                        </button>
                      ))}
                      <button onClick={() => del(e.id)} disabled={updating === e.id} className="w-6 h-6 rounded-md bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors disabled:opacity-40">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center">
                  <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No enrollments found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-lg text-[#0f0f0f]">Enroll a Student</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            {error && <p className="text-red-500 text-xs mb-3 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Student *</label>
                <select value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none">
                  <option value="">— Select student —</option>
                  {students.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Course *</label>
                <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none">
                  <option value="">— Select course —</option>
                  {courses.filter(c => c.status === "active").map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Fee</label>
                <input type="text" placeholder="e.g. USD 500" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Notes</label>
                <textarea rows={2} placeholder="Optional notes…" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-blue-600 disabled:bg-gray-200 text-white font-black py-3 rounded-xl text-sm">
                {saving ? "Enrolling…" : "Enroll Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
