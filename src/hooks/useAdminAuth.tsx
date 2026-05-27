import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getCurrentAdminProfile, signOutAdmin } from "@/services/adminService";
import type { AdminUser } from "@/types/admin";

interface AdminAuthState {
  admin: AdminUser | null;
  loading: boolean;
  authorized: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAdminAuth(redirectUnauthorized = true): AdminAuthState {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) {
        setAdmin(null);
        if (redirectUnauthorized) {
          await navigate({ to: "/admin/login" });
        }
        return;
      }

      const profile = await getCurrentAdminProfile();
      setAdmin(profile);
      if (!profile && redirectUnauthorized) {
        await navigate({ to: "/" });
      }
    } catch (error) {
      console.error(error);
      setAdmin(null);
      if (redirectUnauthorized) {
        toast.error("Admin access could not be verified.");
        await navigate({ to: "/" });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, redirectUnauthorized]);

  useEffect(() => {
    void refresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });

    return () => subscription.unsubscribe();
  }, [refresh]);

  const logout = useCallback(async () => {
    await signOutAdmin();
    setAdmin(null);
    toast.success("Signed out securely.");
    await navigate({ to: "/admin/login" });
  }, [navigate]);

  return useMemo(
    () => ({ admin, loading, authorized: Boolean(admin), logout, refresh }),
    [admin, loading, logout, refresh],
  );
}
