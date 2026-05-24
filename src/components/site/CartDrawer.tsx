import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice, useShop } from "@/lib/store";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQty, removeFromCart } = useShop();
  const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-charcoal/40"
          onClick={() => setCartOpen(false)}
          style={{ backgroundColor: "oklch(0.2 0.01 285 / 0.45)" }}
        >
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-background flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-border">
              <h3 className="font-display text-xl flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-rose-gold" /> Your Bag
              </h3>
              <button onClick={() => setCartOpen(false)} aria-label="close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-20">
                  <div className="h-20 w-20 rounded-full bg-secondary grid place-items-center">
                    <ShoppingBag className="h-7 w-7 text-rose-gold" />
                  </div>
                  <p className="font-display text-xl">Your bag is empty</p>
                  <p className="text-sm text-muted-foreground max-w-[240px]">
                    Discover something beautiful to add to your collection.
                  </p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-3 px-6 py-3 rounded-full bg-rose-gold text-primary-foreground text-xs tracking-widest uppercase"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex gap-4"
                >
                  <Link
                    to="/product/$id"
                    params={{ id: item.id }}
                    onClick={() => setCartOpen(false)}
                    className="shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-20 object-cover rounded-lg bg-secondary"
                    />
                  </Link>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between gap-2">
                      <Link
                        to="/product/$id"
                        params={{ id: item.id }}
                        onClick={() => setCartOpen(false)}
                        className="font-display text-base leading-snug hover:text-rose-gold transition-colors"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-rose-gold"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {item.metal}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-border rounded-full">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="h-7 w-7 grid place-items-center"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="h-7 w-7 grid place-items-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="font-medium text-sm">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-border p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Shipping and taxes calculated at checkout.
                </p>
                <Link
                  to="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="block text-center py-4 rounded-full bg-charcoal text-ivory text-xs tracking-widest uppercase shine"
                  style={{ backgroundColor: "var(--charcoal)", color: "var(--ivory)" }}
                >
                  Checkout · {formatPrice(subtotal)}
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setCartOpen(false)}
                  className="block text-center text-xs underline underline-offset-4 text-muted-foreground hover:text-rose-gold"
                >
                  View full cart
                </Link>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}