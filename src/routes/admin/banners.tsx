import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { EmptyState } from "@/components/admin/EmptyState";
import { AdminCardSkeleton } from "@/components/admin/Skeletons";
import { Modal } from "@/components/admin/Modal";
import { UploadDropzone } from "@/components/admin/UploadDropzone";
import { deleteBanner, listBanners, saveBanner } from "@/services/adminService";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import type { Banner } from "@/types/admin";

export const Route = createFileRoute("/admin/banners")({
  head: () => ({
    meta: [
      { title: "Banners CMS - Prihika Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: BannersPage,
});

function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState({
    title: "",
    link_url: "",
    desktop_image_url: "",
    mobile_image_url: "",
    active: true,
  });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setBanners(await listBanners());
    } catch (loadError) {
      setBanners([]);
      setError(loadError instanceof Error ? loadError.message : "Banners could not load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh("banners", () => void load());

  const openForm = (banner?: Banner) => {
    setEditing(banner ?? null);
    setForm({
      title: banner?.title ?? "",
      link_url: banner?.link_url ?? "",
      desktop_image_url: banner?.desktop_image_url ?? "",
      mobile_image_url: banner?.mobile_image_url ?? "",
      active: banner?.active ?? true,
    });
    setOpen(true);
  };

  const submit = async () => {
    await saveBanner({ ...form, sort_order: editing?.sort_order ?? banners.length }, editing?.id);
    toast.success(editing ? "Banner updated." : "Banner created.");
    setOpen(false);
    await load();
  };

  const move = async (banner: Banner, direction: -1 | 1) => {
    const index = banners.findIndex((item) => item.id === banner.id);
    const next = banners[index + direction];
    if (!next) return;
    await Promise.all([
      saveBanner({ ...banner, sort_order: next.sort_order ?? index + direction }, banner.id),
      saveBanner({ ...next, sort_order: banner.sort_order ?? index }, next.id),
    ]);
    await load();
  };

  return (
    <AdminLayout
      title="Banners"
      subtitle="Manage desktop and mobile campaign banners with responsive previews and ordering."
    >
      <div className="mb-5 flex justify-end">
        <button
          onClick={() => openForm()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]"
        >
          <Plus className="h-4 w-4" />
          Add Banner
        </button>
      </div>
      {error ? (
        <div className="mb-5 rounded-lg border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <AdminCardSkeleton count={4} />
      ) : banners.length ? (
        <div className="space-y-4">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4 lg:grid-cols-[1fr_220px]"
            >
              <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
                {banner.desktop_image_url ? (
                  <img
                    src={banner.desktop_image_url}
                    alt={banner.title ?? ""}
                    className="aspect-[16/6] w-full object-cover"
                  />
                ) : null}
                {banner.mobile_image_url ? (
                  <img
                    src={banner.mobile_image_url}
                    alt={`${banner.title ?? "Banner"} mobile`}
                    className="mt-2 aspect-[9/12] w-24 rounded-md border border-white/10 object-cover lg:hidden"
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className="flex flex-col justify-between gap-4">
                <div>
                  <p className="font-display text-2xl text-white">
                    {banner.title || "Untitled banner"}
                  </p>
                  <p className="mt-1 text-sm text-[#f6ead0]/50">{banner.link_url || "No link"}</p>
                  <span className="mt-3 inline-flex rounded-full border border-[#d7b46a]/30 px-2.5 py-1 text-xs text-[#f4d58d]">
                    {banner.active ? "Active" : "Inactive"} - order {banner.sort_order ?? index}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openForm(banner)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => void move(banner, -1)}
                    className="rounded-lg border border-white/10 p-2 text-[#f6ead0]/65 hover:bg-white/10"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      void saveBanner({ ...banner, active: !banner.active }, banner.id).then(load)
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm text-[#f4d58d] hover:bg-[#d7b46a]/10"
                  >
                    Toggle
                  </button>
                  <button
                    onClick={() => void deleteBanner(banner.id).then(load)}
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
          title="No banners yet"
          description="Create responsive banners for homepage and campaign moments."
        />
      )}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit Banner" : "Add Banner"}
        description="Upload desktop and mobile images to the banners bucket."
        wide
      >
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="text-xs uppercase tracking-[0.18em] text-[#d7b46a]/75">Title</span>
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none"
              />
            </label>
            <label>
              <span className="text-xs uppercase tracking-[0.18em] text-[#d7b46a]/75">
                Link URL
              </span>
              <input
                value={form.link_url}
                onChange={(event) =>
                  setForm((current) => ({ ...current, link_url: event.target.value }))
                }
                className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none"
              />
            </label>
          </div>
          <UploadDropzone
            bucket="banners"
            folder="desktop"
            accept="image/*"
            multiple={false}
            onUploaded={(urls) =>
              setForm((current) => ({
                ...current,
                desktop_image_url: urls[0] ?? current.desktop_image_url,
              }))
            }
          />
          <UploadDropzone
            bucket="banners"
            folder="mobile"
            accept="image/*"
            multiple={false}
            onUploaded={(urls) =>
              setForm((current) => ({
                ...current,
                mobile_image_url: urls[0] ?? current.mobile_image_url,
              }))
            }
          />
          <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm text-[#f6ead0]/75">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                setForm((current) => ({ ...current, active: event.target.checked }))
              }
            />
            Active banner
          </label>
          <button
            onClick={() => void submit()}
            className="rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]"
          >
            Save Banner
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
