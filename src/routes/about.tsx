import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import hero from "@/assets/hero.jpg";
import bridal from "@/assets/collection-bridal.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — PriHiKa" },
      { name: "description", content: "Heirloom-grade jewellery designed in India, made with intention, worn for generations." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="container mx-auto px-5 lg:px-10 py-16 text-center max-w-3xl">
        <span className="text-xs tracking-[0.3em] uppercase text-rose-gold">Our Story</span>
        <h1 className="font-display text-4xl md:text-6xl mt-4 leading-tight">
          Modern heirlooms,<br />
          <em className="text-rose-gold not-italic">crafted with intention.</em>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          PriHiKa was founded in 2021 with a single belief — that the most beautiful
          jewellery is also the most personal. We design slowly, finish by hand,
          and refuse to compromise on what touches your skin.
        </p>
      </section>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="container mx-auto px-5 lg:px-10"
      >
        <img src={hero} alt="PriHiKa atelier" className="w-full aspect-[16/9] object-cover rounded-3xl shadow-luxury" />
      </motion.div>

      <section className="container mx-auto px-5 lg:px-10 py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="aspect-[4/5] rounded-3xl overflow-hidden">
          <img src={bridal} alt="Hand-finished" className="h-full w-full object-cover" />
        </div>
        <div className="lg:px-8">
          <span className="text-xs tracking-[0.3em] uppercase text-rose-gold">The Atelier</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 mb-6">Made by hand. Always.</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our pieces are crafted in a small studio in Jaipur, by a team of
            karigars whose families have worked with gold for four generations.
            Every clasp is set by hand. Every stone is matched in person. Nothing
            is rushed.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-10">
            {[
              { n: "28k+", l: "Happy wearers" },
              { n: "4.9★", l: "Average rating" },
              { n: "100%", l: "BIS hallmarked" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-3xl text-rose-gold">{s.n}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24" style={{ background: "var(--beige)" }}>
        <div className="container mx-auto px-5 lg:px-10 text-center max-w-2xl">
          <h2 className="font-display text-3xl md:text-5xl">Our Values</h2>
          <div className="grid sm:grid-cols-3 gap-8 mt-12 text-left">
            {[
              { t: "Slow design", d: "We release fewer pieces, more considered." },
              { t: "Honest pricing", d: "No middlemen. No markup theatre." },
              { t: "Forever exchange", d: "Bring your PriHiKa back any time." },
            ].map((v) => (
              <div key={v.t} className="bg-background rounded-2xl p-6 shadow-soft">
                <h3 className="font-display text-xl mb-2">{v.t}</h3>
                <p className="text-sm text-muted-foreground">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}