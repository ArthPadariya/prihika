import type React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Boxes,
  ChevronRight,
  FolderOpen,
  Gem,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  TicketPercent,
  UserCog,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader } from "@/components/admin/Loader";

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Homepage Content", to: "/admin/homepage-content", icon: Home },
  { label: "Products", to: "/admin/products", icon: Boxes },
  { label: "Categories", to: "/admin/categories", icon: Sparkles },
  { label: "Collections", to: "/admin/collections", icon: FolderOpen },
  { label: "Featured Sections", to: "/admin/featured-sections", icon: Star },
  { label: "Homepage Reels", to: "/admin/reels", icon: Home },
  { label: "Banners", to: "/admin/banners", icon: Image },
  { label: "Testimonials", to: "/admin/testimonials", icon: ShieldCheck },
  { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
  { label: "Coupons", to: "/admin/coupons", icon: TicketPercent },
  { label: "Admin Users", to: "/admin/users", icon: UserCog },
  { label: "Settings", to: "/admin/settings", icon: Settings },
] as const;

export function AdminLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const { pathname } = useLocation();
  const { admin, loading, logout } = useAdminAuth(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading || !admin) {
    return (
      <div className="min-h-screen bg-[#090706]">
        <Loader />
      </div>
    );
  }

  const current = navItems.find((item) => item.to === pathname)?.label ?? "Admin";

  return (
    <div className="min-h-screen bg-[#090706] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(215,180,106,.16),transparent_34%),linear-gradient(135deg,#090706,#16100c_45%,#090706)]" />
      <div className="relative flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-black/25 p-4 backdrop-blur-2xl lg:block">
          <SidebarContent pathname={pathname} onLogout={() => void logout()} />
        </aside>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="h-full w-80 max-w-[86vw] border-r border-white/10 bg-[#100d0a] p-4"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md p-2 text-[#f6ead0]/70 hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <SidebarContent pathname={pathname} onLogout={() => void logout()} />
              </motion.aside>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090706]/78 px-4 py-4 backdrop-blur-2xl sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="rounded-md p-2 text-[#f6ead0]/75 hover:bg-white/10 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#f6ead0]/45">
                    <span>Admin</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-[#d7b46a]">{current}</span>
                  </div>
                  <h1 className="mt-1 font-display text-3xl text-white">{title}</h1>
                  <p className="mt-1 text-sm text-[#f6ead0]/55">{subtitle}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative min-w-0 sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f6ead0]/35" />
                  <input
                    placeholder="Search products, orders, customers"
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.055] pl-9 pr-3 text-sm text-white outline-none placeholder:text-[#f6ead0]/35 focus:border-[#d7b46a]/50"
                  />
                </label>
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.055] text-[#f6ead0]/70 hover:bg-white/10"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[#d7b46a]/15 text-[#f4d58d]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {admin.name || admin.email}
                    </p>
                    <p className="text-xs text-[#f6ead0]/45">{admin.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="p-4 sm:p-6 lg:p-8"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ pathname, onLogout }: { pathname: string; onLogout: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Link
        to="/admin/dashboard"
        className="mb-6 flex items-center gap-3 rounded-lg border border-[#d7b46a]/20 bg-[#d7b46a]/10 p-4"
      >
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#d7b46a] text-black">
          <Gem className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-2xl text-white">Prihika</p>
          <p className="text-xs uppercase tracking-[0.24em] text-[#d7b46a]">Admin CMS</p>
        </div>
      </Link>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                active
                  ? "bg-[#d7b46a] text-black shadow-[0_14px_38px_rgba(215,180,106,.25)]"
                  : "text-[#f6ead0]/68 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-[#d7b46a]/80">Secure Access</p>
        <p className="mt-2 text-sm text-[#f6ead0]/55">
          Role checks are enforced through Supabase auth and the admin_users table.
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-[#f6ead0]/75 hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
