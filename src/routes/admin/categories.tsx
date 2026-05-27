import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { EmptyState } from "@/components/admin/EmptyState";
import { AdminCardSkeleton } from "@/components/admin/Skeletons";
import { Modal } from "@/components/admin/Modal";
import { UploadDropzone } from "@/components/admin/UploadDropzone";
import { deleteCategory, listCategories, saveCategory } from "@/services/adminService";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import type { Category } from "@/types/admin";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "Categories CMS - Prihika Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CategoriesPage,
});

const blank = { name: "", slug: "", image: "", description: "", featured: true, display_order: 0 };

function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await listCategories());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Categories could not load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  useRealtimeRefresh("homepage_categories", () => void load());

  const openForm = (category?: Category) => {
    setEditing(category ?? null);
    setForm(
      category
        ? {
            name: category.name,
            slug: category.slug,
            image: category.image ?? "",
            description: category.description ?? "",
            featured: Boolean(category.featured),
            display_order: Number(category.display_order ?? 0),
          }
        : { ...blank, display_order: items.length },
    );
    setOpen(true);
  };

  const submit = async () => {
    try {
      await saveCategory(form, editing?.id);
      toast.success(editing ? "Category updated." : "Category created.");
      setOpen(false);
      await load();
    } catch (submitError) {
      console.error("[Prihika CMS] Category save failed", submitError);
      toast.error(
        submitError instanceof Error ? submitError.message : "Category could not be saved.",
      );
    }
  };

  const move = async (category: Category, direction: -1 | 1) => {
    const index = items.findIndex((item) => item.id === category.id);
    const next = items[index + direction];
    if (!next) return;
    try {
      await Promise.all([
        saveCategory(
          { ...category, display_order: next.display_order ?? index + direction },
          category.id,
        ),
        saveCategory({ ...next, display_order: category.display_order ?? index }, next.id),
      ]);
      await load();
    } catch (moveError) {
      console.error("[Prihika CMS] Category reorder failed", moveError);
      toast.error(
        moveError instanceof Error ? moveError.message : "Category order could not be saved.",
      );
    }
  };

  const toggle = async (category: Category) => {
    try {
      await saveCategory({ ...category, featured: !category.featured }, category.id);
      toast.success(category.featured ? "Category hidden." : "Category activated.");
      await load();
    } catch (toggleError) {
      console.error("[Prihika CMS] Category toggle failed", toggleError);
      toast.error(
        toggleError instanceof Error ? toggleError.message : "Category could not be updated.",
      );
    }
  };

  const remove = async (category: Category) => {
    try {
      await deleteCategory(category.id);
      toast.success("Category deleted.");
      await load();
    } catch (deleteError) {
      console.error("[Prihika CMS] Category delete failed", deleteError);
      toast.error(
        deleteError instanceof Error ? deleteError.message : "Category could not be deleted.",
      );
    }
  };

  return (
    <AdminLayout
      title="Categories"
      subtitle="Control homepage category cards, images, ordering, descriptions, and active state."
    >
      <div className="mb-5 flex justify-end">
        <button
          onClick={() => openForm()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>
      {error ? (
        <div className="mb-5 rounded-lg border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}
      {loading ? (
        <AdminCardSkeleton count={4} />
      ) : items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((category, index) => (
            <div
              key={category.id}
              className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.045]"
            >
              <div className="aspect-[3/4] bg-black">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="font-display text-2xl text-white">{category.name}</p>
                  <p className="text-xs text-[#f6ead0]/45">{category.slug}</p>
                </div>
                <p className="line-clamp-2 text-sm text-[#f6ead0]/55">{category.description}</p>
                <span className="inline-flex rounded-full border border-[#d7b46a]/30 px-2.5 py-1 text-xs text-[#f4d58d]">
                  {category.featured ? "Active" : "Inactive"} - order{" "}
                  {category.display_order ?? index}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openForm(category)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => void move(category, -1)}
                    className="rounded-lg border border-white/10 p-2 text-[#f6ead0]/65 hover:bg-white/10"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => void toggle(category)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm text-[#f4d58d] hover:bg-[#d7b46a]/10"
                  >
                    Toggle
                  </button>
                  <button
                    onClick={() => void remove(category)}
                    className="rounded-lg border border-red-300/20 p-2 text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No categories yet"
          description="Add categories to power homepage category cards and shop filtering."
        />
      )}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit Category" : "Add Category"}
        description="Upload category imagery and set display order."
        wide
      >
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Name"
              value={form.name}
              onChange={(value) => setForm((current) => ({ ...current, name: value }))}
            />
            <Field
              label="Slug"
              value={form.slug}
              onChange={(value) => setForm((current) => ({ ...current, slug: value }))}
            />
            <Field
              label="Display Order"
              type="number"
              value={String(form.display_order)}
              onChange={(value) =>
                setForm((current) => ({ ...current, display_order: Number(value) }))
              }
            />
          </div>
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            rows={3}
            placeholder="Description"
            className="rounded-lg border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none placeholder:text-[#f6ead0]/35"
          />
          <UploadDropzone
            bucket="categories"
            folder="category-cards"
            multiple={false}
            onUploaded={(urls) =>
              setForm((current) => ({ ...current, image: urls[0] ?? current.image }))
            }
          />
          {form.image ? (
            <img src={form.image} alt="" className="h-28 w-24 rounded-lg object-cover" />
          ) : null}
          <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm text-[#f6ead0]/75">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) =>
                setForm((current) => ({ ...current, featured: event.target.checked }))
              }
            />
            Active on storefront
          </label>
          <button
            onClick={() => void submit()}
            className="rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]"
          >
            Save Category
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}

function Field({
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
