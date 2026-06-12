import { useState, useEffect, useCallback } from "react";
import { Plus, X, Users, CheckCircle, XCircle, Trash2, DollarSign, CalendarDays, Briefcase } from "lucide-react";
import type { User, StaffRecord, LeaveRequest, Payroll } from "../schoolApi";
import {
  apiGetStaff, apiCreateStaff, apiUpdateStaff, apiDeleteStaff,
  apiGetLeave, apiUpdateLeave, apiGetPayroll, apiCreatePayroll, apiUpdatePayroll,
} from "../schoolApi";

interface Props { users: User[]; }

type Section = "staff" | "leave" | "payroll";

const EMP_TYPES = ["full_time", "part_time", "contract", "volunteer"] as const;
const EMP_LABELS: Record<string, string> = { full_time: "Full Time", part_time: "Part Time", contract: "Contract", volunteer: "Volunteer" };
const STAFF_STATUS_COLORS: Record<string, string> = { active: "bg-green-100 text-green-700", on_leave: "bg-amber-100 text-amber-700", terminated: "bg-red-100 text-red-700" };
const LEAVE_STATUS_COLORS: Record<string, string> = { pending: "bg-amber-100 text-amber-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };

export default function HRTab({ users }: Props) {
  const [section, setSection] = useState<Section>("staff");
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [leave, setLeave] = useState<LeaveRequest[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [missingTables, setMissingTables] = useState(false);

  const refreshStaff = useCallback(() => apiGetStaff().then(setStaff).catch(() => setMissingTables(true)), []);
  const refreshLeave = useCallback(() => apiGetLeave().then(setLeave).catch(() => setMissingTables(true)), []);
  const refreshPayroll = useCallback(() => apiGetPayroll().then(setPayroll).catch(() => setMissingTables(true)), []);

  useEffect(() => { refreshStaff(); refreshLeave(); refreshPayroll(); }, [refreshStaff, refreshLeave, refreshPayroll]);

  const staffEligible = users.filter((u) => u.role !== "student" && u.role !== "alumni");
  const pendingLeave = leave.filter((l) => l.status === "pending").length;

  const sections: { key: Section; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: "staff", label: "Staff Records", icon: Briefcase },
    { key: "leave", label: "Leave Requests", icon: CalendarDays, badge: pendingLeave },
    { key: "payroll", label: "Payroll", icon: DollarSign },
  ];

  return (
    <div>
      {missingTables && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-800">
          HR tables not found. Run migration <code className="font-mono font-bold">007_phase2_expansion.sql</code> in your Supabase SQL editor to enable the HR module.
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map(({ key, label, icon: Icon, badge }) => (
          <button key={key} onClick={() => setSection(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors touch-manipulation ${section === key ? "bg-[#0d3d1a] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
            <Icon className="w-4 h-4" />{label}
            {badge ? <span className="bg-[#d4a017] text-[#0f0f0f] text-[10px] font-black px-1.5 py-0.5 rounded-full">{badge}</span> : null}
          </button>
        ))}
      </div>

      {section === "staff" && <StaffSection staff={staff} eligible={staffEligible} onRefresh={refreshStaff} />}
      {section === "leave" && <LeaveSection leave={leave} onRefresh={refreshLeave} />}
      {section === "payroll" && <PayrollSection payroll={payroll} staff={staff} eligible={staffEligible} onRefresh={refreshPayroll} />}
    </div>
  );
}

/* ─── Staff Records ──────────────────────────────────────────── */
function StaffSection({ staff, eligible, onRefresh }: { staff: StaffRecord[]; eligible: User[]; onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ userId: "", position: "", department: "", employmentType: "full_time", hireDate: "", salary: "", emergencyContact: "", notes: "" });

  const save = async () => {
    if (!form.userId) { setError("Select a staff member"); return; }
    setSaving(true); setError("");
    try {
      await apiCreateStaff({ ...form, employmentType: form.employmentType as StaffRecord["employmentType"], hireDate: form.hireDate || null, status: "active" });
      setShowAdd(false);
      setForm({ userId: "", position: "", department: "", employmentType: "full_time", hireDate: "", salary: "", emergencyContact: "", notes: "" });
      onRefresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to add staff record"); }
    finally { setSaving(false); }
  };

  const setStatus = async (id: string, status: string) => { await apiUpdateStaff(id, { status: status as StaffRecord["status"] }).catch(() => {}); onRefresh(); };
  const remove = async (id: string) => { await apiDeleteStaff(id).catch(() => {}); onRefresh(); };

  const counts = { active: staff.filter((s) => s.status === "active").length, on_leave: staff.filter((s) => s.status === "on_leave").length };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat label="Total Staff" value={staff.length} icon="👥" color="bg-gray-100 text-gray-700" />
        <Stat label="Active" value={counts.active} icon="✅" color="bg-green-100 text-green-700" />
        <Stat label="On Leave" value={counts.on_leave} icon="🌴" color="bg-amber-100 text-amber-700" />
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={() => { setShowAdd(true); setError(""); }} className="flex items-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors touch-manipulation"><Plus className="w-4 h-4" />Add Staff Record</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-[#f7f5f0] border-b border-gray-100">{["Name", "Position", "Department", "Type", "Salary", "Status", "Actions"].map((h) => <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-[#f7f5f0]/50">
                  <td className="px-4 py-3 font-bold text-sm text-[#0f0f0f]">{s.userName || s.userId}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.position || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.department || "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{EMP_LABELS[s.employmentType] || s.employmentType}</td>
                  <td className="px-4 py-3 text-sm font-mono">{s.salary || "—"}</td>
                  <td className="px-4 py-3"><select value={s.status} onChange={(e) => setStatus(s.id, e.target.value)} className={`text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer ${STAFF_STATUS_COLORS[s.status]}`}><option value="active">active</option><option value="on_leave">on_leave</option><option value="terminated">terminated</option></select></td>
                  <td className="px-4 py-3"><button onClick={() => remove(s.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
              {staff.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center"><Users className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-gray-400 text-sm">No staff records yet</p></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Staff Record" onClose={() => setShowAdd(false)} error={error} onSave={save} saving={saving} saveLabel="Add Record">
          <Field label="Staff Member *">
            <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className={inputCls}>
              <option value="">— Select —</option>
              {eligible.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </Field>
          <Field label="Position"><input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="e.g. Lead Instructor" className={inputCls} /></Field>
          <Field label="Department"><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Academics" className={inputCls} /></Field>
          <Field label="Employment Type">
            <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} className={inputCls}>
              {EMP_TYPES.map((t) => <option key={t} value={t}>{EMP_LABELS[t]}</option>)}
            </select>
          </Field>
          <Field label="Hire Date"><input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} className={inputCls} /></Field>
          <Field label="Salary"><input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="e.g. USD 1200/mo" className={inputCls} /></Field>
          <Field label="Emergency Contact"><input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} placeholder="Name & phone" className={inputCls} /></Field>
          <Field label="Notes"><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputCls} resize-none`} /></Field>
        </Modal>
      )}
    </div>
  );
}

/* ─── Leave Requests ─────────────────────────────────────────── */
function LeaveSection({ leave, onRefresh }: { leave: LeaveRequest[]; onRefresh: () => void }) {
  const [updating, setUpdating] = useState<string | null>(null);
  const decide = async (id: string, status: "approved" | "rejected") => {
    setUpdating(id);
    try { await apiUpdateLeave(id, { status }); onRefresh(); } catch { /* silent */ } finally { setUpdating(null); }
  };
  const fmtDays = (a: string, b: string) => { const d = Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000) + 1; return d > 0 ? `${d} day${d > 1 ? "s" : ""}` : "—"; };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat label="Pending" value={leave.filter((l) => l.status === "pending").length} icon="⏳" color="bg-amber-100 text-amber-700" />
        <Stat label="Approved" value={leave.filter((l) => l.status === "approved").length} icon="✅" color="bg-green-100 text-green-700" />
        <Stat label="Rejected" value={leave.filter((l) => l.status === "rejected").length} icon="❌" color="bg-red-100 text-red-700" />
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-[#f7f5f0] border-b border-gray-100">{["Staff", "Type", "Dates", "Duration", "Reason", "Status", "Actions"].map((h) => <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {leave.map((l) => (
                <tr key={l.id} className="border-b border-gray-50 hover:bg-[#f7f5f0]/50">
                  <td className="px-4 py-3 font-bold text-sm text-[#0f0f0f]">{l.userName || l.userId}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 capitalize">{l.type}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{fmtDays(l.startDate, l.endDate)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">{l.reason || "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${LEAVE_STATUS_COLORS[l.status]}`}>{l.status}</span></td>
                  <td className="px-4 py-3">
                    {l.status === "pending" ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => decide(l.id, "approved")} disabled={updating === l.id} className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-green-500 text-white rounded-lg disabled:opacity-40 touch-manipulation"><CheckCircle className="w-3 h-3" />Approve</button>
                        <button onClick={() => decide(l.id, "rejected")} disabled={updating === l.id} className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-red-100 text-red-600 rounded-lg disabled:opacity-40 touch-manipulation"><XCircle className="w-3 h-3" />Reject</button>
                      </div>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
              {leave.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center"><CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-gray-400 text-sm">No leave requests</p></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Payroll ────────────────────────────────────────────────── */
function PayrollSection({ payroll, staff, eligible, onRefresh }: { payroll: Payroll[]; staff: StaffRecord[]; eligible: User[]; onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const defaultPeriod = new Date().toISOString().slice(0, 7);
  const [form, setForm] = useState({ userId: "", period: defaultPeriod, gross: "", deductions: "", notes: "" });

  const num = (s: string) => parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;
  const net = (form.gross || form.deductions) ? (num(form.gross) - num(form.deductions)).toFixed(2) : "";

  const save = async () => {
    if (!form.userId || !form.period) { setError("Staff member and period required"); return; }
    setSaving(true); setError("");
    try {
      await apiCreatePayroll({ userId: form.userId, period: form.period, gross: form.gross || "0", deductions: form.deductions || "0", net: net || "0", notes: form.notes });
      setShowAdd(false);
      setForm({ userId: "", period: defaultPeriod, gross: "", deductions: "", notes: "" });
      onRefresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to add payroll record"); }
    finally { setSaving(false); }
  };

  const markPaid = async (id: string) => { setUpdating(id); try { await apiUpdatePayroll(id, { status: "paid" }); onRefresh(); } catch { /* silent */ } finally { setUpdating(null); } };

  const totalNet = payroll.reduce((a, p) => a + num(p.net), 0);
  const paidCount = payroll.filter((p) => p.status === "paid").length;
  const nameFor = (userId: string) => staff.find((s) => s.userId === userId)?.userName || eligible.find((u) => u.id === userId)?.name;

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat label="Records" value={payroll.length} icon="📋" color="bg-gray-100 text-gray-700" />
        <Stat label="Paid" value={paidCount} icon="✅" color="bg-green-100 text-green-700" />
        <Stat label="Total Net" value={`$${totalNet.toFixed(0)}`} icon="💰" color="bg-[#d4a017]/20 text-[#8a6a0f]" />
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={() => { setShowAdd(true); setError(""); }} className="flex items-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors touch-manipulation"><Plus className="w-4 h-4" />Add Payroll Record</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-[#f7f5f0] border-b border-gray-100">{["Staff", "Period", "Gross", "Deductions", "Net", "Status", "Actions"].map((h) => <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {payroll.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-[#f7f5f0]/50">
                  <td className="px-4 py-3 font-bold text-sm text-[#0f0f0f]">{p.userName || nameFor(p.userId) || p.userId}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.period}</td>
                  <td className="px-4 py-3 text-sm font-mono">${num(p.gross).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-mono text-red-500">-${num(p.deductions).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-mono font-bold text-[#1a6b2a]">${num(p.net).toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${p.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{p.status}</span></td>
                  <td className="px-4 py-3">{p.status === "pending" ? <button onClick={() => markPaid(p.id)} disabled={updating === p.id} className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-green-500 text-white rounded-lg disabled:opacity-40 touch-manipulation"><CheckCircle className="w-3 h-3" />Mark Paid</button> : <span className="text-xs text-gray-300">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}</span>}</td>
                </tr>
              ))}
              {payroll.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center"><DollarSign className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-gray-400 text-sm">No payroll records yet</p></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Payroll Record" onClose={() => setShowAdd(false)} error={error} onSave={save} saving={saving} saveLabel="Add Record">
          <Field label="Staff Member *">
            <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className={inputCls}>
              <option value="">— Select —</option>
              {eligible.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </Field>
          <Field label="Pay Period *"><input type="month" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className={inputCls} /></Field>
          <Field label="Gross Pay"><input value={form.gross} onChange={(e) => setForm({ ...form, gross: e.target.value })} placeholder="e.g. 1200" className={inputCls} /></Field>
          <Field label="Deductions"><input value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} placeholder="e.g. 150" className={inputCls} /></Field>
          <Field label="Net Pay (auto)"><input value={net} readOnly placeholder="—" className={`${inputCls} bg-gray-50`} /></Field>
          <Field label="Notes"><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputCls} resize-none`} /></Field>
        </Modal>
      )}
    </div>
  );
}

/* ─── Shared ─────────────────────────────────────────────────── */
const inputCls = "w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none";

function Stat({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-2xl font-black text-[#0f0f0f]">{value}</div>
      <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${color}`}>{label}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, error, onSave, saving, saveLabel, children }: { title: string; onClose: () => void; error: string; onSave: () => void; saving: boolean; saveLabel: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-lg text-[#0f0f0f]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        {error && <p className="text-red-500 text-xs mb-3 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
        <div className="space-y-3">{children}</div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm">Cancel</button>
          <button onClick={onSave} disabled={saving} className="flex-1 bg-[#1a6b2a] disabled:bg-gray-200 text-white font-black py-3 rounded-xl text-sm">{saving ? "Saving…" : saveLabel}</button>
        </div>
      </div>
    </div>
  );
}
