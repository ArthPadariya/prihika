import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { listStoreProducts } from "@/lib/products";
import { useShop, type Product } from "@/lib/store";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

export const Route = createFileRoute("/wishlist")({
  loader: () => listStoreProducts(),
  head: () => ({ meta: [{ title: "Wishlist - PriHiKa" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const initialProducts = Route.useLoaderData();
  const { wishlist } = useShop();
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    setProducts(initialProducts);
    void listStoreProducts().then(setProducts);
  }, [initialProducts]);

  useRealtimeRefresh("products", () => void listStoreProducts().then(setProducts));
  useRealtimeRefresh("product_images", () => void listStoreProducts().then(setProducts));

  const items = useMemo(
    () => products.filter((product) => wishlist.includes(product.id)),
    [products, wishlist],
  );

  return (
    <div className="container mx-auto px-5 lg:px-10 py-12">
      <h1 className="font-display text-4xl md:text-5xl mb-2">Wishlist</h1>
      <p className="text-muted-foreground mb-12">
        {items.length} saved {items.length === 1 ? "piece" : "pieces"}
      </p>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-2xl">Nothing saved yet</p>
          <Link to="/shop" className="mt-4 inline-block text-rose-gold underline">
            Discover the shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
