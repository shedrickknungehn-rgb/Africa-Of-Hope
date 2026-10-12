import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  BarChart2,
  BookOpen,
  ClipboardList,
  Edit2,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  type Course,
  type Enrollment,
  type Grade,
  type User,
  apiCreateGrade,
  apiDeleteGrade,
  apiGetCourses,
  apiGetEnrollments,
  apiGetGrades,
  apiGetUsers,
  apiUpdateCourseMaterials,
  apiUpdateGrade,
  clearSession,
} from "./schoolApi";
import AssessmentsTab from "./admin/AssessmentsTab";

type Tab =
  | "overview"
  | "courses"
  | "roster"
  | "grades"
  | "materials"
  | "assessments";

export default function InstructorDashboard({ user }: { user: User }) {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const load = () => {
    apiGetCourses()
      .then(setCourses)
      .catch(() => {});
    apiGetUsers()
      .then((items) =>
        setStudents(items.filter((item) => item.role === "student")),
      )
      .catch(() => {});
    apiGetEnrollments()
      .then(setEnrollments)
      .catch(() => {});
    apiGetGrades()
      .then(setGrades)
      .catch(() => {});
  };
  useEffect(load, []);
  const myCourses = useMemo(
    () => courses.filter((course) => course.instructorId === user.id),
    [courses, user.id],
  );
  const courseIds = useMemo(
    () => new Set(myCourses.map((course) => course.id)),
    [myCourses],
  );
  const rosterFor = (courseId: string) => {
    const enrolled = new Set(
      enrollments
        .filter(
          (enrollment) =>
            enrollment.courseId === courseId &&
            enrollment.status !== "withdrawn",
        )
        .map((enrollment) => enrollment.studentId),
    );
    return students.filter((student) => enrolled.has(student.id));
  };
  const tabs = [
    { key: "overview" as Tab, label: "Overview", icon: BarChart2 },
    { key: "courses" as Tab, label: "My Courses", icon: BookOpen },
    { key: "roster" as Tab, label: "Course Roster", icon: Users },
    { key: "materials" as Tab, label: "Materials", icon: FileText },
    { key: "assessments" as Tab, label: "Assessments", icon: ClipboardList },
    { key: "grades" as Tab, label: "Grades", icon: GraduationCap },
  ];
  const changeTab = (next: Tab) => {
    setTab(next);
    setSidebarOpen(false);
  };
  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f5f0]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-[#0d3d1a] shadow-2xl transition-transform md:relative md:w-56 md:translate-x-0 md:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          className="absolute right-4 top-4 text-white md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
        <Identity user={user} />
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => changeTab(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${tab === key ? "bg-[#d4a017] font-black text-[#0f0f0f]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
        <Footer
          onSignOut={() => {
            clearSession();
            navigate("/school");
          }}
        />
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 bg-[#0d3d1a] px-4 py-3 text-white md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <span className="flex-1 text-sm font-black">School Portal</span>
          <span className="text-xs text-white/60">
            {user.name.split(" ")[0]}
          </span>
        </div>
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <h1 className="mb-1 text-xl font-black text-[#0f0f0f] sm:text-2xl">
            Welcome, {user.name.split(" ")[0]}
          </h1>
          <p className="mb-6 text-sm text-gray-500">
            Africa of Hope School of Professional Studies
          </p>
          {tab === "overview" && (
            <Overview
              courses={myCourses}
              students={students}
              enrollments={enrollments}
              grades={grades}
              onNavigate={changeTab}
            />
          )}
          {tab === "courses" && (
            <Courses courses={myCourses} rosterFor={rosterFor} />
          )}
          {tab === "roster" && (
            <Roster courses={myCourses} rosterFor={rosterFor} />
          )}
          {tab === "materials" && (
            <Materials
              courses={myCourses}
              onRefresh={() =>
                apiGetCourses()
                  .then(setCourses)
                  .catch(() => {})
              }
            />
          )}
          {tab === "assessments" && (
            <AssessmentsTab
              courses={myCourses}
              users={students}
              currentUser={user}
            />
          )}
          {tab === "grades" && (
            <Grades
              courses={myCourses}
              rosterFor={rosterFor}
              grades={grades}
              onRefresh={() =>
                apiGetGrades()
                  .then(setGrades)
                  .catch(() => {})
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}

function Identity({ user }: { user: User }) {
  return (
    <>
      <div className="border-b border-white/10 p-4 text-center">
        <div className="mx-auto mb-2 w-fit rounded-xl bg-white px-3 py-2">
          <img
            src="/logo-full.png"
            alt="Africa of Hope"
            className="h-9 w-auto"
          />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#d4a017]">
          School Portal
        </p>
      </div>
      <div className="border-b border-white/10 p-3">
        <div className="rounded-xl bg-white/10 p-3">
          <p className="truncate text-sm font-bold text-white">{user.name}</p>
          <span className="mt-1 inline-block rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-300">
            Instructor
          </span>
        </div>
      </div>
    </>
  );
}
function Footer({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="space-y-1 border-t border-white/10 p-3">
      <a
        href="/"
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/60 hover:bg-white/10"
      >
        <Home className="h-4 w-4" />
        Main Website
      </a>
      <button
        onClick={onSignOut}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/60 hover:bg-red-500/10 hover:text-red-300"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );
}
function Overview({
  courses,
  students,
  enrollments,
  grades,
  onNavigate,
}: {
  courses: Course[];
  students: User[];
  enrollments: Enrollment[];
  grades: Grade[];
  onNavigate: (tab: Tab) => void;
}) {
  const count = new Set(
    enrollments
      .filter(
        (enrollment) =>
          courses.some((course) => course.id === enrollment.courseId) &&
          enrollment.status !== "withdrawn",
      )
      .map((enrollment) => enrollment.studentId),
  ).size;
  const stats = [
    { label: "My Courses", value: courses.length, color: "bg-[#1a6b2a]" },
    {
      label: "Students",
      value: count || students.length,
      color: "bg-blue-600",
    },
    {
      label: "Grades logged",
      value: grades.filter((grade) =>
        courses.some((course) => course.id === grade.courseId),
      ).length,
      color: "bg-[#d4a017]",
    },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white p-3 text-center shadow-sm sm:p-6"
          >
            <div
              className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${stat.color}`}
            >
              <BarChart2 className="h-4 w-4 text-white" />
            </div>
            <p className="text-xl font-black sm:text-3xl">{stat.value}</p>
            <p className="text-[10px] font-bold text-gray-600 sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-black">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            onClick={() => onNavigate("materials")}
            className="rounded-xl bg-[#1a6b2a] px-4 py-3 text-left text-sm font-bold text-white"
          >
            Add materials
          </button>
          <button
            onClick={() => onNavigate("assessments")}
            className="rounded-xl bg-[#d4a017] px-4 py-3 text-left text-sm font-bold text-[#0f0f0f]"
          >
            Manage quizzes
          </button>
          <button
            onClick={() => onNavigate("grades")}
            className="rounded-xl bg-blue-600 px-4 py-3 text-left text-sm font-bold text-white"
          >
            Record grades
          </button>
        </div>
      </div>
    </div>
  );
}
function Courses({
  courses,
  rosterFor,
}: {
  courses: Course[];
  rosterFor: (id: string) => User[];
}) {
  if (!courses.length)
    return <Empty text="No courses are assigned to you yet." />;
  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <article key={course.id} className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-black">{course.title}</h2>
          <p className="mt-1 text-sm text-gray-500">{course.description}</p>
          <p className="mt-3 text-xs text-gray-400">
            Estimated duration: {course.duration} ·{" "}
            {rosterFor(course.id).length} students
          </p>
        </article>
      ))}
    </div>
  );
}
function Roster({
  courses,
  rosterFor,
}: {
  courses: Course[];
  rosterFor: (id: string) => User[];
}) {
  if (!courses.length) return <Empty text="No course roster is available." />;
  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <section key={course.id} className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-black">{course.title}</h2>
          {rosterFor(course.id).length ? (
            <div className="space-y-2">
              {rosterFor(course.id).map((student) => (
                <div key={student.id} className="rounded-xl bg-[#f7f5f0] p-3">
                  <p className="font-bold">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.email}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              No students are enrolled yet.
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
function Materials({
  courses,
  onRefresh,
}: {
  courses: Course[];
  onRefresh: () => void;
}) {
  const [target, setTarget] = useState(courses[0]?.id || "");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!target && courses[0]) setTarget(courses[0].id);
  }, [courses, target]);
  const course = courses.find((item) => item.id === target);
  const save = async () => {
    if (!course || !title.trim())
      return setError("Choose a course and enter a material title.");
    try {
      await apiUpdateCourseMaterials(course.id, [
        ...course.materials,
        { title: title.trim(), url: url.trim() },
      ]);
      setTitle("");
      setUrl("");
      setError("");
      onRefresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to save material.",
      );
    }
  };
  const remove = async (index: number) => {
    if (!course || !window.confirm("Remove this material?")) return;
    try {
      await apiUpdateCourseMaterials(
        course.id,
        course.materials.filter((_, itemIndex) => itemIndex !== index),
      );
      onRefresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to remove material.",
      );
    }
  };
  if (!courses.length)
    return <Empty text="No courses are assigned to you yet." />;
  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-black">Add course material</h2>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className="rounded-xl border border-gray-200 p-3 text-sm"
          >
            {courses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Material title"
            className="rounded-xl border border-gray-200 p-3 text-sm"
          />
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Link / URL (optional)"
            className="rounded-xl border border-gray-200 p-3 text-sm"
          />
        </div>
        <button
          onClick={save}
          className="mt-3 rounded-xl bg-[#1a6b2a] px-4 py-2.5 text-sm font-bold text-white"
        >
          Save material
        </button>
      </section>
      {course && (
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-black">{course.title}</h2>
          {course.materials.length ? (
            <div className="mt-3 space-y-2">
              {course.materials.map((material, index) => (
                <div
                  key={`${material.title}-${index}`}
                  className="flex items-center gap-3 rounded-xl bg-[#f7f5f0] p-3"
                >
                  <FileText className="h-4 w-4 shrink-0 text-[#1a6b2a]" />
                  {material.url ? (
                    <a
                      href={material.url}
                      className="min-w-0 flex-1 truncate text-sm font-bold text-[#1a6b2a]"
                    >
                      {material.title}
                    </a>
                  ) : (
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">
                      {material.title}
                    </span>
                  )}
                  <button
                    onClick={() => remove(index)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${material.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-400">No materials yet.</p>
          )}
        </section>
      )}
    </div>
  );
}

function Grades({
  courses,
  rosterFor,
  grades,
  onRefresh,
}: {
  courses: Course[];
  rosterFor: (id: string) => User[];
  grades: Grade[];
  onRefresh: () => void;
}) {
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [form, setForm] = useState({
    studentId: "",
    assessment: "",
    score: "",
    maxScore: "100",
    weight: "",
    comment: "",
  });
  const [editing, setEditing] = useState<Grade | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!courseId && courses[0]) setCourseId(courses[0].id);
  }, [courses, courseId]);
  const reset = () => {
    setForm({
      studentId: "",
      assessment: "",
      score: "",
      maxScore: "100",
      weight: "",
      comment: "",
    });
    setEditing(null);
  };
  const save = async () => {
    if (!courseId || !form.studentId || !form.assessment)
      return setMessage(
        "Choose a course and student, then name the assessment.",
      );
    try {
      if (editing)
        await apiUpdateGrade(editing.id, {
          assessment: form.assessment,
          score: form.score,
          maxScore: form.maxScore,
          weight: form.weight,
          comment: form.comment,
        });
      else await apiCreateGrade({ courseId, ...form });
      setMessage(editing ? "Grade updated." : "Grade recorded.");
      reset();
      onRefresh();
    } catch (reason) {
      setMessage(
        reason instanceof Error ? reason.message : "Unable to save grade.",
      );
    }
  };
  const edit = (grade: Grade) => {
    setCourseId(grade.courseId);
    setForm({
      studentId: grade.studentId,
      assessment: grade.assessment,
      score: grade.score,
      maxScore: grade.maxScore,
      weight: grade.weight || "",
      comment: grade.comment || "",
    });
    setEditing(grade);
    setMessage("");
  };
  const remove = async (id: string) => {
    if (!window.confirm("Delete this grade?")) return;
    try {
      await apiDeleteGrade(id);
      setMessage("Grade deleted.");
      onRefresh();
    } catch (reason) {
      setMessage(
        reason instanceof Error ? reason.message : "Unable to delete grade.",
      );
    }
  };
  const courseGrades = grades.filter((grade) => grade.courseId === courseId);
  if (!courses.length)
    return <Empty text="No courses are assigned to you yet." />;
  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-black">
            {editing ? "Edit grade" : "Record grade"}
          </h2>
          <select
            value={courseId}
            onChange={(event) => {
              setCourseId(event.target.value);
              reset();
            }}
            className="rounded-xl border border-gray-200 p-2 text-sm"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        {message && <p className="mb-3 text-sm text-gray-600">{message}</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <select
            value={form.studentId}
            disabled={Boolean(editing)}
            onChange={(event) =>
              setForm({ ...form, studentId: event.target.value })
            }
            className="rounded-xl border border-gray-200 p-3 text-sm"
          >
            <option value="">Choose student</option>
            {rosterFor(courseId).map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
          <input
            value={form.assessment}
            onChange={(event) =>
              setForm({ ...form, assessment: event.target.value })
            }
            placeholder="Assessment"
            className="rounded-xl border border-gray-200 p-3 text-sm"
          />
          <div className="flex gap-2">
            <input
              value={form.score}
              onChange={(event) =>
                setForm({ ...form, score: event.target.value })
              }
              placeholder="Score"
              className="min-w-0 flex-1 rounded-xl border border-gray-200 p-3 text-sm"
            />
            <input
              value={form.maxScore}
              onChange={(event) =>
                setForm({ ...form, maxScore: event.target.value })
              }
              placeholder="Max"
              className="w-20 rounded-xl border border-gray-200 p-3 text-sm"
            />
          </div>
          <input
            value={form.weight}
            onChange={(event) =>
              setForm({ ...form, weight: event.target.value })
            }
            placeholder="Weight (optional)"
            className="rounded-xl border border-gray-200 p-3 text-sm"
          />
          <input
            value={form.comment}
            onChange={(event) =>
              setForm({ ...form, comment: event.target.value })
            }
            placeholder="Comment (optional)"
            className="rounded-xl border border-gray-200 p-3 text-sm lg:col-span-2"
          />
        </div>
        <div className="mt-3 flex gap-3">
          <button
            onClick={save}
            className="rounded-xl bg-[#1a6b2a] px-4 py-2.5 text-sm font-bold text-white"
          >
            {editing ? "Update grade" : "Save grade"}
          </button>
          {editing && (
            <button
              onClick={reset}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </section>
      <section className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f5f0] text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Assessment</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Weight</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {courseGrades.map((grade) => (
              <tr key={grade.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  {grade.studentName ||
                    rosterFor(grade.courseId).find(
                      (student) => student.id === grade.studentId,
                    )?.name ||
                    grade.studentId}
                </td>
                <td className="px-4 py-3">
                  <span>{grade.assessment}</span>
                  {grade.comment && (
                    <span className="block text-xs text-gray-400">
                      {grade.comment}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-bold text-[#1a6b2a]">
                  {grade.score}/{grade.maxScore}
                </td>
                <td className="px-4 py-3">{grade.weight || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => edit(grade)}
                    className="mr-2 rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(grade.id)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!courseGrades.length && (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-sm text-gray-400"
                >
                  No grades recorded for this course yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
      {text}
    </div>
  );
}
