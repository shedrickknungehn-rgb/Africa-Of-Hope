import { useState } from "react";
import { Plus, Trash2, Edit2, Users, Video, BookOpen, X, Search } from "lucide-react";
import type { User, Course } from "../schoolApi";
import { apiCreateCourse, apiUpdateCourse, apiDeleteCourse } from "../schoolApi";

interface Props { courses: Course[]; users: User[]; onRefresh: () => void; }

const emptyCourse = { title: "", description: "", instructorId: "", duration: "1 month", fee: "", schedule: "", status: "active", capacity: "30", category: "" };

export default function CoursesTab({ courses, users, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [form, setForm] = useState({ ...emptyCourse });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const instructors = users.filter(u => u.role === "instructor" || u.role === "assistant");

  const filtered = courses.filter(c => {
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const openAdd = () => { setForm({ ...emptyCourse }); setError(""); setShowAdd(true); };
  const openEdit = (c: Course) => {
    setForm({ title: c.title, description: c.description, instructorId: c.instructorId, duration: c.duration, fee: c.fee, schedule: c.schedule, status: c.status, capacity: String(c.capacity || 30), category: c.category || "" });
    setError(""); setEditTarget(c);
  };

  const save = async () => {
    if (!form.title) { setError("Title is required"); return; }
    setSaving(true); setError("");
    try {
      if (editTarget) { await apiUpdateCourse(editTarget.id, { ...form, capacity: Number(form.capacity) }); setEditTarget(null); }
      else { await apiCreateCourse({ ...form, capacity: Number(form.capacity) }); setShowAdd(false); }
      onRefresh();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    setDeleting(id);
    try { await apiDeleteCourse(id); onRefresh(); } catch { /* silent */ } finally { setDeleting(null); }
  };

  const FORM_FIELDS = [
    { label: "Course Title *", key: "title", type: "text", ph: "e.g. Business Management" },
    { label: "Category", key: "category", type: "text", ph: "e.g. Business, Health, IT" },
    { label: "Duration", key: "duration", type: "text", ph: "e.g. 3 months" },
    { label: "Tuition Fee", key: "fee", type: "text", ph: "e.g. USD 500" },
    { label: "Schedule", key: "schedule", type: "text", ph: "e.g. Mon/Wed 9am–11am" },
    { label: "Capacity", key: "capacity", type: "number", ph: "30" },
  ];

  const Modal = ({ title, onClose }: { title: string; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-lg text-[#0f0f0f]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        {error && <p className="text-red-500 text-xs mb-3 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
        <div className="space-y-3">
          {FORM_FIELDS.map(({ label, key, type, ph }) => (
            <div key={key}>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">{label}</label>
              <input type={type} placeholder={ph} value={(form as Record<string, string>)[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Description</label>
            <textarea rows={3} placeholder="Course description…" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none resize-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Instructor</label>
            <select value={form.instructorId} onChange={e => setForm({ ...form, instructorId: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none">
              <option value="">— Unassigned —</option>
              {instructors.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="flex-1 bg-[#d4a017] disabled:bg-gray-200 text-[#0f0f0f] font-black py-3 rounded-xl text-sm">
            {saving ? "Saving…" : editTarget ? "Update" : "Add Course"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…"
            className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#1a6b2a] focus:outline-none" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none bg-white">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#d4a017] hover:opacity-90 text-[#0f0f0f] font-bold text-sm px-4 py-2.5 rounded-xl transition-colors touch-manipulation">
          <Plus className="w-4 h-4" />Add Course
        </button>
      </div>

      <div className="space-y-4">
        {filtered.map(course => {
          const instructor = users.find(u => u.id === course.instructorId);
          return (
            <div key={course.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <div className="w-8 h-8 bg-[#d4a017]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-[#d4a017]" />
                    </div>
                    <h3 className="font-black text-[#0f0f0f]">{course.title}</h3>
                    {course.category && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{course.category}</span>}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${course.status === "active" ? "bg-green-100 text-green-700" : course.status === "archived" ? "bg-gray-200 text-gray-500" : "bg-yellow-100 text-yellow-700"}`}>{course.status}</span>
                  </div>
                  {course.description && <p className="text-gray-500 text-sm mb-3 ml-10">{course.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 ml-10">
                    <span>⏱ {course.duration}</span>
                    {course.fee && <span>💰 {course.fee}</span>}
                    {course.schedule && <span>📅 {course.schedule}</span>}
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.students.length}/{course.capacity || 30} enrolled</span>
                    {instructor && <span>👤 {instructor.name}</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(course)} className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => del(course.id)} disabled={deleting === course.id} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors disabled:opacity-40"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <Video className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No courses found</p>
          </div>
        )}
      </div>

      {showAdd && <Modal title="Add New Course" onClose={() => setShowAdd(false)} />}
      {editTarget && <Modal title={`Edit — ${editTarget.title}`} onClose={() => setEditTarget(null)} />}
    </div>
  );
}
