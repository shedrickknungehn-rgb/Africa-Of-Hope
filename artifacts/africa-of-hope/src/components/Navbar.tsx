import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Heart } from "lucide-react";
import { openDonate } from "@/lib/donate";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/charity", label: "Charity Initiative" },
  { href: "/education", label: "Education" },
  { href: "/healthcare", label: "Health-Care" },
  { href: "/media", label: "Media / TV" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0d3d1a]/97 backdrop-blur-md shadow-xl"
          : "bg-[#0d3d1a]"
      }`}
    >
      {/* Top strip */}
      <div className="bg-[#d4a017] py-1 text-center text-[11px] font-semibold text-[#0f0f0f] tracking-wide">
        Empowering Africa — One Life at a Time | Non-Profit Organization
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#d4a017] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-[#0f0f0f] font-black text-sm">AH</span>
            </div>
            <div>
              <div className="text-white font-black text-lg leading-none tracking-tight">
                AFRICA OF <span className="text-[#d4a017]">HOPE</span>
              </div>
              <div className="text-[#d4a017]/70 text-[10px] tracking-widest uppercase">
                Arms &amp; Service
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
                  location === link.href
                    ? "text-[#d4a017] bg-white/10"
                    : "text-white/80 hover:text-[#d4a017] hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={openDonate}
              className="ml-3 flex items-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-bold text-sm px-4 py-2 rounded-full shadow transition-all duration-200 hover:scale-105"
            >
              <Heart className="w-3.5 h-3.5" />
              Donate
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-white hover:text-[#d4a017] transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[#0d3d1a] border-t border-white/10 px-4 pb-4">
          <div className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2.5 rounded text-sm font-medium transition-colors ${
                  location === link.href
                    ? "text-[#d4a017] bg-white/10"
                    : "text-white/80 hover:text-[#d4a017]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => { setOpen(false); openDonate(); }}
              className="mt-2 flex items-center justify-center gap-2 bg-[#d4a017] text-[#0f0f0f] font-bold text-sm px-4 py-2.5 rounded-full"
            >
              <Heart className="w-4 h-4" />
              Donate Now
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
