import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Play, Volume2 } from "lucide-react";
import type { HomepageReel } from "@/types/admin";

export function Reels({ reels }: { reels: HomepageReel[] }) {
  if (!reels.length) return null;

  return (
    <section className="container mx-auto px-5 lg:px-10 py-24 md:py-28">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:pr-6"
        >
          <span className="text-[11px] tracking-[0.32em] uppercase text-rose-gold">In Motion</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 leading-[1.05]">
            See PriHiKa
            <br />
            <em className="not-italic text-rose-gold">in real life.</em>
          </h2>
          <p className="mt-6 text-base md:text-lg text-foreground/70 leading-relaxed max-w-md">
            Crafted for modern elegance - every PriHiKa piece is designed to shine beautifully in
            the small, real moments.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full shine"
              style={{ background: "var(--gradient-rose)", color: "var(--ivory)" }}
            >
              <span className="text-xs tracking-[0.25em] uppercase">Explore Collection</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-charcoal/30 hover:border-rose-gold hover:text-rose-gold transition-colors"
            >
              <span className="text-xs tracking-[0.25em] uppercase">Watch More</span>
            </a>
          </div>
        </motion.div>

        <div className="relative">
          <div
            className="absolute -inset-10 opacity-30 blur-3xl rounded-full pointer-events-none"
            style={{ background: "var(--gradient-rose)" }}
          />

          <div className="hidden sm:grid relative grid-cols-2 gap-5 lg:gap-7">
            {reels.slice(0, 4).map((reel, i) => (
              <ReelCard key={reel.id} reel={reel} index={i} floating />
            ))}
          </div>

          <div className="sm:hidden -mx-5 px-5 overflow-x-auto no-scrollbar snap-x snap-mandatory">
            <div className="flex gap-4 pb-2">
              {reels.map((reel, i) => (
                <div key={reel.id} className="snap-start shrink-0 w-[68%]">
                  <ReelCard reel={reel} index={i} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReelCard({
  reel,
  index,
  floating = false,
}: {
  reel: HomepageReel;
  index: number;
  floating?: boolean;
}) {
  const offsets = floating ? [12, -16, -8, 14] : [0, 0, 0, 0];
  const media = reel.thumbnail_url || reel.video_url;
  const isVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(reel.video_url);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02 }}
      className="group relative"
      style={{ transform: floating ? `translateY(${offsets[index] ?? 0}px)` : undefined }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6 + index * 0.6, repeat: Infinity, ease: "easeInOut" }}
        className="relative aspect-[9/16] rounded-[1.75rem] overflow-hidden shadow-luxury bg-secondary"
      >
        {reel.video_url && isVideo ? (
          <video
            src={reel.video_url}
            poster={reel.thumbnail_url ?? undefined}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
          />
        ) : media ? (
          <img
            src={media}
            alt={reel.title ?? ""}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/10 to-transparent" />

        <div
          className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] tracking-[0.18em] uppercase"
          style={{ color: "var(--ivory)" }}
        >
          <span className="px-2.5 py-1 rounded-full bg-black/35 backdrop-blur-sm flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-gold animate-pulse" /> Reel
          </span>
        </div>

        <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="h-14 w-14 rounded-full bg-white/15 backdrop-blur-md grid place-items-center border border-white/30">
            <Play
              className="h-5 w-5 ml-0.5"
              style={{ color: "var(--ivory)" }}
              fill="currentColor"
            />
          </div>
        </div>

        <div
          className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3"
          style={{ color: "var(--ivory)" }}
        >
          <p className="font-display text-sm md:text-base leading-snug drop-shadow">{reel.title}</p>
          <div className="h-8 w-8 shrink-0 rounded-full bg-white/15 backdrop-blur-md grid place-items-center border border-white/25">
            <Volume2 className="h-3.5 w-3.5" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
