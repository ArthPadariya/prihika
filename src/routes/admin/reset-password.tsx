import type React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, EyeOff, Gem, Loader2, Lock, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getAuthErrorMessage, getSupabaseConfigError, supabase } from "@/lib/supabase";

const wait = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration));

export const Route = createFileRoute("/admin/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password - Prihika Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [tokenError, setTokenError] = useState("");

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    let mounted = true;

    const verifyRecoverySession = async () => {
      try {
        const configError = getSupabaseConfigError();
        if (configError) throw new Error(configError);

        if (typeof window !== "undefined") {
          const code = new URLSearchParams(window.location.search).get("code");
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const hashError = hashParams.get("error_description") ?? hashParams.get("error");
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (hashError) {
            throw new Error(hashError);
          }

          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
            window.history.replaceState({}, document.title, window.location.pathname);
          } else if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error) throw error;
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!mounted) return;
        if (data.session) {
          setValidSession(true);
          setTokenError("");
        } else {
          setValidSession(false);
          setTokenError(
            "This recovery link is invalid or has expired. Please request a new reset link.",
          );
        }
      } catch (error) {
        if (!mounted) return;
        setValidSession(false);
        setTokenError(getAuthErrorMessage(error));
      } finally {
        if (mounted) setCheckingToken(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setValidSession(true);
        setTokenError("");
        setCheckingToken(false);
      }
    });

    void verifyRecoverySession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const rules = useMemo(
    () => [
      { label: "At least 10 characters", pass: newPassword.length >= 10 },
      { label: "One uppercase letter", pass: /[A-Z]/.test(newPassword) },
      { label: "One lowercase letter", pass: /[a-z]/.test(newPassword) },
      { label: "One number", pass: /\d/.test(newPassword) },
      { label: "One special character", pass: /[^A-Za-z0-9]/.test(newPassword) },
    ],
    [newPassword],
  );

  const passwordStrong = rules.every((rule) => rule.pass);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validSession) {
      toast.error("Your recovery session is invalid or expired.");
      return;
    }
    if (!passwordStrong) {
      toast.error("Please choose a stronger password.");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const configError = getSupabaseConfigError();
      if (configError) throw new Error(configError);

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setComplete(true);
      toast.success("Password updated successfully.");
      await wait(1200);
      await supabase.auth.signOut({ scope: "local" });
      await navigate({ to: "/admin/login", replace: true });
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090706] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(215,180,106,.22),transparent_32%),radial-gradient(circle_at_82%_15%,rgba(255,255,255,.08),transparent_27%),linear-gradient(135deg,#090706,#17100c_52%,#090706)]" />
      <div className="relative mx-auto grid min-h-screen max-w-5xl place-items-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55 }}
          className="w-full max-w-xl rounded-lg border border-white/10 bg-white/[0.065] p-6 shadow-[0_35px_120px_rgba(0,0,0,.36)] backdrop-blur-2xl sm:p-8"
        >
          <div className="mb-8 flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-[#d7b46a] text-black">
              {complete ? (
                <Check className="h-6 w-6" />
              ) : tokenError ? (
                <ShieldAlert className="h-6 w-6" />
              ) : (
                <Gem className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#d7b46a]/80">
                <Sparkles className="h-3.5 w-3.5" />
                Password Recovery
              </div>
              <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">
                Create new password
              </h1>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {checkingToken ? (
              <motion.div
                key="checking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid place-items-center rounded-lg border border-white/10 bg-black/20 p-8 text-center"
              >
                <Loader2 className="h-7 w-7 animate-spin text-[#f4d58d]" />
                <p className="mt-4 text-sm text-[#f6ead0]/62">Verifying secure recovery link...</p>
              </motion.div>
            ) : tokenError ? (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-lg border border-red-300/20 bg-red-500/10 p-5"
              >
                <p className="text-sm leading-7 text-red-100/85">{tokenError}</p>
                <button
                  type="button"
                  onClick={() => void navigate({ to: "/admin/forgot-password" })}
                  className="mt-5 rounded-lg bg-[#d7b46a] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#f4d58d]"
                >
                  Request New Link
                </button>
              </motion.div>
            ) : complete ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-lg border border-[#d7b46a]/20 bg-[#d7b46a]/10 p-5"
              >
                <p className="text-sm leading-7 text-[#f6ead0]/75">
                  Your password has been updated. Redirecting you to admin login...
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={submit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <p className="mb-6 text-sm leading-7 text-[#f6ead0]/58">
                  Choose a strong password for your Prihika admin account.
                </p>
                <PasswordField
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                  visible={showNew}
                  onToggle={() => setShowNew((value) => !value)}
                />
                <div className="mt-4">
                  <PasswordField
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    visible={showConfirm}
                    onToggle={() => setShowConfirm((value) => !value)}
                  />
                </div>

                <div className="mt-5 grid gap-2 rounded-lg border border-white/10 bg-black/20 p-4">
                  {rules.map((rule) => (
                    <div
                      key={rule.label}
                      className={`flex items-center gap-2 text-xs ${rule.pass ? "text-emerald-200" : "text-[#f6ead0]/45"}`}
                    >
                      <span
                        className={`grid h-4 w-4 place-items-center rounded-full border ${rule.pass ? "border-emerald-300 bg-emerald-300 text-black" : "border-white/15"}`}
                      >
                        {rule.pass ? <Check className="h-3 w-3" /> : null}
                      </span>
                      {rule.label}
                    </div>
                  ))}
                  <div
                    className={`flex items-center gap-2 text-xs ${passwordsMatch ? "text-emerald-200" : "text-[#f6ead0]/45"}`}
                  >
                    <span
                      className={`grid h-4 w-4 place-items-center rounded-full border ${passwordsMatch ? "border-emerald-300 bg-emerald-300 text-black" : "border-white/15"}`}
                    >
                      {passwordsMatch ? <Check className="h-3 w-3" /> : null}
                    </span>
                    Passwords match
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !passwordStrong || !passwordsMatch}
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#d7b46a] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#f4d58d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {submitting ? "Updating password..." : "Update Password"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.22em] text-[#d7b46a]/80">{label}</span>
      <span className="mt-2 flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3 focus-within:border-[#d7b46a]/50">
        <Lock className="h-4 w-4 text-[#f6ead0]/40" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type={visible ? "text" : "password"}
          required
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#f6ead0]/30"
          placeholder="Enter password"
        />
        <button type="button" onClick={onToggle} className="text-[#f6ead0]/45 hover:text-white">
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
    </label>
  );
}
