import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

function isUnavailableTableError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  const message = typeof candidate.message === "string" ? candidate.message.toLowerCase() : "";
  return (
    candidate.code === "42501" ||
    candidate.code === "42P01" ||
    candidate.code === "PGRST205" ||
    message.includes("permission denied") ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}

export function useRealtimeRefresh(table: string, onChange: () => void) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function subscribeWhenReady() {
      const { error } = await supabase.from(table).select("id", { head: true }).limit(1);

      if (cancelled) return;

      if (error && isUnavailableTableError(error)) {
        console.warn(`[Prihika realtime] ${table} is not available for realtime yet`, error);
        return;
      }

      channel = supabase
        .channel(`prihika-realtime-${table}-${crypto.randomUUID()}`)
        .on("postgres_changes", { event: "*", schema: "public", table }, () => {
          onChangeRef.current();
        })
        .subscribe((status, subscribeError) => {
          if (subscribeError) {
            console.error(`[Prihika realtime] ${table} subscription failed`, subscribeError);
          }
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.warn(`[Prihika realtime] ${table} subscription status: ${status}`);
          }
        });
    }

    void subscribeWhenReady();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [table]);
}
