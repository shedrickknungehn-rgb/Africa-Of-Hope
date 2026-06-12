import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Edit2, X, AlertTriangle, Calendar, Clock } from "lucide-react";
import {
  Course, User, TimetableSlot, Exam,
  apiGetTimetable, apiCreateTimetableSlot, apiUpdateTimetableSlot, apiDeleteTimetableSlot,
  apiGetExams, apiCreateExam, apiUpdateExam, apiDeleteExam,
} from "../schoolApi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = ["Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6", "Period 7", "Period 8"];

const DAY_COLORS: Record<string, string> = {
  Monday: "bg-blue-500", Tuesday: "bg-purple-500", Wednesday: "bg-[#1a6b2a]",
  Thursday: "bg-[#d4a017]", Friday: "bg-rose-500", Saturday: "bg-indigo-500",
};

function timeToMins(t: string): number {
  if (!t) return -1;
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function hasConflict(slots: TimetableSlot[]): string[] {
  const conflicts: string[] = [];
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i], b = slots[j];
      if (a.dayOfWeek !== b.dayOfWeek) continue;

      const aStart = timeToMins(a.startTime), aEnd = timeToMins(a.endTime);
      const bStart = timeToMins(b.startTime), bEnd = timeToMins(b.endTime);
      const timesOverlap = aStart !== -1 && aEnd !== -1 && bStart !== -1 && bEnd !== -1 && aStart < bEnd && bStart < aEnd;
      const samePeriod = !!(a.period && b.period && a.period === b.period);
      if (!timesOverlap && !samePeriod) continue;

      const roomConflict = !!(a.room && b.room && a.room === b.room);
      const instructorConflict = !!(a.instructorId && b.instructorId && a.instructorId === b.instructorId && a.courseId !== b.courseId);

      if (roomConflict || instructorConflict) {
        if (!conflicts.includes(a.id)) conflicts.push(a.id);
        if (!conflicts.includes(b.id)) conflicts.push(b.id);
      }
    }
  }
  return conflicts;
}

const BLANK_SLOT = { courseId: "", dayOfWeek: "Monday", period: "Period 1", room: "", startTime: "", endTime: "" };
const BLANK_EXAM = { courseId: "", title: "", examDate: "", startTime: "", endTime: "", room: "", invigilatorId: "", notes: "" };

export default function TimetableTab({ courses, users }: { courses: Course[]; users: User[] }) {
  const [view, setView] = useState<"timetable" | "exams">("timetable");
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [slotModal, setSlotModal] = useState(false);
  const [editSlot, setEditSlot] = useState<TimetableSlot | null>(null);
  const [slotForm, setSlotForm] = useState(BLANK_SLOT);
  const [slotSaving, setSlotSaving] = useState(false);
  const [slotErr, setSlotErr] = useState("");

  const [examModal, setExamModal] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [examForm, setExamForm] = useState(BLANK_EXAM);
  const [examSaving, setExamSaving] = useState(false);
  const [examErr, setExamErr] = useState("");

  const loadAll = async () => {
    setLoading(true); setErr("");
    try {
      const [t, e] = await Promise.all([apiGetTimetable(), apiGetExams()]);
      setSlots(t); setExams(e);
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed to load"); }
    setLoading(false);
  };
  useEffect(() => { loadAll(); }, []);

  const conflictIds = useMemo(() => new Set(hasConflict(slots)), [slots]);

  const instructors = useMemo(() => users.filter((u) => u.role === "instructor" || u.role === "assistant"), [users]);

  const openAddSlot = () => { setEditSlot(null); setSlotForm(BLANK_SLOT); setSlotErr(""); setSlotModal(true); };
  const openEditSlot = (s: TimetableSlot) => {
    setEditSlot(s);
    setSlotForm({ courseId: s.courseId, dayOfWeek: s.dayOfWeek, period: s.period, room: s.room, startTime: s.startTime, endTime: s.endTime });
    setSlotErr(""); setSlotModal(true);
  };
  const saveSlot = async () => {
    if (!slotForm.courseId) { setSlotErr("Select a course"); return; }
    setSlotSaving(true); setSlotErr("");
    try {
      if (editSlot) {
        const updated = await apiUpdateTimetableSlot(editSlot.id, slotForm);
        setSlots((prev) => prev.map((s) => (s.id === editSlot.id ? updated : s)));
      } else {
        const created = await apiCreateTimetableSlot(slotForm);
        setSlots((prev) => [...prev, created]);
      }
      setSlotModal(false);
    } catch (e) { setSlotErr(e instanceof Error ? e.message : "Failed to save"); }
    setSlotSaving(false);
  };
  const deleteSlot = async (id: string) => {
    await apiDeleteTimetableSlot(id).catch(() => {});
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const openAddExam = () => { setEditExam(null); setExamForm(BLANK_EXAM); setExamErr(""); setExamModal(true); };
  const openEditExam = (e: Exam) => {
    setEditExam(e);
    setExamForm({ courseId: e.courseId, title: e.title, examDate: e.examDate ? e.examDate.slice(0, 10) : "", startTime: e.startTime, endTime: e.endTime, room: e.room, invigilatorId: e.invigilatorId, notes: e.notes });
    setExamErr(""); setExamModal(true);
  };
  const saveExam = async () => {
    if (!examForm.courseId || !examForm.title || !examForm.examDate) { setExamErr("Course, title and date required"); return; }
    setExamSaving(true); setExamErr("");
    try {
      const payload = { ...examForm, examDate: new Date(examForm.examDate).toISOString() };
      if (editExam) {
        const updated = await apiUpdateExam(editExam.id, payload);
        setExams((prev) => prev.map((e) => (e.id === editExam.id ? updated : e)));
      } else {
        const created = await apiCreateExam(payload);
        setExams((prev) => [...prev, created]);
      }
      setExamModal(false);
    } catch (e) { setExamErr(e instanceof Error ? e.message : "Failed to save"); }
    setExamSaving(false);
  };
  const deleteExam = async (id: string) => {
    await apiDeleteExam(id).catch(() => {});
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const now = Date.now();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#1a6b2a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading schedule…</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {err && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-bold">{err}</div>}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
          <button onClick={() => setView("timetable")}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-colors touch-manipulation ${view === "timetable" ? "bg-[#0d3d1a] text-white" : "text-gray-500 hover:text-[#0d3d1a]"}`}>
            📅 Weekly Timetable
          </button>
          <button onClick={() => setView("exams")}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-colors touch-manipulation ${view === "exams" ? "bg-[#0d3d1a] text-white" : "text-gray-500 hover:text-[#0d3d1a]"}`}>
            📝 Exam Schedule
          </button>
        </div>
        <button onClick={view === "timetable" ? openAddSlot : openAddExam}
          className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#b8890f] text-white font-black px-4 py-2.5 rounded-xl text-sm transition-colors touch-manipulation">
          <Plus className="w-4 h-4" />Add {view === "timetable" ? "Slot" : "Exam"}
        </button>
      </div>

      {conflictIds.size > 0 && view === "timetable" && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-amber-700 text-sm font-bold">Scheduling conflict — {conflictIds.size} slot(s) have a room double-booking or instructor double-booking on the same day and period/time.</p>
        </div>
      )}

      {view === "timetable" ? (
        <TimetableGrid slots={slots} days={DAYS} periods={PERIODS} conflictIds={conflictIds} onEdit={openEditSlot} onDelete={deleteSlot} />
      ) : (
        <ExamList exams={exams} now={now} onEdit={openEditExam} onDelete={deleteExam} />
      )}

      {slotModal && (
        <SlotModal
          form={slotForm} setForm={setSlotForm} courses={courses}
          saving={slotSaving} err={slotErr} isEdit={!!editSlot}
          onSave={saveSlot} onClose={() => setSlotModal(false)}
        />
      )}

      {examModal && (
        <ExamModal
          form={examForm} setForm={setExamForm} courses={courses} instructors={instructors}
          saving={examSaving} err={examErr} isEdit={!!editExam}
          onSave={saveExam} onClose={() => setExamModal(false)}
        />
      )}
    </div>
  );
}

/* ─── Weekly Grid ─────────────────────────────────────────────── */
function TimetableGrid({ slots, days, periods, conflictIds, onEdit, onDelete }: {
  slots: TimetableSlot[]; days: string[]; periods: string[];
  conflictIds: Set<string>; onEdit: (s: TimetableSlot) => void; onDelete: (id: string) => void;
}) {
  const grid = useMemo(() => {
    const map: Record<string, Record<string, TimetableSlot[]>> = {};
    days.forEach((d) => { map[d] = {}; periods.forEach((p) => { map[d][p] = []; }); });
    slots.forEach((s) => {
      const day = s.dayOfWeek;
      const period = s.period || "Other";
      if (!map[day]) map[day] = {};
      if (!map[day][period]) map[day][period] = [];
      map[day][period].push(s);
    });
    return map;
  }, [slots, days, periods]);

  if (slots.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400 font-bold">No timetable slots yet.</p>
        <p className="text-gray-400 text-sm mt-1">Add slots to build the weekly schedule.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-[#0d3d1a] text-white">
              <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wide w-24">Period</th>
              {days.map((d) => (
                <th key={d} className="px-3 py-3 text-xs font-black uppercase tracking-wide text-center">{d.slice(0, 3)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period} className="border-t border-gray-100 align-top">
                <td className="px-4 py-2 text-gray-400 text-xs font-bold whitespace-nowrap">{period}</td>
                {days.map((day) => {
                  const cell = grid[day]?.[period] ?? [];
                  return (
                    <td key={day} className="px-2 py-2 min-w-[120px]">
                      <div className="space-y-1">
                        {cell.map((s) => (
                          <SlotCard key={s.id} slot={s} conflict={conflictIds.has(s.id)} onEdit={onEdit} onDelete={onDelete} />
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-100 p-4">
        <h4 className="text-xs font-black text-gray-400 uppercase mb-3">All Slots — List View</h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {slots.map((s) => (
            <div key={s.id} className={`rounded-xl p-3 border ${conflictIds.has(s.id) ? "bg-amber-50 border-amber-300" : "bg-[#f7f5f0] border-transparent"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-[#0f0f0f] text-xs truncate">{s.courseTitle || s.courseId}</p>
                  <p className="text-gray-500 text-xs">{s.dayOfWeek} · {s.period}</p>
                  {(s.startTime || s.endTime) && <p className="text-gray-400 text-xs">{s.startTime}{s.endTime ? `–${s.endTime}` : ""}</p>}
                  {s.room && <p className="text-[#1a6b2a] text-xs font-bold">📍 {s.room}</p>}
                  {conflictIds.has(s.id) && <p className="text-amber-600 text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Conflict</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => onEdit(s)} className="text-gray-300 hover:text-[#1a6b2a] p-1 touch-manipulation"><Edit2 className="w-3 h-3" /></button>
                  <button onClick={() => onDelete(s.id)} className="text-gray-300 hover:text-red-500 p-1 touch-manipulation"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlotCard({ slot, conflict, onEdit, onDelete }: { slot: TimetableSlot; conflict: boolean; onEdit: (s: TimetableSlot) => void; onDelete: (id: string) => void }) {
  const color = DAY_COLORS[slot.dayOfWeek] || "bg-gray-500";
  return (
    <div className={`rounded-lg p-1.5 text-white text-[10px] relative group ${conflict ? "ring-2 ring-amber-400" : ""} ${color}`}>
      <p className="font-black leading-tight truncate">{slot.courseTitle || slot.courseId}</p>
      {slot.room && <p className="opacity-80 truncate">📍{slot.room}</p>}
      {slot.startTime && <p className="opacity-80">{slot.startTime}{slot.endTime ? `–${slot.endTime}` : ""}</p>}
      <div className="absolute top-0.5 right-0.5 hidden group-hover:flex gap-0.5 bg-black/20 rounded p-0.5">
        <button onClick={() => onEdit(slot)} className="text-white/80 hover:text-white touch-manipulation"><Edit2 className="w-2.5 h-2.5" /></button>
        <button onClick={() => onDelete(slot.id)} className="text-white/80 hover:text-white touch-manipulation"><X className="w-2.5 h-2.5" /></button>
      </div>
    </div>
  );
}

/* ─── Exam List ───────────────────────────────────────────────── */
function ExamList({ exams, now, onEdit, onDelete }: { exams: Exam[]; now: number; onEdit: (e: Exam) => void; onDelete: (id: string) => void }) {
  if (exams.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
        <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400 font-bold">No exams scheduled yet.</p>
        <p className="text-gray-400 text-sm mt-1">Add exams to build the exam timetable.</p>
      </div>
    );
  }

  const upcoming = exams.filter((e) => new Date(e.examDate).getTime() >= now);
  const past = exams.filter((e) => new Date(e.examDate).getTime() < now);

  return (
    <div className="space-y-4">
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Upcoming Exams ({upcoming.length})</h3>
          <div className="space-y-3">
            {upcoming.map((e) => <ExamCard key={e.id} exam={e} upcoming onEdit={onEdit} onDelete={onDelete} />)}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Past Exams ({past.length})</h3>
          <div className="space-y-3">
            {past.map((e) => <ExamCard key={e.id} exam={e} upcoming={false} onEdit={onEdit} onDelete={onDelete} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function ExamCard({ exam, upcoming, onEdit, onDelete }: { exam: Exam; upcoming: boolean; onEdit: (e: Exam) => void; onDelete: (id: string) => void }) {
  const d = new Date(exam.examDate);
  return (
    <div className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm flex items-start gap-4 ${!upcoming ? "opacity-60" : ""}`}>
      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0 ${upcoming ? "bg-[#0d3d1a]" : "bg-gray-400"}`}>
        <span className="text-[9px] font-bold uppercase">{d.toLocaleString("en", { month: "short" })}</span>
        <span className="text-xl font-black leading-none">{d.getDate()}</span>
        <span className="text-[9px] font-bold opacity-70">{d.getFullYear()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="font-black text-[#0f0f0f]">{exam.title}</p>
            <p className="text-sm text-gray-500">{exam.courseTitle}</p>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <button onClick={() => onEdit(exam)} className="text-gray-300 hover:text-[#1a6b2a] p-1.5 rounded-lg hover:bg-gray-100 touch-manipulation"><Edit2 className="w-4 h-4" /></button>
            <button onClick={() => onDelete(exam.id)} className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 touch-manipulation"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
          {(exam.startTime || exam.endTime) && <span>⏰ {exam.startTime}{exam.endTime ? `–${exam.endTime}` : ""}</span>}
          {exam.room && <span>📍 {exam.room}</span>}
          {exam.invigilatorName && <span>👤 {exam.invigilatorName}</span>}
        </div>
        {exam.notes && <p className="text-xs text-gray-400 mt-1 italic">{exam.notes}</p>}
      </div>
    </div>
  );
}

/* ─── Slot Modal ──────────────────────────────────────────────── */
function SlotModal({ form, setForm, courses, saving, err, isEdit, onSave, onClose }: {
  form: typeof BLANK_SLOT; setForm: (f: typeof BLANK_SLOT) => void;
  courses: Course[]; saving: boolean; err: string; isEdit: boolean;
  onSave: () => void; onClose: () => void;
}) {
  const F = (k: keyof typeof BLANK_SLOT) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-black text-[#0f0f0f]">{isEdit ? "Edit" : "Add"} Timetable Slot</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 touch-manipulation"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Course *</label>
            <select value={form.courseId} onChange={F("courseId")} className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
              <option value="">Select course…</option>
              {courses.filter((c) => c.status === "active").map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Day *</label>
              <select value={form.dayOfWeek} onChange={F("dayOfWeek")} className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Period</label>
              <select value={form.period} onChange={F("period")} className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
                <option value="">Select…</option>
                {["Period 1","Period 2","Period 3","Period 4","Period 5","Period 6","Period 7","Period 8"].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Room</label>
            <input placeholder="e.g. Room 101" value={form.room} onChange={F("room")} className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Start Time</label>
              <input type="time" value={form.startTime} onChange={F("startTime")} className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">End Time</label>
              <input type="time" value={form.endTime} onChange={F("endTime")} className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
            </div>
          </div>
          {err && <p className="text-red-600 text-sm font-bold">{err}</p>}
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-2.5 rounded-xl text-sm transition-colors touch-manipulation">Cancel</button>
          <button onClick={onSave} disabled={saving} className="flex-1 bg-[#0d3d1a] hover:bg-[#155a22] disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-sm transition-colors touch-manipulation">
            {saving ? "Saving…" : isEdit ? "Update Slot" : "Add Slot"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Exam Modal ──────────────────────────────────────────────── */
function ExamModal({ form, setForm, courses, instructors, saving, err, isEdit, onSave, onClose }: {
  form: typeof BLANK_EXAM; setForm: (f: typeof BLANK_EXAM) => void;
  courses: Course[]; instructors: User[]; saving: boolean; err: string; isEdit: boolean;
  onSave: () => void; onClose: () => void;
}) {
  const F = (k: keyof typeof BLANK_EXAM) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-black text-[#0f0f0f]">{isEdit ? "Edit" : "Schedule"} Exam</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 touch-manipulation"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Course *</label>
            <select value={form.courseId} onChange={F("courseId")} className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
              <option value="">Select course…</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Exam Title *</label>
            <input placeholder="e.g. Midterm Examination" value={form.title} onChange={F("title")} className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Exam Date *</label>
            <input type="date" value={form.examDate} onChange={F("examDate")} className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Start Time</label>
              <input type="time" value={form.startTime} onChange={F("startTime")} className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">End Time</label>
              <input type="time" value={form.endTime} onChange={F("endTime")} className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Room</label>
            <input placeholder="e.g. Exam Hall A" value={form.room} onChange={F("room")} className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Invigilator</label>
            <select value={form.invigilatorId} onChange={F("invigilatorId")} className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
              <option value="">Select invigilator…</option>
              {instructors.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Notes</label>
            <input placeholder="Additional instructions…" value={form.notes} onChange={F("notes")} className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
          </div>
          {err && <p className="text-red-600 text-sm font-bold">{err}</p>}
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-2.5 rounded-xl text-sm transition-colors touch-manipulation">Cancel</button>
          <button onClick={onSave} disabled={saving} className="flex-1 bg-[#0d3d1a] hover:bg-[#155a22] disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-sm transition-colors touch-manipulation">
            {saving ? "Saving…" : isEdit ? "Update Exam" : "Schedule Exam"}
          </button>
        </div>
      </div>
    </div>
  );
}
