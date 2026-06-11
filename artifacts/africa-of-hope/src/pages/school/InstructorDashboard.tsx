import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, Users, Video, FileText, LogOut, Home, BarChart2, Menu, X } from "lucide-react";
import { User, Course, apiGetCourses, apiGetUsers, clearSession } from "./schoolApi";

type Tab = "overview" | "courses" | "students" | "start-class";

export default function InstructorDashboard({ user }: { user: User }) {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  useEffect(() => {
    apiGetCourses().then(setCourses).catch(() => {});
    apiGetUsers().then((users) => setStudents(users.filter((u) => u.role === "student"))).catch(() => {});
  }, []);

  const tabs = [
    { key: "overview" as Tab, label: "Overview", icon: BarChart2 },
    { key: "courses" as Tab, label: "My Courses", icon: BookOpen },
    { key: "students" as Tab, label: "Students", icon: Users },
    { key: "start-class" as Tab, label: "Start Live Class", icon: Video },
  ];

  const changeTab = (t: Tab) => {
    setTab(t);
    setSidebarOpen(false);
  };

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-[#0d3d1a]">
      <div className="p-4 border-b border-white/10">
        <div className="bg-white rounded-xl px-3 py-2 mx-auto w-fit mb-2 shadow-md">
          <img src="/logo-full.png" alt="Africa of Hope Inc" className="h-9 w-auto object-contain" />
        </div>
        <p className="text-[#d4a017] text-[10px] text-center font-bold tracking-widest uppercase mt-1">School Portal</p>
      </div>
      <div className="p-3 border-b border-white/10">
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-white font-bold text-sm">{user.name}</p>
          <span className="inline-block bg-blue-500/20 text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full uppercase mt-0.5">
            {user.role === "assistant" ? "Assistant" : "Instructor"}
          </span>
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
      <div className="p-3 border-t border-white/10 space-y-1">
        <a href="/" className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors touch-manipulation"><Home className="w-4 h-4" />Main Website</a>
        <button onClick={() => { clearSession(); navigate("/school"); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-colors touch-manipulation"><LogOut className="w-4 h-4" />Sign Out</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f7f5f0] overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 z-40 shadow-2xl
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:z-auto md:w-56 md:flex-shrink-0 md:shadow-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <button className="absolute top-4 right-4 z-50 text-white/70 hover:text-white md:hidden p-1" onClick={() => setSidebarOpen(false)}>
          <X className="w-5 h-5" />
        </button>
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 bg-[#0d3d1a] px-4 py-3 flex-shrink-0 shadow-lg">
          <button onClick={() => setSidebarOpen(true)} className="text-white p-1 touch-manipulation"><Menu className="w-6 h-6" /></button>
          <div className="bg-white rounded-lg px-2 py-1">
            <img src="/logo-full.png" alt="AOH" className="h-6 w-auto object-contain" />
          </div>
          <span className="text-white font-black text-sm flex-1">School Portal</span>
          <span className="text-white/60 text-xs truncate max-w-[80px]">{user.name.split(" ")[0]}</span>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-[#0f0f0f]">Welcome, {user.name.split(" ")[0]}</h1>
            <p className="text-gray-500 text-sm">Africa of Hope School of Professional Studies</p>
          </div>

          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: "My Courses", value: courses.length, color: "bg-[#1a6b2a]" },
                  { label: "Students", value: students.length, color: "bg-blue-600" },
                  { label: "Materials", value: courses.reduce((a, c) => a + c.materials.length, 0), color: "bg-[#d4a017]" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 ${color} rounded-xl flex items-center justify-center mx-auto mb-3`}><BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div>
                    <div className="text-2xl sm:text-3xl font-black text-[#0f0f0f]">{value}</div>
                    <div className="text-xs sm:text-sm font-bold text-gray-600">{label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                <h3 className="font-black text-[#0f0f0f] mb-4">Quick Actions</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button onClick={() => changeTab("start-class")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all text-left touch-manipulation">▶ Start Live Class</button>
                  <button onClick={() => changeTab("students")} className="bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all text-left touch-manipulation">👥 View Students</button>
                </div>
              </div>
            </div>
          )}

          {tab === "courses" && (
            <div className="space-y-4">
              {courses.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-[#0f0f0f] mb-1">{c.title}</h3>
                      <p className="text-gray-500 text-sm mb-3">{c.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <span>📅 {c.duration}</span><span>🕐 {c.schedule}</span><span>💰 {c.fee}</span>
                      </div>
                    </div>
                    <button onClick={() => navigate(`/school/class/${c.id}`)} className="flex items-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors flex-shrink-0 touch-manipulation">
                      <Video className="w-4 h-4" />Start Class
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "students" && (
            <div className="space-y-3">
              {students.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-sm flex-shrink-0">
                    {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0f0f0f] text-sm">{s.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{s.username}</p>
                  </div>
                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full flex-shrink-0">Student</span>
                </div>
              ))}
              {students.length === 0 && <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400">No students enrolled yet.</div>}
            </div>
          )}

          {tab === "start-class" && (
            <div className="max-w-lg">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm text-center">
                <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5"><Video className="w-10 h-10 text-blue-600" /></div>
                <h2 className="font-black text-2xl text-[#0f0f0f] mb-2">Start a Live Class</h2>
                <p className="text-gray-500 text-sm mb-6">Select a course to start a live session. Students will be able to join from their dashboard.</p>
                <div className="space-y-3">
                  {courses.map((c) => (
                    <button key={c.id} onClick={() => navigate(`/school/class/${c.id}`)}
                      className="w-full flex items-center justify-between p-4 bg-[#f7f5f0] hover:bg-[#1a6b2a] hover:text-white rounded-xl transition-all group text-left touch-manipulation">
                      <div>
                        <p className="font-bold text-sm group-hover:text-white">{c.title}</p>
                        <p className="text-xs text-gray-400 group-hover:text-white/70">{c.schedule}</p>
                      </div>
                      <Video className="w-5 h-5 text-[#1a6b2a] group-hover:text-white" />
                    </button>
                  ))}
                </div>
                <button onClick={() => navigate("/school/class/general")} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl text-sm transition-colors touch-manipulation">
                  Start General Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
