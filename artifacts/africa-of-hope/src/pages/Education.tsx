import { BookOpen, GraduationCap, School, Laptop, Heart, ArrowRight } from "lucide-react";

const programs = [
  {
    icon: School,
    title: "School Building Program",
    description: "Constructing and refurbishing schools in rural and underserved communities, providing safe learning environments for thousands of children.",
    impact: "85 schools built or renovated",
  },
  {
    icon: GraduationCap,
    title: "Scholarship Fund",
    description: "Comprehensive scholarships for talented students from low-income families — covering tuition, books, accommodation, and mentorship.",
    impact: "3,200+ scholars supported",
  },
  {
    icon: Laptop,
    title: "Digital Literacy",
    description: "Equipping youth with 21st-century technology skills through computer labs, coding bootcamps, and internet access programs.",
    impact: "15,000+ youth trained",
  },
  {
    icon: BookOpen,
    title: "Adult Literacy",
    description: "Evening and weekend literacy classes for adults who missed formal education — opening new economic opportunities and empowerment.",
    impact: "8,500+ adults reached",
  },
];

const stats = [
  { value: "85", label: "Schools Built / Renovated" },
  { value: "3,200+", label: "Scholarships Awarded" },
  { value: "15,000+", label: "Youth in Digital Training" },
  { value: "94%", label: "Graduate Employment Rate" },
];

export default function Education() {
  const openDonate = () => {
    if (typeof window !== "undefined" && (window as any).formsapp) {
      (window as any).formsapp("69d3e6688d0ad42decac4b79", "popup");
    }
  };

  return (
    <div className="pt-[57px]">
      {/* Hero */}
      <section className="gradient-hero py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#d4a017]/20 border border-[#d4a017]/30 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#d4a017]" />
            </div>
            <span className="text-[#d4a017] font-bold text-xs uppercase tracking-widest">Education</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black mb-6 max-w-3xl">
            Education is the <span className="text-gradient-gold">Greatest Gift</span>
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            We believe that quality education is the foundation of everything — prosperity, health, civic participation, and hope. Our education programs unlock potential in every corner of Africa.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#d4a017] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-4xl font-black text-[#0f0f0f] mb-1">{value}</div>
                <div className="text-[#0f0f0f]/70 text-sm font-semibold uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">Education Arm</span>
            <h2 className="text-4xl font-black text-[#0f0f0f]">Our Education Programs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {programs.map(({ icon: Icon, title, description, impact }) => (
              <div key={title} className="bg-gradient-to-br from-[#f7f5f0] to-white border border-gray-100 rounded-2xl p-8 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#1a6b2a]/10 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-[#1a6b2a]" />
                </div>
                <h3 className="font-black text-[#0f0f0f] text-lg mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{description}</p>
                <div className="inline-flex items-center gap-2 bg-[#1a6b2a]/10 border border-[#1a6b2a]/20 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1a6b2a]" />
                  <span className="text-[#1a6b2a] text-xs font-semibold">{impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scholarship Spotlight */}
      <section className="py-20 bg-[#0d3d1a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-[#d4a017] font-bold text-xs uppercase tracking-widest mb-3 block">Scholar Stories</span>
              <h2 className="text-4xl font-black mb-6">From Village to University</h2>
              <p className="text-white/70 leading-relaxed mb-6">
                Our scholarship recipients are not just students — they are the future doctors, engineers, teachers, and leaders who will transform Africa from within. We select students based on potential and need, then walk with them every step of the way.
              </p>
              <div className="space-y-4">
                {[
                  "Full tuition coverage for primary through university",
                  "Monthly stipend for living expenses",
                  "Mentorship from professionals in chosen field",
                  "Career placement support upon graduation",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#d4a017] flex items-center justify-center text-[#0f0f0f] text-xs font-black flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-white/70 text-sm">{item}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={openDonate}
                className="mt-8 flex items-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-black px-6 py-3 rounded-full transition-all hover:scale-105"
              >
                <Heart className="w-4 h-4" />
                Fund a Scholarship
              </button>
            </div>
            <div className="space-y-5">
              {[
                { name: "Blessing Oduya", course: "Medicine, University of Lagos", year: "Class of 2023", quote: "Africa of Hope didn't just pay my fees — they gave me a family and a future." },
                { name: "Emmanuel Kofi", course: "Engineering, KNUST Ghana", year: "Class of 2022", quote: "I went from a mud-floor classroom to a top engineering school. This is the power of a scholarship." },
              ].map(({ name, course, year, quote }) => (
                <div key={name} className="bg-white/8 border border-white/15 rounded-2xl p-6">
                  <p className="text-white/75 text-sm italic mb-4">"{quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#d4a017] flex items-center justify-center text-[#0f0f0f] font-black text-sm">
                      {name[0]}
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{name}</div>
                      <div className="text-white/50 text-xs">{course} · {year}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Donations */}
      <section className="py-20 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-[#0f0f0f] mb-4">Invest in Education</h2>
            <p className="text-gray-500 text-lg">Choose how you want to support learning across Africa.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { amount: "$15", impact: "Textbooks for a child" },
              { amount: "$40", impact: "School uniform set" },
              { amount: "$75", impact: "One month scholarship" },
              { amount: "$200", impact: "Full-year scholarship" },
            ].map(({ amount, impact }) => (
              <button
                key={amount}
                onClick={openDonate}
                className="group bg-white border-2 border-gray-100 hover:border-[#1a6b2a] rounded-2xl p-6 text-center transition-all hover:shadow-md"
              >
                <div className="text-3xl font-black text-[#1a6b2a] mb-2">{amount}</div>
                <div className="text-gray-600 text-sm mb-4 leading-snug">{impact}</div>
                <div className="inline-flex items-center gap-1 text-[#d4a017] font-bold text-xs">
                  Give <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#1a6b2a] text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black mb-4">An Educated Africa is a Thriving Africa</h2>
          <p className="text-white/70 mb-8">Help us build the next generation of African changemakers.</p>
          <button
            onClick={openDonate}
            className="flex items-center gap-2 mx-auto bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-black px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105"
          >
            <Heart className="w-5 h-5" />
            Support Education
          </button>
        </div>
      </section>
    </div>
  );
}
