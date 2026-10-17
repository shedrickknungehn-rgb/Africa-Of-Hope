import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Send,
  CheckCircle,
} from "lucide-react";
import {
  Course,
  User,
  Quiz,
  QuizQuestion,
  QuizSubmission,
  apiGetQuizzes,
  apiCreateQuiz,
  apiUpdateQuiz,
  apiDeleteQuiz,
  apiGetQuizSubmissions,
} from "../schoolApi";

type QType = "mcq" | "true_false" | "short_answer";

const BLANK_QUIZ: {
  courseId: string;
  title: string;
  instructions: string;
  dueDate: string;
  timeLimitMins: number;
  status: "draft" | "published";
} = {
  courseId: "",
  title: "",
  instructions: "",
  dueDate: "",
  timeLimitMins: 0,
  status: "draft",
};
const BLANK_Q: Omit<QuizQuestion, "id"> = {
  type: "mcq",
  text: "",
  options: ["", "", "", ""],
  correct: "",
};

function genQId() {
  return Math.random().toString(36).slice(2);
}

export default function AssessmentsTab({
  courses,
  users,
  currentUser,
}: {
  courses: Course[];
  users: User[];
  currentUser: User;
}) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [modal, setModal] = useState(false);
  const [editQuiz, setEditQuiz] = useState<Quiz | null>(null);
  const [form, setForm] = useState(BLANK_QUIZ);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  const [submissionsFor, setSubmissionsFor] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [subLoading, setSubLoading] = useState(false);

  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);

  const isMgmt =
    currentUser.role === "admin" || currentUser.role === "super_admin";

  const myCourses = useMemo(() => {
    if (isMgmt) return courses;
    return courses.filter((c) => c.instructorId === currentUser.id);
  }, [courses, currentUser.id, isMgmt]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      setQuizzes(await apiGetQuizzes());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    }
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditQuiz(null);
    setForm({ ...BLANK_QUIZ, courseId: myCourses[0]?.id || "" });
    setQuestions([]);
    setFormErr("");
    setModal(true);
  };

  const openEdit = (q: Quiz) => {
    setEditQuiz(q);
    setForm({
      courseId: q.courseId,
      title: q.title,
      instructions: q.instructions,
      dueDate: q.dueDate ? q.dueDate.slice(0, 16) : "",
      timeLimitMins: q.timeLimitMins,
      status: q.status,
    });
    setQuestions(
      q.questions.map((qq) => ({
        ...qq,
        options: qq.options || ["", "", "", ""],
      })),
    );
    setFormErr("");
    setModal(true);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { ...BLANK_Q, id: genQId(), options: ["", "", "", ""] },
    ]);
  };

  const removeQuestion = (idx: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== idx));

  const updateQ = (idx: number, patch: Partial<QuizQuestion>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)),
    );
  };

  const updateOption = (qIdx: number, oIdx: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options!.map((o, j) => (j === oIdx ? val : o)) }
          : q,
      ),
    );
  };

  const save = async () => {
    if (!form.courseId || !form.title) {
      setFormErr("Course and title required");
      return;
    }
    setSaving(true);
    setFormErr("");
    try {
      const payload = {
        courseId: form.courseId,
        title: form.title,
        instructions: form.instructions,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        timeLimitMins: form.timeLimitMins,
        status: form.status,
        questions: questions.map((q) => ({
          ...q,
          options:
            q.type === "mcq" ? (q.options || []).filter(Boolean) : undefined,
          correct: q.type === "short_answer" ? undefined : q.correct,
        })),
        createdBy: currentUser.id,
      };
      if (editQuiz) {
        const updated = await apiUpdateQuiz(editQuiz.id, payload);
        setQuizzes((prev) =>
          prev.map((q) => (q.id === editQuiz.id ? updated : q)),
        );
      } else {
        const created = await apiCreateQuiz(payload);
        setQuizzes((prev) => [created, ...prev]);
      }
      setModal(false);
    } catch (e) {
      setFormErr(e instanceof Error ? e.message : "Failed to save");
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    await apiDeleteQuiz(id).catch(() => {});
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  };

  const togglePublish = async (quiz: Quiz) => {
    const newStatus = quiz.status === "published" ? "draft" : "published";
    try {
      const updated = await apiUpdateQuiz(quiz.id, { status: newStatus });
      setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? updated : q)));
    } catch {}
  };

  const viewSubmissions = async (quizId: string) => {
    if (submissionsFor === quizId) {
      setSubmissionsFor(null);
      return;
    }
    setSubmissionsFor(quizId);
    setSubLoading(true);
    try {
      setSubmissions(await apiGetQuizSubmissions(quizId));
    } catch {
      setSubmissions([]);
    }
    setSubLoading(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#1a6b2a] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );

  return (
    <div className="space-y-5">
      {err && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-bold">
          {err}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-black text-[#0f0f0f]">Assessments</h2>
          <p className="text-gray-500 text-sm">
            {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} total
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#b8890f] text-white font-black px-4 py-2.5 rounded-xl text-sm transition-colors touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          Create Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400">
          <p className="font-bold">No quizzes yet.</p>
          <p className="text-sm mt-1">
            Create a quiz and assign it to a course.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-black text-[#0f0f0f]">
                        {quiz.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${quiz.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {quiz.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{quiz.courseTitle}</p>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                      <span>
                        📝 {quiz.questions.length} question
                        {quiz.questions.length !== 1 ? "s" : ""}
                      </span>
                      {quiz.timeLimitMins > 0 && (
                        <span>⏱ {quiz.timeLimitMins} min</span>
                      )}
                      {quiz.dueDate && (
                        <span>
                          📅 Due {new Date(quiz.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => togglePublish(quiz)}
                      className={`flex items-center gap-1.5 text-xs font-black px-3 py-2 rounded-xl transition-colors touch-manipulation ${quiz.status === "published" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                    >
                      <Send className="w-3 h-3" />
                      {quiz.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => viewSubmissions(quiz.id)}
                      className="flex items-center gap-1.5 text-xs font-black px-3 py-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors touch-manipulation"
                    >
                      <Eye className="w-3 h-3" />
                      Results
                    </button>
                    <button
                      onClick={() => openEdit(quiz)}
                      className="text-gray-300 hover:text-[#1a6b2a] p-1.5 rounded-lg hover:bg-gray-100 touch-manipulation"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(quiz.id)}
                      className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 touch-manipulation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setExpandedQuiz(
                          expandedQuiz === quiz.id ? null : quiz.id,
                        )
                      }
                      className="text-gray-300 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 touch-manipulation"
                    >
                      {expandedQuiz === quiz.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedQuiz === quiz.id && quiz.questions.length > 0 && (
                  <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                    {quiz.questions.map((q, i) => (
                      <div key={q.id} className="bg-[#f7f5f0] rounded-xl p-3">
                        <p className="text-xs font-black text-gray-500 uppercase mb-1">
                          Q{i + 1} · {q.type.replace("_", " ")}
                        </p>
                        <p className="text-sm font-bold text-[#0f0f0f]">
                          {q.text}
                        </p>
                        {q.options && q.options.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {q.options.map((o, j) => (
                              <li
                                key={j}
                                className={`text-xs px-2 py-1 rounded-lg ${o === q.correct ? "bg-green-100 text-green-700 font-bold" : "text-gray-500"}`}
                              >
                                {o === q.correct && (
                                  <CheckCircle className="w-3 h-3 inline mr-1" />
                                )}
                                {o}
                              </li>
                            ))}
                          </ul>
                        )}
                        {q.type === "true_false" && (
                          <p className="text-xs mt-1 text-green-700 font-bold">
                            Answer: {q.correct}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {submissionsFor === quiz.id && (
                <div className="border-t border-gray-100 p-4 bg-[#f7f5f0]">
                  <h4 className="text-xs font-black text-gray-500 uppercase mb-3">
                    Submissions
                  </h4>
                  {subLoading ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-[#1a6b2a] border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : submissions.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">
                      No submissions yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-500 uppercase">
                            <th className="text-left pb-2">Student</th>
                            <th className="text-left pb-2">Score</th>
                            <th className="text-left pb-2">%</th>
                            <th className="text-left pb-2">Short Answers</th>
                            <th className="text-left pb-2">Submitted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissions.map((s) => {
                            const pct =
                              s.maxScore > 0
                                ? Math.round((s.score / s.maxScore) * 100)
                                : 0;
                            const shortAns = quiz.questions
                              .filter(
                                (qq: QuizQuestion) =>
                                  qq.type === "short_answer",
                              )
                              .map((qq: QuizQuestion) => ({
                                q: qq.text,
                                a: s.answers[qq.id] || "—",
                              }));
                            return (
                              <tr
                                key={s.id}
                                className="border-t border-gray-200 align-top"
                              >
                                <td className="py-2 font-bold text-[#0f0f0f]">
                                  {s.studentName || s.studentId}
                                </td>
                                <td className="py-2 font-mono">
                                  {s.score}/{s.maxScore}
                                </td>
                                <td
                                  className={`py-2 font-bold ${pct >= 70 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`}
                                >
                                  {pct}%
                                </td>
                                <td className="py-2 text-gray-500 text-xs max-w-xs">
                                  {shortAns.length === 0 ? (
                                    <span className="text-gray-300">—</span>
                                  ) : (
                                    shortAns.map(
                                      (
                                        sa: { q: string; a: string },
                                        i: number,
                                      ) => (
                                        <div key={i} className="mb-1">
                                          <span className="font-semibold text-gray-600">
                                            {sa.q}:{" "}
                                          </span>
                                          {sa.a}
                                        </div>
                                      ),
                                    )
                                  )}
                                </td>
                                <td className="py-2 text-gray-400 text-xs whitespace-nowrap">
                                  {new Date(s.submittedAt).toLocaleDateString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <QuizModal
          form={form}
          setForm={setForm}
          questions={questions}
          courses={myCourses}
          saving={saving}
          err={formErr}
          isEdit={!!editQuiz}
          onAddQ={addQuestion}
          onRemoveQ={removeQuestion}
          onUpdateQ={updateQ}
          onUpdateOption={updateOption}
          onSave={save}
          onClose={() => setModal(false)}
        />
      )}
    </div>
  );
}

/* ─── Quiz Modal ──────────────────────────────────────────────── */
function QuizModal({
  form,
  setForm,
  questions,
  courses,
  saving,
  err,
  isEdit,
  onAddQ,
  onRemoveQ,
  onUpdateQ,
  onUpdateOption,
  onSave,
  onClose,
}: {
  form: typeof BLANK_QUIZ;
  setForm: (f: typeof BLANK_QUIZ) => void;
  questions: QuizQuestion[];
  courses: Course[];
  saving: boolean;
  err: string;
  isEdit: boolean;
  onAddQ: () => void;
  onRemoveQ: (i: number) => void;
  onUpdateQ: (i: number, p: Partial<QuizQuestion>) => void;
  onUpdateOption: (qi: number, oi: number, v: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const F =
    (k: keyof typeof BLANK_QUIZ) =>
    (
      e: React.ChangeEvent<
        HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
      >,
    ) =>
      setForm({
        ...form,
        [k]:
          k === "timeLimitMins"
            ? Number(e.target.value)
            : (e.target.value as never),
      });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h3 className="font-black text-[#0f0f0f]">
            {isEdit ? "Edit" : "Create"} Quiz
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Course *
              </label>
              <select
                value={form.courseId}
                onChange={F("courseId")}
                className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
              >
                <option value="">Select course…</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={F("status")}
                className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              Title *
            </label>
            <input
              value={form.title}
              onChange={F("title")}
              placeholder="e.g. Midterm Quiz"
              className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              Instructions
            </label>
            <textarea
              value={form.instructions}
              onChange={F("instructions")}
              rows={2}
              placeholder="Optional instructions for students…"
              className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={F("dueDate")}
                className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Time Limit (mins, 0=none)
              </label>
              <input
                type="number"
                min={0}
                value={form.timeLimitMins}
                onChange={F("timeLimitMins")}
                className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Questions ({questions.length})
              </label>
              <button
                onClick={onAddQ}
                className="flex items-center gap-1.5 text-xs font-black text-[#1a6b2a] hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors touch-manipulation"
              >
                <Plus className="w-3 h-3" />
                Add Question
              </button>
            </div>
            <div className="space-y-4">
              {questions.map((q, i) => (
                <QuestionEditor
                  key={q.id}
                  q={q}
                  idx={i}
                  onUpdate={(p) => onUpdateQ(i, p)}
                  onUpdateOption={(oi, v) => onUpdateOption(i, oi, v)}
                  onRemove={() => onRemoveQ(i)}
                />
              ))}
            </div>
          </div>

          {err && <p className="text-red-600 text-sm font-bold">{err}</p>}
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-2.5 rounded-xl text-sm touch-manipulation"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 bg-[#0d3d1a] hover:bg-[#155a22] disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-sm touch-manipulation"
          >
            {saving ? "Saving…" : isEdit ? "Update Quiz" : "Create Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionEditor({
  q,
  idx,
  onUpdate,
  onUpdateOption,
  onRemove,
}: {
  q: QuizQuestion;
  idx: number;
  onUpdate: (p: Partial<QuizQuestion>) => void;
  onUpdateOption: (oi: number, v: string) => void;
  onRemove: () => void;
}) {
  const typeLabel: Record<QType, string> = {
    mcq: "Multiple Choice",
    true_false: "True / False",
    short_answer: "Short Answer",
  };

  return (
    <div className="bg-[#f7f5f0] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-black text-gray-400 uppercase">
          Q{idx + 1}
        </span>
        <div className="flex items-center gap-2">
          <select
            value={q.type}
            onChange={(e) =>
              onUpdate({
                type: e.target.value as QType,
                correct: "",
                options:
                  e.target.value === "mcq" ? ["", "", "", ""] : undefined,
              })
            }
            className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 font-bold"
          >
            {(["mcq", "true_false", "short_answer"] as QType[]).map((t) => (
              <option key={t} value={t}>
                {typeLabel[t]}
              </option>
            ))}
          </select>
          <button
            onClick={onRemove}
            className="text-gray-300 hover:text-red-500 p-1 touch-manipulation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <input
        value={q.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        placeholder="Question text…"
        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
      />

      {q.type === "mcq" && (
        <div className="space-y-2">
          {(q.options || ["", "", "", ""]).map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${q.id}`}
                checked={q.correct === opt && opt !== ""}
                onChange={() => opt && onUpdate({ correct: opt })}
                className="flex-shrink-0 accent-[#1a6b2a]"
              />
              <input
                value={opt}
                onChange={(e) => onUpdateOption(oi, e.target.value)}
                placeholder={`Option ${oi + 1}`}
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
              />
            </div>
          ))}
          <p className="text-[10px] text-gray-400">
            Select the radio button next to the correct answer.
          </p>
        </div>
      )}

      {q.type === "true_false" && (
        <div className="flex gap-3">
          {["True", "False"].map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`tf-${q.id}`}
                checked={q.correct === opt}
                onChange={() => onUpdate({ correct: opt })}
                className="accent-[#1a6b2a]"
              />
              <span className="text-sm font-bold">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {q.type === "short_answer" && (
        <p className="text-xs text-gray-400 italic">
          Students will write a text response. Manual grading required.
        </p>
      )}
    </div>
  );
}
