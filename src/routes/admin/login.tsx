import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, EyeOff, Gem, Lock, Mail, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAuthErrorMessage,
  getSupabaseConfigError,
  normalizeAuthEmail,
  supabase,
} from "@/lib/supabase";
import { getAdminProfileForUser, getCurrentAdminProfile } from "@/services/adminService";

export const Route = createFileRoute("/admin/login")({
  beforeLoad: async () => {
    if (import.meta.env.SSR) return;
    const profile = await getCurrentAdminProfile().catch(() => null);
    if (profile) throw redirect({ to: "/admin/dashboard" });
  },
  head: () => ({
    meta: [{ title: "Prihika Admin Login" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

      const loginEmail = normalizeAuthEmail(email);
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });
      if (error) throw error;
      if (!data.user)
        throw new Error("Supabase did not return a user session. Please try signing in again.");

      const profile = await getAdminProfileForUser(data.user);
      if (!profile) {
        await supabase.auth.signOut({ scope: "local" });
        throw new Error("You are not authorized to access the Prihika admin panel.");
      }

      toast.success("Welcome back to Prihika CMS.");
      await navigate({ to: "/admin/dashboard" });
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090706] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(215,180,106,.22),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,.08),transparent_28%),linear-gradient(135deg,#090706,#17100c_50%,#090706)]" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 py-10 lg:grid-cols-[1.05fr_.95fr] lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d7b46a]/25 bg-[#d7b46a]/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-[#f4d58d]">
            <Sparkles className="h-3.5 w-3.5" />
            Prihika Control Atelier
          </div>
          <h1 className="mt-8 font-display text-5xl leading-tight text-white md:text-7xl">
            Luxury commerce,
            <span className="block text-[#f4d58d]">quietly controlled.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#f6ead0]/62">
            Manage products, reels, banners, orders, and admin access from a secure Supabase-backed
            CMS built for a premium jewellery brand.
          </p>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {["Secure Auth", "Live CMS", "Premium UI"].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-white/10 bg-white/[0.045] p-4 text-sm text-[#f6ead0]/70 backdrop-blur-xl"
              >
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="rounded-lg border border-white/10 bg-white/[0.065] p-6 shadow-[0_35px_120px_rgba(0,0,0,.35)] backdrop-blur-2xl sm:p-8"
        >
          <div className="mb-8 flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-[#d7b46a] text-black">
              <Gem className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-3xl">Admin Login</p>
              <p className="text-sm text-[#f6ead0]/55">Authorized team members only.</p>
            </div>
          </div>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.22em] text-[#d7b46a]/80">Email</span>
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

          <label className="mt-5 block">
            <span className="text-xs uppercase tracking-[0.22em] text-[#d7b46a]/80">Password</span>
            <span className="mt-2 flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3 focus-within:border-[#d7b46a]/50">
              <Lock className="h-4 w-4 text-[#f6ead0]/40" />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? "text" : "password"}
                required
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#f6ead0]/30"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="text-[#f6ead0]/45 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>

          <div className="mt-4 flex justify-end">
            <Link
              to="/admin/forgot-password"
              className="group text-xs uppercase tracking-[0.22em] text-[#f6ead0]/48 transition hover:text-[#f4d58d]"
            >
              Forgot Password?
              <span className="mt-1 block h-px w-0 bg-[#f4d58d] transition-all duration-300 group-hover:w-full" />
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-[#d7b46a] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#f4d58d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying access..." : "Enter Admin CMS"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
