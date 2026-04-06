import { Link } from "wouter";
import { Home, Heart } from "lucide-react";

export default function NotFound() {
  return (
    <div className="pt-[57px] min-h-screen flex items-center justify-center gradient-hero">
      <div className="text-center px-4">
        <div className="text-[#d4a017] font-black text-[120px] leading-none mb-4 opacity-20">404</div>
        <h1 className="text-4xl font-black text-white mb-4">Page Not Found</h1>
        <p className="text-white/60 text-lg mb-10 max-w-md mx-auto">
          The page you're looking for doesn't exist. Let's get you back on track.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-black px-6 py-3 rounded-full transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            onClick={() => {
              if (typeof window !== "undefined" && (window as any).formsapp) {
                (window as any).formsapp("69d3e6688d0ad42decac4b79", "popup");
              }
            }}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-full border border-white/20 transition-all"
          >
            <Heart className="w-4 h-4" />
            Donate Instead
          </button>
        </div>
      </div>
    </div>
  );
}
