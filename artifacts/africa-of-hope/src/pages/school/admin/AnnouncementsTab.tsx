import { useState } from "react";
import { Plus, Trash2, Bell, X } from "lucide-react";
import type { User, Announcement } from "../schoolApi";
import { apiCreateAnnouncement, apiDeleteAnnouncement, ALL_ROLES, ROLE_LABELS } from "../schoolApi";

interface Props { announcements: Announcement[]; currentUser: User; onRefresh: () => void; }

const PRIORITY_STYLES: Record<string, { badge: string; border: string; dot: string }> = {
  urgent: { badge: "bg-red-100 text-red-700", border: "border-l-red-500", dot: "bg-red-500" },
  high:   { badge: "bg-orange-100 text-orange-700", border: "border-l-orange-400", dot: "bg-orange-400" },
  normal: { badge: "bg-blue-100 text-blue-700", border: "border-l-blue-400", dot: "bg-blue-400" },
  low:    { badge: "bg-gray-100 text-gray-500", border: "border-l-gray-300", dot: "bg-gray-400" },
};

export default function AnnouncementsTab({ announcements, currentUser, onRefresh }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: "", content: "", priority: "normal" as Announcement["priority"],
    targetRoles: ["all"], expiresAt: null as string | null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? announcements : announcements.filter(a => a.priority === filter);

  const toggleRole = (role: string) => {
    if (role === "all") { setForm({ ...form, targetRoles: ["all"] }); return; }
    const curr = form.targetRoles.filter(r => r !== "all");
    const next = curr.includes(role) ? curr.filter(r => r !== role) : [...curr, role];
    setForm({ ...form, targetRoles: next.length === 0 ? ["all"] : next });
  };

  const save = async () => {
    if (!form.title || !form.content) { setError("Title and content required"); return; }
    setSaving(true); setError("");
    try {
      await apiCreateAnnouncement({
        title: form.title, content: form.content, authorId: currentUser.id,
        priority: form.priority, targetRoles: form.targetRoles, expiresAt: form.expiresAt,
      });
      setForm({ title: "", content: "", priority: "normal", targetRoles: ["all"], expiresAt: null });
      setShowAdd(false); onRefresh();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to post"); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    setDeleting(id);
    try { await apiDeleteAnnouncement(id); onRefresh(); }
    catch { /* silent */ } finally { setDeleting(null); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-2 flex-wrap flex-1">
          {(["all", "urgent", "high", "normal", "low"] as const).map(p => (
            <button key={p} onClick={() => setFilter(p)}
              className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-colors touch-manipulation ${filter === p ? "bg-[#0d3d1a] text-white" : "bg-white text-gray-600 border-2 border-gray-200 hover:border-[#1a6b2a]"}`}>
              {p === "all" ? `All (${announcements.length})` : p}
            </button>
          ))}
        </div>
        <button onClick={() => { setShowAdd(true); setError(""); }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors touch-manipulation">
          <Plus className="w-4 h-4" />Post Announcement
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const styles = PRIORITY_STYLES[a.priority] || PRIORITY_STYLES.normal;
            return (
              <div key={a.id} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${styles.border}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${styles.dot}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-black text-[#0f0f0f]">{a.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${styles.badge}`}>{a.priority}</span>
                        {a.targetRoles.includes("all") ? (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">All roles</span>
                        ) : (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {a.targetRoles.map(r => ROLE_LABELS[r] || r).join(", ")}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{a.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>By {a.authorName || "Admin"}</span>
                        <span>•</span>
                        <span>{new Date(a.createdAt).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}</span>
                        {a.expiresAt && <><span>•</span><span>Expires {new Date(a.expiresAt).toLocaleDateString()}</span></>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => del(a.id)} disabled={deleting === a.id}
                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-40">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-lg text-[#0f0f0f]">Post Announcement</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            {error && <p className="text-red-500 text-xs mb-3 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Title *</label>
                <input type="text" placeholder="Announcement title…" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Message *</label>
                <textarea rows={4} placeholder="Write your announcement…" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none resize-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["low", "normal", "high", "urgent"] as const).map(p => (
                    <button key={p} onClick={() => setForm({ ...form, priority: p })}
                      className={`py-2 rounded-xl text-xs font-bold capitalize border-2 transition-colors touch-manipulation ${form.priority === p ? "border-[#1a6b2a] bg-[#1a6b2a] text-white" : "border-gray-200 text-gray-600 hover:border-[#1a6b2a]"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Target Audience</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => toggleRole("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-colors touch-manipulation ${form.targetRoles.includes("all") ? "border-[#1a6b2a] bg-[#1a6b2a] text-white" : "border-gray-200 text-gray-600"}`}>
                    All
                  </button>
                  {ALL_ROLES.map(r => (
                    <button key={r} onClick={() => toggleRole(r)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-colors touch-manipulation ${form.targetRoles.includes(r) ? "border-[#1a6b2a] bg-[#1a6b2a] text-white" : "border-gray-200 text-gray-600"}`}>
                      {ROLE_LABELS[r] || r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Expiry Date (optional)</label>
                <input type="date" value={form.expiresAt || ""} onChange={e => setForm({ ...form, expiresAt: e.target.value || null })}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-orange-500 disabled:bg-gray-200 text-white font-black py-3 rounded-xl text-sm">
                {saving ? "Posting…" : "Post Announcement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
