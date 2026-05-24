import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { type Product, formatPrice, useShop } from "@/lib/store";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const isWishlisted = wishlist.includes(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08 }}
      className="group relative"
    >
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="block relative overflow-hidden rounded-2xl bg-secondary shine"
      >
        <div className="aspect-[4/5] overflow-hidden">
          {product.image ? (
            <motion.img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-secondary text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Prihika
            </div>
          )}
        </div>

        {product.oldPrice && (
          <span className="absolute top-4 left-4 bg-rose-gold text-primary-foreground text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full">
            Save {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          aria-label="Wishlist"
          className={`absolute top-4 right-4 h-10 w-10 rounded-full grid place-items-center backdrop-blur-md transition-all ${
            isWishlisted
              ? "bg-rose-gold text-primary-foreground"
              : "bg-background/70 text-foreground hover:bg-background"
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        <div className="absolute inset-x-4 bottom-4 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-background/90 backdrop-blur-md text-foreground hover:bg-rose-gold hover:text-primary-foreground transition-all text-xs tracking-widest uppercase font-medium"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add to bag
          </button>
        </div>
      </Link>

      <div className="pt-5 px-1">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="font-display text-lg leading-snug hover:text-rose-gold transition-colors"
        >
          {product.name}
        </Link>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
          {product.metal}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-medium">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
