import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, Lock, User, Eye, EyeOff, AlertCircle, Zap, GraduationCap, ArrowLeft, ChevronRight } from "lucide-react";
import { apiLogin, getSession } from "./schoolApi";

const DEMO_ACCOUNTS = [
  { role: "Super Admin", username: "superadmin", password: "SuperAdmin2026", color: "bg-red-600", badge: "bg-red-100 text-red-700", desc: "Full system control" },
  { role: "Director", username: "director", password: "Director2026", color: "bg-orange-500", badge: "bg-orange-100 text-orange-700", desc: "School director access" },
  { role: "Registrar", username: "registrar", password: "Registrar2026", color: "bg-amber-500", badge: "bg-amber-100 text-amber-700", desc: "Enrollment & records" },
  { role: "Finance Officer", username: "finance", password: "Finance2026", color: "bg-teal-600", badge: "bg-teal-100 text-teal-700", desc: "Finance management" },
  { role: "Instructor", username: "instructor1", password: "Instructor2026", color: "bg-blue-600", badge: "bg-blue-100 text-blue-700", desc: "Manage courses & classes" },
  { role: "Student", username: "student1", password: "Student2026", color: "bg-green-600", badge: "bg-green-100 text-green-700", desc: "View courses & join classes" },
];

export default function SchoolLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState<string | null>(null);

  useEffect(() => { if (getSession()) navigate("/school/dashboard"); }, [navigate]);

  const doLogin = async (u: string, p: string) => {
    setError(""); setLoading(true);
    try { await apiLogin(u.trim(), p); navigate("/school/dashboard"); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Login failed. Please try again."); }
    finally { setLoading(false); setAutoLoading(null); }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); doLogin(username, password); };

  const handleOneClick = async (acc: typeof DEMO_ACCOUNTS[0]) => {
    setUsername(acc.username); setPassword(acc.password);
    setAutoLoading(acc.role); setError(""); setLoading(true);
    try { await apiLogin(acc.username, acc.password); navigate("/school/dashboard"); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Login failed. Please try again."); }
    finally { setLoading(false); setAutoLoading(null); }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="px-4 pt-4">
        <a href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[#d4a017] text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to main website
        </a>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <div className="mb-4">
              <img src="/navbarlogo.png" alt="Africa of Hope Inc" className="h-28 sm:h-36 w-auto object-contain mx-auto" />
            </div>
            <p className="text-[#d4a017] font-bold text-sm tracking-widest uppercase mt-1">Management Portal</p>
            <p className="text-white/40 text-xs mt-1">RIA Highway, Schiefflin Township, Lower Margibi-County, Liberia</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#1a6b2a]/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#1a6b2a]" />
                </div>
                <div>
                  <h2 className="font-black text-[#0f0f0f] text-lg">Staff & Student Portal</h2>
                  <p className="text-gray-500 text-xs">Sign in to your dashboard</p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[#0f0f0f] font-bold text-xs uppercase tracking-wide block mb-1.5">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" required autoComplete="username" value={username} onChange={e => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-[#0f0f0f] focus:border-[#1a6b2a] focus:outline-none transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-[#0f0f0f] font-bold text-xs uppercase tracking-wide block mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPass ? "text" : "password"} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl text-sm text-[#0f0f0f] focus:border-[#1a6b2a] focus:outline-none transition-colors" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#1a6b2a] hover:bg-[#155a22] disabled:bg-gray-200 text-white font-black py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] text-sm">
                  {loading && !autoLoading ? "Signing in…" : "Sign In"}
                </button>
              </form>
            </div>

            <div className="border-t border-gray-100 bg-[#f9faf8] px-6 sm:px-8 py-5">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-4 h-4 text-[#1a6b2a]" />
                <p className="text-xs font-black text-[#0f0f0f] uppercase tracking-wide">Demo Accounts — One-Click Sign In</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button key={acc.role} onClick={() => handleOneClick(acc)} disabled={loading}
                    className="group flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-gray-100 hover:border-[#1a6b2a] hover:shadow-md transition-all disabled:opacity-60 text-left active:scale-[0.98] touch-manipulation">
                    <div className={`w-9 h-9 ${acc.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      {autoLoading === acc.role ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : <Zap className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-black text-sm text-[#0f0f0f]">{acc.role}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${acc.badge}`}>{acc.desc}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono truncate">{acc.username}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1a6b2a] transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3">Click any card to sign in instantly as that role</p>
            </div>
          </div>

          <p className="text-center text-white/30 text-xs mt-5">
            Africa of Hope Inc — School of Professional Studies © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
