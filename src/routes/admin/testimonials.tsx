import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { EmptyState } from "@/components/admin/EmptyState";
import { AdminCardSkeleton } from "@/components/admin/Skeletons";
import { Modal } from "@/components/admin/Modal";
import { deleteTestimonial, listTestimonials, saveTestimonial } from "@/services/adminService";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import type { Testimonial } from "@/types/admin";

export const Route = createFileRoute("/admin/testimonials")({
  head: () => ({ meta: [{ title: "Testimonials CMS - Prihika Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: TestimonialsPage,
});

const blank = { name: "", city: "", text: "", rating: 5, active: true, display_order: 0 };

function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await listTestimonials());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Testimonials could not load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useRealtimeRefresh("testimonials", () => void load());

  const openForm = (testimonial?: Testimonial) => {
    setEditing(testimonial ?? null);
    setForm(testimonial ? {
      name: testimonial.name,
      city: testimonial.city ?? "",
      text: testimonial.text,
      rating: Number(testimonial.rating ?? 5),
      active: Boolean(testimonial.active),
      display_order: Number(testimonial.display_order ?? 0),
    } : { ...blank, display_order: items.length });
    setOpen(true);
  };

  const submit = async () => {
    await saveTestimonial(form, editing?.id);
    toast.success(editing ? "Testimonial updated." : "Testimonial created.");
    setOpen(false);
    await load();
  };

  const move = async (testimonial: Testimonial, direction: -1 | 1) => {
    const index = items.findIndex((item) => item.id === testimonial.id);
    const next = items[index + direction];
    if (!next) return;
    await Promise.all([
      saveTestimonial({ ...testimonial, display_order: next.display_order ?? index + direction }, testimonial.id),
      saveTestimonial({ ...next, display_order: testimonial.display_order ?? index }, next.id),
    ]);
    await load();
  };

  return (
    <AdminLayout title="Testimonials" subtitle="Manage homepage social proof cards with realtime storefront updates.">
      <div className="mb-5 flex justify-end">
        <button onClick={() => openForm()} className="inline-flex items-center gap-2 rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]">
          <Plus className="h-4 w-4" /> Add Testimonial
        </button>
      </div>
      {error ? <div className="mb-5 rounded-lg border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
      {loading ? <AdminCardSkeleton count={3} /> : items.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((testimonial, index) => (
            <div key={testimonial.id} className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
              <div className="mb-4 flex gap-1 text-[#f4d58d]">
                {Array.from({ length: Number(testimonial.rating ?? 5) }).map((_, key) => <span key={key}>★</span>)}
              </div>
              <p className="font-display text-xl leading-relaxed text-white">"{testimonial.text}"</p>
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-sm font-medium text-white">{testimonial.name}</p>
                <p className="text-xs text-[#f6ead0]/45">{testimonial.city}</p>
              </div>
              <span className="mt-4 inline-flex rounded-full border border-[#d7b46a]/30 px-2.5 py-1 text-xs text-[#f4d58d]">
                {testimonial.active ? "Active" : "Inactive"} - order {testimonial.display_order ?? index}
              </span>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => openForm(testimonial)} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10">Edit</button>
                <button onClick={() => void move(testimonial, -1)} className="rounded-lg border border-white/10 p-2 text-[#f6ead0]/65 hover:bg-white/10"><GripVertical className="h-4 w-4" /></button>
                <button onClick={() => void saveTestimonial({ ...testimonial, active: !testimonial.active }, testimonial.id).then(load)} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-[#f4d58d] hover:bg-[#d7b46a]/10">Toggle</button>
                <button onClick={() => void deleteTestimonial(testimonial.id).then(load)} className="rounded-lg border border-red-300/20 p-2 text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : <EmptyState title="No testimonials yet" description="Add customer stories to power homepage testimonial cards." />}

      <Modal open={open} onOpenChange={setOpen} title={editing ? "Edit Testimonial" : "Add Testimonial"} description="Testimonials render directly on the storefront homepage." wide>
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
            <Field label="City" value={form.city} onChange={(value) => setForm((current) => ({ ...current, city: value }))} />
            <Field label="Rating" type="number" value={String(form.rating)} onChange={(value) => setForm((current) => ({ ...current, rating: Number(value) }))} />
            <Field label="Display Order" type="number" value={String(form.display_order)} onChange={(value) => setForm((current) => ({ ...current, display_order: Number(value) }))} />
          </div>
          <textarea value={form.text} onChange={(event) => setForm((current) => ({ ...current, text: event.target.value }))} rows={5} placeholder="Customer quote" className="rounded-lg border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none placeholder:text-[#f6ead0]/35" />
          <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm text-[#f6ead0]/75">
            <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
            Active testimonial
          </label>
          <button onClick={() => void submit()} className="rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]">Save Testimonial</button>
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
