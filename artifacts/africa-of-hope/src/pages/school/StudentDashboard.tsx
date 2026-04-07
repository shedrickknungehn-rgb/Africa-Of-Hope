import { useState } from "react";
import { useLocation } from "wouter";
import { BookOpen, Video, FileText, Home, LogOut, BarChart2, Bell } from "lucide-react";
import { User, getCourses, clearSession } from "./schoolData";

type Tab = "overview" | "courses" | "join-class" | "materials";

export default function StudentDashboard({ user }: { user: User }) {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");
  const courses = getCourses().filter((c) => c.status === "active");

  const tabs = [
    { key: "overview" as Tab, label: "Overview", icon: BarChart2 },
    { key: "courses" as Tab, label: "My Courses", icon: BookOpen },
    { key: "join-class" as Tab, label: "Join Live Class", icon: Video },
    { key: "materials" as Tab, label: "Materials", icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-[#f7f5f0]">
      <div className="w-56 bg-[#0d3d1a] flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <img src="/logo.png" alt="AOH" className="w-10 h-10 object-contain mx-auto mb-2" />
          <p className="text-white font-black text-sm text-center">AOH School Portal</p>
        </div>
        <div className="p-3 border-b border-white/10">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white font-bold text-sm">{user.name}</p>
            <span className="inline-block bg-green-500/20 text-green-300 text-xs font-bold px-2 py-0.5 rounded-full uppercase mt-0.5">Student</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === key ? "bg-[#d4a017] text-[#0f0f0f] font-black" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <a href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"><Home className="w-4 h-4" />Main Website</a>
          <button onClick={() => { clearSession(); navigate("/school"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-colors"><LogOut className="w-4 h-4" />Sign Out</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0f0f0f]">Welcome, {user.name.split(" ")[0]}</h1>
          <p className="text-gray-500 text-sm">Africa of Hope School of Professional Studies</p>
        </div>

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Enrolled Courses", value: courses.length, color: "bg-[#1a6b2a]" },
                { label: "Live Sessions", value: "0", color: "bg-blue-600" },
                { label: "Materials", value: courses.reduce((a, c) => a + c.materials.length, 0), color: "bg-[#d4a017]" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                  <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mx-auto mb-3`}><BarChart2 className="w-5 h-5 text-white" /></div>
                  <div className="text-3xl font-black text-[#0f0f0f]">{value}</div>
                  <div className="text-sm font-bold text-gray-600">{label}</div>
                </div>
              ))}
            </div>

            <div className="bg-[#0d3d1a] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Bell className="w-5 h-5 text-[#d4a017]" />
                <h3 className="font-black">Announcement</h3>
              </div>
              <p className="text-white/70 text-sm">Welcome to Africa of Hope School of Professional Studies! Classes are now available. Join a live session or browse your course materials. Contact your instructor if you have questions.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-black text-[#0f0f0f] mb-4">Available Courses</h3>
              <div className="space-y-3">
                {courses.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-[#f7f5f0] rounded-xl">
                    <div>
                      <p className="font-bold text-sm text-[#0f0f0f]">{c.title}</p>
                      <p className="text-xs text-gray-400">{c.duration} · {c.schedule}</p>
                    </div>
                    <button onClick={() => navigate(`/school/class/${c.id}`)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                      <Video className="w-3 h-3" />Join
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "courses" && (
          <div className="space-y-4">
            {courses.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-black text-[#0f0f0f] mb-1">{c.title}</h3>
                    <p className="text-gray-500 text-sm mb-3">{c.description}</p>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>📅 {c.duration}</span><span>🕐 {c.schedule}</span><span>💰 {c.fee}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/school/class/${c.id}`)} className="flex items-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors ml-4">
                    <Video className="w-4 h-4" />Join Class
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "join-class" && (
          <div className="max-w-lg">
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5"><Video className="w-10 h-10 text-blue-600" /></div>
              <h2 className="font-black text-2xl text-[#0f0f0f] mb-2">Join a Live Class</h2>
              <p className="text-gray-500 text-sm mb-6">Select an active course to join. Your instructor must have started the session.</p>
              <div className="space-y-3">
                {courses.map((c) => (
                  <button key={c.id} onClick={() => navigate(`/school/class/${c.id}`)} className="w-full flex items-center justify-between p-4 bg-[#f7f5f0] hover:bg-[#1a6b2a] hover:text-white rounded-xl transition-all group text-left">
                    <div>
                      <p className="font-bold text-sm group-hover:text-white">{c.title}</p>
                      <p className="text-xs text-gray-400 group-hover:text-white/70">{c.schedule}</p>
                    </div>
                    <Video className="w-5 h-5 text-[#1a6b2a] group-hover:text-white" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "materials" && (
          <div className="space-y-4">
            {courses.map((c) => c.materials.length > 0 && (
              <div key={c.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-black text-[#0f0f0f] mb-4">{c.title}</h3>
                <div className="space-y-2">
                  {c.materials.map((m) => (
                    <a key={m.title} href={m.url} className="flex items-center gap-3 p-3 bg-[#f7f5f0] hover:bg-[#1a6b2a]/10 rounded-xl transition-colors group">
                      <FileText className="w-5 h-5 text-[#1a6b2a]" />
                      <span className="text-sm font-medium text-[#0f0f0f] group-hover:text-[#1a6b2a]">{m.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
            {courses.every((c) => c.materials.length === 0) && (
              <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400">No materials uploaded yet. Check back soon.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
