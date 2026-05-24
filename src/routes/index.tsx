import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Award, Gem, Headphones, Sparkles, Truck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { Reels } from "@/components/site/Reels";
import { getHomeData, type HomeData } from "@/lib/products";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import type { FeaturedSection } from "@/types/admin";

export const Route = createFileRoute("/")({
  loader: () => getHomeData(),
  head: () => ({
    meta: [
      { title: "PriHiKa - Luxury Jewellery, Made to Be Remembered" },
      { name: "description", content: "Heirloom-grade rings, necklaces, and earrings handcrafted in fine metals." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const initialData = Route.useLoaderData();
  const [data, setData] = useState<HomeData>(initialData);

  const load = useCallback(async () => {
    setData(await getHomeData());
  }, []);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useRealtimeRefresh("products", () => void load());
  useRealtimeRefresh("product_images", () => void load());
  useRealtimeRefresh("categories", () => void load());
  useRealtimeRefresh("collections", () => void load());
  useRealtimeRefresh("homepage_content", () => void load());
  useRealtimeRefresh("featured_sections", () => void load());
  useRealtimeRefresh("testimonials", () => void load());
  useRealtimeRefresh("banners", () => void load());
  useRealtimeRefresh("homepage_reels", () => void load());

  const section = (key: string) =>
    data.featuredSections.find((item) => item.section_key === key) as FeaturedSection | undefined;
  const hero = data.homepage;

  return (
    <div>
      {hero ? (
        <section className="relative -mt-20 pt-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-luxury opacity-90" />
          <div className="container relative mx-auto px-5 lg:px-10 pt-16 pb-24 lg:pt-28 lg:pb-36 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {hero.hero_badge ? (
                <span className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-rose-gold mb-6">
                  <Sparkles className="h-3.5 w-3.5" /> {hero.hero_badge}
                </span>
              ) : null}
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-charcoal" style={{ color: "var(--charcoal)" }}>
                {hero.hero_title}
              </h1>
              {hero.hero_subtitle ? (
                <p className="mt-7 text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
                  {hero.hero_subtitle}
                </p>
              ) : null}
              <div className="mt-10 flex flex-wrap gap-3">
                {hero.cta_primary ? (
                  <a
                    href={hero.cta_primary_link || "/shop"}
                    className="group inline-flex items-center gap-2 px-8 py-4 rounded-full shine"
                    style={{ background: "var(--gradient-rose)", color: "var(--ivory)" }}
                  >
                    <span className="text-xs tracking-[0.25em] uppercase">{hero.cta_primary}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                ) : null}
                {hero.cta_secondary ? (
                  <a
                    href={hero.cta_secondary_link || "/collections"}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-charcoal/30 hover:border-rose-gold hover:text-rose-gold transition-colors"
                  >
                    <span className="text-xs tracking-[0.25em] uppercase">{hero.cta_secondary}</span>
                  </a>
                ) : null}
              </div>

              {hero.hero_featured_note ? (
                <div className="mt-12 flex items-center gap-6 text-xs text-muted-foreground">
                  {data.collections.length ? (
                    <div className="flex -space-x-2">
                      {data.collections.slice(0, 3).map((collection) => (
                        collection.cover_image ? (
                          <img key={collection.id} src={collection.cover_image} className="h-9 w-9 rounded-full object-cover border-2 border-background" alt="" />
                        ) : null
                      ))}
                    </div>
                  ) : null}
                  <p className="leading-snug">{hero.hero_featured_note}</p>
                </div>
              ) : null}
            </motion.div>

            {hero.hero_image ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="absolute -inset-6 bg-gradient-rose opacity-20 blur-3xl rounded-full" />
                <motion.img
                  src={hero.hero_image}
                  alt="PriHiKa jewellery"
                  className="relative w-full rounded-[2rem] object-cover shadow-luxury"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute -bottom-5 -left-3 md:-left-8 glass rounded-2xl p-4 pr-6 shadow-soft flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-full bg-rose-gold grid place-items-center text-primary-foreground">
                    <Gem className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-muted-foreground">Certified</p>
                    <p className="text-sm font-medium">BIS Hallmarked</p>
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </div>
        </section>
      ) : null}

      {data.banners.length ? (
        <section className="container mx-auto px-5 lg:px-10 py-12">
          <div className="space-y-5">
            {data.banners.map((banner) => (
              <a key={banner.id} href={banner.link_url || "#"} className="block overflow-hidden rounded-[2rem] shine">
                <picture>
                  {banner.mobile_image_url ? <source media="(max-width: 640px)" srcSet={banner.mobile_image_url} /> : null}
                  {banner.desktop_image_url ? (
                    <img src={banner.desktop_image_url} alt={banner.title ?? ""} loading="lazy" className="aspect-[16/5] w-full object-cover" />
                  ) : null}
                </picture>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {data.categories.length ? (
        <section className="container mx-auto px-5 lg:px-10 py-24">
          <SectionHeader eyebrow={section("categories")?.eyebrow ?? ""} title={section("categories")?.title ?? ""} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-12">
            {data.categories.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Link to="/shop" className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary shine">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/0 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 text-ivory" style={{ color: "var(--ivory)" }}>
                      <p className="font-display text-2xl">{category.name}</p>
                      <p className="text-xs tracking-widest uppercase opacity-80">{category.count} pieces</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      {data.bestsellers.length ? (
        <section className="container mx-auto px-5 lg:px-10 py-12">
          <div className="flex items-end justify-between mb-12">
            <SectionHeader eyebrow={section("bestsellers")?.eyebrow ?? ""} title={section("bestsellers")?.title ?? ""} align="left" />
            <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-xs tracking-widest uppercase text-rose-gold">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {data.bestsellers.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      ) : null}

      {data.collections.length ? (
        <section className="container mx-auto px-5 lg:px-10 py-24">
          <SectionHeader eyebrow={section("collections")?.eyebrow ?? ""} title={section("collections")?.title ?? ""} />
          <div className="grid lg:grid-cols-3 gap-5 mt-12">
            {data.collections.slice(0, 3).map((collection, i) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className="group relative aspect-[4/5] rounded-3xl overflow-hidden shine"
              >
                {collection.cover_image ? (
                  <img src={collection.cover_image} alt={collection.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-ivory" style={{ color: "var(--ivory)" }}>
                  <p className="text-[11px] tracking-[0.3em] uppercase opacity-80 mb-2">Collection</p>
                  <h3 className="font-display text-4xl mb-2">{collection.title}</h3>
                  <p className="text-sm opacity-90 mb-5">{collection.description}</p>
                  <Link to="/collections" className="inline-flex w-fit items-center gap-2 text-xs tracking-widest uppercase border-b border-ivory/60 pb-1 hover:border-rose-gold hover:text-rose-gold transition-colors">
                    Discover <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="py-24" style={{ background: "var(--beige)" }}>
        <div className="container mx-auto px-5 lg:px-10">
          <SectionHeader eyebrow="The PriHiKa Promise" title="Designed with care, delivered with grace" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">
            {[
              { Icon: Gem, title: "Certified Quality", desc: "Every piece is BIS hallmarked and IGI/SGL certified." },
              { Icon: Truck, title: "Free Shipping", desc: "Insured and tracked delivery across India, on us." },
              { Icon: Award, title: "Lifetime Exchange", desc: "Update or exchange your jewellery, always." },
              { Icon: Headphones, title: "Concierge Support", desc: "Talk to a stylist 7 days a week, on WhatsApp." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="text-center"
              >
                <div className="mx-auto h-14 w-14 rounded-full bg-background grid place-items-center text-rose-gold shadow-soft mb-5">
                  <item.Icon className="h-5 w-5" />
                </div>
                <h4 className="font-display text-xl mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px] mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {data.trending.length ? (
        <section className="container mx-auto px-5 lg:px-10 py-24">
          <SectionHeader eyebrow={section("trending")?.eyebrow ?? ""} title={section("trending")?.title ?? ""} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mt-12">
            {data.trending.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      ) : null}

      <Reels reels={data.reels} />

      {data.testimonials.length ? (
        <section className="py-24">
          <div className="container mx-auto px-5 lg:px-10">
            <SectionHeader eyebrow={section("testimonials")?.eyebrow ?? ""} title={section("testimonials")?.title ?? ""} />
            <div className="grid md:grid-cols-3 gap-6 mt-14">
              {data.testimonials.slice(0, 3).map((testimonial, i) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-card rounded-3xl p-8 shadow-soft"
                >
                  <div className="flex gap-1 text-rose-gold mb-4">
                    {Array.from({ length: Number(testimonial.rating ?? 5) }).map((_, key) => (
                      <span key={key}>★</span>
                    ))}
                  </div>
                  <p className="font-display text-lg leading-relaxed text-foreground/90">"{testimonial.text}"</p>
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.city}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.instagramProducts.length ? (
        <section className="container mx-auto px-5 lg:px-10 py-12">
          <SectionHeader eyebrow={section("instagram")?.eyebrow ?? ""} title={section("instagram")?.title ?? ""} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-12">
            {data.instagramProducts.map((product, i) => (
              <motion.a
                key={product.id}
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative aspect-square rounded-xl overflow-hidden bg-secondary"
              >
                {product.image ? (
                  <img src={product.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : null}
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/30 transition-colors grid place-items-center text-ivory opacity-0 group-hover:opacity-100" style={{ color: "var(--ivory)" }}>
                  <Sparkles className="h-5 w-5" />
                </div>
              </motion.a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="container mx-auto px-5 lg:px-10 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2.5rem] p-10 md:p-16 text-center"
          style={{ background: "var(--gradient-luxury)" }}
        >
          <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 30% 20%, var(--rose-soft), transparent 60%)" }} />
          <div className="relative max-w-2xl mx-auto">
            <span className="text-xs tracking-[0.3em] uppercase text-rose-gold">Join the circle</span>
            <h2 className="font-display text-4xl md:text-5xl mt-4">First access. Quiet edits.</h2>
            <p className="mt-4 text-muted-foreground">Be the first to see new drops, private previews, and stylist notes - once a fortnight, never more.</p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="flex-1 px-5 py-4 rounded-full bg-background/80 backdrop-blur border border-border outline-none focus:border-rose-gold transition-colors text-sm"
              />
              <button
                type="submit"
                className="px-7 py-4 rounded-full shine text-xs tracking-[0.25em] uppercase"
                style={{ background: "var(--gradient-rose)", color: "var(--ivory)" }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title, align = "center" }: { eyebrow: string; title: string; align?: "center" | "left" }) {
  if (!eyebrow && !title) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={align === "center" ? "text-center" : "text-left"}
    >
      {eyebrow ? <span className="text-xs tracking-[0.3em] uppercase text-rose-gold">{eyebrow}</span> : null}
      {title ? <h2 className="font-display text-3xl md:text-5xl mt-3 max-w-2xl mx-auto leading-tight">{title}</h2> : null}
    </motion.div>
  );
}
