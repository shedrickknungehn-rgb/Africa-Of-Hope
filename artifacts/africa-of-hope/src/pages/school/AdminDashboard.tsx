import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Users, BookOpen, Video, Settings, Plus, Trash2, Eye, EyeOff, BarChart2, LogOut, Home, X, Menu } from "lucide-react";
import {
  User, Course,
  apiGetUsers, apiCreateUser, apiDeleteUser,
  apiGetCourses, apiCreateCourse, apiDeleteCourse,
  apiGetSessions, clearSession,
} from "./schoolApi";

type Tab = "overview" | "users" | "courses" | "sessions" | "settings";

export default function AdminDashboard({ user }: { user: User }) {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "", name: "", email: "", role: "student" as User["role"] });
  const [newCourse, setNewCourse] = useState({ title: "", description: "", duration: "1 month", fee: "", schedule: "" });
  const [showPasswords, setShowPasswords] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [u, c, s] = await Promise.all([apiGetUsers(), apiGetCourses(), apiGetSessions()]);
      setUsers(u);
      setCourses(c);
      setSessionCount(s.filter((x) => x.status === "live").length);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addUser = async () => {
    if (!newUser.name || !newUser.username || !newUser.password) return;
    setSaving(true); setError("");
    try {
      const u = await apiCreateUser(newUser);
      setUsers((prev) => [...prev, u]);
      setNewUser({ username: "", password: "", name: "", email: "", role: "student" });
      setShowAddUser(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create user");
    } finally { setSaving(false); }
  };

  const deleteUser = async (id: string) => {
    if (id === user.id) return;
    await apiDeleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const addCourse = async () => {
    if (!newCourse.title) return;
    setSaving(true);
    try {
      const c = await apiCreateCourse({ ...newCourse, instructorId: "", status: "active" });
      setCourses((prev) => [...prev, c]);
      setNewCourse({ title: "", description: "", duration: "1 month", fee: "", schedule: "" });
      setShowAddCourse(false);
    } catch { /* silent */ } finally { setSaving(false); }
  };

  const deleteCourse = async (id: string) => {
    await apiDeleteCourse(id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const changeTab = (t: Tab) => {
    setTab(t);
    setSidebarOpen(false);
  };

  const roleColors: Record<User["role"], string> = {
    admin: "bg-red-100 text-red-700",
    instructor: "bg-blue-100 text-blue-700",
    assistant: "bg-purple-100 text-purple-700",
    student: "bg-green-100 text-green-700",
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: BarChart2 },
    { key: "users", label: "Users", icon: Users },
    { key: "courses", label: "Courses", icon: BookOpen },
    { key: "sessions", label: "Live Sessions", icon: Video },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-[#0d3d1a]">
      <div className="p-5 border-b border-white/10">
        <img src="/logo.png" alt="AOH" className="w-12 h-12 object-contain mx-auto mb-2" />
        <p className="text-white font-black text-sm text-center leading-tight">Africa of Hope Inc</p>
        <p className="text-[#d4a017] text-xs text-center">School Portal</p>
      </div>
      <div className="p-3 border-b border-white/10">
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-white font-bold text-sm">{user.name}</p>
          <span className="inline-block bg-red-500/20 text-red-300 text-xs font-bold px-2 py-0.5 rounded-full uppercase mt-0.5">Admin</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => changeTab(key)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors touch-manipulation ${tab === key ? "bg-[#d4a017] text-[#0f0f0f] font-black" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />{label}
          </button>
        ))}
      </nav>
      <div className="p-3 space-y-1 border-t border-white/10">
        <a href="/" className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors touch-manipulation">
          <Home className="w-4 h-4" />Main Website
        </a>
        <button onClick={() => { clearSession(); navigate("/school"); }}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-colors touch-manipulation">
          <LogOut className="w-4 h-4" />Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f7f5f0] overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 z-40 flex flex-col shadow-2xl
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:z-auto md:w-60 md:flex-shrink-0 md:shadow-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Mobile close button */}
        <button
          className="absolute top-4 right-4 z-50 text-white/70 hover:text-white md:hidden p-1"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top header */}
        <div className="md:hidden flex items-center gap-3 bg-[#0d3d1a] px-4 py-3 flex-shrink-0 shadow-lg">
          <button onClick={() => setSidebarOpen(true)} className="text-white p-1 touch-manipulation" aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>
          <img src="/logo.png" alt="AOH" className="w-8 h-8 object-contain" />
          <div className="flex-1 min-w-0">
            <span className="text-white font-black text-sm">AOH School Portal</span>
          </div>
          <span className="text-white/60 text-xs truncate max-w-[100px]">{user.name.split(" ")[0]}</span>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-black text-[#0f0f0f]">{tabs.find((t) => t.key === tab)?.label}</h1>
              <p className="text-gray-500 text-sm">Africa of Hope School of Professional Studies</p>
            </div>

            {/* Overview */}
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { label: "Total Users", value: users.length, color: "bg-[#1a6b2a]", sub: `${users.filter((u) => u.role === "student").length} students` },
                    { label: "Active Courses", value: courses.filter((c) => c.status === "active").length, color: "bg-[#d4a017]", sub: "Currently running" },
                    { label: "Live Sessions", value: sessionCount, color: "bg-blue-600", sub: "In progress" },
                    { label: "Instructors", value: users.filter((u) => u.role === "instructor").length, color: "bg-purple-600", sub: "Teaching staff" },
                  ].map(({ label, value, color, sub }) => (
                    <div key={label} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                        <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-[#0f0f0f] mb-0.5">{value}</div>
                      <div className="text-xs sm:text-sm font-bold text-gray-700">{label}</div>
                      <div className="text-xs text-gray-400 hidden sm:block">{sub}</div>
                    </div>
                  ))}
                </div>
                <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                    <h3 className="font-black text-[#0f0f0f] mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Add New User", action: () => { setTab("users"); setShowAddUser(true); }, color: "bg-[#1a6b2a]" },
                        { label: "Create New Course", action: () => { setTab("courses"); setShowAddCourse(true); }, color: "bg-[#d4a017]" },
                        { label: "Start Live Class", action: () => navigate("/school/class/general"), color: "bg-blue-600" },
                      ].map(({ label, action, color }) => (
                        <button key={label} onClick={action} className={`w-full ${color} hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all text-left touch-manipulation`}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                    <h3 className="font-black text-[#0f0f0f] mb-4">Recent Users</h3>
                    <div className="space-y-3">
                      {users.slice(0, 4).map((u) => (
                        <div key={u.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1a6b2a]/10 flex items-center justify-center text-[#1a6b2a] font-black text-xs flex-shrink-0">
                            {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#0f0f0f] truncate">{u.name}</p>
                            <p className="text-xs text-gray-400 truncate">{u.username}</p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${roleColors[u.role]}`}>{u.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users */}
            {tab === "users" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-500 text-sm">{users.length} total users</p>
                  <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors touch-manipulation">
                    <Plus className="w-4 h-4" />Add User
                  </button>
                </div>
                {/* Responsive: cards on mobile, table on md+ */}
                <div className="md:hidden space-y-3">
                  {users.map((u) => (
                    <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#1a6b2a]/10 flex items-center justify-center text-[#1a6b2a] font-black">
                          {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-[#0f0f0f] text-sm truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{u.username}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${roleColors[u.role]}`}>{u.role}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-gray-500 font-mono">
                          <span>{showPasswords.includes(u.id) ? u.password : "••••••••"}</span>
                          <button onClick={() => setShowPasswords(showPasswords.includes(u.id) ? showPasswords.filter((id) => id !== u.id) : [...showPasswords, u.id])}>
                            {showPasswords.includes(u.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {u.id !== user.id && (
                          <button onClick={() => deleteUser(u.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#f7f5f0] border-b border-gray-100">
                          {["Name", "Username", "Email", "Role", "Password", "Actions"].map((h) => (
                            <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b border-gray-50 hover:bg-[#f7f5f0]/50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#1a6b2a]/10 flex items-center justify-center text-[#1a6b2a] font-black text-xs">{u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
                                <span className="font-bold text-sm text-[#0f0f0f]">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 font-mono text-sm text-gray-600">{u.username}</td>
                            <td className="px-5 py-3 text-sm text-gray-600">{u.email}</td>
                            <td className="px-5 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${roleColors[u.role]}`}>{u.role}</span></td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-gray-500">{showPasswords.includes(u.id) ? u.password : "••••••••"}</span>
                                <button onClick={() => setShowPasswords(showPasswords.includes(u.id) ? showPasswords.filter((id) => id !== u.id) : [...showPasswords, u.id])} className="text-gray-400 hover:text-gray-600">
                                  {showPasswords.includes(u.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              {u.id !== user.id && (
                                <button onClick={() => deleteUser(u.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {showAddUser && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-black text-lg text-[#0f0f0f]">Add New User</h3>
                        <button onClick={() => setShowAddUser(false)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><X className="w-4 h-4" /></button>
                      </div>
                      {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
                      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {[
                          { label: "Full Name", key: "name", type: "text", placeholder: "e.g. John Smith" },
                          { label: "Username", key: "username", type: "text", placeholder: "e.g. jsmith" },
                          { label: "Email", key: "email", type: "email", placeholder: "user@email.com" },
                          { label: "Password", key: "password", type: "password", placeholder: "Set a password" },
                        ].map(({ label, key, type, placeholder }) => (
                          <div key={key}>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">{label}</label>
                            <input type={type} placeholder={placeholder} value={(newUser as Record<string, string>)[key]}
                              onChange={(e) => setNewUser({ ...newUser, [key]: e.target.value })}
                              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
                          </div>
                        ))}
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Role</label>
                          <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User["role"] })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none">
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                            <option value="assistant">Assistant</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-5">
                        <button onClick={() => setShowAddUser(false)} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm">Cancel</button>
                        <button onClick={addUser} disabled={saving || !newUser.name || !newUser.username || !newUser.password} className="flex-1 bg-[#1a6b2a] disabled:bg-gray-200 text-white font-black py-3 rounded-xl text-sm transition-colors">
                          {saving ? "Saving…" : "Add User"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Courses */}
            {tab === "courses" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-500 text-sm">{courses.length} courses</p>
                  <button onClick={() => setShowAddCourse(true)} className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-bold text-sm px-4 py-2.5 rounded-xl transition-colors touch-manipulation">
                    <Plus className="w-4 h-4" />Add Course
                  </button>
                </div>
                <div className="space-y-4">
                  {courses.map((course) => {
                    const instructor = users.find((u) => u.id === course.instructorId);
                    return (
                      <div key={course.id} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-black text-[#0f0f0f]">{course.title}</h3>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${course.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{course.status}</span>
                            </div>
                            <p className="text-gray-500 text-sm mb-3">{course.description}</p>
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              <span>📅 {course.duration}</span>
                              <span>💰 {course.fee}</span>
                              <span>📚 {course.students.length} students</span>
                              {instructor && <span>👤 {instructor.name}</span>}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button onClick={() => navigate(`/school/class/${course.id}`)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors touch-manipulation">
                              <Video className="w-3 h-3" />Start
                            </button>
                            <button onClick={() => deleteCourse(course.id)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors touch-manipulation">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {showAddCourse && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-black text-lg text-[#0f0f0f]">Add New Course</h3>
                        <button onClick={() => setShowAddCourse(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {[
                          { label: "Course Title", key: "title", placeholder: "e.g. Certificate in Business" },
                          { label: "Description", key: "description", placeholder: "Brief course description" },
                          { label: "Registration Fee", key: "fee", placeholder: "e.g. $35 registration" },
                          { label: "Schedule", key: "schedule", placeholder: "e.g. Mon, Wed, Fri — 9:00 AM" },
                        ].map(({ label, key, placeholder }) => (
                          <div key={key}>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">{label}</label>
                            <input type="text" placeholder={placeholder} value={(newCourse as Record<string, string>)[key]}
                              onChange={(e) => setNewCourse({ ...newCourse, [key]: e.target.value })}
                              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
                          </div>
                        ))}
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Duration</label>
                          <select value={newCourse.duration} onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none">
                            <option>1 month</option><option>3 months</option><option>6 months</option><option>9 months</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-5">
                        <button onClick={() => setShowAddCourse(false)} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm">Cancel</button>
                        <button onClick={addCourse} disabled={saving || !newCourse.title} className="flex-1 bg-[#d4a017] disabled:bg-gray-200 text-[#0f0f0f] font-black py-3 rounded-xl text-sm">
                          {saving ? "Saving…" : "Add Course"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sessions */}
            {tab === "sessions" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-500 text-sm">{courses.length} courses available</p>
                  <button onClick={() => navigate("/school/class/general")} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors touch-manipulation">
                    <Video className="w-4 h-4" />Start New Session
                  </button>
                </div>
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-black text-[#0f0f0f] truncate">{course.title}</p>
                        <p className="text-gray-500 text-sm">{course.schedule}</p>
                      </div>
                      <button onClick={() => navigate(`/school/class/${course.id}`)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors flex-shrink-0 touch-manipulation">
                        <Video className="w-4 h-4" />Start
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings */}
            {tab === "settings" && (
              <div className="max-w-xl space-y-4">
                {[
                  { label: "Institution Name", value: "Africa of Hope School of Professional Studies" },
                  { label: "Address", value: "RIA Highway, Schiefflin Township, Lower Margibi-County, Liberia" },
                  { label: "Contact Email", value: "Afrohope033@gmail.com" },
                  { label: "Phone", value: "+231760599659 / +231776679963" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">{label}</label>
                    <input type="text" defaultValue={value} readOnly className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-700" />
                  </div>
                ))}
                <div className="bg-[#0d3d1a] rounded-2xl p-5 text-white">
                  <h3 className="font-black mb-2">System Information</h3>
                  <p className="text-white/60 text-sm">Africa of Hope Inc School Management System v2.0</p>
                  <p className="text-white/60 text-sm">Backend: Node.js + Express + PostgreSQL · Frontend: Vite + React · WebRTC: Jitsi Meet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
