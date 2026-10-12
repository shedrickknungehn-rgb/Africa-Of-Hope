import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  BarChart2,
  BookOpen,
  ClipboardList,
  DollarSign,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import {
  type Course,
  type Enrollment,
  type Grade,
  type Payment,
  type Quiz,
  type QuizSubmission,
  type User,
  apiGetCourses,
  apiGetEnrollments,
  apiGetGrades,
  apiGetMyQuizSubmission,
  apiGetPayments,
  apiGetQuizzes,
  apiSubmitQuiz,
  clearSession,
} from "./schoolApi";

type Tab = "overview" | "courses" | "grades" | "payments" | "assessments";

export default function StudentDashboard({ user }: { user: User }) {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    apiGetCourses()
      .then(setCourses)
      .catch(() => {});
    apiGetEnrollments({ studentId: user.id })
      .then(setEnrollments)
      .catch(() => {});
    apiGetGrades({ studentId: user.id })
      .then(setGrades)
      .catch(() => {});
    apiGetPayments({ studentId: user.id })
      .then(setPayments)
      .catch(() => {});
  }, [user.id]);

  const myCourses = useMemo(() => {
    const ids = new Set(
      enrollments
        .filter((enrollment) => enrollment.status !== "withdrawn")
        .map((enrollment) => enrollment.courseId),
    );
    return courses.filter((course) => ids.has(course.id));
  }, [courses, enrollments]);
  const outstanding = payments.filter(
    (payment) => payment.status === "pending" || payment.status === "overdue",
  ).length;
  const tabs = [
    { key: "overview" as Tab, label: "Overview", icon: BarChart2 },
    { key: "courses" as Tab, label: "My Courses", icon: BookOpen },
    { key: "assessments" as Tab, label: "Assessments", icon: ClipboardList },
    { key: "grades" as Tab, label: "Grades & Transcript", icon: GraduationCap },
    { key: "payments" as Tab, label: "Payments", icon: DollarSign },
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
        <PortalIdentity user={user} label="Student" />
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => changeTab(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${tab === key ? "bg-[#d4a017] font-black text-[#0f0f0f]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
        <PortalFooter
          onSignOut={() => {
            clearSession();
            navigate("/school");
          }}
        />
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader name={user.name} onOpen={() => setSidebarOpen(true)} />
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
              grades={grades}
              outstanding={outstanding}
              onNavigate={changeTab}
            />
          )}
          {tab === "courses" && <CoursesView courses={myCourses} />}
          {tab === "assessments" && (
            <StudentAssessments user={user} courses={myCourses} />
          )}
          {tab === "grades" && (
            <GradesView
              grades={grades}
              courses={courses}
              studentName={user.name}
            />
          )}
          {tab === "payments" && (
            <PaymentsView payments={payments} studentName={user.name} />
          )}
        </div>
      </main>
    </div>
  );
}

function PortalIdentity({ user, label }: { user: User; label: string }) {
  return (
    <>
      <div className="border-b border-white/10 p-4 text-center">
        <div className="mx-auto mb-2 w-fit rounded-xl bg-white px-3 py-2 shadow-md">
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
          <span className="mt-1 inline-block rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-bold text-green-300">
            {label}
          </span>
        </div>
      </div>
    </>
  );
}

function PortalFooter({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="space-y-1 border-t border-white/10 p-3">
      <a
        href="/"
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/60 hover:bg-white/10 hover:text-white"
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

function MobileHeader({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <div className="flex items-center gap-3 bg-[#0d3d1a] px-4 py-3 text-white md:hidden">
      <button onClick={onOpen}>
        <Menu className="h-6 w-6" />
      </button>
      <span className="flex-1 text-sm font-black">School Portal</span>
      <span className="max-w-20 truncate text-xs text-white/60">
        {name.split(" ")[0]}
      </span>
    </div>
  );
}

function Overview({
  courses,
  grades,
  outstanding,
  onNavigate,
}: {
  courses: Course[];
  grades: Grade[];
  outstanding: number;
  onNavigate: (tab: Tab) => void;
}) {
  const stats = [
    { label: "Courses", value: courses.length, color: "bg-[#1a6b2a]" },
    { label: "Grades", value: grades.length, color: "bg-[#d4a017]" },
    {
      label: "Unpaid",
      value: outstanding,
      color: outstanding ? "bg-red-500" : "bg-gray-400",
    },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl bg-white p-3 text-center shadow-sm sm:p-6"
          >
            <div
              className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${color}`}
            >
              <BarChart2 className="h-4 w-4 text-white" />
            </div>
            <p className="text-xl font-black text-[#0f0f0f] sm:text-3xl">
              {value}
            </p>
            <p className="text-[10px] font-bold text-gray-600 sm:text-sm">
              {label}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-black text-[#0f0f0f]">Continue learning</h2>
        {courses.length ? (
          <div className="space-y-3">
            {courses.slice(0, 3).map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-[#f7f5f0] p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#0f0f0f]">
                    {course.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    Estimated duration: {course.duration}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate("courses")}
                  className="rounded-lg bg-[#1a6b2a] px-3 py-2 text-xs font-bold text-white"
                >
                  View materials
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            You are not enrolled in any courses yet. Contact the academy
            administrator to enroll.
          </p>
        )}
      </div>
    </div>
  );
}

function CoursesView({ courses }: { courses: Course[] }) {
  if (!courses.length)
    return (
      <Empty text="You are not enrolled in any courses yet. Contact the academy administrator to enroll." />
    );
  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <article
          key={course.id}
          className="rounded-2xl bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="font-black text-[#0f0f0f]">{course.title}</h2>
          <p className="mt-1 text-sm text-gray-500">{course.description}</p>
          <p className="mt-3 text-xs text-gray-400">
            Estimated duration: {course.duration}
            {course.fee && ` · ${course.fee}`}
          </p>
          {course.materials.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {course.materials.map((material, index) =>
                material.url ? (
                  <a
                    key={`${material.title}-${index}`}
                    href={material.url}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#1a6b2a]/10 px-3 py-2 text-xs font-bold text-[#1a6b2a]"
                  >
                    <FileText className="h-3 w-3" />
                    {material.title}
                  </a>
                ) : (
                  <span
                    key={`${material.title}-${index}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700"
                  >
                    <FileText className="h-3 w-3" />
                    {material.title}
                  </span>
                ),
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-400">
              Materials will be added by your instructor.
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

function GradesView({
  grades,
  courses,
  studentName,
}: {
  grades: Grade[];
  courses: Course[];
  studentName: string;
}) {
  if (!grades.length) return <Empty text="No grades have been recorded yet." />;
  const download = async () => {
    const { exportTranscriptPdf } = await import("./pdf/exportPdf");
    exportTranscriptPdf(studentName, grades, courses);
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={download}
          className="rounded-xl bg-[#0d3d1a] px-4 py-2.5 text-sm font-bold text-white"
        >
          Download transcript
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f5f0] text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Assessment</th>
              <th className="px-4 py-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-bold">
                  {grade.courseTitle ||
                    courses.find((course) => course.id === grade.courseId)
                      ?.title ||
                    "Course"}
                </td>
                <td className="px-4 py-3">{grade.assessment}</td>
                <td className="px-4 py-3 font-bold text-[#1a6b2a]">
                  {grade.score}/{grade.maxScore}
                  {grade.grade && ` (${grade.grade})`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsView({
  payments,
  studentName,
}: {
  payments: Payment[];
  studentName: string;
}) {
  const statusColor: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    overdue: "bg-red-100 text-red-700",
    waived: "bg-gray-100 text-gray-700",
  };
  const download = async (payment: Payment) => {
    const { exportReceiptPdf } = await import("./pdf/exportPdf");
    exportReceiptPdf(payment, studentName);
  };
  const downloadAll = async () => {
    const { exportAllReceiptsPdf } = await import("./pdf/exportPdf");
    exportAllReceiptsPdf(payments, studentName);
  };
  if (!payments.length) return <Empty text="No payment records yet." />;
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={downloadAll}
          className="rounded-xl bg-[#0d3d1a] px-4 py-2.5 text-sm font-bold text-white"
        >
          Download all receipts
        </button>
      </div>
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm"
        >
          <div>
            <p className="font-bold text-[#0f0f0f]">
              {payment.courseTitle || "Course payment"}
            </p>
            <p className="text-sm text-gray-500">
              {payment.amount} ·{" "}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${statusColor[payment.status] || "bg-gray-100 text-gray-700"}`}
              >
                {payment.status}
              </span>
            </p>
          </div>
          <button
            onClick={() => download(payment)}
            className="rounded-xl bg-[#1a6b2a] px-3 py-2 text-xs font-bold text-white"
          >
            Receipt
          </button>
        </div>
      ))}
    </div>
  );
}

function StudentAssessments({
  user: _user,
  courses,
}: {
  user: User;
  courses: Course[];
}) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<
    Record<string, QuizSubmission | null>
  >({});
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    apiGetQuizzes()
      .then(async (items) => {
        const available = items.filter(
          (quiz) =>
            quiz.status === "published" &&
            courses.some((course) => course.id === quiz.courseId),
        );
        const entries = await Promise.all(
          available.map(
            async (quiz) =>
              [
                quiz.id,
                await apiGetMyQuizSubmission(quiz.id).catch(() => null),
              ] as const,
          ),
        );
        if (alive) {
          setQuizzes(available);
          setSubmissions(Object.fromEntries(entries));
        }
      })
      .catch(
        (reason) =>
          alive &&
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to load assessments.",
          ),
      )
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [courses]);
  if (activeQuiz)
    return (
      <QuizTaker
        quiz={activeQuiz}
        onCancel={() => setActiveQuiz(null)}
        onSubmitted={(submission) => {
          setSubmissions((current) => ({
            ...current,
            [activeQuiz.id]: submission,
          }));
          setActiveQuiz(null);
        }}
      />
    );
  if (loading) return <Loading text="Loading assessments…" />;
  if (error) return <ResultState tone="error" text={error} />;
  if (!quizzes.length)
    return (
      <Empty text="No assessments are available for your enrolled courses." />
    );
  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => {
        const submission = submissions[quiz.id];
        const due = quiz.dueDate ? new Date(quiz.dueDate) : null;
        const overdue = Boolean(due && due.getTime() < Date.now());
        const percentage =
          submission && submission.maxScore
            ? Math.round((submission.score / submission.maxScore) * 100)
            : null;
        return (
          <section key={quiz.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-black text-[#0f0f0f]">{quiz.title}</h2>
                <p className="mt-1 text-sm text-gray-500">{quiz.courseTitle}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                  <span>{quiz.questions.length} questions</span>
                  {quiz.timeLimitMins > 0 && (
                    <span>Time limit: {quiz.timeLimitMins} min</span>
                  )}
                  {due && (
                    <span className={overdue ? "font-bold text-red-600" : ""}>
                      Due {due.toLocaleString()}
                      {overdue ? " (overdue)" : ""}
                    </span>
                  )}
                </div>
                {quiz.instructions && (
                  <p className="mt-2 text-sm text-gray-500">
                    {quiz.instructions}
                  </p>
                )}
              </div>
              <div className="text-right">
                {submission && (
                  <p className="mb-2 text-sm font-bold text-[#1a6b2a]">
                    Best score: {submission.score}/{submission.maxScore}
                    {percentage !== null && ` (${percentage}%)`}
                  </p>
                )}
                <button
                  disabled={overdue}
                  onClick={() => setActiveQuiz(quiz)}
                  className="rounded-xl bg-[#1a6b2a] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {submission ? "Retake" : "Start assessment"}
                </button>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function QuizTaker({
  quiz,
  onCancel,
  onSubmitted,
}: {
  quiz: Quiz;
  onCancel: () => void;
  onSubmitted: (submission: QuizSubmission) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quiz.timeLimitMins > 0 ? quiz.timeLimitMins * 60 : null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      onSubmitted(await apiSubmitQuiz(quiz.id, answers));
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to submit assessment.",
      );
      setSubmitting(false);
    }
  };
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      void submit();
      return;
    }
    const timer = window.setTimeout(
      () => setTimeLeft((time) => (time === null ? null : time - 1)),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [timeLeft]);
  const setAnswer = (questionId: string, value: string) =>
    setAnswers((current) => ({ ...current, [questionId]: value }));
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#0d3d1a] p-5 text-white">
        <div>
          <h2 className="font-black">{quiz.title}</h2>
          <p className="text-sm text-white/70">
            {quiz.questions.length} questions
          </p>
        </div>
        {timeLeft !== null && (
          <div
            className={`rounded-xl px-4 py-2 text-lg font-black ${timeLeft <= 60 ? "animate-pulse bg-red-500" : "bg-white/10"}`}
          >
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
        )}
      </header>
      {quiz.questions.map((question, index) => (
        <section
          key={question.id}
          className="rounded-2xl bg-white p-5 shadow-sm"
        >
          <p className="font-bold">
            {index + 1}. {question.text}
          </p>
          {question.type === "mcq" && (
            <div className="mt-3 space-y-2">
              {question.options?.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#f7f5f0] p-3"
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={answers[question.id] === option}
                    onChange={() => setAnswer(question.id, option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}
          {question.type === "true_false" && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {["True", "False"].map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 font-bold ${answers[question.id] === option ? "border-[#1a6b2a] bg-[#1a6b2a]/10" : "border-gray-200"}`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={answers[question.id] === option}
                    onChange={() => setAnswer(question.id, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          )}
          {question.type === "short_answer" && (
            <textarea
              value={answers[question.id] || ""}
              onChange={(event) => setAnswer(question.id, event.target.value)}
              rows={3}
              className="mt-3 w-full rounded-xl border border-gray-200 p-3"
              placeholder="Write your answer…"
            />
          )}
        </section>
      ))}
      {error && <ResultState tone="error" text={error} />}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={submitting}
          className="rounded-xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={() => void submit()}
          disabled={submitting}
          className="flex-1 rounded-xl bg-[#1a6b2a] py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit assessment"}
        </button>
      </div>
    </div>
  );
}
function Loading({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-white p-12 text-center text-sm text-gray-500 shadow-sm">
      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#1a6b2a] border-t-transparent" />
      {text}
    </div>
  );
}
function ResultState({
  tone,
  text,
}: {
  tone: "error" | "success";
  text: string;
}) {
  return (
    <p
      className={`rounded-xl p-3 text-sm ${tone === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
    >
      {text}
    </p>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
      {text}
    </div>
  );
}
