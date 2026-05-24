import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { listStoreProducts } from "@/lib/products";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import type { Product } from "@/lib/store";

export const Route = createFileRoute("/shop")({
  loader: () => listStoreProducts(),
  head: () => ({
    meta: [
      { title: "Shop - PriHiKa Jewellery" },
      { name: "description", content: "Browse the full PriHiKa jewellery catalogue." },
    ],
  }),
  component: ShopPage,
});

const sorts = ["Featured", "Price - Low to High", "Price - High to Low", "Top Rated"] as const;

function ShopPage() {
  const initialProducts = Route.useLoaderData();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cat, setCat] = useState("All");
  const [metal, setMetal] = useState("All");
  const [max, setMax] = useState(100000);
  const [sort, setSort] = useState<(typeof sorts)[number]>("Featured");
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setProducts(await listStoreProducts());
  }, []);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useRealtimeRefresh("products", () => void load());
  useRealtimeRefresh("product_images", () => void load());

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(products.map((product) => product.category).filter(Boolean))),
    ],
    [products],
  );
  const metals = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.metal).filter(Boolean)))],
    [products],
  );
  const highestPrice = useMemo(
    () => Math.max(100000, ...products.map((product) => product.price)),
    [products],
  );

  useEffect(() => {
    setMax((value) => Math.max(value, highestPrice));
  }, [highestPrice]);

  const list = useMemo(() => {
    let result = products.filter((product) => product.price <= max);
    if (cat !== "All") result = result.filter((product) => product.category === cat);
    if (metal !== "All") result = result.filter((product) => product.metal === metal);
    if (sort === "Price - Low to High") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "Price - High to Low") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "Top Rated") result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [cat, metal, max, products, sort]);

  return (
    <div className="container mx-auto px-5 lg:px-10 py-12">
      <div className="text-center mb-12">
        <span className="text-xs tracking-[0.3em] uppercase text-rose-gold">The Shop</span>
        <h1 className="font-display text-4xl md:text-6xl mt-3">All Jewellery</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          From everyday icons to once-in-a-lifetime statements - explore the full PriHiKa world.
        </p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-10">
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden flex items-center gap-2 px-5 py-3 rounded-full border border-border w-fit"
        >
          <Filter className="h-4 w-4" /> Filters
        </button>

        <aside
          className={`${open ? "fixed inset-0 z-[80] bg-background p-8 overflow-y-auto" : "hidden"} lg:block lg:static lg:p-0 space-y-8`}
        >
          <div className="lg:hidden flex items-center justify-between">
            <p className="font-display text-2xl">Filters</p>
            <button onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <FilterGroup title="Category" options={categories} active={cat} onChange={setCat} />
          <FilterGroup title="Metal" options={metals} active={metal} onChange={setMetal} />
          <div>
            <h4 className="font-display text-lg mb-4">Price</h4>
            <input
              type="range"
              min={0}
              max={highestPrice}
              step={1000}
              value={max}
              onChange={(e) => setMax(+e.target.value)}
              className="w-full accent-[var(--rose)]"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Rs. 0</span>
              <span className="text-rose-gold">Up to Rs. {max.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground">{list.length} pieces</p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as (typeof sorts)[number])}
              className="bg-transparent border border-border rounded-full px-4 py-2 text-xs tracking-wider outline-none focus:border-rose-gold"
            >
              {sorts.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          {list.length === 0 ? (
            <p className="text-center py-20 text-muted-foreground">No pieces match your filters.</p>
          ) : (
            <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {list.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  options,
  active,
  onChange,
}: {
  title: string;
  options: string[];
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h4 className="font-display text-lg mb-4">{title}</h4>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`block text-sm transition-colors ${active === option ? "text-rose-gold" : "text-foreground/70 hover:text-foreground"}`}
          >
            {active === option ? "- " : ""}
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
