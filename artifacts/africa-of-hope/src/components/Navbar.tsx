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
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const TICKER_TEXT =
  "AFRICA OF HOPE — Arms & Service | Empowering Africa One Life at a Time | Non-Profit Organization | " +
  "School Admissions 2026/2027 OPEN — Tuition FREE | " +
  "Contact: 0760599659 / Afrohope033@gmail.com | Liberia — Physically & Online | " +
  "Charity · Education · Health-Care · Media / TV | ";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
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
      {/* Scrolling announcement ticker */}
      <div className="bg-[#d4a017] py-1 overflow-hidden">
        <div className="marquee-track">
          {/* Duplicate text so the loop is seamless */}
          {[0, 1].map((n) => (
            <span
              key={n}
              className="text-[11px] font-semibold text-[#0f0f0f] tracking-wide whitespace-nowrap px-8"
            >
              {TICKER_TEXT}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#d4a017] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-[#0f0f0f] font-black text-xs sm:text-sm">AH</span>
            </div>
            <div>
              <div className="text-white font-black text-base sm:text-lg leading-none tracking-tight">
                AFRICA OF <span className="text-[#d4a017]">HOPE</span>
              </div>
              <div className="text-[#d4a017]/70 text-[9px] sm:text-[10px] tracking-widest uppercase">
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

          {/* Mobile: donate + hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={openDonate}
              className="flex items-center gap-1.5 bg-[#d4a017] text-[#0f0f0f] font-bold text-xs px-3 py-2 rounded-full"
            >
              <Heart className="w-3 h-3" />
              Donate
            </button>
            <button
              className="text-white hover:text-[#d4a017] transition-colors p-1"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu — slide down */}
      <div
        className={`lg:hidden bg-[#0d3d1a] border-t border-white/10 transition-all duration-300 overflow-hidden ${
          open ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-5 pt-2 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                location === link.href
                  ? "text-[#d4a017] bg-white/10"
                  : "text-white/80 hover:text-[#d4a017] hover:bg-white/8"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {/* Real contact info in mobile menu */}
          <div className="mt-3 border-t border-white/10 pt-3 space-y-1 px-4">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Contact</p>
            <a href="tel:0760599659" className="block text-[#d4a017] text-sm font-medium">📞 0760599659 / 088061379</a>
            <a href="https://wa.me/231776679963" className="block text-white/70 text-sm">💬 WhatsApp: +231776679963</a>
            <a href="mailto:Afrohope033@gmail.com" className="block text-white/70 text-sm">✉ Afrohope033@gmail.com</a>
          </div>
        </div>
      </div>
    </nav>
  );
}
