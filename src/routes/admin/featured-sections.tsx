import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { EmptyState } from "@/components/admin/EmptyState";
import { AdminCardSkeleton } from "@/components/admin/Skeletons";
import { Modal } from "@/components/admin/Modal";
import { deleteFeaturedSection, listAllProducts, listFeaturedSections, saveFeaturedSection } from "@/services/adminService";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import type { FeaturedSection, Product } from "@/types/admin";

export const Route = createFileRoute("/admin/featured-sections")({
  head: () => ({ meta: [{ title: "Featured Sections - Prihika Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: FeaturedSectionsPage,
});

const blank = { section_key: "", eyebrow: "", title: "", description: "", product_ids: [] as string[], active: true, display_order: 0 };

function FeaturedSectionsPage() {
  const [sections, setSections] = useState<FeaturedSection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FeaturedSection | null>(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextSections, nextProducts] = await Promise.all([listFeaturedSections(), listAllProducts()]);
      setSections(nextSections);
      setProducts(nextProducts);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Featured sections could not load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useRealtimeRefresh("featured_sections", () => void load());
  useRealtimeRefresh("products", () => void load());

  const productNames = useMemo(() => new Map(products.map((product) => [product.id, product.title])), [products]);

  const openForm = (section?: FeaturedSection) => {
    setEditing(section ?? null);
    setForm(section ? {
      section_key: section.section_key,
      eyebrow: section.eyebrow ?? "",
      title: section.title,
      description: section.description ?? "",
      product_ids: section.product_ids ?? [],
      active: Boolean(section.active),
      display_order: Number(section.display_order ?? 0),
    } : { ...blank, display_order: sections.length });
    setOpen(true);
  };

  const submit = async () => {
    await saveFeaturedSection(form, editing?.id);
    toast.success(editing ? "Featured section updated." : "Featured section created.");
    setOpen(false);
    await load();
  };

  const move = async (section: FeaturedSection, direction: -1 | 1) => {
    const index = sections.findIndex((item) => item.id === section.id);
    const next = sections[index + direction];
    if (!next) return;
    await Promise.all([
      saveFeaturedSection({ ...section, display_order: next.display_order ?? index + direction }, section.id),
      saveFeaturedSection({ ...next, display_order: section.display_order ?? index }, next.id),
    ]);
    await load();
  };

  const toggleProduct = (id: string) => {
    setForm((current) => ({
      ...current,
      product_ids: current.product_ids.includes(id)
        ? current.product_ids.filter((productId) => productId !== id)
        : [...current.product_ids, id],
    }));
  };

  return (
    <AdminLayout title="Featured Sections" subtitle="Assign CMS products to homepage bestsellers, trending grids, category headings, and collection headings.">
      <div className="mb-5 flex justify-end">
        <button onClick={() => openForm()} className="inline-flex items-center gap-2 rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]">
          <Plus className="h-4 w-4" /> Add Section
        </button>
      </div>
      {error ? <div className="mb-5 rounded-lg border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
      {loading ? <AdminCardSkeleton count={4} /> : sections.length ? (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={section.id} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#d7b46a]/75">{section.section_key}</p>
                  <h2 className="mt-1 font-display text-3xl text-white">{section.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm text-[#f6ead0]/55">{section.description}</p>
                  <p className="mt-3 text-xs text-[#f6ead0]/45">
                    {(section.product_ids ?? []).map((id) => productNames.get(id) ?? id).join(", ") || "No products assigned"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#d7b46a]/30 px-2.5 py-2 text-xs text-[#f4d58d]">{section.active ? "Active" : "Inactive"} - order {section.display_order ?? index}</span>
                  <button onClick={() => openForm(section)} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10">Edit</button>
                  <button onClick={() => void move(section, -1)} className="rounded-lg border border-white/10 p-2 text-[#f6ead0]/65 hover:bg-white/10"><GripVertical className="h-4 w-4" /></button>
                  <button onClick={() => void saveFeaturedSection({ ...section, active: !section.active }, section.id).then(load)} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-[#f4d58d] hover:bg-[#d7b46a]/10">Toggle</button>
                  <button onClick={() => void deleteFeaturedSection(section.id).then(load)} className="rounded-lg border border-red-300/20 p-2 text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <EmptyState title="No featured sections yet" description="Create sections to control homepage product grids and headings." />}

      <Modal open={open} onOpenChange={setOpen} title={editing ? "Edit Featured Section" : "Add Featured Section"} description="Use section keys such as categories, bestsellers, collections, trending, testimonials, or instagram." wide>
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Section Key" value={form.section_key} onChange={(value) => setForm((current) => ({ ...current, section_key: value }))} />
            <Field label="Eyebrow" value={form.eyebrow} onChange={(value) => setForm((current) => ({ ...current, eyebrow: value }))} />
            <Field label="Title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
            <Field label="Display Order" type="number" value={String(form.display_order)} onChange={(value) => setForm((current) => ({ ...current, display_order: Number(value) }))} />
          </div>
          <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="Description" className="rounded-lg border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none placeholder:text-[#f6ead0]/35" />
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[#d7b46a]/75">Assigned Products</p>
            <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
              {products.map((product) => (
                <label key={product.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-[#f6ead0]/75">
                  <input type="checkbox" checked={form.product_ids.includes(product.id)} onChange={() => toggleProduct(product.id)} />
                  <span>{product.title}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm text-[#f6ead0]/75">
            <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
            Active section
          </label>
          <button onClick={() => void submit()} className="rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]">Save Section</button>
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
