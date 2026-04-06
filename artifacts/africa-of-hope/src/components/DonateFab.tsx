import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { openDonate } from "@/lib/donate";

export default function DonateFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  return (
    <button
      onClick={openDonate}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-black text-sm px-5 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Donate"
    >
      <Heart className="w-4 h-4" />
      Donate
    </button>
  );
}
