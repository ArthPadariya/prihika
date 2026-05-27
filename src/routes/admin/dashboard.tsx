import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeIndianRupee,
  Boxes,
  CheckCircle2,
  Clock3,
  Film,
  FolderOpen,
  Gem,
  Image,
  Layers3,
  ShieldCheck,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AnalyticsCard } from "@/components/admin/AnalyticsCard";
import { AdminCardSkeleton } from "@/components/admin/Skeletons";
import { StatsChart } from "@/components/admin/StatsChart";
import { getDashboardStats, listAllProducts, listOrders } from "@/services/adminService";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import type { ChartPoint, DashboardStats } from "@/types/admin";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [{ title: "Prihika Admin Dashboard" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<ChartPoint[]>([]);
  const [categoryData, setCategoryData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashboard, orders, products] = await Promise.all([
        getDashboardStats(),
        listOrders(),
        listAllProducts(),
      ]);
      setStats(dashboard);
      setRevenueData(buildRevenueData(orders));
      setCategoryData(buildCategoryData(products));
    } catch (loadError) {
      console.error("[Prihika CMS] Dashboard load failed", loadError);
      setError(loadError instanceof Error ? loadError.message : "Dashboard data could not load.");
      setStats(emptyDashboardStats);
      setRevenueData(buildRevenueData([]));
      setCategoryData(buildCategoryData([]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh("products", () => void load());
  useRealtimeRefresh("homepage_categories", () => void load());
  useRealtimeRefresh("homepage_collections", () => void load());
  useRealtimeRefresh("homepage_reels", () => void load());
  useRealtimeRefresh("homepage_banners", () => void load());
  useRealtimeRefresh("orders", () => void load());
  useRealtimeRefresh("admin_users", () => void load());

  const orderData = useMemo(
    () =>
      revenueData.map((point) => ({
        ...point,
        orders: point.orders ?? Math.round(Number(point.revenue ?? 0) / 6500),
      })),
    [revenueData],
  );
  const visibleStats = stats ?? emptyDashboardStats;

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="A live pulse on Prihika's catalogue, revenue, media, and operations."
    >
      {loading ? (
        <AdminCardSkeleton count={8} />
      ) : (
        <div className="space-y-6">
          {error ? (
            <div className="rounded-lg border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AnalyticsCard
              title="Total Products"
              value={String(visibleStats.totalProducts)}
              detail="Catalogue pieces under CMS control"
              icon={Boxes}
            />
            <AnalyticsCard
              title="Categories"
              value={String(visibleStats.totalCategories)}
              detail="Homepage and shop categories"
              icon={Layers3}
            />
            <AnalyticsCard
              title="Collections"
              value={String(visibleStats.totalCollections)}
              detail="Collection stories under CMS control"
              icon={FolderOpen}
            />
            <AnalyticsCard
              title="Active Reels"
              value={String(visibleStats.activeReels)}
              detail={`${visibleStats.totalReels} total homepage reels`}
              icon={Film}
            />
            <AnalyticsCard
              title="Active Banners"
              value={String(visibleStats.activeBanners)}
              detail={`${visibleStats.totalBanners} total campaign banners`}
              icon={Image}
            />
            <AnalyticsCard
              title="Featured Products"
              value={String(visibleStats.featuredProducts)}
              detail="Homepage product highlights"
              icon={Gem}
            />
            <AnalyticsCard
              title="Total Orders"
              value={String(visibleStats.totalOrders)}
              detail="Customer orders tracked live"
              icon={ShoppingBag}
            />
            <AnalyticsCard
              title="Low Stock"
              value={String(visibleStats.lowStock)}
              detail="Products at or below 3 units"
              icon={TriangleAlert}
            />
            <AnalyticsCard
              title="Revenue"
              value={`Rs. ${visibleStats.totalRevenue.toLocaleString("en-IN")}`}
              detail="Total captured order value"
              icon={BadgeIndianRupee}
            />
            <AnalyticsCard
              title="Pending Orders"
              value={String(visibleStats.pendingOrders)}
              detail="Orders waiting for fulfilment"
              icon={Clock3}
            />
            <AnalyticsCard
              title="Delivered Orders"
              value={String(visibleStats.deliveredOrders)}
              detail="Completed fulfilment count"
              icon={CheckCircle2}
            />
            <AnalyticsCard
              title="Admin Users"
              value={String(visibleStats.totalAdminUsers)}
              detail="Authorized CMS profiles"
              icon={ShieldCheck}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
            <StatsChart title="Revenue Graph" data={revenueData} dataKey="revenue" />
            <StatsChart title="Orders Analytics" data={orderData} dataKey="orders" type="bar" />
          </div>
          <StatsChart
            title="Product Category Analytics"
            data={categoryData}
            dataKey="products"
            type="bar"
          />
          {visibleStats.newestProducts.length ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[#d7b46a]/80">
                Newest Products
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {visibleStats.newestProducts.map((product) => (
                  <div
                    key={product}
                    className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white"
                  >
                    {product}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </AdminLayout>
  );
}

const emptyDashboardStats: DashboardStats = {
  totalProducts: 0,
  totalCategories: 0,
  totalCollections: 0,
  totalOrders: 0,
  totalRevenue: 0,
  totalReels: 0,
  totalBanners: 0,
  activeReels: 0,
  activeBanners: 0,
  featuredProducts: 0,
  lowStock: 0,
  pendingOrders: 0,
  deliveredOrders: 0,
  totalAdminUsers: 0,
  newestProducts: [],
};

function buildRevenueData(orders: { created_at?: string | null; total_amount?: number | null }[]) {
  const months = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return { date, name: date.toLocaleString("en", { month: "short" }), revenue: 0, orders: 0 };
  });

  for (const order of orders) {
    const date = order.created_at ? new Date(order.created_at) : new Date();
    const match = months.find(
      (month) =>
        month.date.getMonth() === date.getMonth() &&
        month.date.getFullYear() === date.getFullYear(),
    );
    if (match) {
      match.revenue += Number(order.total_amount ?? 0);
      match.orders += 1;
    }
  }

  return months.map(({ name, revenue, orders }) => ({ name, revenue, orders }));
}

function buildCategoryData(products: { category?: string | null }[]) {
  const counts = new Map<string, number>();
  for (const product of products) {
    const key = product.category || "Uncategorised";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([name, products]) => ({ name, products }));
}
