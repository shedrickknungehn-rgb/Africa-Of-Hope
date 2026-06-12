import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Heart, GraduationCap, ChevronRight, ChevronDown } from "lucide-react";
import { openDonate } from "@/lib/donate";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
];

const departments = [
  { href: "/charity", label: "Charity" },
  { href: "/education", label: "Education" },
  { href: "/healthcare", label: "Health-Care" },
  { href: "/media", label: "Media / TV" },
  { href: "/advocacy", label: "Advocacy" },
];

const afterLinks = [
  { href: "/team", label: "Our Team" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const TICKER_TEXT =
  "AFRICA OF HOPE INC — Arms & Service | Empowering Africa One Life at a Time | Non-Profit Organization | " +
  "School Admissions 2026/2027 OPEN — Tuition FREE | " +
  "Contact: 0760599659 / Afrohope033@gmail.com | RIA Highway, Schiefflin Township, Lower Margibi-County, Liberia | " +
  "Charity · Education · Health-Care · Media / TV · Advocacy | ";

function NavLink({ href, label, location }: { href: string; label: string; location: string }) {
  return (
    <Link
      href={href}
      className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
        location === href
          ? "text-[#d4a017] bg-white/10"
          : "text-white/80 hover:text-[#d4a017] hover:bg-white/10"
      }`}
    >
      {label}
    </Link>
  );
}

function DepartmentsMenu({ location }: { location: string }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActive = departments.some((d) => d.href === location);

  const handleEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
          isActive || open
            ? "text-[#d4a017] bg-white/10"
            : "text-white/80 hover:text-[#d4a017] hover:bg-white/10"
        }`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        Departments
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`absolute left-0 top-full pt-2 z-50 transition-all duration-200 ${
          open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
        }`}
      >
        <div className="w-52 bg-[#0d3d1a] border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden">
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold px-4 pt-1 pb-2">
            Our Programs
          </p>
          {departments.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-xs font-semibold transition-colors ${
                location === d.href
                  ? "text-[#d4a017] bg-white/10"
                  : "text-white/80 hover:text-[#d4a017] hover:bg-white/10"
              }`}
            >
              {d.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
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

  // Expand the Departments group in the drawer when on a department page
  useEffect(() => {
    if (departments.some((d) => d.href === location)) setDeptOpen(true);
  }, [location]);

  // Lock body scroll when menu open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
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
            <Link href="/" className="flex items-center group flex-shrink-0">
              <img
                src="/logo-full.png"
                alt="Africa of Hope Inc"
                className="h-10 sm:h-13 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </Link>

            {/* Desktop Nav — xl+ */}
            <div className="hidden xl:flex items-center gap-0.5">
              {mainLinks.map((link) => (
                <NavLink key={link.href} {...link} location={location} />
              ))}
              <DepartmentsMenu location={location} />
              {afterLinks.map((link) => (
                <NavLink key={link.href} {...link} location={location} />
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
              {mainLinks.map((link) => (
                <NavLink key={link.href} {...link} location={location} />
              ))}
              <DepartmentsMenu location={location} />
              {afterLinks.map((link) => (
                <NavLink key={link.href} {...link} location={location} />
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
          <div className="flex items-center">
            <div className="bg-white rounded-xl px-3 py-1.5">
              <img src="/logo-full.png" alt="Africa of Hope Inc" className="h-8 w-auto object-contain" />
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
          {mainLinks.map((link) => (
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

          {/* Departments accordion */}
          <button
            onClick={() => setDeptOpen((v) => !v)}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors touch-manipulation ${
              departments.some((d) => d.href === location)
                ? "text-[#d4a017] bg-white/10 font-black"
                : "text-white/80 hover:text-[#d4a017] hover:bg-white/8 active:bg-white/15"
            }`}
            aria-expanded={deptOpen}
          >
            Departments
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${deptOpen ? "rotate-180" : ""}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${deptOpen ? "max-h-96" : "max-h-0"}`}>
            <div className="pl-3 space-y-1 py-1">
              {departments.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors touch-manipulation border-l-2 ${
                    location === link.href
                      ? "text-[#d4a017] bg-white/10 border-[#d4a017]"
                      : "text-white/70 border-white/10 hover:text-[#d4a017] hover:bg-white/8 active:bg-white/15"
                  }`}
                >
                  {link.label}
                  {location === link.href && <ChevronRight className="w-4 h-4" />}
                </Link>
              ))}
            </div>
          </div>

          {afterLinks.map((link) => (
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
