import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Heart, Play } from "lucide-react";
import { openDonate } from "@/lib/donate";

const slides = [
  {
    img: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920&q=90",
    tag: "Education",
    title: "Empowering Africa Through Education",
    sub: "Building tuition-free schools, funding scholarships, and training the next generation of African leaders — from Liberia to every corner of the continent.",
    cta: "View School Programs",
    href: "/education",
    accent: "#d4a017",
  },
  {
    img: "https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=1920&q=90",
    tag: "Charity Initiative",
    title: "Compassion That Reaches the Unreached",
    sub: "Food packages, emergency shelter, essential supplies, and community development delivered directly to the most vulnerable families across Africa.",
    cta: "Support Charity",
    href: "/charity",
    accent: "#d4a017",
  },
  {
    img: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=1920&q=90",
    tag: "Health-Care",
    title: "Health is a Human Right",
    sub: "Mobile clinics, maternal care, vaccination drives, and life-saving treatments brought directly to communities where hospitals don't exist.",
    cta: "Our Healthcare Programs",
    href: "/healthcare",
    accent: "#d4a017",
  },
  {
    img: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=90",
    tag: "Advocacy",
    title: "A Voice for the Voiceless",
    sub: "Championing human rights, land rights, gender justice, and policy reform — amplifying African communities on the world stage with dignity and courage.",
    cta: "Our Advocacy Work",
    href: "/advocacy",
    accent: "#d4a017",
  },
  {
    img: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1920&q=90",
    tag: "Media / TV",
    title: "Africa's Story, Told by Africans",
    sub: "Television, radio, podcasts, and documentaries amplifying African voices, countering harmful narratives, and inspiring millions worldwide.",
    cta: "Explore Media Arm",
    href: "/media",
    accent: "#d4a017",
  },
  {
    img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=90",
    tag: "Africa of Hope",
    title: "Transforming Africa, One Life at a Time",
    sub: "A nonprofit committed to charity, education, healthcare, media, and advocacy across Africa — because every African deserves dignity and opportunity.",
    cta: "Donate Now",
    href: null,
    accent: "#d4a017",
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
    const id = setInterval(next, 7000);
    return () => clearInterval(id);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative h-screen min-h-[560px] max-h-[960px] overflow-hidden">
      {/* Background images */}
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
          <div className="absolute inset-0 bg-gradient-to-r from-[#071f0d]/92 via-[#0d3d1a]/70 to-[#0d3d1a]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050f07]/80 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl xl:max-w-3xl">
            {/* Animated tag */}
            <div
              key={`tag-${current}`}
              className="inline-flex items-center gap-2.5 bg-[#d4a017]/15 border border-[#d4a017]/50 rounded-full px-4 py-1.5 mb-5 animate-[fadeSlideUp_0.5s_ease_forwards]"
            >
              <span className="w-2 h-2 rounded-full bg-[#d4a017] animate-pulse" />
              <span className="text-[#d4a017] text-xs font-extrabold uppercase tracking-widest">{slide.tag}</span>
            </div>

            {/* Heading */}
            <h1
              key={`h-${current}`}
              className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.05] mb-5 animate-[fadeSlideUp_0.65s_ease_forwards]"
            >
              {slide.title}
            </h1>

            {/* Sub */}
            <p
              key={`sub-${current}`}
              className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-xl animate-[fadeSlideUp_0.8s_ease_forwards]"
            >
              {slide.sub}
            </p>

            {/* CTAs */}
            <div
              key={`cta-${current}`}
              className="flex flex-wrap gap-3 animate-[fadeSlideUp_0.95s_ease_forwards]"
            >
              {slide.href ? (
                <Link
                  href={slide.href}
                  className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-black px-6 py-3.5 rounded-full text-sm shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4" />
                  {slide.cta}
                </Link>
              ) : (
                <button
                  onClick={openDonate}
                  className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-black px-6 py-3.5 rounded-full text-sm shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Heart className="w-4 h-4" />
                  {slide.cta}
                </button>
              )}
              <button
                onClick={openDonate}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold px-6 py-3.5 rounded-full text-sm border border-white/25 transition-all duration-200 backdrop-blur-sm"
              >
                <Heart className="w-4 h-4 text-[#d4a017]" />
                Donate Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/20 hover:bg-[#d4a017] border border-white/20 flex items-center justify-center text-white hover:text-[#0f0f0f] transition-all duration-200 backdrop-blur-sm active:scale-90 touch-manipulation"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/20 hover:bg-[#d4a017] border border-white/20 flex items-center justify-center text-white hover:text-[#0f0f0f] transition-all duration-200 backdrop-blur-sm active:scale-90 touch-manipulation"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Progress dots */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex gap-2.5 items-center">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-400 touch-manipulation ${
              i === current ? "w-9 h-2.5 bg-[#d4a017]" : "w-2.5 h-2.5 bg-white/35 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute top-6 right-6 z-20 hidden sm:flex items-center gap-2">
        <span className="text-[#d4a017] text-sm font-black">{String(current + 1).padStart(2, "0")}</span>
        <span className="text-white/30 text-xs">/</span>
        <span className="text-white/40 text-xs font-bold">{String(slides.length).padStart(2, "0")}</span>
      </div>

      {/* Bottom gradient bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 z-20 flex">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-full flex-1 transition-all duration-700 ${i === current ? "bg-[#d4a017]" : "bg-white/10"}`}
          />
        ))}
      </div>
    </section>
  );
}
