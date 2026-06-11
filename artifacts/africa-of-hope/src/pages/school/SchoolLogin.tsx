import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { apiLogin, getSession } from "./schoolApi";

export default function SchoolLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getSession()) navigate("/school/dashboard");
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiLogin(username.trim(), password);
      navigate("/school/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2812] via-[#0d3d1a] to-[#1a6b2a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 border border-white/20 mb-4 overflow-hidden">
            <img src="/logo.png" alt="Africa of Hope Inc" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-white font-black text-2xl">Africa of Hope Inc</h1>
          <p className="text-[#d4a017] font-bold text-sm tracking-widest uppercase mt-1">School Management System</p>
          <p className="text-white/50 text-xs mt-2">RIA Highway, Schiefflin Township, Lower Margibi-County, Liberia</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#1a6b2a]/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#1a6b2a]" />
            </div>
            <div>
              <h2 className="font-black text-[#0f0f0f] text-lg">Student / Staff Portal</h2>
              <p className="text-gray-500 text-xs">Sign in to your dashboard</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[#0f0f0f] font-bold text-xs uppercase tracking-wide block mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-[#0f0f0f] focus:border-[#1a6b2a] focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-[#0f0f0f] font-bold text-xs uppercase tracking-wide block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl text-sm text-[#0f0f0f] focus:border-[#1a6b2a] focus:outline-none transition-colors"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a6b2a] hover:bg-[#155a22] disabled:bg-gray-300 text-white font-black py-3.5 rounded-xl transition-all hover:scale-[1.01] text-sm mt-2"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-[#f7f5f0] rounded-xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Default Admin Credentials</p>
            <p className="text-xs text-gray-600 font-mono">Username: <span className="font-bold text-[#0f0f0f]">admin</span></p>
            <p className="text-xs text-gray-600 font-mono">Password: <span className="font-bold text-[#0f0f0f]">AfroAdmin2026</span></p>
            <p className="text-xs text-gray-400 mt-1">Admin can set up all other user credentials.</p>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          Africa of Hope Inc — School of Professional Studies &copy; {new Date().getFullYear()}
        </p>
        <div className="text-center mt-3">
          <a href="/" className="text-[#d4a017]/70 hover:text-[#d4a017] text-xs transition-colors">← Back to main website</a>
        </div>
      </div>
    </div>
  );
}
