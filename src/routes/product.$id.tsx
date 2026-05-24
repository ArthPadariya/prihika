import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Heart, Maximize2, Minus, Plus, Shield, ShoppingBag, Truck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductFaq } from "@/components/site/ProductFaq";
import { BrandStory } from "@/components/site/BrandStory";
import { getStoreProduct, listStoreProducts } from "@/lib/products";
import { formatPrice, type Product, useShop } from "@/lib/store";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const p = await getStoreProduct(params.id);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.name} — PriHiKa` },
      { name: "description", content: loaderData.description },
      { property: "og:image", content: loaderData.image },
    ] : [],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="container mx-auto px-5 py-32 text-center">
      <p className="font-display text-4xl">Piece not found</p>
      <Link to="/shop" className="mt-6 inline-block text-rose-gold underline">Back to shop</Link>
    </div>
  ),
});

function ProductPage() {
  const product = Route.useLoaderData();
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [hoverZoom, setHoverZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const isWish = wishlist.includes(product.id);
  const gallery = [product.image].filter(Boolean);

  useEffect(() => {
    void listStoreProducts().then((items) => {
      setRelated(items.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 4));
    });
  }, [product.category, product.id]);

  return (
    <div className="container mx-auto px-5 sm:px-6 lg:px-10 py-6 md:py-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-6 md:mb-10">
        <Link to="/" className="hover:text-rose-gold transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/shop" className="hover:text-rose-gold transition-colors">Shop</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground/70 truncate max-w-[160px] sm:max-w-none normal-case tracking-normal font-display text-xs">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div
            className="group relative aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-secondary cursor-zoom-in select-none"
            onMouseEnter={() => setHoverZoom(true)}
            onMouseLeave={() => setHoverZoom(false)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
            }}
            onClick={() => setLightbox(true)}
          >
            <AnimatePresence mode="wait">
              {gallery[activeImg] ? (
                <motion.img
                  key={activeImg}
                  src={gallery[activeImg]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-out"
                  style={{
                    transform: hoverZoom ? "scale(1.7)" : "scale(1)",
                    transformOrigin: `${origin.x}% ${origin.y}%`,
                  }}
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Prihika
                </div>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
              aria-label="View fullscreen"
              className="absolute bottom-4 right-4 h-11 w-11 rounded-full bg-background/90 backdrop-blur grid place-items-center text-foreground hover:text-rose-gold transition-all shadow-soft hover:scale-110"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2.5 md:gap-3 mt-3 md:mt-4">
            {gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`aspect-square rounded-xl overflow-hidden bg-secondary transition-all ${
                  activeImg === i
                    ? "ring-2 ring-rose-gold ring-offset-2 ring-offset-background"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="lg:pt-2"
        >
          <span className="text-[10px] md:text-xs tracking-[0.32em] uppercase text-rose-gold">{product.collection} Collection</span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-[1.1] mt-3">{product.name}</h1>
          <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{product.metal}</p>

          <div className="mt-6 md:mt-7 flex items-baseline gap-3">
            <span className="font-display text-3xl md:text-4xl">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>

          <p className="mt-6 md:mt-7 text-sm md:text-base text-foreground/75 leading-[1.8]">{product.description}</p>

          <div className="mt-9 md:mt-10 flex items-center gap-3 md:gap-4">
            <div className="flex items-center border border-border rounded-full bg-background">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="decrease" className="h-14 w-12 grid place-items-center text-muted-foreground hover:text-rose-gold"><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} aria-label="increase" className="h-14 w-12 grid place-items-center text-muted-foreground hover:text-rose-gold"><Plus className="h-4 w-4" /></button>
            </div>
            <button
              onClick={() => { for (let i = 0; i < qty; i++) addToCart(product); }}
              className="btn-luxury flex-1 h-14"
            >
              <ShoppingBag className="h-4 w-4" /> Add to bag
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`h-14 w-14 shrink-0 rounded-full border grid place-items-center transition-all ${isWish ? "bg-rose-gold text-primary-foreground border-rose-gold shadow-soft" : "border-border hover:border-rose-gold hover:text-rose-gold"}`}
              aria-label="Add to wishlist"
              title="Add to wishlist"
            >
              <Heart className={`h-[18px] w-[18px] ${isWish ? "fill-current" : ""}`} />
            </button>
          </div>

          <div className="mt-10 md:mt-12 grid grid-cols-2 gap-3 md:gap-4">
            {[
              { Icon: Truck, t: "Free Shipping", d: "Delivered in 3–5 days" },
              { Icon: Shield, t: "Lifetime Exchange", d: "On all gold pieces" },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/60">
                <Icon className="h-5 w-5 text-rose-gold mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t}</p>
                  <p className="text-xs text-muted-foreground">{d}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 md:mt-12 border-t border-border pt-6 space-y-3 text-sm">
            <Detail label="Metal" value={product.metal} />
            <Detail label="Collection" value={product.collection} />
            <Detail label="Category" value={product.category} />
            <Detail label="Certification" value="BIS Hallmarked · IGI" />
          </div>
        </motion.div>
      </div>

      {related.length > 0 && (
        <section className="mt-24 md:mt-32">
          <h2 className="font-display text-3xl md:text-4xl text-center mb-10 md:mb-12">You may also love</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      <ProductFaq faqs={product.faqs} />
      <BrandStory />

      <Lightbox
        open={lightbox && gallery.length > 0}
        onClose={() => setLightbox(false)}
        images={gallery}
        index={activeImg}
        setIndex={setActiveImg}
        alt={product.name}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground uppercase tracking-wider text-xs">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Lightbox({
  open, onClose, images, index, setIndex, alt,
}: {
  open: boolean; onClose: () => void; images: string[]; index: number; setIndex: (i: number) => void; alt: string;
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const startTouches = useRef<{ d: number; cx: number; cy: number; ox: number; oy: number } | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const reset = () => { setScale(1); setOffset({ x: 0, y: 0 }); };

  const go = (dir: number) => {
    reset();
    setIndex((index + dir + images.length) % images.length);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      startTouches.current = {
        d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
        cx: (a.clientX + b.clientX) / 2,
        cy: (a.clientY + b.clientY) / 2,
        ox: offset.x,
        oy: offset.y,
      };
    } else if (e.touches.length === 1 && scale === 1) {
      swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && startTouches.current) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const next = Math.min(4, Math.max(1, (d / startTouches.current.d) * scale));
      setScale(next);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (swipeStart.current && e.changedTouches.length === 1 && scale === 1) {
      const dx = e.changedTouches[0].clientX - swipeStart.current.x;
      if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
    }
    startTouches.current = null;
    swipeStart.current = null;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md"
          style={{ backgroundColor: "rgba(15, 12, 18, 0.94)" }}
          onClick={onClose}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-5 right-5 z-[120] h-12 w-12 rounded-full grid place-items-center transition-colors pointer-events-auto"
            style={{ color: "var(--ivory)", backgroundColor: "rgba(255,255,255,0.12)" }}
            aria-label="Close"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>

          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-[105] flex items-center justify-center overflow-hidden touch-none pointer-events-none"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onDoubleClick={() => (scale === 1 ? setScale(2.2) : reset())}
          >
            <img
              src={images[index]}
              alt={alt}
              draggable={false}
              className="max-w-[92vw] max-h-[88vh] object-contain select-none transition-transform duration-300 pointer-events-auto"
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
            />
          </motion.div>

          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-3 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); reset(); setIndex(i); }}
                className="h-3 rounded-full transition-all grid place-items-center"
                style={{
                  width: i === index ? 36 : 10,
                }}
                aria-label={`Image ${i + 1}`}
              >
                <span
                  className="block h-1.5 w-full rounded-full"
                  style={{ backgroundColor: i === index ? "var(--ivory)" : "rgba(255,255,255,0.4)" }}
                />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
