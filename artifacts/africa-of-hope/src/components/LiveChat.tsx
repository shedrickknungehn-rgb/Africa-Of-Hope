import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ChevronDown, Phone } from "lucide-react";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  time: string;
}

const BOT_NAME = "Hope Assistant";
const WA_LINK = "https://wa.me/231776679963?text=Hello%2C%20I%27d%20like%20to%20speak%20with%20an%20admin%20at%20Africa%20of%20Hope%20Inc.";

const FAQ_BUTTONS = [
  "What is Africa of Hope?",
  "How to donate?",
  "School admissions",
  "Our programs",
  "Contact & location",
  "How to volunteer?",
];

const faqAnswers: Record<string, string> = {
  "What is Africa of Hope?":
    "Africa of Hope Inc is a registered non-profit organization based in Liberia, West Africa. We serve across the continent through 5 arms: 🌱 Charity, 📚 Education, 🏥 Health-Care, 📺 Media/TV, and ⚖ Advocacy — empowering one life at a time.",
  "How to donate?":
    "You can donate securely through our online portal — click the gold 💛 Donate button on any page. Every contribution directly funds our programs. For bank transfer or large donations, contact us at Afrohope033@gmail.com or call 0760599659.",
  "School admissions":
    "🎓 Africa of Hope School of Professional Studies admissions for 2026/2027 are OPEN!\n\n✅ Tuition is 100% FREE\n✅ Open to all qualified candidates\n✅ Programs in Business, Health, ICT & more\n\nVisit the School Portal or contact us to apply.",
  "Our programs":
    "We operate 5 program arms:\n\n🌱 Charity — Emergency relief & community development\n📚 Education — Tuition-free schools & scholarships\n🏥 Health-Care — Mobile clinics & maternal care\n📺 Media/TV — African storytelling & documentaries\n⚖ Advocacy — Human rights & policy reform",
  "Contact & location":
    "📍 RIA Highway, Schiefflin Township\n     Lower Margibi-County, Liberia\n\n📞 0760599659 / 088061379\n✉ Afrohope033@gmail.com\n💬 WhatsApp: +231 776 679 963\n\nOffice hours: Mon–Fri, 8am–5pm (Liberia Time)",
  "How to volunteer?":
    "We welcome passionate volunteers! You can support us in the field, remotely, or by donating skills across any of our 5 arms.\n\nPlease reach out to us:\n✉ Afrohope033@gmail.com\n💬 WhatsApp: +231776679963\n\nTell us your skills and availability — we'd love to have you!",
};

function matchResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.match(/what is|who are|about|mission|overview/)) return faqAnswers["What is Africa of Hope?"];
  if (lower.match(/donat|give|fund|contribut|money|pay/)) return faqAnswers["How to donate?"];
  if (lower.match(/school|admiss|enroll|student|class|cours|tuition|study/)) return faqAnswers["School admissions"];
  if (lower.match(/program|arm|service|charity|health|media|tv|advocacy|educat/)) return faqAnswers["Our programs"];
  if (lower.match(/contact|location|address|phone|email|where|liberia|margibi/)) return faqAnswers["Contact & location"];
  if (lower.match(/volunteer|help|join|work|intern/)) return faqAnswers["How to volunteer?"];
  return "Thanks for reaching out! 😊 I can help with questions about our programs, donations, school admissions, location, and volunteering. Or tap a quick question below, or connect directly with our admin team on WhatsApp.";
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const INIT_MESSAGES: Message[] = [
  {
    id: 1,
    from: "bot",
    text: "👋 Hi! I'm Hope, your Africa of Hope assistant. How can I help you today? Choose a topic below or type your question.",
    time: now(),
  },
];

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INIT_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, open, minimized]);

  const addBotMessage = (text: string) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const msg: Message = { id: Date.now(), from: "bot", text, time: now() };
      setMessages((prev) => [...prev, msg]);
      if (!open || minimized) setUnread((n) => n + 1);
    }, 900 + Math.random() * 600);
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), from: "user", text: text.trim(), time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    addBotMessage(matchResponse(text.trim()));
  };

  const handleFaq = (q: string) => {
    const userMsg: Message = { id: Date.now(), from: "user", text: q, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    addBotMessage(faqAnswers[q]);
  };

  const toggleOpen = () => {
    setOpen((v) => !v);
    setMinimized(false);
    setUnread(0);
  };

  return (
    <>
      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[90vw] sm:w-[360px] max-w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          open && !minimized
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
        style={{ maxHeight: "calc(100vh - 140px)", height: "520px" }}
      >
        {/* Header */}
        <div className="bg-[#0d3d1a] px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
          <div className="relative">
            <img src="/logo.png" alt="AOH" className="w-9 h-9 rounded-full object-contain bg-white p-0.5" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0d3d1a]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm leading-none">{BOT_NAME}</p>
            <p className="text-[#d4a017] text-xs mt-0.5">Africa of Hope Inc · Online</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized(true)}
              className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Minimize"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#f9faf8]">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] ${m.from === "user" ? "" : "flex items-end gap-2"}`}>
                {m.from === "bot" && (
                  <img src="/logo.png" alt="" className="w-6 h-6 rounded-full object-contain bg-white border border-gray-200 flex-shrink-0 mb-1" />
                )}
                <div>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      m.from === "user"
                        ? "bg-[#1a6b2a] text-white rounded-br-sm"
                        : "bg-white text-[#0f0f0f] shadow-sm border border-gray-100 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 px-1">{m.time}</p>
                </div>
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <img src="/logo.png" alt="" className="w-6 h-6 rounded-full object-contain bg-white border border-gray-200" />
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center">
                    {[0, 0.15, 0.3].map((delay) => (
                      <span
                        key={delay}
                        className="w-2 h-2 bg-[#1a6b2a] rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* FAQ quick buttons */}
        <div className="px-3 py-2 border-t border-gray-100 bg-white flex-shrink-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Quick Questions</p>
          <div className="flex flex-wrap gap-1.5">
            {FAQ_BUTTONS.map((q) => (
              <button
                key={q}
                onClick={() => handleFaq(q)}
                className="text-[11px] font-medium bg-[#f0f7f2] hover:bg-[#d4a017] hover:text-[#0f0f0f] text-[#1a6b2a] px-2.5 py-1 rounded-full border border-[#1a6b2a]/20 transition-all duration-150 active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input + WhatsApp transfer */}
        <div className="px-3 pb-3 pt-2 bg-white border-t border-gray-100 flex-shrink-0">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="Type a message…"
              className="flex-1 bg-[#f7f5f0] border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0f0f0f] focus:outline-none focus:border-[#1a6b2a] transition-colors"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="w-10 h-10 bg-[#1a6b2a] hover:bg-[#155a22] disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Connect with Admin on WhatsApp
          </a>
        </div>
      </div>

      {/* Minimized bar */}
      {open && minimized && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 bg-[#0d3d1a] text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl cursor-pointer hover:bg-[#1a6b2a] transition-colors"
          onClick={() => setMinimized(false)}
        >
          <img src="/logo.png" alt="" className="w-7 h-7 rounded-full object-contain bg-white p-0.5" />
          <div>
            <p className="text-sm font-black leading-none">{BOT_NAME}</p>
            <p className="text-[#d4a017] text-xs">Click to expand</p>
          </div>
          <ChevronDown className="w-4 h-4 text-white/60 rotate-180 ml-2" />
        </div>
      )}

      {/* FAB trigger button */}
      <button
        onClick={toggleOpen}
        className={`fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-[#0d3d1a] hover:bg-[#1a6b2a] text-white flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 border-2 border-[#d4a017]/40 touch-manipulation ${
          open ? "rotate-0" : ""
        }`}
        aria-label="Open live chat"
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#d4a017] text-[#0f0f0f] text-xs font-black rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
