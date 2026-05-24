import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { listStoreCollections } from "@/lib/products";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import type { Collection } from "@/types/admin";

export const Route = createFileRoute("/collections")({
  loader: () => listStoreCollections(),
  head: () => ({
    meta: [
      { title: "Collections - PriHiKa" },
      { name: "description", content: "Discover the PriHiKa collections." },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const initialCollections = Route.useLoaderData();
  const [collections, setCollections] = useState<Collection[]>(initialCollections);

  const load = useCallback(async () => {
    setCollections(await listStoreCollections());
  }, []);

  useEffect(() => {
    setCollections(initialCollections);
  }, [initialCollections]);

  useRealtimeRefresh("collections", () => void load());

  return (
    <div className="container mx-auto px-5 lg:px-10 py-12">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <span className="text-xs tracking-[0.3em] uppercase text-rose-gold">Our World</span>
        <h1 className="font-display text-4xl md:text-6xl mt-3">Collections</h1>
        <p className="mt-4 text-muted-foreground">
          Every story in the PriHiKa catalogue is now curated from the CMS.
        </p>
      </div>
      <div className="space-y-12">
        {collections.map((collection, i) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className={`grid lg:grid-cols-2 gap-8 items-center ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shine bg-secondary">
              {collection.cover_image ? (
                <img src={collection.cover_image} alt={collection.title} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="lg:px-10">
              <span className="text-xs tracking-[0.3em] uppercase text-rose-gold">Collection {String(i + 1).padStart(2, "0")}</span>
              <h2 className="font-display text-4xl md:text-5xl mt-3 mb-5">{collection.title}</h2>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">{collection.description}</p>
              <Link
                to="/shop"
                className="inline-block px-7 py-3 rounded-full border border-charcoal/30 hover:border-rose-gold hover:text-rose-gold transition-colors text-xs tracking-[0.25em] uppercase"
              >
                Explore {collection.title}
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
