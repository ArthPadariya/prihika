import { Edit, Gem, Star, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/types/admin";

export function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  const image = product.product_images?.[0]?.image_url;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] shadow-[0_24px_80px_rgba(0,0,0,.22)]"
    >
      <div className="relative aspect-[4/3] bg-[#17110d]">
        {image ? (
          <img
            src={image}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-[#d7b46a]/60">
            <Gem className="h-8 w-8" />
          </div>
        )}
        {product.featured ? (
          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs text-[#f4d58d] backdrop-blur">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </div>
        ) : null}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-1 font-medium text-white">{product.title}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#f6ead0]/45">
              {product.category ?? "Uncategorised"}
            </p>
          </div>
          <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-[#f6ead0]/60">
            {product.status ?? "draft"}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-[#f4d58d]">
              Rs. {Number(product.price ?? 0).toLocaleString("en-IN")}
            </p>
            <p
              className={`text-xs ${Number(product.stock ?? 0) <= 3 ? "text-red-200" : "text-[#f6ead0]/45"}`}
            >
              {Number(product.stock ?? 0) <= 0 ? "Out of stock" : `${product.stock ?? 0} in stock`}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="rounded-md p-2 text-[#f6ead0]/65 hover:bg-white/10 hover:text-white"
              aria-label="Edit product"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(product)}
              className="rounded-md p-2 text-red-300/75 hover:bg-red-500/10 hover:text-red-200"
              aria-label="Delete product"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
