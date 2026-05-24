import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useShop } from "@/lib/store";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/collections", label: "Collections" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cart, wishlist, setCartOpen, setSearchOpen } = useShop();
  const { location } = useRouterState();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const cartCount = cart.reduce((a, c) => a + c.qty, 0);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass border-b border-border/60 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-5 lg:px-10 flex items-center justify-between gap-6">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden -ml-1 p-2"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-display text-2xl md:text-3xl tracking-[0.18em] text-charcoal">
            <span className="text-rose-gold">Pri</span>Hi
            <span className="text-rose-gold">Ka</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9 text-sm">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="relative tracking-[0.18em] uppercase text-[0.8rem] font-medium text-foreground hover:text-rose-gold transition-colors"
              activeProps={{ className: "text-rose-gold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="p-2 hover:text-rose-gold transition-colors"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <Link
            to="/login"
            aria-label="Account"
            className="hidden sm:inline-flex p-2 hover:text-rose-gold transition-colors"
          >
            <User className="h-[18px] w-[18px]" />
          </Link>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="p-2 hover:text-rose-gold transition-colors relative"
          >
            <Heart className="h-[18px] w-[18px]" />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-gold text-[10px] text-primary-foreground grid place-items-center">
                {wishlist.length}
              </span>
            )}
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Cart"
            className="p-2 hover:text-rose-gold transition-colors relative"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-gold text-[10px] text-primary-foreground grid place-items-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-charcoal/40"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-[82%] max-w-sm bg-background p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <span className="font-display text-2xl tracking-[0.18em]">
                  <span className="text-rose-gold">Pri</span>Hi
                  <span className="text-rose-gold">Ka</span>
                </span>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                {nav.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    className="font-display text-2xl py-3 border-b border-border/60"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
              <Link
                to="/login"
                className="mt-auto inline-flex justify-center items-center gap-2 rounded-full bg-charcoal text-ivory py-3 text-sm tracking-wider uppercase"
                style={{ color: "var(--ivory)", backgroundColor: "var(--charcoal)" }}
              >
                Login / Register
              </Link>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}