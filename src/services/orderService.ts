import { supabase } from "@/lib/supabase";
import type { CartItem } from "@/lib/store";

interface CheckoutInput {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Record<string, FormDataEntryValue | null>;
  total_amount: number;
  cart: CartItem[];
}

function logAndThrow(context: string, error: unknown): never {
  console.error(`[Prihika Checkout] ${context}`, error);
  if (error instanceof Error) throw error;
  if (error && typeof error === "object" && "message" in error) {
    throw new Error(String((error as { message?: unknown }).message));
  }
  throw new Error(`${context} failed.`);
}

export async function createCheckoutOrder(input: CheckoutInput) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      customer_phone: input.customer_phone,
      shipping_address: input.shipping_address,
      total_amount: Number(input.total_amount || 0),
      status: "Pending",
      payment_status: "pending",
    })
    .select()
    .single();

  if (orderError) logAndThrow("Create order", orderError);

  const { error: itemError } = await supabase.from("order_items").insert(
    input.cart.map((item) => ({
      order_id: order.id,
      product_id: item.databaseId ?? null,
      product_title: item.name,
      quantity: Number(item.qty || 1),
      price: Number(item.price || 0),
    })),
  );

  if (itemError) logAndThrow("Create order items", itemError);

  return order;
}
