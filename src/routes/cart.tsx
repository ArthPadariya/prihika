import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice, useShop } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — PriHiKa" }] }),
  component: CartPage,
});

function CartPage() {
  const { cart, updateQty, removeFromCart } = useShop();
  const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 200;

  return (
    <div className="container mx-auto px-5 lg:px-10 py-12">
      <h1 className="font-display text-4xl md:text-5xl mb-2">Your Bag</h1>
      <p className="text-muted-foreground mb-12">{cart.length} {cart.length === 1 ? "piece" : "pieces"}</p>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-2xl">Your bag is empty</p>
          <Link to="/shop" className="mt-4 inline-block text-rose-gold underline">Continue shopping</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_380px] gap-12">
          <div className="space-y-5">
            {cart.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-5 p-5 bg-card rounded-2xl shadow-soft"
              >
                <Link to="/product/$id" params={{ id: item.id }} className="shrink-0">
                  <img src={item.image} className="h-28 w-24 object-cover rounded-xl bg-secondary" alt={item.name} />
                </Link>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-2">
                    <Link to="/product/$id" params={{ id: item.id }} className="group">
                      <p className="font-display text-lg group-hover:text-rose-gold transition-colors">{item.name}</p>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{item.metal}</p>
                    </Link>
                    <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-rose-gold">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-border rounded-full">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="h-8 w-8 grid place-items-center"><Minus className="h-3 w-3" /></button>
                      <span className="w-8 text-center text-sm">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="h-8 w-8 grid place-items-center"><Plus className="h-3 w-3" /></button>
                    </div>
                    <p className="font-medium">{formatPrice(item.price * item.qty)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <aside className="bg-secondary rounded-3xl p-8 h-fit space-y-4 sticky top-24">
            <h3 className="font-display text-xl">Order Summary</h3>
            <Row k="Subtotal" v={formatPrice(subtotal)} />
            <Row k="Shipping" v={shipping === 0 ? "Free" : formatPrice(shipping)} />
            <div className="border-t border-border pt-4 flex justify-between font-display text-xl">
              <span>Total</span>
              <span>{formatPrice(subtotal + shipping)}</span>
            </div>
            <Link
              to="/checkout"
              className="block text-center py-4 rounded-full shine text-xs tracking-[0.25em] uppercase mt-4"
              style={{ background: "var(--gradient-rose)", color: "var(--ivory)" }}
            >
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span>{v}</span>
    </div>
  );
}