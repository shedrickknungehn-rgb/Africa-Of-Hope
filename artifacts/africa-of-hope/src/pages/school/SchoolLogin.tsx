import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck, Mail, UserPlus } from "lucide-react";
import { apiLogin, apiSetup, apiGetSetupStatus, getSession } from "./schoolApi";

type Mode = "loading" | "login" | "setup";

const inputClass =
  "w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-[#0f0f0f] focus:border-[#1a6b2a] focus:outline-none transition-colors";
const labelClass =
  "text-[#0f0f0f] font-bold text-xs uppercase tracking-wide block mb-1.5";

export default function SchoolLogin() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("loading");

  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Setup fields
  const [suName, setSuName] = useState("");
  const [suUsername, setSuUsername] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [showSuPass, setShowSuPass] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getSession()) { navigate("/school/dashboard"); return; }
    let active = true;
    (async () => {
      try {
        const { needsSetup } = await apiGetSetupStatus();
        if (active) setMode(needsSetup ? "setup" : "login");
      } catch {
        // If the server can't be reached we default to the login form;
        // the submit handler will surface a clear connectivity message.
        if (active) setMode("login");
      }
    })();
    return () => { active = false; };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await apiLogin(username.trim(), password); navigate("/school/dashboard"); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Login failed. Please try again."); }
    finally { setLoading(false); }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (suPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (suPassword !== suConfirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await apiSetup({ name: suName.trim(), username: suUsername.trim(), email: suEmail.trim(), password: suPassword });
      navigate("/school/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Setup failed. Please try again.");
    } finally { setLoading(false); }
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
            {mode === "loading" && (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-[#1a6b2a] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Connecting to the portal…</p>
              </div>
            )}

            {mode === "login" && (
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

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className={labelClass}>Username</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" required autoComplete="username" value={username} onChange={e => setUsername(e.target.value)}
                        placeholder="Enter your username" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={showPass ? "text" : "password"} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password" className={`${inputClass} pr-10`} />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-[#1a6b2a] hover:bg-[#155a22] disabled:bg-gray-200 text-white font-black py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] text-sm">
                    {loading ? "Signing in…" : "Sign In"}
                  </button>
                </form>
              </div>
            )}

            {mode === "setup" && (
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#d4a017]/15 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-[#d4a017]" />
                  </div>
                  <div>
                    <h2 className="font-black text-[#0f0f0f] text-lg">Create Super Administrator</h2>
                    <p className="text-gray-500 text-xs">First-time setup — this is the only account with full control</p>
                  </div>
                </div>

                <div className="bg-[#1a6b2a]/5 border border-[#1a6b2a]/15 rounded-xl p-3 mb-4 text-[#0d3d1a] text-xs leading-relaxed">
                  Welcome! No accounts exist yet. Create the Super Administrator below — you'll then add directors, staff, instructors and students from inside the dashboard.
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                  </div>
                )}

                <form onSubmit={handleSetup} className="space-y-4">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" required value={suName} onChange={e => setSuName(e.target.value)}
                        placeholder="e.g. Jane Doe" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="email" value={suEmail} onChange={e => setSuEmail(e.target.value)}
                        placeholder="admin@africaofhope.org" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Username</label>
                    <div className="relative">
                      <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" required autoComplete="username" value={suUsername} onChange={e => setSuUsername(e.target.value)}
                        placeholder="Choose a username" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={showSuPass ? "text" : "password"} required autoComplete="new-password" value={suPassword} onChange={e => setSuPassword(e.target.value)}
                        placeholder="At least 8 characters" className={`${inputClass} pr-10`} />
                      <button type="button" onClick={() => setShowSuPass(!showSuPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showSuPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={showSuPass ? "text" : "password"} required autoComplete="new-password" value={suConfirm} onChange={e => setSuConfirm(e.target.value)}
                        placeholder="Re-enter your password" className={inputClass} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-[#1a6b2a] hover:bg-[#155a22] disabled:bg-gray-200 text-white font-black py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] text-sm">
                    {loading ? "Creating account…" : "Create Super Administrator"}
                  </button>
                </form>
              </div>
            )}
          </div>

          <p className="text-center text-white/30 text-xs mt-5">
            Africa of Hope Inc — School of Professional Studies © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
