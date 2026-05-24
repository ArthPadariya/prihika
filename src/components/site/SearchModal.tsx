import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listStoreProducts } from "@/lib/products";
import { formatPrice, useShop } from "@/lib/store";
import type { Product } from "@/lib/store";

export function SearchModal() {
  const { searchOpen, setSearchOpen } = useShop();
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!searchOpen) return;
    void listStoreProducts().then(setProducts);
  }, [searchOpen]);

  const results = useMemo(() => {
    if (!q.trim()) return products.slice(0, 4);
    const term = q.toLowerCase();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.collection.toLowerCase().includes(term),
      )
      .slice(0, 6);
  }, [q]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-charcoal/40 grid items-start justify-center pt-24 px-4"
          style={{ backgroundColor: "oklch(0.2 0.01 285 / 0.5)" }}
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-background rounded-2xl shadow-luxury overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
              <Search className="h-5 w-5 text-rose-gold" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search rings, necklaces, collections..."
                className="flex-1 bg-transparent outline-none text-base"
              />
              <button onClick={() => setSearchOpen(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <p className="text-[11px] tracking-widest uppercase text-muted-foreground px-2 mb-2">
                {q ? "Results" : "Popular"}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    to="/product/$id"
                    params={{ id: p.id }}
                    onClick={() => setSearchOpen(false)}
                    className="flex gap-3 p-2 rounded-xl hover:bg-secondary transition-colors"
                  >
                    <img src={p.image} alt={p.name} className="h-16 w-14 object-cover rounded-md" />
                    <div className="min-w-0">
                      <p className="font-display text-sm truncate">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.category}</p>
                      <p className="text-sm text-rose-gold mt-0.5">{formatPrice(p.price)}</p>
                    </div>
                  </Link>
                ))}
                {results.length === 0 && (
                  <p className="col-span-full text-center text-sm text-muted-foreground py-10">
                    No results for "{q}"
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
