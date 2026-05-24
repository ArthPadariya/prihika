import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { EmptyState } from "@/components/admin/EmptyState";
import { AdminCardSkeleton } from "@/components/admin/Skeletons";
import { Modal } from "@/components/admin/Modal";
import { UploadDropzone } from "@/components/admin/UploadDropzone";
import { deleteCollection, listCollections, saveCollection } from "@/services/adminService";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import type { Collection } from "@/types/admin";

export const Route = createFileRoute("/admin/collections")({
  head: () => ({ meta: [{ title: "Collections CMS - Prihika Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: CollectionsAdminPage,
});

const blank = { title: "", slug: "", description: "", cover_image: "", featured: true, seo_title: "", seo_description: "", display_order: 0 };

function CollectionsAdminPage() {
  const [items, setItems] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await listCollections());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Collections could not load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useRealtimeRefresh("collections", () => void load());

  const openForm = (collection?: Collection) => {
    setEditing(collection ?? null);
    setForm(collection ? {
      title: collection.title,
      slug: collection.slug,
      description: collection.description ?? "",
      cover_image: collection.cover_image ?? "",
      featured: Boolean(collection.featured),
      seo_title: collection.seo_title ?? "",
      seo_description: collection.seo_description ?? "",
      display_order: Number(collection.display_order ?? 0),
    } : { ...blank, display_order: items.length });
    setOpen(true);
  };

  const submit = async () => {
    await saveCollection(form, editing?.id);
    toast.success(editing ? "Collection updated." : "Collection created.");
    setOpen(false);
    await load();
  };

  const move = async (collection: Collection, direction: -1 | 1) => {
    const index = items.findIndex((item) => item.id === collection.id);
    const next = items[index + direction];
    if (!next) return;
    await Promise.all([
      saveCollection({ ...collection, display_order: next.display_order ?? index + direction }, collection.id),
      saveCollection({ ...next, display_order: collection.display_order ?? index }, next.id),
    ]);
    await load();
  };

  return (
    <AdminLayout title="Collections" subtitle="Manage storefront collection stories, cover images, SEO text, ordering, and active state.">
      <div className="mb-5 flex justify-end">
        <button onClick={() => openForm()} className="inline-flex items-center gap-2 rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]">
          <Plus className="h-4 w-4" /> Add Collection
        </button>
      </div>
      {error ? <div className="mb-5 rounded-lg border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
      {loading ? <AdminCardSkeleton count={4} /> : items.length ? (
        <div className="space-y-4">
          {items.map((collection, index) => (
            <div key={collection.id} className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4 lg:grid-cols-[220px_1fr]">
              <div className="aspect-[4/5] overflow-hidden rounded-lg bg-black">
                {collection.cover_image ? <img src={collection.cover_image} alt={collection.title} className="h-full w-full object-cover" /> : null}
              </div>
              <div className="flex flex-col justify-between gap-4">
                <div>
                  <p className="font-display text-3xl text-white">{collection.title}</p>
                  <p className="mt-1 text-sm text-[#f6ead0]/50">{collection.slug}</p>
                  <p className="mt-4 max-w-2xl text-sm text-[#f6ead0]/60">{collection.description}</p>
                  <span className="mt-4 inline-flex rounded-full border border-[#d7b46a]/30 px-2.5 py-1 text-xs text-[#f4d58d]">
                    {collection.featured ? "Active" : "Inactive"} - order {collection.display_order ?? index}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => openForm(collection)} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10">Edit</button>
                  <button onClick={() => void move(collection, -1)} className="rounded-lg border border-white/10 p-2 text-[#f6ead0]/65 hover:bg-white/10"><GripVertical className="h-4 w-4" /></button>
                  <button onClick={() => void saveCollection({ ...collection, featured: !collection.featured }, collection.id).then(load)} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-[#f4d58d] hover:bg-[#d7b46a]/10">Toggle</button>
                  <button onClick={() => void deleteCollection(collection.id).then(load)} className="rounded-lg border border-red-300/20 p-2 text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <EmptyState title="No collections yet" description="Create collections to power the homepage and collections page." />}

      <Modal open={open} onOpenChange={setOpen} title={editing ? "Edit Collection" : "Add Collection"} description="Upload a cover image and add collection metadata." wide>
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
            <Field label="Slug" value={form.slug} onChange={(value) => setForm((current) => ({ ...current, slug: value }))} />
            <Field label="SEO Title" value={form.seo_title} onChange={(value) => setForm((current) => ({ ...current, seo_title: value }))} />
            <Field label="Display Order" type="number" value={String(form.display_order)} onChange={(value) => setForm((current) => ({ ...current, display_order: Number(value) }))} />
          </div>
          <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} placeholder="Description" className="rounded-lg border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none placeholder:text-[#f6ead0]/35" />
          <textarea value={form.seo_description} onChange={(event) => setForm((current) => ({ ...current, seo_description: event.target.value }))} rows={2} placeholder="SEO description" className="rounded-lg border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none placeholder:text-[#f6ead0]/35" />
          <UploadDropzone bucket="collections" folder="collection-covers" multiple={false} onUploaded={(urls) => setForm((current) => ({ ...current, cover_image: urls[0] ?? current.cover_image }))} />
          {form.cover_image ? <img src={form.cover_image} alt="" className="h-32 w-24 rounded-lg object-cover" /> : null}
          <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm text-[#f6ead0]/75">
            <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />
            Active on storefront
          </label>
          <button onClick={() => void submit()} className="rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]">Save Collection</button>
        </div>
      </Modal>
    </AdminLayout>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label>
      <span className="text-xs uppercase tracking-[0.18em] text-[#d7b46a]/75">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} type={type} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none" />
    </label>
  );
}
