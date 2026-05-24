import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export function useRealtimeRefresh(table: string, onChange: () => void) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const channel = supabase
      .channel(`admin-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        onChangeRef.current();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [table]);
}
