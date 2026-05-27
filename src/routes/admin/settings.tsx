import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Database, HardDrive, KeyRound, RadioTower, ShieldCheck, Sparkles } from "lucide-react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AdminCardSkeleton } from "@/components/admin/Skeletons";
import { getSystemHealth } from "@/services/adminService";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import type { SystemHealth } from "@/types/admin";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [{ title: "Settings - Prihika Admin" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { admin } = useAdminAuth(true);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setHealth(await getSystemHealth(admin));
    setLoading(false);
  }, [admin]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh("products", () => void load());
  useRealtimeRefresh("homepage_banners", () => void load());
  useRealtimeRefresh("homepage_reels", () => void load());
  useRealtimeRefresh("orders", () => void load());
  useRealtimeRefresh("admin_users", () => void load());
  useRealtimeRefresh("coupons", () => void load());

  const cards = health
    ? [
        {
          icon: ShieldCheck,
          title: "Authenticated Admin",
          text: `${health.adminEmail} is signed in as ${health.adminRole}.`,
          ok: health.authenticated,
        },
        {
          icon: Database,
          title: "Database Health",
          text: health.databaseReachable
            ? "Supabase database responded to live CMS queries."
            : "Supabase database could not be reached with the current policies.",
          ok: health.databaseReachable,
        },
        {
          icon: RadioTower,
          title: "Realtime Status",
          text: `${health.realtimeTables.length} realtime table channels configured: ${health.realtimeTables.join(", ")}.`,
          ok: true,
        },
        {
          icon: HardDrive,
          title: "Storage Buckets",
          text: `${health.storageReadyCount} buckets configured: ${health.buckets.map((bucket) => bucket.name).join(", ")}.`,
          ok: health.storageReadyCount === 4,
        },
        {
          icon: KeyRound,
          title: "Environment",
          text: health.supabaseConfigured
            ? "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are available."
            : "Supabase environment variables are missing or malformed.",
          ok: health.supabaseConfigured,
        },
        {
          icon: Sparkles,
          title: "Last Check",
          text: `System health refreshed at ${new Date(health.checkedAt).toLocaleString()}.`,
          ok: true,
        },
      ]
    : [];

  return (
    <AdminLayout
      title="Settings"
      subtitle="Operational status for Supabase auth, storage, realtime, and the Prihika CMS environment."
    >
      {loading || !health ? (
        <AdminCardSkeleton count={6} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-lg border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#d7b46a]/10 text-[#f4d58d]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      card.ok
                        ? "border-emerald-300/30 text-emerald-200"
                        : "border-red-300/30 text-red-200"
                    }`}
                  >
                    {card.ok ? "Ready" : "Needs attention"}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#f6ead0]/60">{card.text}</p>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
