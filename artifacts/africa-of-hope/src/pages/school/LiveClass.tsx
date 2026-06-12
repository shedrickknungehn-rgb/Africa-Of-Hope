import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Video, Phone } from "lucide-react";
import { getSession, apiGetCourses, type Course } from "./schoolApi";

export default function LiveClass() {
  const [location, navigate] = useLocation();
  const [session, setSession] = useState(getSession);
  const [courses, setCourses] = useState<Course[]>([]);
  const [joined, setJoined] = useState(false);

  const roomId = location.split("/class/")[1] || "AfricaOfHope-General";

  useEffect(() => {
    const s = getSession();
    if (!s) { navigate("/school"); return; }
    setSession(s);
    apiGetCourses().then(setCourses).catch(() => {});
  }, [navigate]);

  if (!session) return null;

  const course = courses.find((c) => c.id === roomId);

  const jitsiRoom = `AfricaOfHopeSchool-${roomId}`.replace(/[^a-zA-Z0-9-]/g, "-");
  const jitsiUrl = `https://meet.jit.si/${jitsiRoom}#userInfo.displayName="${encodeURIComponent(session.user.name)}"&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.toolbarButtons=["microphone","camera","desktop","fullscreen","folio","hangup","chat","recording","etherpad","whiteboard","breakoutRooms","participants-pane","raisehand","videoquality","filmstrip","feedback","stats","shortcuts","tileview","select-background","help"]`;

  return (
    <div className="h-screen flex flex-col bg-[#0a2812]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d3d1a] border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg px-2 py-1">
            <img src="/logo-full.png" alt="AOH" className="h-6 w-auto object-contain" />
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none">
              {course ? course.title : "Live Class"}
            </p>
            <p className="text-[#d4a017] text-xs font-medium">Africa of Hope Inc — School of Professional Studies</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-red-300 text-xs font-bold uppercase tracking-wide">Live</span>
          </div>
          <span className="text-white/60 text-xs hidden sm:block">{session.user.name} ({session.user.role})</span>
          <button
            onClick={() => navigate("/school/dashboard")}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
          >
            <Phone className="w-3 h-3" />
            Leave
          </button>
        </div>
      </div>

      {!joined ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 text-center max-w-md w-full shadow-2xl">
            <div className="w-20 h-20 rounded-2xl bg-[#1a6b2a]/10 flex items-center justify-center mx-auto mb-5">
              <Video className="w-10 h-10 text-[#1a6b2a]" />
            </div>
            <h2 className="text-2xl font-black text-[#0f0f0f] mb-2">{course ? course.title : "Live Class"}</h2>
            <p className="text-gray-500 text-sm mb-2">You are about to join the live class session.</p>
            <p className="text-gray-400 text-xs mb-6">Room: <span className="font-mono text-[#1a6b2a]">{jitsiRoom}</span></p>
            <div className="bg-[#f7f5f0] rounded-xl p-4 mb-6 text-left space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Features Available</p>
              {["HD Video & Audio", "Screen Sharing", "Breakout Rooms", "Whiteboard", "Chat", "Hand Raise", "Recording"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1a6b2a]" />
                  {f}
                </div>
              ))}
            </div>
            <button
              onClick={() => setJoined(true)}
              className="w-full bg-[#1a6b2a] hover:bg-[#155a22] text-white font-black py-4 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] text-base"
            >
              Join Live Class
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 relative">
          <iframe
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full border-0"
            title="Live Class"
          />
        </div>
      )}
    </div>
  );
}
