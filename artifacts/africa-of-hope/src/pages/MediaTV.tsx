import { Tv, Mic, Camera, Radio, Globe, Heart, Play, ArrowRight } from "lucide-react";
import { openDonate } from "@/lib/donate";

const programs = [
  {
    icon: Tv,
    title: "Africa of Hope TV",
    description: "Our flagship television channel broadcasting inspiring stories, development news, and community transformation across Africa and the diaspora.",
    impact: "2M+ monthly viewers",
  },
  {
    icon: Mic,
    title: "Community Radio",
    description: "A network of community radio stations in local languages, delivering health information, civic education, and cultural programming.",
    impact: "45 radio stations",
  },
  {
    icon: Camera,
    title: "Documentary Films",
    description: "Award-winning documentaries that amplify African voices, challenge narratives, and spotlight extraordinary stories of resilience.",
    impact: "120+ films produced",
  },
  {
    icon: Radio,
    title: "Podcast Network",
    description: "A growing network of African-led podcasts covering politics, culture, innovation, health, and entrepreneurship for global audiences.",
    impact: "1.5M+ monthly listeners",
  },
];

const shows = [
  {
    title: "Voices of the Continent",
    type: "Documentary Series",
    description: "A six-part series profiling extraordinary Africans changing their communities from the inside out.",
    episode: "New Season Available",
  },
  {
    title: "Hope in the Harvest",
    type: "Agricultural Feature",
    description: "Stories of farmers transforming food security through innovation, resilience, and community cooperation.",
    episode: "Season 3 Now Streaming",
  },
  {
    title: "The Healing Hour",
    type: "Health Awareness Show",
    description: "Weekly health education program in partnership with our healthcare division — reaching millions with life-saving information.",
    episode: "Live Every Sunday",
  },
  {
    title: "Young Africa Rising",
    type: "Youth Empowerment",
    description: "Showcasing the brilliance, creativity, and determination of young Africans aged 16-30 across every sector.",
    episode: "Episodes Daily",
  },
];

export default function MediaTV() {
  return (
    <div className="pt-[57px]">
      {/* Hero */}
      <section className="gradient-hero py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#d4a017]/20 border border-[#d4a017]/30 flex items-center justify-center">
              <Tv className="w-6 h-6 text-[#d4a017]" />
            </div>
            <span className="text-[#d4a017] font-bold text-xs uppercase tracking-widest">Media / TV</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black mb-6 max-w-3xl">
            Africa's Story, Told by <span className="text-gradient-gold">Africans</span>
          </h1>
          <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
            We believe media is one of the most powerful tools for change. Our media arm amplifies African voices, counters harmful narratives, and uses the power of storytelling to inspire millions across the continent and the diaspora.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#d4a017] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "2M+", label: "Monthly TV Viewers" },
              { value: "1.5M+", label: "Podcast Listeners" },
              { value: "120+", label: "Films Produced" },
              { value: "45", label: "Radio Stations" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-4xl font-black text-[#0f0f0f] mb-1">{value}</div>
                <div className="text-[#0f0f0f]/70 text-sm font-semibold uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Programs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">Our Platforms</span>
            <h2 className="text-4xl font-black text-[#0f0f0f]">Media Channels &amp; Programs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {programs.map(({ icon: Icon, title, description, impact }) => (
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

      {/* Image Feature */}
      <section className="relative h-56 sm:h-72 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1600&q=80"
          alt="Media production — Africa of Hope Media & TV"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d3d1a]/85 via-[#0d3d1a]/50 to-transparent flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-white font-black text-xl sm:text-3xl max-w-lg leading-tight">
              "Africa deserves media that celebrates its resilience, culture, and extraordinary people."
            </p>
            <p className="text-[#d4a017] text-sm font-semibold mt-2 uppercase tracking-widest">Africa of Hope — Media / TV</p>
          </div>
        </div>
      </section>

      {/* Featured Shows */}
      <section className="py-20 bg-[#0d3d1a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#d4a017] font-bold text-xs uppercase tracking-widest mb-3 block">Now Showing</span>
            <h2 className="text-4xl font-black">Featured Programs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shows.map(({ title, type, description, episode }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/8 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-[#d4a017] text-xs font-bold uppercase tracking-widest mb-1">{type}</div>
                    <h3 className="text-white font-black text-xl">{title}</h3>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-[#d4a017] flex items-center justify-center flex-shrink-0 hover:bg-[#f0c040] transition-colors">
                    <Play className="w-4 h-4 text-[#0f0f0f] ml-0.5" />
                  </button>
                </div>
                <p className="text-white/65 text-sm leading-relaxed mb-4">{description}</p>
                <div className="inline-flex items-center gap-2 bg-[#1a6b2a]/30 border border-[#1a6b2a]/40 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4a017] animate-pulse" />
                  <span className="text-white/70 text-xs font-semibold">{episode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">Why Media Matters</span>
              <h2 className="text-4xl font-black text-[#0f0f0f] mb-6">The Power of the African Narrative</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                For too long, Africa's story has been told by outsiders — often through a lens of despair, conflict, or charity. We believe Africa deserves media that celebrates its innovation, culture, resilience, and extraordinary people.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Our media programs are not just about entertainment. They are tools for health education, civic engagement, youth empowerment, and cultural preservation — directly supporting our other three program arms.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={openDonate}
                  className="flex items-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold px-6 py-3 rounded-full text-sm transition-all"
                >
                  <Heart className="w-4 h-4" />
                  Support Media
                </button>
                <a
                  href="#"
                  className="flex items-center gap-2 bg-[#d4a017]/10 border border-[#d4a017] text-[#d4a017] hover:bg-[#d4a017] hover:text-[#0f0f0f] font-bold px-6 py-3 rounded-full text-sm transition-all"
                >
                  <Globe className="w-4 h-4" />
                  Watch Online
                </a>
              </div>
            </div>
            <div className="space-y-5">
              {[
                { stat: "80%", label: "of content is produced in Africa, by Africans" },
                { stat: "22", label: "African languages broadcast in" },
                { stat: "40+", label: "countries where our content is distributed" },
                { stat: "5", label: "international media awards won in 2024" },
              ].map(({ stat, label }) => (
                <div key={label} className="flex items-center gap-5 bg-white rounded-xl p-5 shadow-sm">
                  <div className="text-3xl font-black text-[#d4a017] w-24 flex-shrink-0">{stat}</div>
                  <div className="text-gray-600 text-sm leading-snug">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partner with us */}
      <section className="py-16 bg-[#0d3d1a] text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black mb-4">Partner with Africa of Hope Media</h2>
          <p className="text-white/70 mb-8">Are you a journalist, filmmaker, or storyteller with an African story to tell? We want to amplify your voice.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={openDonate}
              className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-black px-8 py-3 rounded-full transition-all hover:scale-105"
            >
              <Heart className="w-4 h-4" />
              Support Media
            </button>
            <a
              href="#"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-full border border-white/20 transition-all"
            >
              Submit a Story <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
