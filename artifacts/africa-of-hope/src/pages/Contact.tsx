import { Mail, Phone, MapPin, Clock, Heart, MessageSquare, Send } from "lucide-react";
import { openDonate } from "@/lib/donate";
import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="pt-[57px]">
      {/* Hero */}
      <section className="gradient-hero py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-[#d4a017] font-bold text-xs uppercase tracking-widest mb-4">
            Get in Touch
          </span>
          <h1 className="text-5xl lg:text-6xl font-black mb-6">
            Contact <span className="text-gradient-gold">Africa of Hope</span>
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto">
            Whether you want to donate, volunteer, partner, or simply learn more — we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14">
            {/* Info */}
            <div>
              <h2 className="text-3xl font-black text-[#0f0f0f] mb-8">Reach Out Directly</h2>
              <div className="space-y-6 mb-10">
                {[
                  {
                    icon: MapPin,
                    label: "Headquarters",
                    value: "Africa of Hope, P.O. Box 00100, Nairobi, Kenya",
                  },
                  {
                    icon: Phone,
                    label: "Phone",
                    value: "+254 000 000 000",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: "info@africaofhope.org",
                  },
                  {
                    icon: Clock,
                    label: "Office Hours",
                    value: "Monday – Friday: 8:00 AM – 5:00 PM EAT",
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1a6b2a]/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#1a6b2a]" />
                    </div>
                    <div>
                      <div className="text-[#1a6b2a] font-bold text-xs uppercase tracking-wide mb-1">{label}</div>
                      <div className="text-gray-700 text-sm">{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Regional Offices */}
              <div className="bg-[#f7f5f0] rounded-2xl p-7">
                <h3 className="font-black text-[#0f0f0f] mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#d4a017]" />
                  Regional Offices
                </h3>
                <div className="space-y-4">
                  {[
                    { region: "West Africa", city: "Lagos, Nigeria" },
                    { region: "Southern Africa", city: "Johannesburg, South Africa" },
                    { region: "East Africa", city: "Kampala, Uganda" },
                    { region: "North Africa", city: "Cairo, Egypt" },
                    { region: "Central Africa", city: "Kinshasa, DR Congo" },
                  ].map(({ region, city }) => (
                    <div key={region} className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm font-medium">{region}</span>
                      <span className="text-[#1a6b2a] text-sm font-bold">{city}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              <div className="bg-[#0d3d1a] rounded-3xl p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-6 h-6 text-[#d4a017]" />
                  <h3 className="font-black text-xl">Send Us a Message</h3>
                </div>

                {sent ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[#d4a017] flex items-center justify-center mx-auto mb-5">
                      <Send className="w-8 h-8 text-[#0f0f0f]" />
                    </div>
                    <h4 className="text-white font-black text-xl mb-3">Message Sent!</h4>
                    <p className="text-white/65 text-sm">Thank you for reaching out. Our team will respond within 48 hours.</p>
                    <button
                      onClick={() => setSent(false)}
                      className="mt-6 text-[#d4a017] font-bold text-sm hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/70 text-xs font-semibold uppercase tracking-wide block mb-1.5">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#d4a017] transition-colors"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="text-white/70 text-xs font-semibold uppercase tracking-wide block mb-1.5">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#d4a017] transition-colors"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-white/70 text-xs font-semibold uppercase tracking-wide block mb-1.5">
                        Subject
                      </label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4a017] transition-colors appearance-none"
                      >
                        <option value="" className="text-black">Select a subject...</option>
                        <option value="donate" className="text-black">Donation Enquiry</option>
                        <option value="volunteer" className="text-black">Volunteer / Partnership</option>
                        <option value="charity" className="text-black">Charity Initiative</option>
                        <option value="education" className="text-black">Education Programs</option>
                        <option value="healthcare" className="text-black">Healthcare Services</option>
                        <option value="media" className="text-black">Media / TV</option>
                        <option value="other" className="text-black">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/70 text-xs font-semibold uppercase tracking-wide block mb-1.5">
                        Message *
                      </label>
                      <textarea
                        required
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        rows={5}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#d4a017] transition-colors resize-none"
                        placeholder="How can we help?"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-black py-3.5 rounded-xl transition-all hover:scale-[1.02]"
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved */}
      <section className="py-20 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#1a6b2a] font-bold text-xs uppercase tracking-widest mb-3 block">Get Involved</span>
            <h2 className="text-4xl font-black text-[#0f0f0f]">Ways to Partner with Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Make a Donation", desc: "Every amount matters. Give once or set up a recurring gift to sustain our programs.", cta: "Donate Now", action: openDonate },
              { title: "Volunteer", desc: "Bring your skills and time to Africa of Hope. We welcome professionals, students, and compassionate people of all backgrounds.", cta: "Apply to Volunteer", action: () => {} },
              { title: "Corporate Partnership", desc: "Align your brand with a mission that matters. We offer impactful CSR partnership opportunities with full transparency and reporting.", cta: "Partner with Us", action: () => {} },
              { title: "Fundraise for Us", desc: "Run a campaign on our behalf — whether a birthday fundraiser, event, or community drive. Every initiative counts.", cta: "Start Fundraising", action: () => {} },
              { title: "In-Kind Donations", desc: "Donate medical supplies, educational materials, food, clothing, or equipment directly to our programs.", cta: "Learn More", action: () => {} },
              { title: "Media Collaboration", desc: "Are you a journalist, filmmaker, or content creator? Partner with our media arm to tell Africa's stories.", cta: "Connect with Media", action: () => {} },
            ].map(({ title, desc, cta, action }) => (
              <div key={title} className="bg-white rounded-2xl p-7 hover:shadow-md transition-all border border-gray-100">
                <h4 className="font-black text-[#0f0f0f] text-lg mb-3">{title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{desc}</p>
                <button
                  onClick={action}
                  className="flex items-center gap-2 text-[#1a6b2a] font-bold text-sm hover:text-[#d4a017] transition-colors"
                >
                  {cta}
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-[#d4a017] text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black text-[#0f0f0f] mb-4">Ready to Make an Impact?</h2>
          <p className="text-[#0f0f0f]/70 mb-8">Join thousands of changemakers who believe Africa's best days are ahead.</p>
          <button
            onClick={openDonate}
            className="flex items-center gap-2 mx-auto bg-[#0d3d1a] hover:bg-[#1a6b2a] text-white font-black px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105"
          >
            <Heart className="w-5 h-5" />
            Donate Now
          </button>
        </div>
      </section>
    </div>
  );
}
