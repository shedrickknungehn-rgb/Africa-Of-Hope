import { Scale, Shield, Users, Heart, Globe, Megaphone, ChevronRight, ArrowRight } from "lucide-react";
import { openDonate } from "@/lib/donate";
import { Link } from "wouter";
import { useInView } from "@/hooks/useInView";

const programs = [
  {
    icon: Scale,
    title: "Human Rights & Rule of Law",
    description: "Advocating for fair justice, protection of civil liberties, and accountability in Liberia's public institutions — ensuring every citizen's rights are upheld.",
    impact: "12 policy engagements in 2024",
  },
  {
    icon: Shield,
    title: "Women & Girls Empowerment",
    description: "Championing the rights of Liberian women and girls through legal literacy programs, gender-based violence prevention, and access to education and economic opportunities.",
    impact: "2,500+ women reached",
  },
  {
    icon: Users,
    title: "Youth Civic Engagement",
    description: "Mobilizing Liberian youth to participate in governance, community development, and national decision-making — building the next generation of civic leaders.",
    impact: "1,800 youth engaged",
  },
  {
    icon: Globe,
    title: "Land Rights & Housing",
    description: "Supporting Liberian families in rural areas to secure their land tenure rights, resolve land disputes, and access fair housing solutions under Liberia's land law.",
    impact: "300+ land cases supported",
  },
  {
    icon: Megaphone,
    title: "Media Freedom & Press Rights",
    description: "Protecting the freedom of Liberian journalists, supporting independent media, and advocating for an open information environment in Liberia.",
    impact: "45 journalists supported",
  },
  {
    icon: Heart,
    title: "Health Policy Reform",
    description: "Engaging Liberia's Ministry of Health and county health teams to expand access to essential healthcare, particularly in underserved areas like Margibi County.",
    impact: "8 policy submissions filed",
  },
];

const liberiaFocus = [
  {
    title: "Margibi County Outreach",
    desc: "Based in Schiefflin Township, Lower Margibi County, our advocacy team works directly with county authorities to address local governance gaps, land disputes, and access to basic services along the RIA Highway corridor.",
    img: "https://images.unsplash.com/photo-1596455607563-ad6193f76b17?w=800&q=80",
  },
  {
    title: "Liberia National Reconciliation",
    desc: "We support post-conflict reconciliation efforts in Liberia, working with communities affected by historical trauma to build trust, promote forgiveness, and document truth — partnering with the Independent National Commission on Human Rights (INCHR).",
    img: "https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?w=800&q=80",
  },
  {
    title: "Youth & Education Policy",
    desc: "Through our School of Professional Studies and advocacy arm, we push for tuition-free education policies at county level, increased government allocation to education, and recognition of vocational training in Liberia's national curriculum.",
    img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
  },
];

const victories = [
  { year: "2022", title: "Land Rights for 45 Families", location: "Margibi County, Liberia", desc: "Secured legal land titles for 45 displaced families along the RIA Highway after a 14-month advocacy campaign." },
  { year: "2023", title: "Free School Meals Policy", location: "Lower Margibi Schools", desc: "Successfully advocated for a county-wide school feeding program covering 8 primary schools in Schiefflin Township." },
  { year: "2024", title: "Women's Legal Aid Center Opened", location: "Schiefflin Township", desc: "Launched a free legal aid center for women, serving over 200 clients in its first six months of operation." },
  { year: "2025", title: "Youth Civic Council Established", location: "Liberia-wide", desc: "Partnered with 12 youth organizations across Liberia to form an official Youth Civic Council recognized by the Ministry of Youth & Sports." },
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

export default function Advocacy() {
  const { ref: heroRef, inView: heroIn } = useInView();
  return (
    <div className="pt-[57px]">
      {/* Hero */}
      <section className="gradient-hero py-24 text-white">
        <div
          ref={heroRef as React.RefObject<HTMLDivElement>}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#d4a017]/20 border border-[#d4a017]/30 flex items-center justify-center">
              <Scale className="w-6 h-6 text-[#d4a017]" />
            </div>
            <span className="text-[#d4a017] font-bold text-xs uppercase tracking-widest">Advocacy Program</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black mb-6 max-w-3xl">
            Justice, Rights &amp; <span className="text-gradient-gold">Change</span>
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            Africa of Hope Inc speaks truth to power — advocating for the rights, dignity, and political voice of communities across Liberia and beyond. We believe justice is inseparable from hope.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#d4a017] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "25+", label: "Policy Campaigns" },
              { value: "5,000+", label: "Rights Advocates Trained" },
              { value: "4", label: "Policy Victories in 2024" },
              { value: "12", label: "Counties in Liberia Reached" },
            ].map(({ value, label }) => (
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
          <AnimatedSection>
            <div className="text-center mb-14">
              <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">What We Fight For</span>
              <h2 className="text-4xl font-black text-[#0f0f0f]">Our Advocacy Areas</h2>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map(({ icon: Icon, title, description, impact }, i) => (
              <AnimatedSection key={title} delay={i * 70}>
                <div className="bg-[#f7f5f0] rounded-2xl p-8 hover:shadow-md transition-all h-full">
                  <div className="w-12 h-12 rounded-xl bg-[#1a6b2a]/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-[#1a6b2a]" />
                  </div>
                  <h3 className="font-black text-[#0f0f0f] text-lg mb-3">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{description}</p>
                  <div className="inline-flex items-center gap-2 bg-[#d4a017]/10 border border-[#d4a017]/30 rounded-full px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4a017]" />
                    <span className="text-[#d4a017] text-xs font-semibold">{impact}</span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Liberia Focus */}
      <section className="py-20 bg-[#0d3d1a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <span className="text-[#d4a017] font-bold text-xs uppercase tracking-widest mb-3 block">Our Home Base</span>
              <h2 className="text-4xl font-black">Advocacy in Liberia</h2>
              <p className="text-white/60 mt-3 max-w-xl mx-auto text-sm">
                From our headquarters in Schiefflin Township, Lower Margibi-County, we lead advocacy initiatives that directly impact Liberian lives.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {liberiaFocus.map(({ title, desc, img }, i) => (
              <AnimatedSection key={title} delay={i * 100}>
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/8 transition-colors h-full">
                  <img src={img} alt={title} className="w-full h-44 object-cover" loading="lazy" />
                  <div className="p-6">
                    <h3 className="font-black text-white text-lg mb-3">{title}</h3>
                    <p className="text-white/65 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Policy Victories */}
      <section className="py-20 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">What We've Won</span>
              <h2 className="text-4xl font-black text-[#0f0f0f]">Advocacy Victories</h2>
            </div>
          </AnimatedSection>
          <div className="space-y-5">
            {victories.map(({ year, title, location, desc }, i) => (
              <AnimatedSection key={title} delay={i * 80}>
                <div className="bg-white rounded-2xl p-7 shadow-sm flex gap-6">
                  <div className="text-center flex-shrink-0">
                    <div className="text-[#d4a017] font-black text-lg">{year}</div>
                    <div className="w-px h-full bg-[#d4a017]/20 mx-auto mt-2" />
                  </div>
                  <div>
                    <h3 className="font-black text-[#0f0f0f] text-lg mb-1">{title}</h3>
                    <div className="inline-flex items-center gap-1.5 bg-[#1a6b2a]/10 text-[#1a6b2a] text-xs font-bold px-3 py-1 rounded-full mb-3">
                      <Globe className="w-3 h-3" />{location}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Get Involved */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">Take Action</span>
              <h2 className="text-4xl font-black text-[#0f0f0f]">Join the Advocacy</h2>
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Sign Our Petitions", desc: "Add your voice to active campaigns pushing for policy change in Liberia and across Africa.", cta: "View Petitions" },
              { title: "Volunteer as an Advocate", desc: "Join our network of community advocates, legal volunteers, and civic educators on the ground.", cta: "Volunteer Now" },
              { title: "Fund the Movement", desc: "Your donation powers legal aid, policy research, community training, and advocacy campaigns.", cta: "Donate Now", action: openDonate },
            ].map(({ title, desc, cta, action }) => (
              <AnimatedSection key={title} delay={100}>
                <div className="bg-[#f7f5f0] rounded-2xl p-8 text-center h-full">
                  <Scale className="w-10 h-10 text-[#1a6b2a] mx-auto mb-4" />
                  <h3 className="font-black text-[#0f0f0f] text-lg mb-3">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">{desc}</p>
                  <button
                    onClick={action || openDonate}
                    className="flex items-center gap-2 mx-auto bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all"
                  >
                    {cta} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#d4a017] text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black text-[#0f0f0f] mb-4">Advocacy is Everyone's Responsibility</h2>
          <p className="text-[#0f0f0f]/70 mb-8">Change happens when communities stand together. Support Africa of Hope Inc's advocacy work across Liberia and the continent.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={openDonate} className="flex items-center gap-2 bg-[#0d3d1a] hover:bg-[#1a6b2a] text-white font-black px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105">
              <Heart className="w-5 h-5" />Fund Advocacy
            </button>
            <Link href="/contact" className="flex items-center gap-2 bg-[#0f0f0f]/10 hover:bg-[#0f0f0f]/20 text-[#0f0f0f] font-bold px-8 py-4 rounded-full border border-[#0f0f0f]/20 transition-all">
              Get Involved <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
