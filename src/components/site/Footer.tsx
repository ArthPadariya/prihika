import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, Phone, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="mt-32 pt-20 pb-10 px-5 lg:px-10"
      style={{
        background:
          "linear-gradient(180deg, var(--beige) 0%, oklch(0.92 0.025 75) 100%)",
      }}
    >
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <span className="font-display text-3xl tracking-[0.18em]">
              <span className="text-rose-gold">Pri</span>Hi
              <span className="text-rose-gold">Ka</span>
            </span>
            <p className="mt-5 text-sm text-muted-foreground max-w-sm leading-relaxed">
              Heirloom-grade jewellery, handcrafted in India. Designed to be
              worn every day and remembered for generations.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-10 w-10 rounded-full border border-border grid place-items-center hover:bg-rose-gold hover:text-primary-foreground hover:border-rose-gold transition-all"
                  style={{}}
                  aria-label="social"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: "Shop",
              links: [
                { to: "/shop", label: "All Jewellery" },
                { to: "/collections", label: "Collections" },
                { to: "/shop", label: "Bestsellers" },
                { to: "/shop", label: "New Arrivals" },
              ],
            },
            {
              title: "Help",
              links: [
                { to: "/contact", label: "Contact Us" },
                { to: "/about", label: "About" },
                { to: "/contact", label: "Shipping & Returns" },
                { to: "/contact", label: "Care Guide" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-lg mb-5">{col.title}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {col.links.map((l, i) => (
                  <li key={i}>
                    <Link to={l.to} className="hover:text-rose-gold transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-display text-lg mb-5">Reach Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-rose-gold" />
                +91 9876543210
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-rose-gold" />
                contact@prihika.com
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/60 flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} PriHiKa. All rights reserved.</p>
          <p className="tracking-widest uppercase">
            Handcrafted with love · BIS Hallmarked
          </p>
        </div>
      </div>
    </footer>
  );
}