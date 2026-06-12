import { useState } from "react";
import { Plus, CheckCircle, Search, X, DollarSign } from "lucide-react";
import type { User, Course, Enrollment, Payment } from "../schoolApi";
import { apiCreatePayment, apiUpdatePayment } from "../schoolApi";

interface Props { payments: Payment[]; users: User[]; courses: Course[]; enrollments: Enrollment[]; onRefresh: () => void; }

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  waived: "bg-gray-100 text-gray-500",
};

const METHODS = ["Cash", "Bank Transfer", "Mobile Money", "Online Transfer", "Check", "Other"];

export default function FinanceTab({ payments, users, courses, enrollments, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ studentId: "", courseId: "", enrollmentId: "", amount: "", method: "", reference: "", dueDate: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const students = users.filter(u => u.role === "student");

  const filtered = payments.filter(p => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchSearch = !search
      || (p.studentName || "").toLowerCase().includes(search.toLowerCase())
      || (p.courseTitle || "").toLowerCase().includes(search.toLowerCase())
      || p.reference.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPaid = payments.filter(p => p.status === "paid").length;
  const totalPending = payments.filter(p => p.status === "pending").length;
  const totalOverdue = payments.filter(p => p.status === "overdue").length;

  const markPaid = async (id: string) => {
    setUpdating(id);
    try { await apiUpdatePayment(id, { status: "paid" }); onRefresh(); }
    catch { /* silent */ } finally { setUpdating(null); }
  };

  const markOverdue = async (id: string) => {
    setUpdating(id);
    try { await apiUpdatePayment(id, { status: "overdue" }); onRefresh(); }
    catch { /* silent */ } finally { setUpdating(null); }
  };

  const save = async () => {
    if (!form.studentId || !form.courseId || !form.amount) { setError("Student, course, and amount required"); return; }
    setSaving(true); setError("");
    try {
      await apiCreatePayment({ ...form, status: "pending", paidAt: null, dueDate: form.dueDate || null });
      setShowAdd(false); setForm({ studentId: "", courseId: "", enrollmentId: "", amount: "", method: "", reference: "", dueDate: "", notes: "" });
      onRefresh();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to add payment"); }
    finally { setSaving(false); }
  };

  const studentEnrollments = form.studentId ? enrollments.filter(e => e.studentId === form.studentId) : [];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Records", value: payments.length, color: "bg-gray-100 text-gray-700", icon: "📋" },
          { label: "Paid", value: totalPaid, color: "bg-green-100 text-green-700", icon: "✅" },
          { label: "Pending", value: totalPending, color: "bg-yellow-100 text-yellow-700", icon: "⏳" },
          { label: "Overdue", value: totalOverdue, color: "bg-red-100 text-red-700", icon: "⚠️" },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-2xl font-black text-[#0f0f0f]">{value}</div>
            <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${color}`}>{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student, course, reference…"
            className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#1a6b2a] focus:outline-none" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none bg-white">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="waived">Waived</option>
        </select>
        <button onClick={() => { setShowAdd(true); setError(""); }} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors touch-manipulation">
          <Plus className="w-4 h-4" />Add Payment
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f7f5f0] border-b border-gray-100">
                {["Student", "Course", "Amount", "Status", "Method", "Reference", "Date", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-[#f7f5f0]/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-sm text-[#0f0f0f]">{p.studentName || p.studentId}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate">{p.courseTitle || p.courseId}</td>
                  <td className="px-4 py-3 font-bold text-sm text-[#0f0f0f]">{p.amount}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[p.status]}`}>{p.status}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-500 capitalize">{p.method || "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{p.reference || "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : (p.dueDate ? `Due ${new Date(p.dueDate).toLocaleDateString()}` : "—")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {p.status === "pending" && (
                        <>
                          <button onClick={() => markPaid(p.id)} disabled={updating === p.id}
                            className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-green-500 text-white rounded-lg disabled:opacity-40 touch-manipulation">
                            <CheckCircle className="w-3 h-3" />Mark Paid
                          </button>
                          <button onClick={() => markOverdue(p.id)} disabled={updating === p.id}
                            className="text-xs font-bold px-2 py-1 bg-red-100 text-red-600 rounded-lg disabled:opacity-40 touch-manipulation">
                            Overdue
                          </button>
                        </>
                      )}
                      {p.status === "overdue" && (
                        <button onClick={() => markPaid(p.id)} disabled={updating === p.id}
                          className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-green-500 text-white rounded-lg disabled:opacity-40 touch-manipulation">
                          <CheckCircle className="w-3 h-3" />Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center">
                  <DollarSign className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No payment records found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-lg text-[#0f0f0f]">Add Payment Record</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            {error && <p className="text-red-500 text-xs mb-3 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Student *</label>
                <select value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value, courseId: "", enrollmentId: "" })}
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
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              {studentEnrollments.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Enrollment (optional)</label>
                  <select value={form.enrollmentId} onChange={e => setForm({ ...form, enrollmentId: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none">
                    <option value="">— None —</option>
                    {studentEnrollments.map(e => <option key={e.id} value={e.id}>{e.courseTitle || e.courseId} ({e.status})</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Amount *</label>
                <input type="text" placeholder="e.g. USD 500" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Payment Method</label>
                <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none">
                  <option value="">— Select method —</option>
                  {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Reference / Receipt No.</label>
                <input type="text" placeholder="e.g. REC-2026-001" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
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
              <button onClick={save} disabled={saving} className="flex-1 bg-teal-600 disabled:bg-gray-200 text-white font-black py-3 rounded-xl text-sm">
                {saving ? "Saving…" : "Add Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
