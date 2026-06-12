import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2, Eye, EyeOff, Search, X, Link, UserPlus } from "lucide-react";
import type { User, ParentLink } from "../schoolApi";
import {
  apiCreateUser, apiUpdateUser, apiDeleteUser, ALL_ROLES, ROLE_LABELS, ROLE_COLORS,
  apiGetParentLinks, apiCreateParentLink, apiDeleteParentLink,
} from "../schoolApi";

interface Props { users: User[]; currentUser: User; onRefresh: () => void; }

const emptyUser = { username: "", password: "", name: "", email: "", phone: "", role: "student" };

export default function UsersTab({ users, currentUser, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [form, setForm] = useState({ ...emptyUser });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null);
  const [linkTarget, setLinkTarget] = useState<User | null>(null);
  const [parentLinks, setParentLinks] = useState<ParentLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linkStudentId, setLinkStudentId] = useState("");
  const [linkSaving, setLinkSaving] = useState(false);

  const filtered = users.filter(u => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const openAdd = () => { setForm({ ...emptyUser }); setError(""); setShowAdd(true); };
  const openEdit = (u: User) => { setForm({ username: u.username, password: u.password, name: u.name, email: u.email || "", phone: u.phone || "", role: u.role }); setError(""); setEditTarget(u); };

  const save = async () => {
    if (!form.name || !form.username || !form.password) { setError("Name, username and password are required"); return; }
    setSaving(true); setError("");
    try {
      if (editTarget) { await apiUpdateUser(editTarget.id, form); setEditTarget(null); }
      else { await apiCreateUser(form as Omit<User, "id" | "createdAt">); setShowAdd(false); }
      onRefresh();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (id === currentUser.id) return;
    setDeleting(id);
    try { await apiDeleteUser(id); onRefresh(); } catch { } finally { setDeleting(null); }
  };

  const togglePw = (id: string) => setShowPasswords(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const roleCount = (role: string) => users.filter(u => u.role === role).length;

  const openLinks = useCallback(async (parent: User) => {
    setLinkTarget(parent);
    setLinkStudentId("");
    setLinksLoading(true);
    try {
      const all = await apiGetParentLinks();
      setParentLinks(all.filter(l => l.parentId === parent.id));
    } finally { setLinksLoading(false); }
  }, []);

  const addLink = async () => {
    if (!linkTarget || !linkStudentId) return;
    setLinkSaving(true);
    try {
      const nl = await apiCreateParentLink({ parentId: linkTarget.id, studentId: linkStudentId });
      const student = users.find(u => u.id === linkStudentId);
      setParentLinks(prev => [...prev, { ...nl, studentName: student?.name || "" }]);
      setLinkStudentId("");
    } catch (e) { alert(e instanceof Error ? e.message : "Failed to add link"); }
    finally { setLinkSaving(false); }
  };

  const removeLink = async (linkId: string) => {
    try {
      await apiDeleteParentLink(linkId);
      setParentLinks(prev => prev.filter(l => l.id !== linkId));
    } catch { }
  };

  const students = users.filter(u => u.role === "student" || u.role === "alumni");
  const linkedStudentIds = new Set(parentLinks.map(l => l.studentId));
  const availableStudents = students.filter(u => !linkedStudentIds.has(u.id));

  const Modal = ({ title, onClose }: { title: string; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-lg text-[#0f0f0f]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        {error && <p className="text-red-500 text-xs mb-3 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
        <div className="space-y-3">
          {[
            { label: "Full Name *", key: "name", type: "text", ph: "e.g. John Smith" },
            { label: "Username *", key: "username", type: "text", ph: "e.g. jsmith" },
            { label: "Email", key: "email", type: "email", ph: "user@email.com" },
            { label: "Phone", key: "phone", type: "tel", ph: "+231 XXX XXX" },
            { label: "Password *", key: "password", type: "password", ph: "Set a password" },
          ].map(({ label, key, type, ph }) => (
            <div key={key}>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">{label}</label>
              <input type={type} placeholder={ph} value={(form as Record<string, string>)[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Role *</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none">
              {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="flex-1 bg-[#1a6b2a] disabled:bg-gray-200 text-white font-black py-3 rounded-xl text-sm">
            {saving ? "Saving…" : editTarget ? "Update" : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );

  const LinkModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-black text-lg text-[#0f0f0f]">Linked Students</h3>
            <p className="text-sm text-gray-400">Parent: <span className="font-bold text-[#0d3d1a]">{linkTarget?.name}</span></p>
          </div>
          <button onClick={() => setLinkTarget(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="mb-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Currently Linked</p>
          {linksLoading ? (
            <div className="text-center py-4"><div className="w-5 h-5 border-2 border-[#1a6b2a] border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : parentLinks.length === 0 ? (
            <p className="text-gray-400 text-sm py-2 text-center">No students linked yet.</p>
          ) : parentLinks.map(l => (
            <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-bold text-[#0f0f0f]">{l.studentName || l.studentId}</p>
              </div>
              <button onClick={() => removeLink(l.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {availableStudents.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Link a Student</p>
            <div className="flex gap-2">
              <select value={linkStudentId} onChange={e => setLinkStudentId(e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none">
                <option value="">Select student…</option>
                {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name} (@{s.username})</option>)}
              </select>
              <button onClick={addLink} disabled={!linkStudentId || linkSaving}
                className="flex items-center gap-1.5 bg-[#1a6b2a] disabled:bg-gray-200 text-white font-black px-4 py-2.5 rounded-xl text-sm transition-colors">
                <UserPlus className="w-4 h-4" />{linkSaving ? "…" : "Add"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
            className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#1a6b2a] focus:outline-none" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none bg-white">
          <option value="all">All Roles ({users.length})</option>
          {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]} ({roleCount(r)})</option>)}
        </select>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors touch-manipulation">
          <Plus className="w-4 h-4" />Add User
        </button>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map(u => (
          <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#1a6b2a]/10 flex items-center justify-center text-[#1a6b2a] font-black text-sm">
                {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[#0f0f0f] text-sm truncate">{u.name}</p>
                <p className="text-xs text-gray-400 font-mono">{u.username}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-600"}`}>{ROLE_LABELS[u.role] || u.role}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                <span>{showPasswords.has(u.id) ? u.password : "••••••••"}</span>
                <button onClick={() => togglePw(u.id)}>{showPasswords.has(u.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
              </div>
              <div className="flex gap-2">
                {u.role === "parent" && (
                  <button onClick={() => openLinks(u)} className="w-8 h-8 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center"><Link className="w-3.5 h-3.5" /></button>
                )}
                <button onClick={() => openEdit(u)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><Edit2 className="w-3.5 h-3.5" /></button>
                {u.id !== currentUser.id && (
                  <button onClick={() => del(u.id)} disabled={deleting === u.id} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center disabled:opacity-40">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f7f5f0] border-b border-gray-100">
                {["Name", "Username", "Email", "Role", "Password", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-[#f7f5f0]/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#1a6b2a]/10 flex items-center justify-center text-[#1a6b2a] font-black text-xs">{u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                      <span className="font-bold text-sm text-[#0f0f0f]">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-sm text-gray-600">{u.username}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 max-w-[180px] truncate">{u.email}</td>
                  <td className="px-5 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-600"}`}>{ROLE_LABELS[u.role] || u.role}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-gray-500">{showPasswords.has(u.id) ? u.password : "••••••••"}</span>
                      <button onClick={() => togglePw(u.id)} className="text-gray-400 hover:text-gray-600">{showPasswords.has(u.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}</button>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {u.role === "parent" && (
                        <button onClick={() => openLinks(u)} title="Manage linked students"
                          className="w-7 h-7 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-500 flex items-center justify-center transition-colors">
                          <Link className="w-3 h-3" />
                        </button>
                      )}
                      <button onClick={() => openEdit(u)} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition-colors"><Edit2 className="w-3 h-3" /></button>
                      {u.id !== currentUser.id && (
                        <button onClick={() => del(u.id)} disabled={deleting === u.id} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors disabled:opacity-40">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">No users found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <Modal title="Add New User" onClose={() => setShowAdd(false)} />}
      {editTarget && <Modal title={`Edit — ${editTarget.name}`} onClose={() => setEditTarget(null)} />}
      {linkTarget && <LinkModal />}
    </div>
  );
}
