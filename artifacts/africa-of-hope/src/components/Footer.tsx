import { Link } from "wouter";
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { openDonate } from "@/lib/donate";

export default function Footer() {
  return (
    <footer className="bg-[#0a2812] text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#d4a017] flex items-center justify-center">
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
              A nonprofit organization dedicated to transforming lives across Africa through charity, education, healthcare, and media empowerment.
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
                    <span className="w-1 h-1 rounded-full bg-[#d4a017]/50 inline-block" />
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
                <span className="text-white/60 text-sm">Africa of Hope Headquarters, Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#d4a017] flex-shrink-0" />
                <a href="tel:+254000000000" className="text-white/60 hover:text-[#d4a017] text-sm transition-colors">
                  +254 000 000 000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#d4a017] flex-shrink-0" />
                <a href="mailto:info@africaofhope.org" className="text-white/60 hover:text-[#d4a017] text-sm transition-colors">
                  info@africaofhope.org
                </a>
              </li>
            </ul>
          </div>

          {/* Donate CTA */}
          <div>
            <h4 className="text-[#d4a017] font-bold text-sm uppercase tracking-widest mb-5">Make a Difference</h4>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Your generosity fuels our mission. Every contribution, big or small, changes lives.
            </p>
            <button
              onClick={openDonate}
              className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#f0c040] text-[#0f0f0f] font-bold text-sm px-5 py-2.5 rounded-full shadow transition-all duration-200 hover:scale-105"
            >
              <Heart className="w-4 h-4" />
              Donate Now
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} Africa of Hope. All rights reserved. Registered Non-Profit Organization.
          </p>
          <div className="flex gap-5">
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
