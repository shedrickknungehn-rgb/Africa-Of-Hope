import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  BarChart2,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import {
  type Course,
  type Enrollment,
  type Grade,
  type User,
  apiCreateGrade,
  apiGetCourses,
  apiGetEnrollments,
  apiGetGrades,
  apiGetUsers,
  apiUpdateCourseMaterials,
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
  const save = async () => {
    const course = courses.find((item) => item.id === target);
    if (!course || !title || !url)
      return setError("Choose a course and enter a title and link.");
    try {
      await apiUpdateCourseMaterials(course.id, [
        ...course.materials,
        { title, url },
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
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
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
            placeholder="https://…"
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
      {courses.map((course) => (
        <section key={course.id} className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-black">{course.title}</h2>
          {course.materials.length ? (
            <div className="mt-3 space-y-2">
              {course.materials.map((material) => (
                <a
                  key={`${material.title}-${material.url}`}
                  href={material.url}
                  className="block rounded-xl bg-[#f7f5f0] p-3 text-sm font-bold text-[#1a6b2a]"
                >
                  {material.title}
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-400">No materials yet.</p>
          )}
        </section>
      ))}
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
  const [studentId, setStudentId] = useState("");
  const [assessment, setAssessment] = useState("");
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!courseId && courses[0]) setCourseId(courses[0].id);
  }, [courses, courseId]);
  const save = async () => {
    if (!courseId || !studentId || !assessment)
      return setMessage(
        "Choose a course and student, then name the assessment.",
      );
    try {
      await apiCreateGrade({
        courseId,
        studentId,
        assessment,
        score,
        maxScore,
      });
      setAssessment("");
      setScore("");
      setMessage("Grade recorded.");
      onRefresh();
    } catch (reason) {
      setMessage(
        reason instanceof Error ? reason.message : "Unable to save grade.",
      );
    }
  };
  if (!courses.length)
    return <Empty text="No courses are assigned to you yet." />;
  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-black">Record grade</h2>
        {message && <p className="mb-3 text-sm text-gray-600">{message}</p>}
        <div className="grid gap-3 sm:grid-cols-4">
          <select
            value={courseId}
            onChange={(event) => {
              setCourseId(event.target.value);
              setStudentId("");
            }}
            className="rounded-xl border border-gray-200 p-3 text-sm"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <select
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
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
            value={assessment}
            onChange={(event) => setAssessment(event.target.value)}
            placeholder="Assessment"
            className="rounded-xl border border-gray-200 p-3 text-sm"
          />
          <div className="flex gap-2">
            <input
              value={score}
              onChange={(event) => setScore(event.target.value)}
              placeholder="Score"
              className="min-w-0 flex-1 rounded-xl border border-gray-200 p-3 text-sm"
            />
            <input
              value={maxScore}
              onChange={(event) => setMaxScore(event.target.value)}
              placeholder="Max"
              className="w-20 rounded-xl border border-gray-200 p-3 text-sm"
            />
          </div>
        </div>
        <button
          onClick={save}
          className="mt-3 rounded-xl bg-[#1a6b2a] px-4 py-2.5 text-sm font-bold text-white"
        >
          Save grade
        </button>
      </section>
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f5f0] text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Assessment</th>
              <th className="px-4 py-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {grades
              .filter((grade) =>
                courses.some((course) => course.id === grade.courseId),
              )
              .map((grade) => (
                <tr key={grade.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    {grade.studentName ||
                      rosterFor(grade.courseId).find(
                        (student) => student.id === grade.studentId,
                      )?.name ||
                      grade.studentId}
                  </td>
                  <td className="px-4 py-3">{grade.assessment}</td>
                  <td className="px-4 py-3 font-bold text-[#1a6b2a]">
                    {grade.score}/{grade.maxScore}
                  </td>
                </tr>
              ))}
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
