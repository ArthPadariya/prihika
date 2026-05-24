import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { DataTable, type AdminColumn } from "@/components/admin/DataTable";
import { AdminTableSkeleton } from "@/components/admin/Skeletons";
import { Modal } from "@/components/admin/Modal";
import { listOrders, updateOrderStatus } from "@/services/adminService";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import type { Order, OrderStatus } from "@/types/admin";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [{ title: "Orders - Prihika Admin" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: OrdersPage,
});

const statuses = ["all", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setOrders(await listOrders(search, status));
    } catch (loadError) {
      setOrders([]);
      setError(loadError instanceof Error ? loadError.message : "Orders could not load.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh("orders", () => void load());

  const changeStatus = useCallback(
    async (id: string, nextStatus: string) => {
      await updateOrderStatus(id, nextStatus as OrderStatus);
      toast.success("Order status updated.");
      await load();
    },
    [load],
  );

  const columns: AdminColumn<Order>[] = useMemo(
    () => [
      {
        header: "Order",
        cell: (order) => <span className="font-medium text-white">#{order.id.slice(0, 8)}</span>,
      },
      {
        header: "Customer",
        cell: (order) => (
          <div>
            <p className="text-white">{order.customer_name ?? "Guest"}</p>
            <p className="text-xs text-[#f6ead0]/45">{order.customer_email}</p>
          </div>
        ),
      },
      {
        header: "Total",
        cell: (order) => `Rs. ${Number(order.total_amount ?? 0).toLocaleString("en-IN")}`,
      },
      { header: "Payment", cell: (order) => <Pill value={order.payment_status ?? "pending"} /> },
      {
        header: "Status",
        cell: (order) => (
          <select
            value={order.status ?? "Pending"}
            onChange={(event) => void changeStatus(order.id, event.target.value)}
            className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-sm text-white"
          >
            {statuses
              .filter((item) => item !== "all")
              .map((item) => (
                <option key={item} className="bg-[#100d0a]">
                  {item}
                </option>
              ))}
          </select>
        ),
      },
      {
        header: "Placed",
        cell: (order) => (order.created_at ? new Date(order.created_at).toLocaleDateString() : "-"),
      },
      {
        header: "Details",
        className: "text-right",
        cell: (order) => (
          <button
            onClick={() => setSelected(order)}
            className="rounded-md p-2 text-[#f6ead0]/60 hover:bg-white/10 hover:text-white"
          >
            <Eye className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [changeStatus],
  );

  const exportCsv = () => {
    const rows = orders.map((order) => ({
      id: order.id,
      customer_name: order.customer_name ?? "",
      customer_email: order.customer_email ?? "",
      total_amount: order.total_amount ?? 0,
      status: order.status ?? "",
      payment_status: order.payment_status ?? "",
      created_at: order.created_at ?? "",
    }));
    const header = Object.keys(rows[0] ?? { id: "" });
    const csv = [
      header.join(","),
      ...rows.map((row) =>
        header.map((key) => JSON.stringify(String(row[key as keyof typeof row] ?? ""))).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prihika-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout
      title="Orders"
      subtitle="Track customer orders, payment state, fulfilment status, and export operations data."
    >
      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f6ead0]/35" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, customer, email"
              className="h-11 w-full rounded-lg border border-white/10 bg-black/20 pl-9 pr-3 text-sm text-white outline-none placeholder:text-[#f6ead0]/35"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none"
          >
            {statuses.map((item) => (
              <option key={item} value={item} className="bg-[#100d0a]">
                {item === "all" ? "All statuses" : item}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d7b46a]/30 px-4 py-3 text-sm text-[#f4d58d] hover:bg-[#d7b46a]/10"
        >
          <Download className="h-4 w-4" />
          Export CSV
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
          data={orders}
          columns={columns}
          emptyTitle="No orders found"
          emptyDescription="New orders will appear here in real time."
        />
      )}

      <Modal
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        title="Order Details"
        description={selected ? `Order #${selected.id}` : undefined}
        wide
      >
        {selected ? (
          <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
            <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <h3 className="font-display text-xl text-white">Customer</h3>
              <div className="mt-4 space-y-2 text-sm text-[#f6ead0]/70">
                <p>{selected.customer_name ?? "Guest"}</p>
                <p>{selected.customer_email ?? "No email"}</p>
                <p>{selected.customer_phone ?? "No phone"}</p>
                <pre className="mt-4 whitespace-pre-wrap rounded-md bg-black/25 p-3 text-xs">
                  {formatAddress(selected.shipping_address)}
                </pre>
              </div>
            </section>
            <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <h3 className="font-display text-xl text-white">Products</h3>
              <div className="mt-4 space-y-3">
                {selected.order_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 p-3 text-sm"
                  >
                    <div>
                      <p className="text-white">
                        {item.product_title ?? item.product_id ?? "Product"}
                      </p>
                      <p className="text-[#f6ead0]/45">Qty {item.quantity}</p>
                    </div>
                    <p className="text-[#f4d58d]">
                      Rs. {Number(item.price ?? 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
}

function Pill({ value }: { value: string }) {
  const tone =
    value === "paid" || value === "Delivered"
      ? "border-emerald-300/30 text-emerald-200"
      : value === "failed" || value === "Cancelled"
        ? "border-red-300/30 text-red-200"
        : "border-[#d7b46a]/30 text-[#f4d58d]";
  return <span className={`rounded-full border px-2.5 py-1 text-xs ${tone}`}>{value}</span>;
}

function formatAddress(address: Order["shipping_address"]) {
  if (!address) return "No shipping address";
  if (typeof address === "string") return address;
  return JSON.stringify(address, null, 2);
}
