import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  id: string;
  databaseId?: string;
  name: string;
  price: number;
  oldPrice?: number;
  category: string;
  collection: string;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  metal: string;
  faqs?: Array<{ question: string; answer: string }>;
  bestseller?: boolean;
  trending?: boolean;
}

export interface CartItem extends Product {
  qty: number;
}

interface ShopState {
  cart: CartItem[];
  wishlist: string[];
  cartOpen: boolean;
  searchOpen: boolean;
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  toggleWishlist: (id: string) => void;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  clearCart: () => void;
}

export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      cartOpen: false,
      searchOpen: false,
      addToCart: (p) =>
        set((s) => {
          const existing = s.cart.find((c) => c.id === p.id);
          if (existing)
            return {
              cart: s.cart.map((c) =>
                c.id === p.id ? { ...c, qty: c.qty + 1 } : c,
              ),
              cartOpen: true,
            };
          return { cart: [...s.cart, { ...p, qty: 1 }], cartOpen: true };
        }),
      removeFromCart: (id) =>
        set((s) => ({ cart: s.cart.filter((c) => c.id !== id) })),
      updateQty: (id, qty) =>
        set((s) => ({
          cart: s.cart
            .map((c) => (c.id === id ? { ...c, qty } : c))
            .filter((c) => c.qty > 0),
        })),
      toggleWishlist: (id) =>
        set((s) => ({
          wishlist: s.wishlist.includes(id)
            ? s.wishlist.filter((w) => w !== id)
            : [...s.wishlist, id],
        })),
      setCartOpen: (v) => set({ cartOpen: v }),
      setSearchOpen: (v) => set({ searchOpen: v }),
      clearCart: () => set({ cart: [] }),
    }),
    { name: "prihika-shop" },
  ),
);

export const formatPrice = (n: number) =>
  `₹${n.toLocaleString("en-IN")}`;
