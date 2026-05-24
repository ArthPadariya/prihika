import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isServerRuntime = typeof window === "undefined";
const hasNativeWebSocket = typeof globalThis.WebSocket !== "undefined";

class ServerSafeWebSocket {
  CONNECTING = 0;
  OPEN = 1;
  CLOSING = 2;
  CLOSED = 3;
  readyState = 3;
  url = "";
  protocol = "";
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  close() {}
  send() {}
  addEventListener() {}
  removeEventListener() {}
}

if (!hasNativeWebSocket) {
  Object.defineProperty(globalThis, "WebSocket", {
    configurable: true,
    writable: true,
    value: ServerSafeWebSocket,
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
    flowType: "pkce",
  },
  realtime: !hasNativeWebSocket
    ? {
        transport: ServerSafeWebSocket,
      }
    : undefined,
});

export function normalizeAuthEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getSupabaseConfigError() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return "Supabase environment variables are missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.";
  }

  if (supabaseUrl.includes("/rest/v1") || supabaseUrl.endsWith("/")) {
    return "VITE_SUPABASE_URL must be the project URL only, for example https://project-ref.supabase.co, with no /rest/v1 or trailing slash.";
  }

  return "";
}

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Could not reach Supabase. Verify VITE_SUPABASE_URL is the exact project URL and that the project is active.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const candidate = error as Record<string, unknown>;
    for (const key of ["message", "error_description", "msg", "details", "hint"]) {
      const value = candidate[key];
      if (typeof value === "string" && value.trim()) return value;
    }

    const code = candidate.code ?? candidate.error_code;
    if (code === "invalid_credentials") {
      return "Invalid email or password. Please use the exact new password you created.";
    }
  }

  return "Authentication request failed.";
}
