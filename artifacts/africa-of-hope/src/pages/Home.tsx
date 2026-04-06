import { Link } from "wouter";
import { Heart, BookOpen, Stethoscope, Tv, ChevronRight, Users, Globe, Award, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

const impactStats = [
  { value: "50,000+", label: "Lives Impacted", icon: Users },
  { value: "25", label: "Countries Reached", icon: Globe },
  { value: "200+", label: "Projects Completed", icon: Award },
  { value: "15yrs", label: "Years of Service", icon: Heart },
];

const arms = [
  {
    title: "Charity Initiative",
    description: "Providing emergency relief, food security, and community development support to vulnerable families across Africa.",
    icon: Heart,
    href: "/charity",
    color: "from-[#1a6b2a] to-[#0d3d1a]",
    accent: "#d4a017",
  },
  {
    title: "Education",
    description: "Building schools, funding scholarships, and empowering the next generation of African leaders through quality education.",
    icon: BookOpen,
    href: "/education",
    color: "from-[#1a5c28] to-[#0a2812]",
    accent: "#f0c040",
  },
  {
    title: "Health-Care",
    description: "Delivering essential medical services, mobile clinics, and health awareness programs to underserved communities.",
    icon: Stethoscope,
    href: "/healthcare",
    color: "from-[#0d3d1a] to-[#0a2812]",
    accent: "#d4a017",
  },
  {
    title: "Media / TV",
    description: "Using the power of media and television to amplify African voices, stories of hope, and positive change.",
    icon: Tv,
    href: "/media",
    color: "from-[#0a2812] to-[#062010]",
    accent: "#f0c040",
  },
];

const testimonials = [
  {
    quote: "Africa of Hope gave my children a chance at education I could never have afforded. They transformed our entire community.",
    name: "Amina Wanjiru",
    role: "Mother of 4, Kenya",
    initials: "AW",
  },
  {
    quote: "The mobile clinic came to our village for the first time. Hundreds of people received care they had never accessed before.",
    name: "Dr. Emmanuel Asante",
    role: "Community Leader, Ghana",
    initials: "EA",
  },
  {
    quote: "Through their media program, our local stories reached the world. We feel seen, heard, and celebrated.",
    name: "Fatima Diallo",
    role: "Journalist, Senegal",
    initials: "FD",
  },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      el.style.transform = `translateY(${window.scrollY * 0.3}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openDonate = () => {
    if (typeof window !== "undefined" && (window as any).formsapp) {
      (window as any).formsapp("69d3e6688d0ad42decac4b79", "popup");
    }
  };

  return (
    <div className="pt-[57px]">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div
          ref={heroRef}
          className="absolute inset-0 gradient-hero"
          style={{ willChange: "transform" }}
        />
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#d4a017]/10 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-[#1a6b2a]/30 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#d4a017]/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[#d4a017]/10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#d4a017]/15 border border-[#d4a017]/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#d4a017] animate-pulse" />
              <span className="text-[#d4a017] text-xs font-semibold uppercase tracking-widest">
                Non-Profit Organization
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6">
              Transforming{" "}
              <span className="text-gradient-gold">Africa</span>
              <br />
              One Life at a Time
            </h1>
            <p className="text-white/70 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl">
              Africa of Hope — Arms &amp; Service is a nonprofit committed to bringing charity, education, healthcare, and media empowerment to the most vulnerable communities across Africa.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={openDonate}
                className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-black px-8 py-4 rounded-full text-base shadow-xl transition-all duration-200 hover:scale-105"
              >
                <Heart className="w-5 h-5" />
                Donate Now
              </button>
              <Link
                href="/about"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-full text-base border border-white/20 transition-all duration-200"
              >
                Our Mission
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-white/30" />
          <span className="text-white/40 text-xs uppercase tracking-widest">Scroll</span>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-[#d4a017] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {impactStats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="w-6 h-6 text-[#0f0f0f]/60 mx-auto mb-2" />
                <div className="text-4xl font-black text-[#0f0f0f] mb-1">{value}</div>
                <div className="text-[#0f0f0f]/70 text-sm font-semibold uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Arms */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3">
              Our Arms of Service
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-[#0f0f0f] mb-4">
              Four Pillars of{" "}
              <span className="text-[#1a6b2a]">Change</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              We work across four interconnected programs to create lasting, sustainable change in African communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {arms.map(({ title, description, icon: Icon, href, color, accent }) => (
              <Link key={href} href={href} className="group block">
                <div className={`bg-gradient-to-br ${color} rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${accent}20`, border: `1px solid ${accent}30` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: accent }} />
                  </div>
                  <h3 className="text-white font-black text-xl mb-3">{title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed mb-5">{description}</p>
                  <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: accent }}>
                    Learn More <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="inline-block text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3">
                Our Mission
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-[#0f0f0f] mb-6 leading-tight">
                Hope is not a charity. It's a <span className="text-[#d4a017]">human right.</span>
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-6">
                Africa of Hope was born from a deep belief that every African deserves dignity, opportunity, and a voice. We bridge the gap between need and possibility — delivering real, measurable impact in communities that have been left behind.
              </p>
              <p className="text-gray-600 text-base leading-relaxed mb-8">
                From rural villages to urban centers, our teams bring food, books, medicine, and media representation. We don't just help — we partner with communities to build lasting self-sufficiency.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/about"
                  className="flex items-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold px-6 py-3 rounded-full text-sm transition-all duration-200"
                >
                  Read Our Story <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={openDonate}
                  className="flex items-center gap-2 bg-[#d4a017]/10 border border-[#d4a017] text-[#d4a017] hover:bg-[#d4a017] hover:text-[#0f0f0f] font-bold px-6 py-3 rounded-full text-sm transition-all duration-200"
                >
                  <Heart className="w-4 h-4" />
                  Support Our Work
                </button>
              </div>
            </div>

            {/* Visual block */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#1a6b2a] to-[#0d3d1a] rounded-3xl p-10 text-white">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Food Packages Delivered", value: "120,000+" },
                    { label: "Students Supported", value: "8,500+" },
                    { label: "Medical Treatments", value: "35,000+" },
                    { label: "Media Broadcasts", value: "500+" },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/10 rounded-xl p-5">
                      <div className="text-2xl font-black text-[#d4a017] mb-1">{value}</div>
                      <div className="text-white/65 text-xs leading-snug">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-5 bg-[#d4a017]/15 border border-[#d4a017]/30 rounded-xl">
                  <div className="text-[#d4a017] font-black text-sm mb-1">2024 Annual Impact</div>
                  <p className="text-white/70 text-xs leading-relaxed">
                    This year, our combined programs reached over 15,000 new beneficiaries across 8 countries, with a 94% satisfaction rate in community surveys.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#0d3d1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-[#d4a017] font-bold text-xs uppercase tracking-widest mb-3">
              Stories of Hope
            </span>
            <h2 className="text-4xl font-black text-white">
              Voices from the{" "}
              <span className="text-[#d4a017]">Field</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, role, initials }) => (
              <div key={name} className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/8 transition-colors">
                <div className="text-[#d4a017] text-3xl font-serif mb-4">"</div>
                <p className="text-white/80 text-sm leading-relaxed mb-6 italic">{quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#d4a017] flex items-center justify-center text-[#0f0f0f] font-black text-sm">
                    {initials}
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">{name}</div>
                    <div className="text-white/50 text-xs">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-[#d4a017]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-[#0f0f0f] mb-4">
            Ready to Change a Life Today?
          </h2>
          <p className="text-[#0f0f0f]/70 text-lg mb-10 max-w-xl mx-auto">
            Every dollar you give funds food, education, healthcare, or media representation for someone who needs it most.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={openDonate}
              className="flex items-center gap-2 bg-[#0d3d1a] hover:bg-[#1a6b2a] text-white font-black px-8 py-4 rounded-full text-base shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Heart className="w-5 h-5" />
              Donate Now
            </button>
            <Link
              href="/contact"
              className="flex items-center gap-2 bg-[#0f0f0f]/10 hover:bg-[#0f0f0f]/20 text-[#0f0f0f] font-bold px-8 py-4 rounded-full text-base border border-[#0f0f0f]/20 transition-all duration-200"
            >
              Get Involved <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
