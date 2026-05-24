import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { DataTable, type AdminColumn } from "@/components/admin/DataTable";
import { AdminTableSkeleton } from "@/components/admin/Skeletons";
import { Modal } from "@/components/admin/Modal";
import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  updateAdminRole,
} from "@/services/adminService";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import type { AdminUser } from "@/types/admin";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Admin Users - Prihika Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { admin } = useAdminAuth(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "admin" });
  const [error, setError] = useState("");

  const canManage = admin?.role === "super_admin";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await listAdminUsers());
    } catch (loadError) {
      setUsers([]);
      setError(loadError instanceof Error ? loadError.message : "Admin users could not load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh("admin_users", () => void load());

  const addUser = async () => {
    if (!canManage) {
      toast.error("Only super_admin can add admin users.");
      return;
    }
    await createAdminUser(form);
    toast.success("Admin profile added. The user must exist in Supabase Auth to sign in.");
    setOpen(false);
    setForm({ name: "", email: "", role: "admin" });
    await load();
  };

  const columns: AdminColumn<AdminUser>[] = useMemo(
    () => [
      {
        header: "Name",
        cell: (user) => (
          <span className="font-medium text-white">{user.name || "Team member"}</span>
        ),
      },
      { header: "Email", cell: (user) => user.email },
      {
        header: "Role",
        cell: (user) =>
          canManage ? (
            <select
              value={user.role}
              onChange={(event) => void updateAdminRole(user.id, event.target.value).then(load)}
              className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-sm text-white"
            >
              <option className="bg-[#100d0a]">super_admin</option>
              <option className="bg-[#100d0a]">admin</option>
            </select>
          ) : (
            <span>{user.role}</span>
          ),
      },
      {
        header: "Created",
        cell: (user) => (user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"),
      },
      {
        header: "Actions",
        className: "text-right",
        cell: (user) => (
          <button
            disabled={!canManage || user.id === admin?.id}
            onClick={() => void deleteAdminUser(user.id).then(load)}
            className="rounded-md p-2 text-red-300/70 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [admin?.id, canManage, load],
  );

  return (
    <AdminLayout
      title="Admin Users"
      subtitle="View team access, assign admin roles, and protect privileged actions."
    >
      <div className="mb-5 flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]"
        >
          <Plus className="h-4 w-4" />
          Add Admin
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
          data={users}
          columns={columns}
          emptyTitle="No admin users"
          emptyDescription="Add authorized users to the admin_users table."
        />
      )}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Add Admin User"
        description="This creates an admin profile. Supabase Auth controls the login credential."
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(value) => setForm((current) => ({ ...current, name: value }))}
          />
          <Input
            label="Email"
            value={form.email}
            onChange={(value) => setForm((current) => ({ ...current, email: value }))}
          />
          <label>
            <span className="text-xs uppercase tracking-[0.18em] text-[#d7b46a]/75">Role</span>
            <select
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
              className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none"
            >
              <option className="bg-[#100d0a]">admin</option>
              <option className="bg-[#100d0a]">super_admin</option>
            </select>
          </label>
          <button
            onClick={() => void addUser()}
            className="w-full rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]"
          >
            Add Admin User
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="text-xs uppercase tracking-[0.18em] text-[#d7b46a]/75">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none"
      />
    </label>
  );
}
