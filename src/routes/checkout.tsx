import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPrice, useShop } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout - PriHiKa" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cart, clearCart } = useShop();
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const total = subtotal + (subtotal > 5000 || subtotal === 0 ? 0 : 200);

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cart.length) return;

    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("first_name") ?? "");
    const lastName = String(form.get("last_name") ?? "");

    setSaving(true);
    setError("");
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: `${firstName} ${lastName}`.trim(),
          customer_email: String(form.get("email") ?? ""),
          customer_phone: String(form.get("phone") ?? ""),
          shipping_address: {
            address: form.get("address"),
            city: form.get("city"),
            state: form.get("state"),
            pin_code: form.get("pin_code"),
          },
          total_amount: total,
          status: "Pending",
          payment_status: "pending",
        })
        .select()
        .single();
      if (orderError) throw orderError;

      const { error: itemError } = await supabase.from("order_items").insert(
        cart.map((item) => ({
          order_id: order.id,
          product_id: item.databaseId ?? null,
          product_title: item.name,
          quantity: item.qty,
          price: item.price,
        })),
      );
      if (itemError) throw itemError;

      clearCart();
      setDone(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Order could not be placed.");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="container mx-auto px-5 py-24 text-center max-w-md">
        <CheckCircle2 className="h-16 w-16 text-rose-gold mx-auto mb-6" />
        <h1 className="font-display text-4xl">Order placed</h1>
        <p className="mt-4 text-muted-foreground">Thank you. A confirmation has been sent to your email. Your pieces will arrive in 3-5 days.</p>
        <Link to="/" className="mt-8 inline-block px-7 py-3 rounded-full" style={{ background: "var(--gradient-rose)", color: "var(--ivory)" }}>
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-5 lg:px-10 py-12">
      <h1 className="font-display text-4xl md:text-5xl mb-12">Checkout</h1>
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12">
        <form onSubmit={(event) => void submitOrder(event)} className="space-y-10">
          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
          <Section title="Contact">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email" name="email" type="email" />
              <Field label="Phone" name="phone" type="tel" />
            </div>
          </Section>
          <Section title="Shipping address">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="First name" name="first_name" />
              <Field label="Last name" name="last_name" />
            </div>
            <Field label="Address" name="address" />
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="City" name="city" />
              <Field label="State" name="state" />
              <Field label="PIN code" name="pin_code" />
            </div>
          </Section>
          <Section title="Payment">
            <div className="space-y-3">
              {["UPI", "Credit / Debit Card", "Net Banking", "Cash on Delivery"].map((method, index) => (
                <label key={method} className="flex items-center gap-3 p-4 rounded-2xl border border-border cursor-pointer hover:border-rose-gold">
                  <input type="radio" name="pay" defaultChecked={index === 0} className="accent-[var(--rose)]" />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </Section>
          <button
            type="submit"
            disabled={cart.length === 0 || saving}
            className="w-full py-4 rounded-full shine text-xs tracking-[0.25em] uppercase disabled:opacity-50"
            style={{ background: "var(--gradient-rose)", color: "var(--ivory)" }}
          >
            {saving ? "Placing order..." : `Place order - ${formatPrice(total)}`}
          </button>
        </form>
        <aside className="bg-secondary rounded-3xl p-8 h-fit sticky top-24 space-y-5">
          <h3 className="font-display text-xl">Your order</h3>
          {cart.length === 0 && <p className="text-sm text-muted-foreground">Your bag is empty.</p>}
          {cart.map((item) => (
            <div key={item.id} className="flex gap-3">
              {item.image ? <img src={item.image} className="h-16 w-14 object-cover rounded-lg" alt="" /> : null}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qty {item.qty}</p>
              </div>
              <p className="text-sm">{formatPrice(item.price * item.qty)}</p>
            </div>
          ))}
          <div className="border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{subtotal > 5000 || subtotal === 0 ? "Free" : formatPrice(200)}</span></div>
            <div className="flex justify-between font-display text-lg pt-2"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">{label}</label>
      <input name={name} type={type} required className="w-full bg-card border border-border rounded-xl px-4 py-3 outline-none focus:border-rose-gold transition-colors" />
    </div>
  );
}
