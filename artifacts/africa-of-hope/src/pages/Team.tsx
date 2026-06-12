import { Heart, Linkedin, Mail, Quote, Users, Building2, Compass, HandHeart, GraduationCap, Stethoscope, Tv, Megaphone } from "lucide-react";
import { openDonate } from "@/lib/donate";
import { useInView } from "@/hooks/useInView";

const executives = [
  {
    name: "Dr. Sarah Okafor",
    role: "Founder & Executive Director",
    initials: "SO",
    bio: "A lifelong advocate for African development, Dr. Okafor founded Africa of Hope to turn compassion into measurable, lasting change across the continent.",
  },
  {
    name: "Prof. James Mwangi",
    role: "Deputy Director & Director of Education",
    initials: "JM",
    bio: "An educator of three decades, Prof. Mwangi leads our tuition-free schools and scholarship programs, opening doors for the next generation of leaders.",
  },
  {
    name: "Dr. Amara Diallo",
    role: "Director of Health-Care",
    initials: "AD",
    bio: "A public-health physician, Dr. Diallo oversees our mobile clinics and community health initiatives reaching remote and underserved communities.",
  },
];

const departmentHeads = [
  { name: "Mr. Kwame Asante", role: "Head of Charity", icon: HandHeart, initials: "KA" },
  { name: "Prof. James Mwangi", role: "Head of Education", icon: GraduationCap, initials: "JM" },
  { name: "Dr. Amara Diallo", role: "Head of Health-Care", icon: Stethoscope, initials: "AD" },
  { name: "Ms. Nkechi Eze", role: "Head of Media / TV", icon: Tv, initials: "NE" },
  { name: "Mr. Tunde Bello", role: "Head of Advocacy", icon: Megaphone, initials: "TB" },
];

const board = [
  { name: "Hon. Grace Konneh", role: "Board Chairperson", initials: "GK" },
  { name: "Mr. Daniel Roberts", role: "Vice Chairperson", initials: "DR" },
  { name: "Ms. Fatuma Hassan", role: "Board Secretary", initials: "FH" },
  { name: "Dr. Emmanuel Sirleaf", role: "Treasurer", initials: "ES" },
  { name: "Mrs. Aisha Bangura", role: "Board Member", initials: "AB" },
  { name: "Mr. Joseph Tarpeh", role: "Board Member", initials: "JT" },
];

const advisors = [
  { name: "Prof. Linda Achebe", role: "Education Policy Advisor" },
  { name: "Dr. Mohamed Sesay", role: "Public Health Advisor" },
  { name: "Ms. Patience Cole", role: "Media & Communications Advisor" },
  { name: "Mr. Victor Nyong", role: "Finance & Governance Advisor" },
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

export default function Team() {
  const { ref: heroRef, inView: heroIn } = useInView();

  return (
    <div className="pt-[57px]">
      {/* Hero */}
      <section className="gradient-hero py-24 text-white">
        <div
          ref={heroRef as React.RefObject<HTMLDivElement>}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-700 ${heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <span className="inline-block text-[#d4a017] font-bold text-xs uppercase tracking-widest mb-4">Our Team</span>
          <h1 className="text-5xl lg:text-6xl font-black mb-6">
            Meet Our <span className="text-gradient-gold">Leadership</span>
          </h1>
          <p className="text-white/70 text-xl max-w-3xl mx-auto leading-relaxed">
            Behind every program is a team of dedicated professionals, volunteers, and community partners — united by one vision: a thriving, empowered, self-sufficient Africa.
          </p>
        </div>
      </section>

      {/* Leadership message */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="relative bg-[#f7f5f0] rounded-3xl p-10 sm:p-12">
              <Quote className="w-12 h-12 text-[#d4a017] mb-5" />
              <p className="text-xl sm:text-2xl font-bold text-[#0f0f0f] leading-relaxed mb-6">
                "We believe Africa's greatest resource is its people. Our team exists to unlock that potential — restoring dignity, building futures, and empowering communities one life at a time."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1a6b2a] to-[#0d3d1a] flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                  SO
                </div>
                <div>
                  <div className="font-black text-[#0f0f0f]">Dr. Sarah Okafor</div>
                  <div className="text-[#1a6b2a] text-sm font-medium">Founder &amp; Executive Director</div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Executive Leadership */}
      <section className="py-20 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block flex items-center justify-center gap-2">
                <Compass className="w-4 h-4" /> Executive Leadership
              </span>
              <h2 className="text-4xl font-black text-[#0f0f0f]">The People Leading the Mission</h2>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {executives.map(({ name, role, initials, bio }, i) => (
              <AnimatedSection key={name} delay={i * 90}>
                <div className="bg-white rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-200 h-full flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1a6b2a] to-[#0d3d1a] flex items-center justify-center text-white font-black text-3xl mb-5">
                    {initials}
                  </div>
                  <div className="font-black text-[#0f0f0f] text-lg">{name}</div>
                  <div className="text-[#d4a017] text-sm font-bold mb-4">{role}</div>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1">{bio}</p>
                  <div className="flex items-center gap-3 mt-6">
                    <span className="w-9 h-9 rounded-full bg-[#1a6b2a]/10 flex items-center justify-center text-[#1a6b2a] hover:bg-[#1a6b2a] hover:text-white transition-colors cursor-pointer">
                      <Linkedin className="w-4 h-4" />
                    </span>
                    <span className="w-9 h-9 rounded-full bg-[#1a6b2a]/10 flex items-center justify-center text-[#1a6b2a] hover:bg-[#1a6b2a] hover:text-white transition-colors cursor-pointer">
                      <Mail className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Department Heads */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block flex items-center justify-center gap-2">
                <Users className="w-4 h-4" /> Department Heads
              </span>
              <h2 className="text-4xl font-black text-[#0f0f0f]">Leading Each Program Arm</h2>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departmentHeads.map(({ name, role, icon: Icon, initials }, i) => (
              <AnimatedSection key={role} delay={i * 70}>
                <div className="border border-gray-100 rounded-2xl p-7 flex items-center gap-5 hover:border-[#1a6b2a]/30 hover:shadow-md transition-all h-full">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1a6b2a] to-[#0d3d1a] flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-[#0f0f0f] truncate">{name}</div>
                    <div className="text-[#1a6b2a] text-sm font-medium flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      {role}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Board of Directors */}
      <section className="py-20 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4" /> Governance
              </span>
              <h2 className="text-4xl font-black text-[#0f0f0f]">Board of Directors</h2>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {board.map(({ name, role, initials }, i) => (
              <AnimatedSection key={name} delay={i * 60}>
                <div className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition-all h-full">
                  <div className="w-14 h-14 rounded-full bg-[#1a6b2a]/10 text-[#1a6b2a] flex items-center justify-center mx-auto mb-3 font-black">
                    {initials}
                  </div>
                  <div className="font-black text-[#0f0f0f] text-sm">{name}</div>
                  <div className="text-[#1a6b2a] text-xs font-medium mt-0.5">{role}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Advisory Council */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">Expert Guidance</span>
              <h2 className="text-4xl font-black text-[#0f0f0f]">Advisory Council</h2>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {advisors.map(({ name, role }, i) => (
              <AnimatedSection key={name} delay={i * 60}>
                <div className="border-2 border-gray-100 hover:border-[#d4a017]/40 rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-md h-full">
                  <div className="font-black text-[#0f0f0f] text-sm mb-1">{name}</div>
                  <div className="text-[#1a6b2a] text-xs font-medium">{role}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#d4a017] text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-black text-[#0f0f0f] mb-4">Join Our Team</h2>
          <p className="text-[#0f0f0f]/70 text-lg mb-8">
            We're always looking for passionate people, volunteers, and partners who share our commitment to transforming African communities.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:Afrohope033@gmail.com?subject=Joining the Team — Africa of Hope"
              className="flex items-center gap-2 bg-[#0d3d1a] hover:bg-[#1a6b2a] text-white font-black px-8 py-4 rounded-full shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              Get in Touch
            </a>
            <button
              onClick={openDonate}
              className="flex items-center gap-2 bg-white hover:bg-white/90 text-[#0d3d1a] font-black px-8 py-4 rounded-full shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Heart className="w-5 h-5" />
              Support Our Work
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
