import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Plus, Search, TicketPercent, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { DataTable, type AdminColumn } from "@/components/admin/DataTable";
import { Modal } from "@/components/admin/Modal";
import { AdminTableSkeleton } from "@/components/admin/Skeletons";
import { deleteCoupon, listCoupons, saveCoupon, updateCoupon } from "@/services/adminService";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import type { Coupon } from "@/types/admin";

export const Route = createFileRoute("/admin/coupons")({
  head: () => ({
    meta: [{ title: "Coupons - Prihika Admin" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: CouponsPage,
});

const blankCoupon = {
  code: "",
  discount_type: "percentage",
  discount_value: 10,
  minimum_order: 0,
  expires_at: "",
  active: true,
};

function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(blankCoupon);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCoupons(await listCoupons(search, status));
    } catch (loadError) {
      setCoupons([]);
      setError(loadError instanceof Error ? loadError.message : "Coupons could not load.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh("coupons", () => void load());

  const openForm = (coupon?: Coupon) => {
    setEditing(coupon ?? null);
    setForm(
      coupon
        ? {
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_value: Number(coupon.discount_value ?? 0),
            minimum_order: Number(coupon.minimum_order ?? 0),
            expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : "",
            active: Boolean(coupon.active),
          }
        : blankCoupon,
    );
    setOpen(true);
  };

  const submit = async () => {
    if (!form.code.trim()) {
      toast.error("Coupon code is required.");
      return;
    }
    await saveCoupon(form, editing?.id);
    toast.success(editing ? "Coupon updated." : "Coupon created.");
    setOpen(false);
    await load();
  };

  const columns: AdminColumn<Coupon>[] = useMemo(
    () => [
      {
        header: "Code",
        cell: (coupon) => (
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{coupon.code}</span>
            <button
              type="button"
              onClick={() =>
                void navigator.clipboard
                  .writeText(coupon.code)
                  .then(() => toast.success("Coupon copied."))
              }
              className="rounded-md p-1.5 text-[#f6ead0]/55 hover:bg-white/10 hover:text-white"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
      { header: "Discount", cell: (coupon) => formatDiscount(coupon) },
      {
        header: "Minimum",
        cell: (coupon) => `Rs. ${Number(coupon.minimum_order ?? 0).toLocaleString("en-IN")}`,
      },
      { header: "Expiry", cell: (coupon) => <Expiry coupon={coupon} /> },
      { header: "Status", cell: (coupon) => <StatusPill coupon={coupon} /> },
      {
        header: "Actions",
        className: "text-right",
        cell: (coupon) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => openForm(coupon)}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10"
            >
              Edit
            </button>
            <button
              onClick={() => void updateCoupon(coupon.id, { active: !coupon.active }).then(load)}
              className="rounded-lg border border-[#d7b46a]/30 px-3 py-2 text-sm text-[#f4d58d] hover:bg-[#d7b46a]/10"
            >
              Toggle
            </button>
            <button
              onClick={() => void deleteCoupon(coupon.id).then(load)}
              className="rounded-lg border border-red-300/20 p-2 text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [load],
  );

  return (
    <AdminLayout
      title="Coupons"
      subtitle="Create, activate, expire, copy, and track promotional codes in real time."
    >
      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f6ead0]/35" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search coupon code"
              className="h-11 w-full rounded-lg border border-white/10 bg-black/20 pl-9 pr-3 text-sm text-white outline-none placeholder:text-[#f6ead0]/35"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none"
          >
            <option value="all" className="bg-[#100d0a]">
              All coupons
            </option>
            <option value="active" className="bg-[#100d0a]">
              Active only
            </option>
            <option value="inactive" className="bg-[#100d0a]">
              Inactive only
            </option>
          </select>
        </div>
        <button
          onClick={() => openForm()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]"
        >
          <Plus className="h-4 w-4" />
          Add Coupon
        </button>
      </div>

      {error ? (
        <div className="mb-5 rounded-lg border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <AdminTableSkeleton />
      ) : (
        <DataTable
          data={coupons}
          columns={columns}
          emptyTitle="No coupons yet"
          emptyDescription="Create a coupon to power promotions and cart discounts."
        />
      )}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit Coupon" : "Add Coupon"}
        description="Coupon records are stored in the Supabase coupons table."
      >
        <div className="space-y-4">
          <Input
            label="Code"
            value={form.code}
            onChange={(value) => setForm((current) => ({ ...current, code: value }))}
          />
          <label>
            <span className="text-xs uppercase tracking-[0.18em] text-[#d7b46a]/75">
              Discount Type
            </span>
            <select
              value={form.discount_type}
              onChange={(event) =>
                setForm((current) => ({ ...current, discount_type: event.target.value }))
              }
              className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none"
            >
              <option className="bg-[#100d0a]" value="percentage">
                percentage
              </option>
              <option className="bg-[#100d0a]" value="fixed">
                fixed
              </option>
            </select>
          </label>
          <Input
            label="Discount Value"
            type="number"
            value={String(form.discount_value)}
            onChange={(value) =>
              setForm((current) => ({ ...current, discount_value: Number(value) }))
            }
          />
          <Input
            label="Minimum Order"
            type="number"
            value={String(form.minimum_order)}
            onChange={(value) =>
              setForm((current) => ({ ...current, minimum_order: Number(value) }))
            }
          />
          <Input
            label="Expires At"
            type="date"
            value={form.expires_at}
            onChange={(value) => setForm((current) => ({ ...current, expires_at: value }))}
          />
          <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm text-[#f6ead0]/75">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                setForm((current) => ({ ...current, active: event.target.checked }))
              }
            />
            Active coupon
          </label>
          <button
            onClick={() => void submit()}
            className="w-full rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]"
          >
            Save Coupon
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label>
      <span className="text-xs uppercase tracking-[0.18em] text-[#d7b46a]/75">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none"
      />
    </label>
  );
}

function formatDiscount(coupon: Coupon) {
  return coupon.discount_type === "percentage"
    ? `${Number(coupon.discount_value ?? 0)}%`
    : `Rs. ${Number(coupon.discount_value ?? 0).toLocaleString("en-IN")}`;
}

function Expiry({ coupon }: { coupon: Coupon }) {
  if (!coupon.expires_at) return <span className="text-[#f6ead0]/55">No expiry</span>;
  const expired = new Date(coupon.expires_at).getTime() < Date.now();
  return (
    <span className={expired ? "text-red-200" : "text-[#f6ead0]/75"}>
      {new Date(coupon.expires_at).toLocaleDateString()}
    </span>
  );
}

function StatusPill({ coupon }: { coupon: Coupon }) {
  const expired = coupon.expires_at ? new Date(coupon.expires_at).getTime() < Date.now() : false;
  const active = Boolean(coupon.active) && !expired;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${
        active ? "border-emerald-300/30 text-emerald-200" : "border-red-300/30 text-red-200"
      }`}
    >
      <TicketPercent className="h-3 w-3" />
      {active ? "Active" : expired ? "Expired" : "Inactive"}
    </span>
  );
}
