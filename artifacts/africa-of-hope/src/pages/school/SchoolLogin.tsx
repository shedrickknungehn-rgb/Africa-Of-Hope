import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck, Mail, UserPlus, KeyRound, CheckCircle2 } from "lucide-react";
import { apiLogin, apiSetup, apiGetSetupStatus, getSession, apiForgotPassword, apiResetPassword } from "./schoolApi";

type Mode = "loading" | "login" | "setup" | "forgot";
type ForgotStep = "request" | "reset" | "done";

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
  const [remember, setRemember] = useState(true);

  // Setup fields
  const [suName, setSuName] = useState("");
  const [suUsername, setSuUsername] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [showSuPass, setShowSuPass] = useState(false);

  // Forgot-password fields
  const [forgotStep, setForgotStep] = useState<ForgotStep>("request");
  const [fpIdentifier, setFpIdentifier] = useState("");
  const [fpEnteredCode, setFpEnteredCode] = useState("");
  const [fpNew, setFpNew] = useState("");
  const [fpConfirm, setFpConfirm] = useState("");
  const [showFpPass, setShowFpPass] = useState(false);

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
    try { await apiLogin(username.trim(), password, remember); navigate("/school/dashboard"); }
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

  const openForgot = () => {
    setError("");
    setForgotStep("request");
    setFpIdentifier(username.trim());
    setFpEnteredCode("");
    setFpNew(""); setFpConfirm("");
    setMode("forgot");
  };

  const backToLogin = (prefill?: string) => {
    setError("");
    if (prefill) setUsername(prefill);
    setPassword("");
    setMode("login");
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await apiForgotPassword(fpIdentifier.trim());
      setFpEnteredCode(""); setFpNew(""); setFpConfirm("");
      setForgotStep("reset");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not start password reset.");
    } finally { setLoading(false); }
  };

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (fpNew.length < 6) { setError("New password must be at least 6 characters."); return; }
    if (fpNew !== fpConfirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await apiResetPassword(fpIdentifier.trim(), fpEnteredCode.trim(), fpNew);
      setForgotStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not reset your password.");
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

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#1a6b2a] focus:ring-[#1a6b2a] accent-[#1a6b2a]" />
                      <span className="text-gray-600 text-sm">Remember me</span>
                    </label>
                    <button type="button" onClick={openForgot} className="text-[#1a6b2a] hover:text-[#155a22] text-sm font-bold">
                      Forgot password?
                    </button>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-[#1a6b2a] hover:bg-[#155a22] disabled:bg-gray-200 text-white font-black py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] text-sm">
                    {loading ? "Signing in…" : "Sign In"}
                  </button>
                </form>
              </div>
            )}

            {mode === "forgot" && (
              <div className="p-6 sm:p-8">
                <button type="button" onClick={() => backToLogin()} className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#1a6b2a] text-xs font-bold mb-4">
                  <ArrowLeft className="w-3.5 h-3.5" />Back to sign in
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1a6b2a]/10 flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-[#1a6b2a]" />
                  </div>
                  <div>
                    <h2 className="font-black text-[#0f0f0f] text-lg">Reset your password</h2>
                    <p className="text-gray-500 text-xs">
                      {forgotStep === "request" && "Enter your username or email to get a one-time code"}
                      {forgotStep === "reset" && "Enter the code and choose a new password"}
                      {forgotStep === "done" && "All set — you can sign in now"}
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                  </div>
                )}

                {forgotStep === "request" && (
                  <form onSubmit={handleForgotRequest} className="space-y-4">
                    <div>
                      <label className={labelClass}>Username or Email</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" required autoComplete="username" value={fpIdentifier} onChange={e => setFpIdentifier(e.target.value)}
                          placeholder="Enter your username or email" className={inputClass} />
                      </div>
                      <p className="text-gray-400 text-[11px] mt-2 leading-relaxed">
                        We'll email a 6-digit code to the address on your account.
                      </p>
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full bg-[#1a6b2a] hover:bg-[#155a22] disabled:bg-gray-200 text-white font-black py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] text-sm">
                      {loading ? "Sending your code…" : "Email me a code"}
                    </button>
                  </form>
                )}

                {forgotStep === "reset" && (
                  <form onSubmit={handleForgotReset} className="space-y-4">
                    <div className="flex items-start gap-2 bg-[#1a6b2a]/5 border border-[#1a6b2a]/15 rounded-xl p-3">
                      <Mail className="w-4 h-4 text-[#1a6b2a] flex-shrink-0 mt-0.5" />
                      <p className="text-gray-500 text-xs leading-relaxed">
                        If an account matches that username or email, we've sent a 6-digit code to it. Enter the code below to choose a new password. The code expires in 10 minutes.
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>Enter Code</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" inputMode="numeric" required value={fpEnteredCode} onChange={e => setFpEnteredCode(e.target.value)}
                          placeholder="6-digit code" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type={showFpPass ? "text" : "password"} required autoComplete="new-password" value={fpNew} onChange={e => setFpNew(e.target.value)}
                          placeholder="At least 6 characters" className={`${inputClass} pr-10`} />
                        <button type="button" onClick={() => setShowFpPass(!showFpPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showFpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type={showFpPass ? "text" : "password"} required autoComplete="new-password" value={fpConfirm} onChange={e => setFpConfirm(e.target.value)}
                          placeholder="Re-enter your new password" className={inputClass} />
                      </div>
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full bg-[#1a6b2a] hover:bg-[#155a22] disabled:bg-gray-200 text-white font-black py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] text-sm">
                      {loading ? "Updating password…" : "Reset password"}
                    </button>
                  </form>
                )}

                {forgotStep === "done" && (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-full bg-[#1a6b2a]/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-7 h-7 text-[#1a6b2a]" />
                    </div>
                    <p className="text-[#0f0f0f] font-bold mb-1">Password updated</p>
                    <p className="text-gray-500 text-sm mb-5">You can now sign in with your new password.</p>
                    <button type="button" onClick={() => backToLogin(fpIdentifier.includes("@") ? "" : fpIdentifier.trim())}
                      className="w-full bg-[#1a6b2a] hover:bg-[#155a22] text-white font-black py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] text-sm">
                      Back to sign in
                    </button>
                  </div>
                )}
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
