import { Heart, Package, Home, Utensils, Users, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { openDonate } from "@/lib/donate";

const programs = [
  {
    icon: Utensils,
    title: "Food Security Program",
    description: "Monthly food packages to over 10,000 families in food-insecure regions, ensuring no one goes to bed hungry.",
    impact: "10,000+ families fed monthly",
  },
  {
    icon: Home,
    title: "Emergency Shelter",
    description: "Rapid response shelter provision for communities displaced by conflict, drought, floods, and other disasters.",
    impact: "3,500+ shelter kits deployed",
  },
  {
    icon: Package,
    title: "Essential Supplies",
    description: "Hygiene kits, clothing, blankets, and household essentials delivered directly to families in need.",
    impact: "50,000+ kits distributed",
  },
  {
    icon: Users,
    title: "Community Development",
    description: "Long-term community building projects including water wells, sanitation facilities, and livelihood support.",
    impact: "120+ communities served",
  },
];

const initiatives = [
  {
    title: "The 1000 Families Campaign",
    description: "Our flagship charity drive provides comprehensive support packages to 1,000 selected families per quarter — covering food, hygiene, clothing, and educational materials.",
    badge: "Flagship Initiative",
    badgeColor: "#d4a017",
  },
  {
    title: "Disaster Relief Fund",
    description: "When catastrophe strikes, we mobilize within 48 hours. Our rapid response teams have delivered relief in floods, droughts, and conflict zones across 15 countries.",
    badge: "Emergency Response",
    badgeColor: "#1a6b2a",
  },
  {
    title: "Widow & Orphan Support",
    description: "Dedicated care packages, counseling, and livelihood training for widows and orphaned children — ensuring the most vulnerable are never left behind.",
    badge: "Vulnerable Groups",
    badgeColor: "#0d3d1a",
  },
];

export default function Charity() {
  return (
    <div className="pt-[57px]">
      {/* Hero */}
      <section className="gradient-hero py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#d4a017]/20 border border-[#d4a017]/30 flex items-center justify-center">
              <Heart className="w-6 h-6 text-[#d4a017]" />
            </div>
            <span className="text-[#d4a017] font-bold text-xs uppercase tracking-widest">Charity Initiative</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black mb-6 max-w-3xl">
            Compassion in <span className="text-gradient-gold">Action</span>
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            Our Charity Initiative delivers food, shelter, essential supplies, and community support to the most vulnerable families across Africa — responding to both chronic need and acute crises.
          </p>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">What We Do</span>
            <h2 className="text-4xl font-black text-[#0f0f0f]">Our Charity Programs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {programs.map(({ icon: Icon, title, description, impact }) => (
              <div key={title} className="bg-[#f7f5f0] rounded-2xl p-8 hover:shadow-md transition-all duration-200">
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

      {/* Image Feature */}
      <section className="relative h-56 sm:h-72 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=80"
          alt="Charity — community food aid across Africa"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d3d1a]/85 via-[#0d3d1a]/50 to-transparent flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-white font-black text-xl sm:text-3xl max-w-lg leading-tight">
              "Hunger is not a destiny — it's a solvable problem."
            </p>
            <p className="text-[#d4a017] text-sm font-semibold mt-2 uppercase tracking-widest">Africa of Hope — Charity Initiative</p>
          </div>
        </div>
      </section>

      {/* Key Initiatives */}
      <section className="py-20 bg-[#0d3d1a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#d4a017] font-bold text-xs uppercase tracking-widest mb-3 block">Spotlight</span>
            <h2 className="text-4xl font-black">Key Initiatives</h2>
          </div>
          <div className="space-y-6">
            {initiatives.map(({ title, description, badge, badgeColor }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col sm:flex-row gap-5 hover:bg-white/8 transition-colors">
                <div className="flex-1">
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-4"
                    style={{ backgroundColor: `${badgeColor}20`, color: badgeColor, border: `1px solid ${badgeColor}30` }}
                  >
                    {badge}
                  </div>
                  <h3 className="text-white font-black text-xl mb-3">{title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{description}</p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={openDonate}
                    className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-bold text-sm px-5 py-2.5 rounded-full whitespace-nowrap transition-all"
                  >
                    Support <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How You Help */}
      <section className="py-20 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">Your Impact</span>
            <h2 className="text-4xl font-black text-[#0f0f0f]">What Your Donation Does</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { amount: "$10", impact: "Feeds a child for a week" },
              { amount: "$25", impact: "Provides hygiene kit for a family" },
              { amount: "$50", impact: "Emergency food for a family of 5" },
              { amount: "$100", impact: "Shelter kit for a displaced family" },
            ].map(({ amount, impact }) => (
              <button
                key={amount}
                onClick={openDonate}
                className="group bg-white border-2 border-gray-100 hover:border-[#d4a017] rounded-2xl p-7 text-center transition-all duration-200 hover:shadow-md"
              >
                <div className="text-3xl font-black text-[#d4a017] mb-2">{amount}</div>
                <div className="text-gray-600 text-sm leading-snug mb-4">{impact}</div>
                <div className="inline-flex items-center gap-1 text-[#1a6b2a] font-bold text-xs group-hover:gap-2 transition-all">
                  Give Now <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#d4a017] text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black text-[#0f0f0f] mb-4">Every Act of Giving Saves a Life</h2>
          <p className="text-[#0f0f0f]/70 mb-8">Join thousands of donors who are making a real difference across Africa.</p>
          <button
            onClick={openDonate}
            className="flex items-center gap-2 mx-auto bg-[#0d3d1a] hover:bg-[#1a6b2a] text-white font-black px-8 py-4 rounded-full shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Heart className="w-5 h-5" />
            Donate to Charity Initiative
          </button>
        </div>
      </section>
    </div>
  );
}
