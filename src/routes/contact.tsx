import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — PriHiKa" },
      { name: "description", content: "Talk to a PriHiKa stylist. Open 7 days a week." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="container mx-auto px-5 lg:px-10 py-16">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <span className="text-xs tracking-[0.3em] uppercase text-rose-gold">Get in touch</span>
        <h1 className="font-display text-4xl md:text-6xl mt-3">We'd love to hear from you</h1>
        <p className="mt-4 text-muted-foreground">Whether you have a question, need styling advice, or want to design something bespoke — our team is here.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12">
        <div className="space-y-5">
          {[
            { Icon: Phone, t: "Call us", d: "+91 9876543210", sub: "Mon–Sun · 9am–9pm" },
            { Icon: Mail, t: "Email", d: "contact@prihika.com", sub: "We reply within 24h" },
            { Icon: MapPin, t: "Atelier", d: "Jaipur, Rajasthan", sub: "By appointment only" },
          ].map(({ Icon, t, d, sub }) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex gap-4 p-6 rounded-2xl bg-secondary"
            >
              <div className="h-12 w-12 rounded-full bg-background grid place-items-center text-rose-gold shadow-soft">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-muted-foreground">{t}</p>
                <p className="font-display text-xl mt-1">{d}</p>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="bg-card rounded-3xl p-8 md:p-10 shadow-soft space-y-5"
        >
          <h3 className="font-display text-2xl">Send us a note</h3>
          {sent && (
            <p className="text-sm text-rose-gold bg-secondary p-3 rounded-lg">Thank you — we'll be in touch within 24 hours.</p>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Name" />
            <Input label="Email" type="email" />
          </div>
          <Input label="Subject" />
          <div>
            <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">Message</label>
            <textarea required rows={5} className="w-full bg-secondary rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-gold/40 resize-none" />
          </div>
          <button
            type="submit"
            className="w-full py-4 rounded-full shine text-xs tracking-[0.25em] uppercase"
            style={{ background: "var(--gradient-rose)", color: "var(--ivory)" }}
          >
            Send message
          </button>
        </motion.form>
      </div>
    </div>
  );
}

function Input({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">{label}</label>
      <input type={type} required className="w-full bg-secondary rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-gold/40" />
    </div>
  );
}