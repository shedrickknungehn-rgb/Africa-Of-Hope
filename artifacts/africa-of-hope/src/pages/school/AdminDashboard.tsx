import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Users, BookOpen, Video, Settings, Plus, Edit, Trash2, Eye, EyeOff, BarChart2, LogOut, Home, X } from "lucide-react";
import { User, Course, getUsers, saveUsers, getCourses, saveCourses, getSessions, generateId, clearSession } from "./schoolData";

type Tab = "overview" | "users" | "courses" | "sessions" | "settings";

export default function AdminDashboard({ user }: { user: User }) {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<User[]>(getUsers());
  const [courses, setCourses] = useState<Course[]>(getCourses());
  const [sessions] = useState(getSessions());
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ username: "", password: "", name: "", email: "", role: "student" as User["role"] });
  const [newCourse, setNewCourse] = useState({ title: "", description: "", duration: "1 month", fee: "", schedule: "" });
  const [showPasswords, setShowPasswords] = useState<string[]>([]);

  const refreshUsers = () => setUsers(getUsers());
  const refreshCourses = () => setCourses(getCourses());

  const addUser = () => {
    const u: User = { ...newUser, id: generateId(), createdAt: new Date().toISOString() };
    const updated = [...users, u];
    saveUsers(updated);
    setUsers(updated);
    setNewUser({ username: "", password: "", name: "", email: "", role: "student" });
    setShowAddUser(false);
  };

  const deleteUser = (id: string) => {
    if (id === user.id) return;
    const updated = users.filter((u) => u.id !== id);
    saveUsers(updated);
    setUsers(updated);
  };

  const addCourse = () => {
    const c: Course = { ...newCourse, id: generateId(), instructorId: "", students: [], materials: [], status: "active", createdAt: new Date().toISOString() };
    const updated = [...courses, c];
    saveCourses(updated);
    setCourses(updated);
    setNewCourse({ title: "", description: "", duration: "1 month", fee: "", schedule: "" });
    setShowAddCourse(false);
  };

  const deleteCourse = (id: string) => {
    const updated = courses.filter((c) => c.id !== id);
    saveCourses(updated);
    setCourses(updated);
  };

  const roleColors: Record<User["role"], string> = {
    admin: "bg-red-100 text-red-700",
    instructor: "bg-blue-100 text-blue-700",
    assistant: "bg-purple-100 text-purple-700",
    student: "bg-green-100 text-green-700",
  };

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: "overview", label: "Overview", icon: BarChart2 },
    { key: "users", label: "Users", icon: Users },
    { key: "courses", label: "Courses", icon: BookOpen },
    { key: "sessions", label: "Live Sessions", icon: Video },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#f7f5f0]">
      {/* Sidebar */}
      <div className="w-60 bg-[#0d3d1a] flex flex-col flex-shrink-0">
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
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === key ? "bg-[#d4a017] text-[#0f0f0f] font-black" : "text-white/70 hover:text-white hover:bg-white/10"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 space-y-1 border-t border-white/10">
          <a href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <Home className="w-4 h-4" />
            Main Website
          </a>
          <button
            onClick={() => { clearSession(); navigate("/school"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-[#0f0f0f]">
              {tabs.find((t) => t.key === tab)?.label}
            </h1>
            <p className="text-gray-500 text-sm">Africa of Hope School of Professional Studies</p>
          </div>

          {/* Overview */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", value: users.length, color: "bg-[#1a6b2a]", sub: `${users.filter((u) => u.role === "student").length} students` },
                  { label: "Active Courses", value: courses.filter((c) => c.status === "active").length, color: "bg-[#d4a017]", sub: "Currently running" },
                  { label: "Live Sessions", value: sessions.filter((s) => s.status === "live").length, color: "bg-blue-600", sub: "In progress" },
                  { label: "Instructors", value: users.filter((u) => u.role === "instructor").length, color: "bg-purple-600", sub: "Teaching staff" },
                ].map(({ label, value, color, sub }) => (
                  <div key={label} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                      <BarChart2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-3xl font-black text-[#0f0f0f] mb-0.5">{value}</div>
                    <div className="text-sm font-bold text-gray-700">{label}</div>
                    <div className="text-xs text-gray-400">{sub}</div>
                  </div>
                ))}
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-black text-[#0f0f0f] mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Add New User", action: () => { setTab("users"); setShowAddUser(true); }, color: "bg-[#1a6b2a]" },
                      { label: "Create New Course", action: () => { setTab("courses"); setShowAddCourse(true); }, color: "bg-[#d4a017]" },
                      { label: "Start Live Class", action: () => navigate("/school/class/general"), color: "bg-blue-600" },
                    ].map(({ label, action, color }) => (
                      <button key={label} onClick={action} className={`w-full ${color} hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all text-left`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-black text-[#0f0f0f] mb-4">Recent Users</h3>
                  <div className="space-y-3">
                    {users.slice(0, 4).map((u) => (
                      <div key={u.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a6b2a]/10 flex items-center justify-center text-[#1a6b2a] font-black text-xs">
                          {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#0f0f0f]">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.username}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${roleColors[u.role]}`}>{u.role}</span>
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
                <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors">
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
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
                            <div className="w-8 h-8 rounded-full bg-[#1a6b2a]/10 flex items-center justify-center text-[#1a6b2a] font-black text-xs">
                              {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <span className="font-bold text-sm text-[#0f0f0f]">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-mono text-sm text-gray-600">{u.username}</td>
                        <td className="px-5 py-3 text-sm text-gray-600">{u.email}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${roleColors[u.role]}`}>{u.role}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gray-500">
                              {showPasswords.includes(u.id) ? u.password : "••••••••"}
                            </span>
                            <button onClick={() => setShowPasswords(showPasswords.includes(u.id) ? showPasswords.filter((id) => id !== u.id) : [...showPasswords, u.id])} className="text-gray-400 hover:text-gray-600">
                              {showPasswords.includes(u.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            {u.id !== user.id && (
                              <button onClick={() => deleteUser(u.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add User Modal */}
              {showAddUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-black text-lg text-[#0f0f0f]">Add New User</h3>
                      <button onClick={() => setShowAddUser(false)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-3">
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
                      <button onClick={() => setShowAddUser(false)} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
                      <button onClick={addUser} disabled={!newUser.name || !newUser.username || !newUser.password} className="flex-1 bg-[#1a6b2a] disabled:bg-gray-200 text-white font-black py-2.5 rounded-xl text-sm transition-colors">Add User</button>
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
                <button onClick={() => setShowAddCourse(true)} className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-bold text-sm px-4 py-2 rounded-xl transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Course
                </button>
              </div>
              <div className="space-y-4">
                {courses.map((course) => {
                  const instructor = users.find((u) => u.id === course.instructorId);
                  return (
                    <div key={course.id} className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-black text-[#0f0f0f]">{course.title}</h3>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${course.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{course.status}</span>
                          </div>
                          <p className="text-gray-500 text-sm mb-3">{course.description}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <span>📅 {course.duration}</span>
                            <span>💰 {course.fee}</span>
                            <span>📚 {course.students.length} students</span>
                            {instructor && <span>👤 {instructor.name}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={() => navigate(`/school/class/${course.id}`)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                            <Video className="w-3 h-3" />
                            Start Class
                          </button>
                          <button onClick={() => deleteCourse(course.id)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {showAddCourse && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-black text-lg text-[#0f0f0f]">Add New Course</h3>
                      <button onClick={() => setShowAddCourse(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-3">
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
                          <option>1 month</option>
                          <option>3 months</option>
                          <option>6 months</option>
                          <option>9 months</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button onClick={() => setShowAddCourse(false)} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
                      <button onClick={addCourse} disabled={!newCourse.title} className="flex-1 bg-[#d4a017] disabled:bg-gray-200 text-[#0f0f0f] font-black py-2.5 rounded-xl text-sm">Add Course</button>
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
                <p className="text-gray-500 text-sm">{sessions.length} sessions recorded</p>
                <button onClick={() => navigate("/school/class/general")} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors">
                  <Video className="w-4 h-4" />
                  Start New Session
                </button>
              </div>
              <div className="space-y-3">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="font-black text-[#0f0f0f]">{course.title}</p>
                      <p className="text-gray-500 text-sm">{course.schedule}</p>
                    </div>
                    <button onClick={() => navigate(`/school/class/${course.id}`)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors">
                      <Video className="w-4 h-4" />
                      Start
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {tab === "settings" && (
            <div className="max-w-xl space-y-5">
              {[
                { label: "Institution Name", value: "Africa of Hope School of Professional Studies", readonly: true },
                { label: "Address", value: "RIA Highway, Schiefflin Township, Lower Margibi-County, Liberia", readonly: true },
                { label: "Contact Email", value: "Afrohope033@gmail.com", readonly: true },
                { label: "Phone", value: "+231760599659 / +231776679963", readonly: true },
              ].map(({ label, value, readonly }) => (
                <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">{label}</label>
                  <input type="text" defaultValue={value} readOnly={readonly} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-700" />
                </div>
              ))}
              <div className="bg-[#0d3d1a] rounded-2xl p-5 text-white">
                <h3 className="font-black mb-2">System Information</h3>
                <p className="text-white/60 text-sm">Africa of Hope Inc School Management System v1.0</p>
                <p className="text-white/60 text-sm">Built with open-source technologies. WebRTC conferencing powered by Jitsi Meet.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
