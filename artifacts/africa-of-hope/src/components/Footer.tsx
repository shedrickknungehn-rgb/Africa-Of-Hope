import { Link } from "wouter";
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, MessageCircle } from "lucide-react";
import { openDonate } from "@/lib/donate";

export default function Footer() {
  return (
    <footer className="bg-[#0a2812] text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#d4a017] flex items-center justify-center flex-shrink-0">
                <span className="text-[#0f0f0f] font-black text-sm">AH</span>
              </div>
              <div>
                <div className="text-white font-black text-lg leading-none">
                  AFRICA OF <span className="text-[#d4a017]">HOPE</span>
                </div>
                <div className="text-[#d4a017]/70 text-[10px] tracking-widest uppercase">
                  Arms &amp; Service
                </div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              A nonprofit organization dedicated to transforming lives across Africa through charity, education, healthcare, and media empowerment. Based in Liberia — operating globally.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Youtube, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#d4a017] flex items-center justify-center transition-colors duration-200 group"
                >
                  <Icon className="w-4 h-4 text-white/70 group-hover:text-[#0f0f0f]" />
                </a>
              ))}
            </div>
          </div>

          {/* Our Programs */}
          <div>
            <h4 className="text-[#d4a017] font-bold text-sm uppercase tracking-widest mb-5">Our Programs</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Charity Initiative", href: "/charity" },
                { label: "Education", href: "/education" },
                { label: "Health-Care", href: "/healthcare" },
                { label: "Media / TV", href: "/media" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-white/60 hover:text-[#d4a017] text-sm transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#d4a017]/50 inline-block flex-shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#d4a017] font-bold text-sm uppercase tracking-widest mb-5">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#d4a017] mt-0.5 flex-shrink-0" />
                <span className="text-white/60 text-sm">Liberia — Physically &amp; Online</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#d4a017] mt-0.5 flex-shrink-0" />
                <div>
                  <a href="tel:0760599659" className="text-white/60 hover:text-[#d4a017] text-sm transition-colors block">
                    0760599659
                  </a>
                  <a href="tel:088061379" className="text-white/60 hover:text-[#d4a017] text-sm transition-colors block">
                    088061379
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 text-[#d4a017] mt-0.5 flex-shrink-0" />
                <div>
                  <a href="https://wa.me/231776679963" className="text-white/60 hover:text-[#d4a017] text-sm transition-colors block">
                    +231776679963
                  </a>
                  <a href="https://wa.me/231760599659" className="text-white/60 hover:text-[#d4a017] text-sm transition-colors block">
                    +231760599659
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#d4a017] flex-shrink-0" />
                <a href="mailto:Afrohope033@gmail.com" className="text-white/60 hover:text-[#d4a017] text-sm transition-colors break-all">
                  Afrohope033@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Donate CTA */}
          <div>
            <h4 className="text-[#d4a017] font-bold text-sm uppercase tracking-widest mb-5">Make a Difference</h4>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Your generosity fuels our mission. Every contribution, big or small, changes lives across Africa.
            </p>
            <button
              onClick={openDonate}
              className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-bold text-sm px-5 py-2.5 rounded-full shadow transition-all duration-200 hover:scale-105 mb-4"
            >
              <Heart className="w-4 h-4" />
              Donate Now
            </button>
            {/* School Admissions */}
            <div className="bg-white/5 border border-[#d4a017]/20 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4a017] animate-pulse" />
                <span className="text-[#d4a017] text-xs font-bold uppercase tracking-wide">Admissions Open</span>
              </div>
              <p className="text-white/60 text-xs leading-relaxed mb-2">School of Professional Studies — 2026/2027 intake now open. Tuition FREE.</p>
              <a
                href="mailto:Afrohope033@gmail.com?subject=School Admission 2026/2027"
                className="text-[#d4a017] text-xs font-bold hover:underline"
              >
                Apply → Afrohope033@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs text-center sm:text-left">
            &copy; {new Date().getFullYear()} Africa of Hope — Arms &amp; Service. All rights reserved. Registered Non-Profit Organization.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["Privacy Policy", "Terms of Use", "Cookie Policy"].map((item) => (
              <a key={item} href="#" className="text-white/40 hover:text-[#d4a017] text-xs transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
