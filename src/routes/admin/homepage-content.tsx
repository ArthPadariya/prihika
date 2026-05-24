import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AdminCardSkeleton } from "@/components/admin/Skeletons";
import { UploadDropzone } from "@/components/admin/UploadDropzone";
import { getHomepageContent, saveHomepageContent } from "@/services/adminService";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import type { HomepageContent } from "@/types/admin";

export const Route = createFileRoute("/admin/homepage-content")({
  head: () => ({ meta: [{ title: "Homepage Content - Prihika Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: HomepageContentPage,
});

const blank = {
  hero_title: "",
  hero_subtitle: "",
  hero_image: "",
  hero_badge: "",
  hero_featured_note: "",
  cta_primary: "",
  cta_primary_link: "/shop",
  cta_secondary: "",
  cta_secondary_link: "/collections",
  testimonial_text: "",
  active: true,
};

function HomepageContentPage() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const next = await getHomepageContent();
      setContent(next);
      setForm(next ? {
        hero_title: next.hero_title ?? "",
        hero_subtitle: next.hero_subtitle ?? "",
        hero_image: next.hero_image ?? "",
        hero_badge: next.hero_badge ?? "",
        hero_featured_note: next.hero_featured_note ?? "",
        cta_primary: next.cta_primary ?? "",
        cta_primary_link: next.cta_primary_link ?? "/shop",
        cta_secondary: next.cta_secondary ?? "",
        cta_secondary_link: next.cta_secondary_link ?? "/collections",
        testimonial_text: next.testimonial_text ?? "",
        active: Boolean(next.active),
      } : blank);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Homepage content could not load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useRealtimeRefresh("homepage_content", () => void load());

  const submit = async () => {
    setSaving(true);
    try {
      const saved = await saveHomepageContent(form, content?.id);
      setContent(saved);
      toast.success("Homepage content saved.");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Homepage content could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Homepage Content" subtitle="Edit hero copy, CTA labels, hero imagery, badge text, and live storefront preview.">
      {loading ? <AdminCardSkeleton count={2} /> : (
        <div className="grid gap-6 xl:grid-cols-[1fr_.85fr]">
          <section className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
            {error ? <div className="mb-5 rounded-lg border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Hero Badge" value={form.hero_badge} onChange={(value) => setForm((current) => ({ ...current, hero_badge: value }))} />
              <Field label="Hero Title" value={form.hero_title} onChange={(value) => setForm((current) => ({ ...current, hero_title: value }))} />
              <Field label="Primary CTA" value={form.cta_primary} onChange={(value) => setForm((current) => ({ ...current, cta_primary: value }))} />
              <Field label="Primary Link" value={form.cta_primary_link} onChange={(value) => setForm((current) => ({ ...current, cta_primary_link: value }))} />
              <Field label="Secondary CTA" value={form.cta_secondary} onChange={(value) => setForm((current) => ({ ...current, cta_secondary: value }))} />
              <Field label="Secondary Link" value={form.cta_secondary_link} onChange={(value) => setForm((current) => ({ ...current, cta_secondary_link: value }))} />
            </div>
            <textarea value={form.hero_subtitle} onChange={(event) => setForm((current) => ({ ...current, hero_subtitle: event.target.value }))} rows={4} placeholder="Hero subtitle" className="mt-4 w-full rounded-lg border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none placeholder:text-[#f6ead0]/35" />
            <textarea value={form.hero_featured_note} onChange={(event) => setForm((current) => ({ ...current, hero_featured_note: event.target.value }))} rows={2} placeholder="Featured note below hero CTAs" className="mt-4 w-full rounded-lg border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none placeholder:text-[#f6ead0]/35" />
            <textarea value={form.testimonial_text} onChange={(event) => setForm((current) => ({ ...current, testimonial_text: event.target.value }))} rows={2} placeholder="Optional homepage testimonial text" className="mt-4 w-full rounded-lg border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none placeholder:text-[#f6ead0]/35" />
            <div className="mt-5">
              <UploadDropzone bucket="homepage" folder="hero" multiple={false} onUploaded={(urls) => setForm((current) => ({ ...current, hero_image: urls[0] ?? current.hero_image }))} />
            </div>
            <label className="mt-5 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm text-[#f6ead0]/75">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
              Active homepage content
            </label>
            <button disabled={saving} onClick={() => void submit()} className="mt-5 rounded-lg bg-[#d7b46a] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d] disabled:opacity-60">
              {saving ? "Saving..." : "Save Homepage"}
            </button>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
            <p className="mb-4 text-xs uppercase tracking-[0.22em] text-[#d7b46a]/80">Live Preview</p>
            <div className="overflow-hidden rounded-2xl bg-[#f9f4ea] text-[#241b17]">
              <div className="grid gap-5 p-6 md:grid-cols-2 md:items-center">
                <div>
                  {form.hero_badge ? <p className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[#a05b52]"><Sparkles className="h-3 w-3" /> {form.hero_badge}</p> : null}
                  <h2 className="mt-4 font-display text-4xl leading-tight">{form.hero_title || "Hero title"}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-[#6f625d]">{form.hero_subtitle || "Hero subtitle preview"}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {form.cta_primary ? <span className="rounded-full bg-[#a05b52] px-4 py-2 text-xs uppercase tracking-widest text-white">{form.cta_primary}</span> : null}
                    {form.cta_secondary ? <span className="rounded-full border border-[#241b17]/25 px-4 py-2 text-xs uppercase tracking-widest">{form.cta_secondary}</span> : null}
                  </div>
                </div>
                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#eaded7]">
                  {form.hero_image ? <img src={form.hero_image} alt="" className="h-full w-full object-cover" /> : null}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="text-xs uppercase tracking-[0.18em] text-[#d7b46a]/75">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none" />
    </label>
  );
}
