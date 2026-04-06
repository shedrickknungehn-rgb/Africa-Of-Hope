import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { openDonate } from "@/lib/donate";

const slides = [
  {
    img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=80",
    tag: "Education",
    title: "Empowering Africa Through Education",
    sub: "Building schools, funding scholarships, and training the next generation of African leaders — from Liberia to every corner of the continent.",
    cta: "View School Programs",
    href: "/education",
    ctaColor: "bg-[#d4a017] text-[#0f0f0f]",
  },
  {
    img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80",
    tag: "Charity Initiative",
    title: "Compassion That Reaches the Unreached",
    sub: "Food packages, emergency shelter, essential supplies, and community development delivered directly to the most vulnerable families across Africa.",
    cta: "Support Charity",
    href: "/charity",
    ctaColor: "bg-[#d4a017] text-[#0f0f0f]",
  },
  {
    img: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=1920&q=80",
    tag: "Health-Care",
    title: "Health is a Human Right",
    sub: "Mobile clinics, maternal care, vaccination drives, and life-saving treatments brought directly to communities where hospitals don't exist.",
    cta: "Our Healthcare Programs",
    href: "/healthcare",
    ctaColor: "bg-[#d4a017] text-[#0f0f0f]",
  },
  {
    img: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1920&q=80",
    tag: "Media / TV",
    title: "Africa's Story, Told by Africans",
    sub: "Television, radio, podcasts, and documentaries amplifying African voices, countering harmful narratives, and inspiring millions worldwide.",
    cta: "Explore Media Arm",
    href: "/media",
    ctaColor: "bg-[#d4a017] text-[#0f0f0f]",
  },
  {
    img: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=80",
    tag: "Africa of Hope",
    title: "Transforming Africa, One Life at a Time",
    sub: "A nonprofit committed to charity, education, healthcare, and media empowerment across 25 countries — because every African deserves dignity and opportunity.",
    cta: "Donate Now",
    href: null,
    ctaColor: "bg-[#d4a017] text-[#0f0f0f]",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 900);
  }, [animating]);

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative h-screen min-h-[540px] max-h-[900px] overflow-hidden">
      {/* Background images — stack all, animate opacity */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <img
            src={s.img}
            alt={s.tag}
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d3d1a]/90 via-[#0d3d1a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/60 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Tag */}
            <div
              key={`tag-${current}`}
              className="inline-flex items-center gap-2 bg-[#d4a017]/20 border border-[#d4a017]/40 rounded-full px-4 py-1.5 mb-4 animate-[fadeSlideUp_0.6s_ease_forwards]"
            >
              <span className="w-2 h-2 rounded-full bg-[#d4a017] animate-pulse" />
              <span className="text-[#d4a017] text-xs font-bold uppercase tracking-widest">{slide.tag}</span>
            </div>

            {/* Heading */}
            <h1
              key={`h-${current}`}
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-5 animate-[fadeSlideUp_0.7s_ease_forwards]"
            >
              {slide.title}
            </h1>

            {/* Sub */}
            <p
              key={`sub-${current}`}
              className="text-white/75 text-base sm:text-lg leading-relaxed mb-8 max-w-xl animate-[fadeSlideUp_0.8s_ease_forwards]"
            >
              {slide.sub}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 animate-[fadeSlideUp_0.9s_ease_forwards]">
              {slide.href ? (
                <Link
                  href={slide.href}
                  className={`flex items-center gap-2 ${slide.ctaColor} font-black px-6 py-3 rounded-full text-sm shadow-xl transition-all hover:scale-105`}
                >
                  {slide.cta}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={openDonate}
                  className={`flex items-center gap-2 ${slide.ctaColor} font-black px-6 py-3 rounded-full text-sm shadow-xl transition-all hover:scale-105`}
                >
                  <Heart className="w-4 h-4" />
                  {slide.cta}
                </button>
              )}
              <button
                onClick={openDonate}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-full text-sm border border-white/20 transition-all backdrop-blur-sm"
              >
                <Heart className="w-4 h-4 text-[#d4a017]" />
                Donate Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-[#d4a017] border border-white/20 flex items-center justify-center text-white hover:text-[#0f0f0f] transition-all backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-[#d4a017] border border-white/20 flex items-center justify-center text-white hover:text-[#0f0f0f] transition-all backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-8 h-2.5 bg-[#d4a017]"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute top-6 right-6 z-20 text-white/50 text-xs font-bold tracking-widest hidden sm:block">
        {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </div>
    </section>
  );
}
