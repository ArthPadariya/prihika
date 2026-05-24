import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, UploadCloud, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { uploadFile } from "@/services/adminService";

type Bucket = "products" | "reels" | "banners" | "homepage" | "categories" | "collections";

export function UploadDropzone({
  bucket,
  folder,
  accept = "image/*",
  multiple = true,
  onUploaded,
}: {
  bucket: Bucket;
  folder: string;
  accept?: string;
  multiple?: boolean;
  onUploaded: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileList = Array.from(files);
      if (!fileList.length) return;

      setUploading(true);
      setProgress(4);
      setPreviews(fileList.filter((file) => file.type.startsWith("image/")).map((file) => URL.createObjectURL(file)));

      try {
        const urls: string[] = [];
        for (const [index, file] of fileList.entries()) {
          const url = await uploadFile(bucket, file, folder, (value) => {
            setProgress(Math.round((index / fileList.length) * 100 + value / fileList.length));
          });
          urls.push(url);
        }
        onUploaded(urls);
        toast.success(`${urls.length} asset${urls.length > 1 ? "s" : ""} uploaded.`);
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Upload failed.");
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(0), 700);
      }
    },
    [bucket, folder, onUploaded],
  );

  return (
    <div>
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={`relative grid min-h-44 w-full place-items-center rounded-lg border border-dashed p-6 text-center transition ${
          dragging ? "border-[#f4d58d] bg-[#d7b46a]/15" : "border-white/15 bg-white/[0.035] hover:bg-white/[0.06]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(event) => {
            if (event.target.files) void handleFiles(event.target.files);
          }}
        />
        <div>
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#d7b46a]/10 text-[#f4d58d]">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
          </div>
          <p className="mt-4 text-sm font-medium text-white">Drop files here or click to upload</p>
          <p className="mt-1 text-xs text-[#f6ead0]/55">Images are compressed before upload. Videos keep original quality.</p>
        </div>
        {progress > 0 ? (
          <div className="absolute bottom-0 left-0 h-1 rounded-full bg-[#f4d58d]" style={{ width: `${progress}%` }} />
        ) : null}
      </motion.button>

      {previews.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {previews.map((src) => (
            <div key={src} className="relative h-16 w-16 overflow-hidden rounded-md border border-white/10 bg-white/5">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setPreviews((items) => items.filter((item) => item !== src))}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2 text-xs text-[#f6ead0]/45">
          <ImagePlus className="h-3.5 w-3.5" />
          <span>Supports drag-and-drop, multiple files, and public Supabase URLs.</span>
        </div>
      )}
    </div>
  );
}
