import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { GripVertical, Play, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { EmptyState } from "@/components/admin/EmptyState";
import { AdminCardSkeleton } from "@/components/admin/Skeletons";
import { Modal } from "@/components/admin/Modal";
import { UploadDropzone } from "@/components/admin/UploadDropzone";
import { createReel, deleteReel, listReels, updateReel } from "@/services/adminService";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import type { HomepageReel } from "@/types/admin";

export const Route = createFileRoute("/admin/reels")({
  head: () => ({
    meta: [
      { title: "Homepage Reels - Prihika Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ReelsPage,
});

function ReelsPage() {
  const [reels, setReels] = useState<HomepageReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setReels(await listReels());
    } catch (loadError) {
      setReels([]);
      setError(loadError instanceof Error ? loadError.message : "Homepage reels could not load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh("homepage_reels", () => void load());

  const save = async () => {
    if (!videoUrl) {
      toast.error("Upload a reel video first.");
      return;
    }
    await createReel({
      title,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl || null,
      active: true,
      sort_order: reels.length,
    });
    toast.success("Homepage reel added.");
    setOpen(false);
    setTitle("");
    setVideoUrl("");
    setThumbnailUrl("");
    await load();
  };

  const move = async (reel: HomepageReel, direction: -1 | 1) => {
    const index = reels.findIndex((item) => item.id === reel.id);
    const next = reels[index + direction];
    if (!next) return;
    await Promise.all([
      updateReel(reel.id, { sort_order: next.sort_order ?? index + direction }),
      updateReel(next.id, { sort_order: reel.sort_order ?? index }),
    ]);
    await load();
  };

  return (
    <AdminLayout
      title="Homepage Reels"
      subtitle="Upload, preview, activate, and reorder premium video moments for the storefront."
    >
      <div className="mb-5 flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]"
        >
          <Plus className="h-4 w-4" />
          Add Reel
        </button>
      </div>

      {error ? (
        <div className="mb-5 rounded-lg border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <AdminCardSkeleton count={6} />
      ) : reels.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {reels.map((reel, index) => (
            <div
              key={reel.id}
              className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.045]"
            >
              <div className="relative aspect-[9/14] bg-black">
                <video
                  src={reel.video_url}
                  poster={reel.thumbnail_url ?? undefined}
                  className="h-full w-full object-cover"
                  controls
                  preload="metadata"
                />
                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs text-white backdrop-blur">
                  <Play className="h-3 w-3" />
                  {reel.active ? "Active" : "Inactive"}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-white">{reel.title || "Untitled reel"}</p>
                  <p className="text-xs text-[#f6ead0]/45">Sort order {reel.sort_order ?? index}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => void move(reel, -1)}
                    className="rounded-md p-2 text-[#f6ead0]/60 hover:bg-white/10"
                    aria-label="Move reel up"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => void updateReel(reel.id, { active: !reel.active }).then(load)}
                    className="rounded-md px-3 py-2 text-xs text-[#f4d58d] hover:bg-[#d7b46a]/10"
                  >
                    Toggle
                  </button>
                  <button
                    onClick={() => void deleteReel(reel.id).then(load)}
                    className="rounded-md p-2 text-red-300/70 hover:bg-red-500/10"
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
          title="No reels uploaded"
          description="Add motion assets to power the homepage reel section."
        />
      )}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Add Homepage Reel"
        description="Upload video to the reels bucket and optionally attach a thumbnail."
      >
        <div className="space-y-4">
          <label>
            <span className="text-xs uppercase tracking-[0.18em] text-[#d7b46a]/75">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none"
            />
          </label>
          <UploadDropzone
            bucket="reels"
            folder="homepage-reels"
            accept="video/*"
            multiple={false}
            onUploaded={(urls) => setVideoUrl(urls[0] ?? "")}
          />
          <UploadDropzone
            bucket="reels"
            folder="homepage-reel-thumbnails"
            accept="image/*"
            multiple={false}
            onUploaded={(urls) => setThumbnailUrl(urls[0] ?? "")}
          />
          <button
            onClick={() => void save()}
            className="w-full rounded-lg bg-[#d7b46a] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d58d]"
          >
            Save Reel
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
