import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import hero from "@/assets/collection-statement.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login or Register — PriHiKa" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div className="container mx-auto px-5 lg:px-10 py-12">
      <div className="grid lg:grid-cols-2 gap-12 items-stretch">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block relative rounded-3xl overflow-hidden"
        >
          <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-charcoal/0" />
          <div className="absolute bottom-10 left-10 right-10 text-ivory" style={{ color: "var(--ivory)" }}>
            <span className="text-xs tracking-[0.3em] uppercase opacity-80">Welcome to</span>
            <p className="font-display text-5xl mt-2">The PriHiKa world.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto"
        >
          <h1 className="font-display text-4xl mb-2">{tab === "login" ? "Sign in" : "Create account"}</h1>
          <p className="text-muted-foreground mb-8">
            {tab === "login" ? "Welcome back." : "Join the PriHiKa circle."}
          </p>

          <div className="flex bg-secondary rounded-full p-1 mb-8">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-full text-xs tracking-widest uppercase transition-colors ${tab === t ? "bg-background shadow-soft" : "text-muted-foreground"}`}
              >
                {t === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {tab === "register" && <Input label="Full name" />}
            <Input label="Email" type="email" />
            <Input label="Password" type="password" />
            {tab === "login" && (
              <Link to="/login" className="block text-right text-xs text-muted-foreground hover:text-rose-gold">Forgot password?</Link>
            )}
            <button
              type="submit"
              className="w-full py-4 rounded-full shine text-xs tracking-[0.25em] uppercase"
              style={{ background: "var(--gradient-rose)", color: "var(--ivory)" }}
            >
              {tab === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-8">
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Input({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">{label}</label>
      <input type={type} required className="w-full bg-secondary rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-rose-gold/40" />
    </div>
  );
}