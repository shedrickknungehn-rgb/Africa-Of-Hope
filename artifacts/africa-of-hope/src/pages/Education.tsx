import { BookOpen, GraduationCap, School, Laptop, Heart, ArrowRight, CheckCircle, Phone, Mail, MapPin, Clock } from "lucide-react";
import { openDonate } from "@/lib/donate";
const brochureImg = "/brochure.png";

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

const courseDurations = [
  {
    duration: "9-Month Courses",
    schedule: "2 Days Weekly",
    fee: "$45",
    color: "from-[#1a6b2a] to-[#0d3d1a]",
    badgeColor: "#d4a017",
    requirement: "12th Grade or Above",
    courses: [
      "Media & Comm. Studies",
      "Teacher's Education",
      "Audio Ads Production",
      "Secre-Science",
      "School Administration",
      "Online-TV Production",
      "Professional Multimedia",
    ],
  },
  {
    duration: "6-Month Courses",
    schedule: "2 Days Weekly",
    fee: "$50",
    color: "from-[#155022] to-[#0d3d1a]",
    badgeColor: "#f0c040",
    requirement: "Read & Write",
    courses: [
      "Professional Graphics",
      "HR - Management",
      "General Podcasting",
      "Monitoring & Evaluation",
      "Guidance & Counseling",
      "Project Management",
      "Digital Marketing",
      "Video Production",
      "General Public Relations",
    ],
  },
  {
    duration: "3-Month Courses",
    schedule: "2 Days Weekly",
    fee: "$35",
    color: "from-[#0d3d1a] to-[#0a2812]",
    badgeColor: "#d4a017",
    requirement: "Read & Write",
    courses: [
      "Introduction to Computer",
      "Public Speaking",
      "Social Media Management",
      "Mobile Graphics",
      "Mobile Multimedia",
      "Customer's Care/Reception",
      "Video Podcasting",
      "Entrepreneurship/Business",
      "Leadership & Management",
    ],
  },
  {
    duration: "1-Month Courses",
    schedule: "2 Days Weekly",
    fee: "$25",
    color: "from-[#0a2812] to-[#062010]",
    badgeColor: "#f0c040",
    requirement: "Read & Write",
    courses: [
      "Mobile Graphics",
      "Project Proposal Writing",
      "Event Planning",
      "Speech & Article Writing",
      "Quick Book",
      "Book Keeping",
    ],
  },
];

const whyChooseUs = [
  {
    title: "Tuition FREE — Only Registration",
    desc: "We are AFFORDABLE and CONVENIENT. Our courses are tuition free — you only pay the registration fee.",
  },
  {
    title: "Theory + Practical Curriculum",
    desc: "Our specially designed curriculum blends creative learning with 30% Theory and 70% Practical training.",
  },
  {
    title: "Legally Registered & Experienced Faculty",
    desc: "We are legally registered (GOL) with qualified and experienced faculties dedicated to impacting the next generation.",
  },
  {
    title: "Internships for All Students",
    desc: "We provide internships for all our students as part of our priorities, giving real-world experience.",
  },
];

export default function Education() {
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

      {/* ===== SCHOOL OF PROFESSIONAL STUDIES ===== */}
      <section className="py-20 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="grid lg:grid-cols-2 gap-14 items-center mb-16">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#d4a017]/15 border border-[#d4a017]/40 rounded-full px-4 py-1.5 mb-5">
                <span className="w-2 h-2 rounded-full bg-[#d4a017] animate-pulse" />
                <span className="text-[#d4a017] font-bold text-xs uppercase tracking-widest">Admissions 2026/2027 Open</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-[#0f0f0f] mb-4 leading-tight">
                Africa of Hope<br />
                <span className="text-[#1a6b2a]">School of Professional Studies</span>
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-3">
                Certificate &amp; Diploma courses designed to equip the next generation with practical, career-ready skills — offered physically in Liberia and online across Africa.
              </p>
              <p className="text-[#d4a017] font-black text-lg italic">"Learn, Grow, Succeed"</p>
              <div className="flex flex-wrap gap-3 mt-7">
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm">
                  <MapPin className="w-4 h-4 text-[#1a6b2a]" />
                  <span className="text-sm font-semibold text-gray-700">Liberia — Physical &amp; Online</span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm">
                  <Clock className="w-4 h-4 text-[#1a6b2a]" />
                  <span className="text-sm font-semibold text-gray-700">2 Days Weekly</span>
                </div>
              </div>
            </div>
            {/* Brochure image */}
            <div className="relative">
              <img
                src={brochureImg}
                alt="Africa of Hope School of Professional Studies — 2026/2027 Admissions Brochure"
                className="w-full rounded-2xl shadow-xl border border-gray-200 object-cover"
              />
              <div className="absolute -bottom-4 -right-4 bg-[#d4a017] text-[#0f0f0f] font-black text-sm px-5 py-2.5 rounded-xl shadow-lg">
                Enroll Today
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">Why Choose Us</span>
              <h3 className="text-3xl font-black text-[#0f0f0f]">Built for Real-World Success</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {whyChooseUs.map(({ title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#1a6b2a] flex items-center justify-center mb-4">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-black text-[#0f0f0f] text-sm mb-2 leading-snug">{title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Program Requirements */}
          <div className="bg-[#0d3d1a] rounded-2xl p-8 mb-16 text-white">
            <h3 className="text-xl font-black text-[#d4a017] mb-6 uppercase tracking-wide">Program Requirements</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { num: "01", req: "Be able to Read and Write", for: "1, 3 & 6 Month Courses" },
                { num: "02", req: "Pay 50% Registration Fee & Select Class Schedule", for: "All Courses" },
                { num: "03", req: "Be a 12th Grader or Above", for: "9-Month Courses Only" },
              ].map(({ num, req, for: f }) => (
                <div key={num} className="flex gap-4">
                  <div className="text-3xl font-black text-[#d4a017]/30 leading-none flex-shrink-0">{num}</div>
                  <div>
                    <p className="text-white font-bold text-sm mb-1">{req}</p>
                    <p className="text-white/50 text-xs">Required for: {f}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Catalog */}
          <div>
            <div className="text-center mb-10">
              <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">Full Course Catalogue</span>
              <h3 className="text-3xl font-black text-[#0f0f0f]">Certificate &amp; Diploma Programs</h3>
              <p className="text-gray-500 mt-2">All classes are 2 days per week — flexible for working adults and students</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courseDurations.map(({ duration, schedule, fee, color, badgeColor, requirement, courses }) => (
                <div key={duration} className={`bg-gradient-to-br ${color} rounded-2xl p-7 text-white`}>
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h4 className="font-black text-xl mb-1">{duration}</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-white/60 text-xs">{schedule}</span>
                        <span className="text-white/40 text-xs">·</span>
                        <span className="text-white/60 text-xs">Req: {requirement}</span>
                      </div>
                    </div>
                    <div
                      className="flex-shrink-0 px-4 py-1.5 rounded-full font-black text-sm"
                      style={{ backgroundColor: `${badgeColor}20`, color: badgeColor, border: `1px solid ${badgeColor}40` }}
                    >
                      REG = {fee}
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {courses.map((course) => (
                      <li key={course} className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: badgeColor }} />
                        <span className="text-white/80 text-sm">{course}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* School Contact & Apply */}
          <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-8 grid sm:grid-cols-2 gap-8 items-center shadow-sm">
            <div>
              <h4 className="font-black text-[#0f0f0f] text-xl mb-5">Contact the School / Apply Now</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#1a6b2a] flex-shrink-0" />
                  <div>
                    <p className="text-gray-700 text-sm font-medium">0760599659 / 088061379</p>
                    <p className="text-gray-400 text-xs">WhatsApp: +231776679963 / +231760599659</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#1a6b2a] flex-shrink-0" />
                  <a href="mailto:Afrohope033@gmail.com" className="text-[#1a6b2a] text-sm font-medium hover:underline">
                    Afrohope033@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#1a6b2a] flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Liberia — Physically &amp; Online</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <a
                href="mailto:Afrohope033@gmail.com?subject=School Admission Application 2026/2027"
                className="flex items-center justify-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-black px-6 py-3.5 rounded-xl text-sm transition-all hover:scale-[1.02] shadow"
              >
                Apply Now — 2026/2027 Intake
              </a>
              <button
                onClick={openDonate}
                className="flex items-center justify-center gap-2 bg-[#d4a017]/10 border border-[#d4a017] text-[#d4a017] hover:bg-[#d4a017] hover:text-[#0f0f0f] font-bold px-6 py-3 rounded-xl text-sm transition-all"
              >
                <Heart className="w-4 h-4" />
                Sponsor a Student
              </button>
            </div>
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-[#0f0f0f] mb-4">Invest in Education</h2>
            <p className="text-gray-500 text-lg">Choose how you want to support learning across Africa.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { amount: "$15", impact: "Textbooks for a child" },
              { amount: "$35", impact: "1-month course registration" },
              { amount: "$45", impact: "9-month course registration" },
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
