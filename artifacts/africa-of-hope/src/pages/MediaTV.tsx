import { useState } from "react";
import { Tv, Mic, Camera, Radio, Globe, Heart, Play, ArrowRight, Youtube, Lock, User, Eye, EyeOff, Video, AlertCircle, LogOut } from "lucide-react";
import { openDonate } from "@/lib/donate";
import { useInView } from "@/hooks/useInView";

const programs = [
  { icon: Tv, title: "Africa of Hope TV", description: "Our flagship television channel broadcasting inspiring stories, development news, and community transformation across Africa and the diaspora.", impact: "2M+ monthly viewers" },
  { icon: Mic, title: "Community Radio", description: "A network of community radio stations in local languages, delivering health information, civic education, and cultural programming.", impact: "45 radio stations" },
  { icon: Camera, title: "Documentary Films", description: "Award-winning documentaries that amplify African voices, challenge narratives, and spotlight extraordinary stories of resilience.", impact: "120+ films produced" },
  { icon: Radio, title: "Podcast Network", description: "A growing network of African-led podcasts covering politics, culture, innovation, health, and entrepreneurship for global audiences.", impact: "1.5M+ monthly listeners" },
];

const shows = [
  { title: "Voices of the Continent", type: "Documentary Series", description: "A six-part series profiling extraordinary Africans changing their communities from the inside out.", episode: "New Season Available", ytId: "FmFLDWoYiZg", thumb: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80" },
  { title: "Hope in the Harvest", type: "Agricultural Feature", description: "Stories of farmers transforming food security through innovation, resilience, and community cooperation.", episode: "Season 3 Now Streaming", ytId: "hLrFyjGZ9NU", thumb: "https://images.unsplash.com/photo-1536104968055-4d61aa56f46a?w=600&q=80" },
  { title: "The Healing Hour", type: "Health Awareness Show", description: "Weekly health education program in partnership with our healthcare division — reaching millions with life-saving information.", episode: "Live Every Sunday", ytId: "2VIoLuvs5pI", thumb: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80" },
  { title: "Young Africa Rising", type: "Youth Empowerment", description: "Showcasing the brilliance, creativity, and determination of young Africans aged 16–30 across every sector.", episode: "Episodes Daily", ytId: "hLrFyjGZ9NU", thumb: "https://images.unsplash.com/photo-1569937756447-23f2c92d11c8?w=600&q=80" },
];

const PODCASTER_CREDENTIALS = [
  { username: "podcaster1", password: "AoHPodcast1", name: "Podcaster One" },
  { username: "host1", password: "AoHHost2026", name: "Show Host" },
  { username: "media@africaofhope.org", password: "AoHMedia2026", name: "Media Team" },
];

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function VideoPlayer({ ytId, title }: { ytId: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const thumb = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#0a0a0a] shadow-2xl" style={{ paddingTop: "56.25%" }}>
      {!playing ? (
        <div
          className="absolute inset-0 cursor-pointer group"
          onClick={() => setPlaying(true)}
        >
          <img src={thumb} alt={title} className="w-full h-full object-cover opacity-80 group-hover:opacity-70 transition-opacity" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#d4a017] hover:bg-[#f0c040] flex items-center justify-center shadow-2xl transition-all group-hover:scale-110">
              <Play className="w-8 h-8 text-[#0f0f0f] ml-1" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white font-black text-lg drop-shadow-lg">{title}</p>
            <p className="text-white/70 text-sm">Click to play</p>
          </div>
        </div>
      ) : (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}

function PodcasterPortal() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [podcaster, setPodcaster] = useState<{ name: string } | null>(null);
  const [inRoom, setInRoom] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const roomName = `AfricaOfHope-Podcast-${today}`;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const match = PODCASTER_CREDENTIALS.find((c) => c.username === username.trim() && c.password === password);
    if (match) {
      setPodcaster({ name: match.name });
    } else {
      setError("Invalid credentials. Contact the media team for access.");
    }
  };

  if (inRoom && podcaster) {
    const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent(podcaster.name)}"&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.toolbarButtons=["microphone","camera","desktop","fullscreen","hangup","chat","recording","participants-pane","raisehand","tileview","select-background"]`;
    return (
      <div className="flex flex-col rounded-2xl overflow-hidden bg-[#0a2812] border border-white/10" style={{ height: 600 }}>
        <div className="flex items-center justify-between px-4 py-3 bg-[#0d3d1a] border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg px-2 py-1">
              <img src="/logo-full.png" alt="AOH" className="h-6 w-auto object-contain" />
            </div>
            <div>
              <p className="text-white font-black text-sm">Africa of Hope Inc — Podcast Studio</p>
              <p className="text-[#d4a017] text-xs">Room: {roomName} · Host: {podcaster.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-red-300 text-xs font-bold uppercase tracking-wide">On Air</span>
            </div>
            <button onClick={() => { setInRoom(false); setPodcaster(null); setUsername(""); setPassword(""); }} className="flex items-center gap-1.5 text-white/60 hover:text-red-300 text-xs font-bold transition-colors">
              <LogOut className="w-4 h-4" />End
            </button>
          </div>
        </div>
        <iframe
          src={jitsiUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="flex-1 border-0"
          title="Podcast Studio"
        />
      </div>
    );
  }

  if (podcaster) {
    return (
      <div className="bg-[#0d3d1a] border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#d4a017]/20 flex items-center justify-center mx-auto mb-4">
          <Mic className="w-8 h-8 text-[#d4a017]" />
        </div>
        <h3 className="text-white font-black text-xl mb-2">Welcome, {podcaster.name}</h3>
        <p className="text-white/60 text-sm mb-1">Today's Podcast Room</p>
        <p className="text-[#d4a017] font-mono text-sm mb-6">{roomName}</p>
        <div className="bg-white/5 rounded-xl p-4 mb-6 text-left space-y-2">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-2">Studio Features</p>
          {["HD Video Broadcasting", "Screen Sharing", "Multi-guest Sessions", "Live Chat", "Recording", "Background Selector"].map((f) => (
            <div key={f} className="flex items-center gap-2 text-white/70 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a017]" />
              {f}
            </div>
          ))}
        </div>
        <button onClick={() => setInRoom(true)} className="w-full bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-black py-4 rounded-xl text-base transition-all hover:scale-[1.01] flex items-center justify-center gap-2">
          <Mic className="w-5 h-5" />
          Enter Podcast Studio
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0d3d1a] border border-white/10 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#d4a017]/20 flex items-center justify-center">
          <Mic className="w-6 h-6 text-[#d4a017]" />
        </div>
        <div>
          <h3 className="text-white font-black text-lg">Podcaster Portal</h3>
          <p className="text-white/50 text-xs">Staff login for broadcasters &amp; show hosts</p>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-500/30 rounded-xl p-3 mb-4 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-white/60 text-xs font-bold uppercase tracking-wide block mb-1.5">Username / Email</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your-username"
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#d4a017] transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="text-white/60 text-xs font-bold uppercase tracking-wide block mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type={showPass ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#d4a017] transition-colors"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" className="w-full bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-black py-3.5 rounded-xl text-sm transition-all hover:scale-[1.01]">
          Sign In to Studio
        </button>
      </form>
      <p className="text-white/30 text-xs text-center mt-4">Contact <a href="mailto:Afrohope033@gmail.com" className="text-[#d4a017] hover:underline">Afrohope033@gmail.com</a> to request access.</p>
    </div>
  );
}

export default function MediaTV() {
  const [featuredShow, setFeaturedShow] = useState(0);
  return (
    <div className="pt-[57px]">
      {/* Hero */}
      <section className="gradient-hero py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#d4a017]/20 border border-[#d4a017]/30 flex items-center justify-center">
              <Tv className="w-6 h-6 text-[#d4a017]" />
            </div>
            <span className="text-[#d4a017] font-bold text-xs uppercase tracking-widest">Media / TV</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black mb-6 max-w-3xl">
            Africa's Story, Told by <span className="text-gradient-gold">Africans</span>
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            We believe media is one of the most powerful tools for change. Our media arm amplifies African voices, counters harmful narratives, and uses the power of storytelling to inspire millions.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#d4a017] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "2M+", label: "Monthly TV Viewers" },
              { value: "1.5M+", label: "Podcast Listeners" },
              { value: "120+", label: "Films Produced" },
              { value: "45", label: "Radio Stations" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-4xl font-black text-[#0f0f0f] mb-1">{value}</div>
                <div className="text-[#0f0f0f]/70 text-sm font-semibold uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED VIDEO PLAYER ── */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-10">
              <span className="text-[#d4a017] font-bold text-xs uppercase tracking-widest mb-3 block">Now Streaming</span>
              <h2 className="text-4xl font-black text-white">Watch Africa of Hope TV</h2>
              <p className="text-white/50 mt-3 text-sm">Select a program below and press play to watch.</p>
            </div>
          </AnimatedSection>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <VideoPlayer ytId={shows[featuredShow].ytId} title={shows[featuredShow].title} />
              <div className="mt-4">
                <h3 className="text-white font-black text-xl">{shows[featuredShow].title}</h3>
                <p className="text-[#d4a017] text-sm font-semibold mt-0.5">{shows[featuredShow].type} · {shows[featuredShow].episode}</p>
                <p className="text-white/60 text-sm mt-2 leading-relaxed">{shows[featuredShow].description}</p>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-4">All Programs</p>
              {shows.map((show, i) => (
                <button
                  key={show.title}
                  onClick={() => setFeaturedShow(i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${i === featuredShow ? "bg-[#d4a017]/20 border border-[#d4a017]/40" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}
                >
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={show.thumb} alt={show.title} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className={`w-4 h-4 ${i === featuredShow ? "text-[#d4a017]" : "text-white/60"}`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-xs leading-tight ${i === featuredShow ? "text-[#d4a017]" : "text-white"}`}>{show.title}</p>
                    <p className="text-white/40 text-xs mt-0.5">{show.type}</p>
                  </div>
                </button>
              ))}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#FF0000]/90 hover:bg-[#FF0000] text-white font-black px-5 py-3 rounded-xl transition-all mt-4 text-sm"
              >
                <Youtube className="w-5 h-5" />
                Watch on YouTube
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Media Programs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">Our Platforms</span>
              <h2 className="text-4xl font-black text-[#0f0f0f]">Media Channels &amp; Programs</h2>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {programs.map(({ icon: Icon, title, description, impact }, i) => (
              <AnimatedSection key={title} delay={i * 80}>
                <div className="bg-[#f7f5f0] rounded-2xl p-8 hover:shadow-md transition-all h-full">
                  <div className="w-12 h-12 rounded-xl bg-[#1a6b2a]/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-[#1a6b2a]" />
                  </div>
                  <h3 className="font-black text-[#0f0f0f] text-lg mb-3">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{description}</p>
                  <div className="inline-flex items-center gap-2 bg-[#d4a017]/10 border border-[#d4a017]/30 rounded-full px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4a017]" />
                    <span className="text-[#d4a017] text-xs font-semibold">{impact}</span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── PODCASTER PORTAL ── */}
      <section className="py-20 bg-[#0d3d1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <AnimatedSection>
              <span className="text-[#d4a017] font-bold text-xs uppercase tracking-widest mb-3 block">Staff Access</span>
              <h2 className="text-4xl font-black text-white mb-6">Podcaster &amp; Broadcaster Studio</h2>
              <p className="text-white/65 leading-relaxed mb-6">
                Africa of Hope Inc runs a live WebRTC broadcasting studio for our podcasters, show hosts, and media contributors. Sign in with your media credentials to enter the virtual studio — equipped with HD video, multi-guest support, screen sharing, live recording, and more.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Video, label: "HD Video Broadcasting", desc: "Broadcast live in 1080p with multiple guests and guests from anywhere in the world." },
                  { icon: Mic, label: "Multi-Guest Podcasting", desc: "Host panel discussions, interviews, and call-ins with up to 75 participants per session." },
                  { icon: Radio, label: "Live Recording", desc: "Record your sessions directly for replay on Africa of Hope TV and social media channels." },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                    <div className="w-9 h-9 rounded-lg bg-[#d4a017]/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#d4a017]" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{label}</p>
                      <p className="text-white/50 text-xs leading-relaxed mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-white/40 text-xs">
                  <span className="text-[#d4a017] font-bold">New to our media team?</span> Contact us at{" "}
                  <a href="mailto:Afrohope033@gmail.com?subject=Podcaster Access Request" className="text-[#d4a017] hover:underline">Afrohope033@gmail.com</a>{" "}
                  to request broadcaster credentials.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={150}>
              <PodcasterPortal />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <AnimatedSection>
              <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">Why Media Matters</span>
              <h2 className="text-4xl font-black text-[#0f0f0f] mb-6">The Power of the African Narrative</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                For too long, Africa's story has been told by outsiders. We believe Africa deserves media that celebrates its innovation, culture, resilience, and extraordinary people.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={openDonate} className="flex items-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold px-6 py-3 rounded-full text-sm transition-all">
                  <Heart className="w-4 h-4" />Support Media
                </button>
                <a href="mailto:Afrohope033@gmail.com?subject=Media Submission" className="flex items-center gap-2 bg-[#d4a017]/10 border border-[#d4a017] text-[#d4a017] hover:bg-[#d4a017] hover:text-[#0f0f0f] font-bold px-6 py-3 rounded-full text-sm transition-all">
                  <Globe className="w-4 h-4" />Submit a Story
                </a>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={150}>
              <div className="space-y-5">
                {[
                  { stat: "80%", label: "of content is produced in Africa, by Africans" },
                  { stat: "22", label: "African languages broadcast in" },
                  { stat: "40+", label: "countries where our content is distributed" },
                  { stat: "5", label: "international media awards won in 2024" },
                ].map(({ stat, label }) => (
                  <div key={label} className="flex items-center gap-5 bg-white rounded-xl p-5 shadow-sm">
                    <div className="text-3xl font-black text-[#d4a017] w-24 flex-shrink-0">{stat}</div>
                    <div className="text-gray-600 text-sm leading-snug">{label}</div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#0d3d1a] text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black mb-4">Partner with Africa of Hope Media</h2>
          <p className="text-white/70 mb-8">Are you a journalist, filmmaker, or storyteller with an African story to tell? We want to amplify your voice.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={openDonate} className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-black px-8 py-3 rounded-full transition-all hover:scale-105">
              <Heart className="w-4 h-4" />Support Media
            </button>
            <a href="mailto:Afrohope033@gmail.com?subject=Media Partnership — Africa of Hope" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-full border border-white/20 transition-all">
              Partner with Us <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
