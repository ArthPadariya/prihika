import type React from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Gem, Loader2, Mail, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAuthErrorMessage,
  getSupabaseConfigError,
  normalizeAuthEmail,
  supabase,
} from "@/lib/supabase";

export const Route = createFileRoute("/admin/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password - Prihika Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const configError = getSupabaseConfigError();
      if (configError) throw new Error(configError);

      // Supabase setup:
      // Authentication -> URL Configuration
      // Site URL: http://localhost:8080
      // Redirect URLs: http://localhost:8080/admin/reset-password
      // Redirect URLs: http://localhost:8080/**
      const redirectTo = `${window.location.origin}/admin/reset-password`;
      const recoveryEmail = normalizeAuthEmail(email);

      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, { redirectTo });
      if (error) throw error;

      setEmail(recoveryEmail);
      setSent(true);
      toast.success("Password reset link sent to your email.");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090706] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(215,180,106,.22),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(255,255,255,.08),transparent_27%),linear-gradient(135deg,#090706,#17100c_52%,#090706)]" />
      <div className="relative mx-auto grid min-h-screen max-w-5xl place-items-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55 }}
          className="w-full max-w-xl rounded-lg border border-white/10 bg-white/[0.065] p-6 shadow-[0_35px_120px_rgba(0,0,0,.36)] backdrop-blur-2xl sm:p-8"
        >
          <Link
            to="/admin/login"
            className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#f6ead0]/52 transition hover:text-[#f4d58d]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Login
          </Link>

          <div className="mb-8 flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-[#d7b46a] text-black">
              {sent ? <CheckCircle2 className="h-6 w-6" /> : <Gem className="h-6 w-6" />}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#d7b46a]/80">
                <Sparkles className="h-3.5 w-3.5" />
                Secure Recovery
              </div>
              <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">
                {sent ? "Check your inbox" : "Reset admin password"}
              </h1>
            </div>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-[#d7b46a]/20 bg-[#d7b46a]/10 p-5"
            >
              <p className="text-sm leading-7 text-[#f6ead0]/75">
                Password reset link sent to <span className="text-[#f4d58d]">{email}</span>. Open
                the link from your email to create a new secure password.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-5 rounded-lg border border-[#d7b46a]/30 px-4 py-2 text-sm text-[#f4d58d] transition hover:bg-[#d7b46a]/10"
              >
                Send another link
              </button>
            </motion.div>
          ) : (
            <form onSubmit={submit}>
              <p className="mb-6 text-sm leading-7 text-[#f6ead0]/58">
                Enter the email attached to your Prihika admin profile. Supabase will send a secure
                one-time recovery link.
              </p>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.22em] text-[#d7b46a]/80">
                  Admin Email
                </span>
                <span className="mt-2 flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3 focus-within:border-[#d7b46a]/50">
                  <Mail className="h-4 w-4 text-[#f6ead0]/40" />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    required
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#f6ead0]/30"
                    placeholder="admin@prihika.com"
                  />
                </span>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#d7b46a] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#f4d58d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Sending reset link..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
