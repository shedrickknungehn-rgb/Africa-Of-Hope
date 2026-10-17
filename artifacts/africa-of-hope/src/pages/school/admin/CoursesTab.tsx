import { useState } from "react";
import { BookOpen, Edit2, Plus, Search, Trash2, Users, X } from "lucide-react";
import type { Course, User } from "../schoolApi";
import {
  apiCreateCourse,
  apiDeleteCourse,
  apiUpdateCourse,
} from "../schoolApi";

interface Props {
  courses: Course[];
  users: User[];
  onRefresh: () => void;
}
const emptyCourse = {
  title: "",
  description: "",
  instructorId: "",
  duration: "1 month",
  fee: "",
  status: "active",
  category: "",
};

export default function CoursesTab({ courses, users, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [form, setForm] = useState({ ...emptyCourse });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const instructors = users.filter(
    (user) => user.role === "instructor" && user.isActive !== false,
  );
  const filtered = courses.filter((course) =>
    `${course.title} ${course.description}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const openEdit = (course: Course) => {
    setForm({
      title: course.title,
      description: course.description,
      instructorId: course.instructorId,
      duration: course.duration,
      fee: course.fee,
      status: course.status,
      category: course.category || "",
    });
    setError("");
    setEditTarget(course);
  };
  const save = async () => {
    if (!form.title) return setError("Title is required.");
    setSaving(true);
    try {
      if (editTarget) {
        await apiUpdateCourse(editTarget.id, form);
        setEditTarget(null);
      } else {
        await apiCreateCourse(form);
        setShowAdd(false);
      }
      onRefresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to save course.",
      );
    } finally {
      setSaving(false);
    }
  };
  const remove = async (id: string) => {
    if (window.confirm("Delete this course?")) {
      await apiDeleteCourse(id).catch(() => {});
      onRefresh();
    }
  };
  const Modal = ({ title, close }: { title: string; close: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-black">{title}</h2>
          <button onClick={close}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="space-y-3">
          {(
            [
              {
                label: "Course title *",
                key: "title",
                placeholder: "e.g. Business Management",
              },
              {
                label: "Category",
                key: "category",
                placeholder: "e.g. Business",
              },
              {
                label: "Estimated duration",
                key: "duration",
                placeholder: "e.g. 3 months",
              },
              { label: "Tuition fee", key: "fee", placeholder: "e.g. USD 500" },
            ] as const
          ).map((field) => (
            <label
              key={field.key}
              className="block text-xs font-bold uppercase text-gray-500"
            >
              {field.label}
              <input
                value={form[field.key]}
                onChange={(event) =>
                  setForm({ ...form, [field.key]: event.target.value })
                }
                placeholder={field.placeholder}
                className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm font-normal"
              />
            </label>
          ))}
          <label className="block text-xs font-bold uppercase text-gray-500">
            Description
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm font-normal"
              rows={3}
            />
          </label>
          <label className="block text-xs font-bold uppercase text-gray-500">
            Instructor
            <select
              value={form.instructorId}
              onChange={(event) =>
                setForm({ ...form, instructorId: event.target.value })
              }
              className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm font-normal"
            >
              <option value="">Unassigned</option>
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-bold uppercase text-gray-500">
            Status
            <select
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value })
              }
              className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm font-normal"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            onClick={close}
            className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-xl bg-[#d4a017] py-3 text-sm font-black text-[#0f0f0f] disabled:opacity-50"
          >
            {saving ? "Saving…" : editTarget ? "Update" : "Add course"}
          </button>
        </div>
      </div>
    </div>
  );
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[160px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search courses…"
            className="w-full rounded-xl border-2 border-gray-200 py-2.5 pl-9 pr-3 text-sm"
          />
        </div>
        <button
          onClick={() => {
            setForm({ ...emptyCourse });
            setError("");
            setShowAdd(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#d4a017] px-4 py-2.5 text-sm font-bold"
        >
          <Plus className="h-4 w-4" />
          Add course
        </button>
      </div>
      <div className="space-y-4">
        {filtered.map((course) => {
          const instructor = users.find(
            (user) => user.id === course.instructorId,
          );
          return (
            <article
              key={course.id}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-lg bg-[#d4a017]/10 p-2">
                      <BookOpen className="h-4 w-4 text-[#d4a017]" />
                    </div>
                    <h2 className="font-black">{course.title}</h2>
                    {course.category && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {course.category}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${course.status === "active" ? "bg-green-100 text-green-700" : course.status === "archived" ? "bg-gray-100 text-gray-600" : "bg-amber-100 text-amber-700"}`}
                    >
                      {course.status}
                    </span>
                  </div>
                  {course.description && (
                    <p className="mt-2 text-sm text-gray-500">
                      {course.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>Estimated duration: {course.duration}</span>
                    {course.fee && <span>{course.fee}</span>}
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.students.length} enrolled
                    </span>
                    {instructor && <span>Instructor: {instructor.name}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(course)}
                    className="rounded-lg bg-blue-50 p-2 text-blue-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(course.id)}
                    className="rounded-lg bg-red-50 p-2 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        {!filtered.length && (
          <div className="rounded-2xl bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
            No courses found.
          </div>
        )}
      </div>
      {showAdd && <Modal title="Add course" close={() => setShowAdd(false)} />}
      {editTarget && (
        <Modal
          title={`Edit — ${editTarget.title}`}
          close={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
