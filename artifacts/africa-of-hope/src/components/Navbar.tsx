import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Heart, GraduationCap, ChevronRight } from "lucide-react";
import { openDonate } from "@/lib/donate";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/charity", label: "Charity" },
  { href: "/education", label: "Education" },
  { href: "/healthcare", label: "Health-Care" },
  { href: "/media", label: "Media / TV" },
  { href: "/advocacy", label: "Advocacy" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const TICKER_TEXT =
  "AFRICA OF HOPE INC — Arms & Service | Empowering Africa One Life at a Time | Non-Profit Organization | " +
  "School Admissions 2026/2027 OPEN — Tuition FREE | " +
  "Contact: 0760599659 / Afrohope033@gmail.com | RIA Highway, Schiefflin Township, Lower Margibi-County, Liberia | " +
  "Charity · Education · Health-Care · Media / TV · Advocacy | ";

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

  // Lock body scroll when menu open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[#0d3d1a]/97 backdrop-blur-md shadow-xl" : "bg-[#0d3d1a]"
        }`}
      >
        {/* Scrolling announcement ticker */}
        <div className="bg-[#d4a017] py-1 overflow-hidden">
          <div className="marquee-track">
            {[0, 1].map((n) => (
              <span key={n} className="text-[11px] font-semibold text-[#0f0f0f] tracking-wide whitespace-nowrap px-8">
                {TICKER_TEXT}
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
                <img src="/logo.png" alt="Africa of Hope Inc" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="text-white font-black text-sm sm:text-base leading-none tracking-tight">
                  AFRICA OF <span className="text-[#d4a017]">HOPE</span> <span className="text-[#d4a017]">INC</span>
                </div>
                <div className="text-[#d4a017]/70 text-[9px] sm:text-[10px] tracking-widest uppercase">Arms &amp; Service</div>
              </div>
            </Link>

            {/* Desktop Nav — xl+ */}
            <div className="hidden xl:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                    location === link.href
                      ? "text-[#d4a017] bg-white/10"
                      : "text-white/80 hover:text-[#d4a017] hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/school"
                className="ml-1 flex items-center gap-1.5 text-white/70 hover:text-[#d4a017] hover:bg-white/10 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                School
              </Link>
              <button
                onClick={openDonate}
                className="ml-2 flex items-center gap-1.5 bg-[#d4a017] hover:bg-[#f0c040] active:scale-95 text-[#0f0f0f] font-black text-xs px-4 py-2 rounded-full shadow transition-all duration-200 hover:scale-105 whitespace-nowrap"
              >
                <Heart className="w-3.5 h-3.5" />
                Donate
              </button>
            </div>

            {/* Large tablet Nav — lg–xl */}
            <div className="hidden lg:flex xl:hidden items-center gap-0.5">
              {navLinks.slice(0, 7).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                    location === link.href ? "text-[#d4a017] bg-white/10" : "text-white/80 hover:text-[#d4a017] hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={openDonate}
                className="ml-2 flex items-center gap-1.5 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-black text-xs px-3 py-2 rounded-full shadow transition-all hover:scale-105"
              >
                <Heart className="w-3.5 h-3.5" />
                Donate
              </button>
              <button
                className="text-white hover:text-[#d4a017] transition-colors p-2 ml-1 rounded-lg hover:bg-white/10"
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile: donate + hamburger */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={openDonate}
                className="flex items-center gap-1.5 bg-[#d4a017] active:bg-[#f0c040] text-[#0f0f0f] font-black text-xs px-3 py-2.5 rounded-full touch-manipulation"
              >
                <Heart className="w-3 h-3" />
                Donate
              </button>
              <button
                className="text-white p-2 rounded-xl hover:bg-white/10 transition-colors touch-manipulation"
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile/Medium full-screen drawer backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Mobile/Medium slide-in drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[60] xl:hidden w-72 sm:w-80 bg-[#071f0d] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="AOH" className="w-9 h-9 rounded-full object-contain bg-white p-0.5" />
            <div>
              <p className="text-white font-black text-sm leading-tight">Africa of Hope</p>
              <p className="text-[#d4a017] text-[10px] tracking-widest uppercase">Arms & Service</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors touch-manipulation"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold px-3 mb-2">Navigation</p>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors touch-manipulation ${
                location === link.href
                  ? "text-[#d4a017] bg-white/10 font-black"
                  : "text-white/80 hover:text-[#d4a017] hover:bg-white/8 active:bg-white/15"
              }`}
            >
              {link.label}
              {location === link.href && <ChevronRight className="w-4 h-4" />}
            </Link>
          ))}

          <div className="pt-2 mt-2 border-t border-white/10">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold px-3 mb-2">Portal</p>
            <Link
              href="/school"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-white/80 hover:text-[#d4a017] hover:bg-white/8 transition-colors touch-manipulation"
            >
              <GraduationCap className="w-4 h-4" />
              School Portal
              <span className="ml-auto text-[10px] bg-[#d4a017] text-[#0f0f0f] font-black px-2 py-0.5 rounded-full">OPEN</span>
            </Link>
          </div>
        </nav>

        {/* Contact info + donate */}
        <div className="px-4 pb-6 pt-4 border-t border-white/10 space-y-3">
          <button
            onClick={() => { setOpen(false); openDonate(); }}
            className="w-full flex items-center justify-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-black py-3.5 rounded-xl text-sm transition-all touch-manipulation"
          >
            <Heart className="w-4 h-4" />
            Donate Now
          </button>
          <div className="grid grid-cols-2 gap-2">
            <a href="tel:0760599659" className="flex items-center gap-1.5 bg-white/8 rounded-xl px-3 py-2.5 text-[#d4a017] text-xs font-bold touch-manipulation hover:bg-white/15 transition-colors">
              📞 Call Us
            </a>
            <a href="https://wa.me/231776679963" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-[#25D366]/20 rounded-xl px-3 py-2.5 text-green-400 text-xs font-bold touch-manipulation hover:bg-[#25D366]/30 transition-colors">
              💬 WhatsApp
            </a>
          </div>
          <p className="text-white/30 text-[10px] text-center">📍 RIA Highway, Schiefflin Township, Liberia</p>
        </div>
      </div>
    </>
  );
}
