import { useState } from "react";
import { Heart, X, ChevronLeft, ChevronRight } from "lucide-react";
import { openDonate } from "@/lib/donate";
import { useInView } from "@/hooks/useInView";

const categories = ["All", "Charity", "Education", "Healthcare", "Media / TV", "Community"];

const photos = [
  { src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80", cat: "Education", caption: "Students in class — Africa of Hope Education Program", tall: true },
  { src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80", cat: "Charity", caption: "Food distribution to families in need", tall: false },
  { src: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=800&q=80", cat: "Healthcare", caption: "Mobile clinic providing free medical care", tall: false },
  { src: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80", cat: "Community", caption: "African communities — the heart of our mission", tall: true },
  { src: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80", cat: "Media / TV", caption: "Africa of Hope Media production team at work", tall: false },
  { src: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", cat: "Education", caption: "School children receiving quality education", tall: false },
  { src: "https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?w=800&q=80", cat: "Community", caption: "Community gathering — building futures together", tall: true },
  { src: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80", cat: "Healthcare", caption: "Healthcare workers delivering care in the field", tall: false },
  { src: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&q=80", cat: "Community", caption: "Empowering African women and families", tall: false },
  { src: "https://images.unsplash.com/photo-1536104968055-4d61aa56f46a?w=800&q=80", cat: "Charity", caption: "Essential supplies reach remote communities", tall: true },
  { src: "https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=800&q=80", cat: "Education", caption: "Vocational training — skills for life", tall: false },
  { src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80", cat: "Healthcare", caption: "Maternal health and child care outreach", tall: false },
  { src: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80", cat: "Healthcare", caption: "Free eye screening program restoring sight", tall: true },
  { src: "https://images.unsplash.com/photo-1569937756447-23f2c92d11c8?w=800&q=80", cat: "Community", caption: "Youth empowerment across Africa", tall: false },
  { src: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=800&q=80", cat: "Media / TV", caption: "Broadcasting hope — Africa of Hope TV", tall: false },
];

function GallerySection() {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    />
  );
}

export default function Gallery() {
  const [active, setActive] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const { ref: heroRef, inView: heroIn } = useInView();

  const filtered = active === "All" ? photos : photos.filter((p) => p.cat === active);

  const goPrev = () => {
    if (lightbox === null) return;
    setLightbox((lightbox - 1 + filtered.length) % filtered.length);
  };
  const goNext = () => {
    if (lightbox === null) return;
    setLightbox((lightbox + 1) % filtered.length);
  };

  return (
    <div className="pt-[57px]">
      {/* Hero */}
      <section className="gradient-hero py-20 text-white">
        <div
          ref={heroRef as React.RefObject<HTMLDivElement>}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-700 ${heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <span className="inline-block text-[#d4a017] font-bold text-xs uppercase tracking-widest mb-4">Our Impact in Pictures</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
            Gallery of <span className="text-gradient-gold">Hope</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Every image tells a story of resilience, transformation, and hope. Browse moments captured from our programs across Africa.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      <section className="bg-white border-b border-gray-100 py-4 sticky top-[57px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all flex-shrink-0 ${
                  active === cat
                    ? "bg-[#1a6b2a] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-[#1a6b2a]/10 hover:text-[#1a6b2a]"
                }`}
              >
                {cat}
                {cat === "All" ? (
                  <span className="ml-1.5 text-xs opacity-70">({photos.length})</span>
                ) : (
                  <span className="ml-1.5 text-xs opacity-70">({photos.filter((p) => p.cat === cat).length})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="py-12 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filtered.map((photo, i) => (
              <PhotoCard
                key={`${active}-${i}`}
                photo={photo}
                index={i}
                onClick={() => setLightbox(i)}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">No photos in this category yet.</div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#0d3d1a] text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black mb-4">Be Part of the Story</h2>
          <p className="text-white/70 mb-8">Every donation adds a new chapter of hope to our gallery. Your support creates moments worth capturing.</p>
          <button
            onClick={openDonate}
            className="flex items-center gap-2 mx-auto bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-black px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105"
          >
            <Heart className="w-5 h-5" />
            Donate &amp; Make History
          </button>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-[#d4a017] flex items-center justify-center text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-[#d4a017] flex items-center justify-center text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={filtered[lightbox].src.replace("w=800", "w=1400")}
              alt={filtered[lightbox].caption}
              className="w-full max-h-[75vh] object-contain rounded-xl"
            />
            <div className="text-center mt-4">
              <span className="inline-block bg-[#d4a017]/20 text-[#d4a017] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                {filtered[lightbox].cat}
              </span>
              <p className="text-white/80 text-sm">{filtered[lightbox].caption}</p>
              <p className="text-white/40 text-xs mt-2">{lightbox + 1} / {filtered.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoCard({ photo, index, onClick }: { photo: typeof photos[0]; index: number; onClick: () => void }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`break-inside-avoid mb-4 transition-all duration-500 cursor-pointer group ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${(index % 3) * 80}ms` }}
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow">
        <img
          src={photo.src}
          alt={photo.caption}
          className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div>
            <span className="text-[#d4a017] text-xs font-bold uppercase tracking-wide block mb-1">{photo.cat}</span>
            <p className="text-white text-sm font-medium leading-snug">{photo.caption}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
