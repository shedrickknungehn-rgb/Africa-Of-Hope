import { Stethoscope, Heart, Activity, Baby, Eye, Syringe, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Activity,
    title: "Mobile Health Clinics",
    description: "Fully equipped mobile clinics that travel to remote and underserved areas, providing primary healthcare where there are no hospitals.",
    impact: "200+ clinic visits per month",
  },
  {
    icon: Baby,
    title: "Maternal & Child Health",
    description: "Prenatal care, safe delivery support, postnatal services, and immunization programs to protect mothers and newborns.",
    impact: "5,000+ safe deliveries supported",
  },
  {
    icon: Eye,
    title: "Eye Care Program",
    description: "Free eye screenings, corrective lenses, and cataract surgeries restoring sight to thousands of Africans every year.",
    impact: "12,000+ treated",
  },
  {
    icon: Syringe,
    title: "Vaccination Drives",
    description: "Mass immunization campaigns for preventable diseases including malaria, meningitis, and polio across multiple countries.",
    impact: "100,000+ vaccinated",
  },
];

const stats = [
  { value: "35,000+", label: "Medical Treatments Given" },
  { value: "48hrs", label: "Emergency Response Time" },
  { value: "15", label: "Mobile Clinics Operating" },
  { value: "98%", label: "Patient Satisfaction Rate" },
];

export default function Healthcare() {
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
              <Stethoscope className="w-6 h-6 text-[#d4a017]" />
            </div>
            <span className="text-[#d4a017] font-bold text-xs uppercase tracking-widest">Health-Care</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black mb-6 max-w-3xl">
            Health is a <span className="text-gradient-gold">Human Right</span>
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            From mobile clinics in remote villages to maternal care programs and mass vaccination drives — our healthcare arm ensures that geography is no barrier to life-saving treatment.
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

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">Health Services</span>
            <h2 className="text-4xl font-black text-[#0f0f0f]">Our Healthcare Programs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {services.map(({ icon: Icon, title, description, impact }) => (
              <div key={title} className="bg-[#f7f5f0] rounded-2xl p-8 hover:shadow-md transition-all">
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
            ))}
          </div>
        </div>
      </section>

      {/* Partners in Health */}
      <section className="py-20 bg-[#0d3d1a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-[#d4a017] font-bold text-xs uppercase tracking-widest mb-3 block">Our Approach</span>
              <h2 className="text-4xl font-black mb-6">Healthcare Beyond the Hospital</h2>
              <p className="text-white/70 leading-relaxed mb-6">
                Most of Africa's healthcare needs are not met in hospitals — they're met in communities, villages, and homes. Our model of care goes where the need is, removing every barrier to access.
              </p>
              <div className="space-y-4">
                {[
                  "Free services for all beneficiaries — no user fees",
                  "Culturally sensitive care delivered in local languages",
                  "Integrated mental health and psychosocial support",
                  "Training local community health workers for sustainability",
                  "Referral networks connecting patients to higher care when needed",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#d4a017] flex items-center justify-center text-[#0f0f0f] text-xs font-black flex-shrink-0 mt-0.5">
                      ✓
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
                Fund Healthcare
              </button>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {[
                { title: "HIV/AIDS Awareness", desc: "Testing, counseling, and treatment support across high-prevalence regions", color: "bg-[#1a5c28]" },
                { title: "Malaria Prevention", desc: "Mosquito nets distribution and antimalarial treatment programs", color: "bg-[#155022]" },
                { title: "Clean Water Initiative", desc: "Borehole drilling and water purification to prevent waterborne diseases", color: "bg-[#0d3d1a]" },
                { title: "Nutrition Programs", desc: "Therapeutic feeding centers for malnourished children under five", color: "bg-[#0a2812]" },
              ].map(({ title, desc, color }) => (
                <div key={title} className={`${color} rounded-xl p-5`}>
                  <h4 className="text-white font-black text-sm mb-2">{title}</h4>
                  <p className="text-white/60 text-xs leading-snug">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Donation tiers */}
      <section className="py-20 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-[#0f0f0f] mb-4">Fund Life-Saving Care</h2>
            <p className="text-gray-500 text-lg">Your donation goes directly to medical services in underserved communities.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { amount: "$20", impact: "Malaria treatment for a child" },
              { amount: "$50", impact: "Eye screening + corrective lenses" },
              { amount: "$100", impact: "Mobile clinic for one day" },
              { amount: "$250", impact: "Cataract surgery to restore sight" },
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
          <h2 className="text-3xl font-black mb-4">Healthy Communities, Prosperous Nations</h2>
          <p className="text-white/70 mb-8">Join our mission to bring essential healthcare to every corner of Africa.</p>
          <button
            onClick={openDonate}
            className="flex items-center gap-2 mx-auto bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-black px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105"
          >
            <Heart className="w-5 h-5" />
            Support Healthcare
          </button>
        </div>
      </section>
    </div>
  );
}
