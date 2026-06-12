import { useState } from "react";
import { Plus, Trash2, Calendar, MapPin, X } from "lucide-react";
import type { SchoolEvent } from "../schoolApi";
import { apiCreateEvent, apiDeleteEvent } from "../schoolApi";

interface Props { events: SchoolEvent[]; onRefresh: () => void; }

const TYPE_COLORS: Record<string, string> = {
  academic: "bg-blue-100 text-blue-700",
  social: "bg-green-100 text-green-700",
  administrative: "bg-amber-100 text-amber-700",
  external: "bg-purple-100 text-purple-700",
};

const TYPE_ICONS: Record<string, string> = {
  academic: "🎓", social: "🎉", administrative: "📋", external: "🌐",
};

export default function EventsTab({ events, onRefresh }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", location: "", type: "academic" as SchoolEvent["type"] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [view, setView] = useState<"upcoming" | "past" | "all">("upcoming");

  const now = new Date();
  const filtered = events.filter(e => {
    const d = new Date(e.date);
    if (view === "upcoming") return d >= now;
    if (view === "past") return d < now;
    return true;
  });

  const upcoming = events.filter(e => new Date(e.date) >= now).length;
  const past = events.filter(e => new Date(e.date) < now).length;

  const save = async () => {
    if (!form.title || !form.date) { setError("Title and date required"); return; }
    setSaving(true); setError("");
    try {
      await apiCreateEvent({ ...form, date: new Date(form.date).toISOString() });
      setForm({ title: "", description: "", date: "", location: "", type: "academic" });
      setShowAdd(false); onRefresh();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to create event"); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    setDeleting(id);
    try { await apiDeleteEvent(id); onRefresh(); }
    catch { /* silent */ } finally { setDeleting(null); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-2">
          {([["upcoming", `Upcoming (${upcoming})`], ["past", `Past (${past})`], ["all", `All (${events.length})`]] as const).map(([v, label]) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors touch-manipulation ${view === v ? "bg-[#0d3d1a] text-white" : "bg-white text-gray-600 border-2 border-gray-200 hover:border-[#1a6b2a]"}`}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => { setShowAdd(true); setError(""); }}
          className="ml-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors touch-manipulation">
          <Plus className="w-4 h-4" />Add Event
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No events {view === "upcoming" ? "scheduled" : view === "past" ? "recorded" : "found"}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ev => {
            const d = new Date(ev.date);
            const isPast = d < now;
            return (
              <div key={ev.id} className={`bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow ${isPast ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-indigo-700 font-bold text-[10px] uppercase">{d.toLocaleDateString("en", { month: "short" })}</span>
                      <span className="text-indigo-700 font-black text-lg leading-none">{d.getDate()}</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">{d.getFullYear()} · {d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</p>
                      <p className="text-xs font-bold text-gray-500">{d.toLocaleDateString("en", { weekday: "long" })}</p>
                    </div>
                  </div>
                  <button onClick={() => del(ev.id)} disabled={deleting === ev.id}
                    className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-40">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="font-black text-[#0f0f0f] mb-1">{ev.title}</h3>
                {ev.description && <p className="text-gray-500 text-xs mb-2 line-clamp-2">{ev.description}</p>}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[ev.type] || TYPE_COLORS.academic}`}>
                    {TYPE_ICONS[ev.type]} {ev.type}
                  </span>
                  {ev.location && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                      <MapPin className="w-2.5 h-2.5" />{ev.location}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-lg text-[#0f0f0f]">Add Event</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            {error && <p className="text-red-500 text-xs mb-3 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Event Title *</label>
                <input type="text" placeholder="e.g. Graduation Ceremony 2026" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Description</label>
                <textarea rows={2} placeholder="Event description…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none resize-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Date & Time *</label>
                <input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Location</label>
                <input type="text" placeholder="e.g. Main Auditorium, RIA Highway" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Event Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["academic", "social", "administrative", "external"] as const).map(t => (
                    <button key={t} onClick={() => setForm({ ...form, type: t })}
                      className={`py-2.5 rounded-xl text-xs font-bold capitalize border-2 transition-colors touch-manipulation ${form.type === t ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-200 text-gray-600"}`}>
                      {TYPE_ICONS[t]} {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-indigo-600 disabled:bg-gray-200 text-white font-black py-3 rounded-xl text-sm">
                {saving ? "Saving…" : "Add Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
