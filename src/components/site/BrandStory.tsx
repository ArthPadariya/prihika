import { motion } from "framer-motion";
import { Gem } from "lucide-react";

export function BrandStory() {
  return (
    <section className="mt-20 md:mt-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] px-6 md:px-16 py-14 md:py-20 text-center"
        style={{ background: "var(--beige)" }}
      >
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 0%, var(--rose-soft), transparent 60%)" }}
        />
        <div className="relative max-w-2xl mx-auto">
          <div className="mx-auto h-12 w-12 rounded-full bg-background grid place-items-center text-rose-gold shadow-soft mb-6">
            <Gem className="h-4 w-4" />
          </div>
          <span className="text-[11px] tracking-[0.32em] uppercase text-rose-gold">The PriHiKa Atelier</span>
          <h2 className="font-display text-3xl md:text-4xl leading-tight mt-3">
            Crafted with timeless elegance, made to be worn always.
          </h2>
          <p className="mt-5 text-sm md:text-base text-foreground/70 leading-[1.9]">
            Every PriHiKa piece is hand-finished by master artisans in India, set in 18K gold and certified to last for generations.
            We design quietly considered jewellery that blends sophistication, comfort and lasting beauty —
            so you wear it on the everyday days, and remember it for the important ones.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] tracking-[0.28em] uppercase text-muted-foreground">
            <span>BIS Hallmarked</span>
            <span className="h-1 w-1 rounded-full bg-rose-gold/60" />
            <span>IGI Certified</span>
            <span className="h-1 w-1 rounded-full bg-rose-gold/60" />
            <span>Made in India</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}