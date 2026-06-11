import { Heart, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { openDonate } from "@/lib/donate";

export default function DonateFab() {
  const [visible, setVisible] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
      setShowTop(window.scrollY > 700);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-24 right-4 sm:right-6 z-40 flex flex-col items-end gap-3 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-10 h-10 rounded-full bg-[#0d3d1a] hover:bg-[#1a6b2a] active:scale-95 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 border border-white/20 touch-manipulation"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={openDonate}
        className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] active:scale-95 text-[#0f0f0f] font-black text-sm px-5 py-3 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 touch-manipulation"
        aria-label="Donate"
      >
        <Heart className="w-4 h-4" />
        <span>Donate</span>
      </button>
    </div>
  );
}
