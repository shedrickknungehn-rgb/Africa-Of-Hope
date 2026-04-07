import { Heart, Target, Eye, Users, Award, Globe, Handshake } from "lucide-react";
import { openDonate } from "@/lib/donate";
import { useInView } from "@/hooks/useInView";

const values = [
  { icon: Heart, title: "Compassion", description: "We lead with empathy, treating every beneficiary with dignity and respect." },
  { icon: Target, title: "Impact-Driven", description: "Every program is designed for measurable, lasting change — not just charity." },
  { icon: Globe, title: "Pan-African", description: "We honor the diversity and strength of all African peoples and cultures." },
  { icon: Users, title: "Community-Led", description: "We partner with local leaders and communities to ensure programs are sustainable." },
  { icon: Eye, title: "Transparency", description: "We publish clear financial reports and hold ourselves accountable to our donors." },
  { icon: Award, title: "Excellence", description: "We maintain the highest standards in program delivery and governance." },
];

const team = [
  { name: "Dr. Sarah Okafor", role: "Founder & Executive Director", initials: "SO" },
  { name: "Prof. James Mwangi", role: "Director of Education Programs", initials: "JM" },
  { name: "Dr. Amara Diallo", role: "Head of Health-Care Division", initials: "AD" },
  { name: "Ms. Nkechi Eze", role: "Media & Communications Director", initials: "NE" },
  { name: "Mr. Kwame Asante", role: "Charity Initiative Coordinator", initials: "KA" },
  { name: "Ms. Fatuma Hassan", role: "Community Partnerships Manager", initials: "FH" },
];

const partners = [
  { name: "UNICEF", category: "Child Welfare" },
  { name: "WHO Africa", category: "Healthcare" },
  { name: "UNESCO", category: "Education" },
  { name: "African Union", category: "Policy & Governance" },
  { name: "ECOWAS", category: "Regional Development" },
  { name: "Red Cross Liberia", category: "Emergency Relief" },
  { name: "World Food Programme", category: "Food Security" },
  { name: "Gates Foundation", category: "Health & Education" },
];

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function About() {
  const { ref: heroRef, inView: heroIn } = useInView();

  return (
    <div className="pt-[57px]">
      {/* Hero */}
      <section className="gradient-hero py-24 text-white">
        <div
          ref={heroRef as React.RefObject<HTMLDivElement>}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-700 ${heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <span className="inline-block text-[#d4a017] font-bold text-xs uppercase tracking-widest mb-4">Who We Are</span>
          <h1 className="text-5xl lg:text-6xl font-black mb-6">
            About Africa of <span className="text-gradient-gold">Hope</span>
          </h1>
          <p className="text-white/70 text-xl max-w-3xl mx-auto leading-relaxed">
            Founded on the belief that Africa's greatest resource is its people, we exist to unlock potential, restore dignity, and build futures — one community at a time.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">Our Story</span>
              <h2 className="text-4xl font-black text-[#0f0f0f] mb-6">
                Born from <span className="text-[#d4a017]">Necessity</span>, Built on <span className="text-[#1a6b2a]">Hope</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Africa of Hope — Arms &amp; Service was established to address the pressing humanitarian, educational, healthcare, and media representation gaps facing millions of Africans daily. What began as a grassroots initiative in Liberia quickly grew into a continental force for positive change.
                </p>
                <p>
                  Our founders witnessed firsthand the suffering caused by poverty, lack of access to education, absent healthcare, and the silencing of African narratives in global media. They refused to accept these conditions as inevitable.
                </p>
                <p>
                  Today, Africa of Hope operates across 25 countries with a team of dedicated professionals, volunteers, and community partners — all united by one vision: a thriving, empowered, self-sufficient Africa.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={150}>
              <div className="bg-gradient-to-br from-[#1a6b2a] to-[#0d3d1a] rounded-3xl p-10">
                <div className="space-y-6">
                  {[
                    { year: "2009", event: "Africa of Hope founded in Liberia, West Africa" },
                    { year: "2012", event: "Expanded education programs to 5 countries" },
                    { year: "2015", event: "Launched mobile health clinics across West Africa" },
                    { year: "2018", event: "Africa of Hope Media launched — giving voice to Africa" },
                    { year: "2021", event: "Reached 1 million beneficiaries milestone" },
                    { year: "2024", event: "Active in 25 countries with 500+ community partners" },
                  ].map(({ year, event }) => (
                    <div key={year} className="flex gap-5">
                      <div className="text-[#d4a017] font-black text-sm w-12 flex-shrink-0 pt-0.5">{year}</div>
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#d4a017] mt-1.5 flex-shrink-0" />
                        <p className="text-white/75 text-sm leading-relaxed">{event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Image Feature */}
      <section className="relative h-56 sm:h-72 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80"
          alt="Africa of Hope — empowering communities across Africa"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d3d1a]/85 via-[#0d3d1a]/50 to-transparent flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-white font-black text-xl sm:text-3xl max-w-lg leading-tight">
              "Founded on the belief that Africa's greatest resource is its people."
            </p>
            <p className="text-[#d4a017] text-sm font-semibold mt-2 uppercase tracking-widest">Africa of Hope — Arms &amp; Service</p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <AnimatedSection>
              <div className="bg-[#1a6b2a] rounded-2xl p-10 text-white h-full">
                <Target className="w-10 h-10 text-[#d4a017] mb-5" />
                <h3 className="text-2xl font-black mb-4">Our Mission</h3>
                <p className="text-white/75 leading-relaxed">
                  To empower African communities through comprehensive, sustainable programs in charity, education, healthcare, and media — restoring dignity, unlocking potential, and building self-sufficient futures for generations to come.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={120}>
              <div className="bg-[#0d3d1a] rounded-2xl p-10 text-white h-full">
                <Eye className="w-10 h-10 text-[#d4a017] mb-5" />
                <h3 className="text-2xl font-black mb-4">Our Vision</h3>
                <p className="text-white/75 leading-relaxed">
                  An Africa where every person has access to food security, quality education, essential healthcare, and the opportunity to tell their own story — a continent that thrives on its own terms, proud of its heritage and confident in its future.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">What Guides Us</span>
              <h2 className="text-4xl font-black text-[#0f0f0f]">Our Core Values</h2>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, description }, i) => (
              <AnimatedSection key={title} delay={i * 80}>
                <div className="border border-gray-100 rounded-2xl p-7 hover:border-[#1a6b2a]/30 hover:shadow-md transition-all duration-200 h-full">
                  <div className="w-12 h-12 rounded-xl bg-[#1a6b2a]/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#1a6b2a]" />
                  </div>
                  <h4 className="font-black text-[#0f0f0f] mb-2">{title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">Our Leadership</span>
              <h2 className="text-4xl font-black text-[#0f0f0f]">The Team Behind the Mission</h2>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map(({ name, role, initials }, i) => (
              <AnimatedSection key={name} delay={i * 70}>
                <div className="bg-white rounded-2xl p-7 flex items-center gap-5 hover:shadow-md transition-all h-full">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1a6b2a] to-[#0d3d1a] flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                    {initials}
                  </div>
                  <div>
                    <div className="font-black text-[#0f0f0f]">{name}</div>
                    <div className="text-[#1a6b2a] text-sm font-medium">{role}</div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Partners & Supporters */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">Our Network</span>
              <h2 className="text-4xl font-black text-[#0f0f0f] mb-4">Partners &amp; Supporters</h2>
              <p className="text-gray-500 max-w-xl mx-auto text-base">
                We collaborate with world-class organizations to maximize impact across every program arm.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {partners.map(({ name, category }, i) => (
              <AnimatedSection key={name} delay={i * 60}>
                <div className="border-2 border-gray-100 hover:border-[#d4a017]/40 rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-md group">
                  <div className="w-12 h-12 rounded-full bg-[#1a6b2a]/10 group-hover:bg-[#d4a017]/10 flex items-center justify-center mx-auto mb-3 transition-colors">
                    <Handshake className="w-5 h-5 text-[#1a6b2a] group-hover:text-[#d4a017] transition-colors" />
                  </div>
                  <div className="font-black text-[#0f0f0f] text-sm mb-1">{name}</div>
                  <div className="text-[#1a6b2a] text-xs font-medium">{category}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={200}>
            <div className="mt-12 bg-[#f7f5f0] rounded-2xl p-8 text-center">
              <p className="text-gray-600 text-sm leading-relaxed max-w-2xl mx-auto">
                <span className="font-bold text-[#0f0f0f]">Interested in partnering with Africa of Hope?</span> We welcome organizations, businesses, governments, and individuals who share our commitment to transforming African communities.
              </p>
              <a
                href="mailto:Afrohope033@gmail.com?subject=Partnership Inquiry — Africa of Hope"
                className="inline-flex items-center gap-2 mt-5 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold px-6 py-3 rounded-full text-sm transition-all"
              >
                Become a Partner
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#d4a017] text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-black text-[#0f0f0f] mb-4">Join Our Mission</h2>
          <p className="text-[#0f0f0f]/70 text-lg mb-8">
            Whether through donation, volunteering, or partnership — there's a place for you in the Africa of Hope family.
          </p>
          <button
            onClick={openDonate}
            className="flex items-center gap-2 mx-auto bg-[#0d3d1a] hover:bg-[#1a6b2a] text-white font-black px-8 py-4 rounded-full shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Heart className="w-5 h-5" />
            Donate Today
          </button>
        </div>
      </section>
    </div>
  );
}
